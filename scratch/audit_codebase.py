import os
import re
import json

base_dir = r"c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub"

def search_files(directory, ext=(".ts", ".tsx", ".js", ".jsx")):
    matched = []
    for root, _, files in os.walk(directory):
        if "node_modules" in root or ".next" in root or ".git" in root:
            continue
        for file in files:
            if file.endswith(ext):
                matched.append(os.path.join(root, file))
    return matched

all_code_files = search_files(base_dir)

# 1. Check Legal Pages
legal_pages = {
    "/terms": os.path.exists(os.path.join(base_dir, "app", "terms", "page.tsx")),
    "/privacy": os.path.exists(os.path.join(base_dir, "app", "privacy", "page.tsx")),
    "/disclaimer": os.path.exists(os.path.join(base_dir, "app", "disclaimer", "page.tsx")),
    "/refund": os.path.exists(os.path.join(base_dir, "app", "refund", "page.tsx")),
}

# 2. Check Simulators
simulators = {
    "SIP": os.path.exists(os.path.join(base_dir, "app", "practice", "sip", "page.tsx")),
    "EMI": os.path.exists(os.path.join(base_dir, "app", "practice", "emi", "page.tsx")),
    "Tax": os.path.exists(os.path.join(base_dir, "app", "practice", "tax", "page.tsx")),
    "Retirement": os.path.exists(os.path.join(base_dir, "app", "practice", "retirement", "page.tsx")),
    "Budget": os.path.exists(os.path.join(base_dir, "app", "practice", "budget", "page.tsx")),
    "Startup Cash Flow": os.path.exists(os.path.join(base_dir, "app", "practice", "startup-cash-flow", "page.tsx")),
    "Crypto": os.path.exists(os.path.join(base_dir, "app", "practice", "crypto", "page.tsx")),
    "Trading": os.path.exists(os.path.join(base_dir, "app", "practice", "trading", "page.tsx")),
}

# 3. Check Analytics & SEO
analytics_installed = {
    "PostHog": False,
    "Google Analytics": False,
}
for fpath in all_code_files:
    try:
        with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            if "posthog" in content.lower():
                analytics_installed["PostHog"] = True
            if "gtag" in content.lower() or "googleanalyticstag" in content.lower() or "ga_tracking_id" in content.lower():
                analytics_installed["Google Analytics"] = True
    except Exception:
        pass

print("LEGAL PAGES:", legal_pages)
print("SIMULATORS:", simulators)
print("ANALYTICS:", analytics_installed)
