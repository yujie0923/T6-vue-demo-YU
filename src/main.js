/**
 * ✅ TypeScript 源碼 - 主要入口文件
 * 此文件會編譯成 main.js，請在此編輯而非直接修改 main.js
 * Compiles to: main.js
 */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
// ✅ 加上全域 CSS
import './assets/main.css';
import './assets/global.css';
const app = createApp(App);
app.use(createPinia());
app.mount('#app');
//# sourceMappingURL=main.js.map