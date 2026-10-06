import os
import sys
import zipfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

outputs_dir = r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\outputs'
master_zip_path = os.path.join(outputs_dir, 'FinanceHub_COMPLETE_FINAL.zip')

# Collect all non-zip files in outputs
all_output_files = []
for root, dirs, files in os.walk(outputs_dir):
    for file in files:
        if not file.endswith('.zip'):
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, outputs_dir).replace('\\', '/')
            all_output_files.append((full_path, rel_path))

if os.path.exists(master_zip_path):
    os.remove(master_zip_path)

with zipfile.ZipFile(master_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for full_p, rel_p in all_output_files:
        zipf.write(full_p, arcname=rel_p)

master_size = os.path.getsize(master_zip_path)
print(f"=== TRULY FINAL MASTER ZIP ===")
print(f"Packaged {len(all_output_files)} files into {master_zip_path} ({master_size} bytes / {master_size/1024/1024:.2f} MB)")

# Verification: Compare outputs list against zip list with normalized forward slashes
with zipfile.ZipFile(master_zip_path, 'r') as zipf:
    zip_files = set([name.replace('\\', '/') for name in zipf.namelist()])

output_rel_files = set([rel_p for full_p, rel_p in all_output_files])
missing_in_zip = output_rel_files - zip_files

print("\n=== VERIFY: anything still missing? ===")
if not missing_in_zip:
    print("✅ Every file in outputs is in the master zip. Complete.")
else:
    print("Still missing:")
    for m in sorted(missing_in_zip):
        print(f" - {m}")
