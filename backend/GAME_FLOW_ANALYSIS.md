# 遊戲流程完整分析

## 從前端開始遊戲到更新遊戲數據的完整流程

### 階段一：開始遊戲 - 獲取題目

#### 1. 前端觸發（App.vue）
```
用戶點擊開始遊戲
  ↓
App.vue: startGame(gameData)
  ↓
發送 POST 請求到 http://localhost:8000/games
{
  user_id: gameData.userId,
  game_mode: gameData.mode
}
```

#### 2. 後端 API 處理（app_route.py）
```
@app.post("/games")
  ↓
async def create_game(game_request: GameCreate)
  ↓
game_service = GameService()
result = game_service.get_round_question(user_id, game_mode)
```

#### 3. GameService 處理流程（GameService.py）

##### 3.1 get_round_question()
```
- 獲取用戶名（從資料庫）
- 生成 session_id
- 調用 create_game_session() → 創建資料庫記錄
  ├─ INSERT INTO game_sessions (user_id, session_id, username, game_mode, status)
  └─ INSERT INTO game_scores (session_id, total_score=0, ...)
```

##### 3.2 plan_rounds_with_total_score_5()
```
初始化：
- total_score = {'auth': 0, 'time': 0, 'motive': 0}
- all_rounds = []
- used_combos = []

循環直到 total_score == (5,5,5)：
  ↓
  調用 get_round_by_random_combo(total_score, exclude_ids)
    ↓
    過濾可用組合（7種固定組合：[(1,0,0), (0,1,0), ...]）
    ↓
    隨機選擇一個組合（確保加上當前總分後 <= 5）
    ↓
    調用 get_messages_by_soul_combo(auth, time, motive, exclude_ids)
      ↓
      調用 db_service.get_message_by_soul_score()
        ├─ 獲取 2個真實訊息 (is_truth_message=True)
        └─ 獲取 1個詐騙訊息 (is_truth_message=False)
      ↓
      返回 3個題目（2真1假，已隨機打亂）
    ↓
    更新 total_score += selected_combo
    ↓
    記錄到 all_rounds 和 used_combos
  ↓
  達到 (5,5,5) 時停止

返回：
- all_rounds: [{'round_number': 1, 'questions': [...], 'combo': (1,0,0)}, ...]
- used_combos: [(1,0,0), (0,1,0), ...]
- final_score: {'auth': 5, 'time': 5, 'motive': 5}
```

##### 3.3 get_round_question() 返回
```
{
  session_id: "game_userId_timestamp",
  total_rounds: N,  // 動態數量（根據達到5,5,5需要的rounds數）
  game_mode: "normal",
  rounds: [
    {
      round_number: 1,
      questions: [
        (message_id, message_source, message_text, is_truth_message, scam_category, message_sender, auth, time, motive),
        ...
      ]
    },
    ...
  ],
  status: 'ready'
}
```

#### 4. 前端接收並處理（App.vue）
```
接收 API 響應
  ↓
gameSessionData.value = result.data
currentRoundData.value = result.data.rounds[0].questions
gameStarted.value = true
  ↓
顯示 GameBoard 組件（第一關）
```

---

### 階段二：遊戲進行中 - 用戶選擇

#### 1. 用戶選擇訊息（GameBoard.vue）
```
用戶點擊訊息
  ↓
GameBoard.vue: selectMessage(msg)
  ↓
計算答題時間：responseTime = Date.now() - answerStartTime
  ↓
判斷正確性：correct = msg.isScam  // 選擇詐騙訊息才是正確答案
  ↓
找到正確答案：correctMessage = gameMessages.find(m => m.isScam)
  ↓
記錄用戶選擇：
{
  round: props.round,
  userChoiceId: msg.id,
  correctAnswerId: correctMessage.id,
  isCorrect: correct,
  responseTime: responseTime
}
  ↓
emit("user-choices", userChoices.value)  // 傳遞給 App.vue
emit("next-round", correct)
```

#### 2. 進入下一關（App.vue）
```
App.vue: nextRound(correct)
  ↓
if (round.value < total_rounds):  // 注意：這裡需要動態檢查
  round.value++
  currentRoundData.value = gameSessionData.value.rounds[round.value - 1].questions
else:
  loadPsychologyQuizResults()
  endGame()  // 遊戲結束
```

---

### 階段三：遊戲結束 - 更新遊戲數據

#### 1. 前端發送完成請求（App.vue）
```
App.vue: endGame()
  ↓
準備數據：
roundsData = userChoicesForResults.value.map(choice => ({
  round_number: choice.round,
  user_choice_id: choice.userChoiceId,
  correct_answer_id: choice.correctAnswerId,
  is_correct: choice.isCorrect,
  response_time: choice.responseTime
}))
  ↓
發送 POST 請求到 http://localhost:8000/games/complete
{
  session_id: gameSessionData.value.session_id,
  rounds: roundsData
}
```

#### 2. 後端 API 處理（app_route.py）
```
@app.post("/games/complete")
  ↓
async def complete_game(request: GameCompleteRequest)
  ↓
game_service = GameService()
```

#### 3. GameService 數據更新流程

##### 3.1 記錄每個回合結果
```
循環處理每個 round_result：
  ↓
  game_service.record_round_result(
    session_id, round_number, user_choice_id, 
    correct_answer_id, is_correct, response_time
  )
    ↓
    計算分數：
    - base_score = 10 if is_correct else 0
    - speed_bonus = _calculate_speed_bonus(response_time, is_correct)
    - total_round_score = base_score + speed_bonus
    ↓
    INSERT INTO game_rounds (
      session_id, round_number, user_choice_id, 
      correct_answer_id, is_correct, response_time,
      base_score, speed_bonus, total_round_score
    )
```

##### 3.2 更新總分數
```
game_service.update_game_score(session_id)
  ↓
  查詢所有回合結果：
  SELECT SUM(correct_answers), SUM(wrong_answers), 
         SUM(base_score), SUM(speed_bonus), SUM(total_round_score)
  FROM game_rounds WHERE session_id = ?
  ↓
  計算準確率：accuracy_rate = correct_answers / total_questions
  ↓
  UPDATE game_scores SET 
    total_score, correct_score, speed_score,
    correct_answers, wrong_answers, accuracy_rate
  WHERE session_id = ?
```

##### 3.3 完成遊戲會話
```
game_service.complete_game_session(session_id)
  ↓
  UPDATE game_sessions 
  SET status = 'completed' 
  WHERE session_id = ?
```

---

## 資料庫表更新時間點

### game_sessions 表
- **創建時機**：`get_round_question()` → `create_game_session()`
  - 插入：user_id, session_id, username, game_mode, status='active'
- **更新時機**：`complete_game()` → `complete_game_session()`
  - 更新：status = 'completed'

### game_scores 表
- **創建時機**：`get_round_question()` → `create_game_session()`
  - 插入：session_id, total_score=0, correct_score=0, ...（初始值）
- **更新時機**：`complete_game()` → `update_game_score()`
  - 更新：total_score, correct_score, speed_score, correct_answers, wrong_answers, accuracy_rate

### game_rounds 表
- **創建時機**：`complete_game()` → `record_round_result()`
  - 插入：每個回合的詳細結果
  - 包含：session_id, round_number, user_choice_id, correct_answer_id, is_correct, response_time, base_score, speed_bonus, total_round_score

---

## 潛在問題檢查

### ⚠️ 需要注意的地方：

1. **App.vue 的 nextRound 函數**：
   - 目前檢查：`round.value < 5`（固定值）
   - 應該改為：`round.value < gameSessionData.value.total_rounds`（動態值）

2. **前端期望的 round 數量**：
   - 前端可能假設固定5關，需要確認是否支持動態數量

3. **數據格式一致性**：
   - 確保返回的題目格式與前端期望一致
   - 檢查 message 字段索引是否正確

