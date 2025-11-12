// 清除所有靈魂動物數據的工具函數
window.clearAllSoulData = function() {
  console.log('清除所有靈魂動物數據...');
  
  // 清除 localStorage 中的所有相關數據
  const keysToRemove = [
    'soulXP',
    'techLevel', 
    'currentAnimalCode',
    'gameHistory',
    'psychologyScores',
    'answerStreak',
    'syncStatus',
    'lastSyncTime',
    'authToken',
    'currentUser'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`已清除 ${key}`);
  });
  
  console.log('所有數據已清除，頁面將重新載入...');
  location.reload();
};

// 檢查當前 localStorage 數據
window.checkSoulData = function() {
  console.log('當前 localStorage 數據:');
  console.log('soulXP:', localStorage.getItem('soulXP'));
  console.log('techLevel:', localStorage.getItem('techLevel'));
  console.log('currentAnimalCode:', localStorage.getItem('currentAnimalCode'));
  console.log('gameHistory:', localStorage.getItem('gameHistory'));
  console.log('psychologyScores:', localStorage.getItem('psychologyScores'));
  console.log('answerStreak:', localStorage.getItem('answerStreak'));
};

console.log('數據管理工具已載入:');
console.log('- 執行 clearAllSoulData() 清除所有數據');
console.log('- 執行 checkSoulData() 檢查當前數據');