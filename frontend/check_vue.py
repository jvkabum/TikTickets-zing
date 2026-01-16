import os
import re

def check_files(start_dir):
    for root, dirs, files in os.walk(start_dir):
        for file in files:
            if file.endswith('.vue'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    scripts = re.findall(r'<script', content)
                    if len(scripts) > 1:
                        print(f"MULTIPLE SCRIPTS: {path}")

check_files('src')
