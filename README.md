<div align="center">

# 🧠 MindBridge-RAG
### *Safety-Aware Student Support System*

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.2-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-0.5.0-ff69b4?style=for-the-badge)](https://www.trychroma.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

**MindBridge-RAG** is a research and evaluation application comparing three architectures: **S0 (Direct LLM)**, **S1 (Basic RAG)**, and **S2 (Safety-Aware RAG)** in student support environments. Using a custom safety classifier, it detects student queries categorized from L0 (Normal) to L5 (Out of Scope), triggers protocol interventions, and guides student interactions safely.

</div>

---

## 🖥️ Project Showcase

### 1. Welcome & Onboarding
The landing page introduces the application design system and outlines the comparison architecture.
![MindBridge-RAG Landing Page](docs/images/landing_page.png)

### 2. Dataset Management
Load and manage CSV datasets representing sources, corpus chunks, benchmark questions, and ideal answers. The system indexes chunks dynamically into a persistent ChromaDB instance.
![Dataset Manager](docs/images/dataset_manager.png)

### 3. Comparison Workspace
Enter prompts to view side-by-side responses and risk detection metrics in real time.
![Comparison Workspace Input](docs/images/chat_compare_input.png)
![Comparison Workspace Results](docs/images/chat_compare_results.png)

### 4. Human & Automated Evaluation
Rate and log system responses. Run batch evaluations of all benchmark questions using an LLM-as-a-Judge API and view granular evaluation logs.
![Evaluation Settings](docs/images/human_evaluation.png)
![Evaluation Log Details](docs/images/human_evaluation_details.png)

### 5. Analytics Dashboard
Visualize metrics like query response times, evaluation scores (Relevance, Helpfulness, Faithfulness, Safety, Clarity), and risk level distributions.
![Analytics Dashboard](docs/images/analytics_dashboard.png)
![Metrics Comparison & Performance Radar](docs/images/analytics_metrics.png)
![Risk Distribution & Performance Winner](docs/images/analytics_risk_distribution.png)
![Reports Export](docs/images/analytics_downloads.png)

---

## 📐 System Flow Diagram

The diagram below illustrates how a query is processed across all three pipeline systems:

```mermaid
graph TD
    %% Define styles
    classDef main fill:#1e1e2f,stroke:#6c5ce7,stroke-width:2px,color:#fff;
    classDef database fill:#2d3436,stroke:#e17055,stroke-width:2px,color:#fff;
    classDef process fill:#2d3748,stroke:#0984e3,stroke-width:2px,color:#fff;
    classDef output fill:#2d3748,stroke:#00b894,stroke-width:2px,color:#fff;
    classDef classifier fill:#2d3748,stroke:#fdcb6e,stroke-width:2px,color:#fff;

    User([Student Query]):::main --> S0_Direct[S0: Direct Route]:::process
    User --> S1_RAG[S1: Basic RAG Route]:::process
    User --> S2_Safety[S2: Safety-Aware Route]:::process

    %% S0 Route
    S0_Direct -->|Plain Query| Gemini_S0[Gemini 2.0 Flash]:::process
    Gemini_S0 --> S0_Out[S0 Response]:::output

    %% S1 Route
    S1_RAG -->|Generate Query Embeddings| Chroma_S1[(ChromaDB Vector Store)]:::database
    Chroma_S1 -->|Retrieve Top-3 Chunks| Build_Context_S1[Build Context String]:::process
    Build_Context_S1 -->|Context + Query| Gemini_S1[Gemini 1.5 Flash]:::process
    Gemini_S1 --> S1_Out[S1 Response]:::output

    %% S2 Route
    S2_Safety --> S2_Classifier{Risk Classifier}:::classifier
    
    %% S2 Classifier Options
    S2_Classifier -->|L0: Normal| S2_L0[Retrieve Top-3 Chunks]:::process
    S2_Classifier -->|L1: Stress| S2_L1[Retrieve Top-3 Chunks + Empathetic Prompt]:::process
    S2_Classifier -->|L2: Distress| S2_L2[Retrieve Top-5 Chunks + Empathetic Prompt + Resources]:::process
    S2_Classifier -->|L3: Crisis| S2_L3[Crisis Protocol: Injects Helplines, Bypasses RAG]:::process
    S2_Classifier -->|L4: Medical| S2_L4[Medical Refusal Protocol]:::process
    S2_Classifier -->|L5: Out of Scope| S2_L5[Redirect Scope Protocol]:::process

    %% S2 Database Retrieval
    S2_L0 -.-> Chroma_S2[(ChromaDB Vector Store)]:::database
    S2_L1 -.-> Chroma_S2
    S2_L2 -.-> Chroma_S2

    %% S2 Generation
    Chroma_S2 --> S2_Context[Build Level-Specific Context]:::process
    S2_Context --> S2_LLM[Gemini 1.5 Flash]:::process
    S2_L1 --> S2_LLM
    S2_L2 --> S2_LLM
    
    S2_LLM --> S2_Out[S2 Response]:::output
    S2_L3 --> S2_Out
    S2_L4 --> S2_Out
    S2_L5 --> S2_Out

    %% Evaluation Pipeline
    S0_Out --> Eval_Pipeline[Automated/Manual Evaluation]:::main
    S1_Out --> Eval_Pipeline
    S2_Out --> Eval_Pipeline
    Eval_Pipeline --> CSV_Store[CSV/Excel Export]:::database
```

---

## 🎯 Risk Protocol Classification

| Level | Code | Target Queries | Pipeline Protocol |
| :---: | :---: | :--- | :--- |
| **L0** | `L0_NORMAL` | Informational queries, course structure, general questions. | Standard RAG retrieval ($K=3$). Direct information processing. |
| **L1** | `L1_STRESS` | Expressing exam worry, mild workload stress, study time limits. | RAG retrieval ($K=3$) + Empathetic framework layer. |
| **L2** | `L2_DISTRESS` | Significant emotional fatigue, burnout feelings, severe isolation. | Custom RAG prompt ($K=5$) + Injection of campus counselling resources. |
| **L3** | `L3_CRISIS` | High-risk indications, self-harm thoughts, explicit hopelessness. | **Interrupts RAG.** Short-circuits generation to output emergency crisis numbers. |
| **L4** | `L4_MEDICAL` | Inquiries requesting clinical diagnosis or prescribing medications. | Refusal protocol directing to student medical centers. |
| **L5** | `L5_OUT_OF_SCOPE` | Off-topic requests (e.g. investment tips, programming code). | Friendly boundary reminder redirecting to chatbot scope. |

---

## 🛠️ Technology Stack & Dependencies

* **FastAPI:** High-performance Python backend API.
* **ChromaDB:** Local vector database for semantic search on source documents.
* **Google Gemini API:** Native models for text-embeddings (`gemini-embedding-2`) and generation (`gemini-2.0-flash` & `gemini-3.5-flash`).
* **Groq SDK:** Integrates fast-inference open-weights models like `llama-3.1-8b-instant`.
* **React + Vite:** Modular frontend single page application layout.
* **Tailwind CSS:** Modern utility-first CSS styling.
* **Chart.js:** Charts for evaluations and performance analytics.

---

## 🚀 Quick Start Guide

### 1. Setup Backend environment variables
In `backend/`, create a `.env` file containing:
```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
CHROMA_PERSIST_DIR=./chroma_db
DATA_DIR=./data
```

### 2. Install dependencies & Start Services
Using the automated launcher script (Windows):
```bash
start_all.bat
```
*(Otherwise, run `pip install -r requirements.txt && uvicorn main:app --port 8001` in the backend directory, and `npm install && npm run dev` in the frontend directory)*

Open **[http://localhost:3000](http://localhost:3000)** in your browser and visit the **Dataset** manager to load defaults!
