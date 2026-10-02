with open('scratch/landing_page_extracted.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix double line breaks if every second line is empty
lines = text.splitlines()

cleaned_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    cleaned_lines.append(line)
    # If this line ends with a comment or bracket and next line is empty, let's check pattern
    i += 1

# Let's inspect first 30 lines of raw lines vs cleaned lines
print("RAW LINES (first 20):")
for idx, l in enumerate(lines[:20]):
    print(f"{idx}: {repr(l)}")

# Let's check if there is an alternating empty line pattern
is_alternating = True
for idx in range(1, min(100, len(lines)), 2):
    if lines[idx].strip() != "":
        is_alternating = False
        break

print(f"Is alternating empty lines: {is_alternating}")
