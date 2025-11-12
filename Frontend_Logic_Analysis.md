# 前端邏輯分析報告

## 📊 API 更新狀態檢查

### ✅ 已更新的 API 調用

| 文件 | API 端點 | 狀態 | 說明 |
|------|----------|------|------|
| **App.vue** | `POST /games` | ✅ 已更新 | 遊戲創建 API |
| **App.vue** | `GET /users/{user_id}` | ✅ 已更新 | 獲取用戶數據 API |
| **GameResults.vue** | `POST /games/analysis` | ✅ 已更新 | 遊戲解析 API |
| **GameBoard.vue** | 無 API 調用 | ✅ 無需更新 | 純 UI 組件 |

### ❌ 發現的問題

1. **GameResults.vue** 中仍有舊的排行榜 API：
   ```javascript
   // 仍在使用 localhost:3000 的舊 API
   const res = await axios.get("http://localhost:3000/leaderboard");
   const res = await axios.post("http://localhost:3000/leaderboard", {...});
   ```

## 🔄 邏輯重複分析

### 1. App.vue 中的重複邏輯

#### 🎯 可以移到後端的邏輯：

1. **遊戲狀態管理**：
   ```javascript
   // 當前：前端管理遊戲狀態
   const gameStarted = ref(false)
   const gameEnded = ref(false)
   const round = ref(1)
   const score = ref(0)
   
   // 建議：後端管理遊戲會話狀態
   // 前端只負責 UI 狀態
   ```

2. **遊戲數據轉換**：
   ```javascript
   // 當前：前端轉換數據格式
   const roundMessages = props.currentRoundData.map(msg => ({
     id: msg[0],
     sender: msg[4],
     content: msg[2],
     isScam: !msg[3],
     // ...
   }));
   
   // 建議：後端直接返回前端需要的格式
   ```

3. **用戶選擇記錄**：
   ```javascript
   // 當前：前端記錄用戶選擇
   const choiceData = {
     round: props.round,
     userChoiceId: msg.id,
     correctAnswerId: correctMessageId,
     isCorrect: correct
   };
   
   // 建議：後端直接處理用戶選擇並計算結果
   ```

### 2. GameBoard.vue 中的重複邏輯

#### 🎯 可以移到後端的邏輯：

1. **正確答案判斷**：
   ```javascript
   // 當前：前端判斷正確答案
   const correct = !msg.isScam;
   const correctMessage = gameMessages.value.find(m => !m.isScam);
   
   // 建議：後端直接返回正確答案信息
   ```

2. **遊戲計時邏輯**：
   ```javascript
   // 當前：前端管理計時器
   const timeLeft = ref(20);
   const startTimer = () => { /* 複雜的計時邏輯 */ };
   
   // 建議：後端管理遊戲時間，前端只負責顯示
   ```

3. **音效邏輯**：
   ```javascript
   // 當前：前端處理音效
   const playTick = () => { /* 複雜的音效邏輯 */ };
   
   // 建議：前端只負責播放，後端提供音效配置
   ```

### 3. GameResults.vue 中的重複邏輯

#### 🎯 可以移到後端的邏輯：

1. **排行榜管理**：
   ```javascript
   // 當前：前端調用舊的排行榜 API
   const res = await axios.get("http://localhost:3000/leaderboard");
   
   // 建議：統一使用後端 API
   ```

2. **分數提交邏輯**：
   ```javascript
   // 當前：前端處理分數提交
   async submitScore() {
     const res = await axios.post("http://localhost:3000/leaderboard", {
       name: this.playerName,
       score: this.score
     });
   }
   
   // 建議：後端統一處理分數和排行榜
   ```

## 🚀 建議的後端優化

### 1. 遊戲會話管理
```python
# 建議新增：遊戲會話狀態管理
class GameSession:
    def __init__(self, user_id, game_mode):
        self.session_id = f"game_{user_id}_{int(time.time())}"
        self.user_id = user_id
        self.game_mode = game_mode
        self.current_round = 1
        self.score = 0
        self.user_choices = []
        self.start_time = time.time()
        self.status = "active"  # active, completed, expired
```

### 2. 統一的遊戲 API
```python
# 建議新增：統一的遊戲操作 API
@app.post("/games/{session_id}/answer")
async def submit_answer(session_id: str, answer: AnswerRequest):
    """提交答案並獲取結果"""
    # 後端處理答案驗證、計分、狀態更新
    pass

@app.get("/games/{session_id}/status")
async def get_game_status(session_id: str):
    """獲取遊戲當前狀態"""
    # 返回遊戲進度、分數、剩餘時間等
    pass
```

### 3. 排行榜 API
```python
# 建議新增：統一的排行榜 API
@app.get("/leaderboard")
async def get_leaderboard():
    """獲取排行榜"""
    pass

@app.post("/leaderboard")
async def submit_score(score_data: ScoreSubmit):
    """提交分數到排行榜"""
    pass
```

## 📋 優先級建議

### 🔥 高優先級（立即處理）
1. **修復 GameResults.vue 中的排行榜 API**
2. **統一所有 API 調用使用新的後端**

### 🟡 中優先級（後續優化）
1. **將遊戲狀態管理移到後端**
2. **簡化前端數據轉換邏輯**
3. **統一遊戲計時邏輯**

### 🟢 低優先級（長期優化）
1. **音效邏輯優化**
2. **前端狀態管理重構**
3. **API 響應格式進一步標準化**

## 🎯 總結

**API 更新狀態**：✅ 基本完成，但需要修復排行榜 API

**邏輯重複問題**：
- **App.vue**：遊戲狀態管理、數據轉換
- **GameBoard.vue**：正確答案判斷、計時邏輯
- **GameResults.vue**：排行榜管理

**建議**：優先修復 API 問題，然後逐步將業務邏輯移到後端，讓前端專注於 UI 展示。
