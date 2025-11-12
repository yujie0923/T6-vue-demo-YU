# db_manager.py

import psycopg2
from psycopg2 import sql
import os

# --- 資料庫連線參數設定 ---
# 請替換成您自己的 PostgreSQL 連線資訊
DB_NAME = "scam_game_db" 
DB_USER = "postgres"
DB_PASSWORD = "yujie0923"
DB_HOST = "localhost" 
DB_PORT = "5432"

def get_db_connection():
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        return conn
    except psycopg2.Error as e:
        print(f"資料庫連線失敗: {e}")
        return None
# ----------------------------------------------------------------------
# 核心功能函式 (供 message_analyzer.py 使用)
# ----------------------------------------------------------------------

def get_scam_keywords():
    """
    從 scam_terms 表格中獲取所有詐騙關鍵詞和分類 (is_scam = true)。
    這是供 Python 進行字串比對，並注入 Prompt 的詐騙證據來源。
    """
    conn = get_db_connection()
    if conn is None:
        return {}
    
    cursor = conn.cursor()
    
    # 查詢所有詐騙關鍵詞
    query = "SELECT term_text, term_category FROM scam_terms WHERE is_scam = true;"
    
    try:
        cursor.execute(query)
        keywords = cursor.fetchall()
        
        # 轉換為 { '詞彙': '分類' } 的字典
        return {term_text: term_category for term_text, term_category in keywords}
        
    except psycopg2.Error as e:
        print(f"查詢詐騙關鍵詞失敗: {e}")
        return {}
        
    finally:
        cursor.close()
        conn.close()

def get_legitimate_keywords():
    """
    從 scam_terms 表格中獲取所有合法關鍵詞和分類 (is_scam = false)。
    這是供 Python 進行字串比對，並注入 Prompt 的合法證據來源。
    """
    conn = get_db_connection()
    if conn is None:
        return {}
    
    cursor = conn.cursor()
    
    # 查詢所有合法關鍵詞
    query = "SELECT term_text, term_category FROM scam_terms WHERE is_scam = false;"
    
    try:
        cursor.execute(query)
        keywords = cursor.fetchall()
        
        # 轉換為 { '詞彙': '分類' } 的字典
        return {term_text: term_category for term_text, term_category in keywords}
        
    except psycopg2.Error as e:
        print(f"查詢合法關鍵詞失敗: {e}")
        return {}
        
    finally:
        cursor.close()
        conn.close()

def get_all_scam_keywords():
    """
    保持向後兼容性，返回所有關鍵詞（包括詐騙和合法）
    """
    scam_keywords = get_scam_keywords()
    legitimate_keywords = get_legitimate_keywords()
    return {**scam_keywords, **legitimate_keywords}

