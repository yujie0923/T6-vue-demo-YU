import os
import json
import re
# import requests # <- 已移除
import torch
import torch.nn.functional as F
import pandas as pd
from transformers import BertTokenizerFast, BertForSequenceClassification
from typing import Dict, List, Any

# --- 0. 模型和規則設定 ---
MODEL_PATH = './my_final_scam_model/my_final_scam_model' 
SCAM_TERMS_FILE = 'scam_terms_202511042152.csv'
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
BOOST_AMOUNT = 0.50 # 規則增強機率提升量

# 全局變數
SCAM_KEYWORDS: List[str] = []
LEGITIMATE_KEYWORDS_MAP: Dict[str, str] = {}
SCAM_KEYWORDS_MAP: Dict[str, str] = {}

# --- 0B. 載入模型和關鍵字 ---
try:
    # 載入 BERT 模型和 Tokenizer
    tokenizer = BertTokenizerFast.from_pretrained(MODEL_PATH)
    model = BertForSequenceClassification.from_pretrained(MODEL_PATH)
    model.to(DEVICE).eval()
    print(f"✅ BERT 模型載入成功！正在使用裝置: {DEVICE}")
except Exception as e:
    print(f"致命錯誤：載入 BERT 模型失敗。請檢查 {MODEL_PATH} 資料夾是否完整。錯誤: {e}")
    exit()

def load_keywords():
    """模擬 db_manager.get_scam_keywords()，從 CSV 載入關鍵字。"""
    global SCAM_KEYWORDS, LEGITIMATE_KEYWORDS_MAP, SCAM_KEYWORDS_MAP
    
    try:
        # 假設是標準 CSV (逗號分隔)，如果出錯可能需要嘗試 sep='\t'
        df_terms = pd.read_csv(SCAM_TERMS_FILE)
        
        if 'term_text' in df_terms.columns and 'is_scam' in df_terms.columns and 'term_category' in df_terms.columns:
            
            # 將布林值轉換為小寫字串方便比對
            df_terms['is_scam'] = df_terms['is_scam'].astype(str).str.lower() == 'true'
            
            # 載入詐騙關鍵字 (用於規則增強和報告)
            scam_df = df_terms[df_terms['is_scam'] == True]
            SCAM_KEYWORDS = scam_df['term_text'].astype(str).str.lower().tolist()
            SCAM_KEYWORDS_MAP = {row['term_text'].lower(): row['term_category'] for index, row in scam_df.iterrows()}

            # 載入合法關鍵字 (用於報告)
            legit_df = df_terms[df_terms['is_scam'] == False]
            LEGITIMATE_KEYWORDS_MAP = {row['term_text'].lower(): row['term_category'] for index, row in legit_df.iterrows()}

            print(f"✅ 載入 {len(SCAM_KEYWORDS)} 個詐騙特徵和 {len(LEGITIMATE_KEYWORDS_MAP)} 個合法特徵。")
        else:
            print("⚠️ 關鍵字 CSV 欄位名稱不符 (需要 'term_text', 'is_scam', 'term_category')。關鍵字比對功能將受限。")

    except FileNotFoundError:
        print(f"⚠️ 找不到關鍵字檔案 {SCAM_TERMS_FILE}。規則增強功能將被禁用。")
    except Exception as e:
        print(f"⚠️ 載入關鍵字檔案時出錯: {e}。")

# 立即載入關鍵字
load_keywords()


# --- 1. 輔助函數 (修改為離線版本) ---

def search_url_legitimacy(url):
    """(已修改為離線) 僅標記偵測到的 URL，不進行聯網搜索。"""
    domain = "未知網域"
    try:
        domain_match = re.search(r'https?://([^/]+)', url)
        if domain_match:
            domain = domain_match.group(1)
    except Exception:
        pass # 忽略 regex 錯誤
        
    print(f"[離線模式] 偵測到網址: {domain} (未進行聯網查證)")
    return f"偵測到網址 {domain}。請注意：程式目前處於離線模式，無法驗證此網址的安全性，請自行手動檢查。"

def search_phone_number(phone):
    """(已修改為離線) 僅標記偵測到的電話號碼，不進行聯網搜索。"""
    print(f"[離線模式] 偵測到電話: {phone} (未進行聯網查證)")
    return f"偵測到電話號碼 {phone}。請注意：程式目前處於離線模式，無法驗證此號碼的安全性，請自行手動檢查。"

def extract_phone_numbers(message):
    """從消息中提取電話號碼"""
    # 擴展模式以更好地匹配台灣常見格式，同時保留原始模式
    phone_pattern = r'(\(?\+?886\)?[- ]?)?0\d{1,2}[- ]?\d{3,4}[- ]?\d{3,4}|\d{2,4}-\d{3,4}-\d{3,4}|\d{8,10}'
    phones = re.findall(phone_pattern, message)
    # 清理 findall 可能返回的元組（如果包含捕獲組）
    cleaned_phones = [p[0] if isinstance(p, tuple) else p for p in phones if (p[0] if isinstance(p, tuple) else p)]
    # 去除空字串並返回唯一值
    return list(set(filter(None, cleaned_phones)))


def extract_urls_from_message(message):
    """從消息中提取所有URL"""
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    urls = re.findall(url_pattern, message)
    return urls


# --- 2. 核心分析函數 (使用 BERT) ---

def predict_scam_risk(text: str) -> Dict[str, Any]:
    """使用 BERT 模型預測文字的詐騙機率，並加入規則增強。"""
    
    # 1. BERT 模型基礎預測
    inputs = tokenizer(
        text,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=128
    )
    inputs = {k: v.to(DEVICE) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)

    logits = outputs.logits
    probabilities = F.softmax(logits, dim=1)
    original_prob = probabilities[0][1].item() # BERT 模型的原始詐騙機率
    
    # 2. 規則增強邏輯
    is_boosted = False
    match_keyword = None
    
    text_lower = text.lower()
    for keyword in SCAM_KEYWORDS:
        if keyword in text_lower:
            is_boosted = True
            match_keyword = keyword
            break # 找到第一個就跳出
    
    scam_probability = original_prob
    
    if is_boosted:
        # 只有在模型機率本身不高時才進行增強，避免過度增強
        if original_prob < (1.0 - BOOST_AMOUNT):
             scam_probability = min(original_prob + BOOST_AMOUNT, 1.0)
        else:
             scam_probability = max(original_prob, 0.95) # 如果本來就高，確保它至少有 0.95
             is_boosted = False # 標記為非增強，因為模型自己就能判斷
    
    # 3. 轉換為風險等級 (0-100)
    scam_risk_index = int(scam_probability * 100)
    
    # 4. 生成分析和關鍵詞
    
    # 匹配詐騙特徵 (全部)
    matched_scam_features = []
    for term, category in SCAM_KEYWORDS_MAP.items():
        if term in text_lower:
            matched_scam_features.append({"term": term, "type": category})

    # 匹配合法特徵 (全部)
    matched_legitimate_features = []
    for term, category in LEGITIMATE_KEYWORDS_MAP.items():
        if term in text_lower:
            matched_legitimate_features.append({"term": term, "type": category})

    # 5. 生成分析文本
    
    if scam_probability >= 0.95:
        base_analysis = "模型判斷為詐騙，機率極高。強烈建議忽略並舉報。"
        is_scam = True
    elif scam_probability >= 0.70:
        base_analysis = "模型判斷為高風險。內容包含高風險金融、個資或緊急關鍵詞。"
        is_scam = True
    elif scam_probability >= 0.50:
        base_analysis = "模型判斷結果不確定 (機率約 50% 以上)。建議手動檢查。"
        is_scam = True
    else:
        base_analysis = "模型判斷為正常訊息，風險分數低於 50。內容缺乏詐騙性特徵。"
        is_scam = False

    if is_boosted:
        boost_note = (
            f" (註: 觸發規則增強，原始機率 {original_prob*100:.2f}%，"
            f"因偵測到關鍵詞 '{match_keyword}' 提升至 {scam_probability*100:.2f}%)"
        )
        final_analysis = base_analysis + boost_note
    else:
        final_analysis = base_analysis


    # 6. 輸出格式
    return {
        "is_scam": is_scam,
        "scam_risk_index": scam_risk_index,
        "analysis": final_analysis,
        "keywords": matched_scam_features, # 僅返回詐騙相關的關鍵詞作為主要keywords
        # 將合法特徵也放入返回，供上層使用
        "legitimate_features": matched_legitimate_features
    }


def analyze_message(user_message: str):
    # 提取並搜索URL (離線模式)
    urls = extract_urls_from_message(user_message)
    url_analysis = ""
    
    if urls:
        print(f"\n[URL檢測] 發現 {len(urls)} 個網址:")
        url_results = []
        for url in urls:
            # 此處呼叫的是已修改的離線版本
            result = search_url_legitimacy(url)
            url_results.append(f"網址: {url}\n分析: {result}")
        url_analysis = "\n\n".join(url_results)
    
    # 提取並搜索電話號碼 (離線模式)
    phones = extract_phone_numbers(user_message)
    phone_analysis = ""
    
    if phones:
        print(f"\n[電話檢測] 發現 {len(phones)} 個電話號碼:")
        phone_results = []
        for phone in phones:
            # 此處呼叫的是已修改的離線版本
            result = search_phone_number(phone)
            phone_results.append(f"電話: {phone}\n分析: {result}")
        phone_analysis = "\n\n".join(phone_results)
    
    # 進行 BERT 模型分析 (本地)
    bert_result = predict_scam_risk(user_message)

    # 構建最終的 JSON 輸出
    final_output = {
        "is_scam": bert_result['is_scam'],
        "scam_risk_index": bert_result['scam_risk_index'],
        "analysis": bert_result['analysis'],
        "keywords": bert_result['keywords'],
        "auxiliary_analysis": {
            "url_analysis": url_analysis if urls else "未偵測到網址。",
            "phone_analysis": phone_analysis if phones else "未偵測到電話號碼。",
            # 返回偵測到的合法特徵
            "db_legitimate_features_found": bert_result['legitimate_features'], 
        }
    }
    
    # 我們不再需要返回整個關鍵字 MAP，因為它們不會改變
    # 如果需要，可以取消註解以下兩行，但這會讓輸出很龐大
    # final_output['auxiliary_analysis']['db_legitimate_features_all'] = LEGITIMATE_KEYWORDS_MAP
    # final_output['auxiliary_analysis']['db_scam_features_all'] = SCAM_KEYWORDS_MAP
    
    return json.dumps(final_output, indent=4, ensure_ascii=False)

