// 五維度靈魂分數系統 - 基於KTDI心理學框架
import { ref, computed } from 'vue'

// 五維度定義：基於KTDI四軸 + 科技適應性
export const SOUL_DIMENSIONS = {
  authority: { 
    name: '權威偏好', 
    ktdiAxis: 'KT', // K(懷疑) vs T(信任)
    description: '對權威機構的信任程度',
    lowEnd: '質疑權威 (K)', 
    highEnd: '信任權威 (T)' 
  },
  timing: { 
    name: '時間習慣', 
    ktdiAxis: 'DI', // D(審慎) vs I(即時)
    description: '決策時間偏好',
    lowEnd: '審慎思考 (D)', 
    highEnd: '快速決策 (I)' 
  },
  style: { 
    name: '驗證風格', 
    ktdiAxis: 'SG', // S(細節) vs G(直覺)
    description: '信息驗證方式',
    lowEnd: '直覺判斷 (G)', 
    highEnd: '細節驗證 (S)' 
  },
  motivation: { 
    name: '動機傾向', 
    ktdiAxis: 'LR', // L(損失規避) vs R(獎勵追求)
    description: '行為驅動力類型',
    lowEnd: '獎勵驅動 (R)', 
    highEnd: '風險規避 (L)' 
  },
  tech: { 
    name: '科技適應', 
    ktdiAxis: 'TECH', // 獨立維度
    description: '對新科技的接受度',
    lowEnd: '傳統偏好', 
    highEnd: '科技先鋒' 
  }
}

// 16種動物的五維度基準值（50為中性，向兩極分化）
export const ANIMAL_DIMENSION_PROFILES = {
  // 【深潛分析局】(K-D - 懷疑且審慎) - 權威低，時間低
  '狐狸': { authority: 20, timing: 20, style: 70, motivation: 80, tech: 60 }, // KDSL
  '老鷹': { authority: 20, timing: 20, style: 70, motivation: 30, tech: 70 }, // KDSR  
  '貓頭鷹': { authority: 20, timing: 20, style: 40, motivation: 80, tech: 90 }, // KDGL
  '鯊魚': { authority: 20, timing: 20, style: 40, motivation: 30, tech: 95 }, // KDGR
  
  // 【影襲特攻隊】(K-I - 懷疑但即時) - 權威低，時間高
  '松鼠': { authority: 20, timing: 80, style: 70, motivation: 80, tech: 50 }, // KISL
  '章魚': { authority: 20, timing: 80, style: 70, motivation: 30, tech: 80 }, // KISR
  '貓咪': { authority: 20, timing: 80, style: 40, motivation: 80, tech: 70 }, // KIGL
  '狼': { authority: 20, timing: 80, style: 40, motivation: 30, tech: 90 }, // KIGR
  
  // 【重裝守備隊】(T-D - 信任且審慎) - 權威高，時間低
  '烏龜': { authority: 80, timing: 20, style: 70, motivation: 80, tech: 30 }, // TDSL
  '大象': { authority: 80, timing: 20, style: 70, motivation: 30, tech: 40 }, // TDSR
  '河馬': { authority: 80, timing: 20, style: 40, motivation: 80, tech: 30 }, // TDGL
  '金剛': { authority: 80, timing: 20, style: 40, motivation: 30, tech: 50 }, // TDGR
  
  // 【閃電先鋒】(T-I - 信任且即時) - 權威高，時間高  
  '老鼠': { authority: 80, timing: 80, style: 70, motivation: 80, tech: 40 }, // TISL
  '水獺': { authority: 80, timing: 80, style: 70, motivation: 30, tech: 60 }, // TISR
  '麋鹿': { authority: 80, timing: 80, style: 40, motivation: 80, tech: 50 }, // TIGL
  '柴犬': { authority: 80, timing: 80, style: 40, motivation: 30, tech: 70 }  // TIGR
}

// 動物代碼映射
export const ANIMAL_CODE_MAP = {
  'KDSL': '狐狸', 'KDSR': '老鷹', 'KDGL': '貓頭鷹', 'KDGR': '鯊魚',
  'KISL': '松鼠', 'KISR': '章魚', 'KIGL': '貓咪', 'KIGR': '狼',
  'TDSL': '烏龜', 'TDSR': '大象', 'TDGL': '河馬', 'TDGR': '金剛',
  'TISL': '老鼠', 'TISR': '水獺', 'TIGL': '麋鹿', 'TIGR': '柴犬'
}

// 遊戲選擇對五維度的影響映射
export const CHOICE_DIMENSION_IMPACT = {
  // 權威相關選擇
  'trust_authority': { authority: +2 }, // 選擇信任權威機構
  'doubt_authority': { authority: -2 }, // 選擇質疑權威機構
  'verify_official': { authority: +1, style: +1 }, // 透過官方管道驗證
  
  // 時間相關選擇  
  'quick_decision': { timing: +2 }, // 快速決策
  'careful_analysis': { timing: -2 }, // 仔細分析
  'urgent_response': { timing: +1 }, // 緊急回應
  
  // 驗證風格相關
  'detail_check': { style: +2 }, // 檢查細節
  'intuition_based': { style: -2 }, // 憑直覺判斷
  'cross_reference': { style: +1 }, // 交叉驗證
  
  // 動機相關
  'avoid_loss': { motivation: +2 }, // 避免損失
  'seek_reward': { motivation: -2 }, // 追求獎勵
  'risk_averse': { motivation: +1 }, // 風險規避
  
  // 科技相關
  'use_tech_tool': { tech: +1 }, // 使用科技工具
  'traditional_method': { tech: -1 }, // 使用傳統方法
  'digital_verification': { tech: +2 }, // 數位驗證
}

// 分數邊界控制
const MIN_SCORE = 0
const MAX_SCORE = 100
const DRIFT_FACTOR = 0.95 // 自然衰減因子，防止極端值持續

// 創建五維度管理系統
export function useSoulDimensionSystem(username = 'guest') {
  // 持久化存儲
  const getStorageKey = (key) => `soulDimensions_${username}_${key}`
  
  const loadDimension = (dimension) => {
    const stored = localStorage.getItem(getStorageKey(dimension))
    return stored ? parseFloat(stored) : 50 // 默認50（中性值）
  }
  
  const saveDimension = (dimension, value) => {
    localStorage.setItem(getStorageKey(dimension), value.toString())
  }
  
  // 五維度分數狀態
  const authority = ref(loadDimension('authority'))
  const timing = ref(loadDimension('timing'))
  const style = ref(loadDimension('style'))
  const motivation = ref(loadDimension('motivation'))
  const tech = ref(loadDimension('tech'))
  
  // 邊界控制函數
  const clampScore = (score) => Math.max(MIN_SCORE, Math.min(MAX_SCORE, score))
  
  // 自然衰減（向50靠攏，模擬心理平衡）
  const applyDrift = (currentScore) => {
    const drift = (50 - currentScore) * (1 - DRIFT_FACTOR)
    return currentScore + drift
  }
  
  // 處理單次遊戲選擇影響
  const processGameChoice = (choiceType, intensity = 1.0) => {
    const impact = CHOICE_DIMENSION_IMPACT[choiceType]
    if (!impact) return
    
    // 應用選擇影響
    if (impact.authority) {
      authority.value = clampScore(authority.value + impact.authority * intensity)
      saveDimension('authority', authority.value)
    }
    if (impact.timing) {
      timing.value = clampScore(timing.value + impact.timing * intensity)
      saveDimension('timing', timing.value)
    }
    if (impact.style) {
      style.value = clampScore(style.value + impact.style * intensity)
      saveDimension('style', style.value)
    }
    if (impact.motivation) {
      motivation.value = clampScore(motivation.value + impact.motivation * intensity)
      saveDimension('motivation', motivation.value)
    }
    if (impact.tech) {
      tech.value = clampScore(tech.value + impact.tech * intensity)
      saveDimension('tech', tech.value)
    }
  }
  
  // 批量處理遊戲結果
  const processGameResult = (choices, isCorrect, responseTime) => {
    // 基礎影響強度
    let intensity = isCorrect ? 1.0 : 0.5
    
    // 響應時間影響（快速回應影響timing維度）
    if (responseTime < 3000) { // 3秒內快速回應
      processGameChoice('quick_decision', intensity * 0.5)
    } else if (responseTime > 10000) { // 10秒以上仔細思考
      processGameChoice('careful_analysis', intensity * 0.5)
    }
    
    // 處理具體選擇
    choices.forEach(choice => {
      processGameChoice(choice, intensity)
    })
    
    // 應用自然衰減
    authority.value = clampScore(applyDrift(authority.value))
    timing.value = clampScore(applyDrift(timing.value))
    style.value = clampScore(applyDrift(style.value))
    motivation.value = clampScore(applyDrift(motivation.value))
    tech.value = clampScore(applyDrift(tech.value))
    
    // 持久化
    saveDimension('authority', authority.value)
    saveDimension('timing', timing.value)
    saveDimension('style', style.value)
    saveDimension('motivation', motivation.value)
    saveDimension('tech', tech.value)
  }
  
  // 根據心理測驗結果初始化（Quiz.vue結果）
  const initializeFromAnimal = (animalCode) => {
    const animalName = ANIMAL_CODE_MAP[animalCode]
    const profile = ANIMAL_DIMENSION_PROFILES[animalName]
    
    if (profile) {
      // 在基準值附近隨機波動 ±10
      authority.value = clampScore(profile.authority + (Math.random() - 0.5) * 20)
      timing.value = clampScore(profile.timing + (Math.random() - 0.5) * 20)
      style.value = clampScore(profile.style + (Math.random() - 0.5) * 20)
      motivation.value = clampScore(profile.motivation + (Math.random() - 0.5) * 20)
      tech.value = clampScore(profile.tech + (Math.random() - 0.5) * 20)
      
      // 持久化
      saveDimension('authority', authority.value)
      saveDimension('timing', timing.value)
      saveDimension('style', style.value)
      saveDimension('motivation', motivation.value)
      saveDimension('tech', tech.value)
      
      console.log('五維度初始化完成:', { animalCode, animalName, 
        authority: authority.value, timing: timing.value, style: style.value, 
        motivation: motivation.value, tech: tech.value })
    }
  }
  
  // 預測動物轉換
  const predictAnimalTransformation = () => {
    const currentScores = {
      authority: authority.value,
      timing: timing.value,
      style: style.value,
      motivation: motivation.value,
      tech: tech.value
    }
    
    // 計算與各動物的相似度
    const similarities = Object.entries(ANIMAL_DIMENSION_PROFILES).map(([animal, profile]) => {
      const distance = Math.sqrt(
        Math.pow(currentScores.authority - profile.authority, 2) +
        Math.pow(currentScores.timing - profile.timing, 2) +
        Math.pow(currentScores.style - profile.style, 2) +
        Math.pow(currentScores.motivation - profile.motivation, 2) +
        Math.pow(currentScores.tech - profile.tech, 2)
      )
      
      const similarity = Math.max(0, 100 - (distance / 5)) // 標準化到0-100
      
      return { animal, similarity: Math.round(similarity * 100) / 100 }
    })
    
    return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 5)
  }
  
  // 計算屬性：當前狀態
  const currentState = computed(() => ({
    authority: Math.round(authority.value),
    timing: Math.round(timing.value),
    style: Math.round(style.value),
    motivation: Math.round(motivation.value),
    tech: Math.round(tech.value)
  }))
  
  // 計算屬性：KTDI傾向
  const ktdiTendency = computed(() => ({
    K_vs_T: authority.value < 50 ? 'K(懷疑)' : 'T(信任)',
    D_vs_I: timing.value < 50 ? 'D(審慎)' : 'I(即時)',
    S_vs_G: style.value > 50 ? 'S(細節)' : 'G(直覺)',
    L_vs_R: motivation.value > 50 ? 'L(規避)' : 'R(追求)'
  }))
  
  return {
    // 狀態
    authority,
    timing, 
    style,
    motivation,
    tech,
    
    // 計算屬性
    currentState,
    ktdiTendency,
    
    // 方法
    processGameChoice,
    processGameResult,
    initializeFromAnimal,
    predictAnimalTransformation
  }
}