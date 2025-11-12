// 靈魂動物系統後端API
import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module 中的 __dirname 替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件設置
app.use(cors());
app.use(express.json());

// 數據存儲目錄
const DATA_DIR = path.join(__dirname, 'soul_data');

// 確保數據目錄存在
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// 獲取用戶數據文件路徑
function getUserDataPath(username) {
  return path.join(DATA_DIR, `${username}_soul.json`);
}

// 讀取用戶靈魂數據
async function loadUserSoulData(username) {
  try {
    const filePath = getUserDataPath(username);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // 用戶首次同步，返回空數據
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

// 保存用戶靈魂數據
async function saveUserSoulData(username, soulData) {
  try {
    const filePath = getUserDataPath(username);
    const dataToSave = {
      ...soulData,
      lastSync: Date.now(),
      version: '1.0'
    };
    
    await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2));
    return true;
  } catch (error) {
    console.error('保存用戶數據失敗:', error);
    return false;
  }
}

// 合併數據的函數
function mergeData(cloudData, clientData) {
  const merged = {
    soulXP: Math.max(cloudData.soulXP || 0, clientData.soulXP || 0),
    techLevel: Math.max(cloudData.techLevel || 1, clientData.techLevel || 1),
    currentAnimalCode: clientData.currentAnimalCode || cloudData.currentAnimalCode,
    gameHistory: mergeGameHistory(cloudData.gameHistory || [], clientData.gameHistory || []),
    lastSync: Date.now()
  };

  return merged;
}

// 合併遊戲歷史
function mergeGameHistory(cloudHistory, clientHistory) {
  const combined = [...cloudHistory, ...clientHistory];
  const uniqueHistory = combined.filter((item, index, arr) => 
    arr.findIndex(i => i.timestamp === item.timestamp && i.messageId === item.messageId) === index
  );
  
  return uniqueHistory
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 1000); // 保留最近1000條記錄
}

// API路由

// 1. 獲取用戶靈魂數據
app.get('/api/soul/get', async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: '缺少用戶名參數' });
    }

    const soulData = await loadUserSoulData(username);
    
    res.json({
      success: true,
      soulData,
      message: '數據獲取成功'
    });
  } catch (error) {
    console.error('獲取用戶數據錯誤:', error);
    res.status(500).json({ error: '服務器內部錯誤' });
  }
});

// 2. 同步用戶靈魂數據
app.post('/api/soul/sync', async (req, res) => {
  try {
    const { username, soulData, clientTimestamp } = req.body;
    
    if (!username || !soulData) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    // 獲取雲端現有數據
    const cloudData = await loadUserSoulData(username);
    
    // 檢查是否需要合併
    const needsMerge = cloudData.lastSync && cloudData.lastSync > (clientTimestamp - 60000); // 1分鐘內
    
    let finalData;
    
    if (needsMerge) {
      // 需要合併數據
      finalData = mergeData(cloudData, soulData);
      console.log(`用戶 ${username} 數據合併完成`);
    } else {
      // 直接使用客戶端數據
      finalData = {
        ...soulData,
        lastSync: Date.now()
      };
      console.log(`用戶 ${username} 數據直接更新`);
    }
    
    // 保存合併後的數據
    const saveSuccess = await saveUserSoulData(username, finalData);
    
    if (!saveSuccess) {
      return res.status(500).json({ error: '數據保存失敗' });
    }
    
    res.json({
      success: true,
      needsMerge,
      cloudData: needsMerge ? finalData : null,
      message: needsMerge ? '數據已合併並同步' : '數據同步成功'
    });
  } catch (error) {
    console.error('同步數據錯誤:', error);
    res.status(500).json({ error: '同步失敗' });
  }
});

// 3. 上傳用戶靈魂數據（強制覆蓋）
app.post('/api/soul/upload', async (req, res) => {
  try {
    const { username, soulData } = req.body;
    
    if (!username || !soulData) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    const saveSuccess = await saveUserSoulData(username, soulData);
    
    if (!saveSuccess) {
      return res.status(500).json({ error: '數據保存失敗' });
    }
    
    res.json({
      success: true,
      message: '數據上傳成功'
    });
  } catch (error) {
    console.error('上傳數據錯誤:', error);
    res.status(500).json({ error: '上傳失敗' });
  }
});

// 4. 獲取所有用戶的靈魂數據統計（管理員功能）
app.get('/api/soul/stats', async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const soulFiles = files.filter(file => file.endsWith('_soul.json'));
    
    const stats = [];
    
    for (const file of soulFiles) {
      try {
        const username = file.replace('_soul.json', '');
        const data = await loadUserSoulData(username);
        
        stats.push({
          username,
          soulXP: data.soulXP || 0,
          techLevel: data.techLevel || 1,
          currentAnimalCode: data.currentAnimalCode,
          gameCount: (data.gameHistory || []).length,
          lastSync: data.lastSync
        });
      } catch (error) {
        console.error(`讀取用戶 ${file} 數據失敗:`, error);
      }
    }
    
    // 按XP排序
    stats.sort((a, b) => b.soulXP - a.soulXP);
    
    res.json({
      success: true,
      stats,
      totalUsers: stats.length
    });
  } catch (error) {
    console.error('獲取統計數據錯誤:', error);
    res.status(500).json({ error: '獲取統計失敗' });
  }
});

// 5. 刪除用戶數據（管理員功能）
app.delete('/api/soul/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const filePath = getUserDataPath(username);
    
    try {
      await fs.unlink(filePath);
      res.json({
        success: true,
        message: `用戶 ${username} 的靈魂數據已刪除`
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({ error: '用戶數據不存在' });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('刪除用戶數據錯誤:', error);
    res.status(500).json({ error: '刪除失敗' });
  }
});

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '靈魂動物系統API運行正常',
    timestamp: new Date().toISOString()
  });
});

// 錯誤處理中間件
app.use((error, req, res, next) => {
  console.error('API錯誤:', error);
  res.status(500).json({
    error: '服務器內部錯誤',
    message: error.message
  });
});

// 404處理
app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.path
  });
});

// 啟動服務器
async function startServer() {
  await ensureDataDir();
  
  app.listen(PORT, () => {
    console.log(`🚀 靈魂動物系統API服務器啟動成功`);
    console.log(`📡 服務地址: http://localhost:${PORT}`);
    console.log(`📁 數據目錄: ${DATA_DIR}`);
    console.log(`🌟 可用接口:`);
    console.log(`   GET  /api/health - 健康檢查`);
    console.log(`   GET  /api/soul/get?username=xxx - 獲取用戶數據`);
    console.log(`   POST /api/soul/sync - 同步用戶數據`);
    console.log(`   POST /api/soul/upload - 上傳用戶數據`);
    console.log(`   GET  /api/soul/stats - 獲取統計數據`);
    console.log(`   DELETE /api/soul/user/:username - 刪除用戶數據`);
  });
}

startServer().catch(console.error);

export default app;