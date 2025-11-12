declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Could not find a declaration file for module '../GamePage.vue'
// 是 TypeScript 的常見 Vue 專案錯誤。新增這個檔案後，就能解決這個index.ts問題。