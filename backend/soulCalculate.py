from db_service import get_db_connection
from GameService import GameService
from db_service import get_user_quiz_score

QUIZ_SCORE_MAP = {
    "Q3": {
        "A": (-1, -2, -1),
        "B": (1, -1, 1),
        "C": (1, 1, 1),
        "D": (2, 1, 1),
    },
    "Q4": {
        "A": (-1, 0, -1),
        "B": (0, 1, 1),
        "C": (1, 1, 2),
        "D": (1, 1, 1),
    },
    "Q5": {
        "A": (0, -1, -2),
        "B": (0, -1, -1),
        "C": (1, 0, 0),
        "D": (0, 1, 1),
    },
    "Q6": {
        "A": (-1, -1, -1),
        "B": (1, 0, 0),
        "C": (1, 0, 0),
        "D": (1, 0, 1),
    },
    "Q7": {
        "A": (-1, 0, 0),
        "B": (0, 0, -1),
        "C": (0, 0, 1),
        "D": (0, 0, 1),
    },
    "Q8": {
        "A": (1, 1, 0),
        "B": (1, 2, 0),
        "C": (1, 1, 0),
        "D": (0, 1, 0),
    },
    "Q9": {
        "A": (0, 0, 0),
        "B": (0, 0, 0),
        "C": (0, 1, 0),
        "D": (0, 1, 0),
    },
    "Q10": {
        "A": (0, 0, -1),
        "B": (-2, -1, 0),
        "C": (1, 0, 1),
        "D": (0, 1, 1),
    },
    "Q11": {
        "A": (1, 1, 2),
        "B": (0, 0, -1),
        "C": (1, 0, 1),
        "D": (-1, -2, -2),
    },
    "Q12": {
        "A": (0, 1, -1),
        "B": (0, -1, -1),
        "C": (0, 1, 0),
        "D": (1, 0, 1),
    },
    "Q13": {
        "A": (0, -2, 0),
        "B": (0, 2, 0),
        "C": (0, 0, -1),
        "D": (-2, 0, 0),
    },
    "Q14": {
        "A": (1, 0, 0),
        "B": (0, 0, 0),
        "C": (0, 0, 0),
        "D": (-1, 0, 0),
    },
}

class SoulCalculate:
    def __init__(self):
        self.game_service = GameService()
    
    def get_used_wrong_combos(self, session_id):
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT auth, time, motive FROM game_rounds WHERE session_id = %s AND is_correct = 0", (session_id,))

        result = cursor.fetchall()
        cursor.close()
        db.close()
        return result

    def get_used_correct_combos(self, session_id):
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT auth, time, motive FROM game_rounds WHERE session_id = %s AND is_correct = 1", (session_id,))

        result = cursor.fetchall()
        cursor.close()
        db.close()
        return result

    def caculate_session_soul_score(self, session_id):
        """計算該 session 的靈魂分數總和"""
        
        # 獲取正確和錯誤的組合列表
        correct_combos = self.get_used_correct_combos(session_id)  # 返回 [(auth, time, motive), ...]
        wrong_combos = self.get_used_wrong_combos(session_id)      # 返回 [(auth, time, motive), ...]
        
        # 計算正確回合的總和
        correct_total = {'auth': 0, 'time': 0, 'motive': 0}
        for combo in correct_combos:
            auth, time_val, motive = combo
            correct_total['auth'] += auth if auth else 0
            correct_total['time'] += time_val if time_val else 0
            correct_total['motive'] += motive if motive else 0
        
        # 計算錯誤回合的總和
        wrong_total = {'auth': 0, 'time': 0, 'motive': 0}
        for combo in wrong_combos:
            auth, time_val, motive = combo
            wrong_total['auth'] += auth if auth else 0
            wrong_total['time'] += time_val if time_val else 0
            wrong_total['motive'] += motive if motive else 0
        
        # 計算最終分數（正確 - 錯誤）
        final_score = {
            'auth': correct_total['auth'] - wrong_total['auth'],
            'time': correct_total['time'] - wrong_total['time'],
            'motive': correct_total['motive'] - wrong_total['motive']
        }
        
        return final_score

    def update_session_soul_score(self, session_id):
        session_soul_score = self.caculate_session_soul_score(session_id)
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("UPDATE game_sessions SET auth = %s, time = %s, motive = %s WHERE session_id = %s", (session_soul_score['auth'], session_soul_score['time'], session_soul_score['motive'], session_id))
        db.commit()
        cursor.close()
        db.close()

    def calculate_current_user_soul_score(self, user_id):
        """根據用戶的遊戲歷史，使用加權滑動窗口計算靈魂分數"""
        
        db = get_db_connection()
        if db is None:
            return None
            
        try:
            cursor = db.cursor()
            
            # 查詢用戶所有已完成的遊戲，按完成時間排序（最新的在前）
            cursor.execute("""
                SELECT auth, time, motive, session_id, complete_time 
                FROM game_sessions 
                WHERE user_id = %s AND status = 'completed' AND complete_time IS NOT NULL
                ORDER BY complete_time DESC
                LIMIT 20
            """, (user_id,))
            
            sessions = cursor.fetchall()
            
            if not sessions:
                cursor.close()
                db.close()
                return {
                    'user_id': user_id,
                    'auth': 0.0,
                    'time': 0.0,
                    'motive': 0.0
                }
            
            # 初始化加權分數
            weighted_auth = 0.0
            weighted_time = 0.0
            weighted_motive = 0.0
            total_weight = 0.0
            
            # 根據位置計算加權分數
            for idx, session in enumerate(sessions):
                auth, time_val, motive, session_id, complete_time = session
                
                # 分段加權：最近5次=1.0, 6-10次=0.8, 11-20次=0.6, 超過20次不計算
                if idx < 5:  # 最近 5 次遊戲
                    weight = 1.0
                elif idx < 10:  # 6-10 次
                    weight = 0.8
                elif idx < 20:  # 11-20 次
                    weight = 0.6
                else:
                    weight = 0.0  # 不計算
                
                # 累加加權分數
                weighted_auth += (auth if auth else 0) * weight
                weighted_time += (time_val if time_val else 0) * weight
                weighted_motive += (motive if motive else 0) * weight
                total_weight += weight
            
            # 標準化（除以總權重）
            if total_weight > 0:
                weighted_auth /= total_weight
                weighted_time /= total_weight
                weighted_motive /= total_weight
            
            result = {
                'user_id': user_id,
                'auth': round(weighted_auth, 2),
                'time': round(weighted_time, 2),
                'motive': round(weighted_motive, 2)
            }
            
            cursor.close()
            db.close()
            return result
            
        except Exception as e:
            print(f"計算用戶靈魂分數失敗: {e}")
            if db:
                cursor.close()
                db.close()
            return None


    def define_user_animals(self, user_id):
        # 獲取加權靈魂分數
        user_soul_score = self.calculate_current_user_soul_score(user_id)
        
        # 處理 None 情況
        if user_soul_score is None:
            return None
        
        # 轉換為分數判斷（使用 -1 和 1）
        auth_bit = 0 if user_soul_score['auth'] <= 0 else 1
        time_bit = 0 if user_soul_score['time'] <= 0 else 1
        motive_bit = 0 if user_soul_score['motive'] <= 0 else 1
        
        db = get_db_connection()
        if db is None:
            return None
        try:
            cursor = db.cursor()
            cursor.execute("""
                SELECT animal_name, description AS animal_description, atm
                FROM animals
                WHERE auth_dimension = %s AND time_dimension = %s AND motive_dimension = %s
                LIMIT 1
            """, (auth_bit, time_bit, motive_bit))
            animal = cursor.fetchone()
            if not animal:
                cursor.close()
                db.close()
                return None

            animal_name, animal_description, atm_code = animal

            cursor.close()
            db.close()
            
            # 返回字典格式
            result = {
                'animal_name': animal_name,
                'animal_description': animal_description,
                'animal_ATM_code': atm_code,
                'user_id': user_id,
                'soul_scores': user_soul_score
            }
            return result
            
        except Exception as e:
            print(f"查詢動物資料失敗: {e}")
            if db:
                cursor.close()
                db.close()
            return None

    def get_user_history_soul_score(self, user_id):
        db = get_db_connection()
        if db is None:
            return {
                'user_id': user_id,
                'auth': 0,
                'time': 0,
                'motive': 0
            }

        try:
            cursor = db.cursor()
            cursor.execute("""
                SELECT COALESCE(auth, 0), COALESCE(time, 0), COALESCE(motive, 0)
                FROM game_sessions
                WHERE user_id = %s AND status = 'completed' AND complete_time IS NOT NULL
            """, (user_id,))
            sessions = cursor.fetchall()

            if not sessions:
                cursor.close()
                db.close()
                return {
                    'user_id': user_id,
                    'auth': 0,
                    'time': 0,
                    'motive': 0
                }

            totals = {'auth': 0, 'time': 0, 'motive': 0}
            for auth, time_val, motive in sessions:
                totals['auth'] += auth or 0
                totals['time'] += time_val or 0
                totals['motive'] += motive or 0

            cursor.close()
            db.close()
            return {
                'user_id': user_id,
                'auth': totals['auth'],
                'time': totals['time'],
                'motive': totals['motive']
            }
        except Exception as e:
            if db:
                cursor.close()
                db.close()
            print(f"獲取用戶歷史靈魂分數失敗: {e}")
            return {
                'user_id': user_id,
                'auth': 0,
                'time': 0,
                'motive': 0
            }

    def calculate_quiz_soul_score(self, answers):
        if not answers:
            raise ValueError("缺少測驗答案")

        total_auth = 0
        total_time = 0
        total_motive = 0

        for answer in answers:
            question_id = str(answer.get('question_id', '')).strip().upper()
            choice = str(answer.get('choice', '')).strip().upper()

            if not question_id or not choice:
                continue

            score_delta = QUIZ_SCORE_MAP.get(question_id, {}).get(choice)
            if score_delta:
                auth_delta, time_delta, motive_delta = score_delta
                total_auth += auth_delta
                total_time += time_delta
                total_motive += motive_delta

        return {
            "auth": total_auth,
            "time": total_time,
            "motive": total_motive
        }

    def calculate_combined_user_soul_score(self, user_id):
        quiz_scores = get_user_quiz_score(user_id)
        history_scores = self.calculate_current_user_soul_score(user_id)

        if quiz_scores is None and history_scores is None:
            return None

        combined = {
            "auth": 0,
            "time": 0,
            "motive": 0
        }

        if quiz_scores:
            combined["auth"] += quiz_scores.get("auth", 0)
            combined["time"] += quiz_scores.get("time", 0)
            combined["motive"] += quiz_scores.get("motive", 0)

        if history_scores:
            combined["auth"] += history_scores.get("auth", 0)
            combined["time"] += history_scores.get("time", 0)
            combined["motive"] += history_scores.get("motive", 0)

        return {
            "quiz": quiz_scores,
            "history": history_scores,
            "combined": combined
        }

    def get_user_quiz_animal(self, quiz_scores, user_id=None):
        if quiz_scores is None:
            return None

        auth_bit = 0 if quiz_scores["auth"] <= 0 else 1
        time_bit = 0 if quiz_scores["time"] <= 0 else 1
        motive_bit = 0 if quiz_scores["motive"] <= 0 else 1

        db = get_db_connection()
        if db is None:
            return None
        try:
            cursor = db.cursor()
            cursor.execute("""
                SELECT animal_name, description AS animal_description, atm
                FROM animals
                WHERE auth_dimension = %s AND time_dimension = %s AND motive_dimension = %s
                LIMIT 1
            """, (auth_bit, time_bit, motive_bit))
            row = cursor.fetchone()
            cursor.close()
            db.close()

            if not row:
                return None

            animal_name, animal_description, atm_code = row
            return {
                "animal_name": animal_name,
                "animal_description": animal_description,
                "animal_ATM_code": atm_code,
                "soul_scores": quiz_scores,
                "user_id": user_id
            }
        except Exception as e:
            print(f"依據測驗分數取得動物失敗: {e}")
            if cursor:
                cursor.close()
            if db:
                db.close()
            return None

    def get_combined_animal(self, user_id):
        scores = self.calculate_combined_user_soul_score(user_id)
        if not scores or not scores.get("combined"):
            return None

        animal = self.get_user_quiz_animal(scores["combined"], user_id)
        if animal is None:
            return None

        animal["soul_scores"] = scores
        return animal