import os
import asyncio
from dotenv import load_dotenv
load_dotenv()

import google.generativeai as genai

async def test():
    api_key = os.getenv("GEMINI_API_KEY", "")
    print(f"API Key: {api_key}")
    genai.configure(api_key=api_key)
    
    print("\nTesting generation with gemini-3.5-flash:")
    try:
        model = genai.GenerativeModel("gemini-3.5-flash")
        resp = model.generate_content("Hello")
        print(f"Response: {resp.text}")
    except Exception as e:
        print(f"Failed with gemini-3.5-flash: {e}")

if __name__ == "__main__":
    asyncio.run(test())
