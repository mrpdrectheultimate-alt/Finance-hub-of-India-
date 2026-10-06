import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open('sql/phase10_cases_hindi.sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'DO ' in line or 'BEGIN' in line or 'END' in line or 'PHASE10' in line or 'HINDI' in line:
        print(f"Line {idx+1}: {line.strip()[:80]}")
