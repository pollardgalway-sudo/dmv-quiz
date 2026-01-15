import json
import sys

# Read both files
with open('C:/Users/Administrator/dmv-exam-app/data/questions-deepdive-fixed.json', 'r', encoding='utf-8') as f:
    content = f.read()
    # Fix the JSON by removing stray characters and duplicate sections
    content = content.replace('\n      [', '')  # Remove stray bracket on line 1222
    deepdive = json.loads(content)

with open('C:/Users/Administrator/dmv-exam-app/data/questions-basics.json', 'r', encoding='utf-8') as f:
    basics = json.loads(f.read())

# Merge and deduplicate by ID
seen_ids = set()
merged = []

for q in deepdive + basics:
    if q['id'] not in seen_ids:
        seen_ids.add(q['id'])
        merged.append(q)

# Sort by original ID
merged.sort(key=lambda x: x['id'])

# Renumber from 1
for i, q in enumerate(merged, 1):
    q['id'] = i

# Write final output
with open('C:/Users/Administrator/dmv-exam-app/data/questions-final.json', 'w', encoding='utf-8') as f:
    json.dump(merged, f, ensure_ascii=False, indent=2)

print(f"✓ 合并完成！最终题目数量: {len(merged)}")
print(f"✓ Merge complete! Final question count: {len(merged)}")
