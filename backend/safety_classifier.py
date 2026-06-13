"""
Safety Classifier for MindBridge-RAG
Classifies student queries into risk levels using Gemini.
Risk labels match G3 Dataset: L0, L1, L2, L3, L4, L5
(Also maps full labels like L0_NORMAL -> L0 for compatibility)
"""

import re
import json
from typing import Dict, Any, Optional


# ── Risk level mapping (G3 uses short codes, UI uses full names) ──────────────
RISK_LABELS_SHORT = ["L0", "L1", "L2", "L3", "L4", "L5"]
RISK_LABELS_FULL  = ["L0_NORMAL", "L1_STRESS", "L2_DISTRESS", "L3_CRISIS", "L4_MEDICAL", "L5_OUT_OF_SCOPE"]

# Convert short -> full for frontend display
SHORT_TO_FULL = {
    "L0": "L0_NORMAL",
    "L1": "L1_STRESS",
    "L2": "L2_DISTRESS",
    "L3": "L3_CRISIS",
    "L4": "L4_MEDICAL",
    "L5": "L5_OUT_OF_SCOPE",
}
FULL_TO_SHORT = {v: k for k, v in SHORT_TO_FULL.items()}


CLASSIFIER_PROMPT = """You are a safety classifier for a student support chatbot focused on procrastination and student wellbeing.
Your job is to classify the risk level of a student's message.

Risk Levels:
- L0: Normal educational question about procrastination, study habits, time management, academic support.
- L1: Student expressing mild stress, worry, pressure, anxiety about procrastination or academic tasks.
- L2: Student showing moderate distress, persistent sadness, hopelessness related to procrastination or academic failure.
- L3: Student expressing suicidal thoughts, self-harm ideation, or statements suggesting immediate danger to themselves.
- L4: Student seeking a medical or psychiatric diagnosis, or asking about specific medication or mental health treatment.
- L5: Question completely unrelated to procrastination, student wellbeing, or academic life (e.g. stocks, sports, cooking).

Student Message: "{question}"

Respond ONLY with valid JSON in this exact format:
{{
  "label": "<one of: L0, L1, L2, L3, L4, L5>",
  "confidence": <float between 0.0 and 1.0>,
  "reasoning": "<brief explanation>"
}}"""


# ── Keyword-based fallback classifier ────────────────────────────────────────
CRISIS_KEYWORDS = [
    "end my life", "kill myself", "want to die", "don't want to be here",
    "better off without me", "no reason to live", "suicide", "suicidal",
    "self-harm", "hurt myself", "take my own life", "ending it all",
    "want to disappear", "can't go on",
]

MEDICAL_KEYWORDS = [
    "diagnose me", "do i have", "what disorder", "what disease",
    "what medication", "what prescription", "what are my symptoms",
    "am i depressed", "am i anxious", "mental illness diagnosis",
    "adhd", "add", "ocd", "bipolar",
]

OUT_OF_SCOPE_KEYWORDS = [
    "cryptocurrency", "bitcoin", "stocks", "invest", "sports team",
    "recipe", "cooking", "weather forecast", "movie recommendation",
    "political party", "election", "travel destination", "food",
]

DISTRESS_KEYWORDS = [
    "hopeless", "can't cope", "cannot cope", "worthless", "failure",
    "nobody cares", "all alone", "isolated", "pointless", "give up",
    "breaking down", "falling apart", "can't do anything right",
    "always procrastinate", "so behind", "completely lost",
]

STRESS_KEYWORDS = [
    "stressed", "anxious", "worried", "overwhelmed", "nervous",
    "exhausted", "tired", "pressure", "burnout", "burned out",
    "can't sleep", "cannot sleep", "panic", "procrastinate",
    "keep putting off", "always late", "cant focus", "can't focus",
    "struggling with", "hard to start", "difficult to begin",
]


class SafetyClassifier:
    def __init__(self, gemini_client):
        self.gemini = gemini_client

    def _normalize_label(self, label: str) -> str:
        """Normalize any label format to the short form (L0-L5)."""
        label = label.strip().upper()
        if label in RISK_LABELS_SHORT:
            return label
        if label in FULL_TO_SHORT:
            return FULL_TO_SHORT[label]
        # Try prefix match
        for short in RISK_LABELS_SHORT:
            if label.startswith(short):
                return short
        return "L0"

    def _keyword_classify(self, text: str) -> Optional[Dict[str, Any]]:
        """Fast keyword-based classification as fallback."""
        lower = text.lower()

        for kw in CRISIS_KEYWORDS:
            if kw in lower:
                return {"label": "L3", "label_full": "L3_CRISIS", "confidence": 0.95, "reasoning": "Crisis keyword detected."}

        for kw in MEDICAL_KEYWORDS:
            if kw in lower:
                return {"label": "L4", "label_full": "L4_MEDICAL", "confidence": 0.90, "reasoning": "Medical query keyword detected."}

        for kw in OUT_OF_SCOPE_KEYWORDS:
            if kw in lower:
                return {"label": "L5", "label_full": "L5_OUT_OF_SCOPE", "confidence": 0.88, "reasoning": "Out of scope keyword detected."}

        for kw in DISTRESS_KEYWORDS:
            if kw in lower:
                return {"label": "L2", "label_full": "L2_DISTRESS", "confidence": 0.82, "reasoning": "Distress keyword detected."}

        for kw in STRESS_KEYWORDS:
            if kw in lower:
                return {"label": "L1", "label_full": "L1_STRESS", "confidence": 0.78, "reasoning": "Stress keyword detected."}

        return None

    async def classify(self, question: str) -> Dict[str, Any]:
        """
        Classify the risk level of a student question.
        Returns both short label (L0-L5) and full label (L0_NORMAL etc.)
        """
        keyword_result = self._keyword_classify(question)

        try:
            prompt = CLASSIFIER_PROMPT.format(question=question)
            raw = await self.gemini.generate(prompt)

            json_match = re.search(r"\{.*?\}", raw, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                raw_label = str(result.get("label", "L0"))
                short = self._normalize_label(raw_label)
                full = SHORT_TO_FULL.get(short, "L0_NORMAL")
                if short in RISK_LABELS_SHORT:
                    return {
                        "label": full,          # Full label for frontend display
                        "label_short": short,   # Short label matching G3 dataset
                        "confidence": float(result.get("confidence", 0.75)),
                        "reasoning": result.get("reasoning", ""),
                    }
        except Exception:
            pass

        if keyword_result:
            return {
                "label": keyword_result["label_full"],
                "label_short": keyword_result["label"],
                "confidence": keyword_result["confidence"],
                "reasoning": keyword_result["reasoning"],
            }

        return {
            "label": "L0_NORMAL",
            "label_short": "L0",
            "confidence": 0.60,
            "reasoning": "No specific risk indicators detected. Treating as normal query.",
        }
