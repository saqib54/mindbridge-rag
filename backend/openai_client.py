"""
OpenAI Client for MindBridge-RAG
Drop-in replacement for GeminiClient using OpenAI gpt-4o-mini + text-embedding-3-small
"""

import os
import asyncio
from typing import List
import openai
from openai import AsyncOpenAI


class OpenAIClient:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("OPENAI_API_KEY is required.")
        self.client = AsyncOpenAI(api_key=api_key)
        self.gen_model = os.getenv("OPENAI_GEN_MODEL", "gpt-4o-mini")
        self.embed_model = os.getenv("OPENAI_EMBED_MODEL", "text-embedding-3-small")
        print(f"[OpenAI] gen={self.gen_model}, embed={self.embed_model}")

    async def generate(self, prompt: str) -> str:
        """Generate text using OpenAI chat completion."""
        response = await self.client.chat.completions.create(
            model=self.gen_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1024,
        )
        return response.choices[0].message.content.strip()

    async def embed(self, text: str) -> List[float]:
        """Generate embedding vector for a single document text."""
        response = await self.client.embeddings.create(
            model=self.embed_model,
            input=text,
        )
        return response.data[0].embedding

    async def embed_query(self, text: str) -> List[float]:
        """Generate embedding vector for a query (same model, OpenAI doesn't differentiate)."""
        response = await self.client.embeddings.create(
            model=self.embed_model,
            input=text,
        )
        return response.data[0].embedding

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts in one API call."""
        response = await self.client.embeddings.create(
            model=self.embed_model,
            input=texts,
        )
        # Sort by index to preserve order
        sorted_data = sorted(response.data, key=lambda x: x.index)
        return [item.embedding for item in sorted_data]
