# backend/scripts/check_model_gate.py
import json, sys

with open("backend/app/ml/model_metadata.json") as f:
    meta = json.load(f)

GATE = 0.80

print(f"Version   : {meta['production_version']}")
print(f"Accuracy  : {meta['accuracy']:.4f}")
print(f"F1        : {meta['f1']:.4f}")
print(f"Gate      : {GATE}")

if meta["accuracy"] < GATE:
    print("❌ GATE FAILED — blocking CI/CD")
    sys.exit(1)

print("✅ GATE PASSED — proceeding to deploy")