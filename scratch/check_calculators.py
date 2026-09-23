import os

files_to_check = [
    r"app\practice\sip\page.tsx",
    r"app\practice\emi\page.tsx",
    r"app\practice\tax\page.tsx",
]

base_dir = r"c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub"

for frel in files_to_check:
    fpath = os.path.join(base_dir, frel)
    if os.path.exists(fpath):
        with open(fpath, "r", encoding="utf-8") as f:
            print(f"=== {frel} ===")
            lines = f.readlines()[:80]
            print("".join(lines))
