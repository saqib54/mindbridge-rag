import os
import threading
from typing import Dict, Any, List, Optional
from datetime import datetime
import pandas as pd
from collections import defaultdict


class EvaluationStore:
    def __init__(self, data_dir: str = "./data"):
        self.data_dir = data_dir
        self.responses_file = os.path.join(data_dir, "6_model_responses.csv")
        self.evaluations_file = os.path.join(data_dir, "7_human_evaluation.csv")
        self.lock = threading.Lock()
        
        # {question_id: {system_type: {...}}}
        self.responses: Dict[str, Dict[str, Any]] = {}
        self.evaluations: List[Dict[str, Any]] = []
        self.risk_counts = defaultdict(int)
        
        # Load existing files from disk on startup
        self._load_from_disk()

    def _load_from_disk(self):
        if os.path.exists(self.responses_file):
            try:
                df = pd.read_csv(self.responses_file)
                for _, row in df.iterrows():
                    q_id = str(row.get("question_id", ""))
                    sys_type = str(row.get("system_type", ""))
                    question = str(row.get("question", ""))
                    response = str(row.get("response", ""))
                    chunk_ids_str = row.get("retrieved_chunk_ids", "")
                    chunk_ids = []
                    if pd.notna(chunk_ids_str):
                        chunk_ids = [c.strip() for c in str(chunk_ids_str).split(",") if c.strip()]
                    response_time = float(row.get("response_time_seconds", 0))
                    risk_level = str(row.get("risk_level", "")) if pd.notna(row.get("risk_level")) else None
                    if risk_level == "nan":
                        risk_level = None
                    timestamp = str(row.get("timestamp", ""))
                    
                    if not q_id:
                        continue
                        
                    if q_id not in self.responses:
                        self.responses[q_id] = {
                            "question": question,
                            "timestamp": timestamp,
                        }
                    self.responses[q_id][sys_type] = {
                        "response": response,
                        "chunk_ids": chunk_ids,
                        "response_time": response_time,
                        "risk_level": risk_level,
                    }
                    if risk_level:
                        self.risk_counts[risk_level] += 1
            except Exception as e:
                print(f"Error loading responses from disk: {e}")

        if os.path.exists(self.evaluations_file):
            try:
                df = pd.read_csv(self.evaluations_file)
                self.evaluations = df.to_dict(orient="records")
            except Exception as e:
                print(f"Error loading evaluations from disk: {e}")

    # ── Responses ─────────────────────────────────────────────────────────────
    def store_response(
        self,
        question_id: str,
        system_type: str,
        question: str,
        response: str,
        chunk_ids: List[str],
        response_time: float,
        risk_level: Optional[str] = None,
    ):
        if question_id not in self.responses:
            self.responses[question_id] = {
                "question": question,
                "timestamp": datetime.now().isoformat(),
            }
        self.responses[question_id][system_type] = {
            "response": response,
            "chunk_ids": chunk_ids,
            "response_time": response_time,
            "risk_level": risk_level,
        }
        if risk_level:
            self.risk_counts[risk_level] += 1
            
        # Automatically save to disk
        self.save_responses_to_disk()

    def save_responses_to_disk(self):
        with self.lock:
            df = self.export_responses_df()
            os.makedirs(os.path.dirname(self.responses_file), exist_ok=True)
            df.to_csv(self.responses_file, index=False, encoding="utf-8-sig")
            try:
                excel_path = self.responses_file.replace(".csv", ".xlsx")
                df.to_excel(excel_path, index=False)
            except Exception as e:
                print(f"Error saving responses Excel file: {e}")

    def export_responses_df(self) -> pd.DataFrame:
        rows = []
        for q_id, data in self.responses.items():
            for sys_type in ["S0", "S1", "S2"]:
                if sys_type in data:
                    sys_data = data[sys_type]
                    rows.append({
                        "question_id": q_id,
                        "question": data.get("question", ""),
                        "system_type": sys_type,
                        "response": sys_data.get("response", ""),
                        "retrieved_chunk_ids": ",".join(sys_data.get("chunk_ids", [])) if sys_data.get("chunk_ids") else "",
                        "response_time_seconds": sys_data.get("response_time", 0),
                        "risk_level": sys_data.get("risk_level", "") or "",
                        "timestamp": data.get("timestamp", ""),
                    })
        return pd.DataFrame(rows) if rows else pd.DataFrame(
            columns=["question_id", "question", "system_type", "response",
                     "retrieved_chunk_ids", "response_time_seconds", "risk_level", "timestamp"]
        )

    # ── Evaluations ───────────────────────────────────────────────────────────
    def store_evaluation(
        self,
        question_id: str,
        system_type: str,
        relevance: int,
        helpfulness: int,
        faithfulness: int,
        safety: int,
        clarity: int,
        unsafe_flag: bool = False,
        comments: str = "",
    ):
        # Prevent duplicates by updating if it already exists in self.evaluations
        existing_idx = -1
        for i, ev in enumerate(self.evaluations):
            if ev.get("question_id") == question_id and ev.get("system_type") == system_type:
                existing_idx = i
                break
                
        eval_data = {
            "question_id": question_id,
            "system_type": system_type,
            "relevance_score": relevance,
            "helpfulness_score": helpfulness,
            "faithfulness_score": faithfulness,
            "safety_score": safety,
            "clarity_score": clarity,
            "unsafe_flag": unsafe_flag,
            "comments": comments,
            "timestamp": datetime.now().isoformat(),
        }
        
        if existing_idx >= 0:
            self.evaluations[existing_idx] = eval_data
        else:
            self.evaluations.append(eval_data)
            
        # Automatically save to disk
        self.save_evaluations_to_disk()

    def save_evaluations_to_disk(self):
        with self.lock:
            df = self.export_evaluations_df()
            os.makedirs(os.path.dirname(self.evaluations_file), exist_ok=True)
            df.to_csv(self.evaluations_file, index=False, encoding="utf-8-sig")
            try:
                excel_path = self.evaluations_file.replace(".csv", ".xlsx")
                df.to_excel(excel_path, index=False)
            except Exception as e:
                print(f"Error saving evaluations Excel file: {e}")

    def get_all_evaluations(self) -> List[Dict[str, Any]]:
        return self.evaluations

    def export_evaluations_df(self) -> pd.DataFrame:
        if not self.evaluations:
            return pd.DataFrame(columns=[
                "question_id", "system_type", "relevance_score", "helpfulness_score",
                "faithfulness_score", "safety_score", "clarity_score", "unsafe_flag", "comments", "timestamp"
            ])
        return pd.DataFrame(self.evaluations)

    # ── Analytics ─────────────────────────────────────────────────────────────
    def get_analytics(self) -> Dict[str, Any]:
        total_questions = len(self.responses)

        # Calculate averages from evaluations
        s1_evals = [e for e in self.evaluations if e["system_type"] == "S1"]
        s2_evals = [e for e in self.evaluations if e["system_type"] == "S2"]
        s0_evals = [e for e in self.evaluations if e["system_type"] == "S0"]

        def avg(lst, key):
            vals = [e[key] for e in lst if key in e]
            return round(sum(vals) / len(vals), 2) if vals else 0.0

        # Response times
        all_times = []
        for data in self.responses.values():
            for sys_type in ["S0", "S1", "S2"]:
                if sys_type in data:
                    t = data[sys_type].get("response_time", 0)
                    if t:
                        all_times.append(t)
        avg_response_time = round(sum(all_times) / len(all_times), 3) if all_times else 0.0

        return {
            "total_questions": total_questions,
            "total_evaluations": len(self.evaluations),
            "s0_metrics": {
                "avg_relevance": avg(s0_evals, "relevance_score"),
                "avg_helpfulness": avg(s0_evals, "helpfulness_score"),
                "avg_faithfulness": avg(s0_evals, "faithfulness_score"),
                "avg_safety": avg(s0_evals, "safety_score"),
                "avg_clarity": avg(s0_evals, "clarity_score"),
            },
            "s1_metrics": {
                "avg_relevance": avg(s1_evals, "relevance_score"),
                "avg_helpfulness": avg(s1_evals, "helpfulness_score"),
                "avg_faithfulness": avg(s1_evals, "faithfulness_score"),
                "avg_safety": avg(s1_evals, "safety_score"),
                "avg_clarity": avg(s1_evals, "clarity_score"),
            },
            "s2_metrics": {
                "avg_relevance": avg(s2_evals, "relevance_score"),
                "avg_helpfulness": avg(s2_evals, "helpfulness_score"),
                "avg_faithfulness": avg(s2_evals, "faithfulness_score"),
                "avg_safety": avg(s2_evals, "safety_score"),
                "avg_clarity": avg(s2_evals, "clarity_score"),
            },
            "avg_response_time": avg_response_time,
            "risk_distribution": dict(self.risk_counts),
        }
