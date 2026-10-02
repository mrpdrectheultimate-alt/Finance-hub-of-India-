import os

app_dir = 'app'
routes = {}

for root, dirs, files in os.walk(app_dir):
    if 'page.tsx' in files or 'route.ts' in files:
        rel = os.path.relpath(root, app_dir)
        parts = rel.split(os.sep)
        pattern = []
        for p in parts:
            if p.startswith('[') and p.endswith(']'):
                pattern.append('[]')
            else:
                pattern.append(p)
        pat_str = '/'.join(pattern)
        if pat_str not in routes:
            routes[pat_str] = []
        routes[pat_str].append(rel)

print("Route pattern collisions:")
for pat, paths in routes.items():
    if len(paths) > 1:
        print(f"Pattern '{pat}': {paths}")
