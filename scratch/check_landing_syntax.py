import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/landing_page_clean.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()

print(f"Total lines: {len(lines)}")
print("\n--- FIRST 15 LINES ---")
for l in lines[:15]:
    print(l)

print("\n--- LAST 15 LINES ---")
for l in lines[-15:]:
    print(l)

open_curly = text.count('{')
close_curly = text.count('}')
open_paren = text.count('(')
close_paren = text.count(')')

print(f"\nBrace counts -> {{: {open_curly}, }}: {close_curly}")
print(f"Paren counts -> (: {open_paren}, ): {close_paren}")
