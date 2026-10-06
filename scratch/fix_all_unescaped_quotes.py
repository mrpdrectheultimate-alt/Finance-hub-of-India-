import os

targets = [
    r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\sql\phase10_cases_hindi.sql',
    r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\sql\phase10\phase10_cases_hindi.sql',
    r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\outputs\phase10_cases_hindi.sql'
]

for t in targets:
    if os.path.exists(t):
        with open(t, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace unescaped single quote in doesn't inside single-quoted block
        content = content.replace("doesn't", "doesn''t")
        
        with open(t, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Replaced doesn't -> doesn''t in {t}")
