from __future__ import annotations

import logging
import pickle
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List, Optional, Sequence, Tuple

# Must be module-level — fixes RecursionError during Spark serialization
sys.setrecursionlimit(50000)

from ..config import Settings
from ..models import (
    MentalHealthAnalytics,
    MentalHealthCommunityBreakdownItem,
    MentalHealthHistoryPoint,
    MentalHealthRequest,
    MentalHealthRiskDistributionItem,
    MentalHealthRiskPrediction,
    MentalHealthWordPattern,
    SimilarMentalHealthCase,
)

logger = logging.getLogger('sonarive.backend')

STOP_WORDS = {
    'the', 'and', 'that', 'have', 'with', 'this', 'from', 'your', 'what', 'when', 'where', 'been', 'feel', 'feeling',
    'about', 'because', 'would', 'could', 'there', 'their', 'them', 'they', 'just', 'into', 'than', 'then', 'very',
    'much', 'more', 'some', 'like', 'over', 'under', 'only', 'also', 'after', 'before', 'while', 'still', 'really',
}
RISK_ORDER = {'High': 0, 'Medium': 1, 'Low': 2, 'Unknown': 3}

# ── 8 GB RAM budget ──────────────────────────────────────────────────────────
# Windows OS         ~2.0 GB
# JVM (Spark driver) ~1.5 GB
# Python / FastAPI   ~0.3 GB
# Background apps    ~0.5 GB
# ─────────────────────────────
# Available for data ~3.5 GB
#
# 10% sample keeps the in-memory footprint manageable and query latency
# acceptable (~2–5 s on warm cache, ~15–30 s on first cold load).
DATASET_SAMPLE_FRACTION = 0.1
DATASET_SAMPLE_SEED = 42


class MindSignalServiceError(RuntimeError):
    pass


class MindSignalService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._spark = None
        self._posts_df = None
        self._model = None
        self._dataset_size: Optional[int] = None
        self._columns: Optional[Dict[str, Optional[str]]] = None
        self._lock = Lock()
        self._cache_warm: bool = False  # tracks whether persist().count() has run

    # ─────────────────────────────────────────────────────────────────────────
    # Public API
    # ─────────────────────────────────────────────────────────────────────────

    def warmup(self) -> List[str]:
        """
        Call this once at application startup (e.g. in a FastAPI lifespan event).
        Eagerly populates the Spark cache so the first real user request is fast.
        """
        warnings: List[str] = []
        try:
            _, posts_df, _ = self._get_posts_context()
            if not self._cache_warm:
                logger.info('MindSignal: warming up Spark cache …')
                posts_df.count()  # triggers MEMORY_AND_DISK persist
                self._cache_warm = True
                logger.info('MindSignal: cache warm — ready.')
        except Exception as exc:
            warnings.append(f'Spark warmup failed: {exc}')
        return warnings

    def predict_risk(self, payload: MentalHealthRequest) -> Tuple[MentalHealthRiskPrediction, List[str]]:
        warnings: List[str] = []
        try:
            prediction = self._predict_with_model(payload)
            return prediction, warnings
        except Exception as exc:
            warnings.append(
                f'MindSignal model prediction unavailable: {exc}. '
                'Using questionnaire heuristics instead.'
            )
            return self._heuristic_prediction(payload), warnings

    def find_similar_cases(
        self,
        text: str,
        risk_level: str,
        limit: Optional[int] = None,
    ) -> Tuple[List[SimilarMentalHealthCase], List[str]]:
        warnings: List[str] = []
        try:
            _, posts_df, F = self._get_posts_context()
            columns = self._columns or {}
            text_col = columns.get('text')
            if not text_col:
                raise MindSignalServiceError('Predictions dataset has no usable text column.')

            risk_col     = columns.get('risk')
            subreddit_col = columns.get('subreddit')
            word_col     = columns.get('word_count')

            terms = self._extract_terms(text)
            if not terms:
                return [], warnings

            result_df = posts_df
            if risk_col and risk_level and risk_level != 'Unknown':
                result_df = result_df.filter(
                    F.lower(F.col(risk_col).cast('string')) == risk_level.lower()
                )

            normalized_text = F.regexp_replace(
                F.lower(F.coalesce(F.col(text_col).cast('string'), F.lit(''))),
                r'[^a-z0-9\s]',
                ' ',
            )
            query_terms   = F.array(*[F.lit(t) for t in terms])
            token_array   = F.array_distinct(F.split(normalized_text, r'\s+'))
            derived_wc    = (
                F.col(word_col).cast('int')
                if word_col
                else F.size(F.split(F.trim(normalized_text), r'\s+'))
            )

            rows = (
                result_df
                .withColumn('_overlap', F.size(F.array_intersect(token_array, query_terms)))
                .withColumn('_derived_word_count', derived_wc)
                .filter(F.col('_overlap') > 0)
                .filter(F.col('_derived_word_count').between(10, 200))
                .orderBy(F.desc('_overlap'), F.desc('_derived_word_count'))
                .limit(limit or self.settings.similar_cases_limit)
                .select(
                    F.col(text_col).alias('text_value'),
                    (
                        F.col(risk_col).cast('string')
                        if risk_col
                        else F.lit(risk_level or 'Unknown')
                    ).alias('risk_value'),
                    F.col('_overlap').alias('overlap_score'),
                    F.col('_derived_word_count').alias('word_count'),
                    (
                        F.col(subreddit_col).cast('string')
                        if subreddit_col
                        else F.lit(None)
                    ).alias('subreddit_value'),
                )
                .collect()
            )

            similar_cases = [
                SimilarMentalHealthCase(
                    excerpt=self._truncate(str(row['text_value'] or ''), 220),
                    riskLevel=self._normalize_risk_label(row['risk_value']),
                    overlapScore=int(row['overlap_score'] or 0),
                    subreddit=row['subreddit_value'],
                    wordCount=int(row['word_count'] or 0),
                )
                for row in rows
            ]
            return similar_cases, warnings

        except Exception as exc:
            warnings.append(f'Similar-case retrieval unavailable: {exc}')
            return [], warnings

    def get_community_analytics(
        self,
        risk_level: str,
    ) -> Tuple[Optional[MentalHealthAnalytics], List[str]]:
        warnings: List[str] = []
        try:
            _, posts_df, F = self._get_posts_context()
            columns  = self._columns or {}
            risk_col = columns.get('risk')
            text_col = columns.get('text')
            if not text_col:
                raise MindSignalServiceError('Predictions dataset has no usable text column.')

            # ── Use estimated full-dataset size for percentages ───────────────
            dataset_size = self._dataset_size or posts_df.count()
            self._dataset_size = dataset_size

            word_expr = self._word_count_expr(F, text_col, columns.get('word_count'))
            char_expr = self._char_count_expr(F, text_col, columns.get('char_count'))

            # ── Risk distribution ─────────────────────────────────────────────
            if risk_col:
                distribution_rows = (
                    posts_df
                    .groupBy(F.col(risk_col).cast('string').alias('predicted_risk'))
                    .count()
                    .collect()
                )
            else:
                distribution_rows = []

            distribution = [
                MentalHealthRiskDistributionItem(
                    predicted_risk=self._normalize_risk_label(row['predicted_risk']),
                    count=int(row['count'] or 0),
                    percentage=round(
                        ((int(row['count'] or 0) / dataset_size) * 100) if dataset_size else 0,
                        1,
                    ),
                )
                for row in distribution_rows
            ]
            if not distribution:
                distribution = [
                    MentalHealthRiskDistributionItem(
                        predicted_risk='Unknown', count=dataset_size, percentage=100.0
                    )
                ]
            distribution.sort(key=lambda item: RISK_ORDER.get(item.predicted_risk, 99))

            # ── Word / char patterns per risk group ───────────────────────────
            if risk_col:
                word_rows = (
                    posts_df
                    .groupBy(F.col(risk_col).cast('string').alias('predicted_risk'))
                    .agg(
                        F.round(F.avg(word_expr), 0).alias('avg_words'),
                        F.round(F.avg(char_expr), 0).alias('avg_chars'),
                    )
                    .collect()
                )
            else:
                word_rows = []

            word_patterns = [
                MentalHealthWordPattern(
                    predicted_risk=self._normalize_risk_label(row['predicted_risk']),
                    avg_words=float(row['avg_words'] or 0),
                    avg_chars=float(row['avg_chars'] or 0),
                )
                for row in word_rows
            ]
            word_patterns.sort(key=lambda item: RISK_ORDER.get(item.predicted_risk, 99))

            # ── Community breakdown (top 5 subreddits for this risk level) ────
            community_breakdown: List[MentalHealthCommunityBreakdownItem] = []
            subreddit_col = columns.get('subreddit')
            if subreddit_col and risk_level and risk_level != 'Unknown':
                filter_expr = (
                    (F.lower(F.col(risk_col).cast('string')) == risk_level.lower())
                    if risk_col
                    else F.lit(True)
                )
                community_rows = (
                    posts_df
                    .filter(filter_expr)
                    .groupBy(F.col(subreddit_col).cast('string').alias('subreddit_label'))
                    .count()
                    .orderBy(F.desc('count'))
                    .limit(5)
                    .collect()
                )
                community_breakdown = [
                    MentalHealthCommunityBreakdownItem(
                        subreddit_label=str(row['subreddit_label'] or 'unknown'),
                        post_count=int(row['count'] or 0),
                    )
                    for row in community_rows
                ]

            return (
                MentalHealthAnalytics(
                    distribution=distribution,
                    wordPatterns=word_patterns,
                    communityBreakdown=community_breakdown,
                    totalDatasetSize=int(dataset_size),
                ),
                warnings,
            )

        except Exception as exc:
            warnings.append(f'Community analytics unavailable: {exc}')
            return None, warnings

    def build_population_context(
        self,
        risk_level: str,
        phq9_score: int,
    ) -> Tuple[Optional[str], List[str]]:
        warnings: List[str] = []
        try:
            _, posts_df, F = self._get_posts_context()
            columns  = self._columns or {}
            risk_col = columns.get('risk')
            text_col = columns.get('text')
            if not text_col:
                raise MindSignalServiceError('Predictions dataset has no usable text column.')

            word_expr  = self._word_count_expr(F, text_col, columns.get('word_count'))
            char_expr  = self._char_count_expr(F, text_col, columns.get('char_count'))
            scoped_df  = posts_df
            if risk_col and risk_level and risk_level != 'Unknown':
                scoped_df = scoped_df.filter(
                    F.lower(F.col(risk_col).cast('string')) == risk_level.lower()
                )

            result = scoped_df.agg(
                F.round(F.avg(word_expr), 0).alias('avg_word_count'),
                F.count(F.lit(1)).alias('total_similar'),
                F.round(F.avg(char_expr), 0).alias('avg_length'),
            ).first()

            if result is None:
                return None, warnings

            avg_word_count = int(result['avg_word_count'] or 0)
            total_similar  = int(result['total_similar']  or 0)
            avg_length     = int(result['avg_length']     or 0)
            urgency        = 'immediate' if risk_level == 'High' else 'standard'

            context = (
                '## Population Context (from Spark analysis of the MindSignal dataset)\n'
                f'- Total similar cases in dataset: {total_similar:,}\n'
                f'- Average post length in this risk group: {avg_word_count} words\n'
                f'- Average post size in this risk group: {avg_length} characters\n'
                f"- This patient's PHQ-9 score of {phq9_score} combined with "
                f'{risk_level} risk classification warrants {urgency} attention.'
            )
            return context, warnings

        except Exception as exc:
            warnings.append(f'Population context unavailable: {exc}')
            return None, warnings

    def log_submission(
        self,
        payload: MentalHealthRequest,
        prediction: MentalHealthRiskPrediction,
    ) -> List[str]:
        warnings: List[str] = []
        if not payload.clientId:
            return warnings
        try:
            import pyarrow as pa
            import pyarrow.parquet as pq

            submissions_path = Path(self.settings.mindsignal_submissions_path)
            submissions_path.mkdir(parents=True, exist_ok=True)

            submission_record = {
                'timestamp':       [datetime.now(timezone.utc).isoformat()],
                'client_id':       [str(payload.clientId)],
                'age':             [int(payload.age)],
                'gender':          [str(payload.gender)],
                'phq9_score':      [int(payload.ph9Score)],
                'gad7_score':      [int(payload.gad7Score)],
                'predicted_risk':  [str(prediction.label)],
                'risk_confidence': [float(prediction.confidence) if prediction.confidence is not None else 0.0],
                'word_count':      [int(len(self._extract_terms(payload.textInput, keep_stop_words=True)))],
                'char_count':      [int(len(payload.textInput or ''))],
            }

            table        = pa.table(submission_record)
            ts_str       = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S_%f')
            output_file  = submissions_path / f'submission_{ts_str}_{payload.clientId}.parquet'
            pq.write_table(table, str(output_file))

            logger.info('Submission logged for client %s → %s', payload.clientId, output_file.name)
            return warnings

        except Exception as exc:
            logger.error('log_submission failed: %s', exc)
            warnings.append(f'Unable to record submission history: {exc}')
            return warnings

    def get_history(
        self,
        client_id: Optional[str],
        limit: Optional[int] = None,
    ) -> Tuple[List[MentalHealthHistoryPoint], List[str]]:
        warnings: List[str] = []
        if not client_id:
            return [], warnings

        submissions_path = Path(self.settings.mindsignal_submissions_path)
        if not submissions_path.exists():
            return [], warnings

        # Guard against UNABLE_TO_INFER_SCHEMA on an empty folder
        parquet_files = list(submissions_path.rglob('*.parquet'))
        if not parquet_files:
            return [], warnings

        try:
            spark, _ = self._ensure_spark()
            from pyspark.sql import functions as F

            rows = (
                spark.read.parquet(str(submissions_path))
                .filter(F.col('client_id') == client_id)
                .orderBy(F.desc('timestamp'))
                .limit(limit or self.settings.mental_health_history_limit)
                .collect()
            )
            history = [
                MentalHealthHistoryPoint(
                    timestamp=str(row['timestamp']),
                    predictedRisk=self._normalize_risk_label(row['predicted_risk']),
                    phq9Score=int(row['phq9_score'] or 0),
                    gad7Score=int(row['gad7_score'] or 0),
                    wordCount=int(row['word_count'] or 0),
                )
                for row in reversed(rows)
            ]
            return history, warnings

        except Exception as exc:
            warnings.append(f'History query unavailable: {exc}')
            return [], warnings

    # ─────────────────────────────────────────────────────────────────────────
    # Internal — model
    # ─────────────────────────────────────────────────────────────────────────

    def _predict_with_model(self, payload: MentalHealthRequest) -> MentalHealthRiskPrediction:
        model = self._ensure_model()
        text  = (payload.textInput or '').strip()
        feature_row = {
            'text_clean':  text,
            'text':        text,
            'content':     text,
            'age':         payload.age,
            'gender':      payload.gender,
            'phq9_score':  payload.ph9Score,
            'ph9Score':    payload.ph9Score,
            'gad7_score':  payload.gad7Score,
            'gad7Score':   payload.gad7Score,
            'word_count':  len(self._extract_terms(text, keep_stop_words=True)),
            'char_count':  len(text),
        }

        attempts: List[str] = []
        prediction_inputs: List[Tuple[str, Any]] = []

        try:
            import pandas as pd
            prediction_inputs.append(('pandas-dataframe', pd.DataFrame([feature_row])))
            prediction_inputs.append(('pandas-series', pd.Series([text])))
        except ModuleNotFoundError:
            attempts.append('pandas unavailable')

        prediction_inputs.extend([
            ('raw-text-list',     [text]),
            ('feature-dict-list', [feature_row]),
        ])

        for input_name, input_value in prediction_inputs:
            try:
                raw_prediction = model.predict(input_value)[0]
                confidence = None
                if hasattr(model, 'predict_proba'):
                    try:
                        probabilities = model.predict_proba(input_value)
                        if probabilities is not None and len(probabilities) > 0:
                            confidence = float(max(probabilities[0]))
                    except Exception:
                        confidence = None
                label = self._normalize_risk_label(raw_prediction)
                return MentalHealthRiskPrediction(
                    label=label,
                    confidence=confidence,
                    source=f'mindsignal_model:{input_name}',
                    reasoning='Model-based risk classification using the local MindSignal pipeline.',
                )
            except Exception as exc:
                attempts.append(f'{input_name} → {type(exc).__name__}')

        raise MindSignalServiceError(
            'Unable to execute MindSignal model prediction with the available input shapes. '
            + '; '.join(attempts)
        )

    def _heuristic_prediction(self, payload: MentalHealthRequest) -> MentalHealthRiskPrediction:
        text = (payload.textInput or '').lower()
        high_markers   = ['suicide', 'kill myself', 'self harm', 'self-harm', 'end my life', 'die', 'not safe']
        medium_markers = ['panic', 'hopeless', 'worthless', 'empty', "can't cope", 'cant cope']

        if any(m in text for m in high_markers) or payload.ph9Score >= 20 or payload.gad7Score >= 15:
            return MentalHealthRiskPrediction(
                label='High', confidence=0.78, source='heuristic_fallback',
                reasoning='High-risk language or elevated PHQ-9/GAD-7 scores triggered the fallback risk rule.',
            )
        if any(m in text for m in medium_markers) or payload.ph9Score >= 10 or payload.gad7Score >= 10:
            return MentalHealthRiskPrediction(
                label='Medium', confidence=0.64, source='heuristic_fallback',
                reasoning='Moderate symptom burden or distress language triggered the fallback risk rule.',
            )
        return MentalHealthRiskPrediction(
            label='Low', confidence=0.56, source='heuristic_fallback',
            reasoning='No high-risk markers detected and screening scores stayed below moderate thresholds.',
        )

    def _ensure_model(self):
        if self._model is not None:
            return self._model
        with self._lock:
            if self._model is not None:
                return self._model
            model_path = Path(self.settings.mindsignal_model_path)
            if not model_path.exists():
                raise MindSignalServiceError(f'MindSignal model file not found at {model_path}.')
            try:
                with model_path.open('rb') as f:
                    self._model = pickle.load(f)
            except ModuleNotFoundError as exc:
                raise MindSignalServiceError(
                    'Model dependency missing while loading mindsignal_model.pkl.'
                ) from exc
            except Exception as exc:
                raise MindSignalServiceError(f'Unable to load MindSignal model: {exc}') from exc
        return self._model

    # ─────────────────────────────────────────────────────────────────────────
    # Internal — Spark lifecycle
    # ─────────────────────────────────────────────────────────────────────────

    def _ensure_spark(self):
        # ── Detect a dead JVM and reset cleanly ──────────────────────────────
        if self._spark is not None:
            try:
                self._spark.sparkContext.statusTracker()
            except Exception:
                logger.warning('Spark JVM appears dead — resetting and reconnecting.')
                self._spark       = None
                self._posts_df    = None
                self._columns     = None
                self._dataset_size = None
                self._cache_warm  = False

        if self._spark is not None and self._posts_df is not None and self._columns is not None:
            return self._spark, self._posts_df

        with self._lock:
            if self._spark is not None and self._posts_df is not None and self._columns is not None:
                return self._spark, self._posts_df

            predictions_path = Path(self.settings.mindsignal_predictions_path)
            if not predictions_path.exists():
                raise MindSignalServiceError(
                    f'MindSignal predictions dataset not found at {predictions_path}.'
                )

            try:
                from pyspark.sql import SparkSession
                from pyspark import StorageLevel
            except ModuleNotFoundError as exc:
                raise MindSignalServiceError('PySpark is not installed.') from exc

            # ── 8 GB–safe Spark config ────────────────────────────────────────
            # local[2]  → 2 threads; avoids memory spikes that local[*] can cause
            # driver 2g → give driver more headroom than the old 1g
            # executor  → in local mode this is the same process; keep small
            # MEMORY_AND_DISK persist → spills to disk gracefully if RAM is tight
            # shuffle partitions = 2 → minimise shuffle overhead on a single node
            builder = (
                SparkSession.builder
                .appName(self.settings.spark_app_name)
                .master('local[2]')                                             # ← was local[1]
                .config('spark.sql.shuffle.partitions',               '2')
                .config('spark.sql.execution.arrow.pyspark.enabled',  'false')
                .config('spark.driver.memory',                        '2g')     # ← was 1g
                .config('spark.executor.memory',                      '512m')   # ← was 1g
                .config('spark.driver.extraJavaOptions',
                        '-Xss8m -Dhadoop.home.dir=D:/hadoop')
                .config('spark.executor.extraJavaOptions',            '-Xss8m')
                .config('spark.python.worker.reuse',                  'false')
                .config('spark.sql.files.maxPartitionBytes',          '16m')
                .config('spark.memory.fraction',                      '0.6')    # ← was 0.5
                .config('spark.memory.storageFraction',               '0.4')    # ← was 0.2
                .config('spark.ui.enabled',                           'false')
                .config('spark.sql.parquet.mergeSchema',              'false')
            )
            spark = builder.getOrCreate()
            spark.sparkContext.setLogLevel('ERROR')

            # ── Read parquet with partition discovery ─────────────────────────
            raw_df = (
                spark.read
                .option('basePath', str(predictions_path))
                .parquet(str(predictions_path))
            )

            # ── Sample 10% + coalesce to 2 partitions ────────────────────────
            # coalesce(2) reduces partition-management overhead on a single node.
            # MEMORY_AND_DISK means Spark spills excess blocks to disk instead of
            # silently recomputing them (which caused the old timeouts).
            posts_df = (
                raw_df
                .sample(fraction=DATASET_SAMPLE_FRACTION, seed=DATASET_SAMPLE_SEED)
                .coalesce(2)                                                    # ← was 4
            )
            posts_df.persist(StorageLevel.MEMORY_AND_DISK)                      # ← was implicit MEMORY_ONLY

            self._spark    = spark
            self._posts_df = posts_df
            self._columns  = self._resolve_columns(raw_df.columns)

            # ── Estimate full-dataset size from the sample ────────────────────
            if self._dataset_size is None:
                sampled_count = posts_df.count()                                # populates cache
                self._cache_warm   = True
                self._dataset_size = int(sampled_count / DATASET_SAMPLE_FRACTION)
                logger.info(
                    'MindSignal dataset ready. Sampled %s rows (est. full size: %s). Columns: %s',
                    sampled_count,
                    self._dataset_size,
                    self._columns,
                )

        return self._spark, self._posts_df

    def _get_posts_context(self):
        spark, posts_df = self._ensure_spark()
        from pyspark.sql import functions as F
        return spark, posts_df, F

    # ─────────────────────────────────────────────────────────────────────────
    # Internal — schema helpers
    # ─────────────────────────────────────────────────────────────────────────

    def _resolve_columns(self, columns: Sequence[str]) -> Dict[str, Optional[str]]:
        return {
            'text':       self._find_column(columns, ['text_clean', 'clean_text', 'text', 'post_text', 'content'], required=True),
            'risk':       self._find_column(columns, ['predicted_risk', 'risk_level', 'risk', 'predicted_label']),
            'word_count': self._find_column(columns, ['word_count', 'num_words']),
            'char_count': self._find_column(columns, ['char_count', 'character_count', 'num_chars']),
            'subreddit':  self._find_column(columns, ['subreddit_label', 'subreddit', 'community']),
        }

    def _find_column(
        self,
        columns: Sequence[str],
        candidates: Sequence[str],
        required: bool = False,
    ) -> Optional[str]:
        lower_map = {col.lower(): col for col in columns}
        for candidate in candidates:
            if candidate.lower() in lower_map:
                return lower_map[candidate.lower()]
        if required:
            raise MindSignalServiceError(
                f'Required dataset column missing. Expected one of: {", ".join(candidates)}'
            )
        return None

    # ─────────────────────────────────────────────────────────────────────────
    # Internal — text / expression helpers
    # ─────────────────────────────────────────────────────────────────────────

    def _extract_terms(self, text: str, keep_stop_words: bool = False) -> List[str]:
        seen:  set  = set()
        terms: List[str] = []
        for term in re.findall(r'[a-z0-9]+', (text or '').lower()):
            if len(term) < 3:
                continue
            if not keep_stop_words and term in STOP_WORDS:
                continue
            if term in seen:
                continue
            seen.add(term)
            terms.append(term)
            if len(terms) >= 20 and not keep_stop_words:
                break
        return terms

    def _normalize_risk_label(self, raw_value: Any) -> str:
        text = str(raw_value or '').strip().lower()
        if not text:
            return 'Unknown'
        if any(t in text for t in ['high', 'severe', 'crisis', 'suicide']):
            return 'High'
        if any(t in text for t in ['medium', 'moderate']):
            return 'Medium'
        if any(t in text for t in ['low', 'mild', 'minimal']):
            return 'Low'
        try:
            numeric_value = float(text)
        except ValueError:
            return 'Unknown'
        if numeric_value >= 2:
            return 'High'
        if numeric_value >= 1:
            return 'Medium'
        return 'Low'

    def _word_count_expr(self, F, text_col: str, word_col: Optional[str]):
        if word_col:
            return F.col(word_col).cast('double')
        cleaned = F.regexp_replace(
            F.lower(F.coalesce(F.col(text_col).cast('string'), F.lit(''))),
            r'[^a-z0-9\s]',
            ' ',
        )
        return F.size(F.split(F.trim(cleaned), r'\s+')).cast('double')

    def _char_count_expr(self, F, text_col: str, char_col: Optional[str]):
        if char_col:
            return F.col(char_col).cast('double')
        return F.length(F.coalesce(F.col(text_col).cast('string'), F.lit(''))).cast('double')

    def _truncate(self, text: str, max_chars: int) -> str:
        compact = ' '.join(text.split())
        if len(compact) <= max_chars:
            return compact
        return compact[: max_chars - 3].rstrip() + '...'