import os
import re

def fix_sql_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The file has:
    # DO $PHASE10$
    # BEGIN
    # ...
    # DO $HINDI$
    # DECLARE hi_id UUID;
    # BEGIN
    # ...
    # END $HINDI$;
    # ...
    # END $PHASE10$;
    
    # In PL/pgSQL, nesting a DO block inside a DO block is invalid SQL.
    # We can fix this by making it a single DO $PHASE10$ block with DECLARE hi_id UUID; at top.
    
    # Replace the inner DO $HINDI$ DECLARE hi_id UUID; BEGIN ... END $HINDI$; with sub-block or direct code
    
    # 1. Add DECLARE hi_id UUID; at the top of DO $PHASE10$
    content = content.replace('DO $PHASE10$\nBEGIN', 'DO $PHASE10$\nDECLARE\n  hi_id UUID;\nBEGIN')
    content = content.replace('DO $PHASE10$\r\nBEGIN', 'DO $PHASE10$\r\nDECLARE\r\n  hi_id UUID;\r\nBEGIN')
    
    # 2. Remove inner DO $HINDI$ and DECLARE hi_id UUID; and inner BEGIN / END $HINDI$;
    content = content.replace('DO $HINDI$\nDECLARE hi_id UUID;\nBEGIN', '-- ── HINDI LESSONS EXPANSION ──')
    content = content.replace('DO $HINDI$\r\nDECLARE hi_id UUID;\r\nBEGIN', '-- ── HINDI LESSONS EXPANSION ──')
    
    content = content.replace('END $HINDI$;', '-- ── END HINDI LESSONS ──')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

targets = [
    r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\sql\phase10_cases_hindi.sql',
    r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\sql\phase10\phase10_cases_hindi.sql',
    r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\outputs\phase10_cases_hindi.sql'
]

for t in targets:
    if os.path.exists(t):
        fix_sql_file(t)
        print(f"Fixed PL/pgSQL structure in {t}")
