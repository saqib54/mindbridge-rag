import os
from dotenv import load_dotenv
load_dotenv()
import chromadb

CHROMA_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
client = chromadb.PersistentClient(path=CHROMA_DIR)
print("Collections:", [c.name for c in client.list_collections()])
try:
    col = client.get_collection("mindbridge_corpus")
    print("mindbridge_corpus count:", col.count())
    if col.count() > 0:
        sample = col.get(limit=2, include=["documents","metadatas"])
        print("Sample IDs:", sample["ids"])
        print("Sample meta:", sample["metadatas"])
except Exception as e:
    print("Error:", e)
