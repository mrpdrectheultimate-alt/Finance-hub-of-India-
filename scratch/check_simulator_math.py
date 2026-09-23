import os

files_to_check = [
    r"components\simulators\SipCalculator.tsx",
    r"components\simulators\EmiCalculator.tsx",
    r"components\simulators\TaxCalculator.tsx",
]

base_dir = r"c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub"

for frel in files_to_check:
    fpath = os.path.join(base_dir, frel)
    if os.path.exists(fpath):
        with open(fpath, "r", encoding="utf-8") as f:
            print(f"=== {frel} ===")
            content = f.read()
            # print calculations
            for line in content.split("\n"):
                if "const" in line or "Math." in line or "return" in line or "=" in line:
                    if any(k in line for k in ["total", "interest", "tax", "emi", "fv", "pv", "rate", "months", "taxable"]):
                        print("  ", line.strip())
