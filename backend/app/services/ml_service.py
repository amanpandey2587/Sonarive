# backend/app/services/ml_service.py
import pickle, json, os
import numpy as np
from datetime import datetime

BASE = os.path.join(os.path.dirname(__file__), "..", "ml")

class SymptomModelService:
    def __init__(self):
        with open(f"{BASE}/symptom_model_production.pkl", "rb") as f:
            self.model = pickle.load(f)
        with open(f"{BASE}/symptoms_list.json") as f:
            self.symptoms = json.load(f)
        with open(f"{BASE}/label_encoder.pkl", "rb") as f:
            self.encoder = pickle.load(f)
        with open(f"{BASE}/model_metadata.json") as f:
            self.metadata = json.load(f)

        print(f"✅ Loaded model: {self.metadata['production_version']} "
              f"(accuracy: {self.metadata['accuracy']:.4f})")

    def predict(self, symptoms_text: str) -> dict:
        words = symptoms_text.lower().split()
        binary = [1 if s.lower() in words else 0 for s in self.symptoms]
        X = np.array([binary])
        proba = self.model.predict_proba(X)[0]
        top3 = proba.argsort()[-3:][::-1]

        result = {
            "model_version":  self.metadata["production_version"],
            "top_prediction": self.encoder.classes_[top3[0]],
            "confidence":     round(float(proba[top3[0]]) * 100, 1),
            "top3": [
                {"disease":    self.encoder.classes_[i],
                 "confidence": round(float(proba[i]) * 100, 1)}
                for i in top3
            ]
        }

        self._log(symptoms_text, result)
        return result

    def _log(self, symptoms: str, result: dict):
        os.makedirs("logs", exist_ok=True)
        entry = {
            "timestamp":      datetime.now().isoformat(),
            "input":          symptoms,
            "prediction":     result["top_prediction"],
            "confidence":     result["confidence"],
            "model_version":  result["model_version"]
        }
        with open("logs/predictions.jsonl", "a") as f:
            f.write(json.dumps(entry) + "\n")

# Singleton — loads once when backend starts
symptom_service = SymptomModelService()