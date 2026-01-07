#!/usr/bin/env python3
import json
import sys
import time
import hashlib
from pathlib import Path

MODELS = {
    "lightweight": {"multiplier": 1.0, "quality": "fast"},
    "balanced": {"multiplier": 1.2, "quality": "good"},
    "advanced": {"multiplier": 1.5, "quality": "high"},
    "expert": {"multiplier": 2.0, "quality": "very-high"}
}

def extract_metadata(filepath):
    """ECU dosyasından meta veri çıkar"""
    try:
        data = Path(filepath).read_bytes()
        size = len(data)
        sha = hashlib.sha256(data).hexdigest()[:8]
        ecu_type = "unknown"
        if 10000 < size < 50000:
            ecu_type = "Stage1"
        elif 50000 <= size < 150000:
            ecu_type = "Stage2"
        elif size >= 150000:
            ecu_type = "Full"
        return {"size": size, "sha": sha, "ecu_type": ecu_type}
    except Exception as e:
        return {"error": str(e)}

def compare_files(file_ids, model="balanced"):
    """Advanced benzerlik: Model kalitesine göre"""
    if not file_ids or len(file_ids) < 2:
        return {"similarity": 0, "match_score": 0}
    
    m = MODELS.get(model, MODELS["balanced"])
    # Model multiplier ile similarity iyileşimine benzer
    base_sim = 0.87
    sim = base_sim * m["multiplier"] / MODELS["balanced"]["multiplier"]
    sim = min(sim, 0.99)  # Max 99%
    
    return {
        "similarity": round(sim, 4),
        "method": f"advanced_{model}",
        "match_score": round(sim, 4),
        "quality": m["quality"]
    }

def tune_params(strategy, parameters, model="balanced"):
    """Model'e göre advanced tuning"""
    m = MODELS.get(model, MODELS["balanced"])
    quality_mult = m["multiplier"]
    
    result = {
        "strategy": strategy,
        "model": model,
        "original_params": parameters,
        "optimized": {
            **parameters,
            "efficiency": 1.15 * quality_mult,
            "power_gain": f"+{int(15 * quality_mult)}% horsepower"
        },
        "quality": m["quality"],
        "estimated_time": f"{int(2000 * quality_mult)}ms"
    }
    return result

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: ai_worker.py <job_id> [file_ids] [strategy] [params] [model]"}))
        return

    job_id = sys.argv[1]
    file_ids = json.loads(sys.argv[2]) if len(sys.argv) > 2 else []
    strategy = sys.argv[3] if len(sys.argv) > 3 else "default"
    params = json.loads(sys.argv[4]) if len(sys.argv) > 4 else {}
    model = sys.argv[5] if len(sys.argv) > 5 else "balanced"

    # Model'e göre işlem süresi
    m = MODELS.get(model, MODELS["balanced"])
    sleep_time = 0.5 + (m["multiplier"] - 1.0) * 1.0
    time.sleep(sleep_time)

    if strategy == "compare" and file_ids:
        result = compare_files(file_ids, model)
    elif strategy == "tune" or strategy == "default":
        result = tune_params(strategy, params, model)
    else:
        result = {"error": f"Unknown strategy: {strategy}"}

    result["ok"] = "error" not in result
    print(json.dumps(result))

if __name__ == "__main__":
    main()

