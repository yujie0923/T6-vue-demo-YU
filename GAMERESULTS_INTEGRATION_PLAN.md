# GameResults.vue 整合計劃

## 📋 整合目標

將用戶提供的模板應用到當前 `GameResults.vue`，保留所有後端 API 調用邏輯，同時調整以下六個要求。

---

## ✅ 整合要求清單

### 1. 靈魂分數詳細顯示

**要求：**
- 沿用用戶模板的設計樣式
- 將五維度改為三維度顯示（權威、時間、動機）
- **保留 `totalUserScore`**（之後會開 API 抓取）
- 資料獲取先設計好，確認介面沒問題再處理後端

**顯示內容：**
```vue
<!-- 本回合靈魂變化（如果有的話）-->
<div class="round-changes" v-if="roundScoreChanges">
  <!-- 顯示三維度：權威、時間、動機 -->
  <div class="round-change-item">
    <span class="dimension-name">權威</span>
    <span class="round-change" :class="{'positive': roundScoreChanges.auth > 0, 'negative': roundScoreChanges.auth < 0}">
      {{ formatScoreChange(roundScoreChanges.auth) }}
    </span>
  </div>
  <div class="round-change-item">
    <span class="dimension-name">時間</span>
    <span class="round-change" :class="{'positive': roundScoreChanges.time > 0, 'negative': roundScoreChanges.time < 0}">
      {{ formatScoreChange(roundScoreChanges.time) }}
    </span>
  </div>
  <div class="round-change-item">
    <span class="dimension-name">動機</span>
    <span class="round-change" :class="{'positive': roundScoreChanges.motive > 0, 'negative': roundScoreChanges.motive < 0}">
      {{ formatScoreChange(roundScoreChanges.motive) }}
    </span>
  </div>
</div>

<!-- 累積總分（三維度）-->
<div class="scores-list">
  <span class="score-item total">權威: {{ getSoulScores().auth }}</span>
  <span class="score-item total">時間: {{ getSoulScores().time }}</span>
  <span class="score-item total">動機: {{ getSoulScores().motive }}</span>
</div>
```

**需要添加的數據屬性：**
```javascript
data() {
  return {
    // ... 現有屬性
    roundScoreChanges: null, // { auth: 0, time: 0, motive: 0 } 或 null
    totalUserScore: 0, // 之後會從 API 獲取
  }
}
```

**需要添加的方法：**
```javascript
methods: {
  // ... 現有方法
  formatScoreChange(value) {
    if (value > 0) return `+${value}`;
    if (value < 0) return `${value}`;
    return '0';
  },
  
  // 計算本回合靈魂分數變化（待後端 API）
  calculateRoundScoreChanges() {
    // TODO: 之後從 API 獲取本回合的靈魂分數變化
    // 目前先設為 null 或預設值
    this.roundScoreChanges = null; // 或 { auth: 0, time: 0, motive: 0 }
  },
  
  // 獲取用戶總分（待後端 API）
  async fetchTotalUserScore() {
    // TODO: 之後從 API 獲取用戶總分
    // 例如：GET /users/{userId}/total-score
    // this.totalUserScore = result.data.total_score;
  }
}
```

---

### 2. 玩家狀態顯示

**要求：**
- 沿用用戶模板的設計
- 資料獲取之後再處理

**顯示內容：**
```vue
<div class="user-score-info" v-if="username">
  <p class="current-user">玩家: {{ username }}</p>
  <p v-if="scoreSubmitted" class="submit-status success">
    ✅ 分數已記錄！總分: {{ totalUserScore }}
  </p>
  <p v-else class="submit-status">⏳ 正在記錄分數...</p>
</div>
```

**需要的數據屬性（已有）：**
```javascript
data() {
  return {
    // ... 現有屬性
    username: null, // 已有，從後端獲取
    scoreSubmitted: false, // 已有，改為 submitted 或新增
    totalUserScore: 0, // 新增，待後端 API
  }
}
```

**需要的方法（部分已有）：**
```javascript
methods: {
  // ... 現有方法
  async fetchUsername() {
    // 已有，保持不變
  },
  
  async submitScore() {
    // 需要更新以設置 scoreSubmitted = true
    this.scoreSubmitted = true;
    // TODO: 之後可以調用 API 提交分數並獲取 totalUserScore
  },
  
  async fetchTotalUserScore() {
    // 新增：獲取用戶總分（待後端 API）
  }
}
```

---

### 3. 遊戲解析部分

**要求：**
- 使用當前版本的遊戲解析功能
- 保留 `gameAnalysis` 相關邏輯

**顯示內容（從當前版本保留）：**
```vue
<!-- ✅ 遊戲解析區域 -->
<div v-if="gameAnalysis.length" class="analysis-section">
  <h3>遊戲解析</h3>
  <div
    v-for="analysis in gameAnalysis"
    :key="analysis.round"
    class="analysis-item"
    :class="{ 'correct': analysis.isCorrect, 'incorrect': !analysis.isCorrect }"
  >
    <div class="round-header">
      <h4>第{{ analysis.round }}關</h4>
      <span class="result-badge" :class="{ 'correct': analysis.isCorrect, 'incorrect': !analysis.isCorrect }">
        {{ analysis.isCorrect ? '✓ 正確' : '✗ 錯誤' }}
      </span>
    </div>
    
    <div class="choice-comparison">
      <div class="user-choice">
        <h5>你的選擇</h5>
        <p class="message-content">「{{ analysis.userChoice.content }}」</p>
        <p class="message-category">類別：{{ analysis.userChoice.category }}</p>
        <p class="message-analysis" v-if="analysis.userChoice.analysis">
          解析：{{ analysis.userChoice.analysis }}
        </p>
      </div>
      
      <div class="correct-answer">
        <h5>正確答案</h5>
        <p class="message-content">「{{ analysis.correctAnswer.content }}」</p>
        <p class="message-category">類別：{{ analysis.correctAnswer.category }}</p>
        <p class="message-analysis" v-if="analysis.correctAnswer.analysis">
          解析：{{ analysis.correctAnswer.analysis }}
        </p>
      </div>
    </div>
  </div>
</div>
```

**需要保留的方法（已有）：**
```javascript
methods: {
  // ... 現有方法
  async fetchGameAnalysis() {
    // 已有，保持不變
  }
}
```

---

### 4. 排行榜顯示

**要求：**
- 沿用用戶模板設計
- 取消按鈕部分，直接顯示

**顯示內容：**
```vue
<!-- 排行榜（直接顯示，無按鈕）-->
<h3>排行榜</h3>
<ol class="leaderboard">
  <li v-for="(entry, index) in leaderboard" :key="index">
    <span class="rank">{{ index + 1 }}.</span>
    <span class="name">{{ entry.name }}</span>
    <span class="score">{{ entry.score }} 分</span>
  </li>
</ol>

<!-- 如果排行榜為空的情況 -->
<div v-if="leaderboard.length === 0" class="empty-leaderboard">
  <p>尚無排行榜記錄</p>
</div>
```

**需要移除的數據屬性：**
```javascript
data() {
  return {
    // ... 其他屬性
    // showLeaderboard: false, // 移除，因為不再需要切換
  }
}
```

**需要移除的方法：**
```javascript
methods: {
  // ... 其他方法
  // toggleLeaderboard() { ... } // 移除，不再需要
}
```

**需要保留的方法（已有）：**
```javascript
methods: {
  // ... 其他方法
  async fetchLeaderboard() {
    // 已有，保持不變
  }
}
```

---

### 5. 直接使用用戶模板

**要求：**
- 直接使用用戶提供的模板 `template`、`script` 和 `style` 部分
- 但需要符合前面 4 個條件

**整合步驟：**

1. **Template 部分：**
   - 採用用戶模板的 `<template>` 結構
   - 調整靈魂分數為三維度（條件 1）
   - 保留玩家狀態顯示（條件 2）
   - 添加遊戲解析部分（條件 3）
   - 移除排行榜按鈕（條件 4）

2. **Script 部分：**
   - 保留當前版本的所有 props
   - 保留當前版本的所有後端 API 調用方法
   - 添加 `roundScoreChanges` 和 `totalUserScore` 數據屬性
   - 添加 `formatScoreChange` 方法
   - 保留 `gameAnalysis` 相關邏輯
   - 移除 `toggleLeaderboard` 方法
   - 移除 `showLeaderboard` 數據屬性

3. **Style 部分：**
   - 完全採用用戶模板的 `<style>` 樣式
   - 保留當前版本的遊戲解析相關樣式（`.analysis-section` 等）

---

### 6. 保留 roundScoreChanges 和 totalUserScore

**要求：**
- **不要移除 `roundScoreChanges`**
- 之後會調用當前使用者資料
- `totalUserScore` 要保留

**數據屬性設計：**
```javascript
data() {
  return {
    // ... 現有屬性
    roundScoreChanges: {
      auth: 0,    // 本回合權威分數變化
      time: 0,    // 本回合時間分數變化
      motive: 0   // 本回合動機分數變化
    }, // 或 null，如果本回合沒有變化
    totalUserScore: 0, // 用戶總分（待後端 API）
    scoreSubmitted: false, // 分數提交狀態（對應 submitted）
  }
}
```

**方法設計：**
```javascript
methods: {
  // ... 現有方法
  
  formatScoreChange(value) {
    if (value > 0) return `+${value}`;
    if (value < 0) return `${value}`;
    return '0';
  },
  
  // 計算本回合靈魂分數變化（待後端實現）
  async calculateRoundScoreChanges() {
    // TODO: 之後從後端 API 獲取本回合的靈魂分數變化
    // 可能的 API: GET /games/{session_id}/round-soul-changes
    // 或從 complete_game 響應中獲取
    try {
      // const response = await fetch(`http://localhost:8000/games/${sessionId}/round-soul-changes`);
      // const result = await response.json();
      // if (result.success) {
      //   this.roundScoreChanges = {
      //     auth: result.data.auth_change || 0,
      //     time: result.data.time_change || 0,
      //     motive: result.data.motive_change || 0
      //   };
      // }
    } catch (error) {
      console.error('獲取本回合靈魂分數變化失敗:', error);
      this.roundScoreChanges = null;
    }
  },
  
  // 獲取用戶總分（待後端實現）
  async fetchTotalUserScore() {
    if (!this.userId) return;
    
    try {
      // TODO: 之後從後端 API 獲取用戶總分
      // 可能的 API: GET /users/{userId}/total-score
      // const response = await fetch(`http://localhost:8000/users/${this.userId}/total-score`);
      // const result = await response.json();
      // if (result.success) {
      //   this.totalUserScore = result.data.total_score || 0;
      // }
      
      // 暫時使用預設值
      this.totalUserScore = 0;
    } catch (error) {
      console.error('獲取用戶總分失敗:', error);
      this.totalUserScore = 0;
    }
  },
  
  // 提交分數時更新狀態
  async submitScore() {
    if (!this.playerName) return;
    
    try {
      // TODO: 之後可以調用 API 提交分數
      // 例如: POST /games/submit-score
      
      this.scoreSubmitted = true;
      
      // 提交後獲取最新總分
      await this.fetchTotalUserScore();
      
      // 重新獲取排行榜以顯示最新數據
      await this.fetchLeaderboard();
    } catch (err) {
      console.error("提交分數失敗", err);
    }
  }
}
```

**生命週期鉤子調整：**
```javascript
mounted() {
  // ... 現有邏輯
  
  // 如果有 userId，加载灵魂系统相关数据
  if (this.userId) {
    this.$nextTick(() => {
      setTimeout(async () => {
        // 1. 載入遊戲次數
        await this.loadPlayerProgress();
        
        // 2. 獲取用戶總分
        await this.fetchTotalUserScore();
        
        // 3. 計算本回合靈魂分數變化
        await this.calculateRoundScoreChanges();
        
        // 4. 如果 >= 5 次遊戲，載入靈魂動物
        if (this.playerGameCount >= 5) {
          await this.fetchSoulAnimal();
        }
      }, 100);
    });
  }
}
```

---

## 📝 後端 API 設計（待實現）

### 1. 獲取本回合靈魂分數變化

**端點：** `GET /games/{session_id}/round-soul-changes`

**響應格式：**
```json
{
  "success": true,
  "data": {
    "auth_change": 5,
    "time_change": -2,
    "motive_change": 3
  }
}
```

### 2. 獲取用戶總分

**端點：** `GET /users/{user_id}/total-score`

**響應格式：**
```json
{
  "success": true,
  "data": {
    "total_score": 1250,
    "user_id": 123,
    "username": "player1"
  }
}
```

### 3. 提交分數（如果需要）

**端點：** `POST /games/submit-score`

**請求格式：**
```json
{
  "user_id": 123,
  "session_id": "session_xxx",
  "player_name": "Player Name"
}
```

**響應格式：**
```json
{
  "success": true,
  "data": {
    "total_score": 1250,
    "message": "分數已記錄"
  }
}
```

---

## ✅ 整合檢查清單

### Template 部分
- [ ] 採用用戶模板的基本結構
- [ ] 靈魂分數顯示改為三維度（權威、時間、動機）
- [ ] 保留 `roundScoreChanges` 顯示（如果有值）
- [ ] 保留 `totalUserScore` 顯示
- [ ] 保留玩家狀態顯示（`username` 和 `scoreSubmitted`）
- [ ] 添加遊戲解析部分
- [ ] 移除排行榜按鈕，直接顯示

### Script 部分
- [ ] 保留所有現有 props
- [ ] 保留所有後端 API 調用方法
- [ ] 添加 `roundScoreChanges` 數據屬性
- [ ] 添加 `totalUserScore` 數據屬性
- [ ] 添加 `scoreSubmitted` 數據屬性（如果沒有）
- [ ] 添加 `formatScoreChange` 方法
- [ ] 添加 `calculateRoundScoreChanges` 方法（待後端）
- [ ] 添加 `fetchTotalUserScore` 方法（待後端）
- [ ] 更新 `submitScore` 方法
- [ ] 保留 `gameAnalysis` 相關邏輯
- [ ] 移除 `toggleLeaderboard` 方法
- [ ] 移除 `showLeaderboard` 數據屬性
- [ ] 更新 `mounted` 生命週期鉤子

### Style 部分
- [ ] 採用用戶模板的所有樣式
- [ ] 保留遊戲解析相關樣式（`.analysis-section` 等）
- [ ] 確認所有樣式類別都有對應

---

## 🚀 執行步驟

1. **備份當前 `GameResults.vue` 文件**
2. **複製用戶模板的 `<template>` 部分**
3. **調整模板內容：**
   - 靈魂分數改為三維度
   - 添加遊戲解析部分
   - 移除排行榜按鈕
4. **保留當前版本的 `<script>` 部分，但進行以下調整：**
   - 添加新的數據屬性
   - 添加新的方法（暫時先留 TODO）
   - 移除不需要的方法和屬性
5. **採用用戶模板的 `<style>` 部分**
6. **添加遊戲解析相關樣式**
7. **測試所有功能：**
   - 後端 API 調用是否正常
   - 靈魂動物顯示是否正確
   - 排行榜是否正常顯示
   - 遊戲解析是否正常
   - 介面樣式是否符合預期

---

## 📌 注意事項

1. **`roundScoreChanges` 可能為 `null`**：如果本回合沒有變化或無法獲取，應該顯示 `null` 或預設值
2. **`totalUserScore` 初始值為 0**：待後端 API 實現後再更新
3. **`scoreSubmitted` 狀態**：在提交分數後設置為 `true`
4. **遊戲解析部分**：確保 `gameAnalysis` 數據正確載入
5. **用戶模板中的 `currentUser`**：需要改為 `username`（從後端獲取）
