import sys
import json

print("请粘贴完整的JSON数据，然后按 Ctrl+Z 再按 Enter (Windows) 结束输入：")
print("-" * 50)

# 读取所有输入
data = sys.stdin.read()

try:
    # 验证JSON格式
    json_data = json.loads(data)

    # 保存到文件
    with open('data/questions-basics.json', 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)

    print(f"\n成功保存 {len(json_data)} 道题目到 data/questions-basics.json")

except json.JSONDecodeError as e:
    print(f"\nJSON格式错误: {e}")
    sys.exit(1)
