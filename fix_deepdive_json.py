import json
import re

with open('public/data/questions-deepdive.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix pattern 1: incomplete zh-Hans string on line 1214
content = re.sub(
    r'"zh-Hans": "远光灯会被雾气反射产生眩光，导致视线模糊。近光灯照射地面效果更好\n      \[',
    '"zh-Hans": "远光灯会被雾气反射产生眩光，导致视线模糊。近光灯照射地面效果更好。",\n      "zh-Hant": "遠光燈會被霧氣反射產生眩光，導致視線模糊。近光燈照射地面效果更好。"\n    },\n    "dmv_ref": { "page": "64", "section": "Section 11: Safe Driving Tips" }\n  },\n  {',
    content
)

# Fix all ][patterns - replace }][ with },{
content = re.sub(r'\}\s*\]\s*\[\s*\n\s*\{', '},\n  {', content)

with open('public/data/questions-deepdive.json', 'w', encoding='utf-8') as f:
    f.write(content)

# Validate
try:
    with open('public/data/questions-deepdive.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"✓ JSON有效! 共 {len(data)} 道题")
except Exception as e:
    print(f"✗ JSON验证失败: {e}")
