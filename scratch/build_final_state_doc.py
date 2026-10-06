import json
import os
import zipfile

transcript_path = r'C:\Users\lpk naidu\.gemini\antigravity\brain\3065252d-3bf5-45e6-a985-f7f2675104f3\.system_generated\logs\transcript_full.jsonl'
with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if i + 1 == 4778:
            data = json.loads(line)
            content = data.get('content', '')
            start_marker = "cat > /mnt/user-data/outputs/FINANCEHUB_FINAL_STATE.md << 'EOF'\n"
            end_marker = "\nEOF"
            s_idx = content.find(start_marker)
            if s_idx != -1:
                doc_text = content[s_idx + len(start_marker):]
                e_idx = doc_text.find(end_marker)
                if e_idx != -1:
                    doc_text = doc_text[:e_idx]
            else:
                doc_text = content

outputs_dir = r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\outputs'
docs_dir = r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\docs'

os.makedirs(outputs_dir, exist_ok=True)
os.makedirs(docs_dir, exist_ok=True)

out_file = os.path.join(outputs_dir, 'FINANCEHUB_FINAL_STATE.md')
doc_file = os.path.join(docs_dir, 'FINANCEHUB_FINAL_STATE.md')

with open(out_file, 'w', encoding='utf-8') as f:
    f.write(doc_text)

with open(doc_file, 'w', encoding='utf-8') as f:
    f.write(doc_text)

lines = doc_text.strip().split('\n')
print(f"Wrote FINANCEHUB_FINAL_STATE.md: {len(lines)} lines ({len(doc_text)} bytes)")

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
print(f"\n=== TRULY FINAL MASTER ===")
print(f"Packaged {len(all_files)} files into {master_zip_path} ({master_size} bytes / {master_size/1024/1024:.2f} MB)")

with zipfile.ZipFile(master_zip_path, 'r') as zipf:
    infolist = zipf.infolist()
    print(f"Master zip contains {len(infolist)} entries.")
    for info in infolist[-5:]:
        print(f"  {info.file_size:8d}  {info.date_time}   {info.filename}")
