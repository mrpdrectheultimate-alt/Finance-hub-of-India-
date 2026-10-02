import os
import sys
import glob
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def check_unescaped_single_quotes_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    lines = content.splitlines()
    fname = os.path.basename(filepath)
    issues = []
    
    # We strip out comments first
    # 1. Remove line comments -- ...
    no_line_comments = re.sub(r'--[^\n]*', '', content)
    
    # 2. Tokenize by dollar quote blocks and single quote strings
    i = 0
    length = len(no_line_comments)
    line_no = 1
    
    current_dollar_tag = None
    dollar_buf = []
    
    in_single_quote = False
    quote_start_line = 0
    quote_buf = []
    
    syntax_errors = []
    
    while i < length:
        ch = no_line_comments[i]
        
        if ch == '\n':
            line_no += 1
            i += 1
            continue
            
        if current_dollar_tag:
            if no_line_comments.startswith(current_dollar_tag, i):
                # Inside dollar block, check single-quoted strings inside dollar block!
                dollar_str = ''.join(dollar_buf)
                # Check single quotes inside dollar_str
                j = 0
                d_len = len(dollar_str)
                d_line = quote_start_line
                in_d_sq = False
                d_sq_start = 0
                while j < d_len:
                    d_ch = dollar_str[j]
                    if d_ch == '\n':
                        d_line += 1
                        j += 1
                        continue
                    if in_d_sq:
                        if d_ch == "'":
                            if j + 1 < d_len and dollar_str[j+1] == "'":
                                j += 2 # valid ''
                            else:
                                in_d_sq = False
                                # Check token following single quote
                                # If the character after ending quote is a letter/digit and NOT followed by comma, space, parenthesis, etc.
                                next_ch = dollar_str[j+1] if j + 1 < d_len else ''
                                if next_ch.isalpha() and next_ch not in ['A', 'O', 'I', 'S', 'F', 'D']:
                                    pass
                                j += 1
                        else:
                            j += 1
                    else:
                        if d_ch == "'":
                            in_d_sq = True
                            d_sq_start = d_line
                            j += 1
                        else:
                            j += 1
                if in_d_sq:
                    syntax_errors.append(f"Unclosed single quote inside dollar block at line {d_sq_start}")

                i += len(current_dollar_tag)
                current_dollar_tag = None
                dollar_buf = []
            else:
                dollar_buf.append(ch)
                i += 1
            continue
            
        if in_single_quote:
            if ch == "'":
                if i + 1 < length and no_line_comments[i+1] == "'":
                    i += 2 # valid escaped quote ''
                else:
                    in_single_quote = False
                    i += 1
            else:
                i += 1
            continue
            
        # Outside strings
        if ch == '$':
            m = re.match(r'^\$[a-zA-Z0-9_]*\$', no_line_comments[i:])
            if m:
                current_dollar_tag = m.group(0)
                quote_start_line = line_no
                dollar_buf = []
                i += len(current_dollar_tag)
                continue
                
        if ch == "'":
            in_single_quote = True
            quote_start_line = line_no
            i += 1
            continue
            
        i += 1
        
    if in_single_quote:
        syntax_errors.append(f"Unclosed single quote starting at line {quote_start_line}")
    if current_dollar_tag:
        syntax_errors.append(f"Unclosed dollar tag {current_dollar_tag} starting at line {quote_start_line}")
        
    return syntax_errors

def run_string_verify():
    files = sorted(glob.glob("outputs/*.sql"))
    print(f"Verifying string escaping across {len(files)} SQL files in outputs/...")
    total_issues = 0
    for fpath in files:
        fname = os.path.basename(fpath)
        errs = check_unescaped_single_quotes_in_file(fpath)
        if errs:
            print(f"❌ {fname}:")
            for e in errs:
                print(f"   {e}")
            total_issues += len(errs)
        else:
            print(f"✅ {fname}: String escaping clean")
    print(f"\nVerification finished. Total string escaping issues: {total_issues}")

if __name__ == "__main__":
    run_string_verify()
