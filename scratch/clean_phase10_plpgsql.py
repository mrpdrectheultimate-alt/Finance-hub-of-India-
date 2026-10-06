import os

def clean_p10_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Standardize line endings to \n
    content = content.replace('\r\n', '\n')

    # 2. Fix outer DO $PHASE10$ DECLARE block
    content = content.replace(
        "DO $PHASE10$\nDECLARE\n  hi_id UUID;\nBEGIN",
        "DO $PHASE10$\nDECLARE\n  hi_id UUID;\nBEGIN"
    )
    if "DO $PHASE10$\nBEGIN" in content:
        content = content.replace("DO $PHASE10$\nBEGIN", "DO $PHASE10$\nDECLARE\n  hi_id UUID;\nBEGIN")

    # 3. Remove inner DO $HINDI$ ... BEGIN
    # Find DO $HINDI$ up to BEGIN and replace with comment
    import re
    content = re.sub(
        r'DO \$HINDI\$\s*\n\s*DECLARE hi_id UUID;\s*\n\s*BEGIN',
        '-- ── HINDI LESSONS INSERTS ──\n  SELECT id INTO hi_id FROM levels WHERE slug=\'absolute-beginner\' LIMIT 1;\n  IF hi_id IS NULL THEN SELECT id INTO hi_id FROM levels LIMIT 1; END IF;',
        content
    )
    
    # Remove duplicate hi_id select if any
    content = content.replace(
        "-- ── HINDI LESSONS INSERTS ──\n  SELECT id INTO hi_id FROM levels WHERE slug='absolute-beginner' LIMIT 1;\n  IF hi_id IS NULL THEN SELECT id INTO hi_id FROM levels LIMIT 1; END IF;\n\nDO $HINDI$\nDECLARE hi_id UUID;\nBEGIN\n  SELECT id INTO hi_id FROM levels WHERE slug='absolute-beginner' LIMIT 1;\n  IF hi_id IS NULL THEN SELECT id INTO hi_id FROM levels LIMIT 1; END IF;",
        "-- ── HINDI LESSONS INSERTS ──\n  SELECT id INTO hi_id FROM levels WHERE slug='absolute-beginner' LIMIT 1;\n  IF hi_id IS NULL THEN SELECT id INTO hi_id FROM levels LIMIT 1; END IF;"
    )

    # 4. Remove END $HINDI$; or -- ── END HINDI LESSONS ──
    content = content.replace("END $HINDI$;", "-- ── END HINDI LESSONS ──")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

targets = [
    r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\sql\phase10_cases_hindi.sql',
    r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\sql\phase10\phase10_cases_hindi.sql',
    r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\outputs\phase10_cases_hindi.sql'
]

for t in targets:
    if os.path.exists(t):
        clean_p10_file(t)
        print(f"Cleaned {t}")
