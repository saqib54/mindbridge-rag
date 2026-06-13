import os
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai
genai.configure(api_key=os.getenv('GEMINI_API_KEY',''))

models = [
    'models/text-embedding-004',
    'models/embedding-001',
    'models/gemini-embedding-exp-03-07',
    'models/gemini-embedding-2',
]
for m in models:
    try:
        r = genai.embed_content(model=m, content='test', task_type='retrieval_query')
        emb = r["embedding"]
        print(f'OK: {m} -> dim={len(emb)}')
    except Exception as e:
        print(f'FAIL: {m} -> {str(e)[:150]}')
