import shutil, os

src = 'scratch/landing_page_clean.tsx'
dst1 = 'app/page.tsx'
dst2 = 'outputs/landing_page_new.tsx'

os.makedirs('outputs', exist_ok=True)

with open(src, 'r', encoding='utf-8') as f:
    content = f.read()

with open(dst1, 'w', encoding='utf-8') as f:
    f.write(content)

with open(dst2, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Copied landing page ({len(content.splitlines())} lines, {len(content)} bytes) to:")
print(f" - {dst1}")
print(f" - {dst2}")
