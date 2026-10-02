import glob
import os
import re

files = sorted(glob.glob('outputs/*.sql'))

print("=== TRACK DEFINITIONS & SLUGS ACROSS ALL SQL FILES ===")
for f in files:
    content = open(f, encoding='utf-8', errors='replace').read()
    # Search for INSERT INTO tracks ...
    track_matches = re.findall(r"INSERT INTO tracks[^\n;]+", content, re.IGNORECASE)
    if track_matches:
        print(f"\n--- {os.path.basename(f)} ---")
        for tm in track_matches[:5]:
            print(" ", tm[:120])
            
    # Search for level track_id references
    level_matches = re.findall(r"SELECT id INTO [a-z0-9_]+ FROM levels WHERE[^\n;]+", content, re.IGNORECASE)
    if level_matches:
        print(f"--- {os.path.basename(f)} (level lookups) ---")
        for lm in level_matches[:5]:
            print(" ", lm[:120])
