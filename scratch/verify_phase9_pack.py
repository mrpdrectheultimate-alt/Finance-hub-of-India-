import os
import shutil
import zipfile

out_files = ['outputs/lesson_player.tsx', 'outputs/explore_page.tsx', 'outputs/dashboard_page.tsx']
for f in out_files:
    if os.path.exists(f):
        lines = len(open(f, encoding="utf-8", errors="replace").readlines())
        size = os.path.getsize(f)
        print(f"{f}: {size} bytes, {lines} lines")
    else:
        print(f"{f} MISSING")

# Ensure FinanceHub_Phase9_Pack.zip exists
zip_phase9 = 'outputs/FinanceHub_Phase9_Pack.zip'
with zipfile.ZipFile(zip_phase9, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in out_files:
        if os.path.exists(f):
            zf.write(f, os.path.basename(f))
print(f"Created {zip_phase9}: {os.path.getsize(zip_phase9)} bytes")

# Re-zip FinanceHub_COMPLETE_FINAL.zip
zip_final = 'outputs/FinanceHub_COMPLETE_FINAL.zip'
with zipfile.ZipFile(zip_final, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk('outputs'):
        for file in files:
            if file.endswith('.zip'):
                continue
            fpath = os.path.join(root, file)
            arcname = os.path.relpath(fpath, 'outputs')
            zf.write(fpath, arcname)

with zipfile.ZipFile(zip_final, 'r') as zf:
    print(f"FinanceHub_COMPLETE_FINAL.zip created: {os.path.getsize(zip_final)} bytes, {len(zf.namelist())} files inside")
