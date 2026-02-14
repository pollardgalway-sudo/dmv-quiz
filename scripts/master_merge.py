import json
import os
from collections import Counter

def master_merge():
    # 1. 定义文件路径
    # 这里我们假设你的原有题目在 questions-all.json (或者你可以根据实际情况修改)
    original_file = 'data/questions-all.json' 
    scraped_file = 'data/questions-converted.json'
    output_file = 'data/questions-final-master.json'

    # 2. 读取原有题目
    all_data = []
    if os.path.exists(original_file):
        with open(original_file, 'r', encoding='utf-8') as f:
            all_data.extend(json.load(f))
        print(f"📖 读取原有题目: {len(all_data)} 道")
    else:
        print(f"⚠️ 找不到原有题目文件: {original_file}，将仅处理新抓取的题目。")

    # 3. 读取新抓取的题目
    if os.path.exists(scraped_file):
        with open(scraped_file, 'r', encoding='utf-8') as f:
            new_data = json.load(f)
            all_data.extend(new_data)
        print(f"📥 读取新抓取题目: {len(new_data)} 道")
    
    print(f"🔍 合计待处理题目: {len(all_data)} 道")

    # 4. 去重逻辑 (基于中文题目内容)
    seen_texts = set()
    unique_questions = []
    duplicate_count = 0

    for q in all_data:
        # 清理文本，去除空格和标点差异
        text = q.get('questionTextZh', '').strip().replace(' ', '').replace('?', '？').replace('(', '（').replace(')', '）')
        if text not in seen_texts:
            unique_questions.append(q)
            seen_texts.add(text)
        else:
            duplicate_count += 1

    # 5. 保存结果
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(unique_questions, f, ensure_ascii=False, indent=2)

    print("-" * 30)
    print(f"🎊 合并去重完成！")
    print(f"❌ 剔除了 {duplicate_count} 道重复题目")
    print(f"✅ 最终保留了 {len(unique_questions)} 道纯净题目")
    print(f"💾 结果已保存至: {output_file}")
    print("-" * 30)

if __name__ == "__main__":
    master_merge()
