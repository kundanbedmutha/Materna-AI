# MaternaAI — Pregnancy Companion

> An AI-powered pregnancy companion with symptom triage, due date prediction, nutrition guidance, and personalised care — built with React, FastAPI, and Gemini 3.1 Pro.

---

## Features

| Page | Description |
|------|-------------|
| 🏠 **Home** | Personalised greeting, rotating mom quotes, fetal journey timeline, wellness tips, and quick-access feature cards |
| 🩺 **Symptom Checker** | AI-powered triage using Gemini 3.1 Pro + RAG over ACOG clinical guidelines. Classifies symptoms as Urgent / Watch / Normal with ML risk scores |
| 📅 **Due Date Calculator** | EDD from LMP or conception date using Naegele's Rule. Full pregnancy progress bar, key milestone timeline, star sign prediction, and stat cards |
| 🥗 **Food & Nutrition** | Trimester-aware, feeling-based food recommendations for Vegetarian, Vegan, and Non-Vegetarian diets. Essential nutrient tracker per trimester |

---

## AI Methods

| Layer | Method | Purpose |
|-------|--------|---------|
| LLM | **Gemini 3.1 Pro** | Multi-turn symptom conversation, empathetic guidance |
| RAG | **sentence-transformers** + cosine similarity | Retrieve relevant ACOG clinical knowledge base entries |
| ML | **Random Forest + Gradient Boosting** | PPD, Preterm Birth, Preeclampsia risk scoring |
| Dataset | **CDC PRAMS-structured** (5000 records) | Training data for risk models |

---

## Project Structure

```
materna_ai/
├── agent/
│   ├── materna_agent.py        # Gemini + RAG + Risk scoring agent
│   └── prepare_datasets.py     # Dataset generation + knowledge base
├── app/
│   └── api.py                  # FastAPI backend (REST endpoints)
├── models/
│   └── train_risk_models.py    # ML model training script
├── datasets/                   # Generated CSV datasets
├── data/                       # Vector embeddings + knowledge base JSON
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── App.js              # Root component + page routing
│       ├── index.css           # Global styles + CSS variables
│       └── components/
│           ├── Login.js/.css       # Sign in / Create account
│           ├── Header.js/.css      # Top bar + navigation
│           ├── Sidebar.js/.css     # Patient profile + risk scores
│           ├── HomePage.js/.css    # Home with quotes + features
│           ├── ChatPanel.js/.css   # Symptom checker chat UI
│           ├── DueDatePage.js/.css # EDD calculator
│           └── FoodPage.js/.css    # Nutrition guide
├── requirements.txt
├── .env.example
└── README.md
```

---

## Setup & Run

### Prerequisites
- Python 3.9+, Node.js 18+
- Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### Step 1 — Activate virtual environment

```bash
# Windows
venv\Scripts\Activate.ps1

```

### Step 2 — Install Python dependencies

```bash
pip install -r requirements.txt
```

### Step 3 — Add your Gemini API key

```bash
copy .env.example .env    # Windows
# Open .env and set: GEMINI_API_KEY=your_key_here
```

### Step 4 — Prepare datasets and train models

```bash
python agent/prepare_datasets.py
python models/train_risk_models.py
```

### Step 5 — Start the backend (Terminal 1)

```bash
python -m uvicorn app.api:app --reload --port 8000
```

### Step 6 — Start the React frontend (Terminal 2)

```bash
cd frontend
npm install     # first time only
npm start
```

Open **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/chat` | Symptom message → AI response |
| POST | `/reset` | Reset conversation |

---

## Disclaimer

MaternaAI provides general educational guidance only — not a substitute for professional medical advice. Always consult your OB/GYN or midwife.

---
*Gemini 3.1 Pro · React 18 · FastAPI · scikit-learn · Built for research*