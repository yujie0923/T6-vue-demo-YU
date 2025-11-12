import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import Papa from 'papaparse';

const app = express();
const PORT = 3000;
const settingsFile = path.resolve('./eyeSettings.json');
const csvFile = path.resolve('./ms_csv.csv'); // CSV 檔路徑
const leaderboardFile = path.resolve('./leaderboard.json'); // 新增排行榜 JSON

app.use(cors());
app.use(express.json());

// --- 眼球設定 API ---
app.get('/get-eye-settings', (req, res) => {
  if(fs.existsSync(settingsFile)) {
    const data = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
    res.json(data);
  } else {
    res.json({ eyeColors: ['#00fff0', '#005f6a', '#001f2a', '#00fff0'] });
  }
});

app.post('/save-eye-settings', (req, res) => {
  const { eyeColors } = req.body;
  if(Array.isArray(eyeColors) && eyeColors.length === 4) {
    fs.writeFileSync(settingsFile, JSON.stringify({ eyeColors }, null, 2));
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// --- CSV 題目 API ---
app.get('/get-quiz', (req, res) => {
  if(fs.existsSync(csvFile)) {
    const csvText = fs.readFileSync(csvFile, 'utf-8');
    const parsed = Papa.parse(csvText, { header: true });
    const data = parsed.data.map(d => ({
      id: Number(d.編號),
      type: d.類型,
      sender: d.傳送者,
      content: d.內容,
      isScam: d['是否詐騙(1詐騙2否)'] === '1',
      answer: d['解析']
    }));
    res.json(data);
  } else {
    res.status(404).json({ error: "CSV file not found" });
  }
});

// --- Leaderboard API ---
app.get('/leaderboard', (req, res) => {
  if (fs.existsSync(leaderboardFile)) {
    const data = JSON.parse(fs.readFileSync(leaderboardFile, 'utf-8'));
    res.json(data);
  } else {
    // 檔案不存在時先建立空陣列檔案
    fs.writeFileSync(leaderboardFile, JSON.stringify([]));
    res.json([]);
  }
});

app.post('/leaderboard', (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ success: false, message: "資料格式錯誤" });
  }

  // 讀取現有排行榜
  let leaderboard = [];
  if (fs.existsSync(leaderboardFile)) {
    leaderboard = JSON.parse(fs.readFileSync(leaderboardFile, 'utf-8'));
  }

  // 新增分數
  leaderboard.push({ name, score });

  // 排序並保留前 20 名
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 20);

  // 寫回 JSON
  fs.writeFileSync(leaderboardFile, JSON.stringify(leaderboard, null, 2));

  res.json({ success: true, leaderboard });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
