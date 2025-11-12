# Soul Animal UI 後端整合規劃

本文件整理如何沿用現有的前端靈魂動物 UI（原本依賴 localStorage），改為使用後端 API 所提供的心理測驗／遊戲合併數據。目標是逐步淘汰 `soulAnimalStore` 與 localStorage 儲存，並以後端為唯一資料來源。

---

## 0. 現況摘要

- **後端 API**
  - `POST /quiz/evaluate`：回傳 `{ scores, quiz_status, initial_animal }`
  - `GET /users/{user_id}/initial-animal`：心理測驗守護者
  - `GET /users/{user_id}/animal`：心理測驗 + 最近遊戲合併守護者
  - `GET /users/{user_id}/history-soul-score`：累積遊戲靈魂分數

- **前端組件**
  - `GameResults.vue`，`Animal.vue`，`SoulDisplay.vue` 目前仍有 `soulAnimalStore` 依賴
  - `Login.vue` 會在未完成測驗時禁用「遊戲開始」按鈕

- **資料來源**
  - **舊**：`src/soulAnimalStore.js`（localStorage）
  - **新**：後端回傳的 `initialAnimal` / `currentSoulAnimal`

---

## 1. 要整合的 UI 元件與代碼摘要

### 1.1 `GameResults.vue`
- 當前結構：
  - `initialAnimal`：儲存 `/users/{id}/initial-animal` 回傳
  - `currentSoulAnimal`：儲存 `/users/{id}/animal` 合併結果
  - 顯示位置：
    - `<div v-if="playerGameCount < 5">` → 初始守護者區塊
    - `<div v-if="playerGameCount >= 5 && currentSoulAnimal">` → 覺醒區域
  - 已將分數 (`soul_scores`) 顯示於畫面
- 待辦：
  1. 將從 API 取得的資料以統一格式儲存在本地（若要兼容舊 UI，可以轉成舊欄位命名 `animalResult`）
  2. 將 `soulAnimalStore` 相關呼叫替換（例如移除 loadPlayerProgress 中 localStorage 部分）
  3. 將 `GameResults` 的畫面邏輯複用到其他頁面（例如 `SoulDisplay` 也需要顯示同樣資訊）

### 1.2 `Animal.vue`
- 用於心理測驗結果顯示（16 動物）
- 內部引用 `soulAnimalStore` 取得 `animalResult`
- 若要改用後端資料：
  - 將 props 改為直接接收 `initialAnimal`，或在外層組件先轉成舊格式後傳入
  - `animalResult.animalName` → `initialAnimal.animal_name`
  - `animalResult.description` → `initialAnimal.animal_description`

### 1.3 `SoulDisplay.vue`
- 顯示「目前靈魂動物、階段、同步狀態」的小面板
- 混合使用 Pinia (`useSoulAnimalStore`) 與 `soulAnimalStore`
- 若要改用後端，需要在 App 初始化時取得 `initial_animal` / `current_animal`，再呼叫 Pinia 方法更新

### 1.4 `soulAnimalStore.js`
- 核心方法：
  - `getUserRecords(username)`：回傳 localStorage 匯出的心理測驗紀錄
  - `saveRecord(username, result)`：儲存 `animalResult` 到 localStorage
- 替代策略：
  - 短期：API 資料拿到後同步呼叫 `saveRecord`，讓舊 UI 也讀到同樣內容
  - 長期：直接刪除對 localStorage 依賴，組件改讀 API 資料即可

---

## 2. 整合步驟建議

1. **統一資料格式**
   - 目前後端回傳格式：`{ animal_name, animal_description, animal_ATM_code, soul_scores: {...} }`
   - 舊 UI 需要：`animalResult.animalName`, `animalResult.description`, `animalResult.code`
   - 建議在取得 API 資料後，在 Vue 節點中建立一個轉換函式，例如：
     ```js
     function formatAnimalForLegacyUI(animal) {
       if (!animal) return null
       return {
         animalName: animal.animal_name,
         description: animal.animal_description,
         code: animal.animal_ATM_code,
         soulScores: animal.soul_scores
       }
     }
     ```

2. **局部安置資料**
   - 在 `GameResults.vue` 的 `fetchInitialAnimal` / `fetchSoulAnimal` 完成後：
     - `this.initialAnimalLegacy = formatAnimalForLegacyUI(this.initialAnimal)`
     - `this.currentSoulAnimalLegacy = formatAnimalForLegacyUI(this.currentSoulAnimal)`
     - 如果尚需兼容 `soulAnimalStore`，可以執行 `soulAnimalStore.saveRecord(this.currentUser, { animalResult: this.initialAnimalLegacy })`

3. **調整 UI 組件**
   - `Animal.vue`：改成接受 `props.initialAnimal`，或移除對 `soulAnimalStore` 的依賴
   - `SoulDisplay.vue`：需在 App 頂層引入後端返回的 animal，再透過 Pinia 傳下
   - `GameResults.vue`：已部分整合；接下來要將與 localStorage 相關的程式刪除（例如 `firstAnimalResult`）

4. **移除 localStorage**
   - 當所有組件都改為讀取後端資料後，可以將 `soulAnimalStore.js` / `useSoulAnimalStore` 中的 localStorage 依賴逐步刪掉
   - 同時檢查 `App.vue` 和 `Quiz.vue`，確保在登入 / 測驗完成時以 API 為主

---

## 3. 代碼調整摘要

| 檔案 | 重點調整 |
|------|----------|
| `GameResults.vue` | 新增 `initialAnimal`、`currentSoulAnimal` 顯示區塊。需要移除 `firstAnimalResult`、`soulAnimalStore` 相關呼叫。 |
| `Animal.vue` | 改用 props 接收後端資料，或在父層轉換格式後傳入。 |
| `SoulDisplay.vue` | 建立 Pinia action `setAnimal`，在 App 初始化時呼叫，來源改為後端 API。 |
| `soulAnimalStore.js` | 最終目標是移除；短期可在取得 API 資料後呼叫 `saveRecord` 以兼容舊 UI。 |

---

## 4. 測試流程

1. 完成心理測驗 -> 確認 `POST /quiz/evaluate` 回傳 `initial_animal`，且 UI 顯示正確。
2. 玩 5 場遊戲 -> `GET /users/{id}/animal` 回傳合併結果，GameResults 覺醒區顯示合併分數與守護者。
3. 刷新頁面 -> `GET /users/{id}/initial-animal` / `GET /users/{id}/animal` 正常執行，UI 仍有資料。
4. 若舊 UI（`Animal.vue` / `SoulDisplay.vue`）仍需保留，確認在未完成整合前可透過 `formatAnimalForLegacyUI + saveRecord` 兼容。

---

## 5. 後續工作留意事項

- 多語或 emoji 映射：目前 `GameResults.vue` 已改成用 ATM code 對應 emoji/name，若其他組件也使用 `animal_name` 舊字串，需要同步更新。
- 錯誤處理：若 API 失敗，須顯示提示（例如「尚未完成心理測驗」）。
- 資料快取：可依需要在 Pinia 或 Vuex 中儲存 `initialAnimal` / `currentAnimal`，減少重複請求。

---

> **備註**：這份計畫以現有程式碼為基礎，優先將心理測驗與遊戲合併邏輯落在後端，並保留前端既有 UI。實作時可依實際情況調整欄位與命名，但建議確保所有組件最終由後端提供資料，避免 localStorage 造成資料舊狀況。

