"""
MaternaAI — Streamlit Web App
Run with: streamlit run app/streamlit_app.py
"""

import streamlit as st
import sys
import os
import json
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

st.set_page_config(
    page_title="MaternaAI — Pregnancy Symptom Guide",
    page_icon="🤱",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
.urgency-urgent { background:#FCEBEB; border-left:4px solid #E24B4A; padding:10px 14px; border-radius:6px; color:#791F1F; }
.urgency-watch  { background:#FAEEDA; border-left:4px solid #EF9F27; padding:10px 14px; border-radius:6px; color:#633806; }
.urgency-normal { background:#EAF3DE; border-left:4px solid #639922; padding:10px 14px; border-radius:6px; color:#27500A; }
.risk-card { background:#F8F8F8; border-radius:10px; padding:12px 16px; margin:6px 0; }
.source-tag { background:#E6F1FB; color:#0C447C; font-size:12px; padding:2px 8px; border-radius:10px; margin-right:4px; }
</style>
""", unsafe_allow_html=True)


@st.cache_resource
def load_agent():
    try:
        from agent.materna_agent import MaternaAgent
        return MaternaAgent(), None
    except Exception as e:
        return None, str(e)


def sidebar_patient_context():
    st.sidebar.title("Patient Profile")
    st.sidebar.caption("Adjust to match your pregnancy details")

    week = st.sidebar.slider("Gestational week", 4, 42, 28)
    trimester = 1 if week <= 12 else (2 if week <= 26 else 3)
    st.sidebar.info(f"Trimester {trimester}")

    age = st.sidebar.number_input("Age", 16, 50, 28)
    bmi = st.sidebar.slider("Pre-pregnancy BMI", 15.0, 45.0, 23.5, 0.5)

    st.sidebar.subheader("Medical history")
    hypertension = st.sidebar.checkbox("History of hypertension")
    depression_hx = st.sidebar.checkbox("History of depression")
    prev_preterm = st.sidebar.checkbox("Previous preterm birth")
    diabetes_gest = st.sidebar.checkbox("Gestational diabetes")
    smoking = st.sidebar.checkbox("Smoking")

    st.sidebar.subheader("Social factors")
    low_income = st.sidebar.checkbox("Low income household")
    low_education = st.sidebar.checkbox("Education below secondary")

    st.sidebar.subheader("Current vitals (optional)")
    systolic = st.sidebar.number_input("Systolic BP (mmHg)", 70, 200, 115)
    diastolic = st.sidebar.number_input("Diastolic BP (mmHg)", 40, 130, 75)
    weight_gain = st.sidebar.slider("Weight gain so far (lbs)", 0, 80, 18)

    return {
        "gestational_week": week,
        "trimester": trimester,
        "age": age,
        "bmi_prepregnancy": bmi,
        "risk_hypertension": int(hypertension),
        "risk_depression_hx": int(depression_hx),
        "risk_prev_preterm": int(prev_preterm),
        "risk_gestational_diabetes": int(diabetes_gest),
        "risk_smoking": int(smoking),
        "sdoh_low_income": int(low_income),
        "sdoh_low_education": int(low_education),
        "sdoh_unmarried": 0,
        "symptom_swelling": 0,
        "symptom_headache": 0,
        "symptom_blurry_vision": 0,
        "symptom_back_pain": 0,
        "symptom_nausea": 0,
        "symptom_reduced_fetal_movement": 0,
        "systolic_bp": systolic,
        "diastolic_bp": diastolic,
        "weight_gain_lb": weight_gain,
    }


def render_risk_scores(scores: dict):
    if not scores:
        return
    st.subheader("ML Risk Assessment")
    st.caption("Based on your profile — not a diagnosis")
    cols = st.columns(3)
    labels = {"ppd": "PPD Risk", "preterm": "Preterm Risk", "preeclampsia": "Preeclampsia Risk"}
    colors = {"ppd": "#534AB7", "preterm": "#D85A30", "preeclampsia": "#E24B4A"}

    for i, (key, label) in enumerate(labels.items()):
        val = scores.get(key)
        if val is not None:
            with cols[i]:
                st.metric(label, f"{val:.1f}%")
                color = colors[key]
                level = "Low" if val < 20 else ("Moderate" if val < 50 else "High")
                st.markdown(
                    f'<div style="background:{color}22;border:1px solid {color}66;'
                    f'border-radius:6px;padding:4px 10px;font-size:12px;color:{color};text-align:center">'
                    f'{level}</div>', unsafe_allow_html=True
                )


def main():
    col_header, _ = st.columns([3, 1])
    with col_header:
        st.title("MaternaAI")
        st.caption("AI-powered pregnancy symptom guide — Gemini 3.1 Pro + Clinical RAG")
        st.warning("**Medical disclaimer:** This tool provides general guidance only. Always consult your OB/midwife for clinical decisions.", icon="⚠️")

    patient_ctx = sidebar_patient_context()

    agent, error = load_agent()

    if error:
        st.error(f"Agent not loaded: {error}")
        st.code("""
# Fix:
# 1. Create a .env file in the project root:
echo "GEMINI_API_KEY=your_key_here" > .env

# 2. Run setup:
python agent/prepare_datasets.py
python models/train_risk_models.py

# 3. Restart:
streamlit run app/streamlit_app.py
        """, language="bash")
        return

    if "messages" not in st.session_state:
        st.session_state.messages = []
        st.session_state.last_result = None

    # Quick symptom chips
    st.subheader("Common symptoms — click to ask:")
    chips = [
        "I have swollen feet and ankles",
        "I have a bad headache and blurry vision",
        "I have lower back pain",
        "My baby hasn't moved much today",
        "I feel nauseated and dizzy",
        "I have some vaginal spotting",
        "I feel very anxious and low in mood",
        "I think I'm having contractions at 34 weeks"
    ]
    cols = st.columns(4)
    for i, chip in enumerate(chips):
        with cols[i % 4]:
            if st.button(chip, key=f"chip_{i}", use_container_width=True):
                st.session_state.pending_input = chip

    st.divider()

    # Chat display
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"], avatar="🤱" if msg["role"] == "assistant" else "👤"):
            st.markdown(msg["content"])

    # Risk scores from last response
    if st.session_state.get("last_result"):
        result = st.session_state.last_result
        render_risk_scores(result.get("risk_scores", {}))
        if result.get("rag_sources"):
            src_html = " ".join([f'<span class="source-tag">{s}</span>' for s in result["rag_sources"]])
            st.markdown(f"**Clinical sources:** {src_html}", unsafe_allow_html=True)

    # Input
    pending = st.session_state.pop("pending_input", None)
    user_input = st.chat_input("Describe your symptom or ask a question...") or pending

    if user_input:
        st.session_state.messages.append({"role": "user", "content": user_input})
        with st.chat_message("user", avatar="👤"):
            st.markdown(user_input)

        with st.chat_message("assistant", avatar="🤱"):
            with st.spinner("MaternaAI is thinking..."):
                try:
                    result = agent.respond(user_input, patient_ctx)
                    st.session_state.last_result = result

                    urgency = result.get("urgency", "normal")
                    urgency_labels = {
                        "urgent": "🔴 URGENT — Seek care now",
                        "watch": "🟡 WATCH — Monitor closely",
                        "normal": "🟢 NORMAL — Common in pregnancy"
                    }
                    st.markdown(
                        f'<div class="urgency-{urgency}">{urgency_labels.get(urgency, urgency.upper())}</div>',
                        unsafe_allow_html=True
                    )
                    st.markdown(result["response"])
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": result["response"]
                    })
                except Exception as e:
                    st.error(f"Error: {e}")

    if st.session_state.messages:
        if st.button("Clear conversation"):
            st.session_state.messages = []
            st.session_state.last_result = None
            if agent:
                agent.reset_chat()
            st.rerun()


if __name__ == "__main__":
    main()
