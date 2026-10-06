import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open('sql/phase10_cases_hindi.sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

toggles = []
in_sq = False

for idx, line in enumerate(lines):
    i = 0
    L = len(line)
    while i < L:
        if line[i] == "'":
            if i + 1 < L and line[i+1] == "'":
                i += 2
                continue
            else:
                in_sq = not in_sq
                toggles.append((idx + 1, in_sq, line.strip()[:60]))
                i += 1
        else:
            i += 1

print(f"Total toggles: {len(toggles)}")
print(f"Final state: {in_sq}")

for t in toggles[-30:]:
    print(f"Line {t[0]:4d} | State: {t[1]!s:5s} | Snippet: {t[2]}")
