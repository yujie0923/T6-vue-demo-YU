/**
 * ✅ JavaScript 源碼 - 可直接編輯
 * 靈魂動物演化系統 - 混合持久化版本
 * Source file: 此文件為手寫 JavaScript 源碼，非編譯產物
 * 核心功能：KTDI心理學分析、動物演化、持久化管理
 */

// 靈魂動物演化系統 - 混合持久化版本
import { ref, computed } from 'vue'

// 16種動物KTDI對應表
export const ANIMAL_KTDI_MAPPING = {
  // 【深潛分析局】(K-D - 懷疑且審慎)
  'KDSL': { animal: '狐狸', emoji: '🦊', group: '深潛分析局', traits: ['懷疑', '審慎', '細節', '規避損失'] },
  'KDSR': { animal: '老鷹', emoji: '🦅', group: '深潛分析局', traits: ['懷疑', '審慎', '細節', '追求獎勵'] },
  'KDGL': { animal: '貓頭鷹', emoji: '🦉', group: '深潛分析局', traits: ['懷疑', '審慎', '直覺', '規避損失'] },
  'KDGR': { animal: '鯊魚', emoji: '🦈', group: '深潛分析局', traits: ['懷疑', '審慎', '直覺', '追求獎勵'] },
  
  // 【影襲特攻隊】(K-I - 懷疑但即時)
  'KISL': { animal: '松鼠', emoji: '🐿️', group: '影襲特攻隊', traits: ['懷疑', '即時', '細節', '規避損失'] },
  'KISR': { animal: '章魚', emoji: '🐙', group: '影襲特攻隊', traits: ['懷疑', '即時', '細節', '追求獎勵'] },
  'KIGL': { animal: '貓咪', emoji: '🐱', group: '影襲特攻隊', traits: ['懷疑', '即時', '直覺', '規避損失'] },
  'KIGR': { animal: '狼', emoji: '🐺', group: '影襲特攻隊', traits: ['懷疑', '即時', '直覺', '追求獎勵'] },
  
  // 【重裝守備隊】(T-D - 信任且審慎)
  'TDSL': { animal: '烏龜', emoji: '🐢', group: '重裝守備隊', traits: ['信任', '審慎', '細節', '規避損失'] },
  'TDSR': { animal: '大象', emoji: '🐘', group: '重裝守備隊', traits: ['信任', '審慎', '細節', '追求獎勵'] },
  'TDGL': { animal: '河馬', emoji: '🦛', group: '重裝守備隊', traits: ['信任', '審慎', '直覺', '規避損失'] },
  'TDGR': { animal: '金剛', emoji: '🦍', group: '重裝守備隊', traits: ['信任', '審慎', '直覺', '追求獎勵'] },
  
  // 【閃電先鋒】(T-I - 信任且即時)
  'TISL': { animal: '老鼠', emoji: '🐭', group: '閃電先鋒', traits: ['信任', '即時', '細節', '規避損失'] },
  'TISR': { animal: '水獺', emoji: '🦦', group: '閃電先鋒', traits: ['信任', '即時', '細節', '追求獎勵'] },
  'TIGL': { animal: '麋鹿', emoji: '🦌', group: '閃電先鋒', traits: ['信任', '即時', '直覺', '規避損失'] },
  'TIGR': { animal: '柴犬', emoji: '🐶', group: '閃電先鋒', traits: ['信任', '即時', '直覺', '追求獎勵'] }
}

// 3階段進化系統
export const EVOLUTION_STAGES = {
  SEED: { name: '種子期', minXP: 0, maxXP: 299, description: '靈魂初醒，正在探索自己的本性' },
  INITIAL: { name: '初始期', minXP: 300, maxXP: 999, description: '個性漸明，開始展現獨特特質' },
  EVOLUTION: { name: '進化期', minXP: 1000, maxXP: Infinity, description: '靈魂覺醒，展現完整的防詐能力' }
}

// 覺醒後的等級系統（進化期細分為10個等級）
export const AWAKENING_LEVELS = {
  1: { name: 'Lv1 覺醒', minXP: 1000, maxXP: 1499, description: '初次覺醒，開始展現靈魂動物真實能力' },
  2: { name: 'Lv2 成長', minXP: 1500, maxXP: 2199, description: '能力穩定成長，防詐技巧日益精進' },
  3: { name: 'Lv3 熟練', minXP: 2200, maxXP: 3099, description: '技巧趨於熟練，能識別複雜詐騙手法' },
  4: { name: 'Lv4 專精', minXP: 3100, maxXP: 4199, description: '專精於特定領域的防詐能力' },
  5: { name: 'Lv5 大師', minXP: 4200, maxXP: 5499, description: '防詐大師級能力，經驗豐富' },
  6: { name: 'Lv6 宗師', minXP: 5500, maxXP: 7099, description: '宗師級洞察力，能預測詐騙趨勢' },
  7: { name: 'Lv7 傳說', minXP: 7100, maxXP: 9099, description: '傳說級的防詐智慧，罕見的高手' },
  8: { name: 'Lv8 神話', minXP: 9100, maxXP: 11599, description: '神話級的防詐能力，幾乎無懈可擊' },
  9: { name: 'Lv9 史詩', minXP: 11600, maxXP: 14799, description: '史詩級的防詐智慧，能教導他人' },
  10: { name: 'Lv10 究極', minXP: 14800, maxXP: Infinity, description: '究極進化形態，如鋼鐵金剛般堅不可摧' }
}

// 根據XP計算覺醒等級
export const getAwakeningLevel = (xp) => {
  if (xp < 1000) return null // 未覺醒
  
  for (let level = 1; level <= 10; level++) {
    const levelData = AWAKENING_LEVELS[level]
    if (xp >= levelData.minXP && xp <= levelData.maxXP) {
      return { level, ...levelData }
    }
  }
  return { level: 10, ...AWAKENING_LEVELS[10] } // 超過最高等級時返回Lv10
}

// 靈魂XP獲得規則
export const XP_RULES = {
  CORRECT_ANSWER: 50,      // 正確答案基礎XP
  INCORRECT_ANSWER: 10,    // 錯誤答案基礎XP
  QUIZ_COMPLETION: 100,    // 完成心理測驗一次性獎勵
  PSYCHOLOGY_BONUS: 10,    // 心理學分析加成
  TECH_BONUS: 15,          // 科技識別加成
  STREAK_MULTIPLIER: 1.5,  // 連續答對倍數
  TIME_BONUS: {            // 時間加成
    FAST: 25,   // <5秒
    NORMAL: 15, // 5-10秒
    SLOW: 5     // >10秒
  }
}

// 持久化類型枚舉
export const PERSISTENCE_TYPES = {
  LOCAL_ONLY: 'local_only',       // 僅本地存儲
  CLOUD_ONLY: 'cloud_only',       // 僅雲端存儲
  HYBRID: 'hybrid'                // 混合模式
}

// 同步狀態枚舉
export const SYNC_STATUS = {
  NOT_SYNCED: 'not_synced',       // 未同步
  SYNCING: 'syncing',             // 同步中
  SYNCED: 'synced',               // 已同步
  SYNC_ERROR: 'sync_error'        // 同步失敗
}

// API端點配置
const API_BASE_URL = 'http://localhost:3000'
const API_ENDPOINTS = {
  SYNC_SOUL_DATA: `${API_BASE_URL}/api/soul/save`,  // 修復：改為 save
  GET_SOUL_DATA: `${API_BASE_URL}/api/soul/sync`,   // 修復：改為 sync (GET)
  UPLOAD_SOUL_DATA: `${API_BASE_URL}/api/soul/save` // 保持一致
}

// 混合持久化管理器
class HybridPersistenceManager {
  constructor() {
    this.isLoggedIn = false
    this.currentUser = null
    this.syncStatus = ref(SYNC_STATUS.NOT_SYNCED)
    this.lastSyncTime = ref(null)
  }

  // 設置用戶登錄狀態
  setLoginStatus(isLoggedIn, username = null) {
    this.isLoggedIn = isLoggedIn
    this.currentUser = username
    
    if (isLoggedIn && username) {
      // 登錄後立即觸發同步
      this.syncDataToCloud()
    }
  }

  // 本地存儲操作
  saveToLocal(key, value) {
    try {
      const data = {
        value,
        timestamp: Date.now(),
        version: '1.0',
        user: this.currentUser || 'guest'
      }
      localStorage.setItem(`soul_${key}`, JSON.stringify(data))
      return true
    } catch (error) {
      console.warn('本地存儲失敗:', error)
      return false
    }
  }

  loadFromLocal(key, defaultValue) {
    try {
      const stored = localStorage.getItem(`soul_${key}`)
      if (!stored) return defaultValue
      
      const data = JSON.parse(stored)
      return data.value !== undefined ? data.value : defaultValue
    } catch (error) {
      console.warn('本地讀取失敗:', error)
      return defaultValue
    }
  }

  // 雲端同步操作
  async syncDataToCloud() {
    if (!this.isLoggedIn || !this.currentUser) {
      console.log('未登錄，跳過雲端同步')
      return false
    }

    this.syncStatus.value = SYNC_STATUS.SYNCING

    try {
      // 收集本地數據
      const localData = this.collectLocalData()
      
      // 上傳到後端
      const response = await fetch(`${API_ENDPOINTS.SYNC_SOUL_DATA}/${this.currentUser}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          username: this.currentUser,
          soulData: localData,
          clientTimestamp: Date.now()
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // 處理同步結果
        if (result.needsMerge) {
          await this.mergeCloudData(result.cloudData, localData)
        }
        
        this.syncStatus.value = SYNC_STATUS.SYNCED
        this.lastSyncTime.value = Date.now()
        
        // 只在首次同步或有變更時記錄
        if (!this.lastSyncTime.value || result.hasChanges) {
          console.log('雲端同步成功')
        }
        return true
      } else {
        throw new Error(`同步失敗: ${response.status}`)
      }
    } catch (error) {
      console.warn('雲端同步失敗，將繼續使用本地存儲:', error.message)
      this.syncStatus.value = SYNC_STATUS.SYNC_ERROR
      return false
    }
  }

  // 從雲端加載數據
  async loadFromCloud() {
    if (!this.isLoggedIn || !this.currentUser) {
      return null
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.GET_SOUL_DATA}?username=${this.currentUser}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      })

      if (response.ok) {
        const cloudData = await response.json()
        return cloudData.soulData
      }
    } catch (error) {
      console.error('雲端加載錯誤:', error)
    }
    
    return null
  }

  // 收集本地數據
  collectLocalData() {
    return {
      soulXP: this.loadFromLocal('soulXP', 0),
      techLevel: this.loadFromLocal('techLevel', 1),
      currentAnimalCode: this.loadFromLocal('currentAnimalCode', null),
      gameHistory: this.loadFromLocal('gameHistory', []),
      psychologyScores: this.loadFromLocal('psychologyScores', {
        authority: 0, timing: 0, style: 0, motivation: 0, tech: 0
      }),
      timestamp: Date.now()
    }
  }

  // 合併雲端數據
  async mergeCloudData(cloudData, localData) {
    console.log('開始合併數據...')
    
    // 檢查是否有進行中的遊戲會話，如果有就不合併以避免干擾
    // 從 localStorage 檢查遊戲會話狀態，使用正確的 key 格式
    const gameSessionDataFromStorage = JSON.parse(localStorage.getItem('soul_gameSessionData') || 'null')
    if (gameSessionDataFromStorage && gameSessionDataFromStorage.value && gameSessionDataFromStorage.value.isGameActive) {
      console.log('⚠️ 遊戲會話進行中，跳過數據合併以避免干擾')
      return localData
    }
    
    // 數據合併策略：
    // 1. XP取最高值
    // 2. 科技等級取最高值
    // 3. 遊戲歷史合併（去重）
    // 4. 動物類型基於最新XP重新計算

    const mergedData = {
      soulXP: Math.max(cloudData.soulXP || 0, localData.soulXP || 0),
      techLevel: Math.max(cloudData.techLevel || 1, localData.techLevel || 1),
      currentAnimalCode: cloudData.currentAnimalCode || localData.currentAnimalCode,
      gameHistory: this.mergeGameHistory(cloudData.gameHistory || [], localData.gameHistory || []),
      psychologyScores: cloudData.psychologyScores || localData.psychologyScores || {
        authority: 0, timing: 0, style: 0, motivation: 0, tech: 0
      }
    }

    // 特別處理：保存數據時不能覆蓋正在進行的遊戲會話
    // 先備份當前的遊戲會話數據（使用正確的 key）
    const currentGameSession = JSON.parse(localStorage.getItem('soul_gameSessionData') || 'null')
    
    // 保存合併後的數據到本地
    Object.keys(mergedData).forEach(key => {
      this.saveToLocal(key, mergedData[key])
    })
    
    // 恢復遊戲會話數據（如果存在）
    if (currentGameSession && currentGameSession.value && currentGameSession.value.isGameActive) {
      localStorage.setItem('soul_gameSessionData', JSON.stringify(currentGameSession))
      console.log('🔄 已恢復遊戲會話數據，避免被數據合併覆蓋')
    }

    console.log('數據合併完成:', mergedData)
    return mergedData
  }

  // 合併遊戲歷史（去重+排序）
  mergeGameHistory(cloudHistory, localHistory) {
    const combined = [...cloudHistory, ...localHistory]
    const uniqueHistory = combined.filter((item, index, arr) => 
      arr.findIndex(i => i.timestamp === item.timestamp && i.messageId === item.messageId) === index
    )
    
    return uniqueHistory.sort((a, b) => b.timestamp - a.timestamp).slice(0, 1000) // 保留最近1000條
  }

  // 獲取認證令牌
  getAuthToken() {
    // 這裡應該從實際的認證系統獲取token
    // 暫時返回模擬值
    return localStorage.getItem('auth_token') || 'mock_token'
  }
}

// 創建全局持久化管理器實例
const persistenceManager = new HybridPersistenceManager()

// 響應式狀態管理
export const useSoulAnimalStore = () => {
  // 從持久化管理器讀取或初始化數據
  const loadFromPersistence = (key, defaultValue) => {
    return persistenceManager.loadFromLocal(key, defaultValue)
  }

  // 特殊的psychologyScores加載函數，確保包含完整的五個維度
  const loadPsychologyScores = () => {
    const defaultScores = {
      authority: 0,    // 權威信任度
      timing: 0,       // 時間反應
      style: 0,        // 思考風格
      motivation: 0,   // 動機傾向
      tech: 0          // 科技適應度
    };
    
    const loadedScores = persistenceManager.loadFromLocal('psychologyScores', defaultScores);
    
    // 確保所有維度都存在
    const migratedScores = {
      authority: loadedScores.authority || 0,
      timing: loadedScores.timing || 0,
      style: loadedScores.style || 0,
      motivation: loadedScores.motivation || 0,
      tech: loadedScores.tech || 0
    };
    
    return migratedScores;
  }

  const saveToPersistence = (key, value) => {
    console.log('🔧 saveToPersistence 被調用:', key, JSON.parse(JSON.stringify(value)))
    const result = persistenceManager.saveToLocal(key, value)
    console.log('🔧 saveToLocal 結果:', result)
    
    // 驗證是否真的保存了
    const saved = localStorage.getItem(`soul_${key}`)
    console.log('🔧 localStorage 驗證:', key, saved ? '已保存' : '未保存', saved?.substring(0, 100))
    
    // 如果已登錄，異步同步到雲端
    if (persistenceManager.isLoggedIn) {
      // 延遲同步，避免頻繁請求
      clearTimeout(persistenceManager.syncTimeout)
      persistenceManager.syncTimeout = setTimeout(() => {
        persistenceManager.syncDataToCloud()
      }, 2000) // 2秒後同步
    }
  }

  // 響應式狀態
  const soulXP = ref(loadFromPersistence('soulXP', 0))
  const techLevel = ref(loadFromPersistence('techLevel', 1))
  const currentAnimalCode = ref(loadFromPersistence('currentAnimalCode', 'TIGL')) // 默認為麋鹿
  const gameHistory = ref(loadFromPersistence('gameHistory', []))
  const answerStreak = ref(0)
  
  // 新增：動物轉換歷史記錄
  const transformHistory = ref(loadFromPersistence('transformHistory', []))
  
  // 心理特質分數 (KTDI)
  const psychologyScores = ref(loadPsychologyScores())

  // 新增：遊戲會話追蹤
  const gameSessionData = ref(loadFromPersistence('gameSessionData', {
    isGameActive: false,
    startPsychologyScores: null,
    startTechLevel: 1,
    sessionGains: {
      psychology: { authority: 0, timing: 0, style: 0, motivation: 0 },
      tech: 0
    },
    roundHistory: [] // 新增：記錄每回合的分數增加
  }))

  // 同步狀態
  const syncStatus = persistenceManager.syncStatus
  const lastSyncTime = persistenceManager.lastSyncTime

  // 計算屬性
  const currentStage = computed(() => {
    const xp = soulXP.value
    if (xp >= EVOLUTION_STAGES.EVOLUTION.minXP) return EVOLUTION_STAGES.EVOLUTION
    if (xp >= EVOLUTION_STAGES.INITIAL.minXP) return EVOLUTION_STAGES.INITIAL
    return EVOLUTION_STAGES.SEED
  })

  const currentAnimal = computed(() => {
    console.log('Computing currentAnimal, currentAnimalCode.value:', currentAnimalCode.value)
    if (!currentAnimalCode.value) return null
    const animal = ANIMAL_KTDI_MAPPING[currentAnimalCode.value]
    console.log('Found animal for code', currentAnimalCode.value, ':', animal)
    // 如果找不到對應的動物，清除無效的代碼
    if (!animal) {
      console.warn('無效的動物代碼:', currentAnimalCode.value)
      currentAnimalCode.value = null
      saveToPersistence('currentAnimalCode', null)
      return null
    }
    return animal
  })

  const progressToNextStage = computed(() => {
    const xp = soulXP.value
    const stage = currentStage.value
    if (stage === EVOLUTION_STAGES.EVOLUTION) return 100
    
    const progress = ((xp - stage.minXP) / (stage.maxXP - stage.minXP)) * 100
    return Math.min(100, Math.max(0, progress))
  })

  // 根據KTDI分數計算動物類型
  const calculateAnimalType = (ktdiScores) => {
    const { authority, timing, style, motivation } = ktdiScores
    
    // K(懷疑) vs T(信任) - authority + timing 的平均
    const trustLevel = (authority + timing) / 2
    const trustChar = trustLevel >= 1 ? 'K' : 'T'
    
    // D(審慎) vs I(即時) - 基於timing
    const speedChar = timing >= 1 ? 'D' : 'I'
    
    // S(細節) vs G(直覺) - 基於style
    const styleChar = style >= 1 ? 'S' : 'G'
    
    // L(規避損失) vs R(追求獎勵) - 基於motivation
    const motivationChar = motivation >= 1 ? 'L' : 'R'
    
    return `${trustChar}${speedChar}${styleChar}${motivationChar}`
  }

  // 計算答題獲得的XP
  const calculateXP = (isCorrect, psychologyScores, techScore, answerTime) => {
    let baseXP = isCorrect ? XP_RULES.CORRECT_ANSWER : XP_RULES.INCORRECT_ANSWER
    let bonus = 0

    // 心理學分析加成
    if (isCorrect && psychologyScores) {
      const totalPsychScore = Object.values(psychologyScores).reduce((sum, score) => sum + score, 0)
      bonus += (totalPsychScore / 4) * XP_RULES.PSYCHOLOGY_BONUS
    }

    // 科技識別加成
    if (isCorrect && techScore > 0) {
      bonus += techScore * XP_RULES.TECH_BONUS
    }

    // 時間加成
    if (isCorrect && answerTime) {
      if (answerTime < 5000) bonus += XP_RULES.TIME_BONUS.FAST
      else if (answerTime < 10000) bonus += XP_RULES.TIME_BONUS.NORMAL
      else bonus += XP_RULES.TIME_BONUS.SLOW
    }

    // 連續答對倍數
    if (isCorrect && answerStreak.value > 0) {
      const multiplier = Math.min(1 + (answerStreak.value * 0.1), XP_RULES.STREAK_MULTIPLIER)
      baseXP = Math.floor(baseXP * multiplier)
    }

    return Math.floor(baseXP + bonus)
  }

  // 處理答題結果
  const processAnswer = (isCorrect, roundData, answerTime, userKTDI) => {
    console.log('=== processAnswer Debug ===')
    console.log('isCorrect:', isCorrect)
    console.log('roundData:', roundData)
    console.log('answerTime:', answerTime)
    console.log('userKTDI:', userKTDI)
    console.log('Current psychologyScores before update:', JSON.parse(JSON.stringify(psychologyScores.value)))
    
    // 提取訊息資料 - 兼容舊格式和新格式
    let messageData, allMessages
    if (roundData && roundData.selectedMessage) {
      // 新格式：包含完整回合資料
      messageData = roundData.selectedMessage
      allMessages = roundData.allMessages || []
      console.log('使用新格式回合資料')
    } else {
      // 舊格式：只有單個訊息
      messageData = roundData
      allMessages = []
      console.log('使用舊格式訊息資料')
    }
    
    console.log('messageData:', messageData)
    console.log('allMessages length:', allMessages.length)
    console.log('===========================')
    
    const previousStage = currentStage.value
    
    // === 新邏輯：根據正確答案計算單題心理分數變化 ===
    let psychologyScoresToAdd = { authority: 0, timing: 0, style: 0, motivation: 0, tech: 0 }
    let techScoreToAdd = 0
    
    if (messageData && messageData.psychologyScores) {
      // 計算所選訊息的心理分數
      const baseScores = { 
        authority: messageData.psychologyScores.authority || 0,
        timing: messageData.psychologyScores.timing || 0, 
        style: messageData.psychologyScores.style || 0,
        motivation: messageData.psychologyScores.motivation || 0,
        tech: messageData.psychologyScores.tech || 0
      }
      
      const baseTechScore = messageData.techScore || 0
      
      if (isCorrect) {
        // 答對（選中詐騙訊息）：給予正向分數
        psychologyScoresToAdd = { ...baseScores }
        techScoreToAdd = baseTechScore
        console.log('✅ 答對，獲得正向分數:', psychologyScoresToAdd, 'techScore:', techScoreToAdd)
      } else {
        // 答錯（選中真實訊息）：給予負向分數
        Object.keys(baseScores).forEach(key => {
          psychologyScoresToAdd[key] = -baseScores[key]
        })
        techScoreToAdd = -baseTechScore
        console.log('❌ 答錯，獲得負向分數:', psychologyScoresToAdd, 'techScore:', techScoreToAdd)
      }
    } else {
      console.warn('⚠️ 訊息缺少心理分數數據:', messageData)
    }
    
    // 計算XP（使用技術分數）
    const xpGained = calculateXP(isCorrect, psychologyScoresToAdd, Math.abs(techScoreToAdd), answerTime)
    
    // 更新XP
    soulXP.value += xpGained
    
    // 更新連擊
    if (isCorrect) {
      answerStreak.value += 1
    } else {
      answerStreak.value = 0
    }

    // 更新科技等級（基於累積正確答案）
    const correctAnswers = gameHistory.value.filter(h => h.isCorrect).length
    techLevel.value = Math.floor(correctAnswers / 10) + 1

    // === 重要：記錄本回合的分數變化到遊戲會話中，但不立即累積到總分 ===
    const roundPsychologyGains = { ...psychologyScoresToAdd }
    const roundTechGain = techScoreToAdd
    
    // 調試遊戲會話狀態
    console.log('🎯 遊戲會話狀態檢查:', {
      isGameActive: gameSessionData.value?.isGameActive,
      gameSessionData: gameSessionData.value
    })
    
    // 添加到回合歷史中
    if (gameSessionData.value && gameSessionData.value.isGameActive) {
      gameSessionData.value.roundHistory.push({
        messageId: messageData?.id,
        isCorrect: isCorrect,
        psychologyGains: roundPsychologyGains,
        techGain: roundTechGain,
        timestamp: new Date().toISOString()
      })
      console.log('📝 已記錄回合分數變化:', {
        messageId: messageData?.id,
        isCorrect,
        psychologyGains: roundPsychologyGains,
        techGain: roundTechGain
      })
      console.log('📝 當前回合歷史長度:', gameSessionData.value.roundHistory.length)
    } else {
      console.log('⚠️ 遊戲會話未啟動，無法記錄回合歷史')
    }
    
    // === 注意：暫時不累積到總心理分數，等待遊戲結束時統一計算 ===
    console.log('📊 本題分數變化已記錄，等待遊戲結束時統一累積')
    
    // 保存會話數據
    saveToPersistence('gameSessionData', gameSessionData.value)

    // 更新或確定動物類型
    if (userKTDI) {
      console.log('Using provided userKTDI:', userKTDI)
      const newAnimalCode = calculateAnimalType(userKTDI)
      console.log('Calculated animal code from userKTDI:', newAnimalCode)
      if (newAnimalCode !== currentAnimalCode.value) {
        // 記錄動物轉換歷史
        const oldAnimalCode = currentAnimalCode.value
        const oldAnimal = ANIMAL_KTDI_MAPPING[oldAnimalCode]
        const newAnimal = ANIMAL_KTDI_MAPPING[newAnimalCode]
        
        if (oldAnimal && newAnimal) {
          const transformRecord = {
            date: new Date().toLocaleDateString('zh-TW'),
            time: new Date().toLocaleTimeString('zh-TW'),
            fromCode: oldAnimalCode,
            toCode: newAnimalCode,
            fromAnimal: oldAnimal.animal,
            toAnimal: newAnimal.animal,
            reason: '心理測驗結果影響',
            type: 'quiz_result'
          }
          
          transformHistory.value.unshift(transformRecord) // 新記錄放在前面
          console.log('🔄 記錄動物轉換:', transformRecord)
          
          // 保持最多20筆記錄
          if (transformHistory.value.length > 20) {
            transformHistory.value = transformHistory.value.slice(0, 20)
          }
          
          saveToPersistence('transformHistory', transformHistory.value)
        }
        
        currentAnimalCode.value = newAnimalCode
      }
    } else {
      // 如果沒有明確的KTDI評分，基於累積的心理分數自動計算
      const totalAnswers = gameHistory.value.length + 1
      console.log('Total answers:', totalAnswers, 'Psychology scores:', psychologyScores.value)
      if (totalAnswers >= 3) { // 至少答3題後才開始計算動物類型
        const avgScores = {
          authority: psychologyScores.value.authority / totalAnswers,
          timing: psychologyScores.value.timing / totalAnswers,
          style: psychologyScores.value.style / totalAnswers,
          motivation: psychologyScores.value.motivation / totalAnswers
        }
        console.log('Average scores for animal calculation:', avgScores)
        const newAnimalCode = calculateAnimalType(avgScores)
        console.log('Calculated animal code from averages:', newAnimalCode)
        if (newAnimalCode !== currentAnimalCode.value) {
          console.log('Updating currentAnimalCode from', currentAnimalCode.value, 'to', newAnimalCode)
          
          // 記錄動物轉換歷史
          const oldAnimalCode = currentAnimalCode.value
          const oldAnimal = ANIMAL_KTDI_MAPPING[oldAnimalCode]
          const newAnimal = ANIMAL_KTDI_MAPPING[newAnimalCode]
          
          if (oldAnimal && newAnimal) {
            const transformRecord = {
              date: new Date().toLocaleDateString('zh-TW'),
              time: new Date().toLocaleTimeString('zh-TW'),
              fromCode: oldAnimalCode,
              toCode: newAnimalCode,
              fromAnimal: oldAnimal.animal,
              toAnimal: newAnimal.animal,
              reason: '遊戲表現累積影響',
              type: 'game_progress'
            }
            
            transformHistory.value.unshift(transformRecord) // 新記錄放在前面
            console.log('🔄 記錄動物轉換:', transformRecord)
            
            // 保持最多20筆記錄
            if (transformHistory.value.length > 20) {
              transformHistory.value = transformHistory.value.slice(0, 20)
            }
            
            saveToPersistence('transformHistory', transformHistory.value)
          }
          
          currentAnimalCode.value = newAnimalCode
        }
      }
    }

    // 記錄歷史
    const gameRecord = {
      timestamp: Date.now(),
      messageId: messageData?.id || 'unknown',
      isCorrect,
      xpGained,
      totalXP: soulXP.value,
      stage: currentStage.value.name,
      animalCode: currentAnimalCode.value
    }
    gameHistory.value.push(gameRecord)

    // 持久化到混合存儲
    saveToPersistence('soulXP', soulXP.value)
    saveToPersistence('techLevel', techLevel.value)
    saveToPersistence('currentAnimalCode', currentAnimalCode.value)
    saveToPersistence('gameHistory', gameHistory.value)
    
    // 記錄到遊戲會話歷史
    if (gameSessionData.value.isGameActive) {
      gameSessionData.value.roundHistory.push({
        timestamp: Date.now(),
        messageId: messageData?.id || 'unknown',
        psychologyGains: roundPsychologyGains,
        techGain: roundTechGain,
        isCorrect
      })
      console.log('記錄回合歷史:', gameSessionData.value.roundHistory.length, '回合')
    }
    
    console.log('Saved to persistence:', {
      soulXP: soulXP.value,
      techLevel: techLevel.value,
      currentAnimalCode: currentAnimalCode.value,
      psychologyScores: psychologyScores.value
    })

    // 檢查是否發生階段進化
    const newStage = currentStage.value
    const hasEvolved = previousStage.name !== newStage.name

    return {
      xpGained,
      hasEvolved,
      previousStage,
      newStage,
      currentAnimal: currentAnimal.value,
      totalXP: soulXP.value,
      techLevel: techLevel.value,
      streak: answerStreak.value,
      // 新增本回合的分數增加資訊
      roundGains: {
        psychology: roundPsychologyGains,
        tech: roundTechGain
      }
    }
  }

  // 設置用戶登錄狀態
  const setUserLoginStatus = (isLoggedIn, username = null) => {
    persistenceManager.setLoginStatus(isLoggedIn, username)
    
    if (isLoggedIn) {
      // 檢查是否已經是同一個用戶，避免重複同步
      if (persistenceManager.currentUser !== username) {
        console.log(`用戶 ${username} 登錄，開始同步靈魂數據...`)
        // 登錄後立即同步數據
        syncDataToCloud()
      }
    }
  }

  // 手動同步到雲端
  const syncDataToCloud = async () => {
    const success = await persistenceManager.syncDataToCloud()
    if (success) {
      // 同步成功後重新載入數據
      await reloadDataFromPersistence()
    }
    return success
  }

  // 從持久化重新載入數據
  const reloadDataFromPersistence = async () => {
    soulXP.value = loadFromPersistence('soulXP', 0)
    
    // 修復損壞的 XP 值（如果為 null 或 NaN）
    if (soulXP.value === null || isNaN(soulXP.value)) {
      // 根據遊戲歷史估算合理的經驗值
      const gameHistoryData = loadFromPersistence('gameHistory', [])
      if (gameHistoryData.length > 0) {
        // 每場遊戲平均 50-100 XP，根據遊戲次數估算
        soulXP.value = Math.min(gameHistoryData.length * 80, 2000)
        console.log(`🔧 修復損壞的 XP 值，根據 ${gameHistoryData.length} 場遊戲估算為: ${soulXP.value}`)
        // 立即保存修復後的值
        saveToPersistence('soulXP', soulXP.value)
      } else {
        soulXP.value = 0
      }
    }
    
    techLevel.value = loadFromPersistence('techLevel', 1)
    currentAnimalCode.value = loadFromPersistence('currentAnimalCode', 'TIGL') // 使用默認值
    gameHistory.value = loadFromPersistence('gameHistory', [])
    
    // 重新載入遊戲會話數據
    const loadedGameSessionData = loadFromPersistence('gameSessionData', {
      isGameActive: false,
      startPsychologyScores: null,
      startTechLevel: 1,
      sessionGains: {
        psychology: { authority: 0, timing: 0, style: 0, motivation: 0 },
        tech: 0
      },
      roundHistory: [] 
    })
    console.log('🔄 重新載入 gameSessionData from persistence:', JSON.parse(JSON.stringify(loadedGameSessionData)))
    gameSessionData.value = loadedGameSessionData
    console.log('🔄 設置後的 gameSessionData.value:', JSON.parse(JSON.stringify(gameSessionData.value)))
    
    // 重新載入心理學分數
    const loadedPsychScores = loadPsychologyScores();
    psychologyScores.value = loadedPsychScores
    
    // 只在調試模式下記錄詳細信息
    if (import.meta.env.DEV) {
      console.log('靈魂數據已重新載入', {
        soulXP: soulXP.value,
        techLevel: techLevel.value,
        currentAnimalCode: currentAnimalCode.value,
        psychologyScores: psychologyScores.value,
        gameHistoryLength: gameHistory.value.length,
        gameSessionData: gameSessionData.value
      })
    }
  }

  // 獲取同步狀態信息
  const getSyncInfo = () => {
    return {
      status: syncStatus.value,
      lastSyncTime: lastSyncTime.value,
      isLoggedIn: persistenceManager.isLoggedIn,
      currentUser: persistenceManager.currentUser
    }
  }

  // 重置所有數據
  const resetSoulData = () => {
    soulXP.value = 0
    techLevel.value = 1
    currentAnimalCode.value = null
    gameHistory.value = []
    answerStreak.value = 0
    
    // 重置心理分數到初始值
    psychologyScores.value = {
      authority: 0,
      timing: 0,
      style: 0,
      motivation: 0,
      tech: 0
    }
    
    // 清除本地存儲
    ['soulXP', 'techLevel', 'currentAnimalCode', 'gameHistory', 'psychologyScores'].forEach(key => {
      localStorage.removeItem(`soul_${key}`)
    })
    
    // 如果已登錄，同步清除的數據到雲端
    if (persistenceManager.isLoggedIn) {
      syncDataToCloud()
    }
  }

  // 新增：開始遊戲會話
  const startGameSession = () => {
    console.log('開始新的遊戲會話')
    gameSessionData.value = {
      isGameActive: true,
      startPsychologyScores: { ...psychologyScores.value },
      startTechLevel: techLevel.value,
      sessionGains: {
        psychology: { authority: 0, timing: 0, style: 0, motivation: 0 },
        tech: 0
      },
      roundHistory: [] // 重置回合歷史
    }
    // 立即保存到持久化存儲，確保狀態不會被重置
    saveToPersistence('gameSessionData', gameSessionData.value)
    console.log('遊戲會話初始狀態:', gameSessionData.value)
  }

  // 新增：結束遊戲會話
  const endGameSession = () => {
    console.log('🔍 endGameSession 被調用，詳細檢查...')
    
    if (!gameSessionData.value.isGameActive) return null
    
    console.log('結束遊戲會話，計算總獲得分數')
    
    // *** 關鍵修復：直接從 localStorage 讀取實際的回合歷史 ***
    let actualRoundHistory = [];
    try {
      const storageData = localStorage.getItem('soul_gameSessionData');
      if (storageData) {
        const parsedData = JSON.parse(storageData);
        actualRoundHistory = parsedData.value?.roundHistory || [];
        console.log('📝 從 localStorage 讀取到回合歷史:', actualRoundHistory.length, '筆記錄');
      }
    } catch (error) {
      console.error('讀取 localStorage 回合歷史失敗:', error);
    }
    
    console.log('開始時心理分數:', gameSessionData.value.startPsychologyScores)
    console.log('當前心理分數:', psychologyScores.value)
    console.log('實際回合歷史:', actualRoundHistory)
    
    // === 新邏輯：遊戲結束時統一累積心理分數變化 ===
    const sessionGains = {
      psychology: { authority: 0, timing: 0, style: 0, motivation: 0 },
      tech: 0
    }
    
    console.log('🎮 開始計算遊戲回合總分...')
    console.log('📝 實際回合歷史記錄:', actualRoundHistory)
    
    // 從回合歷史累積計算總分數變化
    if (actualRoundHistory && actualRoundHistory.length > 0) {
      actualRoundHistory.forEach((round, index) => {
        console.log(`📊 處理第 ${index + 1} 題:`, round)
        
        if (round.psychologyGains) {
          Object.keys(round.psychologyGains).forEach(key => {
            const gain = round.psychologyGains[key] || 0
            sessionGains.psychology[key] += gain
            console.log(`  ${key}: +${gain} (累積: ${sessionGains.psychology[key]})`)
          })
        }
        
        if (round.techGain) {
          sessionGains.tech += round.techGain || 0
          console.log(`  tech: +${round.techGain} (累積: ${sessionGains.tech})`)
        }
      })
      
      console.log('🎯 遊戲回合總分計算完成:', sessionGains)
      
      // === 重要：現在才真正累積到總心理分數 ===
      console.log('💫 開始累積心理分數到總計...')
      console.log('📊 累積前的心理分數:', JSON.parse(JSON.stringify(psychologyScores.value)))
      
      Object.keys(sessionGains.psychology).forEach(key => {
        if (psychologyScores.value[key] !== undefined) {
          const oldValue = psychologyScores.value[key]
          const addValue = sessionGains.psychology[key]
          psychologyScores.value[key] += addValue
          console.log(`✨ ${key}: ${oldValue} + ${addValue} = ${psychologyScores.value[key]}`)
        }
      })
      
      console.log('📊 累積後的心理分數:', JSON.parse(JSON.stringify(psychologyScores.value)))
      
      // 保存更新後的心理分數
      saveToPersistence('psychologyScores', psychologyScores.value)
      console.log('💾 心理分數已保存')
      
    } else {
      console.warn('⚠️ 沒有找到回合歷史記錄')
    }
    
    console.log('🏁 最終 sessionGains:', sessionGains)
    
    // 延遲重置會話狀態，確保所有processAnswer調用完成
    setTimeout(() => {
      gameSessionData.value.isGameActive = false
      console.log('🔚 遊戲會話已結束')
    }, 100)
    
    return sessionGains
  }

  // 新增：從心理測驗結果設置動物類型
  const setAnimalFromQuiz = (animalCode, quizScores = null) => {
    console.log('從心理測驗設置動物類型:', animalCode, quizScores)
    
    if (animalCode && ANIMAL_KTDI_MAPPING[animalCode]) {
      const oldAnimalCode = currentAnimalCode.value
      
      // 如果動物有變化，記錄轉換歷史
      if (oldAnimalCode && oldAnimalCode !== animalCode) {
        const oldAnimal = ANIMAL_KTDI_MAPPING[oldAnimalCode]
        const newAnimal = ANIMAL_KTDI_MAPPING[animalCode]
        
        if (oldAnimal && newAnimal) {
          const transformRecord = {
            date: new Date().toLocaleDateString('zh-TW'),
            time: new Date().toLocaleTimeString('zh-TW'),
            fromCode: oldAnimalCode,
            toCode: animalCode,
            fromAnimal: oldAnimal.animal,
            toAnimal: newAnimal.animal,
            reason: '心理分析結果變化',
            type: 'analysis_result'
          }
          
          transformHistory.value.unshift(transformRecord) // 新記錄放在前面
          console.log('🔄 記錄動物轉換:', transformRecord)
          
          // 保持最多20筆記錄
          if (transformHistory.value.length > 20) {
            transformHistory.value = transformHistory.value.slice(0, 20)
          }
          
          saveToPersistence('transformHistory', transformHistory.value)
        }
      }
      
      currentAnimalCode.value = animalCode
      saveToPersistence('currentAnimalCode', animalCode)
      
      // === 重要修正：只在第一次設置時使用Quiz分數，避免覆蓋遊戲累積分數 ===
      if (quizScores) {
        // 檢查是否已有遊戲累積的分數
        const hasGameAccumulatedScores = Object.values(psychologyScores.value).some(score => score !== 0)
        
        if (!hasGameAccumulatedScores) {
          // 只有在沒有遊戲累積分數時才使用Quiz分數作為基準
          console.log('📝 使用Quiz測驗分數作為初始基準:', quizScores)
          Object.keys(quizScores).forEach(key => {
            if (psychologyScores.value[key] !== undefined) {
              psychologyScores.value[key] = quizScores[key]
            }
          })
          saveToPersistence('psychologyScores', psychologyScores.value)
        } else {
          console.log('⚠️ 已有遊戲累積分數，跳過Quiz分數設置以保護遊戲進度')
          console.log('現有分數:', psychologyScores.value)
        }
      }
      
      console.log('動物類型已設置為:', animalCode, '對應動物:', ANIMAL_KTDI_MAPPING[animalCode])
      return true
    } else {
      console.warn('無效的動物代碼:', animalCode)
      return false
    }
  }

  // 新增：獲取當前會話狀態
  const getGameSessionData = () => {
    return gameSessionData.value
  }

  // 新增：獲取最後一回合的分數增加
  const getLastRoundGains = () => {
    if (!gameSessionData.value.isGameActive || gameSessionData.value.roundHistory.length === 0) {
      return { psychology: { authority: 0, timing: 0, style: 0, motivation: 0 }, tech: 0 }
    }
    
    const lastRound = gameSessionData.value.roundHistory[gameSessionData.value.roundHistory.length - 1]
    return {
      psychology: lastRound.psychologyGains,
      tech: lastRound.techGain
    }
  }

  // 新增：靈魂動物轉換管理方法
  const getUserSoulAnimal = (username) => {
    const userKey = `soulAnimal_${username}`;
    return loadFromPersistence(userKey, null);
  };

  const updateUserSoulAnimal = (username, animalName) => {
    const userKey = `soulAnimal_${username}`;
    saveToPersistence(userKey, animalName);
    console.log(`✅ 用戶 ${username} 的靈魂動物已更新為: ${animalName}`);
  };

  const addTransformHistory = (username, transformRecord) => {
    const historyKey = `transformHistory_${username}`;
    const currentHistory = loadFromPersistence(historyKey, []);
    currentHistory.push({
      ...transformRecord,
      timestamp: Date.now()
    });
    saveToPersistence(historyKey, currentHistory);
    
    // 同時更新全局轉換歷史
    transformHistory.value.push(transformRecord);
    saveToPersistence('transformHistory', transformHistory.value);
  };

  const getUserTransformHistory = (username) => {
    const historyKey = `transformHistory_${username}`;
    return loadFromPersistence(historyKey, []);
  };

  // Quiz 完成獎勵 XP
  const awardQuizCompletionXP = () => {
    const quizXP = XP_RULES.QUIZ_COMPLETION
    soulXP.value += quizXP
    console.log(`🎉 Quiz 完成獎勵：+${quizXP} XP，當前總 XP：${soulXP.value}`)
    
    // 保存到持久化存儲
    saveToPersistence('soulXP', soulXP.value)
    
    return {
      xpGained: quizXP,
      totalXP: soulXP.value
    }
  }

  // 診斷和修復心理分數問題
  const diagnosePsychologyScores = () => {
    console.log('🔍 開始診斷心理分數問題...')
    
    const currentScores = psychologyScores.value
    const sessionData = gameSessionData.value
    
    console.log('當前心理分數:', currentScores)
    console.log('遊戲會話數據:', sessionData)
    
    // 檢查是否有進行中的遊戲會話
    if (sessionData && sessionData.isGameActive) {
      console.log('開始時心理分數:', sessionData.startPsychologyScores)
      
      // 計算從開始到現在的變化
      const actualChanges = {}
      Object.keys(currentScores).forEach(key => {
        actualChanges[key] = currentScores[key] - (sessionData.startPsychologyScores[key] || 0)
      })
      
      console.log('實際變化量:', actualChanges)
      
      // 檢查回合歷史
      if (sessionData.roundHistory && sessionData.roundHistory.length > 0) {
        const totalChangesFromHistory = sessionData.roundHistory.reduce((totals, round) => {
          if (round.gains && round.gains.psychology) {
            Object.keys(round.gains.psychology).forEach(key => {
              totals[key] = (totals[key] || 0) + (round.gains.psychology[key] || 0)
            })
          }
          return totals
        }, {})
        
        console.log('從回合歷史計算的總變化:', totalChangesFromHistory)
        
        // 檢查是否一致
        let isConsistent = true
        Object.keys(actualChanges).forEach(key => {
          if (Math.abs(actualChanges[key] - (totalChangesFromHistory[key] || 0)) > 0.1) {
            isConsistent = false
            console.log(`❌ 不一致: ${key} - 實際變化: ${actualChanges[key]}, 歷史總和: ${totalChangesFromHistory[key] || 0}`)
          }
        })
        
        if (isConsistent) {
          console.log('✅ 心理分數計算一致')
        } else {
          console.log('❌ 發現心理分數計算不一致')
        }
      }
    } else {
      console.log('ℹ️ 沒有進行中的遊戲會話')
    }
    
    return {
      currentScores,
      sessionData,
      hasActiveSession: sessionData && sessionData.isGameActive
    }
  }

  // 修復心理分數 - 重新計算基於實際遊戲歷史
  const fixPsychologyScores = () => {
    console.log('🔧 開始修復心理分數...')
    
    // 重置心理分數到 0
    psychologyScores.value = {
      authority: 0,
      timing: 0,
      style: 0,
      motivation: 0,
      tech: 0
    }
    
    // 如果有進行中的遊戲會話，也重置開始分數
    if (gameSessionData.value && gameSessionData.value.isGameActive) {
      gameSessionData.value.startPsychologyScores = { ...psychologyScores.value }
      saveToPersistence('gameSessionData', gameSessionData.value)
    }
    
    // 保存到持久化存儲
    saveToPersistence('psychologyScores', psychologyScores.value)
    
    console.log('✅ 心理分數已重置為:', psychologyScores.value)
    
    return psychologyScores.value
  }

  return {
    // 狀態
    soulXP,
    techLevel,
    currentAnimalCode,
    gameHistory,
    answerStreak,
    psychologyScores,
    transformHistory, // 新增：轉換歷史
    
    // 計算屬性
    currentStage,
    currentAnimal,
    progressToNextStage,
    
    // 同步狀態
    syncStatus,
    lastSyncTime,
    
    // 方法
    processAnswer,
    calculateAnimalType,
    setAnimalFromQuiz,
    setUserLoginStatus,
    syncDataToCloud,
    reloadDataFromPersistence,
    getSyncInfo,
    resetSoulData,
    getCurrentUser: () => persistenceManager.currentUser,
    
    // Quiz 完成獎勵
    awardQuizCompletionXP,
    
    // 遊戲會話管理
    startGameSession,
    endGameSession,
    getGameSessionData,
    getLastRoundGains,
    
    // 靈魂動物轉換管理
    getUserSoulAnimal,
    updateUserSoulAnimal,
    addTransformHistory,
    getUserTransformHistory,
    
    // 診斷和修復功能
    diagnosePsychologyScores,
    fixPsychologyScores,
    
    // 清理用戶數據功能
    clearUserData: (username) => {
      if (!username) {
        console.error('請提供要清理的用戶名')
        return false
      }
      
      try {
        // 清理 localStorage 中所有相關數據
        const keysToClean = [
          'soulXP', 'techLevel', 'currentAnimalCode', 'gameHistory', 
          'psychologyScores', 'transformHistory', 'gameSessionData'
        ]
        
        keysToClean.forEach(key => {
          localStorage.removeItem(`soul_${key}`)
        })
        
        // 清理 soulAnimalStore 的記錄
        const storageKeys = ['soul_animal_records', 'game_records', 'game_scores']
        storageKeys.forEach(storageKey => {
          const allRecords = JSON.parse(localStorage.getItem(storageKey) || '{}')
          if (allRecords[username]) {
            delete allRecords[username]
            localStorage.setItem(storageKey, JSON.stringify(allRecords))
          }
        })
        
        console.log(`✅ 已清理用戶 ${username} 的所有數據`)
        return true
      } catch (error) {
        console.error('清理用戶數據失敗:', error)
        return false
      }
    }
  }
}

// 動物組別顏色配置
export const GROUP_COLORS = {
  '深潛分析局': {
    primary: '#1e40af',   // 深藍
    secondary: '#3b82f6', // 藍色
    accent: '#60a5fa'     // 淺藍
  },
  '影襲特攻隊': {
    primary: '#7c2d12',   // 深橙
    secondary: '#ea580c', // 橙色
    accent: '#fb923c'     // 淺橙
  },
  '重裝守備隊': {
    primary: '#166534',   // 深綠
    secondary: '#16a34a', // 綠色
    accent: '#4ade80'     // 淺綠
  },
  '閃電先鋒': {
    primary: '#7c2d92',   // 深紫
    secondary: '#a855f7', // 紫色
    accent: '#c084fc'     // 淺紫
  }
}