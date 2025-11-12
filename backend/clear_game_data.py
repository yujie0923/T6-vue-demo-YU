#!/usr/bin/env python3
"""
清理遊戲資料腳本
刪除 game_rounds、game_scores 和 game_sessions 表的所有資料
並自動重置所有相關序列

使用方法:
    python clear_game_data.py
    python clear_game_data.py --force  # 跳過確認
"""

from db_service import get_db_connection
import sys

def get_table_count(cursor, table_name):
    """獲取表的記錄數量"""
    try:
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        return cursor.fetchone()[0]
    except Exception as e:
        print(f"❌ 查詢 {table_name} 記錄數失敗: {e}")
        return 0

def reset_table_sequences(cursor, table_name):
    """重置表的序列"""
    try:
        # 查找該表的所有序列
        cursor.execute("""
            SELECT 
                a.attname as column_name,
                pg_get_serial_sequence(n.nspname||'.'||c.relname, a.attname) as sequence_name
            FROM pg_attribute a
            JOIN pg_class c ON a.attrelid = c.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE c.relname = %s
            AND a.attnum > 0
            AND NOT a.attisdropped
            AND pg_get_serial_sequence(n.nspname||'.'||c.relname, a.attname) IS NOT NULL
        """, (table_name,))
        
        sequences = cursor.fetchall()
        
        for column_name, sequence_name in sequences:
            if sequence_name:
                # 重置序列為 1
                cursor.execute(f"SELECT setval('{sequence_name}', 1, false)")
                print(f"     ✅ 重置序列 {sequence_name} → 1")
        
        return True
    except Exception as e:
        print(f"     ⚠️  重置序列失敗: {e}")
        return False

def clear_game_data(confirm=True, use_truncate=True):
    """清理遊戲資料
    
    Args:
        confirm: 是否需要確認（默認為 True）
        use_truncate: 是否使用 TRUNCATE（自動重置序列）或 DELETE + 手動重置序列
    """
    conn = get_db_connection()
    if conn is None:
        print("❌ 無法連接到資料庫")
        return False
    
    try:
        cursor = conn.cursor()
        
        # 顯示刪除前的資料統計
        print("\n" + "="*60)
        print("📊 刪除前的資料統計:")
        print("="*60)
        
        rounds_count = get_table_count(cursor, "game_rounds")
        scores_count = get_table_count(cursor, "game_scores")
        sessions_count = get_table_count(cursor, "game_sessions")
        
        print(f"  game_rounds:    {rounds_count:>6} 筆記錄")
        print(f"  game_scores:    {scores_count:>6} 筆記錄")
        print(f"  game_sessions:  {sessions_count:>6} 筆記錄")
        print("="*60)
        
        total_count = rounds_count + scores_count + sessions_count
        
        if total_count == 0:
            print("\n✅ 所有表都是空的，無需刪除")
            return True
        
        # 安全確認
        if confirm:
            print(f"\n⚠️  即將刪除共 {total_count} 筆記錄")
            if use_truncate:
                print("   使用 TRUNCATE（會自動重置序列）")
            else:
                print("   使用 DELETE（會手動重置序列）")
            print("   此操作無法復原！")
            response = input("\n確定要刪除嗎？(輸入 'YES' 確認): ")
            
            if response != 'YES':
                print("\n❌ 操作已取消")
                return False
        
        print("\n🔄 開始清理資料...")
        
        if use_truncate:
            # 使用 TRUNCATE（推薦方法，自動重置序列）
            # 按照外鍵依賴順序刪除
            print("  1. TRUNCATE game_rounds...")
            cursor.execute("TRUNCATE TABLE game_rounds RESTART IDENTITY CASCADE")
            print(f"     ✅ 已清空 game_rounds（序列已自動重置）")
            
            print("  2. TRUNCATE game_scores...")
            cursor.execute("TRUNCATE TABLE game_scores RESTART IDENTITY CASCADE")
            print(f"     ✅ 已清空 game_scores（序列已自動重置）")
            
            print("  3. TRUNCATE game_sessions...")
            cursor.execute("TRUNCATE TABLE game_sessions RESTART IDENTITY CASCADE")
            print(f"     ✅ 已清空 game_sessions（序列已自動重置）")
        else:
            # 使用 DELETE + 手動重置序列（兼容方法）
            print("  1. DELETE game_rounds...")
            cursor.execute("DELETE FROM game_rounds")
            deleted_rounds = cursor.rowcount
            print(f"     ✅ 已刪除 {deleted_rounds} 筆記錄")
            reset_table_sequences(cursor, "game_rounds")
            
            print("  2. DELETE game_scores...")
            cursor.execute("DELETE FROM game_scores")
            deleted_scores = cursor.rowcount
            print(f"     ✅ 已刪除 {deleted_scores} 筆記錄")
            reset_table_sequences(cursor, "game_scores")
            
            print("  3. DELETE game_sessions...")
            cursor.execute("DELETE FROM game_sessions")
            deleted_sessions = cursor.rowcount
            print(f"     ✅ 已刪除 {deleted_sessions} 筆記錄")
            reset_table_sequences(cursor, "game_sessions")
        
        # 提交事務
        conn.commit()
        
        # 顯示刪除後的統計
        print("\n" + "="*60)
        print("📊 刪除後的資料統計:")
        print("="*60)
        print(f"  game_rounds:    {get_table_count(cursor, 'game_rounds'):>6} 筆記錄")
        print(f"  game_scores:    {get_table_count(cursor, 'game_scores'):>6} 筆記錄")
        print(f"  game_sessions:  {get_table_count(cursor, 'game_sessions'):>6} 筆記錄")
        print("="*60)
        
        print(f"\n✅ 清理完成！")
        print("   ✅ 所有數據已刪除")
        print("   ✅ 所有序列已重置為 1")
        return True
        
    except Exception as e:
        print(f"\n❌ 清理資料失敗: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🧹 遊戲資料清理工具")
    print("="*60)
    
    # 檢查是否有 --force 參數（跳過確認）
    force = '--force' in sys.argv or '-f' in sys.argv
    
    # 檢查是否使用 DELETE 方法（不推薦，但兼容）
    use_delete = '--delete' in sys.argv
    
    success = clear_game_data(confirm=not force, use_truncate=not use_delete)
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)
