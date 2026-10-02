import os
import sys
import glob
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def parse_sql_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    lines = content.splitlines()
    errors = []
    warnings = []
    
    # Check 1: Dollar tag balance
    dollar_tags = re.findall(r'\$[a-zA-Z0-9_]*\$', content)
    tag_counts = {}
    for tag in dollar_tags:
        tag_counts[tag] = tag_counts.get(tag, 0) + 1
    
    for tag, count in tag_counts.items():
        if count % 2 != 0:
            errors.append(f"Unbalanced dollar tag {tag}: count is {count}")

    # Check 2: Lexing SQL into tokens and blocks
    pos = 0
    length = len(content)
    line_no = 1
    
    current_dollar_tag = None
    dollar_start_line = 0
    dollar_content = []
    
    in_single_quote = False
    quote_start_line = 0
    single_quote_content = []
    
    in_line_comment = False
    in_block_comment = False
    block_comment_start = 0
    
    top_level_code = []
    dollar_blocks = [] # List of (tag, start_line, content)
    
    i = 0
    while i < length:
        ch = content[i]
        
        if ch == '\n':
            line_no += 1
            if in_line_comment:
                in_line_comment = False
            elif in_single_quote:
                single_quote_content.append('\n')
            elif current_dollar_tag:
                dollar_content.append('\n')
            elif not in_block_comment:
                top_level_code.append('\n')
            i += 1
            continue
            
        if in_line_comment:
            i += 1
            continue
            
        if in_block_comment:
            if ch == '*' and i + 1 < length and content[i+1] == '/':
                in_block_comment = False
                i += 2
            else:
                i += 1
            continue
            
        if current_dollar_tag:
            if content.startswith(current_dollar_tag, i):
                i += len(current_dollar_tag)
                dollar_blocks.append((current_dollar_tag, dollar_start_line, ''.join(dollar_content)))
                current_dollar_tag = None
                dollar_content = []
            else:
                dollar_content.append(ch)
                i += 1
            continue
            
        if in_single_quote:
            if ch == "'":
                if i + 1 < length and content[i+1] == "'":
                    single_quote_content.append("''")
                    i += 2
                else:
                    in_single_quote = False
                    i += 1
            else:
                single_quote_content.append(ch)
                i += 1
            continue
            
        # Outside comments and strings
        if ch == '-' and i + 1 < length and content[i+1] == '-':
            in_line_comment = True
            i += 2
            continue
            
        if ch == '/' and i + 1 < length and content[i+1] == '*':
            in_block_comment = True
            block_comment_start = line_no
            i += 2
            continue
            
        if ch == '$':
            m = re.match(r'^\$[a-zA-Z0-9_]*\$', content[i:])
            if m:
                current_dollar_tag = m.group(0)
                dollar_start_line = line_no
                dollar_content = []
                i += len(current_dollar_tag)
                continue
                
        if ch == "'":
            in_single_quote = True
            quote_start_line = line_no
            single_quote_content = []
            i += 1
            continue
            
        top_level_code.append(ch)
        i += 1

    if in_single_quote:
        errors.append(f"Unclosed single-quoted string starting at line {quote_start_line}")
    if current_dollar_tag:
        errors.append(f"Unclosed dollar block {current_dollar_tag} starting at line {dollar_start_line}")
    if in_block_comment:
        errors.append(f"Unclosed block comment starting at line {block_comment_start}")

    top_code_str = ''.join(top_level_code)

    # Check 3: PL/pgSQL block parsing inside dollar blocks
    for tag, start_ln, block_text in dollar_blocks:
        b_begins = len(re.findall(r'\bBEGIN\b', block_text, re.IGNORECASE))
        b_ends = len(re.findall(r'\bEND\s*;', block_text, re.IGNORECASE))
        
        b_ifs = len(re.findall(r'\bIF\b', block_text, re.IGNORECASE))
        b_endifs = len(re.findall(r'\bEND\s+IF\s*;', block_text, re.IGNORECASE))
        
        if b_begins != b_ends:
            warnings.append(f"Dollar block {tag} at line {start_ln}: BEGIN count ({b_begins}) != END; count ({b_ends})")
        if b_ifs != b_endifs:
            warnings.append(f"Dollar block {tag} at line {start_ln}: IF count ({b_ifs}) != END IF; count ({b_endifs})")

    # Check 4: Idempotency & Syntax checks on top-level SQL statements
    for match in re.finditer(r'\bCREATE\s+TABLE\s+(?!IF\s+NOT\s+EXISTS\b)([a-zA-Z0-9_\."]+)', top_code_str, re.IGNORECASE):
        warnings.append(f"CREATE TABLE {match.group(1)} missing 'IF NOT EXISTS'")

    for match in re.finditer(r'\bCREATE\s+(?:UNIQUE\s+)?INDEX\s+(?!IF\s+NOT\s+EXISTS\b)([a-zA-Z0-9_\."]+)', top_code_str, re.IGNORECASE):
        warnings.append(f"CREATE INDEX {match.group(1)} missing 'IF NOT EXISTS'")

    statements = [stmt.strip() for stmt in top_code_str.split(';') if stmt.strip()]
    for stmt in statements:
        if stmt.upper().startswith("INSERT INTO"):
            if "ON CONFLICT" not in stmt.upper() and "WHERE NOT EXISTS" not in stmt.upper():
                table_match = re.search(r'INSERT\s+INTO\s+([a-zA-Z0-9_\."]+)', stmt, re.IGNORECASE)
                tblname = table_match.group(1) if table_match else 'unknown'
                warnings.append(f"INSERT INTO {tblname} statement lacks ON CONFLICT / WHERE NOT EXISTS guard")

    return errors, warnings, len(lines), len(statements)


def run_audit(directory):
    print(f"============================================================")
    print(f" AUDITING ALL SQL FILES IN: {directory}")
    print(f"============================================================\n")
    
    files = sorted(glob.glob(os.path.join(directory, "*.sql")))
    total_files = len(files)
    total_errors = 0
    total_warnings = 0
    
    file_reports = []
    
    for fpath in files:
        fname = os.path.basename(fpath)
        errs, warns, lcount, scount = parse_sql_file(fpath)
        
        status = "[OK]  "
        if errs:
            status = "[ERR] "
            total_errors += len(errs)
        elif warns:
            status = "[WARN]"
            total_warnings += len(warns)
            
        print(f"{status} | {fname:<35} | {lcount:>5} lines | {scount:>3} stmts")
        if errs:
            for e in errs:
                print(f"   [ERROR]   {e}")
        if warns:
            for w in warns:
                print(f"   [WARNING] {w}")
                
        file_reports.append({
            'file': fname,
            'path': fpath,
            'lines': lcount,
            'stmts': scount,
            'errors': errs,
            'warnings': warns
        })
        
    print(f"\n------------------------------------------------------------")
    print(f"Summary: {total_files} files audited. Errors: {total_errors}, Warnings: {total_warnings}")
    print(f"------------------------------------------------------------\n")
    return file_reports

if __name__ == "__main__":
    run_audit("outputs")
