<template>
  <div class="min-h-screen w-screen transition-all duration-500 overflow-x-hidden flex" :class="currentThemeStyles.main">
    <!-- 通知組件 -->
    <div 
      v-if="notification.show"
      :class="[
        'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border-l-4 flex items-center gap-3 min-w-80 transition-all duration-300',
        notification.type === 'success' ? 'bg-green-900 border-green-400 text-green-100' : '',
        notification.type === 'info' ? 'bg-blue-900 border-blue-400 text-blue-100' : '',
        notification.type === 'warning' ? 'bg-yellow-900 border-yellow-400 text-yellow-100' : '',
        notification.type === 'error' ? 'bg-red-900 border-red-400 text-red-100' : ''
      ]"
    >
      <div :class="[
        'w-2 h-2 rounded-full',
        notification.type === 'success' ? 'bg-green-400' : '',
        notification.type === 'info' ? 'bg-blue-400' : '',
        notification.type === 'warning' ? 'bg-yellow-400' : '',
        notification.type === 'error' ? 'bg-red-400' : ''
      ]"></div>
      <span class="flex-1">{{ notification.message }}</span>
      <button 
        @click="notification.show = false"
        class="text-gray-400 hover:text-white transition-colors"
      >
        ✕
      </button>
    </div>

    <!-- Sidebar -->
    <div class="w-64 h-screen border-r p-4 transition-all duration-500 z-30 flex-shrink-0 flex flex-col" :class="[currentThemeStyles.sidebar, currentThemeStyles.sidebarBorder]">
      <div class="mb-8">
        <h1 class="text-2xl font-bold transition-colors duration-300" :class="currentThemeStyles.text">防詐特務員</h1>
        <p class="text-sm transition-colors duration-300" :class="currentThemeStyles.textSecondary">後台管理</p>
      </div>

      <nav class="space-y-2 flex-1">
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="activeMenu = item.id"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300',
            activeMenu === item.id ? [currentThemeStyles.activeButton, currentThemeStyles.text] : [currentThemeStyles.textSecondary, currentThemeStyles.cardHover]
          ]"
        >
          <component :is="item.icon" :size="20" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <button
        @click="$emit('back')"
        class="mt-auto mx-4 mb-4 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 border border-red-400"
      >
        <!-- 背景動畫效果 -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        
        <!-- 按鈕內容 -->
        <div class="relative flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="font-semibold">登出</span>
        </div>
      </button>
    </div>

    <!-- Main Content -->
    <div class="flex-1 p-8 min-h-screen transition-all duration-500 overflow-y-auto" :class="currentThemeStyles.main">
      <!-- Dashboard -->
      <div v-if="activeMenu === 'dashboard'">
        <h2 :class="['text-3xl font-bold mb-6 transition-colors duration-300', currentThemeStyles.text]">數據分析</h2>
        <div class="grid md:grid-cols-5 gap-6 mb-8">
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <div class="flex items-center justify-between mb-2">
              <span :class="['transition-colors duration-300', currentThemeStyles.textSecondary]">總用戶數</span>
              <Users :size="20" class="text-blue-500" />
            </div>
            <p :class="['text-3xl font-bold transition-colors duration-300', currentThemeStyles.text]">
              {{ dashboardStats.loading ? '載入中...' : dashboardStats.totalUsers }}
            </p>
            <p class="text-sm text-green-500 mt-2">↑ 真實註冊</p>
          </div>
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <div class="flex items-center justify-between mb-2">
              <span :class="['transition-colors duration-300', currentThemeStyles.textSecondary]">檢測次數</span>
              <Activity :size="20" class="text-purple-500" />
            </div>
            <p :class="['text-3xl font-bold transition-colors duration-300', currentThemeStyles.text]">
              {{ dashboardStats.loading ? '載入中...' : dashboardStats.totalQueries.toLocaleString() }}
            </p>
            <p class="text-sm text-green-500 mt-2">↑ 累積遊戲</p>
          </div>
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <div class="flex items-center justify-between mb-2">
              <span :class="['transition-colors duration-300', currentThemeStyles.textSecondary]">平均經驗</span>
              <Shield :size="20" class="text-green-500" />
            </div>
            <p :class="['text-3xl font-bold transition-colors duration-300', currentThemeStyles.text]">
              {{ dashboardStats.loading ? '載入中...' : dashboardStats.avgXP }}
            </p>
            <p class="text-sm text-green-500 mt-2">↑ 靈魂XP</p>
          </div>
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <div class="flex items-center justify-between mb-2">
              <span :class="['transition-colors duration-300', currentThemeStyles.textSecondary]">最高等級</span>
              <TrendingUp :size="20" class="text-yellow-500" />
            </div>
            <p :class="['text-3xl font-bold transition-colors duration-300', currentThemeStyles.text]">
              {{ dashboardStats.loading ? '載入中...' : `Lv.${dashboardStats.maxTechLevel}` }}
            </p>
            <p class="text-sm text-green-500 mt-2">↑ 技術等級</p>
          </div>
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <div class="flex items-center justify-between mb-2">
              <span :class="['transition-colors duration-300', currentThemeStyles.textSecondary]">今日活躍</span>
              <BarChart3 :size="20" class="text-cyan-500" />
            </div>
            <p :class="['text-3xl font-bold transition-colors duration-300', currentThemeStyles.text]">
              {{ dashboardStats.loading ? '載入中...' : dashboardStats.activeToday }}
            </p>
            <p class="text-sm text-green-500 mt-2">↑ 今日遊戲</p>
          </div>
        </div>
      </div>

      <!-- SMS Database -->
      <div v-if="activeMenu === 'sms'">
        <h2 :class="['text-3xl font-bold mb-6 transition-colors duration-300', currentThemeStyles.text]">簡訊資料庫管理</h2>
        <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
          <div class="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="搜尋簡訊..."
              :class="['px-4 py-2 rounded-lg w-96 transition-all duration-300', currentThemeStyles.input]"
            />
            <button :class="['px-4 py-2 rounded-lg transition-all duration-300', currentThemeStyles.activeButton, currentThemeStyles.text]">
              新增簡訊
            </button>
          </div>
          <div class="space-y-2">
            <div v-for="i in 5" :key="i" :class="['p-4 rounded-lg flex justify-between items-center transition-all duration-300', currentThemeStyles.card]">
              <div>
                <p :class="['font-semibold transition-colors duration-300', currentThemeStyles.text]">簡訊 #{{ i }}</p>
                <p :class="['text-sm transition-colors duration-300', currentThemeStyles.textSecondary]">詐騙機率: {{ Math.floor(Math.random() * 100) }}%</p>
              </div>
              <div class="flex gap-2">
                <button class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">編輯</button>
                <button class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">刪除</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Members Management -->
      <div v-if="activeMenu === 'members'">
        <h2 :class="['text-3xl font-bold mb-6 transition-colors duration-300', currentThemeStyles.text]">會員管理</h2>
        
        <!-- 會員統計卡片 -->
        <div class="grid md:grid-cols-4 gap-6 mb-8">
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <div class="flex items-center justify-between mb-2">
              <span :class="['transition-colors duration-300', currentThemeStyles.textSecondary]">總會員數</span>
              <Users :size="20" class="text-blue-500" />
            </div>
            <p :class="['text-3xl font-bold transition-colors duration-300', currentThemeStyles.text]">{{ members.length }}</p>
            <p class="text-sm text-green-500 mt-2">活躍會員</p>
          </div>
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <div class="flex items-center justify-between mb-2">
              <span :class="['transition-colors duration-300', currentThemeStyles.textSecondary]">管理員</span>
              <Shield :size="20" class="text-purple-500" />
            </div>
            <p :class="['text-3xl font-bold transition-colors duration-300', currentThemeStyles.text]">{{ members.filter(m => m.type === 'admin').length }}</p>
            <p class="text-sm text-blue-500 mt-2">系統管理</p>
          </div>
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <div class="flex items-center justify-between mb-2">
              <span :class="['transition-colors duration-300', currentThemeStyles.textSecondary]">分析師</span>
              <Activity :size="20" class="text-green-500" />
            </div>
            <p :class="['text-3xl font-bold transition-colors duration-300', currentThemeStyles.text]">{{ members.filter(m => m.type === 'analyt').length }}</p>
            <p class="text-sm text-green-500 mt-2">數據分析</p>
          </div>
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <div class="flex items-center justify-between mb-2">
              <span :class="['transition-colors duration-300', currentThemeStyles.textSecondary]">一般用戶</span>
              <Users :size="20" class="text-yellow-500" />
            </div>
            <p :class="['text-3xl font-bold transition-colors duration-300', currentThemeStyles.text]">{{ members.filter(m => m.type === 'user').length }}</p>
            <p class="text-sm text-yellow-500 mt-2">註冊用戶</p>
          </div>
        </div>

        <!-- 會員列表 -->
        <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
          <div class="flex justify-between items-center mb-6">
            <h3 :class="['text-xl font-semibold transition-colors duration-300', currentThemeStyles.text]">會員列表</h3>
            <div class="flex gap-3">
              <input
                type="text"
                placeholder="搜尋會員..."
                :class="['px-4 py-2 rounded-lg w-64 transition-all duration-300', currentThemeStyles.input]"
              />
              <button :class="['px-4 py-2 rounded-lg transition-all duration-300', currentThemeStyles.activeButton, currentThemeStyles.text]">
                新增會員
              </button>
            </div>
          </div>

          <!-- 會員表格 -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr :class="['border-b transition-colors duration-300', currentTheme === 'light' ? 'border-gray-200' : 'border-gray-700']">
                  <th :class="['text-left py-3 px-4 font-medium transition-colors duration-300', currentThemeStyles.textSecondary]">ID</th>
                  <th :class="['text-left py-3 px-4 font-medium transition-colors duration-300', currentThemeStyles.textSecondary]">帳號名稱</th>
                  <th :class="['text-left py-3 px-4 font-medium transition-colors duration-300', currentThemeStyles.textSecondary]">電子郵件</th>
                  <th :class="['text-left py-3 px-4 font-medium transition-colors duration-300', currentThemeStyles.textSecondary]">類型</th>
                  <th :class="['text-left py-3 px-4 font-medium transition-colors duration-300', currentThemeStyles.textSecondary]">狀態</th>
                  <th :class="['text-left py-3 px-4 font-medium transition-colors duration-300', currentThemeStyles.textSecondary]">註冊時間</th>
                  <th :class="['text-left py-3 px-4 font-medium transition-colors duration-300', currentThemeStyles.textSecondary]">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="member in members" 
                  :key="member.id" 
                  :class="['border-b transition-colors duration-300 hover:bg-opacity-50', 
                          currentTheme === 'light' ? 'border-gray-100 hover:bg-gray-100' : 'border-gray-800 hover:bg-gray-800']"
                >
                  <td :class="['py-3 px-4 transition-colors duration-300', currentThemeStyles.text]">{{ member.id }}</td>
                  <td :class="['py-3 px-4 font-medium transition-colors duration-300', currentThemeStyles.text]">{{ member.username }}</td>
                  <td :class="['py-3 px-4 transition-colors duration-300', currentThemeStyles.textSecondary]">{{ member.email }}</td>
                  <td class="py-3 px-4">
                    <span :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      member.type === 'admin' ? 'bg-purple-100 text-purple-800' :
                      member.type === 'analyt' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    ]">
                      {{ getMemberTypeLabel(member.type) }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <span :class="['text-sm font-medium', getStatusColor(member.status)]">
                      {{ member.status === 'active' ? '活躍' : member.status === 'inactive' ? '未活躍' : '停權' }}
                    </span>
                  </td>
                  <td :class="['py-3 px-4 text-sm transition-colors duration-300', currentThemeStyles.textSecondary]">
                    {{ formatDate(member.registeredAt) }}
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex gap-2">
                      <button 
                        @click="editMember(member)"
                        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                      >
                        編輯
                      </button>
                      <button 
                        @click="updateMemberStatus(member.id, member.status === 'active' ? 'inactive' : 'active')"
                        :class="[
                          'px-3 py-1 text-xs rounded transition-colors',
                          member.status === 'active' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                        ]"
                      >
                        {{ member.status === 'active' ? '停用' : '啟用' }}
                      </button>
                      <button 
                        @click="deleteMember(member.id)"
                        class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <!-- 空狀態 -->
            <div v-if="members.length === 0" class="text-center py-12">
              <Users :size="48" :class="['mx-auto mb-4 transition-colors duration-300', currentThemeStyles.textSecondary]" />
              <p :class="['text-lg font-medium transition-colors duration-300', currentThemeStyles.text]">尚無會員資料</p>
              <p :class="['text-sm transition-colors duration-300', currentThemeStyles.textSecondary]">等待用戶註冊或手動新增會員</p>
            </div>
          </div>
        </div>
      </div>

      <!-- API Settings -->
      <div v-if="activeMenu === 'api'">
        <h2 :class="['text-3xl font-bold mb-6 transition-colors duration-300', currentThemeStyles.text]">API 管理</h2>
        <div class="space-y-6">
          <!-- Token 配額與用量 -->
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <h3 :class="['text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-300', currentThemeStyles.text]">
              <Activity :size="24" class="text-blue-500" />
              Token 配額與用量
            </h3>
            <div class="grid md:grid-cols-3 gap-6">
              <!-- 全站統計 -->
              <div :class="['p-4 rounded-lg border transition-all duration-300', currentThemeStyles.card]">
                <h4 :class="['font-medium mb-3 transition-colors duration-300', currentThemeStyles.text]">全站統計</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">今日用量:</span>
                    <span :class="currentThemeStyles.text">
                      {{ apiConfig.loading ? '載入中...' : `${apiConfig.apiManagement?.tokenQuota?.used || 0} tokens` }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">每日配額:</span>
                    <span :class="currentThemeStyles.text">
                      {{ apiConfig.loading ? '載入中...' : `${apiConfig.apiManagement?.tokenQuota?.daily || 0} tokens` }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">剩餘:</span>
                    <span class="text-green-500">
                      {{ apiConfig.loading ? '載入中...' : `${(apiConfig.apiManagement?.tokenQuota?.daily || 0) - (apiConfig.apiManagement?.tokenQuota?.used || 0)} tokens` }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- 用戶用量排行 -->
              <div :class="['p-4 rounded-lg border transition-all duration-300', currentThemeStyles.card]">
                <h4 :class="['font-medium mb-3 transition-colors duration-300', currentThemeStyles.text]">用量排行 TOP5</h4>
                <div class="space-y-2 text-sm">
                  <div v-if="isDataLoading" :class="currentThemeStyles.textSecondary">載入中...</div>
                  <div v-else-if="usersData.length === 0" :class="currentThemeStyles.textSecondary">暫無資料</div>
                  <div v-else v-for="user in usersData.slice(0, 5)" :key="user.username" class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">{{ user.username }}:</span>
                    <span :class="currentThemeStyles.text">{{ user.gameCount }} 次遊戲</span>
                  </div>
                </div>
              </div>
              
              <!-- API Key 統計 -->
              <div :class="['p-4 rounded-lg border transition-all duration-300', currentThemeStyles.card]">
                <h4 :class="['font-medium mb-3 transition-colors duration-300', currentThemeStyles.text]">API Key 統計</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">活躍 Keys:</span>
                    <span :class="currentThemeStyles.text">
                      {{ apiConfig.loading ? '載入中...' : `${apiConfig.apiManagement?.apiKeys?.filter(k => k.status === 'active').length || 0}/${apiConfig.apiManagement?.apiKeys?.length || 0}` }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">今日請求:</span>
                    <span :class="currentThemeStyles.text">{{ dashboardStats.totalQueries.toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">成功率:</span>
                    <span class="text-green-500">99.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- API Key 管理 -->
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <div class="flex justify-between items-center mb-4">
              <h3 :class="['text-xl font-semibold flex items-center gap-2 transition-colors duration-300', currentThemeStyles.text]">
                <Shield :size="24" class="text-green-500" />
                API Key 管理
              </h3>
              <button 
                @click="generateNewApiKey"
                :class="['px-4 py-2 rounded-lg transition-all duration-300', currentThemeStyles.activeButton, currentThemeStyles.text]"
              >
                新增 Key
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr :class="['border-b transition-colors duration-300', currentTheme === 'light' ? 'border-gray-200' : 'border-gray-700']">
                    <th :class="['text-left py-3 px-4 font-medium transition-colors duration-300', currentThemeStyles.textSecondary]">Key ID</th>
                    <th :class="['text-left py-3 px-4 font-medium transition-colors duration-300', currentThemeStyles.textSecondary]">名稱</th>
                    <th :class="['text-left py-3 px-4 font-medium transition-colors duration-300', currentThemeStyles.textSecondary]">權限</th>
                    <th :class="['text-left py-3 px-4 font-medium transition-colors duration-300', currentThemeStyles.textSecondary]">到期日</th>
                    <th :class="['text-left py-3 px-4 font-medium transition-colors duration-300', currentThemeStyles.textSecondary]">狀態</th>
                    <th :class="['text-left py-3 px-4 font-medium transition-colors duration-300', currentThemeStyles.textSecondary]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="apiConfig.loading">
                    <td colspan="6" class="py-6 text-center">
                      <span :class="currentThemeStyles.textSecondary">載入 API Key 資料中...</span>
                    </td>
                  </tr>
                  <tr v-else-if="!apiConfig.apiManagement?.apiKeys?.length">
                    <td colspan="6" class="py-6 text-center">
                      <span :class="currentThemeStyles.textSecondary">暫無 API Key</span>
                    </td>
                  </tr>
                  <tr 
                    v-else
                    v-for="apiKey in apiConfig.apiManagement.apiKeys" 
                    :key="apiKey.id"
                    :class="['border-b transition-colors duration-300 hover:bg-opacity-50', currentTheme === 'light' ? 'border-gray-100 hover:bg-gray-100' : 'border-gray-800 hover:bg-gray-800']"
                  >
                    <td :class="['py-3 px-4 font-mono text-xs transition-colors duration-300', currentThemeStyles.text]">
                      {{ apiKey.id }}
                    </td>
                    <td :class="['py-3 px-4 transition-colors duration-300', currentThemeStyles.text]">
                      {{ apiKey.name }}
                    </td>
                    <td>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Full Access
                      </span>
                    </td>
                    <td :class="['py-3 px-4 text-sm transition-colors duration-300', currentThemeStyles.textSecondary]">
                      {{ apiKey.created }}
                    </td>
                    <td>
                      <span 
                        :class="[
                          'text-sm font-medium',
                          apiKey.status === 'active' ? 'text-green-500' : 
                          apiKey.status === 'standby' ? 'text-yellow-500' : 'text-red-500'
                        ]"
                      >
                        {{ apiKey.status === 'active' ? '活躍' : apiKey.status === 'standby' ? '待機' : '停用' }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <div class="flex gap-2">
                        <button class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">編輯</button>
                        <button 
                          @click="revokeApiKey(apiKey.id)"
                          class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                        >
                          撤銷
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Rate Limit 設定 -->
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <h3 :class="['text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-300', currentThemeStyles.text]">
              <TrendingUp :size="24" class="text-yellow-500" />
              Rate Limit 設定
            </h3>
            <div class="grid md:grid-cols-3 gap-6">
              <!-- 全局限制：系統保護 -->
              <div :class="['p-4 rounded-lg border transition-all duration-300', currentThemeStyles.card]">
                <h4 :class="['font-medium mb-3 text-blue-400 transition-colors duration-300']">🛡️ 系統保護限制</h4>
                <p :class="['text-xs mb-3 transition-colors duration-300', currentThemeStyles.textSecondary]">防止 DDoS 攻擊和系統過載</p>
                <div class="space-y-3">
                  <div>
                    <label :class="['block text-xs transition-colors duration-300', currentThemeStyles.textSecondary]">全域限制 (每分鐘)</label>
                    <input 
                      type="number" 
                      :value="apiConfig.loading ? '' : (apiConfig.apiManagement?.rateLimits?.systemProtection?.globalLimit || 1000)"
                      :class="['w-full px-3 py-2 rounded transition-all duration-300', currentThemeStyles.input]" 
                      :placeholder="apiConfig.loading ? '載入中...' : '1000'"
                    />
                    <span :class="['text-xs transition-colors duration-300', currentThemeStyles.textSecondary]">防止瞬間攻擊</span>
                  </div>
                  <div>
                    <label :class="['block text-xs transition-colors duration-300', currentThemeStyles.textSecondary]">說明</label>
                    <p :class="['text-xs transition-colors duration-300', currentThemeStyles.textSecondary]">
                      {{ apiConfig.loading ? '載入中...' : (apiConfig.apiManagement?.rateLimits?.systemProtection?.description || '防止系統過載') }}
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Per-Key 限制：成本控制 -->
              <div :class="['p-4 rounded-lg border transition-all duration-300', currentThemeStyles.card]">
                <h4 :class="['font-medium mb-3 text-green-400 transition-colors duration-300']">💰 API Key 成本控制</h4>
                <p :class="['text-xs mb-3 transition-colors duration-300', currentThemeStyles.textSecondary]">控制 AI 模型使用成本</p>
                <div class="space-y-3">
                  <div>
                    <label :class="['block text-xs transition-colors duration-300', currentThemeStyles.textSecondary]">每分鐘請求數</label>
                    <input type="number" value="100" :class="['w-full px-3 py-2 rounded transition-all duration-300', currentThemeStyles.input]" />
                    <span :class="['text-xs transition-colors duration-300', currentThemeStyles.textSecondary]">防止單 Key 攻擊</span>
                  </div>
                  <div>
                    <label :class="['block text-xs transition-colors duration-300', currentThemeStyles.textSecondary]">每小時 Token 數</label>
                    <input type="number" value="50000" :class="['w-full px-3 py-2 rounded transition-all duration-300', currentThemeStyles.input]" />
                    <span :class="['text-xs transition-colors duration-300', currentThemeStyles.textSecondary]">控制 AI 成本</span>
                  </div>
                </div>
              </div>
              
              <!-- Per-User 限制：公平使用 -->
              <div :class="['p-4 rounded-lg border transition-all duration-300', currentThemeStyles.card]">
                <h4 :class="['font-medium mb-3 text-purple-400 transition-colors duration-300']">⚖️ 用戶使用</h4>
                <p :class="['text-xs mb-3 transition-colors duration-300', currentThemeStyles.textSecondary]">確保所有用戶使用上限</p>
                <div class="space-y-3">
                  <div>
                    <label :class="['block text-xs transition-colors duration-300', currentThemeStyles.textSecondary]">每日 Token 上限</label>
                    <input type="number" value="5000" :class="['w-full px-3 py-2 rounded transition-all duration-300', currentThemeStyles.input]" />
                    <span :class="['text-xs transition-colors duration-300', currentThemeStyles.textSecondary]">日額度限制</span>
                  </div>
                  <div>
                    <label :class="['block text-xs transition-colors duration-300', currentThemeStyles.textSecondary]">單次會話 Token 上限</label>
                    <input type="number" value="1000" :class="['w-full px-3 py-2 rounded transition-all duration-300', currentThemeStyles.input]" />
                    <span :class="['text-xs transition-colors duration-300', currentThemeStyles.textSecondary]">控制 AI 回應成本</span>
                  </div>
                  <div>
                    <label :class="['block text-xs transition-colors duration-300', currentThemeStyles.textSecondary]">最大輸入字元數</label>
                    <input type="number" value="8000" :class="['w-full px-3 py-2 rounded transition-all duration-300', currentThemeStyles.input]" />
                    <span :class="['text-xs transition-colors duration-300', currentThemeStyles.textSecondary]">防止巨量文字輸入</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 設定說明 -->
            <div :class="['mt-6 p-4 rounded-lg border-l-4 border-blue-500 transition-all duration-300', currentTheme === 'light' ? 'bg-blue-50' : 'bg-blue-900/20']">
              <h5 :class="['font-medium mb-2 text-blue-400']">💡 設定說明</h5>
              <div :class="['text-sm space-y-1 transition-colors duration-300', currentThemeStyles.textSecondary]">
                <p><strong>系統保護</strong>：防止惡意攻擊，保護伺服器穩定</p>
                <p><strong>成本控制</strong>：限制 AI 模型使用，避免費用爆炸</p>
                <p><strong>公平使用</strong>：確保每個用戶都能合理使用服務</p>
                <p><strong>雙重限制</strong>：字元數限制（前端）+ Token 限制（成本控制）</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Models Integration -->
      <div v-if="activeMenu === 'models'">
        <h2 :class="['text-3xl font-bold mb-6 transition-colors duration-300', currentThemeStyles.text]">模型整合</h2>
        <div class="space-y-6">
          <!-- 模型來源管理 -->
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <h3 :class="['text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-300', currentThemeStyles.text]">
              <Activity :size="24" class="text-purple-500" />
              模型來源管理
            </h3>
            <div class="grid md:grid-cols-3 gap-6">
              <!-- OpenAI -->
              <div :class="['p-4 rounded-lg border transition-all duration-300', currentThemeStyles.card]">
                <div class="flex items-center justify-between mb-3">
                  <h4 :class="['font-medium transition-colors duration-300', currentThemeStyles.text]">OpenAI</h4>
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">狀態:</span>
                    <span class="text-green-500">運行中</span>
                  </div>
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">模型:</span>
                    <span :class="currentThemeStyles.text">GPT-4</span>
                  </div>
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">延遲:</span>
                    <span :class="currentThemeStyles.text">120ms</span>
                  </div>
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">成功率:</span>
                    <span class="text-green-500">99.8%</span>
                  </div>
                </div>
              </div>
              
              <!-- Gemini -->
              <div :class="['p-4 rounded-lg border transition-all duration-300', currentThemeStyles.card]">
                <div class="flex items-center justify-between mb-3">
                  <h4 :class="['font-medium transition-colors duration-300', currentThemeStyles.text]">Gemini</h4>
                  <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">狀態:</span>
                    <span class="text-yellow-500">備用</span>
                  </div>
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">模型:</span>
                    <span :class="currentThemeStyles.text">Gemini Pro</span>
                  </div>
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">延遲:</span>
                    <span :class="currentThemeStyles.text">95ms</span>
                  </div>
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">成功率:</span>
                    <span class="text-green-500">99.1%</span>
                  </div>
                </div>
              </div>
              
              <!-- Claude -->
              <div :class="['p-4 rounded-lg border transition-all duration-300', currentThemeStyles.card]">
                <div class="flex items-center justify-between mb-3">
                  <h4 :class="['font-medium transition-colors duration-300', currentThemeStyles.text]">Claude</h4>
                  <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">狀態:</span>
                    <span class="text-red-500">離線</span>
                  </div>
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">模型:</span>
                    <span :class="currentThemeStyles.text">Claude 3</span>
                  </div>
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">延遲:</span>
                    <span :class="currentThemeStyles.text">--</span>
                  </div>
                  <div class="flex justify-between">
                    <span :class="currentThemeStyles.textSecondary">成功率:</span>
                    <span class="text-red-500">0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 模型金鑰設定 -->
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <h3 :class="['text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-300', currentThemeStyles.text]">
              <Shield :size="24" class="text-blue-500" />
              模型金鑰設定
            </h3>
            <div class="space-y-4">
              <!-- OpenAI 設定 -->
              <div :class="['p-4 rounded-lg border transition-all duration-300', currentThemeStyles.card]">
                <h4 :class="['font-medium mb-3 transition-colors duration-300', currentThemeStyles.text]">OpenAI Configuration</h4>
                <div class="grid md:grid-cols-3 gap-4">
                  <div>
                    <label :class="['block text-sm font-medium mb-2 transition-colors duration-300', currentThemeStyles.textSecondary]">API Key (Vault)</label>
                    <input type="password" value="sk-proj-***" :class="['w-full px-3 py-2 rounded-lg transition-all duration-300', currentThemeStyles.input]" />
                  </div>
                  <div>
                    <label :class="['block text-sm font-medium mb-2 transition-colors duration-300', currentThemeStyles.textSecondary]">版本</label>
                    <select :class="['w-full px-3 py-2 rounded-lg transition-all duration-300', currentThemeStyles.input]">
                      <option>v1</option>
                      <option>v2-beta</option>
                    </select>
                  </div>
                  <div>
                    <label :class="['block text-sm font-medium mb-2 transition-colors duration-300', currentThemeStyles.textSecondary]">引擎</label>
                    <select :class="['w-full px-3 py-2 rounded-lg transition-all duration-300', currentThemeStyles.input]">
                      <option>gpt-4-turbo</option>
                      <option>gpt-4</option>
                      <option>gpt-3.5-turbo</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <!-- Gemini 設定 -->
              <div :class="['p-4 rounded-lg border transition-all duration-300', currentThemeStyles.card]">
                <h4 :class="['font-medium mb-3 transition-colors duration-300', currentThemeStyles.text]">Gemini Configuration</h4>
                <div class="grid md:grid-cols-3 gap-4">
                  <div>
                    <label :class="['block text-sm font-medium mb-2 transition-colors duration-300', currentThemeStyles.textSecondary]">API Key (Vault)</label>
                    <input type="password" value="AIza***" :class="['w-full px-3 py-2 rounded-lg transition-all duration-300', currentThemeStyles.input]" />
                  </div>
                  <div>
                    <label :class="['block text-sm font-medium mb-2 transition-colors duration-300', currentThemeStyles.textSecondary]">版本</label>
                    <select :class="['w-full px-3 py-2 rounded-lg transition-all duration-300', currentThemeStyles.input]">
                      <option>v1</option>
                      <option>v1beta</option>
                    </select>
                  </div>
                  <div>
                    <label :class="['block text-sm font-medium mb-2 transition-colors duration-300', currentThemeStyles.textSecondary]">引擎</label>
                    <select :class="['w-full px-3 py-2 rounded-lg transition-all duration-300', currentThemeStyles.input]">
                      <option>gemini-pro</option>
                      <option>gemini-pro-vision</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 模型健康檢查 -->
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <div class="flex justify-between items-center mb-4">
              <h3 :class="['text-xl font-semibold flex items-center gap-2 transition-colors duration-300', currentThemeStyles.text]">
                <TrendingUp :size="24" class="text-green-500" />
                模型健康檢查
              </h3>
              <button :class="['px-4 py-2 rounded-lg transition-all duration-300', currentThemeStyles.activeButton, currentThemeStyles.text]">
                執行檢查
              </button>
            </div>
            <div class="grid md:grid-cols-2 gap-6">
              <!-- 延遲監控 -->
              <div :class="['p-4 rounded-lg border transition-all duration-300', currentThemeStyles.card]">
                <h4 :class="['font-medium mb-3 transition-colors duration-300', currentThemeStyles.text]">延遲監控</h4>
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span :class="currentThemeStyles.textSecondary">OpenAI</span>
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span :class="currentThemeStyles.text">120ms</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span :class="currentThemeStyles.textSecondary">Gemini</span>
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span :class="currentThemeStyles.text">95ms</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span :class="currentThemeStyles.textSecondary">Claude</span>
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span class="text-red-500">Timeout</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 錯誤率統計 -->
              <div :class="['p-4 rounded-lg border transition-all duration-300', currentThemeStyles.card]">
                <h4 :class="['font-medium mb-3 transition-colors duration-300', currentThemeStyles.text]">錯誤率統計 (24h)</h4>
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span :class="currentThemeStyles.textSecondary">OpenAI</span>
                    <span class="text-green-500">0.2%</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span :class="currentThemeStyles.textSecondary">Gemini</span>
                    <span class="text-green-500">0.9%</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span :class="currentThemeStyles.textSecondary">Claude</span>
                    <span class="text-red-500">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 模型切換與回退策略 -->
          <div :class="['rounded-xl p-6 border transition-all duration-300', currentThemeStyles.card]">
            <h3 :class="['text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-300', currentThemeStyles.text]">
              <Settings :size="24" class="text-orange-500" />
              模型切換與回退策略
            </h3>
            <div class="grid md:grid-cols-2 gap-6">
              <!-- 優先序設定 -->
              <div :class="['p-4 rounded-lg border transition-all duration-300', currentThemeStyles.card]">
                <h4 :class="['font-medium mb-3 transition-colors duration-300', currentThemeStyles.text]">優先序設定</h4>
                <div class="space-y-3">
                  <div class="flex items-center justify-between p-3 rounded border" :class="currentTheme === 'light' ? 'border-gray-200 bg-green-50' : 'border-gray-700 bg-green-900/20'">
                    <div class="flex items-center gap-3">
                      <span class="w-6 h-6 bg-green-500 text-white rounded text-xs flex items-center justify-center font-bold">1</span>
                      <span :class="currentThemeStyles.text">OpenAI GPT-4</span>
                    </div>
                    <span class="text-green-500 text-sm">主要</span>
                  </div>
                  <div class="flex items-center justify-between p-3 rounded border" :class="currentTheme === 'light' ? 'border-gray-200 bg-yellow-50' : 'border-gray-700 bg-yellow-900/20'">
                    <div class="flex items-center gap-3">
                      <span class="w-6 h-6 bg-yellow-500 text-white rounded text-xs flex items-center justify-center font-bold">2</span>
                      <span :class="currentThemeStyles.text">Gemini Pro</span>
                    </div>
                    <span class="text-yellow-500 text-sm">備用</span>
                  </div>
                  <div class="flex items-center justify-between p-3 rounded border" :class="currentTheme === 'light' ? 'border-gray-200 bg-red-50' : 'border-gray-700 bg-red-900/20'">
                    <div class="flex items-center gap-3">
                      <span class="w-6 h-6 bg-red-500 text-white rounded text-xs flex items-center justify-center font-bold">3</span>
                      <span :class="currentThemeStyles.text">Claude 3</span>
                    </div>
                    <span class="text-red-500 text-sm">離線</span>
                  </div>
                </div>
              </div>
              
              <!-- Fallback 規則 -->
              <div :class="['p-4 rounded-lg border transition-all duration-300', currentThemeStyles.card]">
                <h4 :class="['font-medium mb-3 transition-colors duration-300', currentThemeStyles.text]">Fallback 規則</h4>
                <div class="space-y-3">
                  <div>
                    <label :class="['block text-sm font-medium mb-2 transition-colors duration-300', currentThemeStyles.textSecondary]">失敗次數閾值</label>
                    <input type="number" value="3" :class="['w-full px-3 py-2 rounded transition-all duration-300', currentThemeStyles.input]" />
                  </div>
                  <div>
                    <label :class="['block text-sm font-medium mb-2 transition-colors duration-300', currentThemeStyles.textSecondary]">切換延遲 (秒)</label>
                    <input type="number" value="5" :class="['w-full px-3 py-2 rounded transition-all duration-300', currentThemeStyles.input]" />
                  </div>
                  <div>
                    <label :class="['block text-sm font-medium mb-2 transition-colors duration-300', currentThemeStyles.textSecondary]">回復檢查間隔 (分鐘)</label>
                    <input type="number" value="5" :class="['w-full px-3 py-2 rounded transition-all duration-300', currentThemeStyles.input]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Code Management -->
      <div v-if="activeMenu === 'code'">
        <h2 class="text-3xl font-bold text-white mb-6">程式碼管理</h2>
        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div class="flex items-center gap-4 mb-4">
            <Code :size="24" class="text-blue-500" />
            <div>
              <h3 class="text-xl font-semibold text-white">VS Code 整合</h3>
              <p class="text-sm text-gray-400">管理和編輯網站程式碼</p>
            </div>
          </div>
          <div class="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400">
            <p>$ git status</p>
            <p>On branch main</p>
            <p>Your branch is up to date with 'origin/main'.</p>
            <p className="mt-2">$ npm run dev</p>
            <p>Server running on http://localhost:3000</p>
          </div>
          <div class="mt-4 flex gap-2">
            <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">開啟編輯器</button>
            <button class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">查看日誌</button>
          </div>
        </div>
      </div>

      <!-- Game Management -->
      <div v-if="activeMenu === 'game'">
        <h2 class="text-3xl font-bold text-white mb-6">遊戲管理設置</h2>
        <div class="space-y-6">
          <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 class="text-xl font-semibold text-white mb-4">遊戲設定</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-300">啟用遊戲模式</span>
                <button class="w-12 h-6 bg-green-600 rounded-full relative">
                  <div class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </button>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-300">顯示排行榜</span>
                <button class="w-12 h-6 bg-green-600 rounded-full relative">
                  <div class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </button>
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-2">每日挑戰題數</label>
                <input type="number" value="10" class="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interface Settings -->
      <div v-if="activeMenu === 'settings'" class="max-w-full">
        <h2 :class="['text-3xl font-bold mb-6 transition-colors duration-300', currentThemeStyles.text]">介面風格調整</h2>
        <div class="space-y-6">
          <!-- 主題設定卡片 -->
          <div :class="['rounded-xl p-6 border w-full transition-all duration-300', currentThemeStyles.card]">
            <div class="flex items-center justify-between mb-6">
              <h3 :class="['text-xl font-semibold flex items-center gap-2 transition-colors duration-300', currentThemeStyles.text]">
                <Settings :size="24" class="text-cyan-400" />
                主題設定
              </h3>
              <div :class="['text-xs px-3 py-1 rounded-full bg-opacity-20 border', currentThemeStyles.textSecondary, 'bg-blue-500 border-blue-400']">
                快捷鍵：Alt + T
              </div>
            </div>
            <!-- 主題選擇網格 - 可滾動 -->
            <div class="max-h-96 overflow-y-auto pr-2">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                <!-- 深色模式 -->
                <div 
                  @click="setTheme('dark')"
                  :class="[
                    'p-3 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                    currentTheme === 'dark' ? 'border-green-500 ring-2 ring-green-300' : 'border-gray-700 hover:border-gray-500',
                    currentThemeStyles.card
                  ]"
                >
                  <div class="w-full h-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded mb-2 shadow-lg"></div>
                  <p :class="[currentThemeStyles.text, 'text-center font-medium text-sm']">深色模式</p>
                  <p :class="[currentThemeStyles.textSecondary, 'text-xs text-center mt-1']">經典優雅黑色</p>
                </div>

                <!-- 淺色模式 -->
                <div 
                  @click="setTheme('light')"
                  :class="[
                    'p-3 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                    currentTheme === 'light' ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-700 hover:border-gray-500',
                    currentThemeStyles.card
                  ]"
                >
                  <div class="w-full h-16 bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded mb-2 shadow-lg border border-gray-200"></div>
                  <p :class="[currentThemeStyles.text, 'text-center font-medium text-sm']">淺色模式</p>
                  <p :class="[currentThemeStyles.textSecondary, 'text-xs text-center mt-1']">清爽明亮白色</p>
                </div>

                <!-- 藍紫模式 -->
                <div 
                  @click="setTheme('purple')"
                  :class="[
                    'p-3 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                    currentTheme === 'purple' ? 'border-purple-500 ring-2 ring-purple-300' : 'border-gray-700 hover:border-gray-500',
                    currentThemeStyles.card
                  ]"
                >
                  <div class="w-full h-16 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 rounded mb-2 shadow-lg"></div>
                  <p :class="[currentThemeStyles.text, 'text-center font-medium text-sm']">藍紫模式</p>
                  <p :class="[currentThemeStyles.textSecondary, 'text-xs text-center mt-1']">神祕科技感</p>
                </div>

                <!-- 深海藍模式 -->
                <div 
                  @click="setTheme('ocean')"
                  :class="[
                    'p-3 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                    currentTheme === 'ocean' ? 'border-cyan-500 ring-2 ring-cyan-300' : 'border-gray-700 hover:border-gray-500',
                    currentThemeStyles.card
                  ]"
                >
                  <div class="w-full h-16 bg-gradient-to-br from-blue-800 via-cyan-800 to-teal-800 rounded mb-2 shadow-lg"></div>
                  <p :class="[currentThemeStyles.text, 'text-center font-medium text-sm']">深海藍模式</p>
                  <p :class="[currentThemeStyles.textSecondary, 'text-xs text-center mt-1']">寧靜深邃海洋</p>
                </div>

                <!-- 玫瑰金模式 -->
                <div 
                  @click="setTheme('rose')"
                  :class="[
                    'p-3 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                    currentTheme === 'rose' ? 'border-rose-500 ring-2 ring-rose-300' : 'border-gray-700 hover:border-gray-500',
                    currentThemeStyles.card
                  ]"
                >
                  <div class="w-full h-16 bg-gradient-to-br from-pink-800 via-rose-700 to-red-800 rounded mb-2 shadow-lg"></div>
                  <p :class="[currentThemeStyles.text, 'text-center font-medium text-sm']">玫瑰金模式</p>
                  <p :class="[currentThemeStyles.textSecondary, 'text-xs text-center mt-1']">優雅浪漫粉金</p>
                </div>

                <!-- 森林綠模式 -->
                <div 
                  @click="setTheme('forest')"
                  :class="[
                    'p-3 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                    currentTheme === 'forest' ? 'border-green-500 ring-2 ring-green-300' : 'border-gray-700 hover:border-gray-500',
                    currentThemeStyles.card
                  ]"
                >
                  <div class="w-full h-16 bg-gradient-to-br from-green-800 via-emerald-700 to-teal-800 rounded mb-2 shadow-lg"></div>
                  <p :class="[currentThemeStyles.text, 'text-center font-medium text-sm']">森林綠模式</p>
                  <p :class="[currentThemeStyles.textSecondary, 'text-xs text-center mt-1']">自然森林綠意</p>
                </div>

                <!-- 石墨灰模式 -->
                <div 
                  @click="setTheme('slate')"
                  :class="[
                    'p-3 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                    currentTheme === 'slate' ? 'border-slate-500 ring-2 ring-slate-300' : 'border-gray-700 hover:border-gray-500',
                    currentThemeStyles.card
                  ]"
                >
                  <div class="w-full h-16 bg-gradient-to-br from-slate-700 via-gray-800 to-zinc-800 rounded mb-2 shadow-lg"></div>
                  <p :class="[currentThemeStyles.text, 'text-center font-medium text-sm']">石墨灰模式</p>
                  <p :class="[currentThemeStyles.textSecondary, 'text-xs text-center mt-1']">專業商務灰調</p>
                </div>

                <!-- 夕陽橙模式 -->
                <div 
                  @click="setTheme('sunset')"
                  :class="[
                    'p-3 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                    currentTheme === 'sunset' ? 'border-orange-500 ring-2 ring-orange-300' : 'border-gray-700 hover:border-gray-500',
                    currentThemeStyles.card
                  ]"
                >
                  <div class="w-full h-16 bg-gradient-to-br from-orange-600 via-pink-600 to-red-700 rounded mb-2 shadow-lg"></div>
                  <p :class="[currentThemeStyles.text, 'text-center font-medium text-sm']">夕陽橙模式</p>
                  <p :class="[currentThemeStyles.textSecondary, 'text-xs text-center mt-1']">浪漫夕陽橙粉</p>
                </div>

                <!-- 淡粉色模式 -->
                <div 
                  @click="setTheme('softPink')"
                  :class="[
                    'p-3 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                    currentTheme === 'softPink' ? 'border-pink-400 ring-2 ring-pink-200' : 'border-gray-700 hover:border-gray-500',
                    currentThemeStyles.card
                  ]"
                >
                  <div class="w-full h-16 bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300 rounded mb-2 shadow-lg border border-pink-200"></div>
                  <p :class="[currentThemeStyles.text, 'text-center font-medium text-sm']">淡粉色模式</p>
                  <p :class="[currentThemeStyles.textSecondary, 'text-xs text-center mt-1']">溫柔浪漫粉嫩</p>
                </div>

                <!-- 淡藍色模式 -->
                <div 
                  @click="setTheme('softBlue')"
                  :class="[
                    'p-3 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                    currentTheme === 'softBlue' ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-700 hover:border-gray-500',
                    currentThemeStyles.card
                  ]"
                >
                  <div class="w-full h-16 bg-gradient-to-br from-blue-100 via-sky-200 to-blue-300 rounded mb-2 shadow-lg border border-blue-200"></div>
                  <p :class="[currentThemeStyles.text, 'text-center font-medium text-sm']">淡藍色模式</p>
                  <p :class="[currentThemeStyles.textSecondary, 'text-xs text-center mt-1']">清新平靜天空</p>
                </div>

                <!-- 淡黃色模式 -->
                <div 
                  @click="setTheme('softYellow')"
                  :class="[
                    'p-3 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                    currentTheme === 'softYellow' ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-gray-700 hover:border-gray-500',
                    currentThemeStyles.card
                  ]"
                >
                  <div class="w-full h-16 bg-gradient-to-br from-yellow-100 via-amber-200 to-yellow-300 rounded mb-2 shadow-lg border border-yellow-200"></div>
                  <p :class="[currentThemeStyles.text, 'text-center font-medium text-sm']">淡黃色模式</p>
                  <p :class="[currentThemeStyles.textSecondary, 'text-xs text-center mt-1']">溫暖陽光明亮</p>
                </div>

                <!-- 宇宙星空模式 -->
                <div 
                  @click="setTheme('cosmic')"
                  :class="[
                    'p-3 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                    currentTheme === 'cosmic' ? 'border-purple-400 ring-2 ring-purple-300' : 'border-gray-700 hover:border-gray-500',
                    currentThemeStyles.card
                  ]"
                >
                  <div class="w-full h-16 bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 rounded mb-2 shadow-lg relative overflow-hidden">
                    <!-- 星星效果 -->
                    <div class="absolute inset-0">
                      <div class="absolute top-2 left-3 w-1 h-1 bg-white rounded-full opacity-90"></div>
                      <div class="absolute top-4 right-4 w-0.5 h-0.5 bg-pink-300 rounded-full opacity-80"></div>
                      <div class="absolute bottom-3 left-6 w-0.5 h-0.5 bg-blue-300 rounded-full opacity-70"></div>
                      <div class="absolute bottom-4 right-2 w-1 h-1 bg-purple-300 rounded-full opacity-85"></div>
                      <div class="absolute top-6 left-8 w-0.5 h-0.5 bg-white rounded-full opacity-60"></div>
                      <div class="absolute top-3 right-7 w-0.5 h-0.5 bg-indigo-300 rounded-full opacity-75"></div>
                    </div>
                  </div>
                  <p :class="[currentThemeStyles.text, 'text-center font-medium text-sm']">宇宙星空模式</p>
                  <p :class="[currentThemeStyles.textSecondary, 'text-xs text-center mt-1']">神秘浩瀚星河</p>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>

    <!-- 編輯會員模態框 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div :class="['rounded-xl p-6 w-96 max-w-lg mx-4 transition-all duration-300', currentThemeStyles.card]">
        <h3 :class="['text-xl font-semibold mb-4 transition-colors duration-300', currentThemeStyles.text]">編輯會員資料</h3>
        
        <div class="space-y-4">
          <!-- 帳號名稱 -->
          <div>
            <label :class="['block text-sm font-medium mb-2 transition-colors duration-300', currentThemeStyles.textSecondary]">帳號名稱</label>
            <input 
              v-model="editingMember.username"
              type="text"
              :class="['w-full px-3 py-2 rounded-lg transition-all duration-300', currentThemeStyles.input]"
              placeholder="請輸入帳號名稱"
            />
          </div>
          
          <!-- 電子郵件 -->
          <div>
            <label :class="['block text-sm font-medium mb-2 transition-colors duration-300', currentThemeStyles.textSecondary]">電子郵件</label>
            <input 
              v-model="editingMember.email"
              type="email"
              :class="['w-full px-3 py-2 rounded-lg transition-all duration-300', currentThemeStyles.input]"
              placeholder="請輸入電子郵件"
            />
          </div>
          
          <!-- 會員類型 -->
          <div>
            <label :class="['block text-sm font-medium mb-2 transition-colors duration-300', currentThemeStyles.textSecondary]">會員類型</label>
            <select 
              v-model="editingMember.type"
              :class="['w-full px-3 py-2 rounded-lg transition-all duration-300', currentThemeStyles.input]"
            >
              <option value="user">一般用戶</option>
              <option value="analyt">測試管理員</option>
              <option value="admin">主管理員</option>
            </select>
          </div>
          
          <!-- 不可編輯資訊 -->
          <div class="pt-4 border-t" :class="currentTheme === 'light' ? 'border-gray-200' : 'border-gray-700'">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span :class="['transition-colors duration-300', currentThemeStyles.textSecondary]">ID：</span>
                <span :class="['transition-colors duration-300', currentThemeStyles.text]">{{ editingMember.id }}</span>
              </div>
              <div>
                <span :class="['transition-colors duration-300', currentThemeStyles.textSecondary]">狀態：</span>
                <span :class="['transition-colors duration-300', getStatusColor(editingMember.status)]">
                  {{ editingMember.status === 'active' ? '活躍' : editingMember.status === 'inactive' ? '未活躍' : '停權' }}
                </span>
              </div>
              <div class="col-span-2">
                <span :class="['transition-colors duration-300', currentThemeStyles.textSecondary]">註冊時間：</span>
                <span :class="['transition-colors duration-300', currentThemeStyles.text]">{{ formatDate(editingMember.registeredAt) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 按鈕 -->
        <div class="flex justify-end gap-3 mt-6">
          <button 
            @click="closeEditModal"
            :class="['px-4 py-2 rounded-lg transition-all duration-300', currentThemeStyles.textSecondary, currentThemeStyles.cardHover]"
          >
            取消
          </button>
          <button 
            @click="saveEdit"
            :class="['px-4 py-2 rounded-lg transition-all duration-300', currentThemeStyles.activeButton, currentThemeStyles.text]"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { LayoutDashboard, MessageSquare, Settings, Users, Code, BarChart3, Gamepad2, Activity, Shield, TrendingUp } from 'lucide-vue-next'
import axios from 'axios'

// 定義 emit 事件
const emit = defineEmits(['back'])

// 定義 props 接收用戶資料
const props = defineProps({
  newUserData: {
    type: Object,
    default: null
  }
})

const activeMenu = ref('dashboard')
const currentTheme = ref(localStorage.getItem('adminTheme') || 'dark') // 從 localStorage 載入主題，預設為 dark

// 通知系統
const notification = ref({
  show: false,
  message: '',
  type: 'success' // success, info, warning, error
})

// === 真實資料響應式變數 ===
const dashboardStats = ref({
  totalUsers: 0,
  activeToday: 0,
  totalQueries: 0,
  avgXP: 0,
  maxTechLevel: 0,
  loading: true,
  lastUpdate: null
})

const apiConfig = ref({
  apiManagement: {},
  modelIntegration: {},
  loading: true
})

const usersData = ref([])
const isDataLoading = ref(true)

// API 基礎URL
const API_BASE = 'http://localhost:3000/api/admin'

// 會員資料管理
const members = ref([])
const editingMember = ref(null)
const showEditModal = ref(false)

// === API 呼叫函數 ===
const loadDashboardData = async () => {
  try {
    dashboardStats.value.loading = true
    const response = await axios.get(`${API_BASE}/dashboard`)
    if (response.data.success) {
      dashboardStats.value = {
        ...response.data.data,
        loading: false
      }
    }
  } catch (error) {
    console.error('載入 Dashboard 資料失敗:', error)
    dashboardStats.value.loading = false
    // 使用假資料作為後備
    dashboardStats.value = {
      totalUsers: 7,
      activeToday: 3,
      totalQueries: 1247,
      avgXP: 285,
      maxTechLevel: 9,
      loading: false,
      lastUpdate: new Date().toISOString()
    }
  }
}

const loadApiConfig = async () => {
  try {
    apiConfig.value.loading = true
    
    // 先從 localStorage 載入本地資料
    const localApiKeys = JSON.parse(localStorage.getItem('adminApiKeys') || '[]')
    
    const response = await axios.get(`${API_BASE}/config`)
    if (response.data.success) {
      const backendData = response.data.data
      
      // 合併後端資料和本地資料
      if (backendData.apiManagement && backendData.apiManagement.apiKeys) {
        // 找出本地有但後端沒有的 Key（新增的）
        const backendKeyIds = backendData.apiManagement.apiKeys.map(key => key.id)
        const localOnlyKeys = localApiKeys.filter(key => !backendKeyIds.includes(key.id))
        
        // 合併資料：後端資料 + 本地新增的資料
        backendData.apiManagement.apiKeys = [
          ...backendData.apiManagement.apiKeys,
          ...localOnlyKeys
        ]
      } else {
        // 如果後端沒有 apiManagement 資料，使用本地資料
        if (!backendData.apiManagement) {
          backendData.apiManagement = { apiKeys: [] }
        }
        backendData.apiManagement.apiKeys = localApiKeys
      }
      
      apiConfig.value = {
        ...backendData,
        loading: false
      }
    }
  } catch (error) {
    console.error('載入 API 配置失敗:', error)
    apiConfig.value.loading = false
    
    // 如果後端無法使用，從 localStorage 載入本地資料
    const localApiKeys = JSON.parse(localStorage.getItem('adminApiKeys') || '[]')
    apiConfig.value = {
      apiManagement: {
        apiKeys: localApiKeys.length > 0 ? localApiKeys : [
          {
            id: 'ak_demo_12345',
            name: '預設 API Key',
            status: 'active',
            created: '2024/10/28',
            permissions: 'Full Access'
          }
        ],
        rateLimits: {
          systemProtection: {
            globalLimit: 1000,
            description: '防止系統過載'
          }
        }
      },
      modelIntegration: {},
      loading: false
    }
  }
}

// 生成新的 API Key
const generateNewApiKey = async () => {
  try {
    // 生成新的 API Key ID
    const newKeyId = 'ak_' + Math.random().toString(36).substr(2, 16)
    const newApiKey = {
      id: newKeyId,
      name: `API Key ${new Date().toLocaleDateString()}`,
      status: 'active',
      created: new Date().toLocaleDateString('zh-TW'),
      permissions: 'Full Access'
    }

    // 首先更新本地資料，確保即使後端失敗也能保存
    if (!apiConfig.value.apiManagement) {
      apiConfig.value.apiManagement = { apiKeys: [] }
    }
    if (!apiConfig.value.apiManagement.apiKeys) {
      apiConfig.value.apiManagement.apiKeys = []
    }

    // 添加新的 API Key 到本地資料
    apiConfig.value.apiManagement.apiKeys.push(newApiKey)
    
    // 立即保存到 localStorage（無論後端是否成功）
    localStorage.setItem('adminApiKeys', JSON.stringify(apiConfig.value.apiManagement.apiKeys))

    // 嘗試發送到後端（作為備份）
    try {
      const response = await axios.post(`${API_BASE}/api-keys`, newApiKey)
      if (response.data.success) {
        showNotification(`新 API Key 已新增：${newKeyId}`, 'success')
        console.log('✅ 已同步到後端')
      } else {
        showNotification(`API Key 已新增（僅本地）：${newKeyId}`, 'info')
      }
    } catch (error) {
      console.warn('後端同步失敗，但本地已保存:', error)
      showNotification(`API Key 已新增（僅本地）：${newKeyId}`, 'info')
    }
    
  } catch (error) {
    console.error('新增 API Key 失敗:', error)
    showNotification('新增 API Key 失敗', 'error')
  }
}

// 撤銷 API Key
const revokeApiKey = async (keyId) => {
  if (!confirm('確定要撤銷這個 API Key 嗎？此操作無法復原。')) {
    return
  }

  try {
    // 先在本地移除，確保即使後端失敗也能移除
    if (apiConfig.value.apiManagement?.apiKeys) {
      apiConfig.value.apiManagement.apiKeys = apiConfig.value.apiManagement.apiKeys.filter(
        key => key.id !== keyId
      )
      // 立即更新 localStorage
      localStorage.setItem('adminApiKeys', JSON.stringify(apiConfig.value.apiManagement.apiKeys))
    }

    // 嘗試發送到後端同步
    try {
      const response = await axios.delete(`${API_BASE}/api-keys/${keyId}`)
      if (response.data.success) {
        showNotification('API Key 已撤銷', 'success')
        console.log('✅ 已同步到後端')
      } else {
        showNotification('API Key 已撤銷（僅本地）', 'info')
      }
    } catch (error) {
      console.warn('後端同步失敗，但本地已撤銷:', error)
      showNotification('API Key 已撤銷（僅本地）', 'info')
    }
    
  } catch (error) {
    console.error('撤銷 API Key 失敗:', error)
    showNotification('撤銷 API Key 失敗', 'error')
  }
}

const loadUsersData = async () => {
  try {
    isDataLoading.value = true
    const response = await axios.get(`${API_BASE}/users`)
    if (response.data.success) {
      usersData.value = response.data.data
    }
  } catch (error) {
    console.error('載入用戶資料失敗:', error)
  } finally {
    isDataLoading.value = false
  }
}

// 監聽新用戶註冊
onMounted(() => {
  // 載入真實資料
  loadDashboardData()
  loadApiConfig()
  loadUsersData()
  
  loadAllMembers()
  
  // 如果有新用戶資料，加入到會員列表
  if (props.newUserData) {
    addNewMember(props.newUserData)
  }
  
  // 添加鍵盤快捷鍵監聽
  const handleKeyPress = (event) => {
    // Alt + T = 快速切換主題
    if (event.altKey && event.key.toLowerCase() === 't') {
      event.preventDefault()
      const themeKeys = Object.keys(themes)
      const currentIndex = themeKeys.indexOf(currentTheme.value)
      const nextIndex = (currentIndex + 1) % themeKeys.length
      setTheme(themeKeys[nextIndex])
    }
  }
  
  document.addEventListener('keydown', handleKeyPress)
  
  // 清理監聽器
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyPress)
  })
})

// 從所有存儲的數據中載入會員
const loadAllMembers = () => {
  const allMembers = []
  
  // 預設管理員帳號 (ID=0)
  allMembers.push({
    id: 0,
    username: 'test',
    email: 'test@example.com',
    password: '123',
    type: 'admin',
    registeredAt: '2024-10-01T10:00:00.000Z',
    status: 'active'
  })
  
  // 預設分析師帳號 (ID=1)
  allMembers.push({
    id: 1,
    username: 'white',
    email: 'white@example.com',
    password: '123',
    type: 'analyt',
    registeredAt: '2024-10-01T11:00:00.000Z',
    status: 'active'
  })
  
  let nextId = 2
  
  // 1. 從 registeredUsers 載入註冊的用戶
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
  registeredUsers.forEach(user => {
    // 檢查是否已經存在於預設帳號中
    const existingInDefaults = allMembers.find(m => m.username === user.username)
    if (!existingInDefaults) {
      allMembers.push({
        id: nextId++,
        username: user.username,
        email: user.email || `${user.username}@example.com`,
        password: user.password || '123',
        type: user.type || 'user',
        registeredAt: user.registeredAt || new Date().toISOString(),
        status: user.status || 'active'
      })
    }
  })
  
  // 2. 從 localStorage 獲取有遊戲活動記錄的用戶
  const possibleUsers = ['lee222', 'lee555', 'alice', 'bob', 'charlie', 'diana', 'eva', 'frank', 'grace', 'henry']
  
  possibleUsers.forEach(username => {
    // 檢查是否存在用戶的靈魂動物測驗記錄
    const soulAnimalKey = `soulAnimalHistory_${username}`
    const gameRecordKey = `gameRecords_${username}`
    const scoreKey = `userGameScores`
    
    const hasSoulAnimalRecord = localStorage.getItem(soulAnimalKey)
    const hasGameRecord = localStorage.getItem(gameRecordKey)
    const scores = JSON.parse(localStorage.getItem(scoreKey) || '{}')
    const hasScore = scores[username] !== undefined
    
    // 如果用戶有任何記錄，且還不在會員列表中
    if ((hasSoulAnimalRecord || hasGameRecord || hasScore)) {
      const existingMember = allMembers.find(m => m.username === username)
      if (!existingMember) {
        allMembers.push({
          id: nextId++,
          username: username,
          email: `${username}@example.com`, // 預設 email
          password: '123', // 預設密碼
          type: 'user',
          registeredAt: new Date().toISOString(),
          status: 'active'
        })
      }
    }
  })
  
  // 3. 從管理員手動設定的會員列表載入
  const savedMembers = localStorage.getItem('adminMembers')
  if (savedMembers) {
    const savedMembersList = JSON.parse(savedMembers)
    savedMembersList.forEach(savedMember => {
      const existing = allMembers.find(m => m.username === savedMember.username)
      if (!existing) {
        // 確保 ID 是數字且不重複
        const maxId = Math.max(...allMembers.map(m => m.id), nextId - 1)
        allMembers.push({
          ...savedMember,
          id: maxId + 1
        })
      } else {
        // 更新現有會員的資訊（但保留 ID）
        Object.assign(existing, savedMember, { id: existing.id })
      }
    })
  }
  
  // 重新排序 ID
  allMembers.sort((a, b) => a.id - b.id)
  allMembers.forEach((member, index) => {
    if (member.username === 'test') {
      member.id = 0 // 管理員永遠是 ID 0
    } else if (member.username === 'white') {
      member.id = 1 // 分析師是 ID 1
    } else {
      member.id = index < 2 ? index + 2 : index
    }
  })
  
  members.value = allMembers
  saveMembers()
}

// 新增會員
const addNewMember = (userData) => {
  // 檢查是否已存在
  const existingMember = members.value.find(m => m.username === userData.username || m.email === userData.email)
  if (!existingMember) {
    // 計算新的 ID
    const maxId = Math.max(...members.value.map(m => m.id), -1)
    const newMember = {
      ...userData,
      id: maxId + 1
    }
    members.value.push(newMember)
    saveMembers()
  }
}

// 儲存會員資料到 localStorage
const saveMembers = () => {
  localStorage.setItem('adminMembers', JSON.stringify(members.value))
}

// 刪除會員
const deleteMember = (memberId) => {
  if (confirm('確定要刪除這個會員嗎？')) {
    members.value = members.value.filter(m => m.id !== memberId)
    saveMembers()
  }
}

// 更新會員狀態
const updateMemberStatus = (memberId, newStatus) => {
  const member = members.value.find(m => m.id === memberId)
  if (member) {
    member.status = newStatus
    saveMembers()
  }
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 獲取會員類型標籤
const getMemberTypeLabel = (type) => {
  const labels = {
    'admin': '管理員',
    'analyt': '分析師',
    'user': '一般用戶'
  }
  return labels[type] || '未知'
}

// 獲取狀態顏色
const getStatusColor = (status) => {
  const colors = {
    'active': 'text-green-400',
    'inactive': 'text-gray-400',
    'suspended': 'text-red-400'
  }
  return colors[status] || 'text-gray-400'
}

// 編輯會員
const editMember = (member) => {
  editingMember.value = { ...member } // 創建副本避免直接修改
  showEditModal.value = true
}

// 保存編輯
const saveEdit = () => {
  if (editingMember.value) {
    const index = members.value.findIndex(m => m.id === editingMember.value.id)
    if (index !== -1) {
      // 只允許修改特定欄位
      members.value[index].username = editingMember.value.username
      members.value[index].email = editingMember.value.email
      members.value[index].type = editingMember.value.type
      saveMembers()
    }
  }
  closeEditModal()
}

// 取消編輯
const closeEditModal = () => {
  editingMember.value = null
  showEditModal.value = false
}

// 主題配色方案 - 基於色彩學和 UI/UX 設計原理
const themes = {
  dark: {
    name: '深色模式',
    sidebar: 'bg-gray-800',
    sidebarBorder: 'border-gray-700',
    main: 'bg-gray-900',
    card: 'bg-gray-800 border-gray-700',
    cardHover: 'hover:bg-gray-700',
    activeButton: 'bg-gradient-to-r from-green-600 to-emerald-600',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    input: 'bg-gray-900 border-gray-700 text-white',
    gradient: 'from-gray-900 to-black'
  },
  light: {
    name: '淺色模式',
    sidebar: 'bg-white',
    sidebarBorder: 'border-gray-200',
    main: 'bg-gray-50',
    card: 'bg-white border-gray-200',
    cardHover: 'hover:bg-gray-100',
    activeButton: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    input: 'bg-white border-gray-300 text-gray-900',
    gradient: 'from-white to-gray-100'
  },
  purple: {
    name: '藍紫模式',
    sidebar: 'bg-gradient-to-b from-indigo-900 to-purple-900',
    sidebarBorder: 'border-purple-700',
    main: 'bg-gradient-to-br from-indigo-950 to-purple-950',
    card: 'bg-gradient-to-br from-indigo-800/40 to-purple-800/40 border-purple-600/50',
    cardHover: 'hover:from-indigo-700/60 hover:to-purple-700/60',
    activeButton: 'bg-gradient-to-r from-purple-500 to-pink-600',
    text: 'text-white',
    textSecondary: 'text-purple-200',
    input: 'bg-indigo-900/50 border-purple-600 text-white',
    gradient: 'from-indigo-900 to-purple-900'
  },
  ocean: {
    name: '深海藍模式',
    sidebar: 'bg-gradient-to-b from-blue-900 to-cyan-900',
    sidebarBorder: 'border-cyan-700',
    main: 'bg-gradient-to-br from-blue-950 to-cyan-950',
    card: 'bg-gradient-to-br from-blue-800/40 to-cyan-800/40 border-cyan-600/50',
    cardHover: 'hover:from-blue-700/60 hover:to-cyan-700/60',
    activeButton: 'bg-gradient-to-r from-blue-500 to-cyan-600',
    text: 'text-white',
    textSecondary: 'text-cyan-200',
    input: 'bg-blue-900/50 border-cyan-600 text-white',
    gradient: 'from-blue-800 to-cyan-900'
  },
  rose: {
    name: '玫瑰金模式',
    sidebar: 'bg-gradient-to-b from-pink-900 to-rose-900',
    sidebarBorder: 'border-rose-700',
    main: 'bg-gradient-to-br from-pink-950 to-rose-950',
    card: 'bg-gradient-to-br from-pink-800/40 to-rose-800/40 border-rose-600/50',
    cardHover: 'hover:from-pink-700/60 hover:to-rose-700/60',
    activeButton: 'bg-gradient-to-r from-pink-500 to-rose-600',
    text: 'text-white',
    textSecondary: 'text-pink-200',
    input: 'bg-pink-900/50 border-rose-600 text-white',
    gradient: 'from-pink-800 to-rose-900'
  },
  forest: {
    name: '森林綠模式',
    sidebar: 'bg-gradient-to-b from-green-900 to-emerald-900',
    sidebarBorder: 'border-green-700',
    main: 'bg-gradient-to-br from-green-950 to-emerald-950',
    card: 'bg-gradient-to-br from-green-800/40 to-emerald-800/40 border-green-600/50',
    cardHover: 'hover:from-green-700/60 hover:to-emerald-700/60',
    activeButton: 'bg-gradient-to-r from-green-500 to-emerald-600',
    text: 'text-white',
    textSecondary: 'text-green-200',
    input: 'bg-green-900/50 border-emerald-600 text-white',
    gradient: 'from-green-800 to-emerald-900'
  },
  slate: {
    name: '石墨灰模式',
    sidebar: 'bg-gradient-to-b from-slate-800 to-gray-900',
    sidebarBorder: 'border-slate-700',
    main: 'bg-gradient-to-br from-slate-900 to-gray-950',
    card: 'bg-gradient-to-br from-slate-800/60 to-gray-800/60 border-slate-600/50',
    cardHover: 'hover:from-slate-700/80 hover:to-gray-700/80',
    activeButton: 'bg-gradient-to-r from-slate-500 to-gray-600',
    text: 'text-white',
    textSecondary: 'text-slate-300',
    input: 'bg-slate-900/50 border-gray-600 text-white',
    gradient: 'from-slate-800 to-gray-900'
  },
  sunset: {
    name: '夕陽橙模式',
    sidebar: 'bg-gradient-to-b from-orange-800 to-pink-900',
    sidebarBorder: 'border-orange-700',
    main: 'bg-gradient-to-br from-orange-950 to-pink-950',
    card: 'bg-gradient-to-br from-orange-800/40 to-pink-800/40 border-orange-600/50',
    cardHover: 'hover:from-orange-700/60 hover:to-pink-700/60',
    activeButton: 'bg-gradient-to-r from-orange-500 to-pink-600',
    text: 'text-white',
    textSecondary: 'text-orange-200',
    input: 'bg-orange-900/50 border-pink-600 text-white',
    gradient: 'from-orange-800 to-pink-900'
  },
  softPink: {
    name: '淡粉色模式',
    sidebar: 'bg-gradient-to-b from-rose-200 to-pink-300',
    sidebarBorder: 'border-pink-300',
    main: 'bg-gradient-to-br from-rose-100 to-pink-200',
    card: 'bg-white/90 border-pink-200 backdrop-blur-sm shadow-sm',
    cardHover: 'hover:bg-pink-50/95',
    activeButton: 'bg-gradient-to-r from-pink-500 to-rose-600',
    text: 'text-gray-800',
    textSecondary: 'text-pink-700',
    input: 'bg-white/95 border-pink-300 text-gray-800',
    gradient: 'from-rose-200 to-pink-300'
  },
  softBlue: {
    name: '淡藍色模式',
    sidebar: 'bg-gradient-to-b from-sky-200 to-blue-300',
    sidebarBorder: 'border-blue-300',
    main: 'bg-gradient-to-br from-sky-100 to-blue-200',
    card: 'bg-white/90 border-blue-200 backdrop-blur-sm shadow-sm',
    cardHover: 'hover:bg-blue-50/95',
    activeButton: 'bg-gradient-to-r from-blue-500 to-sky-600',
    text: 'text-gray-800',
    textSecondary: 'text-blue-700',
    input: 'bg-white/95 border-blue-300 text-gray-800',
    gradient: 'from-sky-200 to-blue-300'
  },
  softYellow: {
    name: '淡黃色模式',
    sidebar: 'bg-gradient-to-b from-amber-200 to-yellow-300',
    sidebarBorder: 'border-yellow-300',
    main: 'bg-gradient-to-br from-amber-100 to-yellow-200',
    card: 'bg-white/90 border-yellow-200 backdrop-blur-sm shadow-sm',
    cardHover: 'hover:bg-yellow-50/95',
    activeButton: 'bg-gradient-to-r from-yellow-500 to-amber-600',
    text: 'text-gray-800',
    textSecondary: 'text-amber-800',
    input: 'bg-white/95 border-yellow-300 text-gray-800',
    gradient: 'from-amber-200 to-yellow-300'
  },
  cosmic: {
    name: '宇宙星空模式',
    sidebar: 'bg-gradient-to-b from-purple-950 via-indigo-950 to-blue-950',
    sidebarBorder: 'border-purple-500/30',
    main: 'bg-gradient-to-br from-purple-950 via-indigo-950 via-blue-950 to-black',
    card: 'bg-gradient-to-br from-purple-900/30 via-indigo-800/20 to-blue-900/30 border-purple-400/30 backdrop-blur-sm',
    cardHover: 'hover:from-purple-800/40 hover:via-indigo-700/30 hover:to-blue-800/40',
    activeButton: 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500',
    text: 'text-white',
    textSecondary: 'text-purple-200',
    input: 'bg-purple-950/50 border-purple-500/50 text-white',
    gradient: 'from-purple-950 via-indigo-950 to-blue-950'
  }
}

// 計算當前主題樣式
const currentThemeStyles = computed(() => themes[currentTheme.value])

// 顯示通知函數
const showNotification = (message, type = 'success') => {
  notification.value = {
    show: true,
    message,
    type
  }
  
  // 3秒後自動隱藏
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// 切換主題函數
const setTheme = (themeName) => {
  const themeDisplayName = themes[themeName]?.name || themeName
  currentTheme.value = themeName
  
  // 保存到 localStorage
  localStorage.setItem('adminTheme', themeName)
  
  // 顯示切換通知
  showNotification(`已切換至 ${themeDisplayName}`, 'info')
  
  // 添加視覺反饋
  nextTick(() => {
    // 平滑滾動到頂部以查看主題變化
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    
    // 短暫的震動反饋（如果支援）
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  })
}

const menuItems = [
  { id: 'dashboard', label: '數據分析', icon: LayoutDashboard },
  { id: 'sms', label: '簡訊資料庫', icon: MessageSquare },
  { id: 'members', label: '會員管理', icon: Users },
  { id: 'api', label: 'API 管理', icon: Settings },
  { id: 'models', label: '模型整合', icon: Activity },
  { id: 'code', label: '程式碼管理', icon: Code },
  { id: 'game', label: '遊戲管理', icon: Gamepad2 },
  { id: 'settings', label: '介面設定', icon: Settings },
]
</script>
