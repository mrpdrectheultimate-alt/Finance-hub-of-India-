import json
import urllib.request
import urllib.parse
import re
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

def verify_oembed(item_id, item_type='video'):
    if item_type == 'playlist':
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list={item_id}&format=json"
    else:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={item_id}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())
            return True, data.get('title'), data.get('author_name')
    except Exception as e:
        return False, None, None

def search_yt(query, item_type='video'):
    q = urllib.parse.quote(query)
    if item_type == 'playlist':
        url = f"https://www.youtube.com/results?search_query={q}&sp=EgIQAw%253D%253D" # filter playlists
    else:
        url = f"https://www.youtube.com/results?search_query={q}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            if item_type == 'playlist':
                ids = re.findall(r'playlist\?list=([a-zA-Z0-9_-]{18,})', html)
            else:
                ids = re.findall(r'watch\?v=([a-zA-Z0-9_-]{11})', html)
            # Remove duplicates preserving order
            return list(dict.fromkeys(ids))[:15]
    except Exception as e:
        return []

# Read current scripts/validate-videos.js
with open('scripts/validate-videos.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract VIDEOS_TO_VALIDATE array block
m = re.search(r'const VIDEOS_TO_VALIDATE = \[(.*?)\];\s*// ── oEmbed check', content, re.DOTALL)
if not m:
    print("Could not find VIDEOS_TO_VALIDATE in scripts/validate-videos.js")
    sys.exit(1)

array_text = m.group(1)

# Extract objects: { id:"...", title:"...", type:"...", category:"..." }
raw_items = re.findall(r'\{\s*id:"([^"]+)",\s*title:"([^"]+)",\s*type:"([^"]+)",\s*category:"([^"]+)"\s*\}', array_text)
print(f"Total items in list: {len(raw_items)}")

used_ids = set()
updated_items = []

for i, (vid_id, title, vtype, category) in enumerate(raw_items, 1):
    print(f"\n[{i:03d}/{len(raw_items)}] Checking {title} ({vid_id})...")
    ok, real_title, author = verify_oembed(vid_id, vtype)
    
    if ok and vid_id not in used_ids:
        print(f"  ALREADY LIVE: {vid_id} -> {real_title} ({author})")
        used_ids.add(vid_id)
        updated_items.append({
            'id': vid_id,
            'title': title,
            'confirmed_title': real_title,
            'author': author,
            'type': vtype,
            'category': category
        })
    else:
        print(f"  BROKEN or DUPLICATE. Searching replacement for '{title}'...")
        # Construct search query
        candidates = search_yt(title, vtype)
        if not candidates and vtype == 'playlist':
            # Fallback search as video
            candidates = search_yt(title, 'video')
            cand_type = 'video'
        else:
            cand_type = vtype

        found = False
        for cand in candidates:
            if cand in used_ids:
                continue
            cand_ok, cand_title, cand_author = verify_oembed(cand, cand_type)
            if cand_ok:
                print(f"  RESOLVED: {cand} -> {cand_title} ({cand_author})")
                used_ids.add(cand)
                updated_items.append({
                    'id': cand,
                    'title': title,
                    'confirmed_title': cand_title,
                    'author': cand_author,
                    'type': cand_type,
                    'category': category
                })
                found = True
                break
            time.sleep(0.05)
            
        if not found:
            print(f"  WARNING: Could not find verified replacement for '{title}'! Keeping original.")
            updated_items.append({
                'id': vid_id,
                'title': title,
                'confirmed_title': title,
                'author': '',
                'type': vtype,
                'category': category
            })
            
    time.sleep(0.05)

print("\nFinished resolving videos!")
print(f"Total resolved items: {len(updated_items)}")

# Save updated JSON for inspection
with open('resolved_videos.json', 'w', encoding='utf-8') as f:
    json.dump(updated_items, f, indent=2, ensure_ascii=False)

# Format replacement string for validate-videos.js
new_entries = []
current_cat = None
for item in updated_items:
    if item['category'] != current_cat:
        current_cat = item['category']
        new_entries.append(f"\n  // {current_cat.upper()}")
    new_entries.append(f'  {{ id:"{item["id"]}", title:"{item["title"]}", type:"{item["type"]}", category:"{item["category"]}" }},')

replacement_code = f"const VIDEOS_TO_VALIDATE = [{''.join(new_entries)}\n];"

# Replace in validate-videos.js
new_content = re.sub(
    r'const VIDEOS_TO_VALIDATE = \[.*?\];',
    replacement_code,
    content,
    flags=re.DOTALL
)

with open('scripts/validate-videos.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated scripts/validate-videos.js successfully!")
