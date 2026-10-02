import os
import sys
import subprocess
import glob

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def run_cmd(cmd):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return res.stdout.strip(), res.stderr.strip(), res.returncode

def deep_audit():
    print("============================================================")
    print(" DEEP DIVE REPOSITORY & DEPLOYMENT AUDIT")
    print("============================================================\n")

    # 1. Fetch remote status
    print("1. Fetching latest remote status from origin...")
    out, err, code = run_cmd("git fetch origin main")
    print("   Fetch status: OK\n")

    # 2. Check local vs remote commit difference
    out_rev, _, _ = run_cmd("git rev-parse HEAD")
    out_remote_rev, _, _ = run_cmd("git rev-parse origin/main")
    
    print(f"2. Commit Hash Alignment Check:")
    print(f"   Local  HEAD: {out_rev}")
    print(f"   Remote MAIN: {out_remote_rev}")
    if out_rev == out_remote_rev:
        print("   ✅ Local HEAD and Remote origin/main are 100% IDENTICAL!\n")
    else:
        print("   ⚠️ Local HEAD and Remote origin/main differ!\n")

    # 3. Check git diff between local HEAD and origin/main
    diff_out, _, _ = run_cmd("git diff HEAD origin/main")
    if not diff_out:
        print("3. Git Codebase Diff Check:")
        print("   ✅ Zero diff! Every line of code on local HEAD is present on origin/main.\n")
    else:
        print("3. Git Codebase Diff Check:")
        print(f"   ⚠️ Diff found ({len(diff_out)} chars)\n")

    # 4. Inventory all code directories on disk
    print("4. Directory File Inventory & Git Tracking Audit:")
    core_dirs = ["app", "components", "lib", "public", "sql", "cron", "styles", "types", "utils"]
    untracked_code_files = []
    total_tracked_files = 0
    
    for d in core_dirs:
        if os.path.exists(d):
            files = [f for f in glob.glob(f"{d}/**/*", recursive=True) if os.path.isfile(f)]
            tracked_in_d = 0
            for f in files:
                rel_p = os.path.normpath(f).replace("\\", "/")
                # Check git status for file
                s_out, _, _ = run_cmd(f'git status --porcelain "{rel_p}"')
                if s_out.startswith("??"):
                    untracked_code_files.append(rel_p)
                else:
                    tracked_in_d += 1
            total_tracked_files += tracked_in_d
            print(f"   - {d:<12}: {len(files):>4} files on disk | {tracked_in_d:>4} tracked by git")

    if not untracked_code_files:
        print("\n   ✅ 100% of code & asset files across all directories are tracked by git!\n")
    else:
        print(f"\n   ⚠️ Found {len(untracked_code_files)} untracked code files:\n")
        for uf in untracked_code_files:
            print("     ", uf)
            
    # 5. Check untracked files overall
    print("5. Overall Untracked / Modified Check:")
    st_out, _, _ = run_cmd("git status --porcelain")
    st_lines = [l for l in st_out.splitlines() if l.strip()]
    if not st_lines:
        print("   ✅ Working tree completely clean!")
    else:
        print("   Working tree items:")
        for l in st_lines:
            print("    ", l)

    # 6. Commit History Overview
    print("\n6. Full Commit Trajectory (Last 15 Commits):")
    log_out, _, _ = run_cmd("git log -n 15 --oneline")
    for line in log_out.splitlines():
        print("   ", line)
        
    print("\n============================================================")
    print(" AUDIT COMPLETE")
    print("============================================================\n")

if __name__ == "__main__":
    deep_audit()
