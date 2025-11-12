/**
 * ✅ TypeScript 源碼 - 路由配置文件
 * 此文件會編譯成 index.js，請在此編輯而非直接修改 index.js
 * Compiles to: index.js
 */
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // 根路由：將 '/' 及部署 base 導向分析頁，避免路由未匹配的警告
  { path: '/', redirect: '/analyt' },
  // 若應用部署時有 BASE_URL（例如 /T6-vue-demo/），也把該 base path 導向 /analyt
  { path: import.meta.env.BASE_URL || '/', redirect: '/analyt' },
  // 分析頁面路由 (頭像按鈕會導向此路由)
  { path: '/analyt', component: () => import('../Analyt.vue') },
  // catch-all：任何未匹配路由一律導向 /analyt
  { path: '/:pathMatch(.*)*', redirect: '/analyt' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 全域護衛：若沒有匹配到任何路由，導向 /analyt（避免 No match found 警告）
router.beforeEach((to, from, next) => {
  if (!to.matched || to.matched.length === 0) {
    next({ path: '/analyt' })
  } else {
    next()
  }
})

export default router
