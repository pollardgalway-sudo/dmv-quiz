import json
import re

# 读取文件内容
with open('questions-deepdive.json', 'r', encoding='utf-8') as f:
    content = f.read()

# 修复第1214行的问题：补全缺失的内容
content = content.replace(
    '"zh-Hans": "远光灯会被雾气反射产生眩光，导致视线模糊。近光灯照射地面效果更好\n      [',
    '"zh-Hans": "远光灯会被雾气反射产生眩光，导致视线模糊。近光灯照射地面效果更好。",\n      "zh-Hant": "遠光燈會被霧氣反射產生眩光，導致視線模糊。近光燈照射地面效果更好。"\n    },\n    "dmv_ref": {\n      "page": "82",\n      "section": "Section 8: Driving Hazards"\n    }\n  },\n  {'
)

# 保存修复后的内容
with open('questions-deepdive-temp.json', 'w', encoding='utf-8') as f:
    f.write(content)

# 尝试解析JSON
try:
    with open('questions-deepdive-temp.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # 去重
    seen_ids = set()
    unique_questions = []

    for q in questions:
        if q['id'] not in seen_ids:
            seen_ids.add(q['id'])
            unique_questions.append(q)

    # 按ID排序
    unique_questions.sort(key=lambda x: x['id'])

    # 保存
    with open('questions-deepdive.json', 'w', encoding='utf-8') as f:
        json.dump(unique_questions, f, ensure_ascii=False, indent=2)

    print(f'✅ 修复成功！')
    print(f'原始题目数: {len(questions)}')
    print(f'去重后题目数: {len(unique_questions)}')
    print(f'删除了 {len(questions) - len(unique_questions)} 道重复题目')
    print(f'\n📝 你需要添加的新题目ID: 201-270 (共70道)')

except Exception as e:
    print(f'❌ 错误: {e}')
