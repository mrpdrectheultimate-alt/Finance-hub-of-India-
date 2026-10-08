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
    "DEPLOY_NOW.md",
    "WHICH_FILE_TO_USE.md",
]

delivery_zip_path = os.path.join(outputs_dir, "FinanceHub_FinalDelivery_Pack.zip")
with zipfile.ZipFile(delivery_zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for fname in delivery_files:
        fpath = os.path.join(outputs_dir, fname)
        if os.path.exists(fpath):
            zf.write(fpath, arcname=fname)
        else:
            print(f"Warning: {fname} missing from outputs/")

print("=== FINAL VERIFIED STATE ===")
master_size = os.path.getsize(zip_path)
with zipfile.ZipFile(zip_path, 'r') as zf:
    master_files = zf.namelist()
    print(f"Master zip files: {len(master_files)}")
    print(f"Master zip size:  {master_size // 1024}K")
    
    sql_count = sum(1 for f in master_files if f.endswith('.sql'))
    tsx_count = sum(1 for f in master_files if f.endswith('.tsx'))
    ts_count  = sum(1 for f in master_files if f.endswith('.ts') and not f.endswith('.tsx'))
    md_count  = sum(1 for f in master_files if f.endswith('.md'))
    cfg_count = sum(1 for f in master_files if any(f.endswith(ext) for ext in ['.json', '.js', '.css', '.txt', '.csv']))
    
    print(f"SQL files:  {sql_count}")
    print(f"TSX files:  {tsx_count}")
    print(f"TS files:   {ts_count}")
    print(f"MD docs:    {md_count}")
    print(f"Config:     {cfg_count}")
