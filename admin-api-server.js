// Admin.vue 專用後端 API - 零風險新增功能
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = 3002; // 獨立端口，不影響現有服務
const adminConfigFile = path.resolve('./admin-config.json');
const soulDataDir = path.resolve('./soul_data');

app.use(cors());
app.use(express.json());

// === Dashboard 真實統計 ===
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    // 統計 soul_data 目錄中的真實資料
    const soulFiles = fs.readdirSync(soulDataDir).filter(f => f.endsWith('.json'));
    const totalUsers = soulFiles.length;
    
    let totalQueries = 0;
    let activeToday = 0;
    let totalXP = 0;
    let maxTechLevel = 0;
    
    const today = new Date().toDateString();
    
    for (const file of soulFiles) {
      try {
        const userData = JSON.parse(fs.readFileSync(path.join(soulDataDir, file), 'utf-8'));
        
        // 累計遊戲次數
        if (userData.gameHistory) {
          totalQueries += userData.gameHistory.length;
          
          // 檢查今日活躍用戶
          const todayActivity = userData.gameHistory.some(game => {
            const gameDate = new Date(game.timestamp).toDateString();
            return gameDate === today;
          });
          if (todayActivity) activeToday++;
        }
        
        // 統計經驗值和等級
        if (userData.soulXP) totalXP += userData.soulXP;
        if (userData.techLevel) maxTechLevel = Math.max(maxTechLevel, userData.techLevel);
        
      } catch (err) {
        console.log(`讀取 ${file} 時發生錯誤:`, err.message);
      }
    }
    
    res.json({
      success: true,
      data: {
        totalUsers,
        activeToday,
        totalQueries,
        avgXP: Math.round(totalXP / totalUsers),
        maxTechLevel,
        dataSource: 'realtime',
        lastUpdate: new Date().toISOString()
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === API 管理資料 ===
app.get('/api/admin/config', (req, res) => {
  try {
    if (fs.existsSync(adminConfigFile)) {
      const config = JSON.parse(fs.readFileSync(adminConfigFile, 'utf-8'));
      res.json({ success: true, data: config });
    } else {
      res.status(404).json({ success: false, error: '設定檔不存在' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === 更新設定 ===
app.post('/api/admin/config', (req, res) => {
  try {
    fs.writeFileSync(adminConfigFile, JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: '設定已更新' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === 用戶詳細資料 ===
app.get('/api/admin/users', (req, res) => {
  try {
    const soulFiles = fs.readdirSync(soulDataDir).filter(f => f.endsWith('.json'));
    const users = [];
    
    for (const file of soulFiles) {
      try {
        const userData = JSON.parse(fs.readFileSync(path.join(soulDataDir, file), 'utf-8'));
        const username = file.replace('_soul.json', '');
        
        users.push({
          username,
          soulXP: userData.soulXP || 0,
          techLevel: userData.techLevel || 1,
          currentAnimal: userData.currentAnimalCode || 'UNKN',
          gameCount: userData.gameHistory ? userData.gameHistory.length : 0,
          lastActive: userData.gameHistory && userData.gameHistory.length > 0 
            ? new Date(userData.gameHistory[0].timestamp).toISOString()
            : null
        });
      } catch (err) {
        console.log(`解析 ${file} 失敗:`, err.message);
      }
    }
    
    // 按最後活躍時間排序
    users.sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0));
    
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Admin API 服務已啟動在 http://localhost:${PORT}`);
  console.log(`📊 提供真實統計資料，不影響現有服務`);
  console.log(`🔒 獨立運行，零風險`);
});

export default app;