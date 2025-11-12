/**
 * ✅ JavaScript 源碼 - 可直接編輯
 * 智能動物範圍管理系統
 * Source file: 此文件為手寫 JavaScript 源碼，非編譯產物
 * 解決重疊問題，確保每個分數唯一對應一個動物
 */

export class SmartAnimalRangeSystem {
  constructor() {
    // 16種動物按KTDI心理學分組（與Analyt.vue中animalCodeToName順序一致）
    this.animalGroups = {
      'KD': ['🦊 狐狸型', '🦅 老鷹型', '🦉 貓頭鷹型', '🦈 鯊魚型'], // 懷疑+審慎 (KDSL, KDSR, KDGL, KDGR)
      'KI': ['🐿️ 松鼠型', '🐙 章魚型', '🐱 貓咪型', '🐺 狼型'], // 懷疑+即時 (KISL, KISR, KIGL, KIGR)
      'TD': ['🐢 烏龜型', '🐘 大象型', '🦛 河馬型', '🦍 金剛型'], // 信任+審慎 (TDSL, TDSR, TDGL, TDGR)
      'TI': ['🐭 老鼠型', '🦁 獅子型', '🦌 麋鹿型', '🐎 馬型'] // 信任+即時 (TISL, TISR, TIGL, TIGR)
    };
    
    this.dimensions = ['authority', 'timing', 'style', 'motivation', 'tech'];
    this.totalAnimals = 16;
  }

  // 生成無重疊的最優範圍分配
  generateOptimalRanges() {
    const ranges = {};
    
    // 為每個維度生成無重疊範圍
    this.dimensions.forEach(dimension => {
      const segmentSize = Math.floor(101 / this.totalAnimals); // 基本分段大小 6
      const remainder = 101 % this.totalAnimals; // 剩餘5分
      
      let currentStart = 0;
      let animalIndex = 0;
      
      // 按KTDI分組順序分配
      Object.values(this.animalGroups).forEach(group => {
        group.forEach(animal => {
          if (!ranges[animal]) ranges[animal] = {};
          
          let segmentLength = segmentSize;
          // 將剩餘分數分配給前幾個動物
          if (animalIndex < remainder) segmentLength++;
          
          ranges[animal][dimension] = [currentStart, currentStart + segmentLength - 1];
          currentStart += segmentLength;
          animalIndex++;
        });
      });
    });
    
    return ranges;
  }

  // 基於用戶分數動態調整範圍 
  adjustRangesForUser(userScores) {
    console.log('🎯 根據用戶分數動態調整動物範圍...');
    
    const baseRanges = this.generateOptimalRanges();
    const adjustedRanges = JSON.parse(JSON.stringify(baseRanges));
    
    // 找到最匹配的動物
    const bestAnimal = this.findBestMatchAnimal(userScores, baseRanges);
    console.log(`🦁 最佳匹配動物: ${bestAnimal}`);
    
    // 安全檢查：如果沒有找到匹配的動物，返回基礎範圍
    if (!bestAnimal) {
      console.warn(`⚠️ 無法找到匹配的動物，返回基礎範圍`);
      return baseRanges;
    }
    
    // 為該動物調整範圍以包含用戶分數
    this.dimensions.forEach(dimension => {
      const userScore = userScores[dimension];
      const targetRange = adjustedRanges[bestAnimal][dimension];
      
      // 如果用戶分數在範圍外，擴展範圍
      if (userScore < targetRange[0] || userScore > targetRange[1]) {
        console.log(`📈 調整${dimension}: ${userScore} → ${bestAnimal}`);
        adjustedRanges[bestAnimal][dimension] = [
          Math.min(targetRange[0], userScore),
          Math.max(targetRange[1], userScore)
        ];
        
        // 重新平衡其他動物以避免重疊
        this.rebalanceRanges(adjustedRanges, bestAnimal, dimension);
      }
    });
    
    return adjustedRanges;
  }

  // 找到最匹配的動物
  findBestMatchAnimal(userScores, ranges) {
    let bestAnimal = null;
    let bestScore = -1;
    
    console.log('🔍 findBestMatchAnimal 輸入:', {
      userScores: userScores,
      rangeKeys: Object.keys(ranges),
      dimensions: this.dimensions
    });
    
    // 驗證輸入數據的有效性
    const hasValidScores = this.dimensions.every(dim => 
      userScores[dim] !== undefined && 
      userScores[dim] !== null && 
      !isNaN(userScores[dim])
    );
    
    if (!hasValidScores) {
      console.error('❌ 用戶分數包含無效值:', userScores);
      return null;
    }
    
    const hasValidRanges = Object.keys(ranges).length > 0;
    if (!hasValidRanges) {
      console.error('❌ 範圍數據為空:', ranges);
      return null;
    }
    
    Object.keys(ranges).forEach(animal => {
      let matchCount = 0;
      let totalDistance = 0;
      
      this.dimensions.forEach(dimension => {
        const score = userScores[dimension];
        const range = ranges[animal][dimension];
        
        if (!range) {
          console.warn(`⚠️ 動物 ${animal} 缺少維度 ${dimension} 的範圍定義`);
          return;
        }
        
        if (score >= range[0] && score <= range[1]) {
          matchCount++;
        } else {
          // 計算距離範圍的距離
          const distance = Math.min(
            Math.abs(score - range[0]),
            Math.abs(score - range[1])
          );
          totalDistance += distance;
        }
      });
      
      // 優先考慮匹配維度數，其次考慮距離
      const finalScore = matchCount * 1000 - totalDistance;
      
      console.log(`🦁 ${animal}: 匹配=${matchCount}/${this.dimensions.length}, 距離=${totalDistance.toFixed(1)}, 分數=${finalScore}`);
      
      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestAnimal = animal;
      }
    });
    
    return bestAnimal;
  }

  // 重新平衡範圍以避免重疊
  rebalanceRanges(ranges, targetAnimal, dimension) {
    const targetRange = ranges[targetAnimal][dimension];
    
    Object.keys(ranges).forEach(animal => {
      if (animal === targetAnimal) return;
      
      const range = ranges[animal][dimension];
      
      // 檢查是否有重疊
      const overlapStart = Math.max(targetRange[0], range[0]);
      const overlapEnd = Math.min(targetRange[1], range[1]);
      
      if (overlapStart <= overlapEnd) {
        // 有重疊，需要調整
        if (range[0] < targetRange[0]) {
          // 當前動物範圍在左側，向左收縮
          ranges[animal][dimension] = [range[0], Math.min(range[1], targetRange[0] - 1)];
        } else {
          // 當前動物範圍在右側，向右收縮
          ranges[animal][dimension] = [Math.max(range[0], targetRange[1] + 1), range[1]];
        }
      }
    });
  }

  // 驗證範圍系統
  validateRanges(ranges) {
    const issues = [];
    
    this.dimensions.forEach(dimension => {
      // 檢查重疊
      const animals = Object.keys(ranges);
      for (let i = 0; i < animals.length; i++) {
        for (let j = i + 1; j < animals.length; j++) {
          const range1 = ranges[animals[i]][dimension];
          const range2 = ranges[animals[j]][dimension];
          
          const overlapStart = Math.max(range1[0], range2[0]);
          const overlapEnd = Math.min(range1[1], range2[1]);
          
          if (overlapStart <= overlapEnd) {
            issues.push({
              type: 'overlap',
              dimension,
              animals: [animals[i], animals[j]],
              overlap: [overlapStart, overlapEnd]
            });
          }
        }
      }
      
      // 檢查覆蓋缺口
      const covered = new Set();
      animals.forEach(animal => {
        const range = ranges[animal][dimension];
        for (let score = range[0]; score <= range[1]; score++) {
          covered.add(score);
        }
      });
      
      for (let score = 0; score <= 100; score++) {
        if (!covered.has(score)) {
          issues.push({
            type: 'gap',
            dimension,
            score
          });
        }
      }
    });
    
    return issues;
  }

  // 獲取指定分數對應的動物
  getAnimalForScores(scores, ranges) {
    const matches = [];
    
    Object.keys(ranges).forEach(animal => {
      let perfectMatches = 0;
      let totalDistance = 0;
      
      this.dimensions.forEach(dimension => {
        const score = scores[dimension];
        const range = ranges[animal][dimension];
        
        if (score >= range[0] && score <= range[1]) {
          perfectMatches++;
        } else {
          const distance = Math.min(
            Math.abs(score - range[0]),
            Math.abs(score - range[1])
          );
          totalDistance += distance;
        }
      });
      
      if (perfectMatches === 5) {
        matches.push({
          animal,
          perfectMatches,
          totalDistance,
          score: perfectMatches * 1000 - totalDistance
        });
      }
    });
    
    if (matches.length > 0) {
      return matches.sort((a, b) => b.score - a.score)[0].animal;
    }
    
    // 如果沒有完美匹配，返回最佳近似
    let bestAnimal = null;
    let bestScore = -1;
    
    Object.keys(ranges).forEach(animal => {
      let matchCount = 0;
      let totalDistance = 0;
      
      this.dimensions.forEach(dimension => {
        const score = scores[dimension];
        const range = ranges[animal][dimension];
        
        if (score >= range[0] && score <= range[1]) {
          matchCount++;
        } else {
          const distance = Math.min(
            Math.abs(score - range[0]),
            Math.abs(score - range[1])
          );
          totalDistance += distance;
        }
      });
      
      const finalScore = matchCount * 1000 - totalDistance;
      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestAnimal = animal;
      }
    });
    
    return bestAnimal;
  }
}