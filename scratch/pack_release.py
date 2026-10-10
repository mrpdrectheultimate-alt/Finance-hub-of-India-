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
    "FeedbackButton.tsx",
    "feedback_api_route.ts",
]

delivery_zip_path = os.path.join(outputs_dir, "FinanceHub_FinalDelivery_Pack.zip")
with zipfile.ZipFile(delivery_zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for fname in delivery_files:
        fpath = os.path.join(outputs_dir, fname)
        if os.path.exists(fpath):
            zf.write(fpath, arcname=fname)

# 3. Build FinanceHub_Feedback_Pack.zip
feedback_pack_files = [
    "FeedbackButton.tsx",
    "feedback_api_route.ts",
]
feedback_zip_path = os.path.join(outputs_dir, "FinanceHub_Feedback_Pack.zip")
with zipfile.ZipFile(feedback_zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for fname in feedback_pack_files:
        fpath = os.path.join(outputs_dir, fname)
        if os.path.exists(fpath):
            zf.write(fpath, arcname=fname)

# Output summary
print("=== File sizes ===")
fb_btn_path = os.path.join(outputs_dir, "FeedbackButton.tsx")
fb_api_path = os.path.join(outputs_dir, "feedback_api_route.ts")

with open(fb_btn_path, 'r', encoding='utf-8') as f:
    fb_btn_lines = len(f.readlines())
with open(fb_api_path, 'r', encoding='utf-8') as f:
    fb_api_lines = len(f.readlines())

print(f"-rw-r--r-- 1 claude ubuntu {os.path.getsize(fb_btn_path)/1024:.1f}K FeedbackButton.tsx")
print(f"-rw-r--r-- 1 claude ubuntu {os.path.getsize(fb_api_path)/1024:.1f}K feedback_api_route.ts")
print(f"  {fb_btn_lines} FeedbackButton.tsx")
print(f"  {fb_api_lines} feedback_api_route.ts")
print(f"  {fb_btn_lines + fb_api_lines} total")

print("\n=== Build Feedback Pack ===")
print(f"-rw-r--r-- 1 claude ubuntu {os.path.getsize(feedback_zip_path)/1024:.1f}K FinanceHub_Feedback_Pack.zip")

print("\n=== MASTER FINAL ===")
master_size = os.path.getsize(zip_path)
print(f"-rw-r--r-- 1 claude ubuntu {master_size // 1024}K FinanceHub_COMPLETE_FINAL.zip")
with zipfile.ZipFile(zip_path, 'r') as zf:
    master_files = zf.namelist()
    last_file = master_files[-1]
    last_info = zf.getinfo(last_file)
    print(f"     {last_info.file_size}  {last_file}")
    print("---------                     -------")
    total_uncompressed = sum(info.file_size for info in zf.infolist())
    print(f"  {total_uncompressed}                     {len(master_files)} files")

print("\n=== VERIFY ===")
with zipfile.ZipFile(zip_path, 'r') as zf:
    zipped_files = set(zf.namelist())
missing = set(files_to_pack) - zipped_files
if not missing:
    print("SUCCESS: All files in master zip")
else:
    print(f"Missing: {missing}")
