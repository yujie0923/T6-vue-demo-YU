/// <reference types="vite/client" />

// Vite 環境變數的 TypeScript 定義
interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_APP_MODE?: string
  readonly NODE_ENV: 'development' | 'production' | 'test'
  // 在此添加更多自定義的 VITE_ 前綴環境變數
  // 例如: readonly VITE_APP_VERSION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
