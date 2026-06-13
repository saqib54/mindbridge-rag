"""
Groq + Gemini Hybrid Client for MindBridge-RAG
Uses Groq (Llama 4) for text generation (extremely fast, high free limit).
Uses Gemini (gemini-embedding-2) for embeddings (keeps existing ChromaDB indexing intact).
"""

import os
import asyncio
import re
from typing import List
from groq import AsyncGroq
import google.generativeai as genai


class GroqClient:
    def __init__(self, groq_api_key: str, gemini_api_key: str = ""):
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY is required.")
        self.groq = AsyncGroq(api_key=groq_api_key)
        self.gen_model = os.getenv("GROQ_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")

        # Configure Gemini for embeddings
        if gemini_api_key:
            genai.configure(api_key=gemini_api_key)
            self.embed_model = "models/gemini-embedding-2"
            self.use_gemini_embed = True
        else:
            self.use_gemini_embed = False
            self.embed_model = None

        print(f"[Groq-Gemini Hybrid] gen={self.gen_model}, embed={'gemini' if gemini_api_key else 'none'}")

    async def generate(self, prompt: str, retries: int = 5, backoff: float = 2.0) -> str:
        """Generate text using Groq Llama with retry on rate limit."""
        current_delay = backoff
        for attempt in range(retries):
            try:
                response = await self.groq.chat.completions.create(
                    model=self.gen_model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3,
                    max_completion_tokens=1024,
                    top_p=0.9,
                    stream=False,
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                err_str = str(e).lower()
                is_rate_limit = "429" in err_str or "rate limit" in err_str or "rate_limit" in err_str
                if is_rate_limit and attempt < retries - 1:
                    wait_seconds = current_delay
                    match = re.search(r"try again in (\d+(\.\d+)?)s", err_str)
                    if match:
                        try:
                            wait_seconds = float(match.group(1)) + 0.5
                        except Exception:
                            pass
                    
                    print(f"[Groq Rate Limit] Attempt {attempt+1} hit rate limit. Waiting {wait_seconds}s before retry...")
                    await asyncio.sleep(wait_seconds)
                    current_delay *= 2
                else:
                    raise e

    async def embed(self, text: str) -> List[float]:
        """Generate embedding vector using Gemini (dim=3072)."""
        if not self.use_gemini_embed:
            # Fallback to zero vector of 3072 dimensions if key missing
            return [0.0] * 3072
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
        """Generate query embedding vector using Gemini (dim=3072)."""
        if not self.use_gemini_embed:
            return [0.0] * 3072
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
        """Generate batch embeddings using Gemini."""
        embeddings = []
        for text in texts:
            emb = await self.embed(text)
            embeddings.append(emb)
        return embeddings
