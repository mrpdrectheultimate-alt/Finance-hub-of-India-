import os

with open('scratch/step_4051.txt', encoding='utf-8') as f:
    text = f.read()

mapping = [
    ('// 1. FORGOT PASSWORD', '// 2. SETTINGS PAGE', 'app/forgot-password/page.tsx', 'ForgotPasswordPage'),
    ('// 2. SETTINGS PAGE', '// 3. KNOWLEDGE MAP PAGE', 'app/settings/page.tsx', 'SettingsPage'),
    ('// 3. KNOWLEDGE MAP PAGE', '// 4. NOTES / ROUGH BOOK PAGE', 'app/knowledge-map/page.tsx', 'KnowledgeMapPage'),
    ('// 4. NOTES / ROUGH BOOK PAGE', '// 5. AI TUTOR PAGE', 'app/notes/page.tsx', 'NotesPage'),
    ('// 5. AI TUTOR PAGE', '// 6. CASE STUDIES LISTING', 'app/ai-tutor/page.tsx', 'AITutorPage'),
    ('// 6. CASE STUDIES LISTING', '// 7. CERTIFICATE VERIFICATION PAGE', 'app/case-studies/page.tsx', 'CaseStudiesPage'),
    ('// 7. CERTIFICATE VERIFICATION PAGE', '// 8. TRACK LANDING PAGE', 'app/verify/[id]/page.tsx', 'VerifyPage'),
    ('// 8. TRACK LANDING PAGE', None, 'app/tracks/[slug]/page.tsx', 'TrackPage')
]

common_header = '"use client";\nimport { useState, useEffect } from "react";\nimport { supabase } from "@/lib/supabase";\nimport Logo from "@/components/ui/Logo";\nimport Link from "next/link";\n'

for start_key, end_key, target_file, func_name in mapping:
    start_pos = text.find(start_key)
    if start_pos == -1:
        print(f"ERROR: start_key {start_key} not found")
        continue
    if end_key:
        end_pos = text.find(end_key)
        chunk = text[start_pos:end_pos]
    else:
        chunk = text[start_pos:]
    
    exp_pos = chunk.find('export function ' + func_name)
    if exp_pos == -1:
        print(f"ERROR: export function {func_name} not found in chunk")
        continue
    
    body = chunk[exp_pos:]
    body = body.replace('export function ' + func_name, 'export default function ' + func_name, 1)
    
    file_content = common_header + '\n' + body
    
    os.makedirs(os.path.dirname(target_file), exist_ok=True)
    with open(target_file, 'w', encoding='utf-8') as tf:
        tf.write(file_content)
    print(f"Wrote {target_file} ({len(file_content)} bytes)")
