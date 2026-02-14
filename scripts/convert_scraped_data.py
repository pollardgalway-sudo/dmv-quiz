import json
import os
import urllib.request

def fetch_and_convert():
    all_questions = []
    offset = 0
    limit = 200
    output_file = 'data/questions-converted.json'
    
    print("🚀 开始分批次抓取全量题库...")
    
    while True:
        url = f"https://www.jiazhoujiazhao.com/api/questions?limit={limit}&offset={offset}"
        print(f"正在抓取偏移量 {offset} 的数据...")
        
        try:
            with urllib.request.urlopen(url) as response:
                raw_data = response.read().decode('utf-8')
                data = json.loads(raw_data)
            
            questions = data.get('questions', [])
            if not questions:
                break
                
            all_questions.extend(questions)
            print(f"已获取 {len(all_questions)} / {data.get('total', '752')} 道题目")
            
            # 如果抓到的总数已经达到服务器告知的总数，或者这批抓到的数量少于 limit，说明抓完了
            if len(all_questions) >= data.get('total', 752) or len(questions) < limit:
                break
            
            offset += limit # 准备下一页
            
        except Exception as e:
            print(f"抓取过程中发生错误：{e}")
            break

    if not all_questions:
        print("错误：未获取到任何题目。")
        return

    print(f"✅ 成功获取到总计 {len(all_questions)} 道题目，正在转换格式...")

    # 转换逻辑保持不变
    converted = []
    cat_map = {
        "通用": "traffic_rules",
        "道路知识": "traffic_rules",
        "法规": "traffic_rules",
        "安全驾驶": "safe_driving",
        "标志": "signs",
        "酒精": "alcohol_and_drugs"
    }

    for item in all_questions:
        options = []
        correct_idx = item.get('correctAnswer', 0)
        raw_options = item.get('options', [])
        raw_options_en = item.get('options_en', [])
        
        for i in range(len(raw_options)):
            order = chr(65 + i)
            options.append({
                "optionText": raw_options_en[i] if i < len(raw_options_en) else (raw_options_en[0] if raw_options_en else ""),
                "optionTextZh": raw_options[i],
                "isCorrect": i == correct_idx,
                "order": order
            })

        new_item = {
            "questionText": item.get('question_en', ''),
            "questionTextZh": item.get('question', ''),
            "category": cat_map.get(item.get('category'), "traffic_rules"),
            "difficulty": item.get('difficulty', 'medium'),
            "imageUrl": item.get('image_path') or None,
            "explanation": item.get('explanation_en', ''),
            "explanationZh": item.get('explanation', ''),
            "dmvManualReference": "California DMV Handbook",
            "dmvManualUrl": None,
            "handbookVersion": "2026",
            "options": options
        }
        converted.append(new_item)

    # 保存
    os.makedirs('data', exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(converted, f, ensure_ascii=False, indent=2)

    print(f"🎉 大功告成！已保存 {len(converted)} 道题目到 {output_file}")

if __name__ == "__main__":
    fetch_and_convert()
