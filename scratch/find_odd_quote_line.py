import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open('sql/phase10_cases_hindi.sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Each INSERT statement starts with INSERT INTO or SELECT or DO.
# Let's count single quotes line by line and find which statement leaves an odd count of single quotes.

for idx, line in enumerate(lines):
    # count unescaped single quotes in line
    count = 0
    i = 0
    L = len(line)
    while i < L:
        if line[i] == "'":
            if i + 1 < L and line[i+1] == "'":
                i += 2
            else:
                count += 1
                i += 1
        else:
            i += 1
    
    if count % 2 != 0:
        print(f"Line {idx+1:4d} has ODD ({count}) single quotes: {line.strip()[:80]}")
