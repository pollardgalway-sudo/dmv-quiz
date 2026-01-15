import json

# 读取文件
with open('questions-deepdive.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# 去重（保留第一次出现的题目）
seen_ids = set()
unique_questions = []

for q in questions:
    if q['id'] not in seen_ids:
        seen_ids.add(q['id'])
        unique_questions.append(q)

# 按 ID 排序
unique_questions.sort(key=lambda x: x['id'])

# 保存
with open('questions-deepdive.json', 'w', encoding='utf-8') as f:
    json.dump(unique_questions, f, ensure_ascii=False, indent=2)

print(f'原始题目数: {len(questions)}')
print(f'去重后题目数: {len(unique_questions)}')
print(f'删除了 {len(questions) - len(unique_questions)} 道重复题目')
