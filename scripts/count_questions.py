import json
import os

files_to_check = [
    'data/questions-all.json',
    'data/questions-basics.json',
    'data/questions-final.json',
    'data/questions-dmv-all.json'
]

for f_path in files_to_check:
    full_path = os.path.join('/Users/fefe/Desktop/dmv-exam-app', f_path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                count = len(data) if isinstance(data, list) else 0
                print(f"{f_path}: {count} questions")
            except:
                print(f"{f_path}: Error reading")
