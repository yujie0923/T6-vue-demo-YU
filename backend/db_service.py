import psycopg2
from psycopg2 import sql, errors
from psycopg2.extras import RealDictCursor
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

#user table function
def get_user_data(username):
    conn = get_db_connection()
    if conn is None:
        return None

    cursor = None
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'users'
        """)
        available_columns = {row[0] for row in cursor.fetchall()}
        cursor.close()

        base_columns = ['userid', 'username', 'password', 'email']
        optional_columns = []
        if 'role' in available_columns:
            optional_columns.append('role')
        if 'quiz_status' in available_columns:
            optional_columns.append('quiz_status')

        selected_columns = [col for col in base_columns if col in available_columns] + optional_columns
        if not selected_columns:
            return None

        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = sql.SQL("SELECT {} FROM users WHERE username = %s").format(
            sql.SQL(', ').join(sql.Identifier(col) for col in selected_columns)
        )
        cursor.execute(query, (username,))
        user_data = cursor.fetchone()
        return dict(user_data) if user_data else None
    except Exception as e:
        print(f"獲取用戶數據失敗: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        conn.close()

def create_user(username, password, email):
    conn = get_db_connection()
    if conn is None:
        return None

    cursor = None
    try:
        cursor = conn.cursor()
        query = sql.SQL("INSERT INTO users (username, password, email) VALUES ({username}, {password}, {email}) RETURNING userid").format(username=sql.Literal(username), password=sql.Literal(password), email=sql.Literal(email))
        cursor.execute(query)
        user_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        return user_id
    except Exception as e:
        print(f"創建用戶失敗: {e}")
        if conn:
            conn.rollback()
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        return None

def update_user(user_id, username, password, email):
    conn = get_db_connection()
    if conn is None:
        return False

    cursor = conn.cursor()
    query = sql.SQL("UPDATE users SET username = {username}, password = {password}, email = {email} WHERE id = {user_id}").format(username=sql.Literal(username), password=sql.Literal(password), email=sql.Literal(email), user_id=sql.Literal(user_id))
    cursor.execute(query)
    conn.commit()
    cursor.close()
    conn.close()
    return True

def delete_user(user_id):
    conn = get_db_connection()
    if conn is None:
        return False

    cursor = conn.cursor()
    query = sql.SQL("DELETE FROM users WHERE id = {user_id}").format(user_id=sql.Literal(user_id))
    cursor.execute(query)
    conn.commit()
    cursor.close()
    conn.close()
    return True

def get_user_quiz_score(user_id):
    conn = get_db_connection()
    if conn is None:
        return None

    cursor = None
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT auth, time, motive FROM user_quiz WHERE user_id = %s",
            (user_id,)
        )
        row = cursor.fetchone()
        if not row:
            return None
        return {
            "auth": row[0],
            "time": row[1],
            "motive": row[2]
        }
    except Exception as e:
        print(f"讀取 user_quiz 失敗: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        conn.close()

def save_user_quiz_score(user_id, auth, time_val, motive):
    conn = get_db_connection()
    if conn is None:
        return False

    cursor = None
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_quiz (user_id, auth, time, motive)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (user_id) DO UPDATE
            SET auth = EXCLUDED.auth,
                time = EXCLUDED.time,
                motive = EXCLUDED.motive
        """, (user_id, auth, time_val, motive))
        conn.commit()
        return True
    except Exception as e:
        print(f"寫入 user_quiz 失敗: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if cursor:
            cursor.close()
        conn.close()

def update_quiz_status(user_id, status):
    conn = get_db_connection()
    if conn is None:
        return False

    cursor = None
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET quiz_status = %s WHERE userid = %s",
            (status, user_id)
        )
        if cursor.rowcount == 0:
            if conn:
                conn.rollback()
            return False
        conn.commit()
        return True
    finally:
        if cursor:
            cursor.close()
        conn.close()

#scam_message table function
def get_scam_categories():
    """獲取所有詐騙題目的類別列表"""
    conn = get_db_connection()
    if conn is None:
        return []
    
    cursor = conn.cursor()
    query = sql.SQL("SELECT DISTINCT scam_category FROM scam_message WHERE is_truth_message = false ORDER BY scam_category")
    cursor.execute(query)
    categories = cursor.fetchall()
    cursor.close()
    conn.close()
    
    # 將結果轉換為簡單的列表
    return [category[0] for category in categories]

def get_scam_message_sources():
    conn = get_db_connection()
    if conn is None:
        return []
    
    cursor = conn.cursor()
    query = sql.SQL("SELECT DISTINCT message_source FROM scam_message WHERE is_truth_message = false ORDER BY message_source")
    cursor.execute(query)
    sources = cursor.fetchall()
    cursor.close()
    conn.close()
    return [source[0] for source in sources]

def get_scam_message(scam_category, message_source, is_truth_message):
    conn = get_db_connection()
    if conn is None:
        return None
    
    cursor = conn.cursor()
    query = sql.SQL("SELECT message_id, message_source, message_text, is_truth_message, scam_category FROM scam_message WHERE scam_category = {scam_category} AND message_source = {message_source} AND is_truth_message = {is_truth_message} ORDER BY RANDOM()").format(scam_category=sql.Literal(scam_category), message_source=sql.Literal(message_source), is_truth_message=sql.Literal(is_truth_message))
    cursor.execute(query)
    message_data = cursor.fetchone()
    cursor.close()
    conn.close()
    return message_data

def get_message_by_soul_score(auth, time, motive, is_truth_message, exclude_ids=None):
    """根據靈魂分數 (auth, time, motive) 獲取簡訊
    
    Args:
        auth: 權威分數 (0 或 1)
        time: 時間分數 (0 或 1)
        motive: 動機分數 (0 或 1)
        is_truth_message: 是否為真實訊息
        exclude_ids: 要排除的 message_id 列表（可選）
    
    Returns:
        符合條件的簡訊，格式: (message_id, message_source, message_text, is_truth_message, scam_category, message_sender)
    """
    conn = get_db_connection()
    if conn is None:
        return None
    
    try:
        cursor = conn.cursor()
        
        # 構建查詢條件（同時返回靈魂分數以便後續檢查）
        base_query = """
            SELECT message_id, message_source, message_text, is_truth_message, scam_category, message_sender, auth, time, motive
            FROM scam_message
            WHERE auth = %s AND time = %s AND motive = %s AND is_truth_message = %s
        """
        params = [auth, time, motive, is_truth_message]
        
        # 如果有排除列表，添加排除條件
        if exclude_ids and len(exclude_ids) > 0:
            placeholders = ','.join(['%s'] * len(exclude_ids))
            base_query += f" AND message_id NOT IN ({placeholders})"
            params.extend(exclude_ids)
        
        base_query += " ORDER BY RANDOM() LIMIT 1"
        
        cursor.execute(base_query, params)
        message_data = cursor.fetchone()
        cursor.close()
        conn.close()
        return message_data
    except Exception as e:
        print(f"查詢靈魂分數訊息失敗: {e}")
        if conn:
            cursor.close()
            conn.close()
        return None

def get_scam_message_analysis(message_id):
    conn = get_db_connection()
    if conn is None:
        return None
    
    cursor = conn.cursor()
    query = sql.SQL("SELECT message_analysis FROM scam_message WHERE message_id = {message_id}").format(message_id=sql.Literal(message_id))
    cursor.execute(query)
    analysis_data = cursor.fetchone()
    cursor.close()
    conn.close()
    return analysis_data

def get_multiple_message_analysis(message_ids):
    """批量獲取多個訊息的解析"""
    conn = get_db_connection()
    if conn is None or not message_ids:
        return []
    
    cursor = conn.cursor()
    # 使用 IN 子句批量查詢
    placeholders = ','.join(['%s'] * len(message_ids))
    query = f"SELECT message_id, message_analysis FROM scam_message WHERE message_id IN ({placeholders})"
    cursor.execute(query, message_ids)
    analysis_data = cursor.fetchall()
    cursor.close()
    conn.close()
    return analysis_data

def get_message_with_analysis(message_id):
    """獲取訊息內容和解析"""
    conn = get_db_connection()
    if conn is None:
        return None
    
    cursor = conn.cursor()
    query = sql.SQL("""
        SELECT message_id, message_source, message_text, is_truth_message, scam_category, message_analysis
        FROM scam_message
        WHERE message_id = {message_id}
    """).format(message_id=sql.Literal(message_id))
    cursor.execute(query)
    message_data = cursor.fetchone()
    cursor.close()
    conn.close()
    return message_data
    
