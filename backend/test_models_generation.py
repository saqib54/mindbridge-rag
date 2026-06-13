import os
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

models_to_test = [
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-flash-latest"
]

for model_name in models_to_test:
    print(f"Testing {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        # Set a short timeout if possible or just request
        resp = model.generate_content("Say 'Yes' if you receive this.")
        print(f"  Success: {resp.text.strip()}")
    except Exception as e:
        print(f"  Failed: {e}")
    print("-" * 40)
