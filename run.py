"""
MaternaAI — Single Entry Point
Runs setup + launches the app automatically.
"""
import subprocess, sys, os
from pathlib import Path

def run(cmd, cwd=None):
    print(f"\n>>> {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd or Path(__file__).parent)
    if result.returncode != 0:
        print(f"[ERROR] Command failed: {cmd}")
        sys.exit(1)

if __name__ == "__main__":
    base = Path(__file__).parent
    env_file = base / ".env"

    if not env_file.exists():
        key = input("Enter your Gemini API key: ").strip()
        env_file.write_text(f"GEMINI_API_KEY={key}\n")
        print("[OK] .env created")

    print("\n[1/3] Preparing datasets...")
    run(f"{sys.executable} agent/prepare_datasets.py", cwd=base)

    print("\n[2/3] Training risk models...")
    run(f"{sys.executable} models/train_risk_models.py", cwd=base)

    print("\n[3/3] Launching MaternaAI...")
    run("streamlit run app/streamlit_app.py", cwd=base)
