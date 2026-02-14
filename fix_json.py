#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json

# Read the file
with open('public/data/questions-deepdive.json', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix line 1214 (index 1213) - add closing quote and comma
if len(lines) > 1213:
    line_1214 = lines[1213]
    # Check if it's missing the closing quote
    if not line_1214.rstrip().endswith(('",', '"')):
        # Add closing quote and comma
        lines[1213] = line_1214.rstrip() + '。",\n'
        print("Fixed line 1214")

# Check if line 1215 needs to have zh-Hant field added
# First, let's remove the erroneous '[' at line 1215
if len(lines) > 1214:
    line_1215 = lines[1214].strip()
    if line_1215 == '[':
        # This line should be removed, but we need to add zh-Hant and dmv_ref first
        # Let's insert the missing fields
        lines[1214] = '      "zh-Hant": "遠光燈會被霧氣反射產生眩光，導致視線模糊。近光燈照射地面效果更好。"\n'
        lines.insert(1215, '    },\n')
        lines.insert(1216, '    "dmv_ref": { "page": "64", "section": "Section 11: Safe Driving Tips" }\n')
        lines.insert(1217, '  },\n')
        print("Added missing fields and fixed structure")

# Write back
with open('public/data/questions-deepdive.json', 'w', encoding='utf-8') as f:
    f.writelines(lines)

# Try to validate
try:
    with open('public/data/questions-deepdive.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"✓ JSON is valid! Total questions: {len(data)}")
except Exception as e:
    print(f"✗ JSON validation failed: {e}")
