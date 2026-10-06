import os
import shutil
import zipfile

outputs_dir = 'outputs'
os.makedirs(outputs_dir, exist_ok=True)

# Sources to outputs mapping
copy_map = {
    'app/signup/page.tsx': 'outputs/signup_page.tsx',
    'scratch/step_4051.txt': 'outputs/misc_pages.tsx',
    'app/api/stripe-webhook/route.ts': 'outputs/stripe_webhook_route.ts',
    'app/api/generate-certificate/route.ts': 'outputs/generate_certificate_route.ts',
    'components/layout/Navbar.tsx': 'outputs/Navbar.tsx',
    'components/layout/Footer.tsx': 'outputs/Footer.tsx',
    'sql/gamification.sql': 'outputs/gamification.sql',
    'sql/community_career.sql': 'outputs/community_career.sql',
    'scratch/final_missing_pages.tsx': 'outputs/final_missing_pages.tsx',
}

for src, dst in copy_map.items():
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"Copied {src} -> {dst}")
    else:
        print(f"WARNING: Source {src} does not exist")

remaining_files = [
    'signup_page.tsx',
    'misc_pages.tsx',
    'stripe_webhook_route.ts',
    'generate_certificate_route.ts',
    'Navbar.tsx',
    'Footer.tsx',
    'gamification.sql',
    'community_career.sql',
    'final_missing_pages.tsx'
]

print("\n=== File sizes ===")
for f in remaining_files:
    fp = os.path.join(outputs_dir, f)
    if os.path.exists(fp):
        size = os.path.getsize(fp)
        print(f" - {f:30s}: {size:8d} bytes ({size/1024:.1f} KB)")

print("\n=== Line counts ===")
total_lines = 0
for f in remaining_files:
    fp = os.path.join(outputs_dir, f)
    if os.path.exists(fp):
        with open(fp, 'r', encoding='utf-8', errors='ignore') as file:
            lines = len(file.readlines())
            total_lines += lines
            print(f"   {lines:5d}  {f}")
print(f"   {total_lines:5d}  total")

# Build FinanceHub_Remaining_Pack.zip
rem_zip_path = os.path.join(outputs_dir, 'FinanceHub_Remaining_Pack.zip')
if os.path.exists(rem_zip_path):
    os.remove(rem_zip_path)

with zipfile.ZipFile(rem_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for f in remaining_files:
        fp = os.path.join(outputs_dir, f)
        if os.path.exists(fp):
            zipf.write(fp, arcname=f)

rem_zip_size = os.path.getsize(rem_zip_path)
print(f"\n=== Build Remaining Pack zip ===")
print(f"Created {rem_zip_path} ({rem_zip_size} bytes / {rem_zip_size/1024:.1f} KB)")

# Update FinanceHub_COMPLETE_FINAL.zip
master_zip_path = os.path.join(outputs_dir, 'FinanceHub_COMPLETE_FINAL.zip')

# Collect all files in outputs to zip into FinanceHub_COMPLETE_FINAL.zip
all_files = []
for root, dirs, files in os.walk(outputs_dir):
    for file in files:
        if file not in ['FinanceHub_COMPLETE_FINAL.zip', 'FinanceHub_Phase10_ContentPack.zip', 'FinanceHub_Phase9_ContentPack.zip', 'FinanceHub_Remaining_Pack.zip']:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, outputs_dir)
            all_files.append((full_path, rel_path))

if os.path.exists(master_zip_path):
    os.remove(master_zip_path)

with zipfile.ZipFile(master_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for full_p, rel_p in all_files:
        zipf.write(full_p, arcname=rel_p)

master_zip_size = os.path.getsize(master_zip_path)
print(f"\n=== Update COMPLETE FINAL zip ===")
print(f"Packaged {len(all_files)} files into {master_zip_path} ({master_zip_size} bytes / {master_zip_size/1024/1024:.2f} MB)")
