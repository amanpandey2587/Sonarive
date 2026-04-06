export interface MentalHealthRiskPrediction {
  label: 'Low' | 'Medium' | 'High' | 'Unknown' | string;
  confidence?: number | null;
  source: string;
  reasoning?: string | null;
}

export interface SimilarMentalHealthCase {
  excerpt: string;
  riskLevel: string;
  overlapScore: number;
  subreddit?: string | null;
  wordCount?: number | null;
}

export interface MentalHealthRiskDistributionItem {
  predicted_risk: string;
  count: number;
  percentage: number;
}

export interface MentalHealthWordPattern {
  predicted_risk: string;
  avg_words: number;
  avg_chars: number;
}

export interface MentalHealthCommunityBreakdownItem {
  subreddit_label: string;
  post_count: number;
}

export interface MentalHealthAnalytics {
  distribution: MentalHealthRiskDistributionItem[];
  wordPatterns: MentalHealthWordPattern[];
  communityBreakdown: MentalHealthCommunityBreakdownItem[];
  totalDatasetSize: number;
}

export interface MentalHealthHistoryPoint {
  timestamp: string;
  predictedRisk: string;
  phq9Score: number;
  gad7Score: number;
  wordCount: number;
}

export interface MentalHealthResponsePayload {
  interventionPlan: string;
  riskPrediction: MentalHealthRiskPrediction;
  similarCases: SimilarMentalHealthCase[];
  analytics?: MentalHealthAnalytics | null;
  history: MentalHealthHistoryPoint[];
  populationContext?: string | null;
  warnings: string[];
}
