import json
import os
import zipfile

transcript_path = r'C:\Users\lpk naidu\.gemini\antigravity\brain\3065252d-3bf5-45e6-a985-f7f2675104f3\.system_generated\logs\transcript_full.jsonl'
with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if i + 1 == 4555:
            data = json.loads(line)
            content = data.get('content', '')
            
# Find start and end of CONTENT_COVERAGE_MAP.md
start_token = "cat > /mnt/user-data/outputs/CONTENT_COVERAGE_MAP.md << 'EOF'\n"
end_token = "\nEOF"

s_idx = content.find(start_token)
if s_idx != -1:
    map_text = content[s_idx + len(start_token):]
    e_idx = map_text.find(end_token)
    if e_idx != -1:
        map_text = map_text[:e_idx]
else:
    map_text = content

target_path = r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\outputs\CONTENT_COVERAGE_MAP.md'
docs_path = r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\docs\CONTENT_COVERAGE_MAP.md'

os.makedirs(os.path.dirname(target_path), exist_ok=True)
os.makedirs(os.path.dirname(docs_path), exist_ok=True)

with open(target_path, 'w', encoding='utf-8') as f:
    f.write(map_text)

with open(docs_path, 'w', encoding='utf-8') as f:
    f.write(map_text)

lines = map_text.strip().split('\n')
print(f"Coverage map written: {len(lines)} lines ({len(map_text)} bytes)")

outputs_dir = r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\outputs'

# Update FinanceHub_Phase9_ContentPack.zip
p9_zip_path = os.path.join(outputs_dir, 'FinanceHub_Phase9_ContentPack.zip')
p9_files = ['phase9_lessons.sql', 'case_studies_expansion.sql', 'concepts_careers_videos.sql', 'CONTENT_COVERAGE_MAP.md']
with zipfile.ZipFile(p9_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for f in p9_files:
        fp = os.path.join(outputs_dir, f)
        if os.path.exists(fp):
            zipf.write(fp, arcname=f)

p9_size = os.path.getsize(p9_zip_path)
print(f"=== Phase 9 Content Pack Zip ===")
print(f"Created {p9_zip_path} ({p9_size} bytes / {p9_size/1024:.1f} KB)")

# Update FinanceHub_COMPLETE_FINAL.zip
master_zip_path = os.path.join(outputs_dir, 'FinanceHub_COMPLETE_FINAL.zip')
all_files = []
for root, dirs, files in os.walk(outputs_dir):
    for file in files:
        if file not in ['FinanceHub_COMPLETE_FINAL.zip', 'FinanceHub_Phase9_ContentPack.zip', 'FinanceHub_Remaining_Pack.zip']:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, outputs_dir)
            all_files.append((full_path, rel_path))

with zipfile.ZipFile(master_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for full_p, rel_p in all_files:
        zipf.write(full_p, arcname=rel_p)

master_size = os.path.getsize(master_zip_path)
print(f"\n=== FINAL MASTER ZIP ===")
print(f"Packaged {len(all_files)} files into {master_zip_path} ({master_size} bytes / {master_size/1024/1024:.2f} MB)")

with zipfile.ZipFile(master_zip_path, 'r') as zipf:
    infolist = zipf.infolist()
    print(f"Master zip contains {len(infolist)} entries.")
    for info in infolist[-5:]:
        print(f"  {info.file_size:8d}  {info.date_time}   {info.filename}")
