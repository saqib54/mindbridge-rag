"""
RAG Engine for MindBridge-RAG
Implements S1 (Basic RAG) and S2 (Safety-Aware RAG) pipelines
"""

from typing import Dict, Any, List


# ── S1 System Prompt ──────────────────────────────────────────────────────────
S1_SYSTEM_PROMPT = """You are MindBridge Basic RAG, a student support assistant.

Use ONLY the retrieved context below to answer the student's question.
Answer clearly and concisely. Do not mention risk labels or safety classifications.
If the context does not contain relevant information, say you don't have that information.

Retrieved Context:
{context}

Student Question: {question}

Answer:"""

# ── S2 System Prompt (Normal / Stress) ───────────────────────────────────────
S2_NORMAL_PROMPT = """You are MindBridge Safety-Aware RAG, a compassionate student support assistant.

Use the retrieved context to answer the student's question.
Be warm, empathetic, and supportive. Mention relevant university resources.
Encourage the student to seek further support if needed.

Retrieved Context:
{context}

Student Question: {question}

Answer:"""

S2_STRESS_PROMPT = """You are MindBridge Safety-Aware RAG, a compassionate student support assistant.

The student appears to be experiencing stress. Respond with empathy and care.
Use the retrieved context to provide helpful, supportive guidance.
Acknowledge their feelings, provide practical suggestions, and mention available support services.
Encourage them to reach out to university counseling if stress persists.

Retrieved Context:
{context}

Student Question: {question}

Empathetic Answer:"""

S2_DISTRESS_PROMPT = """You are MindBridge Safety-Aware RAG, a compassionate student support assistant.

The student appears to be in distress. Respond with deep empathy and care.
Validate their feelings. Provide supportive, non-judgmental guidance.
Strongly encourage them to reach out to a counselor or trusted person.
Use the retrieved context to provide appropriate resources.

Retrieved Context:
{context}

Student Question: {question}

Supportive Answer:"""

# ── S2 Crisis Response (hardcoded, no RAG) ───────────────────────────────────
CRISIS_RESPONSE = """I am concerned about your safety.

Please contact a trusted person, counselor, university support service, family member, or emergency service immediately.

**Crisis Resources:**
- 🆘 **Emergency:** Call 911
- 📞 **988 Suicide & Crisis Lifeline:** Call or text **988** (24/7)
- 💬 **Crisis Text Line:** Text HOME to **741741**
- 🏫 **University Counseling Center:** Visit or call during business hours
- 👨‍👩‍👧 **Tell someone you trust** — a friend, family member, or professor

You do not need to face this situation alone. Help is available right now."""

# ── S2 Medical Response ───────────────────────────────────────────────────────
MEDICAL_RESPONSE = """I cannot diagnose medical or mental health conditions.

A qualified healthcare professional can provide appropriate assessment and support.

**Where to get proper help:**
- 🏥 **Student Health Center** — for general health and referrals
- 🧠 **Campus Counseling Center** — for mental health assessments
- 👨‍⚕️ **Your primary care physician** — for medical evaluations
- 📋 **Disability Services** — if you need academic accommodations

Please reach out to a qualified professional who can give you the personalized support you deserve."""

# ── S2 Out of Scope Response ──────────────────────────────────────────────────
OUT_OF_SCOPE_RESPONSE = """I'm MindBridge, a student support assistant focused specifically on **student wellbeing and academic support**.

I can help you with topics like:
- 📚 **Academic support** — tutoring, study strategies, exam preparation
- 🧠 **Mental health** — stress, anxiety, counseling resources
- 💰 **Financial aid** — scholarships, emergency funds
- 🏠 **Housing & campus life** — housing resources, residential support
- 🎓 **Career guidance** — career services, internships
- 🌍 **International student support** — visa, cultural adjustment

For questions outside this scope, please consult the appropriate specialist or resource."""


class RAGEngine:
    def __init__(self, gemini_client, chroma_client):
        self.gemini = gemini_client
        self.chroma = chroma_client

    async def _retrieve(self, question: str, n: int = 3) -> List[Dict]:
        """Retrieve top-n relevant chunks for a question."""
        if self.chroma.get_chunk_count() == 0:
            return []
        query_emb = await self.gemini.embed_query(question)
        chunks = await self.chroma.query(query_emb, n_results=n)
        return chunks

    def _build_context(self, chunks: List[Dict]) -> str:
        """Build context string from retrieved chunks."""
        if not chunks:
            return "No relevant context found in the knowledge base."
        parts = []
        for i, chunk in enumerate(chunks, 1):
            parts.append(
                f"[Chunk {i}: {chunk['title']}]\n{chunk['content']}"
            )
        return "\n\n".join(parts)

    # ── S0: Direct LLM (No RAG) ───────────────────────────────────────────────
    async def direct_llm(self, question: str) -> Dict[str, Any]:
        """S0 pipeline: generate answer directly using Gemini without any retrieved context."""
        prompt = f"You are a student support assistant. Answer the student's question directly and concisely.\n\nStudent Question: {question}\n\nAnswer:"
        response_text = await self.gemini.generate(prompt)
        return {
            "response": response_text,
            "chunk_ids": [],
            "context_count": 0,
            "chunks": [],
        }

    # ── S1: Basic RAG ─────────────────────────────────────────────────────────
    async def basic_rag(self, question: str) -> Dict[str, Any]:
        """S1 pipeline: retrieve top-3 chunks → generate with Gemini."""
        chunks = await self._retrieve(question, n=3)
        context = self._build_context(chunks)
        prompt = S1_SYSTEM_PROMPT.format(context=context, question=question)
        response_text = await self.gemini.generate(prompt)

        return {
            "response": response_text,
            "chunk_ids": [c["chunk_id"] for c in chunks],
            "context_count": len(chunks),
            "chunks": chunks,
        }

    # ── S2: Safety-Aware RAG ──────────────────────────────────────────────────
    async def safety_aware_rag(self, question: str, risk_level: str) -> Dict[str, Any]:
        """S2 pipeline: classify risk → apply safety layer → generate."""

        # Crisis: no RAG, return hardcoded response
        if risk_level == "L3_CRISIS":
            return {
                "response": CRISIS_RESPONSE,
                "chunk_ids": [],
                "context_count": 0,
                "chunks": [],
            }

        # Medical: no RAG, return boundary response
        if risk_level == "L4_MEDICAL":
            return {
                "response": MEDICAL_RESPONSE,
                "chunk_ids": [],
                "context_count": 0,
                "chunks": [],
            }

        # Out of scope: no RAG
        if risk_level == "L5_OUT_OF_SCOPE":
            return {
                "response": OUT_OF_SCOPE_RESPONSE,
                "chunk_ids": [],
                "context_count": 0,
                "chunks": [],
            }

        # For L0, L1, L2: retrieve context and generate
        n_chunks = 5 if risk_level == "L2_DISTRESS" else 3
        chunks = await self._retrieve(question, n=n_chunks)
        context = self._build_context(chunks)

        # Choose prompt based on risk level
        if risk_level == "L2_DISTRESS":
            prompt = S2_DISTRESS_PROMPT.format(context=context, question=question)
        elif risk_level == "L1_STRESS":
            prompt = S2_STRESS_PROMPT.format(context=context, question=question)
        else:
            prompt = S2_NORMAL_PROMPT.format(context=context, question=question)

        response_text = await self.gemini.generate(prompt)

        return {
            "response": response_text,
            "chunk_ids": [c["chunk_id"] for c in chunks],
            "context_count": len(chunks),
            "chunks": chunks,
        }
