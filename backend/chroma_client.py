"""
ChromaDB Client for MindBridge-RAG
Manages vector storage and semantic retrieval
Uses G3 Dataset column structure: Chunk_ID, Title, Text, Source_ID, Category, Risk_Level
"""

import os
import asyncio
from typing import List, Dict, Any, Optional
import chromadb
import pandas as pd


class ChromaClient:
    COLLECTION_NAME = "mindbridge_corpus"

    def __init__(self, persist_dir: str = "./chroma_db"):
        os.makedirs(persist_dir, exist_ok=True)
        self.client = chromadb.PersistentClient(path=persist_dir)
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )

    def get_chunk_count(self) -> int:
        return self.collection.count()

    async def load_corpus_chunks(self, df: pd.DataFrame, gemini_client) -> int:
        """
        Load corpus chunks DataFrame into ChromaDB.
        Supports both G3 Dataset columns (Chunk_ID, Title, Text, Source_ID, Category, Risk_Level)
        and generic columns (chunk_id, title, content, source_id, keywords).
        """
        if df.empty:
            return 0

        # Normalize column names — handle G3 Dataset (Title-case) and generic (lower-case)
        col_map = {c.lower(): c for c in df.columns}

        def get_col(names):
            for n in names:
                if n in col_map:
                    return col_map[n]
            return None

        id_col      = get_col(['chunk_id'])
        title_col   = get_col(['title'])
        text_col    = get_col(['text', 'content'])
        source_col  = get_col(['source_id'])
        cat_col     = get_col(['category'])
        risk_col    = get_col(['risk_level'])

        if not id_col or not text_col:
            return 0

        # Deduplicate by chunk_id
        existing_ids = set(self.collection.get(include=[])["ids"])

        ids, docs, metas, texts_to_embed = [], [], [], []

        for _, row in df.iterrows():
            chunk_id = str(row.get(id_col, "")).strip()
            if not chunk_id or chunk_id in existing_ids:
                continue

            text    = str(row.get(text_col, "")).strip()
            title   = str(row.get(title_col, "")).strip() if title_col else ""
            source  = str(row.get(source_col, "")).strip() if source_col else ""
            cat     = str(row.get(cat_col, "")).strip() if cat_col else ""
            risk    = str(row.get(risk_col, "L0")).strip() if risk_col else "L0"

            if not text:
                continue

            embed_text = f"{title}. {text}" if title else text

            ids.append(chunk_id)
            docs.append(text)
            metas.append({
                "chunk_id": chunk_id,
                "title": title,
                "source_id": source,
                "category": cat,
                "risk_level": risk,
            })
            texts_to_embed.append(embed_text)

        if not ids:
            return 0

        # Generate embeddings in batches of 10
        batch_size = 10
        all_embeddings = []
        for i in range(0, len(texts_to_embed), batch_size):
            batch = texts_to_embed[i: i + batch_size]
            embs = await gemini_client.embed_batch(batch)
            all_embeddings.extend(embs)

        self.collection.add(
            ids=ids,
            documents=docs,
            metadatas=metas,
            embeddings=all_embeddings,
        )

        return len(ids)

    async def query(
        self,
        query_embedding: List[float],
        n_results: int = 3,
    ) -> List[Dict[str, Any]]:
        """Retrieve top-n most relevant chunks."""
        if self.collection.count() == 0:
            return []

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=min(n_results, self.collection.count()),
            include=["documents", "metadatas", "distances"],
        )

        chunks = []
        for i, doc in enumerate(results["documents"][0]):
            meta = results["metadatas"][0][i]
            distance = results["distances"][0][i]
            chunks.append({
                "chunk_id":   meta.get("chunk_id", f"C{i}"),
                "title":      meta.get("title", ""),
                "content":    doc,
                "source_id":  meta.get("source_id", ""),
                "category":   meta.get("category", ""),
                "risk_level": meta.get("risk_level", "L0"),
                "similarity": round(1 - distance, 4),
            })

        return chunks

    def reset_collection(self):
        """Clear all data from the collection."""
        self.client.delete_collection(self.COLLECTION_NAME)
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
