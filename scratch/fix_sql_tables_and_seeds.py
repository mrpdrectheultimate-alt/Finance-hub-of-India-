import os
import sys
import glob
import re
import zipfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def apply_bulletproof_fixes():
    print("Applying bulletproof fixes to video_library_complete.sql and phase8_lessons.sql...")

    # 1. Fix video_library_complete.sql
    col_alters = """-- Ensure all table columns exist before seeding
ALTER TABLE curated_playlists
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS channel_name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS playlist_url TEXT,
  ADD COLUMN IF NOT EXISTS embed_id TEXT,
  ADD COLUMN IF NOT EXISTS embed_type TEXT DEFAULT 'playlist',
  ADD COLUMN IF NOT EXISTS video_type TEXT DEFAULT 'playlist',
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'youtube',
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS video_count INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS duration_hrs NUMERIC DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS curator_note TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL;
"""

    for target in ["outputs/video_library_complete.sql", "sql/video_library_complete.sql"]:
        if os.path.exists(target):
            content = open(target, 'r', encoding='utf-8', errors='replace').read()
            if "ADD COLUMN IF NOT EXISTS channel_name" not in content:
                content = content.replace("TRUNCATE TABLE curated_playlists RESTART IDENTITY CASCADE;", col_alters + "\nTRUNCATE TABLE curated_playlists RESTART IDENTITY CASCADE;")
                with open(target, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Fixed columns in {target}")

    # 2. Fix phase8_lessons.sql level resolution
    for target in ["outputs/phase8_lessons.sql", "sql/phase8_lessons.sql"]:
        if os.path.exists(target):
            content = open(target, 'r', encoding='utf-8', errors='replace').read()
            old_resolution = """  IF fx_id IS NULL THEN SELECT id INTO fx_id FROM levels LIMIT 1; END IF;
  IF ta_id IS NULL THEN ta_id := fx_id; END IF;
  IF cr_id IS NULL THEN cr_id := fx_id; END IF;
  IF cf_id IS NULL THEN cf_id := fx_id; END IF;"""

            new_resolution = """  IF fx_id IS NULL THEN SELECT id INTO fx_id FROM levels LIMIT 1; END IF;
  IF ta_id IS NULL THEN ta_id := fx_id; END IF;
  IF cr_id IS NULL THEN cr_id := fx_id; END IF;
  IF cf_id IS NULL THEN cf_id := fx_id; END IF;
  IF hi_id IS NULL THEN hi_id := fx_id; END IF;"""

            if "hi_id := fx_id;" not in content:
                content = content.replace(old_resolution, new_resolution)
                with open(target, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Fixed level resolution fallbacks in {target}")

    # 3. Fix phase7_lessons.sql level resolution
    for target in ["outputs/phase7_lessons.sql", "sql/phase7_lessons.sql"]:
        if os.path.exists(target):
            content = open(target, 'r', encoding='utf-8', errors='replace').read()
            if "IF hi_beg_id IS NULL THEN hi_beg_id := pf_int_id; END IF;" not in content:
                old_p7 = "  IF fx_adv_id IS NULL THEN SELECT id INTO fx_adv_id FROM levels WHERE track_id IN (SELECT id FROM tracks WHERE slug='forex-currency') LIMIT 1; END IF;"
                new_p7 = old_p7 + "\n  IF hi_beg_id IS NULL THEN hi_beg_id := pf_int_id; END IF;"
                content = content.replace(old_p7, new_p7)
                with open(target, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Fixed level resolution fallbacks in {target}")

    # 4. Re-package release zip
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
    print("✅ Re-packaged FinanceHub_COMPLETE_FINAL.zip successfully.\n")

if __name__ == "__main__":
    apply_bulletproof_fixes()
