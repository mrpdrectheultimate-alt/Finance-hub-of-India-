import json

path = r'C:\Users\lpk naidu\.gemini\antigravity\brain\3065252d-3bf5-45e6-a985-f7f2675104f3\.system_generated\logs\transcript_full.jsonl'

with open(path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('step_index') == 3625:
            content = data.get('content', '')
            
            # Find exact start of "use client";
            target = '"use client";'
            pos = content.find(target)
            if pos != -1:
                content = content[pos:]
            
            lines = content.split('\n')
            cleaned_code_lines = []
            
            i = 0
            while i < len(lines):
                l = lines[i].rstrip('\r')
                cleaned_code_lines.append(l)
                if i + 1 < len(lines) and lines[i+1].rstrip('\r') == '':
                    i += 1
                i += 1

            final_code = '\n'.join(cleaned_code_lines)
            if '</USER_REQUEST>' in final_code:
                final_code = final_code[:final_code.find('</USER_REQUEST>')].strip()

            with open('scratch/landing_page_clean.tsx', 'w', encoding='utf-8') as out:
                out.write(final_code)
            
            print(f"Saved scratch/landing_page_clean.tsx - Lines: {len(final_code.splitlines())}")
