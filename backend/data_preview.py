import pandas as pd, warnings
warnings.filterwarnings('ignore')
df = pd.read_csv('data/3_benchmark_questions.csv', encoding='utf-8-sig')
# Show all unique risk levels
print("=== ALL QUESTIONS BY RISK LEVEL ===")
for level in ['L0','L1','L2','L3','L4','L5']:
    subset = df[df['Expected_Risk_Level'] == level]
    print(f"\n--- {level} ({len(subset)} questions) ---")
    for _, r in subset.head(3).iterrows():
        print(f"  {r['User_Question']}")
