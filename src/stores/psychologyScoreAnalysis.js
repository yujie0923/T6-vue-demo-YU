// 詐騙訊息心理分數系統分析與修正
// 基於KTDI心理學框架的科學化評分標準

/**
 * 🧠 KTDI四軸心理評分系統 (修正版)
 * 
 * 核心原則：正確回答詐騙訊息應該加強「防詐心理特質」
 * - 正確識別詐騙 → 增強懷疑、審慎、細節、風險規避特質
 * - 錯誤判斷詐騙 → 減弱防詐特質，增加易受騙特質
 */

export const PSYCHOLOGY_SCORE_STANDARDS = {
  // 權威偏好 (Authority) - K/T軸
  authority: {
    description: "對權威機構的信任程度",
    scale: {
      "-2": "強烈質疑權威 (K++)",
      "-1": "輕微質疑權威 (K+)", 
      "0": "中性態度",
      "+1": "輕微信任權威 (T+)",
      "+2": "強烈信任權威 (T++)"
    },
    // 訓練目標：識別詐騙應該增強質疑能力
    trainingGoal: "正確識別假冒權威 → 增強質疑特質 (往K方向)"
  },

  // 時間習慣 (Timing) - D/I軸  
  timing: {
    description: "決策時間偏好",
    scale: {
      "-2": "需要緊急回應 (I++)",
      "-1": "傾向快速決策 (I+)",
      "0": "中性時間壓力", 
      "+1": "建議仔細考慮 (D+)",
      "+2": "需要深度分析 (D++)"
    },
    // 訓練目標：識別緊急詐騙應該增強審慎特質
    trainingGoal: "正確識別時間壓力詐騙 → 增強審慎特質 (往D方向)"
  },

  // 驗證風格 (Style) - S/G軸
  style: {
    description: "信息驗證方式偏好",
    scale: {
      "-2": "完全憑直覺 (G++)",
      "-1": "傾向直覺判斷 (G+)",
      "0": "平衡驗證方式",
      "+1": "建議查證細節 (S+)", 
      "+2": "需要詳細驗證 (S++)"
    },
    // 訓練目標：識別偽造訊息應該增強細節驗證
    trainingGoal: "正確識別偽造內容 → 增強細節驗證 (往S方向)"
  },

  // 動機傾向 (Motivation) - L/R軸
  motivation: {
    description: "行為驅動力類型",
    scale: {
      "-2": "強烈獎勵驅動 (R++)", 
      "-1": "輕微獎勵驅動 (R+)",
      "0": "平衡動機",
      "+1": "輕微風險規避 (L+)",
      "+2": "強烈風險規避 (L++)"
    },
    // 訓練目標：識別誘餌詐騙應該增強風險規避
    trainingGoal: "正確識別獎勵誘餌 → 增強風險規避 (往L方向)"
  },

  // 科技適應 (Tech) - 獨立軸
  tech: {
    description: "對科技工具的依賴程度",
    scale: {
      "-2": "完全傳統方式",
      "-1": "傾向傳統方式", 
      "0": "平衡使用",
      "+1": "傾向科技工具",
      "+2": "高度依賴科技"
    },
    // 訓練目標：識別科技詐騙應該提升科技素養
    trainingGoal: "正確識別科技詐騙 → 適度提升科技素養"
  }
}

/**
 * 🎯 詐騙訊息重新評分原則
 * 
 * 當用戶「正確識別」該訊息為詐騙時，應該獲得的心理特質變化：
 */
export const CORRECT_IDENTIFICATION_REWARDS = {
  // 假冒權威機構詐騙
  fake_authority: {
    authority: -1,  // 增強質疑權威能力
    timing: +1,     // 增強審慎思考
    style: +1,      // 增強細節驗證
    motivation: +1, // 增強風險規避
    tech: 0         // 中性
  },

  // 時間壓力詐騙
  time_pressure: {
    authority: 0,
    timing: +2,     // 強烈增強抗壓能力
    style: +1,      // 增強冷靜分析
    motivation: +1, // 增強風險規避
    tech: 0
  },

  // 偽造連結/網站詐騙  
  fake_tech: {
    authority: -1,  // 質疑來源
    timing: +1,     // 審慎點擊
    style: +2,      // 強烈增強URL檢查
    motivation: +1, // 風險規避
    tech: +1        // 提升科技識別
  },

  // 獎勵誘餌詐騙
  reward_bait: {
    authority: -1,  // 質疑來源
    timing: +1,     // 冷靜思考
    style: +1,      // 驗證真實性
    motivation: +2, // 強烈增強風險規避
    tech: 0
  },

  // 情感操控詐騙
  emotional_manipulation: {
    authority: -1,  // 質疑權威
    timing: +2,     // 強烈增強冷靜
    style: +1,      // 理性分析
    motivation: +1, // 風險規避
    tech: 0
  }
}

/**
 * 🔄 分數計算邏輯
 * 
 * 用戶答題後的分數變化：
 * - 正確識別詐騙 = 獲得對應的防詐特質獎勵
 * - 錯誤判斷詐騙 = 獲得相反的特質變化（更容易被騙）
 */
export function calculateScoreChange(messageData, userAnswer, isCorrect) {
  const baseReward = getMessageTypeReward(messageData)
  
  if (isCorrect) {
    // 正確識別 → 獲得防詐特質
    return baseReward
  } else {
    // 錯誤判斷 → 獲得易受騙特質 (相反獎勵)
    return {
      authority: -baseReward.authority,
      timing: -baseReward.timing, 
      style: -baseReward.style,
      motivation: -baseReward.motivation,
      tech: -baseReward.tech
    }
  }
}

function getMessageTypeReward(messageData) {
  // 根據訊息內容特徵決定獎勵類型
  const content = messageData.content.toLowerCase()
  const explanation = messageData.explanation.toLowerCase()
  
  // 假冒權威
  if (content.includes('銀行') || content.includes('政府') || content.includes('機構')) {
    return CORRECT_IDENTIFICATION_REWARDS.fake_authority
  }
  
  // 時間壓力
  if (content.includes('立即') || content.includes('限時') || content.includes('緊急')) {
    return CORRECT_IDENTIFICATION_REWARDS.time_pressure
  }
  
  // 偽造連結
  if (content.includes('http') || content.includes('點擊') || content.includes('連結')) {
    return CORRECT_IDENTIFICATION_REWARDS.fake_tech
  }
  
  // 獎勵誘餌
  if (content.includes('中獎') || content.includes('獎金') || content.includes('免費')) {
    return CORRECT_IDENTIFICATION_REWARDS.reward_bait
  }
  
  // 預設為情感操控
  return CORRECT_IDENTIFICATION_REWARDS.emotional_manipulation
}

/**
 * 📊 現有database.js問題分析
 */
export const DATABASE_ISSUES = {
  issue1: {
    problem: "分數語義不清",
    example: "authority: 2 應該表示什麼？",
    solution: "使用-2到+2的有向量表，明確極性"
  },
  
  issue2: {
    problem: "邏輯相反",
    example: "識別假冒銀行詐騙應該增強質疑，而非信任",
    solution: "正確識別詐騙 → 獲得防詐特質獎勵"
  },
  
  issue3: {
    problem: "範圍過窄", 
    example: "只有0,1,2無法表達細膩變化",
    solution: "使用-2到+2五級評分"
  },
  
  issue4: {
    problem: "缺少回饋機制",
    example: "答對答錯都沒有差異化獎勵",
    solution: "答對獲得正獎勵，答錯獲得負獎勵"
  }
}