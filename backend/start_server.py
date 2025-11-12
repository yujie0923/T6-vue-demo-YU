#!/usr/bin/env python3
"""
FastAPI 伺服器啟動腳本
"""

import uvicorn
import sys
import os

# 添加當前目錄到 Python 路徑
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("啟動 Scam Detection API 伺服器...")
    print("API 文檔: http://localhost:8000/docs")
    print("ReDoc 文檔: http://localhost:8000/redoc")
    print("健康檢查: http://localhost:8000/health")
    print("=" * 50)
    
    uvicorn.run(
        "app_route:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
