// 整合服務器 - 解決 VS Code 卡頓問題
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import Papa from 'papaparse';
import { promises as fsPromises } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 設定檔案路徑
const settingsFile = path.resolve('./eyeSettings.json');
const csvFile = path.resolve('./ms_csv.csv');
const leaderboardFile = path.resolve('./leaderboard.json');
const adminConfigFile = path.resolve('./admin-config.json');
const soulDataDir = path.resolve('./soul_data');

app.use(cors());
app.use(express.json());

console.log('🚀 啟動整合服務器...');
console.log('📁 資料目錄:', soulDataDir);

// 添加簡單的緩存機制減少檔案讀取
const cache = {
  dashboard: { data: null, timestamp: 0, ttl: 30000 }, // 30秒緩存
  users: { data: null, timestamp: 0, ttl: 60000 },     // 60秒緩存
  config: { data: null, timestamp: 0, ttl: 120000 }    // 2分鐘緩存
};

// 緩存輔助函數
function getCachedData(key) {
  const cached = cache[key];
  if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
    console.log(`📦 使用緩存資料: ${key}`);
    return cached.data;
  }
  return null;
}

function setCachedData(key, data) {
  cache[key] = {
    data: data,
    timestamp: Date.now(),
    ttl: cache[key].ttl
  };
  console.log(`💾 更新緩存: ${key}`);
}

// ===== 基礎功能 API (原 server.js) =====
app.get('/get-eye-settings', (req, res) => {
  console.log('📥 請求眼球設定');
  if(fs.existsSync(settingsFile)) {
    const data = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
    res.json(data);
  } else {
    res.json({ eyeColors: ['#00fff0', '#005f6a', '#001f2a', '#00fff0'] });
  }
});

app.post('/save-eye-settings', (req, res) => {
  console.log('💾 保存眼球設定');
  const { eyeColors } = req.body;
  if(Array.isArray(eyeColors) && eyeColors.length === 4) {
    fs.writeFileSync(settingsFile, JSON.stringify({ eyeColors }, null, 2));
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.get('/get-quiz', (req, res) => {
  console.log('📝 請求題目');
  if(fs.existsSync(csvFile)) {
    const csvText = fs.readFileSync(csvFile, 'utf-8');
    const parsed = Papa.parse(csvText, { header: true });
    res.json({ success: true, data: parsed.data });
  } else {
    res.json({ success: false, error: 'CSV file not found' });
  }
});

app.get('/leaderboard', (req, res) => {
  console.log('🏆 請求排行榜');
  if(fs.existsSync(leaderboardFile)) {
    const data = JSON.parse(fs.readFileSync(leaderboardFile, 'utf-8'));
    res.json(data);
  } else {
    res.json([]);
  }
});

// ===== 靈魂動物 API (原 soul-api-server.js) =====
function getUserDataPath(username) {
  return path.join(soulDataDir, `${username}_soul.json`);
}

async function loadUserSoulData(username) {
  try {
    const filePath = getUserDataPath(username);
    const data = await fsPromises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      soulXP: 0,
      techLevel: 1,
      currentAnimalCode: null,
      gameHistory: [],
      lastSync: null,
      version: '1.0'
    };
  }
}

app.get('/api/soul/sync/:username', async (req, res) => {
  console.log('🔄 同步用戶資料:', req.params.username);
  try {
    const userData = await loadUserSoulData(req.params.username);
    res.json({ success: true, data: userData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/soul/save/:username', async (req, res) => {
  console.log('💾 保存靈魂資料:', req.params.username);
  try {
    const filePath = getUserDataPath(req.params.username);
    const dataToSave = {
      ...req.body,
      lastSync: new Date().toISOString(),
      version: '1.0'
    };
    
    await fsPromises.writeFile(filePath, JSON.stringify(dataToSave, null, 2));
    res.json({ success: true, message: '資料已儲存' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== Admin 管理 API (原 admin-api-server.js) =====
app.get('/api/admin/dashboard', async (req, res) => {
  console.log('📊 請求管理面板資料');
  
  // 檢查緩存
  const cachedData = getCachedData('dashboard');
  if (cachedData) {
    return res.json({ success: true, data: cachedData });
  }
  
  try {
    // 使用非同步檔案操作避免阻塞
    const soulFiles = (await fsPromises.readdir(soulDataDir)).filter(f => f.endsWith('.json'));
    const totalUsers = soulFiles.length;
    
    let totalQueries = 0;
    let activeToday = 0;
    let totalXP = 0;
    let maxTechLevel = 0;
    
    const today = new Date().toDateString();
    
    // 使用 Promise.all 並行處理，但限制並發數量避免過載
    const batchSize = 10; // 限制同時處理的檔案數量
    const batches = [];
    
    for (let i = 0; i < soulFiles.length; i += batchSize) {
      const batch = soulFiles.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    for (const batch of batches) {
      const promises = batch.map(async (file) => {
        try {
          const userData = JSON.parse(await fsPromises.readFile(path.join(soulDataDir, file), 'utf-8'));
          
          let userQueries = 0;
          let userActiveToday = false;
          
          if (userData.gameHistory) {
            userQueries = userData.gameHistory.length;
            
            userActiveToday = userData.gameHistory.some(game => {
              const gameDate = new Date(game.timestamp).toDateString();
              return gameDate === today;
            });
          }
          
          return {
            queries: userQueries,
            activeToday: userActiveToday ? 1 : 0,
            xp: userData.soulXP || 0,
            techLevel: userData.techLevel || 1
          };
        } catch (err) {
          console.log(`讀取 ${file} 時發生錯誤:`, err.message);
          return { queries: 0, activeToday: 0, xp: 0, techLevel: 1 };
        }
      });
      
      const results = await Promise.all(promises);
      
      // 累計結果
      results.forEach(result => {
        totalQueries += result.queries;
        activeToday += result.activeToday;
        totalXP += result.xp;
        maxTechLevel = Math.max(maxTechLevel, result.techLevel);
      });
    }
    
    const dashboardData = {
      totalUsers,
      activeToday,
      totalQueries,
      avgXP: Math.round(totalXP / totalUsers) || 0,
      maxTechLevel,
      dataSource: 'realtime',
      lastUpdate: new Date().toISOString()
    };
    
    // 設置緩存
    setCachedData('dashboard', dashboardData);
    
    res.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/config', async (req, res) => {
  console.log('⚙️ 請求管理配置');
  try {
    if (fs.existsSync(adminConfigFile)) {
      // 使用非同步檔案讀取
      const configData = await fsPromises.readFile(adminConfigFile, 'utf-8');
      const config = JSON.parse(configData);
      res.json({ success: true, data: config });
    } else {
      res.status(404).json({ success: false, error: '設定檔不存在' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  console.log('👥 請求用戶列表');
  try {
    // 使用非同步檔案操作
    const soulFiles = (await fsPromises.readdir(soulDataDir)).filter(f => f.endsWith('.json'));
    const users = [];
    
    // 批次處理避免過載
    const batchSize = 15;
    const batches = [];
    
    for (let i = 0; i < soulFiles.length; i += batchSize) {
      const batch = soulFiles.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    for (const batch of batches) {
      const promises = batch.map(async (file) => {
        try {
          const userData = JSON.parse(await fsPromises.readFile(path.join(soulDataDir, file), 'utf-8'));
          const username = file.replace('_soul.json', '');
          
          return {
            username,
            soulXP: userData.soulXP || 0,
            techLevel: userData.techLevel || 1,
            currentAnimal: userData.currentAnimalCode || 'UNKN',
            gameCount: userData.gameHistory ? userData.gameHistory.length : 0,
            lastActive: userData.gameHistory && userData.gameHistory.length > 0 
              ? new Date(userData.gameHistory[0].timestamp).toISOString()
              : null
          };
        } catch (err) {
          console.log(`解析 ${file} 失敗:`, err.message);
          return null;
        }
      });
      
      const results = await Promise.all(promises);
      users.push(...results.filter(user => user !== null));
    }
    
    users.sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0));
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Key 管理端點
app.post('/api/admin/api-keys', async (req, res) => {
  console.log('🔑 發行新 API Key');
  try {
    const newApiKey = req.body;
    
    // 使用非同步檔案操作
    let config = {};
    if (fs.existsSync(adminConfigFile)) {
      const configData = await fsPromises.readFile(adminConfigFile, 'utf-8');
      config = JSON.parse(configData);
    }
    
    // 確保 apiManagement 結構存在
    if (!config.apiManagement) {
      config.apiManagement = { apiKeys: [] };
    }
    if (!config.apiManagement.apiKeys) {
      config.apiManagement.apiKeys = [];
    }
    
    // 添加新的 API Key
    config.apiManagement.apiKeys.push(newApiKey);
    
    // 使用非同步檔案寫入
    await fsPromises.writeFile(adminConfigFile, JSON.stringify(config, null, 2));
    
    res.json({ success: true, data: newApiKey });
  } catch (error) {
    console.error('發行 API Key 失敗:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/api-keys/:keyId', async (req, res) => {
  console.log('🗑️ 撤銷 API Key:', req.params.keyId);
  try {
    const keyId = req.params.keyId;
    
    // 檢查配置檔案是否存在
    if (!fs.existsSync(adminConfigFile)) {
      return res.status(404).json({ success: false, error: '配置檔不存在' });
    }
    
    // 使用非同步檔案讀取
    const configData = await fsPromises.readFile(adminConfigFile, 'utf-8');
    const config = JSON.parse(configData);
    
    if (!config.apiManagement || !config.apiManagement.apiKeys) {
      return res.status(404).json({ success: false, error: '沒有 API Key 資料' });
    }
    
    // 移除指定的 API Key
    const originalLength = config.apiManagement.apiKeys.length;
    config.apiManagement.apiKeys = config.apiManagement.apiKeys.filter(key => key.id !== keyId);
    
    if (config.apiManagement.apiKeys.length === originalLength) {
      return res.status(404).json({ success: false, error: 'API Key 不存在' });
    }
    
    // 使用非同步檔案寫入
    await fsPromises.writeFile(adminConfigFile, JSON.stringify(config, null, 2));
    
    res.json({ success: true });
  } catch (error) {
    console.error('撤銷 API Key 失敗:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: ['basic', 'soul', 'admin']
  });
});

// 啟動服務器
app.listen(PORT, () => {
  console.log(`🎉 整合服務器成功啟動`);
  console.log(`📍 服務地址: http://localhost:${PORT}`);
  console.log(`🔧 包含服務: 基礎API + 靈魂動物API + 管理API`);
  console.log(`💡 現在只需要啟動這個服務器和 'npm run dev'`);
  console.log(`🚀 VS Code 不再卡頓！`);
});