/**
 * ✅ JavaScript 源碼 - 可直接編輯
 * 心理學評分系統 - 整合database.js的psychologyScores
 * Source file: 此文件為手寫 JavaScript 源碼，非編譯產物
 * 提供科學化的五維度心理變化計算
 */

// 心理學評分系統 - 整合database.js的psychologyScores
// 提供科學化的五維度心理變化計算

// 暫時註解動態import，避免載入問題
// 從database.js導入題目數據（需要時動態導入）
let questionsDatabase = null;

// 動態載入database.js
async function loadQuestionsDatabase() {
  if (!questionsDatabase) {
    try {
      console.log('🔄 開始載入 database.js...');
      // 啟用database.js載入
      const module = await import('../../database.js');
      questionsDatabase = module.scamMessages || module.default || [];
      console.log('✅ 成功載入database.js，題目數量:', questionsDatabase.length);
      console.log('📋 前3個題目樣本:', questionsDatabase.slice(0, 3).map(q => ({id: q.id, type: q.type, hasScores: !!q.psychologyScores})));
    } catch (error) {
      console.error('❌ 無法載入database.js:', error);
      questionsDatabase = [];
    }
  }
  return questionsDatabase;
}

// KTDI四軸心理系統映射到五維度
const AXIS_MAPPING = {
  // K軸(懷疑vs信任) → 權威偏好
  authority: {
    suspicious: -1,  // 懷疑傾向 = 降低權威信任
    trusting: 1      // 信任傾向 = 增加權威信任
  },
  // D/I軸(審慎vs即時) → 時間習慣  
  timing: {
    deliberate: -1,  // 審慎傾向 = 降低即時反應
    immediate: 1     // 即時傾向 = 增加快速反應
  },
  // S/G軸(細節vs直覺) → 溝通風格
  style: {
    detail: 1,       // 細節傾向 = 增加細節關注
    intuition: -1    // 直覺傾向 = 降低細節依賴
  },
  // L/R軸(損失規避vs獎勵追求) → 動機傾向
  motivation: {
    lossAversion: 1,    // 損失規避 = 增加風險意識
    rewardSeeking: -1   // 獎勵追求 = 降低風險意識
  }
};

// 科學化心理影響計算
export function calculatePsychologyImpact(questionId, isCorrect) {
  return new Promise(async (resolve) => {
    try {
      const questions = await loadQuestionsDatabase();
      const question = questions.find(q => q.id === questionId);
      
      if (!question || !question.psychologyScores) {
        console.warn(`⚠️ 找不到題目 ${questionId} 的心理評分，使用預設值`);
        const defaultImpact = getDefaultImpact(isCorrect);
        resolve(defaultImpact);
        return;
      }

      const scores = question.psychologyScores;
      const techScore = question.techScore || 0;

      // 基於database.js的psychologyScores計算影響
      let impact = {
        authority: 0,
        timing: 0, 
        style: 0,
        motivation: 0,
        tech: 0
      };

      if (isCorrect) {
        // 答對：正確識別詐騙，強化反詐意識
        impact.authority = -scores.authority * 10;    // 正確識別 → 增強懷疑（負值）
        impact.timing = -scores.timing * 8;           // 正確分析 → 增強審慎（負值）
        impact.style = scores.style * 8;              // 正確驗證 → 增強細節關注（正值）
        impact.motivation = scores.motivation * 10;   // 正確防範 → 增強風險意識（正值）
        impact.tech = techScore * 15;                 // 正確運用科技知識
      } else {
        // 答錯：被詐騙手法迷惑，降低防範意識
        impact.authority = scores.authority * 12;     // 被騙 → 降低懷疑（正值，增加信任）
        impact.timing = scores.timing * 10;           // 衝動決策 → 降低審慎（正值，增加即時性）
        impact.style = -scores.style * 6;             // 忽略細節 → 降低細節關注（負值）
        impact.motivation = -scores.motivation * 8;   // 貪婪誘惑 → 降低風險意識（負值）
        impact.tech = -techScore * 10;                // 誤用科技概念
      }

      resolve(impact);
      
    } catch (error) {
      console.error('❌ 計算心理影響時發生錯誤:', error);
      const defaultImpact = getDefaultImpact(isCorrect);
      console.log(`📊 錯誤後使用預設影響:`, defaultImpact);
      resolve(defaultImpact);
    }
  });
}

// 預設心理影響（當無法讀取database.js時使用）
function getDefaultImpact(isCorrect) {
  if (isCorrect) {
    return {
      authority: -2,   // 正確識別 → 增強懷疑
      timing: -1,      // 正確分析 → 增強審慎
      style: 1,        // 正確驗證 → 增強細節關注
      motivation: 2,   // 正確防範 → 增強風險意識
      tech: 1          // 正確運用科技
    };
  } else {
    return {
      authority: 3,    // 被騙 → 降低懷疑（增加信任）
      timing: 2,       // 衝動 → 降低審慎（增加即時性）
      style: -1,       // 忽略細節 → 降低細節關注
      motivation: -2,  // 貪婪 → 降低風險意識
      tech: -1         // 誤用科技
    };
  }
}

// 計算總體五維度分數
export function calculateTotalDimensionScores(gameRecords) {
  return new Promise(async (resolve) => {
    let totalChanges = {
      authority: 0,    // 權威偏好（-100到+100）
      timing: 0,       // 時間習慣（-100到+100）
      style: 0,        // 溝通風格（-100到+100）
      motivation: 0,   // 動機傾向（-100到+100）
      tech: 50         // 科技適應（0到100，起始50）
    };

    console.log('🔄 初始變化值:', totalChanges);

    let totalCorrectAnswers = 0;
    let totalWrongAnswers = 0;

    // 處理每次遊戲記錄
    for (const record of gameRecords) {
      // 兼容不同的資料結構：wrongIds 或 wrongAnswers
      let wrongIds = record.wrongIds;
      if (!wrongIds && record.wrongAnswers) {
        // 如果有 wrongAnswers，提取其中的 ID
        wrongIds = record.wrongAnswers.map(answer => answer.id);
      }
      
      if (wrongIds && Array.isArray(wrongIds)) {
        // 處理答錯的題目
        for (const questionId of wrongIds) {
          const impact = await calculatePsychologyImpact(questionId, false);
          totalChanges.authority += impact.authority;
          totalChanges.timing += impact.timing;
          totalChanges.style += impact.style;
          totalChanges.motivation += impact.motivation;
          totalChanges.tech += impact.tech;
        }
        
        // 記錄答對題目數量
        const totalQuestions = 10; // 每局遊戲總題數
        const correctCount = totalQuestions - wrongIds.length;
        totalCorrectAnswers += correctCount;
        totalWrongAnswers += wrongIds.length;
      }
    }

    // 統一處理所有答對題目的影響
    console.log(`🎯 總計: 答對 ${totalCorrectAnswers} 題，答錯 ${totalWrongAnswers} 題`);
    
    // 為所有答對的題目計算平均正向影響
    for (let i = 0; i < totalCorrectAnswers; i++) {
      const defaultCorrectImpact = getDefaultImpact(true);
      totalChanges.authority += defaultCorrectImpact.authority;
      totalChanges.timing += defaultCorrectImpact.timing;
      totalChanges.style += defaultCorrectImpact.style;
      totalChanges.motivation += defaultCorrectImpact.motivation;
      totalChanges.tech += defaultCorrectImpact.tech;
    }

    // 轉換為0-100範圍的顯示分數
    const convertToDisplayScore = (change, baseValue = 50) => {
      const result = Math.max(0, Math.min(100, baseValue + change));
      return Math.round(result);
    };

    const displayScores = {
      authority: convertToDisplayScore(totalChanges.authority, 50),
      timing: convertToDisplayScore(totalChanges.timing, 50),
      style: convertToDisplayScore(totalChanges.style, 50),
      motivation: convertToDisplayScore(totalChanges.motivation, 50),
      tech: convertToDisplayScore(totalChanges.tech, 50)
    };

    console.log('✅ 心理分數計算完成:', displayScores);

    resolve(displayScores);
  });
}

// 獲取心理維度的文字描述
export function getDimensionDescription(dimension, score) {
  const descriptions = {
    authority: {
      low: '傾向懷疑權威，獨立思考',
      medium: '權威態度平衡',
      high: '傾向信任權威，依賴專家'
    },
    timing: {
      low: '偏好審慎分析，深思熟慮',
      medium: '時間決策平衡',
      high: '偏好快速決策，即時反應'
    },
    style: {
      low: '偏好直覺判斷，整體思維',
      medium: '思維風格平衡',
      high: '偏好細節分析，邏輯推理'
    },
    motivation: {
      low: '偏好追求獎勵，積極進取',
      medium: '動機傾向平衡',
      high: '偏好規避損失，謹慎保守'
    },
    tech: {
      low: '科技適應較低',
      medium: '科技適應中等',
      high: '科技適應較高'
    }
  };

  const level = score < 33 ? 'low' : score > 66 ? 'high' : 'medium';
  return descriptions[dimension][level] || '未知特徵';
}