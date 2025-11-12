from db_service import get_scam_message, get_scam_message_analysis, get_scam_categories, get_scam_message_sources, get_db_connection, get_message_by_soul_score
import random
import time
import uuid

class GameService:
    def __init__(self):
        self.game_sessions = {}  # 存儲遊戲會話

    def get_messages_by_soul_combo(self, auth, time, motive, exclude_ids=None):
        """根據給定的靈魂分數組合，從資料庫獲取 2個真實訊息 + 1個詐騙訊息"""
        
        messages = []
        used_ids = set(exclude_ids) if exclude_ids else set()
        
        # 獲取2個真實訊息（使用相同的靈魂分數組合）
        real_count = 0
        max_attempts = 20
        attempts = 0
        
        while real_count < 2 and attempts < max_attempts:
            real_message = get_message_by_soul_score(auth, time, motive, True, list(used_ids))
            if real_message and real_message[0] not in used_ids:
                messages.append(real_message)
                used_ids.add(real_message[0])
                real_count += 1
            attempts += 1
        
        # 獲取1個詐騙訊息（使用相同的靈魂分數組合）
        scam_count = 0
        attempts = 0
        
        while scam_count < 1 and attempts < max_attempts:
            scam_message = get_message_by_soul_score(auth, time, motive, False, list(used_ids))
            if scam_message and scam_message[0] not in used_ids:
                messages.append(scam_message)
                used_ids.add(scam_message[0])
                scam_count += 1
            attempts += 1
        
        # 檢查是否獲得了正確的組合（2真1假）
        if len(messages) == 3:
            scam_messages = [msg for msg in messages if not msg[3]]  # is_truth_message = False
            real_messages = [msg for msg in messages if msg[3]]      # is_truth_message = True
            
            if len(scam_messages) == 1 and len(real_messages) == 2:
                # 隨機打亂順序
                random.shuffle(messages)
                return messages
        
        # 如果無法獲取足夠的訊息，返回空列表
        return []

    def get_round_by_random_combo(self, current_total_score, exclude_ids=None):
        """隨機選取一個 auth、time、motive 組合，並調用函數1獲取一個關卡的題目 (auth, time, motive)"""
        # 固定的7種靈魂分數組合
        possible_combos = [(1,0,0), (0,1,0), (0,0,1), (1,1,0), (1,0,1), (0,1,1), (1,1,1)]
        
        # 過濾出可以使用的組合（加上當前總分後不會超過5）
        available_scores = [
            (a, t, m) for (a, t, m) in possible_combos
            if current_total_score['auth'] + a <= 5 and 
               current_total_score['time'] + t <= 5 and 
               current_total_score['motive'] + m <= 5
        ]
        
        if not available_scores:
            # 沒有可用的組合（已經達到或超過 (5,5,5)）
            return None, None
        
        # 從可用的組合中隨機選擇一個
        selected_combo = random.choice(available_scores)
        auth, time, motive = selected_combo
        
        # 調用函數1獲取3個題目（2真1假）
        messages = self.get_messages_by_soul_combo(auth, time, motive, exclude_ids)
        
        # 檢查是否成功獲取到3個題目
        if len(messages) == 3:
            return messages, selected_combo
        else:
            # 獲取失敗，返回 None
            return None, None

    def plan_rounds_with_total_score_5(self, exclude_ids=None):
        """規劃多個 rounds，確保靈魂分數總和恰好等於 (5,5,5)"""

        total_score = {'auth': 0, 'time': 0, 'motive': 0}
        all_rounds = []
        used_combos = []
        used_message_ids = set(exclude_ids) if exclude_ids else set()
        max_rounds = 15  # 最大 rounds 數（防止無限循環）
        consecutive_failures = 0
        max_consecutive_failures = 5  # 連續失敗5次後停止
        
        round_num = 1
        
        while round_num <= max_rounds:
            # 檢查是否已經達到 (5,5,5)
            if total_score['auth'] == 5 and total_score['time'] == 5 and total_score['motive'] == 5:
                print(f"已達到目標分數 (5,5,5)，停止獲取。共獲取了 {len(all_rounds)} 個 rounds")
                break
            
            # 調用函數2獲取一個 round 的題目
            messages, selected_combo = self.get_round_by_random_combo(total_score, list(used_message_ids))
            
            if messages is None or selected_combo is None:
                # 獲取失敗
                consecutive_failures += 1
                print(f"第 {round_num} 輪獲取失敗，連續失敗 {consecutive_failures} 次")
                
                if consecutive_failures >= max_consecutive_failures:
                    print(f"連續失敗 {max_consecutive_failures} 次，停止獲取")
                    break
                
                round_num += 1
                continue
            
            # 獲取成功
            consecutive_failures = 0  # 重置連續失敗計數
            
            # 更新 total_score
            auth, time, motive = selected_combo
            total_score['auth'] += auth
            total_score['time'] += time
            total_score['motive'] += motive
            
            # 記錄使用的組合
            used_combos.append(selected_combo)
            
            # 記錄已使用的訊息 ID
            for msg in messages:
                used_message_ids.add(msg[0])
            
            # 添加到所有 rounds
            all_rounds.append({
                'round_number': round_num,
                'questions': messages,
                'combo': selected_combo
            })
            
            print(f"第 {round_num} 輪：使用組合 {selected_combo}，當前總分 auth={total_score['auth']}, time={total_score['time']}, motive={total_score['motive']}")
            
            round_num += 1
        
        # 檢查最終分數
        if total_score['auth'] != 5 or total_score['time'] != 5 or total_score['motive'] != 5:
            print(f"警告：最終分數未達到 (5,5,5)，當前分數為 ({total_score['auth']},{total_score['time']},{total_score['motive']})")
        
        return all_rounds, used_combos, total_score

    def get_round_question(self, user_id, game_mode="normal"):
        """獲取遊戲關卡的題目，確保不重複，並在資料庫中創建遊戲會話 """
        # 先獲取用戶名
        conn = get_db_connection()
        if conn is None:
            return None
        
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT username FROM users WHERE userid = %s", (user_id,))
            user_result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if not user_result:
                print(f"用戶不存在: user_id={user_id}")
                return None
            
            username = user_result[0]
        except Exception as e:
            print(f"獲取用戶名失敗: {e}")
            if conn:
                cursor.close()
                conn.close()
            return None
        
        # 生成 session_id
        session_id = f"game_{user_id}_{int(time.time())}"
        
        # 在資料庫中創建遊戲會話和初始分數記錄
        created_session_id = self.create_game_session(user_id, username, game_mode, session_id)
        if not created_session_id:
            print(f"創建資料庫會話失敗: session_id={session_id}")
            return None
        
        # 使用函數3規劃所有 rounds，確保靈魂分數總和為 (5,5,5)
        all_rounds, used_combos, final_score = self.plan_rounds_with_total_score_5(exclude_ids=None)
        
        # 檢查是否成功獲取到 rounds
        if not all_rounds or len(all_rounds) == 0:
            print(f"無法獲取到任何 rounds")
            return None
        
        # 整理 rounds 數據，確保格式與前端兼容
        # 移除 combo 字段（前端不需要），只保留 round_number 和 questions
        formatted_rounds = []
        for round_data in all_rounds:
            formatted_rounds.append({
                'round_number': round_data['round_number'],
                'questions': round_data['questions']
            })
        
        # 收集所有使用的訊息 ID（用於遊戲會話記錄）
        used_message_ids = set()
        for round_data in all_rounds:
            for msg in round_data['questions']:
                used_message_ids.add(msg[0])
        
        # 創建遊戲會話（內存）
        self.game_sessions[session_id] = {
            'user_id': user_id,
            'game_mode': game_mode,
            'rounds': formatted_rounds,
            'used_combos': used_combos,  # 保存使用的靈魂分數組合列表
            'final_score': final_score,  # 保存最終的靈魂分數總和
            'current_round': 1,
            'score': 0,
            'start_time': time.time(),
            'used_message_ids': used_message_ids
        }
        
        print(f"成功創建遊戲會話 {session_id}，共 {len(formatted_rounds)} 個 rounds，最終靈魂分數: {final_score}")
        
        return {
            'session_id': session_id,
            'total_rounds': len(formatted_rounds),  # 動態 round 數量
            'game_mode': game_mode,
            'rounds': formatted_rounds,
            'status': 'ready'
        }
    
    def get_round_by_number(self, session_id, round_number):
        """根據回合號獲取特定關卡的題目"""
        if session_id not in self.game_sessions:
            return None
        
        session = self.game_sessions[session_id]
        
        if round_number < 1 or round_number > len(session['rounds']):
            return None
        
        return session['rounds'][round_number - 1]

    def create_game_session(self, user_id, username, game_mode="normal", session_id=None):
        """創建遊戲會話並存儲到資料庫"""
        # 如果沒有提供 session_id，則自動生成
        if session_id is None:
            session_id = f"game_{user_id}_{int(time.time())}"
        
        conn = get_db_connection()
        if conn is None:
            return None
            
        try:
            cursor = conn.cursor()
            
            # 插入遊戲會話
            cursor.execute("""
                INSERT INTO game_sessions (user_id, session_id, username, game_mode, status)
                VALUES (%s, %s, %s, %s, %s)
            """, (user_id, session_id, username, game_mode, 'active'))
            
            # 插入初始分數記錄
            cursor.execute("""
                INSERT INTO game_scores (session_id, total_score, correct_score, speed_score, correct_answers, wrong_answers, accuracy_rate)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (session_id, 0, 0, 0, 0, 0, 0.0))
            
            conn.commit()
            return session_id
            
        except Exception as e:
            print(f"創建遊戲會話失敗: {e}")
            conn.rollback()
            return None
        finally:
            cursor.close()
            conn.close()

    def record_round_result(self, session_id, round_number, user_choice_id, correct_answer_id, is_correct, response_time):
        """記錄單回合結果"""
        
        conn = get_db_connection()
        if conn is None:
            return False
        
        # 獲取該 round 使用的靈魂分數組合
        auth_score, time_score, motive_score = 0, 0, 0  # 默認值
        found_combo = False
        
        # 方法1：優先從 game_sessions 內存中獲取（最快）
        if session_id in self.game_sessions:
            used_combos = self.game_sessions[session_id].get('used_combos', [])
            # round_number 是 1-based，但 used_combos 是 0-based 的列表
            if round_number > 0 and round_number <= len(used_combos):
                combo = used_combos[round_number - 1]
                auth_score, time_score, motive_score = combo
                found_combo = True
                print(f"從內存獲取：第 {round_number} 輪使用靈魂分數組合: auth={auth_score}, time={time_score}, motive={motive_score}")
        
        # 方法2：如果內存中沒有，從資料庫查詢該 round 題目的靈魂分數組合
        if not found_combo:
            try:
                cursor = conn.cursor()
                # 從正確答案的 message_id 查詢靈魂分數（因為正確答案肯定在資料庫中）
                cursor.execute("""
                    SELECT auth, time, motive 
                    FROM scam_message 
                    WHERE message_id = %s
                """, (correct_answer_id,))
                
                soul_result = cursor.fetchone()
                if soul_result:
                    auth_score, time_score, motive_score = soul_result
                    found_combo = True
                    print(f"從資料庫獲取：第 {round_number} 輪使用靈魂分數組合: auth={auth_score}, time={time_score}, motive={motive_score}")
                else:
                    # 如果正確答案查不到，嘗試用用戶選擇的答案
                    cursor.execute("""
                        SELECT auth, time, motive 
                        FROM scam_message 
                        WHERE message_id = %s
                    """, (user_choice_id,))
                    
                    soul_result = cursor.fetchone()
                    if soul_result:
                        auth_score, time_score, motive_score = soul_result
                        found_combo = True
                        print(f"從資料庫獲取（使用用戶選擇）：第 {round_number} 輪使用靈魂分數組合: auth={auth_score}, time={time_score}, motive={motive_score}")
                
                cursor.close()
            except Exception as e:
                print(f"查詢靈魂分數組合失敗: {e}")
            
        # 如果還是沒找到，輸出警告但繼續執行（使用默認值 0）
        if not found_combo:
            print(f"⚠️ 警告：無法獲取第 {round_number} 輪的靈魂分數組合，將使用默認值 (0, 0, 0)")
            
        try:
            cursor = conn.cursor()
            
            # 計算基礎分數和速度獎勵
            base_score = 10 if is_correct else 0
            speed_bonus = self._calculate_speed_bonus(response_time, is_correct)
            total_round_score = base_score + speed_bonus
            
            # 插入回合記錄（包含 auth、time、motive）
            cursor.execute("""
                INSERT INTO game_rounds (session_id, round_number, user_choice_id, correct_answer_id, is_correct, response_time, base_score, speed_bonus, total_round_score, auth, time, motive)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (session_id, round_number, user_choice_id, correct_answer_id, is_correct, response_time, base_score, speed_bonus, total_round_score, auth_score, time_score, motive_score))
                
                # 依照答題正確與否加總 / 扣除對應的靈魂分數
            multiplier = 1 if is_correct else -1
            delta_auth = (auth_score or 0) * multiplier
            delta_time = (time_score or 0) * multiplier
            delta_motive = (motive_score or 0) * multiplier
                
            cursor.execute("""
                UPDATE game_sessions
                SET 
                    auth = COALESCE(auth, 0) + %s,
                    time = COALESCE(time, 0) + %s,
                    motive = COALESCE(motive, 0) + %s
                WHERE session_id = %s
            """, (delta_auth, delta_time, delta_motive, session_id))
                
            conn.commit()
            cursor.close()
            return True
            
        except Exception as e:
            print(f"記錄回合結果失敗: {e}")
            conn.rollback()
            if cursor:
                cursor.close()
            return False
        finally:
            conn.close()

    def _calculate_speed_bonus(self, response_time, is_correct):
        """計算速度獎勵分數 - 只有答對才有速度獎勵"""
        if not is_correct:
            return 0  # 答錯的話速度獎勵為0
        
        if response_time <= 1000:  # 1秒內
            return 15
        elif response_time <= 2000:  # 2秒內
            return 10
        elif response_time <= 3000:  # 3秒內
            return 5
        else:
            return 0

    def update_game_score(self, session_id):
        """更新遊戲總分數"""
        conn = get_db_connection()
        if conn is None:
            return False
            
        try:
            cursor = conn.cursor()
            
            # 計算總分數
            cursor.execute("""
                SELECT 
                    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
                    SUM(CASE WHEN is_correct THEN 0 ELSE 1 END) as wrong_answers,
                    SUM(base_score) as correct_score,
                    SUM(speed_bonus) as speed_score,
                    SUM(total_round_score) as total_score
                FROM game_rounds 
                WHERE session_id = %s
            """, (session_id,))
            
            result = cursor.fetchone()
            if result:
                correct_answers, wrong_answers, correct_score, speed_score, total_score = result
                
                # 計算準確率
                total_questions = correct_answers + wrong_answers
                accuracy_rate = correct_answers / total_questions if total_questions > 0 else 0.0
                
                # 更新分數表
                cursor.execute("""
                    UPDATE game_scores 
                    SET total_score = %s, correct_score = %s, speed_score = %s, 
                        correct_answers = %s, wrong_answers = %s, accuracy_rate = %s
                    WHERE session_id = %s
                """, (total_score, correct_score, speed_score, correct_answers, wrong_answers, accuracy_rate, session_id))
                
                conn.commit()
                return True
            
        except Exception as e:
            print(f"更新遊戲分數失敗: {e}")
            conn.rollback()
            return False
        finally:
            cursor.close()
            conn.close()

    def complete_game_session(self, session_id):
        """完成遊戲會話"""
        conn = get_db_connection()
        if conn is None:
            return False
            
        try:
            cursor = conn.cursor()
            
            # 更新會話狀態為完成
            cursor.execute("""
                UPDATE game_sessions 
                SET status = 'completed', complete_time = NOW()
                WHERE session_id = %s
            """, (session_id,))

            conn.commit()
            return True
            
        except Exception as e:
            print(f"完成遊戲會話失敗: {e}")
            conn.rollback()
            return False
        finally:
            cursor.close()
            conn.close()

    def get_leaderboard(self, limit=100):
        """獲取排行榜數據"""
        conn = get_db_connection()
        if conn is None:
            return []
            
        try:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT 
                    gs.username,
                    gsc.total_score,
                    gsc.correct_answers,
                    gsc.wrong_answers,
                    gsc.accuracy_rate,
                    gsc.speed_score,
                    gsc.correct_score
                FROM game_sessions gs
                JOIN game_scores gsc ON gs.session_id = gsc.session_id
                WHERE gs.status = 'completed'
                ORDER BY gsc.total_score DESC
                LIMIT %s
            """, (limit,))
            
            leaderboard = cursor.fetchall()
            return leaderboard
            
        except Exception as e:
            print(f"獲取排行榜失敗: {e}")
            return []
        finally:
            cursor.close()
            conn.close()

    def get_user_game_history(self, user_id, limit=10):
        """獲取用戶遊戲歷史"""
        conn = get_db_connection()
        if conn is None:
            return []
            
        try:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT 
                    gs.session_id,
                    gs.game_mode,
                    COALESCE(gs.auth, 0) AS auth,
                    COALESCE(gs.time, 0) AS time,
                    COALESCE(gs.motive, 0) AS motive,
                    gsc.total_score,
                    gsc.correct_answers,
                    gsc.wrong_answers,
                    gsc.accuracy_rate,
                    gsc.speed_score
                FROM game_sessions gs
                JOIN game_scores gsc ON gs.session_id = gsc.session_id
                WHERE gs.user_id = %s AND gs.status = 'completed'
                ORDER BY gsc.total_score DESC
                LIMIT %s
            """, (user_id, limit))
            
            history = cursor.fetchall()
            return history
            
        except Exception as e:
            print(f"獲取用戶遊戲歷史失敗: {e}")
            return []
        finally:
            cursor.close()
            conn.close()

    def get_game_session_details(self, session_id):
        """獲取遊戲會話詳細信息"""
        conn = get_db_connection()
        if conn is None:
            return None
            
        try:
            cursor = conn.cursor()
            
            # 獲取會話基本信息
            cursor.execute("""
                SELECT 
                    gs.session_id,
                    gs.username,
                    gs.game_mode,
                    gs.status,
                    COALESCE(gs.auth, 0) AS session_auth,
                    COALESCE(gs.time, 0) AS session_time,
                    COALESCE(gs.motive, 0) AS session_motive,
                    COALESCE(gsc.total_score, 0) AS total_score,
                    COALESCE(gsc.correct_score, 0) AS correct_score,
                    COALESCE(gsc.speed_score, 0) AS speed_score,
                    COALESCE(gsc.correct_answers, 0) AS correct_answers,
                    COALESCE(gsc.wrong_answers, 0) AS wrong_answers,
                    COALESCE(gsc.accuracy_rate, 0) AS accuracy_rate
                FROM game_sessions gs
                JOIN game_scores gsc ON gs.session_id = gsc.session_id
                WHERE gs.session_id = %s
            """, (session_id,))
            
            session_info = cursor.fetchone()
            if not session_info:
                return None
            
            # 獲取回合詳情
            cursor.execute("""
                SELECT round_number, user_choice_id, correct_answer_id, is_correct, 
                       response_time, base_score, speed_bonus, total_round_score
                FROM game_rounds
                WHERE session_id = %s
                ORDER BY round_number
            """, (session_id,))
            
            rounds = cursor.fetchall()
            
            return {
                'session_info': session_info,
                'rounds': rounds
            }
            
        except Exception as e:
            print(f"獲取遊戲會話詳情失敗: {e}")
            return None
        finally:
            cursor.close()
            conn.close()


