"""
MaternaAI Core Agent
Uses Gemini 3.1 Pro + RAG over clinical knowledge base for symptom guidance.

AI Methods:
  - RAG: sentence-transformers embeddings + cosine similarity retrieval
  - LLM: Gemini 3.1 Pro for trimester-aware, empathetic responses
  - ML Risk Scores: injected as context into the LLM prompt
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai
from sentence_transformers import SentenceTransformer

load_dotenv()

GEMINI_MODEL = "gemini-3.1-pro-preview"
DATA_DIR = Path("data")
MODELS_DIR = Path("models")

URGENCY_COLORS = {
    "urgent": "#E24B4A",
    "watch": "#EF9F27",
    "normal": "#639922",
    "info": "#378ADD"
}

SYSTEM_PROMPT = """You are MaternaAI, a compassionate and clinically-informed pregnancy symptom guide.

Your role:
- Help pregnant women understand their symptoms in the context of their gestational week
- Give clear, warm, actionable guidance grounded in ACOG clinical guidelines
- Always triage urgency: URGENT (seek care now) / WATCH (monitor, call if worsens) / NORMAL (expected in pregnancy)
- Never diagnose — always recommend consulting their OB/midwife for clinical decisions
- Be empathetic. Pregnancy is emotional. Acknowledge their concern before guiding them.

Response format (always use this structure):
1. EMPATHY: One sentence acknowledging their concern
2. URGENCY: [URGENT / WATCH / NORMAL] + one-line reason
3. EXPLANATION: What is likely happening clinically (2-3 sentences)
4. WHAT TO DO: 3-5 specific, actionable steps
5. RED FLAGS: When to seek immediate care
6. WEEK CONTEXT: One sentence specific to their gestational week

Keep responses concise but warm. Avoid medical jargon without explanation.
"""


class RAGRetriever:
    """Simple RAG using sentence-transformers + cosine similarity"""

    def __init__(self, kb_path=DATA_DIR / "symptom_knowledge_base.json"):
        self.encoder = SentenceTransformer("all-MiniLM-L6-v2")
        self.kb = []
        self.embeddings = None

        if kb_path.exists():
            with open(kb_path) as f:
                self.kb = json.load(f)
            texts = [f"{e['symptom']} {e['title']} {e['clinical_context']}" for e in self.kb]
            self.embeddings = self.encoder.encode(texts, normalize_embeddings=True)
            print(f"[RAG] Loaded {len(self.kb)} knowledge base entries")
        else:
            print("[RAG] Knowledge base not found. Run prepare_datasets.py first.")

    def retrieve(self, query: str, top_k: int = 2) -> list:
        if self.embeddings is None or len(self.kb) == 0:
            return []
        query_emb = self.encoder.encode([query], normalize_embeddings=True)
        scores = (query_emb @ self.embeddings.T)[0]
        top_idx = scores.argsort()[-top_k:][::-1]
        return [
            {"entry": self.kb[i], "score": float(scores[i])}
            for i in top_idx if scores[i] > 0.3
        ]


class RiskScorer:
    """Loads trained ML models and computes risk scores from patient context"""

    def __init__(self):
        self.models = {}
        self.meta = {}
        for key in ["ppd", "preterm", "preeclampsia"]:
            model_path = MODELS_DIR / f"{key}_model.joblib"
            meta_path = MODELS_DIR / f"{key}_meta.json"
            if model_path.exists():
                try:
                    self.models[key] = joblib.load(model_path)
                except Exception as e:
                    print(f"[RiskScorer] Could not load pre-trained {key}_model.joblib ({e}).")
            if meta_path.exists():
                try:
                    with open(meta_path) as f:
                        self.meta[key] = json.load(f)
                except Exception as e:
                    print(f"[RiskScorer] Error reading {key}_meta.json: {e}")
        print(f"[RiskScorer] Loaded {len(self.models)} risk models")

    def score(self, patient_context: dict) -> dict:
        scores = {}
        for key, model in self.models.items():
            features = self.meta[key]["features"]
            row = {f: patient_context.get(f, 0) for f in features}
            try:
                df = pd.DataFrame([row], columns=features)
                prob = model.predict_proba(df)[0][1]
                scores[key] = round(prob * 100, 1)
            except Exception as e:
                print(f"[RiskScorer] {key} scoring error: {e}")
                scores[key] = None
        return scores


class MaternaAgent:
    """Main agent — orchestrates RAG + risk scoring + Gemini LLM"""

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in .env file")
        genai.configure(api_key=api_key)
        self.llm = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            system_instruction=SYSTEM_PROMPT
        )
        self.chat = self.llm.start_chat(history=[])
        self.rag = RAGRetriever()
        self.scorer = RiskScorer()
        print(f"[MaternaAgent] Initialized with {GEMINI_MODEL}")

    def respond(self, user_message: str, patient_context: dict) -> dict:
        """
        Full agent pipeline:
        1. RAG retrieval from clinical knowledge base
        2. ML risk scoring from patient context
        3. Gemini LLM with enriched prompt
        """
        # Step 1: RAG
        retrieved = self.rag.retrieve(user_message)
        rag_context = ""
        urgency_hint = "normal"
        if retrieved:
            top = retrieved[0]["entry"]
            urgency_hint = top.get("urgency", "normal")
            rag_context = f"""
CLINICAL REFERENCE (from knowledge base, relevance: {retrieved[0]['score']:.2f}):
Title: {top['title']}
Context: {top['clinical_context']}
Red flags: {', '.join(top.get('red_flags', []))}
Guidance: {top['guidance']}
Source: {top.get('source', 'ACOG')}
"""

        # Step 2: Risk Scores
        risk_scores = self.scorer.score(patient_context)
        risk_text = "\n".join([
            f"  - {k.upper()} risk: {v}%" for k, v in risk_scores.items() if v is not None
        ]) if risk_scores else "  (models not loaded)"

        # Step 3: Build enriched prompt
        week = patient_context.get("gestational_week", "unknown")
        trimester = patient_context.get("trimester", "unknown")

        prompt = f"""Patient context:
- Gestational week: {week} (Trimester {trimester})
- Age: {patient_context.get('age', 'not provided')}
- Key risk factors noted: hypertension={patient_context.get('risk_hypertension', 0)}, depression_hx={patient_context.get('risk_depression_hx', 0)}

ML Risk Scores from patient profile:
{risk_text}

{rag_context}

Patient's symptom/question: "{user_message}"

Please respond using the structured format in your instructions.
"""
        response = self.chat.send_message(prompt)
        text = response.text

        return {
            "response": text,
            "urgency": urgency_hint,
            "risk_scores": risk_scores,
            "rag_sources": [r["entry"]["source"] for r in retrieved],
            "week": week
        }

    def reset_chat(self):
        """Start a fresh conversation"""
        self.chat = self.llm.start_chat(history=[])


if __name__ == "__main__":
    print("=== MaternaAI Agent Test ===")
    agent = MaternaAgent()

    context = {
        "gestational_week": 32,
        "trimester": 3,
        "age": 28,
        "bmi_prepregnancy": 23.5,
        "risk_hypertension": 0,
        "risk_depression_hx": 1,
        "risk_smoking": 0,
        "sdoh_low_income": 0,
        "sdoh_unmarried": 0,
        "sdoh_low_education": 0,
        "symptom_swelling": 1,
        "symptom_headache": 0,
        "symptom_blurry_vision": 0,
        "systolic_bp": 118,
        "diastolic_bp": 76,
        "weight_gain_lb": 22
    }

    result = agent.respond("I have swollen feet and ankles since yesterday", context)
    print("\n--- AGENT RESPONSE ---")
    print(result["response"])
    print(f"\nUrgency: {result['urgency']}")
    print(f"Risk Scores: {result['risk_scores']}")
    print(f"Sources: {result['rag_sources']}")