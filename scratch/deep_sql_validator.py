import os
import sys
import glob
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def analyze_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    lines = content.splitlines()
    errors = []
    warnings = []
    
    # 1. Dollar Tag Matching
    dollar_tags = re.findall(r'\$[a-zA-Z0-9_]*\$', content)
    tag_counts = {}
    for t in dollar_tags:
        tag_counts[t] = tag_counts.get(t, 0) + 1
    for t, c in tag_counts.items():
        if c % 2 != 0:
            errors.append(f"Unbalanced dollar quote tag '{t}': count is {c} (must be even)")

    # 2. Strict Tokenizer / Lexer
    pos = 0
    length = len(content)
    line_no = 1
    
    current_dollar_tag = None
    dollar_start_line = 0
    dollar_buf = []
    
    in_single_quote = False
    quote_start_line = 0
    quote_buf = []
    
    in_line_comment = False
    in_block_comment = False
    block_comment_start = 0
    
    top_level_code = []
    dollar_blocks = [] # list of (tag, start_line, content_str)
    
    i = 0
    while i < length:
        ch = content[i]
        
        if ch == '\n':
            line_no += 1
            if in_line_comment:
                in_line_comment = False
            elif in_single_quote:
                quote_buf.append('\n')
            elif current_dollar_tag:
                dollar_buf.append('\n')
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
                dollar_blocks.append((current_dollar_tag, dollar_start_line, ''.join(dollar_buf)))
                current_dollar_tag = None
                dollar_buf = []
            else:
                dollar_buf.append(ch)
                i += 1
            continue
            
        if in_single_quote:
            if ch == "'":
                if i + 1 < length and content[i+1] == "'":
                    quote_buf.append("''")
                    i += 2
                else:
                    in_single_quote = False
                    i += 1
            else:
                quote_buf.append(ch)
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
                dollar_buf = []
                i += len(current_dollar_tag)
                continue
                
        if ch == "'":
            in_single_quote = True
            quote_start_line = line_no
            quote_buf = []
            i += 1
            continue
            
        top_level_code.append(ch)
        i += 1

    if in_single_quote:
        errors.append(f"Unclosed single-quoted string starting at line {quote_start_line}")
    if current_dollar_tag:
        errors.append(f"Unclosed dollar block '{current_dollar_tag}' starting at line {dollar_start_line}")
    if in_block_comment:
        errors.append(f"Unclosed block comment starting at line {block_comment_start}")

    # 3. Inner PL/pgSQL Code Analysis inside Dollar Blocks
    for tag, start_ln, block_str in dollar_blocks:
        b_i = 0
        b_len = len(block_str)
        b_line = start_ln
        b_in_sq = False
        b_sq_start = 0
        b_sq_buf = []
        b_code_buf = []
        b_in_line_comm = False
        b_in_blk_comm = False
        
        while b_i < b_len:
            b_ch = block_str[b_i]
            if b_ch == '\n':
                b_line += 1
                if b_in_line_comm:
                    b_in_line_comm = False
                elif b_in_sq:
                    b_sq_buf.append('\n')
                elif not b_in_blk_comm:
                    b_code_buf.append('\n')
                b_i += 1
                continue
                
            if b_in_line_comm:
                b_i += 1
                continue
                
            if b_in_blk_comm:
                if b_ch == '*' and b_i + 1 < b_len and block_str[b_i+1] == '/':
                    b_in_blk_comm = False
                    b_i += 2
                else:
                    b_i += 1
                continue
                
            if b_in_sq:
                if b_ch == "'":
                    if b_i + 1 < b_len and block_str[b_i+1] == "'":
                        b_sq_buf.append("''")
                        b_i += 2
                    else:
                        b_in_sq = False
                        b_i += 1
                else:
                    b_sq_buf.append(b_ch)
                    b_i += 1
                continue
                
            if b_ch == '-' and b_i + 1 < b_len and block_str[b_i+1] == '-':
                b_in_line_comm = True
                b_i += 2
                continue
                
            if b_ch == '/' and b_i + 1 < b_len and block_str[b_i+1] == '*':
                b_in_blk_comm = True
                b_i += 2
                continue
                
            if b_ch == "'":
                b_in_sq = True
                b_sq_start = b_line
                b_sq_buf = []
                b_i += 1
                continue
                
            b_code_buf.append(b_ch)
            b_i += 1
            
        if b_in_sq:
            errors.append(f"Unclosed string literal inside dollar block '{tag}' at line {b_sq_start}")

        clean_pl_code = ''.join(b_code_buf)
        
        # Remove CASE ... END expressions to prevent counting CASE ... END as PL/pgSQL block END
        clean_pl_code_no_case = re.sub(r'\bCASE\b[\s\S]*?\bEND\b', 'CASE_EXPR_REMOVED', clean_pl_code, flags=re.IGNORECASE)
        
        # BEGIN count: matches standalone BEGIN
        begins = len(re.findall(r'\bBEGIN\b', clean_pl_code_no_case, re.IGNORECASE))
        # END count: matches END (followed by ;, $, or end-of-string)
        ends = len(re.findall(r'\bEND\b(?!\s+(?:IF|LOOP|CASE)\b)(?:\s*;|\s*\$|\s*$)', clean_pl_code_no_case, re.IGNORECASE))
        
        # IF count (excluding END IF)
        ifs = len(re.findall(r'(?<!END\s)\bIF\b', clean_pl_code_no_case, re.IGNORECASE))
        endifs = len(re.findall(r'\bEND\s+IF\b', clean_pl_code_no_case, re.IGNORECASE))
        
        loops = len(re.findall(r'(?<!END\s)\bLOOP\b', clean_pl_code_no_case, re.IGNORECASE))
        endloops = len(re.findall(r'\bEND\s+LOOP\b', clean_pl_code_no_case, re.IGNORECASE))

        if begins != ends:
            errors.append(f"PL/pgSQL syntax in block {tag} (line {start_ln}): BEGIN count ({begins}) != END count ({ends})")
        if ifs != endifs:
            errors.append(f"PL/pgSQL syntax in block {tag} (line {start_ln}): IF count ({ifs}) != END IF count ({endifs})")
        if loops != endloops:
            errors.append(f"PL/pgSQL syntax in block {tag} (line {start_ln}): LOOP count ({loops}) != END LOOP count ({endloops})")

    return errors, warnings, len(lines)

def deep_audit(directory):
    print("=" * 70)
    print(f" DEEP SQL VERIFICATION AUDIT: {directory}")
    print("=" * 70)
    
    files = sorted(glob.glob(os.path.join(directory, "*.sql")))
    total_errors = 0
    total_warnings = 0
    
    for fpath in files:
        fname = os.path.basename(fpath)
        errs, warns, lcnt = analyze_file(fpath)
        
        if errs:
            status = "[FAIL] "
            total_errors += len(errs)
        elif warns:
            status = "[WARN] "
            total_warnings += len(warns)
        else:
            status = "[PASS] "
            
        print(f"{status} | {fname:<35} | {lcnt:>5} lines")
        for e in errs:
            print(f"   ❌ ERROR:   {e}")
        for w in warns:
            print(f"   ⚠️ WARNING: {w}")
            
    print("-" * 70)
    print(f"TOTAL FILES: {len(files)} | ERRORS: {total_errors} | WARNINGS: {total_warnings}")
    print("-" * 70)

if __name__ == "__main__":
    deep_audit("outputs")
