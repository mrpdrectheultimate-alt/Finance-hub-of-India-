import urllib.request, re

url = 'https://finance-hub-of-india.vercel.app'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as r:
    html = r.read().decode('utf-8')

print("Status:", r.status)

# Look for buildId
match = re.search(r'buildId["\']:\s*["\']([^"\']+)["\']', html)
if match:
    print("Live Build ID:", match.group(1))

# Check for new landing page markers
print("Has 'Playfair Display' font import:", 'Playfair+Display' in html or 'Playfair Display' in html)
print("Has 'Master Finance. Shape Your Future':", 'Master Finance' in html or 'Shape Your Future' in html)
print("Has '82 playlists':", '82 playlists' in html)
print("Has '9 simulators':", '9 simulators' in html)
