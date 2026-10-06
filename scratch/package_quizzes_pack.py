import os
import zipfile

outputs_dir = r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\outputs'

# Build FinanceHub_Phase10_ContentPack.zip with phase9_10_quizzes.sql included
p10_zip_path = os.path.join(outputs_dir, 'FinanceHub_Phase10_ContentPack.zip')
if os.path.exists(p10_zip_path):
    os.remove(p10_zip_path)

p10_files = [
    'phase10_cases_hindi.sql',
    'phase9_10_quizzes.sql',
    'phase9_lessons.sql',
    'case_studies_expansion.sql',
    'concepts_careers_videos.sql',
    'CONTENT_COVERAGE_MAP.md'
]

with zipfile.ZipFile(p10_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for f in p10_files:
        fp = os.path.join(outputs_dir, f)
        if os.path.exists(fp):
            zipf.write(fp, arcname=f)

p10_size = os.path.getsize(p10_zip_path)
print(f"=== Phase 10 Content Pack Zip ===")
print(f"Created {p10_zip_path} ({p10_size} bytes / {p10_size/1024:.1f} KB)")

# Update FinanceHub_COMPLETE_FINAL.zip
master_zip_path = os.path.join(outputs_dir, 'FinanceHub_COMPLETE_FINAL.zip')
all_files = []
for root, dirs, files in os.walk(outputs_dir):
    for file in files:
        if file not in ['FinanceHub_COMPLETE_FINAL.zip', 'FinanceHub_Phase10_ContentPack.zip', 'FinanceHub_Phase9_ContentPack.zip', 'FinanceHub_Remaining_Pack.zip']:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, outputs_dir)
            all_files.append((full_path, rel_path))

with zipfile.ZipFile(master_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for full_p, rel_p in all_files:
        zipf.write(full_p, arcname=rel_p)

master_size = os.path.getsize(master_zip_path)
print(f"\n=== FINAL MASTER ZIP ===")
print(f"Packaged {len(all_files)} files into {master_zip_path} ({master_size} bytes / {master_size/1024/1024:.2f} MB)")
