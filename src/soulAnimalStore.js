/**
 * ✅ JavaScript 源碼 - 可直接編輯
 * 靈魂動物測驗記錄管理系統
 * Source file: 此文件為手寫 JavaScript 源碼，非編譯產物
 */

// 靈魂動物測驗記錄管理
class SoulAnimalStore {
  constructor() {
    this.storageKey = 'soul_animal_records'
    this.gameScoreKey = 'game_scores' // 新增遊戲分數記錄鍵
    this.soulStorageKey = 'soul_transform_data' // 靈魂轉換數據鍵
    this.currentUser = null
  }

  // 設定當前用戶
  setCurrentUser(username) {
    this.currentUser = username
  }

  // 獲取當前用戶的測驗記錄
  getUserRecords(username = this.currentUser) {
    if (!username) return []
    
    const allRecords = this.getAllRecords()
    return allRecords[username] || []
  }

  // 獲取所有記錄
  getAllRecords() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('Failed to load soul animal records:', error)
      return {}
    }
  }

  // 獲取所有遊戲分數記錄
  getAllGameScores() {
    try {
      const data = localStorage.getItem(this.gameScoreKey)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('Failed to load game scores:', error)
      return {}
    }
  }

  // 獲取用戶的遊戲分數
  getUserGameScore(username = this.currentUser) {
    if (!username) return 0
    
    const allScores = this.getAllGameScores()
    return allScores[username] || 0
  }

  // 添加遊戲分數（累計）
  addGameScore(username, score) {
    try {
      const allScores = this.getAllGameScores()
      const currentScore = allScores[username] || 0
      allScores[username] = currentScore + score
      
      localStorage.setItem(this.gameScoreKey, JSON.stringify(allScores))
      
      console.log(`用戶 ${username} 的分數從 ${currentScore} 增加 ${score} 到 ${allScores[username]}`)
      return allScores[username]
    } catch (error) {
      console.error('Failed to save game score:', error)
      return 0
    }
  }

  // 獲取排行榜數據（按分數排序）
  getLeaderboard() {
    try {
      const allScores = this.getAllGameScores()
      const leaderboard = Object.entries(allScores)
        .map(([name, score]) => ({ name, score }))
        .sort((a, b) => b.score - a.score) // 分數由高到低排序
        .slice(0, 10) // 只取前10名
      
      return leaderboard
    } catch (error) {
      console.error('Failed to get leaderboard:', error)
      return []
    }
  }

  // 保存遊戲記錄（包含所有遊戲數據，不僅僅是錯題）
  saveGameRecord(username, gameData) {
    try {
      const gameKey = 'game_records' // 改名為更通用的 game_records
      const allRecords = JSON.parse(localStorage.getItem(gameKey) || '{}')
      
      if (!allRecords[username]) {
        allRecords[username] = []
      }
      
      const gameRecord = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        round: gameData.round,
        score: gameData.score,
        wrongAnswers: gameData.wrongAnswers || [],
        mode: gameData.mode || 'normal',
        hasErrors: (gameData.wrongAnswers && gameData.wrongAnswers.length > 0)
      }
      
      allRecords[username].push(gameRecord)
      localStorage.setItem(gameKey, JSON.stringify(allRecords))
      
      console.log(`遊戲記錄已保存: ${username}, 有錯題: ${gameRecord.hasErrors}`)
      return true
    } catch (error) {
      console.error('Failed to save game record:', error)
      return false
    }
  }

  // 保存遊戲錯題記錄（保持向後兼容）
  saveGameErrors(username, gameData) {
    // 調用新的 saveGameRecord 方法
    return this.saveGameRecord(username, gameData)
  }

  // 獲取用戶的遊戲記錄（新方法）
  getUserGameRecords(username = this.currentUser) {
    try {
      const gameKey = 'game_records'
      const allRecords = JSON.parse(localStorage.getItem(gameKey) || '{}')
      
      // 如果沒有新格式的記錄，嘗試從舊格式遷移
      if (!allRecords[username]) {
        const legacyErrors = this.getUserGameErrors(username)
        if (legacyErrors && legacyErrors.length > 0) {
          console.log(`為用戶 ${username} 遷移遊戲記錄格式`)
          return legacyErrors
        }
      }
      
      return allRecords[username] || []
    } catch (error) {
      console.error('Failed to get game records:', error)
      return []
    }
  }

  // 獲取用戶的遊戲錯題記錄（保持向後兼容）
  getUserGameErrors(username = this.currentUser) {
    try {
      const errorKey = 'game_errors'
      const allErrors = JSON.parse(localStorage.getItem(errorKey) || '{}')
      return allErrors[username] || []
    } catch (error) {
      console.error('Failed to get game errors:', error)
      return []
    }
  }

  // 保存測驗記錄
  saveRecord(username, animalResult) {
    try {
      const allRecords = this.getAllRecords()
      
      if (!allRecords[username]) {
        allRecords[username] = []
      }

      const newRecord = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        animalResult: {
          finalAnimal: animalResult.finalAnimal,
          animalName: this.getAnimalName(animalResult.finalAnimal),
          awareness: animalResult.awareness,
          awarenessLabel: animalResult.awarenessLabel,
          agePrediction: animalResult.agePrediction,
          genderPrediction: animalResult.genderPrediction,
          level: this.calculateLevel(animalResult),
          summary: this.getAnimalSummary(animalResult.finalAnimal),
          analysis: this.getAnimalAnalysis(animalResult.finalAnimal),
          topFraudRisks: animalResult.topFraudRisks || []
        }
      }

      allRecords[username].unshift(newRecord) // 新記錄放在前面
      
      // 限制每個用戶最多保留10條記錄
      if (allRecords[username].length > 10) {
        allRecords[username] = allRecords[username].slice(0, 10)
      }

      localStorage.setItem(this.storageKey, JSON.stringify(allRecords))
      return newRecord
    } catch (error) {
      console.error('Failed to save soul animal record:', error)
      return null
    }
  }

  // 獲取動物中文名稱
  getAnimalName(animal) {
    const names = {
      // 原有10動物系統
      'Fox': '狐狸 (Fox)',
      'Turtle': '烏龜 (Turtle)', 
      'Dog': '狗 (Dog)',
      'Cat': '貓 (Cat)',
      'Owl': '貓頭鷹 (Owl)',
      'Squirrel': '松鼠 (Squirrel)',
      'Shark': '鯊魚 (Shark)',
      'Mouse': '老鼠 (Mouse)',
      'Octopus': '章魚 (Octopus)',
      'Dove': '鴿子 (Dove)',
      
      // 新16動物系統
      'lion': '🦁 獅子型',
      'tiger': '🐯 老虎型', 
      'dolphin': '🐬 海豚型',
      'elephant': '🐘 大象型',
      'fox': '🦊 狐狸型',
      'wolf': '🐺 狼型',
      'bear': '🐻 熊型',
      'eagle': '🦅 老鷹型',
      'rabbit': '🐰 兔子型',
      'owl': '🦉 貓頭鷹型',
      'panda': '🐼 熊貓型',
      'horse': '🐴 馬型',
      'otter': '🦦 水獺型',
      'peacock': '🦚 孔雀型',
      'sheep': '🐑 綿羊型',
      'deer': '🦌 鹿型',
      'gorilla': '🦍 金剛型',
      'hippo': '🦛 河馬型',
      'turtle': '🐢 烏龜型',
      'mouse': '🐭 老鼠型',
      'squirrel': '🐿️ 松鼠型',
      'octopus': '🐙 章魚型',
      'cat': '🐱 貓咪型',
      'shark': '🦈 鯊魚型'
    }
    return names[animal] || animal
  }

  // 獲取動物簡短描述
  getAnimalSummary(animal) {
    const summaries = {
      'Fox': '聰明好奇、反應快，但容易被高報酬誘惑。',
      'Turtle': '穩重謹慎、慢而安全，但可能會被官方語氣迷惑。',
      'Dog': '情感導向、信任他人，擅長社群互動但易被親友式詐騙影響。',
      'Cat': '直覺敏銳、獨立，但熟悉語氣可能讓你漏判假客服/電商。',
      'Owl': '理性分析、喜歡研究，但複雜的投資詐騙可能讓你困惑。',
      'Squirrel': '謹慎儲蓄、節省，但假優惠/假折扣容易吸引你。',
      'Shark': '果斷行動、目標導向，但衝動決策可能讓你掉入陷阱。',
      'Mouse': '小心翼翼、警覺性高，但過度恐懼可能讓你錯失正常機會。',
      'Octopus': '多元思考、適應力強，但複雜情境可能讓你判斷混亂。',
      'Dove': '溫和善良、願意助人，但善心容易被假慈善詐騙利用。'
    }
    return summaries[animal] || '獨特的防詐特質，需要個別分析。'
  }

  // 獲取動物詳細分析
  getAnimalAnalysis(animal) {
    const analyses = {
      'Fox': '你天生好奇且行動力強，擅長抓住機會與新事物。但這種嗅覺也會讓你在高回報誘因下掉以輕心。財務/投資型詐騙與假金融商品是你需要特別警惕的方向。',
      'Turtle': '你的穩重是防詐大優勢：不衝動、喜歡查證。但詐騙者常用官方語氣或法務字眼迷惑你，建議遇到「行政/法務/銀行」字眼時，一律以官方電話或官方網站為準。',
      'Dog': '你很在意人際關係，容易從情感面給予信任。詐騙者正是利用親友或情感做為切入點。遇到求助訊息，先用電話或共同朋友確認。',
      'Cat': '你保有很強的直覺與自主性，不喜歡被強迫。但詐騙會用熟悉用語或品牌信箱來降低你的警覺。建議核對訂單號與官方平台。',
      'Owl': '你喜歡深入研究和理性分析，這是很好的防詐特質。但要小心過於複雜的投資商品詐騙，它們會用專業術語混淆你的判斷。',
      'Squirrel': '你對金錢管理謹慎，這很好。但要注意假優惠和限時折扣詐騙，它們會利用你的節儉心理製造購買壓力。',
      'Shark': '你的決斷力是優勢，但也可能成為弱點。詐騙者會利用緊急情況製造壓力，讓你快速決策而忽略風險。',
      'Mouse': '你的謹慎態度很好，但要避免因過度恐懼而錯失正常機會，也要注意一些看似安全的小額詐騙。',
      'Octopus': '你的多元思考能力很強，但在複雜的詐騙情境中可能會被混淆。建議遇到複雜情況時，先暫停並尋求第三方意見。',
      'Dove': '你的善良是美德，但也要學會在助人時保護自己。遇到募捐或慈善請求時，務必查證組織的合法性。'
    }
    return analyses[animal] || '你有獨特的防詐特質，建議根據具體情況分析風險。'
  }

  // 計算特務等級
  calculateLevel(result) {
    const awareness = result.awareness || 0
    if (awareness >= 80) return '特務•高階'
    if (awareness >= 65) return '特務•中階'
    return '特務•見習'
  }

  // 轉移記錄（從源用戶轉移到目標用戶）
  transferRecords(fromUser, toUser) {
    try {
      const allRecords = this.getAllRecords()
      
      if (allRecords[fromUser] && allRecords[fromUser].length > 0) {
        // 確保目標用戶有記錄陣列
        if (!allRecords[toUser]) {
          allRecords[toUser] = []
        }
        
        // 將源用戶的記錄轉移到目標用戶（放在前面）
        allRecords[toUser] = allRecords[fromUser].concat(allRecords[toUser])
        
        // 清除源用戶的記錄
        delete allRecords[fromUser]
        
        // 保存更新
        localStorage.setItem(this.storageKey, JSON.stringify(allRecords))
        
        console.log(`已將 ${fromUser} 的 ${allRecords[toUser].length} 條記錄轉移至 ${toUser}`)
        return true
      }
      return false
    } catch (error) {
      console.error('轉移記錄失敗:', error)
      return false
    }
  }

  // 清除所有記錄 (用於測試)
  clearAllRecords() {
    localStorage.removeItem(this.storageKey)
  }

  // ============= 靈魂動物轉換系統 =============
  
  // 獲取用戶當前的靈魂動物
  getUserSoulAnimal(username) {
    const soulData = this.getSoulData()
    return soulData[username]?.currentAnimal || null
  }

  // 更新用戶的靈魂動物
  updateUserSoulAnimal(username, animalName) {
    const soulData = this.getSoulData()
    
    if (!soulData[username]) {
      soulData[username] = {
        currentAnimal: animalName,
        transformHistory: []
      }
    } else {
      soulData[username].currentAnimal = animalName
    }
    
    localStorage.setItem(this.soulStorageKey, JSON.stringify(soulData))
    console.log(`更新 ${username} 的靈魂動物為: ${animalName}`)
  }

  // 添加轉換歷史記錄
  addTransformHistory(username, transformRecord) {
    const soulData = this.getSoulData()
    
    if (!soulData[username]) {
      soulData[username] = {
        currentAnimal: transformRecord.toAnimal,
        transformHistory: []
      }
    }
    
    if (!soulData[username].transformHistory) {
      soulData[username].transformHistory = []
    }
    
    soulData[username].transformHistory.unshift(transformRecord) // 新記錄放在前面
    
    localStorage.setItem(this.soulStorageKey, JSON.stringify(soulData))
    console.log(`添加 ${username} 的轉換歷史:`, transformRecord)
  }

  // 獲取用戶的轉換歷史
  getUserTransformHistory(username) {
    const soulData = this.getSoulData()
    return soulData[username]?.transformHistory || []
  }

  // 獲取靈魂數據
  getSoulData() {
    try {
      const stored = localStorage.getItem(this.soulStorageKey)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('讀取靈魂數據失敗:', error)
      return {}
    }
  }

  // 修復現有記錄中的動物名稱
  fixAnimalNames(username = null) {
    try {
      const allRecords = this.getAllRecords()
      let hasChanges = false
      
      const users = username ? [username] : Object.keys(allRecords)
      
      users.forEach(user => {
        if (allRecords[user] && Array.isArray(allRecords[user])) {
          allRecords[user].forEach(record => {
            if (record.animalResult) {
              // 修復 finalAnimal 和 animalName 的不一致
              const correctName = this.getAnimalName(record.animalResult.finalAnimal)
              
              if (record.animalResult.animalName !== correctName) {
                console.log(`🔧 修復 ${user} 的記錄: ${record.animalResult.animalName} -> ${correctName}`)
                record.animalResult.animalName = correctName
                hasChanges = true
              }
              
              // 特別處理 gorilla 相關的問題
              if (record.animalResult.animalName === 'gorilla' || 
                  record.animalResult.finalAnimal === 'gorilla') {
                record.animalResult.animalName = '🦍 金剛型'
                record.animalResult.finalAnimal = 'gorilla' // 保持原始標識
                hasChanges = true
                console.log(`🦍 修復 gorilla 記錄: ${user}`)
              }
            }
          })
        }
      })
      
      if (hasChanges) {
        localStorage.setItem(this.storageKey, JSON.stringify(allRecords))
        console.log(`✅ 動物名稱修復完成，影響用戶: ${users.join(', ')}`)
        return true
      }
      
      console.log('📝 所有記錄已經是最新格式')
      return false
    } catch (error) {
      console.error('修復動物名稱時發生錯誤:', error)
      return false
    }
  }
}

// 創建全局實例
const soulAnimalStore = new SoulAnimalStore()

// 默認導出
export default soulAnimalStore

// 為了向後兼容，也提供一些便利函數
export const saveSoulAnimalRecord = (username, result) => {
  return soulAnimalStore.saveRecord(username, result)
}

export const getUserSoulAnimalRecords = (username) => {
  return soulAnimalStore.getUserRecords(username)
}