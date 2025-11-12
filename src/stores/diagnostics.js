/**
 * 畫面空白問題診斷腳本
 * 
 * 使用方法：
 * 1. 打開瀏覽器開發者工具 (F12)
 * 2. 切換到 Console 標籤
 * 3. 複製以下代碼並貼上執行
 */

(function() {
console.log('🔍 === 畫面空白診斷開始 === 🔍');

// 1. 檢查Vue應用是否正常載入
console.log('1. 檢查Vue應用狀態:');
if (typeof window.Vue !== 'undefined') {
  console.log('✅ Vue已載入');
} else {
  console.log('❌ Vue未載入');
}

// 2. 檢查主要元素是否存在
console.log('2. 檢查DOM元素:');
const app = document.getElementById('app');
if (app) {
  console.log('✅ #app元素存在');
  console.log('   內容長度:', app.innerHTML.length);
  console.log('   子元素數量:', app.children.length);
} else {
  console.log('❌ #app元素不存在');
}

// 3. 檢查錯誤訊息
console.log('3. 檢查控制台錯誤:');
console.log('   請查看上方是否有紅色錯誤訊息');

// 4. 檢查網路請求
console.log('4. 檢查網路狀態:');
fetch('/T6-vue-demo/')
  .then(response => {
    if (response.ok) {
      console.log('✅ 主頁面請求正常');
    } else {
      console.log('❌ 主頁面請求失敗:', response.status);
    }
  })
  .catch(error => {
    console.log('❌ 網路請求錯誤:', error);
  });

// 5. 檢查Vue Router
console.log('5. 檢查Vue Router:');
setTimeout(() => {
  const routerView = document.querySelector('router-view');
  if (routerView) {
    console.log('✅ Vue Router已載入');
  } else {
    console.log('⚠️ Vue Router可能未正確載入');
  }
}, 1000);

// 6. 檢查CSS載入
console.log('6. 檢查CSS載入:');
const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
console.log('   載入的CSS文件數量:', stylesheets.length);
stylesheets.forEach((sheet, index) => {
  console.log(`   CSS ${index + 1}:`, sheet.href);
});

// 7. 檢查JavaScript載入
console.log('7. 檢查JavaScript載入:');
const scripts = document.querySelectorAll('script');
console.log('   載入的JS文件數量:', scripts.length);

// 8. 提供修復建議
console.log('🔧 === 修復建議 === 🔧');
console.log('如果畫面仍然空白，請嘗試:');
console.log('1. 重新整理頁面 (Ctrl+F5 或 Cmd+Shift+R)');
console.log('2. 清除瀏覽器快取');
console.log('3. 檢查是否有JavaScript錯誤（紅色錯誤訊息）');
console.log('4. 確認開發伺服器正在運行 (http://localhost:5173)');
console.log('5. 檢查網路連線');

// 9. 自動重載檢測
console.log('9. 自動問題檢測:');
let issuesFound = [];

if (!app || app.children.length === 0) {
  issuesFound.push('DOM元素為空');
}

if (issuesFound.length > 0) {
  console.log('❌ 發現問題:', issuesFound.join(', '));
  console.log('💡 建議: 請重新啟動開發伺服器並重新整理頁面');
} else {
  console.log('✅ 基本檢查通過，應用應該正常顯示');
}

console.log('🔍 === 診斷完成 === 🔍');

})(); // 立即執行函數結束

// 使用說明：
// 複製上方 (function() { ... })(); 之間的所有代碼
// 貼到瀏覽器控制台執行