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
]

delivery_zip_path = os.path.join(outputs_dir, "FinanceHub_FinalDelivery_Pack.zip")
with zipfile.ZipFile(delivery_zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for fname in delivery_files:
        fpath = os.path.join(outputs_dir, fname)
        if os.path.exists(fpath):
            zf.write(fpath, arcname=fname)
        else:
            print(f"Warning: {fname} missing from outputs/")

print("=== DEPLOY_NOW.md ===")
deploy_now_path = os.path.join(outputs_dir, "DEPLOY_NOW.md")
with open(deploy_now_path, "r", encoding="utf-8") as f:
    lines = f.readlines()
print(f"{len(lines)} DEPLOY_NOW.md")
print(f"Size: {os.path.getsize(deploy_now_path)} bytes")

print("\n=== FINAL MASTER ZIP ===")
master_size = os.path.getsize(zip_path)
print(f"FinanceHub_COMPLETE_FINAL.zip: {master_size} bytes")
with zipfile.ZipFile(zip_path, 'r') as zf:
    master_files = zf.namelist()
    print(f"Total files in master zip: {len(master_files)}")

print("\n=== DELIVERY PACK ===")
deliv_size = os.path.getsize(delivery_zip_path)
print(f"FinanceHub_FinalDelivery_Pack.zip: {deliv_size} bytes")
with zipfile.ZipFile(delivery_zip_path, 'r') as zf:
    deliv_files = zf.namelist()
    print(f"Total files in delivery pack: {len(deliv_files)}")
