/**
 * ✅ TypeScript 源碼 - Pinia Store 範例
 * 此文件會編譯成 counter.js，請在此編輯而非直接修改 counter.js
 * Compiles to: counter.js
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
