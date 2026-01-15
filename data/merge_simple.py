import json

with open('questions-deepdive-fixed.json', 'r', encoding='utf-8') as f:
    content = f.read().replace('\n      [', '')
    deepdive = json.loads(content)

with open('questions-basics.json', 'r', encoding='utf-8') as f:
    basics = json.loads(f.read())

seen = set()
merged = []
for q in deepdive + basics:
    if q['id'] not in seen:
        seen.add(q['id'])
        merged.append(q)

merged.sort(key=lambda x: x['id'])
for i, q in enumerate(merged, 1):
    q['id'] = i

with open('questions-final.json', 'w', encoding='utf-8') as f:
    json.dump(merged, f, ensure_ascii=False, indent=2)

print(f"Final count: {len(merged)}")
