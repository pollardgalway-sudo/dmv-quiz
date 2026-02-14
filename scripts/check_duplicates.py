import json
import os
from collections import Counter

def check_duplicates(file_path):
    if not os.path.exists(file_path):
        print(f"❌ 找不到文件: {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"📊 正在检查 {len(questions)} 道题目...")
    
    # 使用中文题目内容作为唯一标识进行检查
    # 我们先进行简单的去空格处理，防止因为空格导致的误判
    texts = [q.get('questionTextZh', '').strip() for q in questions]
    
    counts = Counter(texts)
    duplicates = {text: count for text, count in counts.items() if count > 1}

    if not duplicates:
        print("✅ 太棒了！没有发现完全重复的题目。")
    else:
        print(f"⚠️ 发现了 {len(duplicates)} 组重复题目：")
        for text, count in duplicates.items():
            print(f"  - 重复 {count} 次: {text[:50]}...")
            
    # 还可以检查英文内容作为辅助参考
    texts_en = [q.get('questionText', '').strip() for q in questions]
    counts_en = Counter(texts_en)
    duplicates_en = {text: count for text, count in counts_en.items() if count > 1}
    
    if duplicates_en and len(duplicates_en) != len(duplicates):
        print(f"💡 另外发现 {len(duplicates_en)} 组英文描述重复的情况，可能题目内容一致但翻译略有不同。")

    # 如果有重复，我们可以生成一个去重后的版本
    if duplicates or duplicates_en:
        seen = set()
        unique_questions = []
        for q in questions:
            txt = q.get('questionTextZh', '').strip()
            if txt not in seen:
                unique_questions.append(q)
                seen.add(txt)
        
        output_path = 'data/questions-unique.json'
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(unique_questions, f, ensure_ascii=False, indent=2)
        print(f"\n✨ 已自动生成去重后的题库：{output_path}")
        print(f"   去重后剩余题目数量: {len(unique_questions)}")

if __name__ == "__main__":
    check_duplicates('data/questions-converted.json')
