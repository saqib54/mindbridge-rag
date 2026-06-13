"""
CSV Parser for MindBridge-RAG
Loads and parses G3 Dataset CSV files (exported from Excel)
Supports both G3 column names and generic column names.
"""

import os
from typing import Dict, Any, Optional
import pandas as pd


class CSVParser:
    FILES = {
        "sources":   "1_sources.csv",
        "chunks":    "2_corpus_chunks.csv",
        "questions": "3_benchmark_questions.csv",
        "answers":   "4_ideal_answers.csv",
        "risk_labels": "5_risk_labels.csv",
    }

    def __init__(self, data_dir: str = "./data"):
        self.data_dir = data_dir

    def _load(self, key: str) -> Optional[pd.DataFrame]:
        path = os.path.join(self.data_dir, self.FILES[key])
        if os.path.exists(path):
            try:
                return pd.read_csv(path, encoding='utf-8-sig')
            except Exception:
                return pd.read_csv(path, encoding='utf-8')
        return None

    def get_stats(self) -> Dict[str, Any]:
        stats = {}

        sources_df = self._load("sources")
        stats["total_sources"] = len(sources_df) if sources_df is not None else 0

        chunks_df = self._load("chunks")
        stats["total_chunks"] = len(chunks_df) if chunks_df is not None else 0

        questions_df = self._load("questions")
        stats["total_questions"] = len(questions_df) if questions_df is not None else 0

        risk_df = self._load("risk_labels")
        stats["total_risk_labels"] = len(risk_df) if risk_df is not None else 0

        answers_df = self._load("answers")
        stats["total_ideal_answers"] = len(answers_df) if answers_df is not None else 0

        # Count uploaded files
        uploaded = []
        for key, filename in self.FILES.items():
            path = os.path.join(self.data_dir, filename)
            if os.path.exists(path):
                uploaded.append(filename)
        stats["uploaded_files"] = uploaded

        return stats

    async def load_all(self, gemini_client, chroma_client) -> Dict[str, Any]:
        """Load all default CSV files and index corpus chunks into ChromaDB."""
        results = {}

        chunks_df = self._load("chunks")
        if chunks_df is not None:
            count = await chroma_client.load_corpus_chunks(chunks_df, gemini_client)
            results["chunks_indexed"] = count
            results["message"] = f"Successfully indexed {count} new chunks into ChromaDB from G3 Dataset."
        else:
            results["message"] = "2_corpus_chunks.csv not found in data directory."
            results["chunks_indexed"] = 0

        results["stats"] = self.get_stats()
        return results
