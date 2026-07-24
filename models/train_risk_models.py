"""
Risk Model Training — MaternaAI
Trains 3 Random Forest classifiers on CDC PRAMS-structured data:
  1. PPD (Postpartum Depression) Risk
  2. Preterm Birth Risk
  3. Preeclampsia Risk

AI Method: Random Forest + SHAP explainability
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import joblib
from pathlib import Path
import json

MODELS_DIR = Path("models")
MODELS_DIR.mkdir(exist_ok=True)
DATASETS_DIR = Path("datasets")


FEATURE_SETS = {
    "ppd": {
        "features": [
            "age", "bmi_prepregnancy", "gestational_week", "trimester",
            "risk_depression_hx", "risk_smoking", "sdoh_low_income",
            "sdoh_unmarried", "sdoh_low_education",
            "symptom_nausea", "symptom_back_pain",
            "systolic_bp", "diastolic_bp", "weight_gain_lb"
        ],
        "target": "outcome_ppd",
        "label": "PPD Risk",
        "model": GradientBoostingClassifier(n_estimators=200, max_depth=4, learning_rate=0.05, random_state=42)
    },
    "preterm": {
        "features": [
            "age", "bmi_prepregnancy", "gestational_week",
            "risk_prev_preterm", "risk_gestational_diabetes",
            "risk_hypertension", "risk_smoking",
            "sdoh_low_income", "sdoh_low_education",
            "symptom_back_pain", "symptom_reduced_fetal_movement",
            "systolic_bp", "diastolic_bp", "weight_gain_lb"
        ],
        "target": "outcome_preterm",
        "label": "Preterm Birth Risk",
        "model": RandomForestClassifier(n_estimators=300, max_depth=6, random_state=42, class_weight="balanced")
    },
    "preeclampsia": {
        "features": [
            "age", "bmi_prepregnancy", "gestational_week", "trimester",
            "risk_hypertension", "risk_gestational_diabetes",
            "symptom_swelling", "symptom_headache", "symptom_blurry_vision",
            "systolic_bp", "diastolic_bp", "weight_gain_lb"
        ],
        "target": "outcome_preeclampsia",
        "label": "Preeclampsia Risk",
        "model": RandomForestClassifier(n_estimators=300, max_depth=5, random_state=42, class_weight="balanced")
    }
}


def train_all():
    print("=== MaternaAI Risk Model Training ===\n")

    csv_path = DATASETS_DIR / "cdc_prams_structured.csv"
    if not csv_path.exists():
        print("[ERROR] Dataset not found. Run: python agent/prepare_datasets.py first.")
        return

    df = pd.read_csv(csv_path)
    print(f"[OK] Loaded dataset: {len(df)} records, {len(df.columns)} columns\n")

    metrics = {}

    for model_key, config in FEATURE_SETS.items():
        print(f"--- Training: {config['label']} ---")

        X = df[config["features"]].fillna(df[config["features"]].median())
        y = df[config["target"]]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        model = config["model"]
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]
        auc = roc_auc_score(y_test, y_prob)
        cv_scores = cross_val_score(model, X, y, cv=5, scoring="roc_auc")

        print(classification_report(y_test, y_pred, target_names=["Low Risk", "High Risk"]))
        print(f"  ROC-AUC: {auc:.3f} | CV AUC: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}\n")

        # Feature importance
        if hasattr(model, "feature_importances_"):
            importances = sorted(
                zip(config["features"], model.feature_importances_),
                key=lambda x: x[1], reverse=True
            )
            print("  Top features:")
            for feat, imp in importances[:5]:
                print(f"    {feat}: {imp:.3f}")
            print()

        model_path = MODELS_DIR / f"{model_key}_model.joblib"
        joblib.dump(model, model_path)

        meta = {
            "model_key": model_key,
            "label": config["label"],
            "features": config["features"],
            "target": config["target"],
            "roc_auc": round(auc, 3),
            "cv_auc_mean": round(cv_scores.mean(), 3),
            "cv_auc_std": round(cv_scores.std(), 3),
            "n_train": len(X_train),
            "n_test": len(X_test)
        }
        meta_path = MODELS_DIR / f"{model_key}_meta.json"
        with open(meta_path, "w") as f:
            json.dump(meta, f, indent=2)

        metrics[model_key] = meta
        print(f"  [SAVED] {model_path}\n")

    summary_path = MODELS_DIR / "training_summary.json"
    with open(summary_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print("=== All models trained successfully ===")
    print(f"Models saved in: {MODELS_DIR}/")
    print("Next step: streamlit run app/streamlit_app.py")


if __name__ == "__main__":
    train_all()