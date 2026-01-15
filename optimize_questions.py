import json
import sys

def optimize_questions(input_file, output_file):
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
            questions = json.loads(content)
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
        # 尝试修复常见问题
        content = content.strip()
        if not content.endswith(']'):
            content += '\n]'
        try:
            questions = json.loads(content)
        except:
            print("无法自动修复，请检查文件")
            return False
    
    # 优化数据
    optimized = []
    seen_ids = set()
    
    for q in questions:
        # 去重
        if q['id'] in seen_ids:
            print(f"警告: 发现重复ID {q['id']}")
            continue
        seen_ids.add(q['id'])
        
        # 标准化结构
        optimized_q = {
            'id': q['id'],
            'category': q.get('category', 'Literacy'),
            'question': q['question'],
            'options': q['options'],
            'answer': q['answer'],
            'explanation': q['explanation']
        }
        
        # 添加dmv_ref（如果存在）
        if 'dmv_ref' in q:
            optimized_q['dmv_ref'] = q['dmv_ref']
        
        optimized.append(optimized_q)
    
    # 按ID排序
    optimized.sort(key=lambda x: x['id'])
    
    # 重新编号（确保连续）
    for i, q in enumerate(optimized, 1):
        q['id'] = i
    
    # 保存
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(optimized, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 优化完成: {len(optimized)} 道题目")
    print(f"   输出文件: {output_file}")
    return True

if __name__ == '__main__':
    optimize_questions('data/questions-deepdive-fixed.json', 'data/questions-optimized.json')
