import os
import shutil
import zipfile

src = "app/explore/page.tsx"
dst = "outputs/explore_page.tsx"

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
print("Updated FinanceHub_COMPLETE_FINAL.zip with explore_page.tsx.")
