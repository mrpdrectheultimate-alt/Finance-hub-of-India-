import os
import shutil
import zipfile

files_to_copy = [
    ("components/ui/Logo.tsx", "outputs/Logo.tsx"),
    ("app/login/page.tsx", "outputs/login_page.tsx"),
]

for src, dst in files_to_copy:
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"Copied {src} to {dst}")

out_dir = "outputs"
zip_final = os.path.join(out_dir, "FinanceHub_COMPLETE_FINAL.zip")
with zipfile.ZipFile(zip_final, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(out_dir):
        for file in files:
            if file.endswith('.zip'):
                continue
            fpath = os.path.join(root, file)
            arcname = os.path.relpath(fpath, out_dir)
            zf.write(fpath, arcname)

with zipfile.ZipFile(zip_final, 'r') as zf:
    print(f"FinanceHub_COMPLETE_FINAL.zip updated: {os.path.getsize(zip_final)} bytes, {len(zf.namelist())} files inside")
