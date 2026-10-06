with open('sql/phase10_cases_hindi.sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

in_string = False
string_start_line = 0
open_events = []

for idx, line in enumerate(lines):
    i = 0
    while i < len(line):
        if line[i] == "'":
            if i + 1 < len(line) and line[i+1] == "'":
                i += 2
                continue
            else:
                in_string = not in_string
                if in_string:
                    string_start_line = idx + 1
                    open_events.append((idx + 1, line.strip()[:60]))
                else:
                    if open_events:
                        open_events.pop()
                i += 1
        else:
            i += 1

print("Remaining open string events:", len(open_events))
for lnum, snippet in open_events:
    print(f"Line {lnum}: {snippet}")
