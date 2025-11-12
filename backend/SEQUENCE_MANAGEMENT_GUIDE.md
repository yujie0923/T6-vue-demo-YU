# PostgreSQL 序列管理指南

## 問題說明

在 PostgreSQL 中，當使用 `SERIAL` 類型或序列作為主鍵時，如果使用 `DELETE` 刪除數據，序列值不會自動重置。這會導致：

1. 刪除所有數據後，插入新數據時 ID 不會從 1 開始
2. 序列值可能與實際數據不同步，導致主鍵衝突錯誤

## 根本解決方案

### 方案 1：使用 TRUNCATE（推薦）⭐

`TRUNCATE` 會自動重置序列，這是**最推薦的方法**。

```python
# 清空表並重置序列
cursor.execute("TRUNCATE TABLE table_name RESTART IDENTITY CASCADE")
```

**優點：**
- 自動重置序列
- 性能更好（比 DELETE 快）
- 一行代碼完成

**缺點：**
- 如果有外鍵約束，需要使用 `CASCADE` 或先刪除子表數據

### 方案 2：DELETE + 手動重置序列

如果必須使用 `DELETE`，需要手動重置序列。

```python
# 1. 刪除數據
cursor.execute("DELETE FROM table_name")

# 2. 重置序列
cursor.execute("SELECT setval('table_name_id_seq', 1, false)")
```

**注意：** `false` 表示下次插入時會使用值 1，`true` 表示立即使用值 1。

### 方案 3：使用通用修復工具

使用提供的 `fix_all_sequences.py` 腳本自動修復所有序列。

```bash
# 修復所有表的序列
python fix_all_sequences.py

# 只修復特定表
python fix_all_sequences.py --table users
```

## 工具使用說明

### 1. `clear_game_data.py` - 數據清理工具

清理遊戲相關表並自動重置序列。

```bash
# 交互式清理（需要確認）
python clear_game_data.py

# 跳過確認直接清理
python clear_game_data.py --force

# 使用 DELETE 方法（不推薦，僅兼容）
python clear_game_data.py --delete
```

**功能：**
- 使用 `TRUNCATE` 自動重置序列（推薦）
- 或使用 `DELETE` + 手動重置序列（兼容）
- 顯示清理前後的統計信息

### 2. `fix_all_sequences.py` - 序列修復工具

自動檢測並修復所有表的序列不同步問題。

```bash
# 修復所有表的序列
python fix_all_sequences.py

# 只修復特定表
python fix_all_sequences.py --table users

# 安靜模式（只顯示總結）
python fix_all_sequences.py --quiet
```

**功能：**
- 自動檢測所有使用序列的表
- 自動修復不同步的序列
- 顯示詳細的修復信息

## 最佳實踐

### 1. 數據清理時使用 TRUNCATE

```python
# ✅ 推薦：使用 TRUNCATE
cursor.execute("TRUNCATE TABLE game_rounds RESTART IDENTITY CASCADE")
cursor.execute("TRUNCATE TABLE game_scores RESTART IDENTITY CASCADE")
cursor.execute("TRUNCATE TABLE game_sessions RESTART IDENTITY CASCADE")

# ❌ 不推薦：使用 DELETE（需要手動重置序列）
cursor.execute("DELETE FROM game_rounds")
cursor.execute("SELECT setval('game_rounds_id_seq', 1, false)")
```

### 2. 定期檢查序列同步

在應用啟動時或定期運行序列修復工具：

```python
# 在應用啟動時檢查
from fix_all_sequences import fix_all_sequences

if not fix_all_sequences(verbose=False):
    logger.warning("序列修復失敗，請手動檢查")
```

### 3. 錯誤處理

當插入數據時出現主鍵衝突，自動修復序列：

```python
try:
    user_id = create_user(username, password, email)
except psycopg2.IntegrityError as e:
    if "duplicate key" in str(e) and "pkey" in str(e):
        # 序列不同步，自動修復
        fix_all_sequences(table_name="users")
        # 重試
        user_id = create_user(username, password, email)
    else:
        raise
```

## 常見問題

### Q: 為什麼序列會不同步？

**A:** 可能的原因：
1. 手動插入數據時指定了 ID
2. 使用 `DELETE` 刪除數據後沒有重置序列
3. 從備份恢復數據時序列沒有更新
4. 使用 `COPY` 或其他批量導入工具時序列沒有更新

### Q: TRUNCATE 和 DELETE 的區別？

**A:**
- **TRUNCATE**: 快速清空表，自動重置序列，不能回滾，觸發器不執行
- **DELETE**: 逐行刪除，不重置序列，可以回滾，觸發器執行

### Q: 如何查看序列當前值？

**A:**
```sql
SELECT last_value FROM users_userid_seq;
```

### Q: 如何查看表的最大 ID？

**A:**
```sql
SELECT MAX(userid) FROM users;
```

### Q: 如何手動重置序列？

**A:**
```sql
-- 重置為 1（下次插入使用 1）
SELECT setval('users_userid_seq', 1, false);

-- 重置為當前最大值 + 1（推薦）
SELECT setval('users_userid_seq', (SELECT MAX(userid) FROM users) + 1, false);
```

## 相關表序列名稱

根據 PostgreSQL 的命名規則，序列名稱通常是 `{table_name}_{column_name}_seq`：

- `users.userid` → `users_userid_seq`
- `game_sessions.id` → `game_sessions_id_seq`
- `game_rounds.id` → `game_rounds_id_seq`
- `game_scores.id` → `game_scores_id_seq`

使用 `fix_all_sequences.py` 可以自動檢測所有序列，無需手動指定。
