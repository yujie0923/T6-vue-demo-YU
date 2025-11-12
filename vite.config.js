import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
// https://vite.dev/config/
export default defineConfig({
    base: '/T6-vue-demo/',   // <-- 這行加上你的 repo 名稱
    plugins: [
        vue(),
        vueJsx(),
        vueDevTools(),
    ],
    server: {
        host: true, // 加上host,Vite 會自動顯示你在區域網路的 IP
    },
    build: {
        sourcemap: true,
    },
    css: {
        devSourcemap: true,
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
});
