import os
import sys
import glob
import re
import zipfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def fix_alias_and_update():
    print("Fixing video_library alias and updating documentation...")

    view_sql = """
-- Alias view to support queries referencing video_library
CREATE OR REPLACE VIEW video_library AS
SELECT *, is_published AS is_active
FROM curated_playlists;
"""

    # Add view to video_library_complete.sql if not present
    for target in ["outputs/video_library_complete.sql", "sql/video_library_complete.sql"]:
        if os.path.exists(target):
            content = open(target, 'r', encoding='utf-8', errors='replace').read()
            if "CREATE OR REPLACE VIEW video_library" not in content:
                content += view_sql
                with open(target, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Added video_library view alias to {target}")

    # Update COMPLETE_SQL_RUN_ORDER.md query
    for md_file in ["outputs/COMPLETE_SQL_RUN_ORDER.md", "sql/COMPLETE_SQL_RUN_ORDER.md"]:
        if os.path.exists(md_file):
            content = open(md_file, 'r', encoding='utf-8', errors='replace').read()
            updated = content.replace("FROM video_library WHERE is_active = TRUE", "FROM curated_playlists WHERE is_published = TRUE")
            with open(md_file, 'w', encoding='utf-8') as f:
                f.write(updated)
            print(f"Updated query in {md_file}")

    # Re-zip
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
    print("Updated release zip package.")

if __name__ == "__main__":
    fix_alias_and_update()
