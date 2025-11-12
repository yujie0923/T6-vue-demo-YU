<template>
  <div class="relative w-screen h-screen overflow-hidden bg-black">
    <!-- 1. BackgroundEffect.vue (3D 球 + 粒子) -->
    <BackgroundEffect class="absolute inset-0 z-0" />

    <!-- 2. Matrix lines -->
    <div class="absolute inset-0 z-1 w-screen h-screen">
      <div
        v-for="(bar, i) in matrixBars"
        :key="'bar-' + i"
        :style="{
          left: bar.x + '%',
          animationDelay: bar.delay + 's',
          animationDuration: bar.duration + 's',
          height: bar.height + 'px',
          width: bar.width + 'px'
        }"
        class="absolute top-0 bg-gradient-to-b from-cyan-500/40 via-cyan-500/20 to-transparent animate-matrix-fall"
      ></div>
    </div>

    <!-- 3. Floating SMS Icons -->
    <div class="absolute inset-0 z-5 w-screen h-screen">
      <div
        v-for="(sms, i) in smsIcons"
        :key="'sms-' + i"
        :style="{
          left: sms.x + '%',
          top: sms.y + '%',
          animationDelay: sms.delay + 's',
          animationDuration: sms.duration + 's'
        }"
        class="absolute animate-float opacity-30"
      >
        <MessageSquare :size="sms.size" color="#ffffff" :stroke-width="1.5" />
      </div>
    </div>

    <!-- 4. Back to Home Button -->
    <button
      @click="$emit('back')"
      class="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-gray-800/60 backdrop-blur-md rounded-lg border border-gray-700 hover:border-cyan-400 transition-all duration-300 text-gray-300 hover:text-cyan-400 text-sm font-medium"
    >
      <ArrowLeft :size="16" />
      <span>返回</span>
    </button>

    <!-- 5. Login/Register Form -->
    <div class="relative z-10 flex items-center justify-center w-screen h-screen">
      <div class="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-800 w-full max-w-md mx-4">
        <h2 class="text-2xl font-bold text-white mb-2 text-center">Login to 反詐特務</h2>
        <p class="text-sm text-gray-400 text-center mb-4">存取您的反詐騙管理系統</p>

        <!-- Tabs -->
        <div class="flex gap-2 mb-4">
          <button
            @click="activeTab = 'login'"
            :class="[
              'flex-1 py-2 rounded-lg font-semibold transition-all duration-300 text-sm',
              activeTab === 'login' ? 'bg-cyan-500 text-white' : 'bg-transparent text-gray-400 hover:text-white'
            ]"
          >
            Login
          </button>
          <button
            @click="activeTab = 'register'"
            :class="[
              'flex-1 py-2 rounded-lg font-semibold transition-all duration-300 text-sm',
              activeTab === 'register' ? 'bg-cyan-500 text-white' : 'bg-transparent text-gray-400 hover:text-white'
            ]"
          >
            Register
          </button>
        </div>

        <!-- Login Form -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">帳號名稱</label>
            <input
              v-model="loginForm.username"
              type="text"
              class="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
              placeholder="請輸入帳號名稱"
              required
            />
          </div>
          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="block text-sm font-medium text-gray-300">Password</label>
              <button type="button" class="text-xs text-cyan-400 hover:text-cyan-300">Forgot Password?</button>
            </div>
            <input
              v-model="loginForm.password"
              type="password"
              class="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-cyan-500/50 mt-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">登入中...</span>
            <span v-else>Login</span>
          </button>
        </form>

        <!-- Register Form -->
        <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">帳號名稱</label>
            <input
              v-model="registerForm.name"
              type="text"
              class="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
              placeholder="請輸入帳號名稱"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              v-model="registerForm.email"
              type="email"
              class="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
              placeholder="請輸入電子郵件"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              v-model="registerForm.password"
              type="password"
              class="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
              placeholder="請輸入密碼"
              required
            />
          </div>
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-cyan-500/50 mt-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">註冊中...</span>
            <span v-else>Register</span>
          </button>
        </form>

        <p class="text-center text-xs text-gray-400 mt-4">
          {{ activeTab === 'login' ? "Don't have an account?" : "Already have an account?" }}
          <button
            @click="activeTab = activeTab === 'login' ? 'register' : 'login'"
            class="text-cyan-400 hover:text-cyan-300 font-medium ml-1"
          >
            {{ activeTab === 'login' ? 'Sign up' : 'Login' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { MessageSquare, ArrowLeft } from 'lucide-vue-next'
import BackgroundEffect from './BackgroundEffect.vue'

const emit = defineEmits(['back', 'loginSuccess', 'analytSuccess'])
const activeTab = ref('login')
const isLoading = ref(false)

// Login / Register Forms
const loginForm = ref({ username: '', password: '' })
const registerForm = ref({ name: '', email: '', password: '' })

// 移除本地驗證帳號，改用 API 驗證

// Matrix bars (80 條，更密集)
const matrixBars = ref([])
for (let i = 0; i < 80; i++) {
  matrixBars.value.push({
    x: Math.random() * 100,
    height: 100 + Math.random() * 300,
    width: 2 + Math.random() * 4,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 3
  })
}

// Floating SMS icons
const smsIcons = ref([])
for (let i = 0; i < 15; i++) {
  smsIcons.value.push({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 20 + Math.random() * 24,
    delay: Math.random() * 5,
    duration: 12 + Math.random() * 8
  })
}

// Login handler
const handleLogin = async () => {
  const { username, password } = loginForm.value
  
  if (!username || !password) {
    alert('請填寫完整的登入資訊！')
    return
  }

  isLoading.value = true
  
  try {
    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })

    // 檢查響應狀態
    if (!response.ok) {
      throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`)
    }

    // 解析 JSON
    let data
    try {
      data = await response.json()
    } catch (jsonError) {
      console.error('JSON 解析失敗:', jsonError)
      throw new Error('後端返回的響應格式不正確')
    }

    if (data.success) {
      // 登入成功，統一 emit loginSuccess，包含 role 字段
      emit('loginSuccess', { 
        username, 
        user_id: data.data.user_id,
        role: data.data.role || null,  // 從後端獲取 role，如果沒有則為 null
        quiz_status: data.data.quiz_status ?? null
      })
    } else {
      alert(`登入失敗：${data.error || data.message || '請檢查帳號密碼'}`)
    }
  } catch (error) {
    console.error('登入請求失敗:', error)
    // 只有在真正的網路錯誤時才顯示網路錯誤訊息
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED') || error.message.includes('fetch'))) {
      alert('無法連接到後端服務器！\n\n請確認：\n1. 後端服務器已啟動\n2. 運行命令：cd T6-vue-demo/backend && python start_server.py\n3. 服務器應該在 http://localhost:8000 運行\n\n然後重新嘗試登入。')
    } else {
      // 其他錯誤（如 JSON 解析錯誤、HTTP 錯誤等）不顯示網路錯誤訊息
      console.error('登入錯誤詳情:', error)
      // 不顯示 alert，因為可能是其他類型的錯誤，避免誤導用戶
    }
  } finally {
    isLoading.value = false
  }
}

// Register handler
const handleRegister = async () => {
  const { name, email, password } = registerForm.value
  
  if (!name || !password) {
    alert('請填寫使用者名稱和密碼！')
    return
  }

  isLoading.value = true

  try {
    const response = await fetch('http://localhost:8000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: name,
        password: password,
        email: email || `${name}@example.com`
      })
    })

    // 檢查響應狀態
    if (!response.ok) {
      throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`)
    }

    // 解析 JSON
    let data
    try {
      data = await response.json()
    } catch (jsonError) {
      console.error('JSON 解析失敗:', jsonError)
      throw new Error('後端返回的響應格式不正確')
    }

    if (data.success) {
      // 註冊成功，自動登入
      alert(`註冊成功！歡迎 ${name}`)
      emit('loginSuccess', { 
        username: name, 
        user_id: data.data.user_id,
        quiz_status: null,
        role: null
      })
    } else {
      alert(`註冊失敗：${data.error || data.message || '請稍後再試'}`)
    }
  } catch (error) {
    console.error('註冊請求失敗:', error)
    // 只有在真正的網路錯誤時才顯示網路錯誤訊息
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED') || error.message.includes('fetch'))) {
      alert('無法連接到後端服務器！\n\n請確認：\n1. 後端服務器已啟動\n2. 運行命令：cd T6-vue-demo/backend && python start_server.py\n3. 服務器應該在 http://localhost:8000 運行\n\n然後重新嘗試註冊。')
    } else {
      // 其他錯誤（如 JSON 解析錯誤、HTTP 錯誤等）不顯示網路錯誤訊息
      console.error('註冊錯誤詳情:', error)
      // 不顯示 alert，因為可能是其他類型的錯誤，避免誤導用戶
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@keyframes matrix-fall {
  0% { transform: translateY(-100%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}

@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
  25% { transform: translateY(-25px) translateX(12px) rotate(3deg); }
  50% { transform: translateY(-12px) translateX(-12px) rotate(-3deg); }
  75% { transform: translateY(-35px) translateX(8px) rotate(2deg); }
}

.animate-matrix-fall { animation: matrix-fall linear infinite; }
.animate-float { animation: float linear infinite; }
</style>
