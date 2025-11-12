# Scam Detection API

這是一個基於 FastAPI 的詐騙訊息檢測 API 服務。

## 功能特色

- 🚀 高效能 FastAPI 框架
- 📊 詐騙訊息分析
- 🔍 兩階段分析器
- 🗄️ PostgreSQL 資料庫整合
- 📖 自動生成 API 文檔
- 🌐 CORS 跨域支援

## 快速開始

### 1. 安裝依賴

```bash
pip install -r requirements.txt
```

### 2. 設定資料庫

確保 PostgreSQL 服務正在運行，並且資料庫 `scam_game_db` 已建立。

### 3. 啟動伺服器

```bash
python start_server.py
```

或者直接運行：

```bash
python app_route.py
```

### 4. 訪問 API

- **API 文檔**: http://localhost:8000/docs
- **ReDoc 文檔**: http://localhost:8000/redoc
- **健康檢查**: http://localhost:8000/health

## API 端點

### 健康檢查
- `GET /` - 基本狀態
- `GET /health` - 詳細健康檢查

### 訊息分析
- `POST /analyze` - 單一訊息分析
- `POST /analyze-two-stage` - 兩階段分析
- `POST /analyze-batch` - 批量分析

### 關鍵詞管理
- `GET /keywords/scam` - 獲取詐騙關鍵詞
- `GET /keywords/legitimate` - 獲取合法關鍵詞

## 使用範例

### 使用者註冊

```bash
curl -X POST "http://localhost:8000/register" \
     -H "Content-Type: application/json" \
     -d '{"name": "test_user", "password": "test_password"}'
```

### 使用者登入

```bash
curl -X POST "http://localhost:8000/login" \
     -H "Content-Type: application/json" \
     -d '{"name": "test_user", "password": "test_password"}'
```

### 分析單一訊息

```bash
curl -X POST "http://localhost:8000/analyze" \
     -H "Content-Type: application/json" \
     -d '{"message": "您的帳戶異常，請立即點擊連結驗證"}'
```

### 批量分析

```bash
curl -X POST "http://localhost:8000/analyze-batch" \
     -H "Content-Type: application/json" \
     -d '{"messages": ["訊息1", "訊息2", "訊息3"]}'
```

## 前端整合

在你的 Vue.js 前端中，可以使用以下方式調用 API：

```javascript
// 分析訊息
const analyzeMessage = async (message) => {
  const response = await fetch('http://localhost:8000/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message })
  });
  return await response.json();
};

// 批量分析
const analyzeBatch = async (messages) => {
  const response = await fetch('http://localhost:8000/analyze-batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages })
  });
  return await response.json();
};
```

## 故障排除

### 資料庫連接問題

如果遇到 "Connection refused" 錯誤：

1. 檢查 PostgreSQL 服務是否運行
2. 確認資料庫連接參數正確
3. 檢查防火牆設定

### 端口衝突

如果 8000 端口被占用，可以修改 `app_route.py` 中的端口設定：

```python
uvicorn.run(
    "app_route:app",
    host="0.0.0.0",
    port=8001,  # 更改端口
    reload=True
)
```

## 測試

### 自動測試腳本

運行測試腳本來檢查所有 API 端點：

```bash
python test_api.py
```

運行登入註冊專項測試：

```bash
python test_login_api.py
```

### 手動測試

你也可以使用瀏覽器訪問：
- **API 文檔**: http://localhost:8000/docs
- **健康檢查**: http://localhost:8000/health

## 開發模式

開發模式下，伺服器會自動重載代碼變更。生產環境請使用：

```bash
uvicorn app_route:app --host 0.0.0.0 --port 8000 --workers 4
```
