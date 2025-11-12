<template>
  <div class="relative min-h-screen w-full overflow-hidden bg-black text-white">
    <!-- 背景效果 (滿版自適應) -->
    <BackgroundEffect class="absolute inset-0 z-0" />

    <!-- 返回按鈕 -->
    <button 
      @click="$emit('back')" 
      class="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-gray-800/60 backdrop-blur-md rounded-lg border border-gray-700 hover:border-cyan-400 transition-all duration-300 text-gray-300 hover:text-cyan-400 text-sm font-medium"
    >
      <ArrowLeft :size="16" />
      <span>返回</span>
    </button>

    <!-- 主容器 -->
    <div class="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 py-8">
      <!-- 標題 -->
      <div class="text-center mb-8 md:mb-12">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          AI 語音助理
        </h1>
        <p class="text-gray-400 text-base md:text-lg lg:text-xl">上傳音訊或即時錄音，讓 AI 幫你轉文字與分析</p>
      </div>

      <!-- 主卡片 -->
      <div class="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 lg:p-10 border border-gray-800 max-w-6xl w-full shadow-2xl">
        
        <!-- 標籤頁導航 -->
        <div class="mb-8">
          <div class="flex flex-wrap gap-2 p-1 bg-gray-800/50 rounded-xl">
            <button
              v-for="(tab, key) in tabs"
              :key="key"
              @click="activeTab = key"
              :class="[
                'flex-1 min-w-0 px-4 py-3 rounded-lg text-sm md:text-base font-medium transition-all duration-300',
                activeTab === key 
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              ]"
            >
              <component :is="tab.icon" :size="20" class="inline-block mr-2" />
              {{ tab.name }}
            </button>
          </div>
        </div>

        <!-- 標籤頁內容 -->
        <div class="min-h-[400px]">
          <!-- 文字分析標籤 -->
          <div v-show="activeTab === 'text'" class="space-y-6">
            <div class="bg-blue-900/20 p-6 rounded-xl border border-blue-700/30">
              <div class="flex items-center gap-3 mb-4">
                <FileText class="text-blue-400" :size="24" />
                <h3 class="text-xl font-semibold text-white">文字內容分析 (BERT)</h3>
              </div>
              
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-300 mb-2 block">輸入要分析的文字內容：</label>
                  <textarea
                    v-model="textInput"
                    placeholder="請輸入您想要分析的文字內容，例如：可疑訊息、對話記錄、郵件內容等..."
                    class="w-full h-32 p-4 bg-gray-800 border border-gray-600 rounded-lg text-white resize-none focus:border-cyan-400 focus:outline-none"
                    maxlength="5000"
                  ></textarea>
                  <div class="text-xs text-gray-400 mt-1">{{ textInput.length }}/5000 字元</div>
                </div>
                
                <button
                  @click="analyzeText"
                  :disabled="!textInput.trim() || isProcessing"
                  class="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-4 rounded-lg font-medium transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Brain :size="20" />
                  {{ isProcessing ? '分析中...' : '開始 BERT 風險分析' }}
                </button>
              </div>
            </div>
            
            <!-- 文字分析結果 -->
            <div v-if="contentAnalysis && activeTab === 'text'" class="bg-gray-800/40 p-4 rounded-xl border border-gray-700">
              <h3 class="text-xl font-semibold mb-3 flex items-center gap-2">
                <Brain :size="20" class="text-purple-400" /> AI 內容分析結果
              </h3>
              <div class="space-y-4">
                <div v-if="contentAnalysis.sentiment" class="bg-gray-700/50 p-4 rounded-lg">
                  <h4 class="text-sm font-medium text-gray-300 mb-2">情感分析：</h4>
                  <div class="flex items-center gap-2">
                    <span :class="getSentimentColor(contentAnalysis.sentiment.label)">
                      {{ getSentimentEmoji(contentAnalysis.sentiment.label) }} {{ contentAnalysis.sentiment.label }}
                    </span>
                    <span class="text-gray-400 text-sm">
                      (信心度: {{ Math.round(contentAnalysis.sentiment.confidence * 100) }}%)
                    </span>
                  </div>
                </div>
                
                <div v-if="contentAnalysis.keywords && contentAnalysis.keywords.length > 0" class="bg-gray-700/50 p-4 rounded-lg">
                  <h4 class="text-sm font-medium text-gray-300 mb-2">關鍵詞：</h4>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="keyword in contentAnalysis.keywords" 
                      :key="keyword"
                      class="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm"
                    >
                      {{ keyword }}
                    </span>
                  </div>
                </div>

                <div v-if="contentAnalysis.summary" class="bg-gray-700/50 p-4 rounded-lg">
                  <h4 class="text-sm font-medium text-gray-300 mb-2">內容摘要：</h4>
                  <p class="text-white">{{ contentAnalysis.summary }}</p>
                </div>

                <div v-if="contentAnalysis.fraudRisk" class="bg-gray-700/50 p-4 rounded-lg">
                  <h4 class="text-sm font-medium text-gray-300 mb-2">詐騙風險評估：</h4>
                  <div class="flex items-center gap-2">
                    <span :class="getFraudRiskColor(contentAnalysis.fraudRisk.level)">
                      {{ getFraudRiskEmoji(contentAnalysis.fraudRisk.level) }} {{ contentAnalysis.fraudRisk.level }}
                    </span>
                   
                  </div>
                  <p v-if="contentAnalysis.fraudRisk.reason" class="text-gray-300 text-sm mt-2 whitespace-pre-wrap">
                    {{ contentAnalysis.fraudRisk.reason }}
                  </p>
                </div>
                
                <!-- 語音專用分析結果 (僅在使用語音優化分析時顯示) -->
                <div v-if="contentAnalysis.speechPatterns" class="bg-gray-700/50 p-4 rounded-lg">
                  <h4 class="text-sm font-medium text-gray-300 mb-2">語音模式分析：</h4>
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="flex items-center gap-2">
                      <span :class="contentAnalysis.speechPatterns.isUrgent ? 'text-red-400' : 'text-green-400'">
                        {{ contentAnalysis.speechPatterns.isUrgent ? '⚠️ 緊急性' : '✅ 非緊急' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span :class="contentAnalysis.speechPatterns.hasThreats ? 'text-red-400' : 'text-green-400'">
                        {{ contentAnalysis.speechPatterns.hasThreats ? '⚠️ 含威脅' : '✅ 無威脅' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span :class="contentAnalysis.speechPatterns.requestsPersonalInfo ? 'text-red-400' : 'text-green-400'">
                        {{ contentAnalysis.speechPatterns.requestsPersonalInfo ? '⚠️ 要求個資' : '✅ 無個資要求' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span :class="contentAnalysis.speechPatterns.claimsAuthority ? 'text-red-400' : 'text-green-400'">
                        {{ contentAnalysis.speechPatterns.claimsAuthority ? '⚠️ 聲稱權威' : '✅ 無權威聲稱' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 音檔上傳標籤 -->
          <div v-show="activeTab === 'upload'" class="space-y-6">
            <div class="bg-green-900/20 p-6 rounded-xl border border-green-700/30">
              <div class="flex items-center gap-3 mb-4">
                <Upload class="text-green-400" :size="24" />
                <h3 class="text-xl font-semibold text-white">音檔上傳分析</h3>
              </div>
              
              <label
                class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-green-400 transition-all duration-300"
                @drop="handleFileDrop"
                @dragover="handleDragOver"
                @dragleave="handleDragLeave"
              >
                <div class="flex flex-col items-center justify-center">
                  <FileAudio class="text-gray-500 mb-3" :size="48" />
                  <p class="mb-2 text-base text-gray-400">
                    <span class="font-semibold text-green-400">點擊上傳</span> 或拖曳檔案至此
                  </p>
                  <p class="text-sm text-gray-500">支援 MP3, WAV, M4A, WEBM 等格式</p>
                </div>
                <input 
                  type="file" 
                  class="hidden" 
                  accept="audio/*"
                  @change="handleFileUpload" 
                />
              </label>
              
              <!-- 上傳狀態提示 -->
              <div v-if="audioFileName && !isProcessing" class="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <span>檔案已選擇：{{ audioFileName }}</span>
              </div>
            </div>
          </div>

          <!-- 即時錄音標籤 -->
          <div v-show="activeTab === 'record'" class="space-y-6">
            <div class="bg-red-900/20 p-6 rounded-xl border border-red-700/30">
              <div class="flex items-center gap-3 mb-4">
                <Mic class="text-red-400" :size="24" />
                <h3 class="text-xl font-semibold text-white">即時錄音分析</h3>
              </div>
              
              <div class="text-center space-y-6">
                <!-- 錄音狀態顯示 -->
                <div v-if="recordingStatus === 'idle'">
                  <div class="mb-4">
                    <div class="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                      <Mic :size="40" class="text-red-400" />
                    </div>
                    <p class="text-gray-400 text-lg mb-6">準備開始錄音</p>
                  </div>
                  <button
                    @click="startRecording"
                    :disabled="isProcessing"
                    class="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                  >
                    <Mic :size="24" />
                    {{ isProcessing ? '初始化中...' : '開始錄音' }}
                  </button>
                </div>
                
                <!-- 錄音中 -->
                <div v-else-if="recordingStatus === 'recording'" class="space-y-6">
                  <div class="relative">
                    <div class="w-32 h-32 mx-auto bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <Mic :size="48" class="text-white" />
                    </div>
                    <div class="absolute inset-0 w-32 h-32 mx-auto border-4 border-red-500 rounded-full animate-ping"></div>
                  </div>
                  
                  <div class="space-y-2">
                    <p class="text-red-400 text-xl font-semibold">🔴 正在錄音</p>
                    <p class="text-gray-300 text-lg">{{ Math.floor(recordingTime / 60) }}:{{ String(recordingTime % 60).padStart(2, '0') }}</p>
                  </div>
                  
                  <!-- 音量條動畫 -->
                  <div class="flex items-center justify-center gap-1">
                    <div v-for="i in 8" :key="i" :class="['w-1 bg-red-500 rounded-full animate-pulse', getVolumeBarHeight(i)]" :style="{animationDelay: i * 100 + 'ms'}"></div>
                  </div>
                  
                  <div class="flex gap-4 justify-center">
                    <button
                      @click="pauseRecording"
                      class="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Pause :size="20" /> 暫停
                    </button>
                    <button
                      @click="stopRecording"
                      class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Square :size="20" /> 停止
                    </button>
                  </div>
                </div>
                
                <!-- 暫停中 -->
                <div v-else-if="recordingStatus === 'paused'" class="space-y-6">
                  <div class="w-32 h-32 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Pause :size="48" class="text-yellow-400" />
                  </div>
                  <div class="space-y-2">
                    <p class="text-yellow-400 text-xl font-semibold">⏸️ 錄音已暫停</p>
                    <p class="text-gray-300 text-lg">{{ Math.floor(recordingTime / 60) }}:{{ String(recordingTime % 60).padStart(2, '0') }}</p>
                  </div>
                  <div class="flex gap-4 justify-center">
                    <button
                      @click="resumeRecording"
                      class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Play :size="20" /> 繼續
                    </button>
                    <button
                      @click="stopRecording"
                      class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Square :size="20" /> 停止
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- 麥克風權限提示 -->
              <div v-if="microphoneError" class="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">
                <div class="flex items-center gap-2">
                  <AlertTriangle :size="20" />
                  <span class="font-medium">麥克風錯誤</span>
                </div>
                <p class="mt-2 text-sm">{{ microphoneError }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 處理狀態 -->
        <div v-if="isProcessing" class="mb-6 bg-blue-500/10 border border-blue-500/30 text-blue-400 p-4 rounded-xl flex items-center gap-2">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
          <span>{{ processingMessage }}</span>
        </div>

        <!-- 音訊播放與分析結果 -->
        <div v-if="audioUrl" class="mt-8 space-y-6">
          <!-- 音訊播放器 -->
          <div class="bg-gray-800/40 p-4 rounded-xl border border-gray-700">
            <div class="flex items-center gap-3 mb-3">
              <Headphones class="text-cyan-400" :size="24" />
              <h3 class="text-lg font-semibold">音訊播放</h3>
              <span v-if="audioFileName" class="text-sm text-gray-400">{{ audioFileName }}</span>
            </div>
            <audio :src="audioUrl" controls class="w-full rounded-lg"></audio>
            
            <!-- 下載按鈕 -->
            <div class="flex gap-2 mt-3">
              <button
                @click="downloadAudio"
                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
              >
                <Download :size="16" /> 下載錄音檔
              </button>
              <button
                @click="clearAudio"
                class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
              >
                <Trash2 :size="16" /> 清除
              </button>
            </div>
          </div>

          <!-- 語音轉文字結果 -->
          <div class="bg-gray-800/40 p-4 rounded-xl border border-gray-700">
            <h3 class="text-xl font-semibold mb-3 flex items-center gap-2">
              <FileText :size="20" class="text-cyan-400" /> 語音轉文字結果
            </h3>
            <div v-if="transcription" class="space-y-4">
              <div class="bg-gray-700/50 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-gray-300 mb-2">轉錄內容：</h4>
                <p class="text-white whitespace-pre-wrap leading-relaxed">{{ transcription }}</p>
              </div>
              <button
                @click="copyTranscription"
                class="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
              >
                <Copy :size="16" /> 複製文字
              </button>
            </div>
            <div v-else class="text-gray-400 text-center py-8">
              <div class="animate-pulse">正在進行 AI 語音轉換...</div>
            </div>
          </div>

          <!-- 內容分析結果 (音訊用) -->
          <div v-if="contentAnalysis" class="bg-gray-800/40 p-4 rounded-xl border border-gray-700">
            <h3 class="text-xl font-semibold mb-3 flex items-center gap-2">
              <Brain :size="20" class="text-purple-400" /> AI 內容分析
            </h3>
            <div class="space-y-4">
              <div v-if="contentAnalysis.sentiment" class="bg-gray-700/50 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-gray-300 mb-2">情感分析：</h4>
                <div class="flex items-center gap-2">
                  <span :class="getSentimentColor(contentAnalysis.sentiment.label)">
                    {{ getSentimentEmoji(contentAnalysis.sentiment.label) }} {{ contentAnalysis.sentiment.label }}
                  </span>
                  <span class="text-gray-400 text-sm">
                    (信心度: {{ Math.round(contentAnalysis.sentiment.confidence * 100) }}%)
                  </span>
                </div>
              </div>
              
              <div v-if="contentAnalysis.keywords && contentAnalysis.keywords.length > 0" class="bg-gray-700/50 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-gray-300 mb-2">關鍵詞：</h4>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="keyword in contentAnalysis.keywords" 
                    :key="keyword"
                    class="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm"
                  >
                    {{ keyword }}
                  </span>
                </div>
              </div>

              <div v-if="contentAnalysis.summary" class="bg-gray-700/50 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-gray-300 mb-2">內容摘要：</h4>
                <p class="text-white">{{ contentAnalysis.summary }}</p>
              </div>

              <div v-if="contentAnalysis.fraudRisk" class="bg-gray-700/50 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-gray-300 mb-2">詐騙風險評估：</h4>
                <div class="flex items-center gap-2">
                  <span :class="getFraudRiskColor(contentAnalysis.fraudRisk.level)">
                    {{ getFraudRiskEmoji(contentAnalysis.fraudRisk.level) }} {{ contentAnalysis.fraudRisk.level }}
                  </span>
                  <span class="text-gray-400 text-sm">
                    (風險分數: {{ contentAnalysis.fraudRisk.score }}/10)
                  </span>
                </div>
                <p v-if="contentAnalysis.fraudRisk.reason" class="text-gray-300 text-sm mt-2 whitespace-pre-wrap">
                  {{ contentAnalysis.fraudRisk.reason }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="error" class="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-2">
        <AlertTriangle :size="20" />
        <span>{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch, onMounted } from 'vue'
import BackgroundEffect from './BackgroundEffect.vue'
import { 
  Upload, FileAudio, Mic, Square, Headphones, FileText, AlertTriangle, ArrowLeft,
  Pause, Play, Download, Trash2, Copy, Brain
} from 'lucide-vue-next'

const emit = defineEmits(['back'])

// 標籤頁相關
const activeTab = ref('text')
const tabs = {
  text: { name: '文字分析', icon: FileText },
  upload: { name: '音檔上傳', icon: Upload },
  record: { name: '即時錄音', icon: Mic }
}

// 統一的分析結果數據
const textInput = ref('')

// 響應式變量
const recordingStatus = ref('idle') // idle, recording, paused
const audioUrl = ref('')
const audioFileName = ref('')
const transcription = ref('')
const contentAnalysis = ref(null)
const error = ref('')
const microphoneError = ref('')
const isProcessing = ref(false)
const processingMessage = ref('')
const recordingTime = ref(0)

// AI 服務設定（API Key 由後端管理，前端不持有）
const transcriptionService = ref('webspeech')
const analysisService = ref('whisper-api')
const isApiReady = ref(true)
const dailyUsage = ref({
  requestCount: 0,
  tokenCount: 0,
  date: new Date().toDateString()
})

// 錄音相關變量
let mediaRecorder = null
let audioChunks = []
let stream = null
let recordingTimer = null
let audioBlob = null
let recognition = null

// --- (!!! 關鍵變更 !!!) ---
// 將後端 BERT 模型輸出的風險指數映射到前端 UI 結構
const mapRiskDataToUI = (data) => {
    const riskIndex = data.scam_risk_index; // 0-100
    
    const fraudRiskLevel = (index) => {
        if (index >= 80) return '高風險';
        if (index >= 50) return '中風險';
        return '低風險';
    };
    
    const sentimentLabel = (index) => {
        if (index >= 60) return '警戒';
        if (index < 20) return '中性';
        return '負面';
    };

    return {
        // 情感分析 (模擬，基於風險指數)
        sentiment: {
            label: sentimentLabel(riskIndex),
            confidence: data.scam_probability, // 0.0 - 1.0
        },
        // 關鍵詞 (直接使用後端返回的匹配詞彙)
        keywords: Array.isArray(data.keywords) ? data.keywords : [], 
        // 摘要 (使用後端分析結果)
        summary: data.analysis,
        // 詐騙風險
        fraudRisk: {
            level: fraudRiskLevel(riskIndex),
            score: Math.round(riskIndex / 10), // 轉換為 0-10 
            reason: data.analysis,
        }
        // 語音模式 (文字分析時不需要)
        // speechPatterns: ... 
    };
};

// 本地內容分析（備用方案，用於 API 連線失敗時的 UI 顯示）
const analyzeContentLocally = (text) => {
    // 這是一個極簡的本地回退邏輯
    let riskScore = text.includes('轉帳') || text.includes('密碼') || text.includes('點擊連結') ? 8 : 2;
    let riskLevel = riskScore >= 6 ? '高風險' : '低風險';
    
    return {
        sentiment: { label: riskScore >= 6 ? '警戒' : '中性', confidence: 0.5 },
        keywords: riskScore >= 6 ? ['本地模擬', '高危詞'] : ['本地模擬'],
        summary: riskScore >= 6 ? 'API 連線失敗，此為本地模擬的高風險警示。' : 'API 連線失敗，此為本地模擬的低風險警示。',
        fraudRisk: {
            level: riskLevel,
            score: riskScore,
            reason: 'API 連線失敗：數據基於前端本地關鍵詞匹配模擬。',
        }
    };
};
// --- (!!! 變更結束 !!!) ---


// 初始化設定
const initializeSettings = async () => {
  try {
    // 從後台 API 讀取配置（不含 API Key，API Key 由後端管理）
    const response = await fetch('http://localhost:8000/api/voice-config', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success && result.data) {
      const config = result.data
      console.log('✅ 從資料庫載入語音配置:', config)
      
      // 根據當前標籤設置相應的服務（不再設置 API Key）
      if (activeTab.value === 'text' && config.textAnalysis) {
        // (!!! 關鍵變更 !!!) 文字分析強制使用 BERT 服務 (假設 'bert' 是後端的一個服務選項)
        analysisService.value = 'bert' 
        console.log('✅ 文字分析服務已配置: BERT (本地)')
      } else if (activeTab.value === 'upload' && config.audioUpload) {
        transcriptionService.value = config.audioUpload.transcription || 'whisper-api'
        analysisService.value = config.audioUpload.analysis || 'whisper-api'
        console.log('✅ 音檔上傳服務已配置 - 轉錄:', transcriptionService.value, '分析:', analysisService.value)
      } else if (activeTab.value === 'record' && config.liveRecord) {
        transcriptionService.value = config.liveRecord.transcription || 'webspeech'
        analysisService.value = config.liveRecord.analysis || 'whisper-api'
        console.log('✅ 即時錄音服務已配置 - 轉錄:', transcriptionService.value, '分析:', analysisService.value)
      }
    } else {
      console.log('⚠️ API 沒有返回配置，使用預設值')
      setDefaultSettings()
    }
  } catch (error) {
    console.error('載入後台配置失敗:', error)
    // 使用預設值
    setDefaultSettings()
  }
  
  // 載入使用量統計
  const savedUsage = localStorage.getItem('daily_usage')
  if (savedUsage) {
    const usage = JSON.parse(savedUsage)
    if (usage.date === new Date().toDateString()) {
      dailyUsage.value = usage
    } else {
      // 新的一天，重置使用量
      dailyUsage.value = {
        requestCount: 0,
        tokenCount: 0,
        date: new Date().toDateString()
      }
    }
  }
  
  updateApiReadyStatus()
}

// 設置預設值
const setDefaultSettings = () => {
  if (activeTab.value === 'text') {
    // (!!! 關鍵變更 !!!) 預設使用 BERT 服務
    analysisService.value = 'bert'
  } else if (activeTab.value === 'upload') {
    transcriptionService.value = 'whisper-api'
    analysisService.value = 'whisper-api'
  } else if (activeTab.value === 'record') {
    transcriptionService.value = 'webspeech'
    analysisService.value = 'whisper-api'
  }
}

// 更新 API 就緒狀態（API Key 由後端管理，前端只需檢查服務可用性）
const updateApiReadyStatus = () => {
  if (transcriptionService.value === 'webspeech') {
    // 檢查瀏覽器是否支持 Web Speech API
    isApiReady.value = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  } else {
    // 其他服務（whisper-api, gemini, chatgpt, bert）由後端管理
    isApiReady.value = true
    console.log('✅ AI 服務就緒（API Key 由後端管理）')
  }
}

// 保存設定到 localStorage
const saveSettings = () => {
  // 不保存 API Key 以保護隱私
  localStorage.setItem('transcription_service', transcriptionService.value)
  localStorage.setItem('analysis_service', analysisService.value)
  localStorage.setItem('daily_usage', JSON.stringify(dailyUsage.value))
}

// 檢查使用限制
const checkUsageLimits = () => {
  if (transcriptionService.value === 'gemini') {
    if (dailyUsage.value.requestCount >= 50) {
      throw new Error('今日 API 請求次數已達上限 (50次)')
    }
    if (dailyUsage.value.tokenCount >= 50000) {
      throw new Error('今日 API Token 使用量已達上限 (50000 tokens)')
    }
  }
  return true
}

// 更新使用量
const updateUsage = (tokens = 0) => {
  dailyUsage.value.requestCount++
  dailyUsage.value.tokenCount += tokens
  saveSettings()
}
const getTimestampFileName = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `recording_${year}${month}${day}_${hours}${minutes}${seconds}.mp3`
}

// 開始錄音
const startRecording = async () => {
  try {
    isProcessing.value = true
    processingMessage.value = '正在初始化麥克風...'
    microphoneError.value = ''
    error.value = ''

    // 檢查瀏覽器支援
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('您的瀏覽器不支援錄音功能')
    }

    // 請求麥克風權限
    stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      } 
    })

    // 設定 MediaRecorder
    const options = {
      mimeType: 'audio/webm;codecs=opus'
    }
    
    // 檢查支援的格式
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'audio/webm'
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/mp4'
      }
    }

    mediaRecorder = new MediaRecorder(stream, options)
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      audioBlob = new Blob(audioChunks, { type: 'audio/mp3' })
      audioUrl.value = URL.createObjectURL(audioBlob)
      audioFileName.value = getTimestampFileName()
      
      // 停止即時語音識別
      if (recognition && transcriptionService.value === 'webspeech') {
        recognition.stop()
      }
      
      // 根據選擇的服務進行處理
      if (transcriptionService.value === 'gemini') {
        await transcribeAudio(audioBlob)
      } else if (transcriptionService.value === 'whisper') {
        await transcribeAudio(audioBlob)
      } else if (transcriptionService.value === 'webspeech') {
        // Web Speech API 的轉錄已在錄音過程中完成
        if (transcription.value.trim()) {
          // 進行內容分析
          isProcessing.value = true
          processingMessage.value = '正在進行內容分析...'
          try {
            contentAnalysis.value = await analyzeContentWithAI(transcription.value)
          } catch (error) {
            console.warn('內容分析失敗:', error.message)
            contentAnalysis.value = analyzeContentLocally(transcription.value)
          }
          isProcessing.value = false
        }
      }
    }

    mediaRecorder.onerror = (event) => {
      console.error('錄音錯誤:', event.error)
      error.value = '錄音過程發生錯誤: ' + event.error
      stopRecording()
    }

    // 開始錄音
    mediaRecorder.start(1000) // 每秒收集一次數據
    recordingStatus.value = 'recording'
    recordingTime.value = 0
    
    // 如果使用 Web Speech API，同時啟動即時語音識別
    if (transcriptionService.value === 'webspeech') {
      startRealtimeSpeechRecognition()
    }
    
    // 開始計時器
    recordingTimer = setInterval(() => {
      recordingTime.value++
    }, 1000)

    isProcessing.value = false
    console.log('錄音開始，格式:', options.mimeType)

  } catch (err) {
    console.error('啟動錄音失敗:', err)
    isProcessing.value = false
    
    if (err.name === 'NotAllowedError') {
      microphoneError.value = '麥克風權限被拒絕，請在瀏覽器設定中允許麥克風權限'
    } else if (err.name === 'NotFoundError') {
      microphoneError.value = '找不到麥克風設備，請檢查您的音訊設備'
    } else {
      microphoneError.value = err.message || '無法啟動錄音功能'
    }
  }
}

// 啟動即時語音識別
const startRealtimeSpeechRecognition = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn('瀏覽器不支援即時語音識別')
    return
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognition()
  
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'zh-TW'
  
  let finalTranscript = ''
  
  recognition.onresult = (event) => {
    let interimTranscript = ''
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      if (result.isFinal) {
        finalTranscript += result[0].transcript + ' '
      } else {
        interimTranscript += result[0].transcript
      }
    }
    
    // 即時更新轉錄文字
    transcription.value = finalTranscript + interimTranscript
  }
  
  recognition.onerror = (event) => {
    console.error('即時語音識別錯誤:', event.error)
    if (event.error !== 'no-speech') {
      microphoneError.value = '語音識別錯誤: ' + event.error
    }
  }
  
  recognition.onend = () => {
    // 如果還在錄音中，重新啟動識別
    if (recordingStatus.value === 'recording') {
      setTimeout(() => {
        try {
          recognition.start()
        } catch (error) {
          console.warn('重新啟動語音識別失敗:', error)
        }
      }, 100)
    }
  }
  
  try {
    recognition.start()
    console.log('即時語音識別已啟動')
  } catch (error) {
    console.error('啟動即時語音識別失敗:', error)
    microphoneError.value = '無法啟動語音識別: ' + error.message
  }
}

// 暫停錄音
const pauseRecording = () => {
  if (mediaRecorder && recordingStatus.value === 'recording') {
    mediaRecorder.pause()
    recordingStatus.value = 'paused'
    clearInterval(recordingTimer)
    
    // 暫停語音識別
    if (recognition) {
      recognition.stop()
    }
    
    console.log('錄音已暫停')
  }
}

// 恢復錄音
const resumeRecording = () => {
  if (mediaRecorder && recordingStatus.value === 'paused') {
    mediaRecorder.resume()
    recordingStatus.value = 'recording'
    
    // 重新開始計時器
    recordingTimer = setInterval(() => {
      recordingTime.value++
    }, 1000)
    
    // 恢復語音識別
    if (transcriptionService.value === 'webspeech') {
      startRealtimeSpeechRecognition()
    }
    
    console.log('錄音已恢復')
  }
}

// 停止錄音
const stopRecording = () => {
  if (mediaRecorder && recordingStatus.value !== 'idle') {
    mediaRecorder.stop()
    recordingStatus.value = 'idle'
    clearInterval(recordingTimer)
    
    // 停止語音識別
    if (recognition) {
      recognition.stop()
    }
    
    // 停止音訊流
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      stream = null
    }
    
    console.log('錄音已停止')
  }
}

// 處理檔案上傳
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    console.log('檔案上傳:', file.name, file.type, file.size)
    await processAudioFile(file)
    // 清除 input 值，允許重複選擇相同檔案
    event.target.value = ''
  } else {
    console.log('沒有選擇檔案')
  }
}

// 處理拖拉上傳
const handleFileDrop = (event) => {
  event.preventDefault()
  const files = event.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('audio/')) {
      processAudioFile(file)
    } else {
      error.value = '請選擇音檔文件'
    }
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDragLeave = (event) => {
  event.preventDefault()
}

// (!!! 關鍵變更 !!!)
// AI 內容分析 - 根據選擇的分析服務
const analyzeContentWithAI = async (text) => {
  // 🔒 安全架構：所有 AI 調用都通過後端代理
  try {
    
    // 判斷是文字分析還是音檔分析
    const isTextAnalysis = activeTab.value === 'text'
    let endpoint = ''
    let body = {}

    if (isTextAnalysis) {
      // --- 文字分析：使用 BERT API ---
      endpoint = 'http://localhost:8000/api/analyze-message'
      body = { message: text }
      console.log(`🔄 [BERT] 調用後端 BERT API: ${endpoint}`)

    } else {
      // --- 音檔分析：使用原始的語音服務 API ---
      endpoint = 'http://localhost:8000/api/analyze-audio'
      body = {
        text: text,
        service: analysisService.value,
        is_speech_content: true // 音檔內容標記為語音轉錄
      }
      console.log(`🔄 [Audio] 調用後端語音分析 API: ${endpoint}`)
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result && isTextAnalysis) {
      // --- 處理 BERT API 的回傳 ---
      if (result.data && typeof result.data.scam_risk_index === 'number') {
        console.log('✅ BERT 分析完成:', result.data);
        return mapRiskDataToUI(result.data); // 使用映射函數
      } else {
         throw new Error('後端返回數據結構無效，無法解析風險指数。');
      }

    } else if (result && !isTextAnalysis && result.success && result.data) {
      // --- 處理 語音分析 API 的回傳 ---
      console.log('✅ AI 語音分析完成:', result.data)
      return result.data

    } else {
      throw new Error(result.message || '分析失敗')
    }
  } catch (error) {
    console.error('❌ 後端代理調用失敗:', error)
    
    // 如果後端調用失敗，使用本地分析作為備用方案
    console.warn('⚠️ 使用本地分析作為備用方案')
    return analyzeContentLocally(text)
  }
}

// 文字分析功能
const analyzeText = async () => {
  if (!textInput.value.trim()) {
    error.value = '請輸入要分析的文字'
    return
  }

  isProcessing.value = true
  processingMessage.value = '正在分析文字內容...'
  error.value = ''

  try {
    // (!!! 關鍵變更 !!!) 
    // analyzeText 函數現在總是調用 analyzeContentWithAI,
    // analyzeContentWithAI 會自動判斷 activeTab.value === 'text'
    // 並呼叫 BERT API
    const analysis = await analyzeContentWithAI(textInput.value)
    contentAnalysis.value = analysis
  } catch (err) {
    console.error('文字分析錯誤:', err)
    error.value = err.message || '文字分析失敗'
    // 提供友善的錯誤訊息，提醒檢查後端
    if (err.message.includes('Failed to fetch') || err.message.includes('localhost')) {
        error.value = '無法連線到 BERT 分析服務。請確認 Python FastAPI 服務已在 http://localhost:8000 啟動。';
    }
    // 使用本地分析作為備用方案
    contentAnalysis.value = analyzeContentLocally(textInput.value)
  }

  isProcessing.value = false
  processingMessage.value = ''
}
// --- (!!! 變更結束 !!!) ---


// 處理音訊檔案
const processAudioFile = async (file) => {
  if (!file.type.startsWith('audio/')) {
    error.value = '請選擇音訊檔案'
    return
  }

  try {
    // 清除之前的結果
    error.value = ''
    transcription.value = ''
    contentAnalysis.value = null
    
    // 創建音檔 URL
    audioUrl.value = URL.createObjectURL(file)
    audioFileName.value = file.name
    
    console.log('開始處理音檔:', file.name, '大小:', file.size, '類型:', file.type)
    
    // 開始轉錄
    await transcribeAudio(file)
  } catch (err) {
    console.error('處理檔案失敗:', err)
    error.value = '處理檔案時發生錯誤: ' + err.message
  }
}

// 語音轉文字 - 使用真實服務
const transcribeAudio = async (audioFile) => {
  try {
    checkUsageLimits()
    
    isProcessing.value = true
    processingMessage.value = '正在進行語音轉換...'
    transcription.value = ''
    contentAnalysis.value = null
    error.value = ''

    let transcriptText = ''
    
    if (transcriptionService.value === 'webspeech') {
      transcriptText = await transcribeWithWebSpeech(audioFile)
    } else if (transcriptionService.value === 'whisper-api') {
      transcriptText = await transcribeWithWhisperAPI(audioFile)
    } else if (transcriptionService.value === 'gemini') {
      transcriptText = await transcribeWithGemini(audioFile)
    }

    transcription.value = transcriptText
    
    if (transcriptText.trim()) {
      // 進行內容分析
      processingMessage.value = '正在進行內容分析...'
      // (!!! 關鍵變更 !!!) 
      // transcribeAudio 現在也呼叫 analyzeContentWithAI,
      // analyzeContentWithAI 會自動判斷 activeTab.value !== 'text'
      // 並呼叫 /api/analyze-audio
      contentAnalysis.value = await analyzeContentWithAI(transcriptText)
    }
    
    isProcessing.value = false
    console.log('語音轉換完成')
    
  } catch (err) {
    console.error('轉錄失敗:', err)
    error.value = err.message || '語音轉換失敗'
    isProcessing.value = false
  }
}

// Web Speech API 轉錄
const transcribeWithWebSpeech = (audioFile) => {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('您的瀏覽器不支援語音識別功能'))
      return
    }

    // Web Speech API 不能直接處理音檔，需要不同的處理方式
    if (audioFile instanceof File) {
      // 對於上傳的音檔，我們提供手動播放並重新錄音的方案
      const fallbackText = `
⚠️ Web Speech API 限制說明

Web Speech API 無法直接分析已上傳的音檔，但您有以下選擇：

🎯 **推薦方案**：
1. 點擊下方播放按鈕收聽您上傳的音檔
2. 切換到「Gemini Pro」服務獲得完整的音檔分析功能

🔄 **替代方案**：
1. 播放音檔並跟著念一遍
2. 使用「即時錄音」功能重新錄製（Web Speech API 會即時識別）

💡 **提示**：Gemini Pro 可以直接分析音檔並提供準確的轉錄和智能分析。
      `.trim()
      
      resolve(fallbackText)
    } else {
      // 對於 Blob（錄音），我們在錄音過程中已經處理了
      resolve("語音識別已在錄音過程中完成")
    }
  })
}





// 將音訊檔案轉換為 base64
const audioFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}



// 下載音訊檔案
const downloadAudio = () => {
  if (audioBlob) {
    const url = URL.createObjectURL(audioBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = audioFileName.value
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// 清除音訊
const clearAudio = () => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
  audioUrl.value = ''
  audioFileName.value = ''
  transcription.value = ''
  contentAnalysis.value = null
  audioBlob = null
}

// 複製轉錄文字
const copyTranscription = async () => {
  try {
    await navigator.clipboard.writeText(transcription.value)
    // 這裡可以加個提示訊息
    console.log('文字已複製到剪貼板')
  } catch (err) {
    console.error('複製失敗:', err)
    error.value = '複製文字失敗'
  }
}

// 工具函數：獲取音量條高度
const getVolumeBarHeight = (index) => {
  const heights = ['h-2', 'h-4', 'h-6', 'h-8', 'h-6', 'h-4', 'h-3', 'h-2']
  return heights[index - 1] || 'h-2'
}

// 工具函數：獲取情感顏色
const getSentimentColor = (sentiment) => {
  switch (sentiment) {
    case '正面': return 'text-green-400'
    case '負面': return 'text-red-400'
    case '警戒': return 'text-orange-400'
    default: return 'text-gray-400'
  }
}

// 工具函數：獲取情感表情符號
const getSentimentEmoji = (sentiment) => {
  switch (sentiment) {
    case '正面': return '😊'
    case '負面': return '😞'
    case '警戒': return '⚠️'
    default: return '😐'
  }
}

// 工具函數：獲取詐騙風險顏色
const getFraudRiskColor = (level) => {
  switch (level) {
    case '高風險': return 'text-red-400'
    case '中風險': return 'text-orange-400'
    case '低風險': return 'text-green-400'
    default: return 'text-gray-400'
  }
}

// 工具函數：獲取詐騙風險邊框顏色
const getFraudRiskBorderColor = (level) => {
  switch (level) {
    case '高風險': return 'border-red-500'
    case '中風險': return 'border-orange-500'
    case '低風險': return 'border-green-500'
    default: return 'border-gray-500'
  }
}

// 工具函數：獲T取詐騙風險表情符號
const getFraudRiskEmoji = (level) => {
  switch (level) {
    case '高風險': return '🚨'
    case '中風險': return '⚠️'
    case '低風險': return '✅'
    default: return '❓'
  }
}

// 監聽設定變化（API Key 由後端管理，前端只監聽服務選擇）
onMounted(() => {
  initializeSettings()
  
  // 根據初始標籤頁設定預設服務
  if (activeTab.value === 'upload') {
    transcriptionService.value = 'whisper-api'
  } else if (activeTab.value === 'record') {
    transcriptionService.value = 'webspeech'
  }
})

watch([transcriptionService, analysisService], () => {
  updateApiReadyStatus()
  saveSettings()
})

// 監聽標籤頁切換，重新載入對應的配置
watch(activeTab, async (newTab) => {
  // 重新載入配置
  await initializeSettings()
})

// 清理資源
onUnmounted(() => {
  if (recordingTimer) {
    clearInterval(recordingTimer)
  }
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
  if (recognition) {
    recognition.stop()
  }
})
</script>

<style scoped>
audio {
  width: 100%;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 錄音動畫效果 */
@keyframes recording-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.recording-animation {
  animation: recording-pulse 1s ease-in-out infinite;
}

/* 音量條動畫 */
@keyframes volume-bar {
  0%, 100% {
    height: 1rem;
  }
  50% {
    height: 2.5rem;
  }
}

.animation-delay-100 {
  animation-delay: 0.1s;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}

/* 拖放區域懸停效果 */
.drag-over {
  border-color: #22d3ee !important;
  background-color: rgba(34, 211, 238, 0.1);
}

/* 處理狀態的載入動畫 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 按鈕懸停效果 */
.button-hover-effect {
  transition: all 0.3s ease;
  transform: translateY(0);
}

.button-hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* 卡片進入動畫 */
@keyframes slideInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in-up {
  animation: slideInUp 0.5s ease-out;
}

/* 文字淡入效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.8s ease-in;
}

/* 脈衝效果 */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(34, 211, 238, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(34, 211, 238, 0.8);
  }
}

.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* 響應式設計 */
@media (max-width: 640px) {
  .main-card {
    padding: 1rem;
    margin: 0.5rem;
  }
  
  .title-text {
    font-size: 2rem;
  }
  
  .subtitle-text {
    font-size: 0.875rem;
  }
}
</style>