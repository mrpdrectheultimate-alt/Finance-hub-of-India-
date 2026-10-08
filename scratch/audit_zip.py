import os
import zipfile

outputs_dir = r"c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\outputs"

# 1. Rebuild FinanceHub_COMPLETE_FINAL.zip
zip_path = os.path.join(outputs_dir, "FinanceHub_COMPLETE_FINAL.zip")
files_to_pack = [f for f in os.listdir(outputs_dir) if not f.endswith(".zip") and os.path.isfile(os.path.join(outputs_dir, f))]

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for fname in files_to_pack:
        fpath = os.path.join(outputs_dir, fname)
        zf.write(fpath, arcname=fname)

# 2. Build FinanceHub_FinalDelivery_Pack.zip
delivery_files = [
    "package.json",
    "og_image_route.tsx",
    "middleware.ts",
    "seo.ts",
    "email_templates.ts",
    "analytics.tsx",
    "Navbar.tsx",
    "Footer.tsx",
    "sitemap_guide_page.tsx",
    "sitemap_navigation.sql",
    "DEPLOY_CHECKLIST.md",
    "FINANCEHUB_FINAL_STATE.md",
    "CONTENT_COVERAGE_MAP.md",
]

delivery_zip_path = os.path.join(outputs_dir, "FinanceHub_FinalDelivery_Pack.zip")
with zipfile.ZipFile(delivery_zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for fname in delivery_files:
        fpath = os.path.join(outputs_dir, fname)
        if os.path.exists(fpath):
            zf.write(fpath, arcname=fname)

# 3. Audit master zip
with zipfile.ZipFile(zip_path, 'r') as zf:
    namelist = sorted(zf.namelist())

print("=== FINAL COMPLETE AUDIT ===")
print("")
print("--- Master zip contents ---")
for f in namelist:
    print(f)

sql_count = sum(1 for f in namelist if f.endswith('.sql'))
tsx_count = sum(1 for f in namelist if f.endswith('.tsx'))
ts_count  = sum(1 for f in namelist if f.endswith('.ts') and not f.endswith('.tsx'))
other_count = len(namelist) - (sql_count + tsx_count + ts_count)

print("")
print("--- Total counts ---")
print(f"Total files: {len(namelist)}")
print(f"SQL files:   {sql_count}")
print(f"TSX files:   {tsx_count}")
print(f"TS files:    {ts_count}")
print(f"Other:       {other_count}")

missing = set(files_to_pack) - set(namelist)

print("")
print("--- Verify nothing missing ---")
if not missing:
    print("SUCCESS — zero files missing")
else:
    print(f"Missing: {sorted(list(missing))}")
