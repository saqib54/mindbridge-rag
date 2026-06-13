"""
Gemini API Client for MindBridge-RAG
Handles text generation and embeddings via Google Gemini
"""

import os
import asyncio
from typing import List, Optional
import google.generativeai as genai


class GeminiClient:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("GEMINI_API_KEY is required.")
        genai.configure(api_key=api_key)
        self.api_key = api_key
        # Generation model — gemini-2.0-flash (confirmed available)
        self.gen_model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            generation_config={
                "temperature": 0.3,
                "top_p": 0.9,
                "max_output_tokens": 1024,
            },
        )
        # Embedding model — models/gemini-embedding-2 confirmed (dim=3072)
        self.embed_model = "models/gemini-embedding-2"

    async def generate(self, prompt: str) -> str:
        """Generate text using Gemini."""
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None, lambda: self.gen_model.generate_content(prompt)
        )
        return response.text.strip()

    async def embed(self, text: str) -> List[float]:
        """Generate embedding vector for a single text."""
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: genai.embed_content(
                model=self.embed_model,
                content=text,
                task_type="retrieval_document",
            ),
        )
        return result["embedding"]

    async def embed_query(self, text: str) -> List[float]:
        """Generate embedding vector for a query."""
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: genai.embed_content(
                model=self.embed_model,
                content=text,
                task_type="retrieval_query",
            ),
        )
        return result["embedding"]

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts."""
        embeddings = []
        for text in texts:
            emb = await self.embed(text)
            embeddings.append(emb)
        return embeddings
