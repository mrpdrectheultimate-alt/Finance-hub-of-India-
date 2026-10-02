import shutil, os

src = 'app/signup/page.tsx'
dst = 'outputs/signup_page.tsx'

os.makedirs('outputs', exist_ok=True)
shutil.copyfile(src, dst)
print("Copied app/signup/page.tsx to outputs/signup_page.tsx")
