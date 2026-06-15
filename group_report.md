# Group Report: MindBridge-RAG

## Group Information

**Group ID:** G3
**Assigned Topic:** Procrastination
**University:** UMT Sialkot Campus
**Subject:** Cloud Computing (Mam Zahra)
**Program:** BSCS 8th Semester

## Members

1. **Saqib Azair** | Roll No: 23018020004 | Role: Group Leader, Frontend,Backend Developer,UI Design & Integration + RAG Integration
2. **Ateeb Afzal** | Roll No: 23018020022 | Role: Documentation
3. **Hiba Zari Nadeem** | Roll No: 23018020013 | Role: Corpus Writer, Research, Source Finder
4. **Shahbano** | Roll No: 23018020017 | Role: Question Writer, Dataset Preparation, Testing & Evaluation

## 1. Topic Summary

Procrastination is one of the most common academic and behavioral challenges faced by university students. It is defined as the voluntary delay of an intended course of action despite expecting to be worse off for the delay. Among university students, it manifests as postponing exam preparation, delaying assignment submissions, and avoiding challenging academic tasks. The effects range from acute stress, anxiety, and academic motivation decline, to severe burnout, feelings of hopelessness, and risk of course failure. 

Addressing student procrastination is highly relevant to student wellbeing because it directly impacts academic adjustment, self-esteem, and mental health during their university journey. Providing safe, non-clinical, and structured guidance via a safety-aware RAG chatbot aligns directly with the MindBridge project's mission to offer timely and safe digital interventions.

## 2. Sources Used

| Source ID | Source Title | Source Type | Why Used |
|---|---|---|---|
| A001 | What Is Procrastination? | Website Article (VeryWell Mind) | Used to understand definition, common causes, symptoms, and effects on students' daily functioning. |
| A002 | Procrastination, Time Management and Self Control Among Young Adults | Research Journal Article (The International Journal of Indian Psychology) | Used to gather evidence on the relationship between procrastination, time management skills, and self-control. |
| A003 | Procrastination and Stress: A Conceptual Review of Why Context Matters | Research Article (ResearchGate) | Used to explore how procrastination contributes to stress and how different contexts influence procrastination behaviors. |
| A004 | Academic Motivation, Procrastination, and Adjustment: Exploring Their Impact | Research Article (ResearchGate) | Used to understand the relationship between academic motivation, procrastination, and students' adjustment to academic demands. |
| A005 | Procrastination Among University Students: Differentiating Severe Cases in Need of Support From Less Severe Cases | Research Article (Frontiers) | Used to identify different levels of procrastination severity and understand when additional student support may be necessary. |

## 3. Corpus Summary

**Total corpus chunks created:** 80

The corpus covers six thematic categories relevant to student procrastination:
- **Understanding Procrastination** (chunks C001–C004): Definitions, psychological causes (fear of failure, perfectionism, low self-efficacy), and symptoms.
- **Academic Stress & Impact** (chunks C005–C008): The relationship between procrastination, academic motivation, and stress, including how it impacts adjustment to course workloads.
- **Time Management & Productivity** (chunks C009–C015): Strategies for setting goals, prioritizing tasks, scheduling study time, and breaking down large assignments.
- **Digital Distractions & Self-Discipline** (chunks C016–C020): Strategies for managing digital distractions, social media usage, fatigue, and developing self-discipline.
- **Support Resources & Burnout** (chunks C021–C029): Identifying severe academic fatigue (burnout), seeking teacher/peer assistance, and using university counseling resources.
- **L2/L3/L4/L5 Escalation Protocols** (chunks C030–C080): Risk-specific guidance, counseling hotlines (L3), medical referral boundaries (L4), and boundary redirection prompts (L5).

All chunks are 80–150 words, contain one clear idea, are written in safe student-friendly language, and are connected to one verified academic or wellbeing source.

## 4. Benchmark Questions Summary

**Total benchmark questions created:** 80 (20 per group member)

| Difficulty | Count |
|---|---:|
| Easy | 21 |
| Medium | 35 |
| Hard | 24 |

Questions span the full L0 to L5 risk spectrum including 15 L3_CRISIS cases (e.g. expressing deep hopelessness, feeling like a burden, passive/active self-harm indicators), 10 L4_MEDICAL cases (e.g. asking for pharmaceutical ADHD drugs, clinical anxiety diagnoses), and 15 L2_DISTRESS cases. All questions are synthetic and anonymous.

## 5. Risk Label Summary

| Risk Label | Count |
|---|---:|
| L0_NORMAL | 15 |
| L1_STRESS | 15 |
| L2_DISTRESS | 15 |
| L3_CRISIS | 15 |
| L4_MEDICAL | 10 |
| L5_OUT_OF_SCOPE | 10 |

The distribution reflects a balanced evaluation suite designed to thoroughly stress-test the safety-aware routing of the MindBridge architecture. It contains a significant proportion of high-risk (L2, L3) and boundary-defining (L4, L5) cases to ensure evaluation robustness.

## 6. Model Testing Summary

| System | Count Tested |
|---|---:|
| S0: Direct LLM (No RAG) | 63 |
| S1: Basic RAG | 62 |
| S2: Safety-Aware RAG | 61 |

*Note: S0, S1, and S2 testing counts represent the completed human evaluation records stored in our database (totaling 186 rows).*

## 7. Human Evaluation Summary

Each of the four group members evaluated chatbot responses across three systems (S0, S1, S2). A total of 186 evaluation records were submitted.

| Metric | S0 Average | S1 Average | S2 Average |
|---|---:|---:|---:|
| Relevance | 4.83 | 4.56 | 5.00 |
| Helpfulness | 4.40 | 3.74 | 5.00 |
| Faithfulness | 5.00 | 4.73 | 4.85 |
| Safety | 5.00 | 5.00 | 5.00 |
| Clarity | 4.84 | 4.52 | 4.98 |

**Unsafe flag count:** S0: 0, S1: 0, S2: 0

## 8. Key Observations

1. **S0 (Direct LLM):** Produced very articulate and direct responses but lacked grounding in verified campus resources. While it did not violate safety in terms of giving malicious advice, it lacked the structure of verified institutional resources and sometimes gave generic online recommendations.
2. **S1 (Basic RAG):** Suffered from slightly lower helpfulness (3.74) and clarity (4.52) compared to S0. This was due to context-stuffing where the model tried to force raw chunks into its response without proper empathetic phrasing or smooth transitions.
3. **S2 (Safety-Aware RAG):** Achieved perfect scores (5.00) in Relevance and Helpfulness, and near-perfect Clarity (4.98). The safety classifier successfully identified stress levels, prompting the generator to apply the appropriate empathetic tone and resources. 
4. **Crisis and Medical Safeguards:** For L3_CRISIS and L4_MEDICAL cases, S2 successfully bypassed LLM generation entirely, providing deterministic, hardcoded resources (crisis lines and student health center referrals), ensuring zero diagnostic or safety compliance failures.

## 9. Problems Faced

- **Groq API Rate Limits:** During batch auto-evaluation, we encountered several HTTP 429 rate limit exceptions when calling Llama-4 via the Groq API. We resolved this by implementing an exponential backoff retry mechanism inside `groq_client.py` and adding a fallback cascade of model endpoints.
- **Handling Unicode Formatting Errors:** Some of our Excel-exported CSV files contained zero-width characters (e.g., `\u2060` in source links), which caused `UnicodeEncodeError` in Windows environments. This was fixed by enforcing `utf-8-sig` encoding during CSV reading and reconfiguring standard outputs to UTF-8.
- **Distinguishing L1 Stress vs L2 Distress:** Defining clear boundaries between study workload stress (L1) and severe burnout or functional impairment (L2) required collaborative guidelines. We resolved this by using academic functional impairment (e.g., missing assignments, stop attending classes) as the primary indicator for L2.

## 10. Contribution to Final Paper

Group G3's Procrastination dataset contributes to the MindBridge-RAG paper in several ways:
- **Comprehensive Corpus:** Contributing 80 high-quality chunks covering academic motivation, self-regulation, time management, and university structures.
- **Safety Testing Harness:** Providing 15 crisis cases and 10 medical refusal cases that validate the deterministic safety routing of S2.
- **Evaluative Evidence:** Submitting 186 manual human evaluation rows, proving that the S2 architecture outperforms baseline and standard RAG models in student-oriented helpfulness and clarity.

## 11. Declaration

We confirm that:
- We did not include private real student stories.
- We did not include medical diagnosis or medication advice.
- We used safe, general, student-support content throughout.
- We followed the assigned CSV templates and risk-label format exactly.
- All corpus chunks are paraphrased from safe approved sources and are not copied verbatim.
- All benchmark questions are synthetic and anonymous.
