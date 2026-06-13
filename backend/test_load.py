import os
import asyncio
from dotenv import load_dotenv
load_dotenv()

from gemini_client import GeminiClient
from chroma_client import ChromaClient
from csv_parser import CSVParser

async def test():
    api_key = os.getenv("GEMINI_API_KEY", "")
    print(f"API Key start: {api_key[:10]}... length: {len(api_key)}")
    
    gemini = GeminiClient(api_key)
    chroma = ChromaClient(os.getenv("CHROMA_PERSIST_DIR", "./chroma_db"))
    parser = CSVParser(os.getenv("DATA_DIR", "./data"))
    
    print("Testing embed with Gemini...")
    try:
        emb = await gemini.embed("Test text")
        print(f"Embed success! Vector length: {len(emb)}")
    except Exception as e:
        print("Gemini embed failed:")
        import traceback
        traceback.print_exc()
        return

    print("Loading CSV files...")
    try:
        res = await parser.load_all(gemini, chroma)
        print("Load all result:")
        print(res)
    except Exception as e:
        print("Load all failed:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
