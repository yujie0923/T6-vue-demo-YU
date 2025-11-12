<template>
  <div id="app" class="relative min-h-screen bg-black text-cyan-400 font-sans overflow-hidden">
    <!-- 背景粒子動畫 -->
    <canvas id="bg-canvas" class="absolute inset-0 w-full h-full z-0"></canvas>

    <!-- 主內容區 -->
    <main class="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4">
      
  <!--起始頁-->
  <Login v-if="!isLoggedIn && !gameStarted && !gameEnded && !showWelcome && !showAnalyt && !showLoginALG && !showVoiceRecognition && !showAdmin" 
  :hasCompletedQuiz="hasCompletedQuiz"
  :isLoggedIn="isLoggedIn"
  :currentUser="currentUser"
  :currentUserId="currentUserId"
  :initial-animal="initialAnimalLegacy"
  @goToWelcome="goToWelcome" 
  @startQuizOrGame="handleStartQuizOrGame"
  @onQuizCompleted="onQuizCompleted"
  @openProfile="openAnalyt"
  @openAdmin="openAdmin" 
  @goToLogin="goToLoginALG"
  @goToVoiceRecognition="goToVoiceRecognition"
  @logout="handleLogout" />
  
  <!--主介面（登入後顯示）-->
  <Login v-if="isLoggedIn && !gameStarted && !gameEnded && !showWelcome && !showAnalyt && !showLoginALG && !showVoiceRecognition && !showAdmin" 
  :hasCompletedQuiz="hasCompletedQuiz"
  :isLoggedIn="isLoggedIn"
  :currentUser="currentUser"
  :currentUserId="currentUserId"
  :initial-animal="initialAnimalLegacy"
  @goToWelcome="goToWelcome" 
  @startQuizOrGame="handleStartQuizOrGame"
  @onQuizCompleted="onQuizCompleted"
  @openProfile="openAnalyt"
  @openAdmin="openAdmin" 
  @goToLogin="goToLoginALG"
  @goToVoiceRecognition="goToVoiceRecognition"
  @logout="handleLogout" />
      
      
      <!-- Welcome 畫面 -->
      <WelcomeScreen 
        v-if="isLoggedIn && !gameStarted && !gameEnded && showWelcome && !showAdmin" 
        :userId="currentUserId"
        @start="startGame" 
        @back="goBack"
      />

  <!-- Analyt 測試頁（由 Login 的頭像打開） -->
  <Analyt v-if="!gameStarted && !gameEnded && showAnalyt && !showAdmin" @close="closeAnalyt" @logout="handleLogout" :currentUser="currentUser" />

  <!-- Login_ALG 頁面 -->
  <LoginALG v-if="!gameStarted && !gameEnded && showLoginALG && !showAdmin" @back="closeLoginALG" @loginSuccess="handleLoginSuccess" @analytSuccess="handleAnalytSuccess" />

  <!-- VoiceRecognition 頁面 -->
  <VoiceRecognition v-if="!gameStarted && !gameEnded && showVoiceRecognition && !showAdmin" @back="closeVoiceRecognition" />

  <!-- Admin 管理頁面 -->
  <Admin v-if="!gameStarted && !gameEnded && showAdmin" @back="closeAdmin" :newUserData="newUserData" />

      <!-- 遊戲進行中 -->
      <GameBoard 
        ref="gameBoardRef"
        v-if="gameStarted && !gameEnded"
        :round="round"
        :score="score"
        :mode="gameMode"
        :gameData="gameSessionData"
        :currentRoundData="currentRoundData"
        :initial-animal-legacy="initialAnimalLegacy"
        :current-soul-animal-legacy="currentSoulAnimalLegacy"
        @next-round="nextRound"
        @end-game="endGame"
        @wrong-ids="onWrongIds"
        @user-choices="onUserChoices"
        @soul-evolution="onSoulEvolution"
      />

      <!-- 遊戲結束 -->
      <GameResults 
        v-if="gameEnded"
        :round="round"
        :score="score"
        @restart="restartGame"
        :wrongIds="wrongIdsForResults"
        :userChoices="userChoicesForResults"
        :userData="userData"
        :currentUser="currentUser"
        :userId="currentUserId"
        :sessionId="gameSessionData?.session_id"
        :evolutionData="lastEvolutionData"
        :initial-animal-legacy-prop="initialAnimalLegacy"
        :current-soul-animal-legacy-prop="currentSoulAnimalLegacy"
        @update-initial-animal="handleInitialAnimalUpdate"
        @update-current-animal="handleCurrentAnimalUpdate"
        @close-evolution="closeEvolution"
      />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GameBoard from './GameBoard.vue'
import GameResults from './GameResults.vue';
import WelcomeScreen from './WelcomeScreen.vue'
import Login from './Login.vue'
import Analyt from './Analyt.vue'
import LoginALG from './Login_ALG.vue'
import VoiceRecognition from './VoiceRecognition.vue'
import Admin from './Admin.vue'
import soulAnimalStore from './soulAnimalStore.js'
import { useSoulAnimalStore } from './stores/soulAnimalSystem.js'

// 初始化靈魂動物系統
const soulStore = useSoulAnimalStore()

// GameBoard 的引用，用於調用其方法
const gameBoardRef = ref(null)

const gameStarted = ref(false)
const gameEnded = ref(false)
const showWelcome = ref(false)
const showAnalyt = ref(false)
const showLoginALG = ref(false)
const showVoiceRecognition = ref(false)
const showAdmin = ref(false)
const round = ref(1)
const score = ref(0)
const gameMode = ref('normal')  // 存選擇的遊戲模式
const wrongIdsForResults = ref([]); // <- 新增
const userChoicesForResults = ref([]); // 新增：存儲用戶選擇數據
const isAnalytLoggedIn = ref(false); // 新增：Analyt登入狀態
const hasCompletedQuiz = ref(false); // 新增：追蹤是否完成過測驗
const currentUser = ref('guest'); // 新增：當前用戶
const isLoggedIn = ref(false); // 新增：遊戲登入狀態
const currentUserId = ref(null); // 新增：當前用戶ID
const gameSessionData = ref(null) // 存儲從後端獲取的完整遊戲數據
const currentRoundData = ref([]) // 存儲當前關卡的題目數據
const userData = ref(null) // 存儲當前用戶數據
const lastEvolutionData = ref({ hasEvolved: false, xpGained: 0 }) // 靈魂系統：儲存最後的進化數據
const newUserData = ref(null) // 靈魂系統：儲存新註冊的用戶資料
const initialAnimalLegacy = ref(null) // 從後端取得的初始靈魂動物 (Legacy 格式)
const currentSoulAnimalLegacy = ref(null) // 從後端取得的合併靈魂動物 (Legacy 格式)


function goToWelcome() {
  console.log('goToWelcome called from App.vue')
  showWelcome.value = true
}

// 新增：處理測驗完成
async function onQuizCompleted() {
  syncQuizStatus(currentUser.value, 'completed')
  if (currentUserId.value) {
    await loadUserSoulAnimals(currentUserId.value)
  }
}

// 新增：處理開始測驗或遊戲的邏輯
function handleStartQuizOrGame() {
  // 這個函數會直接由 Login.vue 處理，不需要在 App.vue 中做特別處理
  // Login.vue 會根據 hasCompletedQuiz 的值決定顯示 Quiz 還是直接 emit goToWelcome
}

function syncQuizStatus(username, quizStatus) {
  const resolvedUsername = username || currentUser.value || 'guest'

  if (quizStatus === 'completed') {
    hasCompletedQuiz.value = true
    console.log(`用戶 ${resolvedUsername} 測驗狀態：completed`)
    return
  }

  hasCompletedQuiz.value = false
  console.log(`用戶 ${resolvedUsername} 測驗狀態：${quizStatus ?? '未完成'}`)
}

function getAnimalNameByCode(code = '') {
  const normalized = `${code}`.toUpperCase()
  const nameMap = {
    'R-J-P': '章魚型 SHADE',
    'R-J-R': '貓型 MUSE',
    'R-C-R': '狐狸型 ROGUE',
    'R-C-P': '獅子型 REBEL',
    'A-J-R': '烏龜型 SAGE',
    'A-C-P': '黃金獵犬型 SENTINEL',
    'A-C-R': '馬型 VALOR',
    'A-J-P': '貓頭鷹型 ORACLE'
  }
  return nameMap[normalized] || '神秘靈魂動物'
}

function formatAnimalForLegacyUI(animal) {
  if (!animal) return null
  const atmCode = animal.animal_ATM_code || animal.animal_atm_code || ''
  return {
    animalName: animal.animal_name || getAnimalNameByCode(atmCode),
    description: animal.animal_description || '',
    code: atmCode,
    soulScores: animal.soul_scores || {
      auth: animal.auth ?? 0,
      time: animal.time ?? 0,
      motive: animal.motive ?? 0
    }
  }
}

async function loadUserSoulAnimals(userId) {
  if (!userId) {
    initialAnimalLegacy.value = null
    currentSoulAnimalLegacy.value = null
    return
  }

  try {
    const [initialRes, currentRes] = await Promise.allSettled([
      fetch(`http://localhost:8000/users/${userId}/initial-animal`),
      fetch(`http://localhost:8000/users/${userId}/animal`)
    ])

    if (initialRes.status === 'fulfilled') {
      const response = initialRes.value
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          initialAnimalLegacy.value = formatAnimalForLegacyUI(result.data)
        } else {
          initialAnimalLegacy.value = null
        }
      } else {
        initialAnimalLegacy.value = null
      }
    } else {
      initialAnimalLegacy.value = null
    }

    if (currentRes.status === 'fulfilled') {
      const response = currentRes.value
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          currentSoulAnimalLegacy.value = formatAnimalForLegacyUI(result.data)
        } else {
          currentSoulAnimalLegacy.value = null
        }
      } else {
        currentSoulAnimalLegacy.value = null
      }
    } else {
      currentSoulAnimalLegacy.value = null
    }
  } catch (error) {
    console.error('同步靈魂動物資料失敗:', error)
    initialAnimalLegacy.value = null
    currentSoulAnimalLegacy.value = null
  }
}

function handleInitialAnimalUpdate(legacyAnimal) {
  initialAnimalLegacy.value = legacyAnimal
}

function handleCurrentAnimalUpdate(legacyAnimal) {
  currentSoulAnimalLegacy.value = legacyAnimal
}

// 接收 WelcomeScreen 傳過來的模式和使用者ID
async function startGame(gameData) {
  console.log("App.vue 開始遊戲, 資料:", gameData) // 測試用

  if (!hasCompletedQuiz.value) {
    alert('請先完成防詐心理測驗')
    return
  }
  
  // 清空上一局的數據
  round.value = 1
  score.value = 0
  wrongIdsForResults.value = []
  userChoicesForResults.value = []
  
  // 處理新的參數格式
  if (typeof gameData === 'object' && gameData.mode) {
    gameMode.value = gameData.mode
    console.log("使用者ID:", gameData.userId)
    
    try {
      // 調用後端 API 獲取遊戲數據
      const response = await fetch('http://localhost:8000/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: gameData.userId,
          game_mode: gameData.mode
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('遊戲數據獲取成功:', result)
      
      // 檢查新的響應格式
      if (!result.success) {
        throw new Error(result.error || result.message)
      }
      
      // 測試程式碼：打印從資料庫獲取到的題目內容和ID
      console.log('=== 測試：從資料庫獲取的題目內容和ID ===')
      if (result.data && result.data.rounds) {
        result.data.rounds.forEach((round, index) => {
          console.log(`第${index + 1}關題目:`)
          round.questions.forEach((question, qIndex) => {
            console.log(`  題目${qIndex + 1}:`)
            console.log(`    ID: ${question[0]}`)
            console.log(`    來源: ${question[1]}`)
            console.log(`    內容: ${question[2]}`)
            console.log(`    是否真實: ${question[3]}`)
            console.log(`    類別: ${question[4]}`)
            console.log('    ---')
          })
        })
      }
      console.log('=== 測試結束 ===')
      
      // 存儲遊戲數據
      gameSessionData.value = result.data
      
      // 設置第一關的題目數據
      if (result.data && result.data.rounds && result.data.rounds.length > 0) {
        currentRoundData.value = result.data.rounds[0].questions
        console.log('第一關題目:', currentRoundData.value)
      }
      
      gameStarted.value = true
      showWelcome.value = false
      
      // 靈魂系統：開始新的遊戲會話
      soulStore.startGameSession()
      
    } catch (error) {
      console.error('獲取遊戲數據失敗:', error)
      alert('遊戲啟動失敗，請稍後再試')
    }
  } else {
    // 兼容舊格式
    gameMode.value = gameData || 'normal'
    gameStarted.value = true
    showWelcome.value = false
    
    // 靈魂系統：開始新的遊戲會話
    soulStore.startGameSession()
  }
}

function nextRound(correct) {
  if (correct) score.value += 20
  
  // 使用動態的 total_rounds 檢查是否還有下一關
  const totalRounds = gameSessionData.value?.total_rounds || 5  // 默認值為5以保持兼容性
  
  if (round.value < totalRounds) {
    round.value++
    
    // 設置下一關的題目數據
    if (gameSessionData.value && gameSessionData.value.rounds && gameSessionData.value.rounds.length >= round.value) {
      currentRoundData.value = gameSessionData.value.rounds[round.value - 1].questions
      console.log(`第${round.value}關題目:`, currentRoundData.value)
    }
  } else {
    // 所有回合結束，加載心理測驗結果並結束遊戲
    loadPsychologyQuizResults()
    endGame()
  }
}

function loadPsychologyQuizResults() {
  // 從存儲中加載之前的心理測驗結果
  console.log('加載心理測驗結果...')
  
  try {
    // 方法1: 從soulAnimalStore獲取當前用戶的最新測驗記錄
    const userRecords = soulAnimalStore.getUserRecords(currentUser.value)
    if (userRecords && userRecords.length > 0) {
      const latestRecord = userRecords[0] // 獲取最新的記錄
      console.log('找到用戶測驗記錄:', latestRecord)
      
      if (latestRecord.animalResult) {
        // 將動物類型設置到靈魂系統
        const animalCode = latestRecord.animalResult.finalAnimal
        
        // 需要將動物類型轉換為KTDI代碼格式
        const animalCodeMap = {
          'fox': 'KDSL', 'eagle': 'KDSR', 'owl': 'KDGL', 'shark': 'KDGR',
          'squirrel': 'KISL', 'octopus': 'KISR', 'cat': 'KIGL', 'wolf': 'KIGR',
          'turtle': 'TDSL', 'elephant': 'TDSR', 'hippo': 'TDGL', 'gorilla': 'TDGR',
          'mouse': 'TISL', 'lion': 'TISR', 'deer': 'TIGL', 'dog': 'TIGR'
        }
        
        const ktdiCode = animalCodeMap[animalCode]
        if (ktdiCode) {
          soulStore.setAnimalFromQuiz(ktdiCode)
          console.log('已設置動物類型:', ktdiCode, '對應:', animalCode)
        } else {
          console.warn('找不到對應的KTDI代碼:', animalCode)
        }
      }
      return
    }
    
    // 方法2: 嘗試從localStorage直接讀取
    const quizResults = localStorage.getItem('psychologyQuizResults')
    if (quizResults) {
      const parsedResults = JSON.parse(quizResults)
      console.log('找到localStorage中的心理測驗結果:', parsedResults)
      
      // 將結果設置到靈魂系統
      if (parsedResults.animalType && parsedResults.animalType.code) {
        soulStore.setAnimalFromQuiz(parsedResults.animalType.code, parsedResults.scores)
        console.log('已設置動物類型:', parsedResults.animalType.code)
      }
    } else {
      console.log('未找到心理測驗結果，將使用遊戲中累積的數據')
    }
  } catch (error) {
    console.error('加載心理測驗結果失敗:', error)
  }
}

async function endGame() {
  console.log('=== App.vue endGame Debug ===');
  
  // 停止所有音效（遊戲結束時）
  if (gameBoardRef.value && gameBoardRef.value.stopAllAudio) {
    gameBoardRef.value.stopAllAudio()
    console.log('已停止所有遊戲音效')
  }
  
  gameStarted.value = false
  
  // === 新增：調用後端 complete_game API 保存遊戲結果 ===
  if (gameSessionData.value && gameSessionData.value.session_id && userChoicesForResults.value.length > 0) {
    try {
      console.log('準備發送遊戲完成數據到後端:', {
        session_id: gameSessionData.value.session_id,
        rounds: userChoicesForResults.value
      });
      
      // 轉換數據格式以符合後端 API 要求
      const roundsData = userChoicesForResults.value.map(choice => ({
        round_number: choice.round,
        user_choice_id: choice.userChoiceId,
        correct_answer_id: choice.correctAnswerId,
        is_correct: choice.isCorrect,
        response_time: choice.responseTime || 0
      }));
      
      const response = await fetch('http://localhost:8000/games/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: gameSessionData.value.session_id,
          rounds: roundsData
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        console.log('遊戲結果已成功保存到資料庫:', result);
      } else {
        console.warn('保存遊戲結果時出現問題:', result.message || result.error);
      }
    } catch (error) {
      console.error('保存遊戲結果失敗:', error);
      // 不阻止遊戲結束流程，只記錄錯誤
    }
  } else {
    console.warn('無法保存遊戲結果：缺少 session_id 或用戶選擇數據', {
      hasSessionId: !!gameSessionData.value?.session_id,
      hasChoices: userChoicesForResults.value.length > 0
    });
  }
  
  // === Allen1 系統：獲取用戶數據 ===
  if (currentUserId.value) {
    console.log('遊戲結束，開始獲取用戶數據，用戶ID:', currentUserId.value)
    const userInfo = await getUserData(currentUserId.value)
    if (userInfo) {
      userData.value = userInfo
      console.log('用戶數據獲取成功:', userInfo)
    } else {
      console.warn('無法獲取用戶數據')
    }
  }
  
  // === main 靈魂系統：保留進化數據並結束遊戲會話 ===
  const lastRoundGains = lastEvolutionData.value.roundGains
  console.log('保留的最後一回合 roundGains:', lastRoundGains);

  const sessionGains = soulStore.endGameSession()
  console.log('App.vue endGame sessionGains:', sessionGains);
  
  if (sessionGains) {
    lastEvolutionData.value = {
      ...lastEvolutionData.value,
      sessionGains: sessionGains,
      roundGains: lastRoundGains
    }
    console.log('遊戲結束，本局獲得分數:', sessionGains)
  }
  
  gameEnded.value = true
  
  console.log('=== App.vue endGame Debug 結束 ===');
}

function restartGame() {
  gameStarted.value = false
  gameEnded.value = false
  showWelcome.value = false
  round.value = 1
  score.value = 0
  gameMode.value = 'normal'
  wrongIdsForResults.value = [] // 清空錯題ID
  userChoicesForResults.value = [] // 清空用戶選擇數據
  gameSessionData.value = null // 清空遊戲數據
  currentRoundData.value = [] // 清空當前關卡數據
  // 重置登入狀態（可選，根據需求決定是否重置）
  // isAnalytLoggedIn.value = false
  // 注意：不重置 isLoggedIn 和 currentUserId，保持登入狀態
}

function goBack() {
  // 從 WelcomeScreen 返回 Login
  showWelcome.value = false
}

function openAnalyt() {
  // 只要登入成功就可以跳轉到 Analyt.vue
  if (isLoggedIn.value) {
    showAnalyt.value = true
    console.log('跳轉到 Analyt 介面')
  } else {
    alert('你尚未登入，請先登入帳號')
  }
}

function openAdmin() {
  // 只要登入成功就可以跳轉到管理後台
  if (isLoggedIn.value) {
    showAdmin.value = true
    console.log('跳轉到管理後台')
  } else {
    alert('你尚未登入，請先登入帳號')
  }
}

function closeAnalyt() {
  showAnalyt.value = false
  // 注意：不重置 isAnalytLoggedIn.value，保持登入狀態
}

// 新增：處理登出功能（整合兩個系統）
function handleLogout() {
  // === Allen1 遊戲系統：重置遊戲登入狀態 ===
  isLoggedIn.value = false
  currentUserId.value = null
  currentUser.value = 'guest'
  
  // === main 靈魂系統：重置靈魂動物系統的登錄狀態 ===
  soulStore.setUserLoginStatus(false, null)
  
  // 清空已同步的靈魂動物資料
  initialAnimalLegacy.value = null
  currentSoulAnimalLegacy.value = null
  
  // === 共同重置 ===
  isAnalytLoggedIn.value = false
  hasCompletedQuiz.value = false  // 重置測驗完成狀態
  
  // === Allen1 版本：關閉所有頁面，回到起始頁 ===
  showWelcome.value = false
  showAnalyt.value = false
  showLoginALG.value = false
  showVoiceRecognition.value = false
  showAdmin.value = false
  
  console.log('用戶已登出，回到登入頁面')
}

function goToLoginALG() {
  showLoginALG.value = true
}

function closeLoginALG() {
  showLoginALG.value = false
}

function goToVoiceRecognition() {
  showVoiceRecognition.value = true
}

function closeVoiceRecognition() {
  showVoiceRecognition.value = false
}

async function handleLoginSuccess(userInfo) {
  console.log('登入成功:', userInfo)

  // 設置登入狀態和用戶資訊
  isAnalytLoggedIn.value = true
  currentUser.value = userInfo.username
  
  // 🌟 設置靈魂動物系統的登錄狀態並觸發同步
  soulStore.setUserLoginStatus(true, userInfo.username)

  // 設置遊戲登入狀態
  isLoggedIn.value = true
  currentUserId.value = userInfo.user_id || userInfo.userid || userInfo.id || userInfo.username
  currentUser.value = userInfo.username || userInfo.name

  await loadUserSoulAnimals(currentUserId.value)

  syncQuizStatus(userInfo.username, userInfo.quiz_status)
  
  // 關閉登入頁面
  showLoginALG.value = false
  
  // 根據 role 決定跳轉
  if (userInfo.role === 'admin') {
    // 如果是 admin，跳轉到 Admin.vue
    showAdmin.value = true
    console.log('管理員登入，跳轉到管理介面')
  } else {
    // 如果是其他角色或 null，不設置任何 show 值，讓 Login 組件自動顯示
    // Login 組件會在 v-if 條件滿足時自動顯示
    console.log('一般用戶登入，顯示 Login 介面')
  }
}

async function handleAnalytSuccess(userInfo) {
  console.log('Analyt登入成功:', userInfo)
  
  // 🌟 設置靈魂動物系統的登錄狀態並觸發同步
  soulStore.setUserLoginStatus(true, userInfo.username)
  
  // 設置遊戲登入狀態
  isLoggedIn.value = true
  currentUserId.value = userInfo.user_id || userInfo.userid || userInfo.id || userInfo.username
  currentUser.value = userInfo.username
  
  await loadUserSoulAnimals(currentUserId.value)
  
  // 轉移 guest 用戶的記錄到實際登錄用戶
  const transferred = soulAnimalStore.transferRecords('guest', userInfo.username)
  if (transferred) {
    console.log(`已轉移 guest 記錄至 ${userInfo.username}`)
  }
  
  // 設置 Analyt 登入狀態
  isAnalytLoggedIn.value = true

  syncQuizStatus(userInfo.username, userInfo.quiz_status)
  
  // 關閉登入頁面，打開分析頁面
  showLoginALG.value = false
  showAnalyt.value = true
}

async function getUserData(userId) {
  try {
    // 調用後端 API 獲取用戶數據
    const response = await fetch(`http://localhost:8000/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('用戶數據獲取成功:', result)
    
    if (result.success) {
      return result.data
    } else {
      console.error('獲取用戶數據失敗:', result.message)
      return null
    }
  } catch (error) {
    console.error('獲取用戶數據失敗:', error)
    return null
  }
}

function closeAdmin() {
  // 關閉 Admin 頁面，回到 Login 介面
  showAdmin.value = false
  // 不關閉其他界面，讓 Login 組件顯示（因為 v-if 條件會自動滿足）
}

// 接收 GameBoard emit 的錯題 id
function onWrongIds(ids) {
    console.log('App.vue 接收到錯題ID:', ids);
    wrongIdsForResults.value = ids;
}

// 接收 GameBoard emit 的用戶選擇數據
function onUserChoices(choices) {
    console.log('App.vue 接收到用戶選擇數據:', choices);
    userChoicesForResults.value = choices;
}

// 處理靈魂進化事件
function onSoulEvolution(evolutionData) {
    console.log('=== App.vue onSoulEvolution Debug ===');
    console.log('App.vue 接收到靈魂進化數據:', evolutionData);
    console.log('evolutionData.roundGains:', evolutionData.roundGains);
    lastEvolutionData.value = evolutionData;
    
    // 如果有進化發生，可以在這裡添加額外的處理邏輯
    if (evolutionData.hasEvolved) {
        console.log(`🌟 靈魂進化！從 ${evolutionData.previousStage.name} 進化到 ${evolutionData.newStage.name}`);
        if (evolutionData.currentAnimal) {
            console.log(`🦊 覺醒為 ${evolutionData.currentAnimal.animal}型 (${evolutionData.currentAnimal.group})`);
        }
    }
    console.log('=== App.vue Debug 結束 ===');
}

// 關閉進化特效
function closeEvolution() {
    if (lastEvolutionData.value.hasEvolved) {
        lastEvolutionData.value = { ...lastEvolutionData.value, hasEvolved: false };
    }
}

// 開發環境：將 soulStore 掛載到全域，方便控制台調試
if (import.meta.env.DEV) {
  window.soulStore = soulStore;
  window.soulAnimalStore = soulAnimalStore; // 添加 soulAnimalStore
  console.log('🔧 開發模式：soulStore 已掛載到 window.soulStore，可以在控制台中使用');
  console.log('📝 使用方法：');
  console.log('  - 診斷：window.soulStore.diagnosePsychologyScores()');
  console.log('  - 修復：window.soulStore.fixPsychologyScores()');
  console.log('  - 清理用戶：window.soulStore.clearUserData("username")');
  console.log('  - 修復動物名稱：window.soulAnimalStore.fixAnimalNames("username") 或 fixAnimalNames() 修復所有用戶');
}
</script>
