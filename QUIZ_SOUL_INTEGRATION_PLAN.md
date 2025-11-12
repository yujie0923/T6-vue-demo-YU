# Quiz 與靈魂分數整合詳細計畫

本文件整理「防詐心理測驗（Quiz.vue）」與靈魂分數／動物顯示的整合步驟，協助前後端協同改造。

---

## 0. 目標總覽

1. **遊戲開局前必須完成防詐心理測驗**，未完成不得進入遊戲。
2. **測驗作答結果可完整送至後端**，包含每題選項與三維分數計算。
3. **後端統一計算並回傳初始靈魂動物**，提供新的 API。
4. **GameResults 畫面同步更新**：
   - 未滿 5 場時顯示「未覺醒 + 初始靈魂動物」。
   - 滿 5 場後整合「歷史遊戲分數 + 初始測驗分數」重新評估動物。

---

## 1. 遊戲開始權限控制（Quiz.vue → App.vue）

### 1.1 檢查心理測驗狀態
- **資料來源**：新增 `users.quiz_status` 欄位（`completed` / `incomplete`）。
  - 或在後端提供 `GET /quiz/status`，回傳與欄位一致的狀態。
- **UI 行為**：
  - `quiz_status !== 'completed'` → 「開始遊戲」按鈕 `disabled`，並顯示提示：`請先完成防詐心理測驗`。
  - `quiz_status === 'completed'` → 允許按鈕啟動遊戲。

### 1.2 影響的檔案
| 檔案 | 調整內容 |
|------|----------|
| `Quiz.vue` | 測驗完成後更新 `quiz_status`（呼叫後端更新 users.quiz_status） |
| `App.vue` | 啟動遊戲前檢查 `quiz_status`，未完成則阻擋 |
| `GameBoard.vue` | 無直接改動；確保未完成測驗時不會載入關卡 |

---

## 2. Quiz 答案上報格式

### 2.1 前端收集邏輯
- 在 `Quiz.vue` 建立暫存結構：
  ```js
  selectedAnswers = [
    { questionId: 'Q1', choice: 'A' },
    { questionId: 'Q3', choice: 'B' },
    ...
  ]
  ```
- 測驗完成後呼叫後端 API（第 3 步）送出。

### 2.2 後端 API 格式
- **新路由**：`POST /quiz/evaluate`
  ```json
  {
    "user_id": 123,
    "answers": [
      {"question_id": "Q1", "choice": "B"},
      {"question_id": "Q3", "choice": "D"}
    ]
  }
  ```
- **後端回傳**：
  ```json
  {
    "success": true,
    "data": {
      "scores": { "auth": 5, "time": 2, "motive": 4 },
      "initial_animal": {
        "animal_name": "幽影偵探狐",
        "animal_code": "KSDL",
        "description": "...",
        "emoji": "🦊"
      }
    }
  }
  ```
- **流程**：
  1. 計算分數、找出初始動物。
  2. 更新 `users.quiz_status = 'completed'`。
  3. 可將結果寫入 `user_quiz_result` 或 `quiz_answers` 表。

### 2.3 備註
- 可同時儲存 `answers` 到資料庫，方便統計。
- 未登入情境下可暫時寫 localStorage，登入後再補送。

---

## 3. 後端分數計算與初始靈魂動物

### 3.1 計分邏輯
- 根據題號對照表計算 `(auth, time, motive)` 三維分數。
- **範例（Q3）**：
  - A: `[-1, -2, -1]`
  - B: `[1, -1, 1]`
  - C: `[1, 1, 1]`
  - D: `[2, 1, 1]`

### 3.2 初始靈魂動物判定
- 流程建議：
  1. 計算完三維分數。
  2. 查 `animals` 表中「初始動物」對應規則（依分數正負值或 0/1 判斷）。
  3. 回傳更新後的名稱 + 描述（參見 §6）。
- **SmartAnimalRangeSystem** 已無須使用，後端已改為新演算法。

### 3.3 後端檔案建議調整
| 檔案 | 調整項目 |
|------|----------|
| `backend/app_route.py` | 新增 `POST /quiz/evaluate`、`GET /users/{id}/initial-animal`（如需） |
| `backend/soulCalculate.py` | 新增 `calculate_quiz_soul_score`、`calculate_combined_user_soul_score` |
| `backend/db_service.py` | 新增更新 `quiz_status`、儲存測驗結果的 SQL |

---

## 4. GameResults 顯示邏輯調整

### 4.1 新增資料欄位
- `GameResults.vue` 加入：
  - `initialAnimal`：心理測驗回傳的靈魂動物。
  - `hasCompletedQuiz`：判斷是否完成測驗（可來自 props 或 API）。

### 4.2 顯示規則
- **遊戲場次 < 5**：
  - 顯示「尚未覺醒」提示 + `initialAnimal` 的資訊。
  - 說明：以測驗結果為基礎，提醒玩家完成一定場數後會重新評估。
- **遊戲場次 ≥ 5**：
  - 每次完成遊戲後呼叫新的後端邏輯：
    - `history-soul-score`（歷史遊戲三維） + 初始測驗三維分數 → 合併成最終分數。
    - 後端回傳最新靈魂動物（`GET /users/{user_id}/animal` 需更新為使用合併分數演算法）。
  - 顯示最新靈魂動物資訊，搭配覺醒/進化提示。

### 4.3 受影響的欄位/邏輯
| 檔案/變數 | 調整內容 |
|-----------|----------|
| `GameResults.vue` | 新增 `initialAnimal`、`hasCompletedQuiz`；修改覺醒顯示條件 |
| `GameResults.vue` 模板 | 未滿 5 場顯示初始動物 + 未覺醒提示 |
| `App.vue` | 遊戲結束後若達 5 場以上，確保 `complete_game` 更新後再重新抓動物 |
| 後端 `soulCalculate` | 新增「合併評估」邏輯，包含初始 + 遊戲歷史 |

---

## 5. 三維分數對照表（Q1～Q14）

> 下表僅列出有分數配置的題目，Q1～Q2 可視需求加入初始化標籤用途。

| 題號 | 題意 | 選項 | 分數 (auth, time, motive) |
|------|------|-------|---------------------------|
| Q3 | ATM 詐騙來電 | A | `[-1, -2, -1]` |
| | | B | `[1, -1, 1]` |
| | | C | `[1, 1, 1]` |
| | | D | `[2, 1, 1]` |
| Q4 | 假投資群組 | A | `[-1, 0, -1]` |
| | | B | `[0, 1, 1]` |
| | | C | `[1, 1, 2]` |
| | | D | `[1, 1, 1]` |
| Q5 | 限時活動 | A | `[0, -1, -2]` |
| | | B | `[0, -1, -1]` |
| | | C | `[1, 0, 0]` |
| | | D | `[0, 1, 1]` |
| Q6 | 假銀行簡訊 | A | `[-1, -1, -1]` |
| | | B | `[1, 0, 0]` |
| | | C | `[1, 0, 0]` |
| | | D | `[1, 0, 1]` |
| Q7 | 加密貨幣詐騙 | A | `[-1, 0, 0]` |
| | | B | `[0, 0, -1]` |
| | | C | `[0, 0, 1]` |
| | | D | `[0, 0, 1]` |
| Q8 | 家庭詐騙 | A | `[1, 1, 0]` |
| | | B | `[1, 2, 0]` |
| | | C | `[1, 1, 0]` |
| | | D | `[0, 1, 0]` |
| Q9 | 假帳號盜用 | A | `[0, 0, 0]` |
| | | B | `[0, 0, 0]` |
| | | C | `[0, 1, 0]` |
| | | D | `[0, 1, 0]` |
| Q10 | 假政府補助 | A | `[0, 0, -1]` |
| | | B | `[-2, -1, 0]` |
| | | C | `[1, 0, 1]` |
| | | D | `[0, 1, 1]` |
| Q11 | 假中獎通知 | A | `[1, 1, 2]` |
| | | B | `[0, 0, -1]` |
| | | C | `[1, 0, 1]` |
| | | D | `[-1, -2, -2]` |
| Q12 | 假客服詐騙 | A | `[0, 1, -1]` |
| | | B | `[0, -1, -1]` |
| | | C | `[0, 1, 0]` |
| | | D | `[1, 0, 1]` |
| Q13 | 詐騙自我覺察 | A | `[0, -2, 0]` |
| | | B | `[0, 2, 0]` |
| | | C | `[0, 0, -1]` |
| | | D | `[-2, 0, 0]` |
| Q14 | 官方指示行為 | A | `[1, 0, 0]` |
| | | B | `[0, 0, 0]` |
| | | C | `[0, 0, 0]` |
| | | D | `[-1, 0, 0]` |

---

## 6. 新靈魂動物名稱與描述調整

> 英文代號（ATM/KTDI code）維持不變，但需要替換顯示名稱及敘述。

| 英文代號 | 原名稱 | 新名稱 + 代號 | 說明 |
|-----------|--------|----------------|------|
| SHADE (R-J-P) | 🐙 章魚型 | 🐙 章魚型 SHADE | 堅定部署型 – 深潛分析局偵察員，延遲行動以求精準。 |
| MUSE (R-J-R) | 🐱 貓型 | 🐱 貓型 MUSE | 直覺觀察型 – 敏銳洞察細節，重視隱私與情緒空間。 |
| ROGUE (R-C-R) | 🦊 狐狸型 | 🦊 狐狸型 ROGUE | 創意冒險型 – 靈巧機智，快速應對變化，策略性挑戰權威。 |
| REBEL (R-C-P) | 🦁 獅子型 | 🦁 獅子型 REBEL | 領導挑戰型 – 果敢行動，勇於承擔，帶領團隊反擊威脅。 |
| SAGE (A-J-R) | 🐢 烏龜型 | 🐢 烏龜型 SAGE | 穩定策略型 – 耐心、長期規劃，重視安全與秩序。 |
| SENTINEL (A-C-P) | 🐶 黃金獵犬型 | 🐶 黃金獵犬型 SENTINEL | 忠信防衛型 – 守護他人，服從規範，穩定可靠。 |
| VALOR (A-C-R) | 🐎 馬型 | 🐎 馬型 VALOR | 忠誠行動型 – 行動迅速，勇於執行，追求榮譽與正義。 |
| ??? (A-J-P) | 🦉 貓頭鷹型 | 🦉 貓頭鷹型 [代號待定] | **需補充新描述與代號**（已知為審慎型）。 |

### 6.1 數據庫與程式需要同步調整
- **資料庫 `animals` 表**：替換 `animal_name`, `description`，保持英文代號不變。
- **後端回傳**：確保 `define_user_animals`、`quiz/evaluate` API 回傳更新後的中文名稱與描述。
- **前端顯示**：`GameResults.vue`、`Analyt.vue`、`Animal.vue` 等處的文案改為新名稱敘述。
- **步驟建議**：
  1. 建立名稱/描述對照表（可在後端常數或資料表）。
  2. 撰寫 migration 或 SQL 更新語句。
  3. 前端更新 `getAwakenedAnimalName()` 等函式，反映新字串。

---

## 7. 合併三維分數的策略

### 7.1 資料來源
- **初始測驗分數**：`quiz/evaluate` 回傳的 `{ auth, time, motive }`。
- **歷史遊戲分數**：`GET /users/{user_id}/history-soul-score` 回傳累計三維值（只計遊戲）。

### 7.2 後端合併邏輯
- 新增函式 `calculate_combined_user_soul_score(user_id)`：
  1. 讀取測驗分數（可從 `user_quiz_result` 或 `users` 的 JSON 欄位）。
  2. 讀取遊戲分數（`history-soul-score` 現有）
  3. 合併成最終分數：
     ```python
     combined_auth = quiz_auth + history_auth
     combined_time = quiz_time + history_time
     combined_motive = quiz_motive + history_motive
     ```
  4. 依新演算法決定最終動物。
- `GET /users/{user_id}/animal` 更新為使用合併後的三維分數。

### 7.3 前端顯示細節
- 未滿 5 場 → 顯示：
  - 「未覺醒」提示
  - 初始動物（測驗結果）
- ≥ 5 場 → 顯示：
  - 最新動物（合併三維）
  - 可附註「包含心理測驗 + 遊戲累積」

---

## 8. 升級後的資料流一覽

1. **Quiz 完成** → `Quiz.vue`
   - 檢查測驗狀態 → 若未完成則阻擋遊戲
   - 收集答案 → `POST /quiz/evaluate`
   - 接收 `{ scores, initial_animal }` → 儲存至後端；更新 `quiz_status = 'completed'`

2. **遊戲開始** → `App.vue` / `GameBoard.vue`
   - 確認 `quiz_status` 為已完成
   - 建立 `game_sessions`

3. **遊戲結束** → `POST /games/complete`
   - 更新 `game_scores` / `game_sessions`（auth/time/motive）
   - 觸發 `SoulCalculate.update_session_soul_score`
   - 若場次 ≥ 5，之後 `GET /users/{id}/animal` 會使用合併結果

4. **GameResults**
   - `GET /games/{session_id}/details` → 當回合分數 + 三維
   - `GET /users/{user_id}/history-soul-score` → 歷史遊戲總分
   - `GET /users/{user_id}/initial-animal`（或沿用 evaluate 結果）
   - `GET /users/{user_id}/animal`（合併測驗＋遊戲） → 滿 5 場後更新

---

## 9. 後續可考慮的改進

- **背後儲存結構**：
  - 建立 `user_quiz_result` 表紀錄測驗分數、初始動物、答案。
  - 用 `quiz_log` 追蹤每題回答，方便之後分析。

- **SmartAnimalRangeSystem**
  - 已不再使用；後端改為整合新演算法。可保留檔案做參考或逐步移除。

- **soulAnimalStore.js 處理**：
  - 目前仍保留本地紀錄，可逐步遷移至後端儲存。

- **UI 提示**：
  - GameResults 可顯示「本次分數已加入，動物更新為 XXX」。
  - Quiz 完成後提醒「已獲得初始靈魂動物」。

---

> **備註**：此文件僅規劃整合流程，實作時請依專案實際情況調整欄位與 API 名稱。推薦先以本地測驗結果與後端紀錄雙軌並行，再逐步移除 `localStorage` 依賴。
