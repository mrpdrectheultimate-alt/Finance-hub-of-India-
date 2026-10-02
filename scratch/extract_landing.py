import sys

with open('scratch/step_3625.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('"use client";')
if pos == -1:
    pos = text.find('use client')

code = text[pos:]
if '</USER_REQUEST>' in code:
    code = code[:code.find('</USER_REQUEST>')]

code = code.strip()
lines = code.splitlines()

print(f"Length: {len(code)}, Lines: {len(lines)}")

with open('scratch/landing_page_extracted.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("FIRST 10 LINES:")
for l in lines[:10]:
    print(l)

print("\nLAST 10 LINES:")
for l in lines[-10:]:
    print(l)
