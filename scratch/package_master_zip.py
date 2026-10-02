import os, zipfile

outputs_dir = 'outputs'
zip_path = os.path.join(outputs_dir, 'FinanceHub_COMPLETE_FINAL.zip')

# Remove existing zip if present to build fresh
if os.path.exists(zip_path):
    os.remove(zip_path)

files_to_zip = []
for root, dirs, files in os.walk(outputs_dir):
    for f in files:
        if f != 'FinanceHub_COMPLETE_FINAL.zip':
            full_path = os.path.join(root, f)
            files_to_zip.append((full_path, f))

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for full_path, arcname in files_to_zip:
        zipf.write(full_path, arcname=arcname)

zip_size = os.path.getsize(zip_path)
print(f"Packaged {len(files_to_zip)} files into {zip_path} ({zip_size} bytes / {zip_size/1024:.1f} KB)")
