import os
import zipfile

outputs_dir = r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\outputs'
sitemap_pack_path = os.path.join(outputs_dir, 'FinanceHub_SiteMap_Pack.zip')

files_to_pack = [
    'sitemap_guide_page.tsx',
    'sitemap_navigation.sql'
]

with zipfile.ZipFile(sitemap_pack_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for filename in files_to_pack:
        filepath = os.path.join(outputs_dir, filename)
        if os.path.exists(filepath):
            zipf.write(filepath, arcname=filename)
            print(f"Added: {filename}")
        else:
            print(f"WARNING: {filename} not found!")

pack_size = os.path.getsize(sitemap_pack_path)
print(f"=== FinanceHub_SiteMap_Pack.zip ===")
print(f"Created archive: {sitemap_pack_path} ({pack_size} bytes / {pack_size/1024:.2f} KB)")
