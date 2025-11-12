<!-- Quiz.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-black text-slate-100 p-6 relative">
    <!-- 駭客電網動畫層 -->
    <div class="hacker-grid"></div>
    
    <div class="w-full max-w-2xl relative">
      <!-- 背景裝飾層 -->
      <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-purple-600/10 rounded-2xl blur-xl"></div>
      <div class="absolute inset-0 bg-gradient-to-tr from-slate-800/40 via-slate-900/60 to-slate-800/40 rounded-2xl backdrop-blur-sm"></div>
      
      <!-- 主要內容區域 -->
      <div class="relative z-10 bg-gradient-to-br from-slate-800/70 via-slate-900/80 to-slate-800/70 border border-cyan-400/20 rounded-2xl p-6 backdrop-blur-md shadow-2xl shadow-cyan-500/10">
        <!-- 頂部光暈效果 -->
        <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent rounded-full"></div>
        <!-- 頂部標題區 -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 mb-4">
            <div class="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <span class="text-lg">🛡️</span>
            </div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              你的靈魂是哪種防詐動物？
            </h1>
          </div>
          
          <div class="max-w-lg mx-auto space-y-4 text-slate-300 leading-relaxed">
            <p class="text-lg font-medium text-slate-200">
              🧬 16 型防詐人格解析
            </p>
            
            <div class="text-sm space-y-3">
              <p class="text-center">在數位叢林中，每個靈魂都藏著一種動物的本能。</p>
                <p>當詐騙簡訊出現時，你的動物靈魂會怎麼反應？...</p>
              
              <p class="text-center">透過 <strong class="text-cyan-400">14 道情境題</strong>，解析動物靈魂中的四大核心軸線。</p>
              
              <div class="bg-slate-800/50 rounded-lg p-3 border border-cyan-400/20">
                <p class="text-xs text-cyan-300 font-medium mb-2">🎯 測驗特色：</p>
                <ul class="text-xs space-y-1 text-slate-400">
                  <li>• 結合 MBTI 心理測驗的嚴謹性</li>
                  <li>• 深度剖析決策模式與風險偏好</li>
                  <li>• 專業的金融防詐實務情境</li>
                  <li>• 完整的特質分析與風險報告</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 開始按鈕組 -->
        <div v-if="!started" class="flex flex-col sm:flex-row gap-3 justify-center">
          <button @click="start" class="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transform">
            <span class="flex items-center justify-center gap-2">
              <span>🚀</span>
              啟動測驗
            </span>
          </button>
          <button @click="$emit('cancel')" class="px-8 py-3 border border-slate-600 hover:border-slate-500 rounded-xl font-medium transition-all duration-300 hover:bg-slate-800/50 hover:scale-105 transform">
            返回
          </button>
        </div>

        <!-- 測驗進行中 -->
        <div v-else>
          <!-- 進度條優化版 -->
          <div class="mb-8">
            <!-- 進度標題 -->
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {{ currentIndex + 1 }}
                </div>
                <span class="text-cyan-300 font-semibold">共 {{ questions.length }} 題</span>
              </div>
              <div class="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-emerald-500/30">
                <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span class="text-emerald-400 font-semibold text-sm">防詐指數 {{ Math.round(awarenessPreview) }}</span>
              </div>
            </div>
            
            <!-- 進度條 -->
            <div class="relative mb-2">
              <div class="w-full bg-slate-800/60 rounded-full h-3 overflow-hidden border border-slate-700/50">
                <div class="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 h-full rounded-full transition-all duration-700 ease-out relative"
                     :style="{ width: ((currentIndex + 1) / questions.length * 100) + '%' }">
                  <!-- 進度條內的光效 -->
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              <!-- 外層光暈 -->
              <div class="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-cyan-400/30 via-blue-500/30 to-purple-500/30 rounded-full blur-sm -z-10"
                   :style="{ width: ((currentIndex + 1) / questions.length * 100) + '%' }">
              </div>
            </div>
            
            <!-- 進度百分比 -->
            <div class="text-center">
              <span class="text-xs text-slate-400">{{ Math.round((currentIndex + 1) / questions.length * 100) }}% 完成</span>
            </div>
          </div>

          <!-- 題目卡片優化版 -->
          <div class="relative mb-8">
            <!-- 卡片背景裝飾 -->
            <div class="absolute inset-0 bg-gradient-to-br from-slate-700/20 via-slate-800/30 to-slate-700/20 rounded-2xl blur-sm"></div>
            
            <div class="relative bg-gradient-to-br from-slate-800/70 via-slate-900/80 to-slate-800/70 p-6 rounded-2xl border border-slate-600/40 backdrop-blur-sm">
              <!-- 題目編號標籤 -->
              <div class="absolute -top-3 left-6">
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg">
                  Q{{ currentIndex + 1 }}
                </div>
              </div>
              
              <!-- 題目文字 -->
              <div class="mt-2 mb-6">
                <div class="text-slate-100 font-medium text-lg leading-relaxed" v-html="questions[currentIndex].text"></div>
              </div>

              <!-- 選項按鈕組 -->
              <div class="space-y-3">
                <button v-for="(opt, idx) in questions[currentIndex].options"
                        :key="idx"
                        @click="choose(idx)"
                        class="group relative w-full text-left p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                        :class="selected === idx ? 
                          'bg-gradient-to-r from-cyan-500/25 via-blue-600/20 to-cyan-500/25 border-cyan-400/60 shadow-lg shadow-cyan-500/25' : 
                          'border-slate-600/50 hover:border-slate-500/70 hover:bg-slate-800/50'">
                  
                  <!-- 選項字母標籤 -->
                  <div class="absolute left-2 top-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-300"
                       :class="selected === idx ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'">
                    {{ String.fromCharCode(65 + idx) }}
                  </div>
                  
                  <!-- 選中狀態的背景光效 -->
                  <div v-if="selected === idx" class="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-transparent to-cyan-400/5 rounded-xl"></div>
                  
                  <!-- 選項文字 -->
                  <div class="ml-8 font-medium text-slate-200 group-hover:text-slate-100 transition-colors duration-300">
                    {{ opt }}
                  </div>
                  
                  <!-- 選中指示器 -->
                  <div v-if="selected === idx" class="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div class="w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 animate-pulse"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- 導航按鈕組優化版 -->
          <div class="flex justify-between items-center">
            <!-- 上一題按鈕 -->
            <button @click="prev" 
                    :disabled="currentIndex === 0" 
                    class="flex items-center gap-2 px-6 py-3 border border-slate-600 rounded-xl font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-500 hover:bg-slate-800/50 hover:scale-105 disabled:hover:scale-100">
              <span>←</span>
              <span>上一題</span>
            </button>
            
            <!-- 下一題/完成按鈕 -->
            <div class="flex items-center gap-4">
              <!-- 進度指示點 -->
              <div class="hidden sm:flex items-center gap-1">
                <div v-for="i in questions.length" :key="i" 
                     class="w-2 h-2 rounded-full transition-all duration-300"
                     :class="i <= currentIndex + 1 ? 'bg-cyan-400' : 'bg-slate-600'"></div>
              </div>
              
              <!-- 主要操作按鈕 -->
              <div v-if="currentIndex < questions.length - 1">
                <button @click="nextIfSelected" 
                        class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105">
                  <span>下一題</span>
                  <span>→</span>
                </button>
              </div>
              <div v-else>
                <button @click="finish" 
                        class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105">
                  <span>✨</span>
                  <span>查看結果</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import soulAnimalStore from './soulAnimalStore.js'
import { useSoulAnimalStore } from './stores/soulAnimalSystem.js'

// 定義 emits
const emit = defineEmits(['resultReady', 'cancel'])

// 初始化 Soul Animal Store
const soulAnimalSystem = useSoulAnimalStore()

// 定義 props - 接收當前用戶
const props = defineProps({
  currentUser: {
    type: String,
    default: 'guest'
  },
  userId: {
    type: [Number, String],
    default: null
  }
})

async function submitQuizResults(answerPayload) {
  if (!props.userId) {
    console.warn('Quiz.vue: 無法提交測驗結果，缺少 userId')
    return null
  }

  try {
    const response = await fetch('http://localhost:8000/quiz/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: Number(props.userId),
        answers: answerPayload
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      console.warn('Quiz.vue: 提交測驗結果失敗:', result.message || result.error)
      return null
    }

    console.log('Quiz.vue: 測驗結果提交成功:', result.data)
    return result.data
  } catch (error) {
    console.error('Quiz.vue: 提交測驗結果失敗:', error)
    return null
  }
}

/**
 * 防詐特務靈魂測驗 (16 型平衡版) - 14 題專業心理測驗
 * 結合心理測驗的嚴謹性與金融防詐的實務情境
 */
const questions = [
  // 第一部分：基礎輪廓
  { 
    text: 'Q1. 您的年齡區間最接近？', 
    options: ['18 歲（含）以下', '19 - 25 歲', '26 - 35 歲', '36 - 50 歲', '51 歲（含）以上'] 
  },
  { 
    text: 'Q2. 您的性別是？', 
    options: ['男性', '女性', '其他 / 不便透露'] 
  },
  
  // 第二部分：情境決策測驗
  { 
    text: 'Q3. （情境）一通自稱「知名電商客服」的來電，準確說出您上週的訂單內容，並聲稱「因系統錯誤導致重複扣款」，要求您前往 ATM 或操作網路銀行來「解除分期」。您的第一反應是？', 
    options: [
      '配合指示，畢竟對方資訊正確，且金錢損失很緊急。',
      '保持通話，但同時自行登入官方 App 檢查訂單狀態。',
      '禮貌地告訴對方：「我會自行聯繫銀行確認」，然後主動掛斷電話。',
      '直接掛斷，並撥打 165 反詐騙專線檢舉。'
    ] 
  },
  { 
    text: 'Q4. （情境）您在社群平台看到一則廣告：「AI 智能帶單，保證獲利！獨家內線，月報酬 50%！」並附上一個 QR Code 邀請您加入「老師」的投資群組。您會？', 
    options: [
      '馬上加入！這是一個千載難逢的機會，先進群看看。',
      '有點心動，但會先觀望，看看群組裡其他人的「獲利截圖」。',
      '搜尋這位「老師」的評價，並查詢該投資平台是否合法。',
      '不相信任何「保證獲利」的說詞，直接忽略。'
    ] 
  },
  { 
    text: 'Q5. （情境）收到一封主旨為「【緊急通知】您的雲端空間已滿，帳號將於 24 小時後停權」的電子郵件，要求您立即點擊連結登入，以「升級方案並保留資料」。您會？', 
    options: [
      '恐慌！立刻點擊郵件中的連結登入，以免資料遺失。',
      '猶豫，先點開連結看看登入頁面是否「看起來」像真的。',
      '不點擊郵件連結。自行打開瀏覽器，手動輸入官方網址登入檢查。',
      '這很可疑。仔細檢查寄件人 Email 是否來自官方網域。'
    ] 
  },
  { 
    text: 'Q6. （情境）當您在一個新的網站上購物，結帳時發現網址是「http://」開頭，而不是「https://」，您會？', 
    options: [
      '沒注意過這個，方便就好，直接輸入信用卡號。',
      '知道「https」比較安全，但如果真的很想買，還是會填寫。',
      '立刻停止交易。缺少 S (Secure) 代表資料傳輸未加密，風險太高。',
      '不只看 https，還會檢查網站是否有拼寫錯誤。'
    ] 
  },
  { 
    text: 'Q7. （情境）朋友用 LINE 傳來一個連結，訊息寫著：「幫我投票，我小孩參加攝影比賽，拜託了！」點開後，網站要求您「必須使用 LINE 帳號登入」才能投票。您會？', 
    options: [
      '朋友的請求，馬上登入投票，不疑有他。',
      '先問朋友：「這是真的嗎？」，同時觀察網站是否粗糙。',
      '拒絕登入。提醒朋友這類網站常是為了盜用帳號或騙取個資。',
      '懷疑朋友帳號被盜。立即改用電話或視訊向本人確認。'
    ] 
  },
  { 
    text: 'Q8. （情境）您收到一則簡訊：「【監理站】您有 2,800 元交通罰款尚未繳納，逾期將加倍處罰。請點此連結完成線上支付。」您會？', 
    options: [
      '擔心逾期被罰更多，先點進去看要付多少錢。',
      '回想最近是否有違規，並點擊連結查看詳情。',
      '忽略簡訊。只相信紙本罰單，或自行上「監理服務網」查詢。',
      '判斷為詐騙。政府機關的網址不會是短網址。'
    ] 
  },
  { 
    text: 'Q9. （情境）當您安裝一個新的手機 App（例如手電筒或修圖軟體）時，它向您要求「讀取聯絡人」和「讀取簡訊」的權限，您會？', 
    options: [
      '為了正常使用 App，通常會全部「允許」。',
      '覺得有點奇怪，但如果很多人在用，應該沒問題。',
      '仔細思考「為什麼手電筒需要我的簡訊？」，並拒絕不合理的權限。',
      '立即解除安裝這個 App，並去商店留下負評警告他人。'
    ] 
  },
  { 
    text: 'Q10. （情境）一通自稱「檢警單位」的電話，告知您「身份被冒用，涉及洗錢案件」，並要求您「為配合偵查，必須將名下存款轉至『安全監管帳戶』」，否則將凍結您所有資產。您會？', 
    options: [
      '極度震驚與害怕，完全配合「檢察官」的指示轉帳。',
      '要求對方提供單位、姓名和編號，並表示要掛斷電話後自行查證。',
      '保持冷靜，並告知對方：「請發正式傳票給我」，然後掛斷。',
      '識破這是典型的「假檢警」詐騙，並反問對方：「你知道我是誰嗎？」'
    ] 
  },
  { 
    text: 'Q11. （情境）您收到一則簡訊：『恭喜您！您在 XX 商城的中秋活動中抽中了 5000 元禮券。請點擊連結，並在 3 天內填寫資料領獎。』您會？', 
    options: [
      '太幸運了！馬上點連結填寫領獎資料。',
      '有點懷疑，但先點進去看要填什麼，如果太奇怪就關掉。',
      '自行打開 XX 商城的官方 App 或網站，查看是否有這個活動。',
      '獎品通常是假的，而且又是短網址，直接刪除。'
    ] 
  },
  { 
    text: 'Q12. （情境）您在 FB/IG 看到一則「家庭代工/PO文小幫手」的徵才廣告，號稱「在家工作，日賺 2000-5000 元，只需手機」。要求您先加入 LINE 帳號面試。您會？', 
    options: [
      '值得一試，先加 LINE 了解看看，也許是個好機會。',
      '保持戒心，但問清楚工作內容，如果不用先付錢就還好。',
      '搜尋這家公司的評價，並質疑「日賺 5000」的合理性。',
      '100% 是詐騙。高薪工作不可能這麼簡單，還可能變人頭帳戶。'
    ] 
  },
  { 
    text: 'Q13. 在判斷一則訊息是否為詐騙時，您更依賴？', 
    options: [
      '我的「直覺」和對方的「態度」。如果對方很誠懇或很兇，感覺就像真的。',
      '內容的「合理性」。如果情境聽起來太誇張，就可能是假的。',
      '查核「具體細節」。例如檢查網址拼寫、公司統編、電話區碼等。',
      '詢問「專業意見」。我會先把訊息轉傳給朋友、家人或 165 詢問。'
    ] 
  },
  { 
    text: 'Q14. 總結來說，當面對一個「限時好康」或「緊急威脅」時，您更傾向於？', 
    options: [
      '先行動再說，怕錯過機會或遭受損失。',
      '先冷靜下來，花時間查證，寧可錯過也不願冒險。',
      '依賴我的直覺，如果感覺對了就衝，感覺不對就停。',
      '仔細分析細節，不論是好是壞，有證據才行動。'
    ] 
  },
  { 
    text: 'Q15. （心理特質）在日常生活中，當朋友向您推薦一個新的 App、投資商品或網路服務時，您的第一反應通常是？', 
    options: [
      '朋友推薦的應該不錯，我會立刻下載或嘗試。',
      '先了解一下基本功能，如果朋友說得有道理就試試看。',
      '會仔細研究評價、安全性和隱私條款後再決定。',
      '通常會婉拒，我比較習慣使用自己熟悉的服務。'
    ] 
  }
]

const QUESTION_IDS = questions.map((_, index) => `Q${index + 1}`)

/**
 * 四大靈魂軸線評分系統 (16 型均勻分布版防詐人格)
 * 軸線說明：
 * K/T (權威): K (Skeptical - 懷疑型) / T (Trusting - 信任型)
 * D/I (時間): D (Deliberate - 審慎型) / I (Immediate - 即時型) 
 * S/G (驗證): S (Specifics - 細節型) / G (Gist - 直覺型)
 * L/R (獎懲): L (Loss-Averse - 規避損失) / R (Reward-Seeking - 追求獎勵)
 * 
 * 【均勻分布設計原則】
 * 1. 每個軸線在所有題目中保持±0的平衡，避免系統性偏向
 * 2. 降低單題影響力，使用較小的分數值(±1為主)
 * 3. 確保每個16型組合都有相等的理論出現機率
 * 4. 移除權重系統，所有題目等權重處理
 * 5. 增加題目數量以提高分布的穩定性
 */
const SCORING_MAP = {
  // Q1: 年齡區間 - 影響詐騙風險分佈
  q1: [
    { axes: [0,0,0,0], ageGroup: 'teen', awarenessDelta: -1 },     // 18歲以下
    { axes: [0,0,0,0], ageGroup: 'young', awarenessDelta: 0 },    // 19-25歲  
    { axes: [0,0,0,0], ageGroup: 'adult', awarenessDelta: +1 },   // 26-35歲
    { axes: [0,0,0,0], ageGroup: 'middle', awarenessDelta: +2 },  // 36-50歲
    { axes: [0,0,0,0], ageGroup: 'senior', awarenessDelta: +1 }   // 51歲以上
  ],
  
  // Q2: 性別 - 影響詐騙風險類型
  q2: [
    { axes: [0,0,0,0], gender: 'male', awarenessDelta: 0 },       // 男性
    { axes: [0,0,0,0], gender: 'female', awarenessDelta: 0 },     // 女性  
    { axes: [0,0,0,0], gender: 'other', awarenessDelta: 0 }       // 其他
  ],
  
  // Q3: 電商客服詐騙情境 - 均勻分布設計
  q3: [
    { axes: [+1,+1,+1,+1], fraudRisk: ['ecommerce'], awarenessDelta: -3 }, // A: TISR
    { axes: [+1,-1,-1,-1], fraudRisk: ['ecommerce'], awarenessDelta: +1 }, // B: TDGL  
    { axes: [-1,-1,+1,+1], fraudRisk: [], awarenessDelta: +3 },           // C: KDSR
    { axes: [-1,+1,-1,-1], fraudRisk: [], awarenessDelta: +3 }            // D: KIGL
  ],
  
  // Q4: 投資詐騙情境 - 均勻分布設計
  q4: [
    { axes: [+1,+1,-1,+1], fraudRisk: ['investment'], awarenessDelta: -3 }, // A: TIGR
    { axes: [-1,-1,-1,-1], fraudRisk: [], awarenessDelta: +2 },           // B: KDGL
    { axes: [+1,-1,+1,-1], fraudRisk: ['investment'], awarenessDelta: 0 }, // C: TDSL
    { axes: [-1,+1,+1,+1], fraudRisk: [], awarenessDelta: +3 }            // D: KISR
  ],
  
  // Q5: 釣魚郵件情境 - 均勻分布設計
  q5: [
    { axes: [+1,+1,+1,-1], fraudRisk: ['phishing'], awarenessDelta: -2 }, // A: TISL
    { axes: [+1,-1,-1,+1], fraudRisk: ['phishing'], awarenessDelta: -1 }, // B: TDGR
    { axes: [-1,-1,+1,-1], fraudRisk: [], awarenessDelta: +2 },          // C: KDSL
    { axes: [-1,+1,-1,+1], fraudRisk: [], awarenessDelta: +3 }           // D: KIGR
  ],
  
  // Q6: HTTPS安全意識 - 均勻分布設計
  q6: [
    { axes: [+1,-1,+1,+1], fraudRisk: ['ecommerce'], awarenessDelta: -1 }, // A: TDSR
    { axes: [-1,+1,+1,-1], fraudRisk: [], awarenessDelta: +3 },            // B: KISL
    { axes: [+1,+1,-1,-1], fraudRisk: ['ecommerce'], awarenessDelta: -2 }, // C: TIGL
    { axes: [-1,-1,-1,+1], fraudRisk: [], awarenessDelta: +2 }             // D: KDGR
  ],
  
  // Q7: 熟人連結詐騙 - 重複組合增加權重
  q7: [
    { axes: [-1,-1,-1,-1], fraudRisk: [], awarenessDelta: +3 },           // A: KDGL
    { axes: [+1,+1,+1,+1], fraudRisk: ['social'], awarenessDelta: -3 },   // B: TISR
    { axes: [+1,-1,+1,-1], fraudRisk: [], awarenessDelta: +1 },           // C: TDSL
    { axes: [-1,+1,-1,+1], fraudRisk: [], awarenessDelta: +2 }            // D: KIGR
  ],
  
  // Q8: 政府機關詐騙 - 重複組合增加權重
  q8: [
    { axes: [+1,-1,-1,+1], fraudRisk: ['government'], awarenessDelta: -2 }, // A: TDGR
    { axes: [-1,+1,+1,+1], fraudRisk: [], awarenessDelta: +3 },            // B: KISR
    { axes: [+1,+1,-1,-1], fraudRisk: ['government'], awarenessDelta: -3 }, // C: TIGL
    { axes: [-1,-1,+1,-1], fraudRisk: [], awarenessDelta: +2 }             // D: KDSL
  ],
  
  // Q9: App權限詐騙 - 重複組合增加權重
  q9: [
    { axes: [-1,-1,+1,+1], fraudRisk: [], awarenessDelta: +3 },           // A: KDSR
    { axes: [+1,+1,+1,-1], fraudRisk: ['privacy'], awarenessDelta: -2 },  // B: TISL
    { axes: [+1,-1,-1,-1], fraudRisk: ['privacy'], awarenessDelta: -1 },  // C: TDGL
    { axes: [-1,+1,-1,+1], fraudRisk: [], awarenessDelta: +2 }            // D: KIGR
  ],
  
  // Q10: 假檢警詐騙 - 重複組合增加權重
  q10: [
    { axes: [+1,+1,-1,+1], fraudRisk: ['authority'], awarenessDelta: -4 }, // A: TIGR
    { axes: [-1,-1,-1,-1], fraudRisk: [], awarenessDelta: +3 },           // B: KDGL
    { axes: [+1,-1,+1,+1], fraudRisk: [], awarenessDelta: +1 },           // C: TDSR
    { axes: [-1,+1,+1,-1], fraudRisk: [], awarenessDelta: +2 }            // D: KISL
  ],
  
  // Q11: 中獎詐騙 - 重複組合增加權重
  q11: [
    { axes: [+1,-1,-1,-1], fraudRisk: ['lottery'], awarenessDelta: -1 },   // A: TDGL
    { axes: [-1,+1,-1,-1], fraudRisk: [], awarenessDelta: +3 },           // B: KIGL
    { axes: [+1,+1,+1,+1], fraudRisk: ['lottery'], awarenessDelta: -3 },  // C: TISR
    { axes: [-1,-1,+1,+1], fraudRisk: [], awarenessDelta: +2 }            // D: KDSR
  ],
  
  // Q12: 工作詐騙 - 重複組合增加權重
  q12: [
    { axes: [-1,+1,+1,-1], fraudRisk: [], awarenessDelta: +3 },           // A: KISL
    { axes: [+1,-1,-1,+1], fraudRisk: ['job'], awarenessDelta: -1 },      // B: TDGR
    { axes: [-1,-1,-1,+1], fraudRisk: [], awarenessDelta: +2 },          // C: KDGR
    { axes: [+1,+1,+1,-1], fraudRisk: ['job'], awarenessDelta: -2 }       // D: TISL
  ],
  
  // Q13: 判斷依據 - 重複組合增加權重
  q13: [
    { axes: [+1,+1,-1,-1], fraudRisk: [], awarenessDelta: 0 },            // A: TIGL
    { axes: [-1,-1,+1,-1], fraudRisk: [], awarenessDelta: +2 },           // B: KDSL
    { axes: [+1,-1,+1,+1], fraudRisk: [], awarenessDelta: +1 },           // C: TDSR
    { axes: [-1,+1,-1,+1], fraudRisk: [], awarenessDelta: +1 }            // D: KIGR
  ],
  
  // Q14: 總結行為模式 - 重複組合增加權重
  q14: [
    { axes: [-1,-1,-1,+1], fraudRisk: [], awarenessDelta: +2 },           // A: KDGR
    { axes: [+1,+1,+1,+1], fraudRisk: [], awarenessDelta: -2 },           // B: TISR
    { axes: [-1,+1,-1,-1], fraudRisk: [], awarenessDelta: +1 },           // C: KIGL
    { axes: [+1,-1,+1,-1], fraudRisk: [], awarenessDelta: +3 }            // D: TDSL
  ],
  
  // Q15: 朋友推薦 - 最終平衡調整
  q15: [
    { axes: [+1,-1,-1,+1], fraudRisk: [], awarenessDelta: -1 },           // A: TDGR
    { axes: [-1,-1,+1,+1], fraudRisk: [], awarenessDelta: +1 },           // B: KDSR
    { axes: [+1,+1,-1,+1], fraudRisk: [], awarenessDelta: -2 },           // C: TIGR
    { axes: [-1,+1,+1,-1], fraudRisk: [], awarenessDelta: +2 }            // D: KISL
  ]
}

/* state */
const started = ref(false)
const currentIndex = ref(0)
const selected = ref(null)
const answers = reactive(Array(questions.length).fill(null))

function start(){ started.value = true }
function choose(idx){
  selected.value = idx
  answers[currentIndex.value] = idx
}
function prev(){
  if(currentIndex.value === 0) return
  currentIndex.value--
  selected.value = answers[currentIndex.value]
}
function nextIfSelected(){
  if(selected.value === null) return alert('請先選擇一個選項')
  currentIndex.value++
  selected.value = answers[currentIndex.value] ?? null
}
async function finish(){
  if(answers.slice(0, questions.length).some(a => a === null)) {
    return alert('請完成所有題目')
  }
  // 計算結果
  const result = calculateResult(answers)
  console.log('Quiz完成，結果:', result) // 調試用
  
  // 分析16種動物出現機率（開發除錯用）
  if (import.meta.env.DEV) {
    analyzeAnimalDistribution()
  }
  
  // 保存測驗結果到 store
  try {
    soulAnimalStore.saveRecord(props.currentUser, result)
    console.log(`測驗結果已保存至用戶 ${props.currentUser}`)
  } catch (error) {
    console.error('保存測驗結果失敗:', error)
  }

  const answerPayload = answers.map((choiceIdx, idx) => {
    const choiceLetter = choiceIdx !== null ? String.fromCharCode(65 + choiceIdx) : null
    return {
      question_id: QUESTION_IDS[idx] || `Q${idx + 1}`,
      choice: choiceLetter
    }
  }).filter(entry => entry.choice)

  const submitResult = await submitQuizResults(answerPayload)
  if (!submitResult) {
    console.warn('Quiz.vue: 後端未能成功儲存測驗結果')
  }
  
  // 🎉 Quiz 完成獎勵：給予 100 XP
  try {
    soulAnimalSystem.awardQuizCompletionXP()
    console.log(`🎉 Quiz 完成！用戶 ${props.currentUser} 獲得 100 XP 獎勵`)
  } catch (error) {
    console.error('獎勵 XP 失敗:', error)
  }
  
  // emit 結果給父元件
  emit('resultReady', result)
}

// 開發用：分析16種動物的理論出現機率
function analyzeAnimalDistribution() {
  console.log('=== 16種動物機率分析 ===')
  
  // 模擬1000次隨機答題
  const animalCounts = {}
  const totalTests = 1000
  
  for (let test = 0; test < totalTests; test++) {
    // 生成隨機答案 (跳過前2題人口統計)
    const randomAnswers = [
      0, 0, // Q1, Q2: 人口統計，不影響動物類型
      Math.floor(Math.random() * 4), // Q3
      Math.floor(Math.random() * 4), // Q4
      Math.floor(Math.random() * 4), // Q5
      Math.floor(Math.random() * 4), // Q6
      Math.floor(Math.random() * 4), // Q7
      Math.floor(Math.random() * 4), // Q8
      Math.floor(Math.random() * 4), // Q9
      Math.floor(Math.random() * 4), // Q10
      Math.floor(Math.random() * 4), // Q11
      Math.floor(Math.random() * 4), // Q12
      Math.floor(Math.random() * 4), // Q13
      Math.floor(Math.random() * 4)  // Q14
    ]
    
    const result = calculateResult(randomAnswers)
    const animalCode = result.animalType.code
    
    animalCounts[animalCode] = (animalCounts[animalCode] || 0) + 1
  }
  
  // 16 型動物對應表（用於顯示名稱）
  const animalNameMap = {
    'KDSL': '🦊 狐狸型', 'KDSR': '🦅 老鷹型', 'KDGL': '🦉 貓頭鷹型', 'KDGR': '🦈 鯊魚型',
    'KISL': '🐿️ 松鼠型', 'KISR': '🐙 章魚型', 'KIGL': '🐱 貓咪型', 'KIGR': '🐺 狼型',
    'TDSL': '🐢 烏龜型', 'TDSR': '🐘 大象型', 'TDGL': '🦛 河馬型', 'TDGR': '🦍 金剛型',
    'TISL': '🐭 老鼠型', 'TISR': '� 獅子型', 'TIGL': '🦌 麋鹿型', 'TIGR': '🐶 柴犬型'
  }
  
  // 排序並顯示結果
  const sorted = Object.entries(animalCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => ({
      code,
      count,
      percentage: ((count / totalTests) * 100).toFixed(1),
      animal: animalNameMap[code] || code
    }))
  
  console.table(sorted)
  console.log('總測試次數:', totalTests)
  console.log('出現的動物種類:', Object.keys(animalCounts).length, '/ 16')
  
  // 檢查是否有動物從未出現
  const allCodes = ['KDSL', 'KDSR', 'KDGL', 'KDGR', 'KISL', 'KISR', 'KIGL', 'KIGR', 
                   'TDSL', 'TDSR', 'TDGL', 'TDGR', 'TISL', 'TISR', 'TIGL', 'TIGR']
  const missingAnimals = allCodes.filter(code => !animalCounts[code])
  
  if (missingAnimals.length > 0) {
    console.warn('從未出現的動物類型:', missingAnimals)
  }
  
  console.log('=== 分析結束 ===')
  
  // 檢查軸線分布
  const axesStats = { kt: [], di: [], sg: [], lr: [] }
  for (let test = 0; test < 100; test++) {
    const randomAnswers = Array(14).fill(0).map((_, i) => i < 2 ? 0 : Math.floor(Math.random() * 4))
    const axesScores = [0, 0, 0, 0]
    
    randomAnswers.forEach((choice, idx) => {
      const key = `q${idx+1}`
      const map = SCORING_MAP[key]
      if(map && map[choice] && map[choice].axes) {
        map[choice].axes.forEach((score, axisIdx) => {
          axesScores[axisIdx] += score
        })
      }
    })
    
    axesStats.kt.push(axesScores[0])
    axesStats.di.push(axesScores[1])
    axesStats.sg.push(axesScores[2])
    axesStats.lr.push(axesScores[3])
  }
  
  console.log('軸線分數統計 (100次測試):')
  Object.entries(axesStats).forEach(([axis, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    const negCount = scores.filter(s => s < 0).length
    const posCount = scores.filter(s => s > 0).length
    const zeroCount = scores.filter(s => s === 0).length
    
    console.log(`${axis}: 平均=${avg.toFixed(2)}, 負數=${negCount}%, 正數=${posCount}%, 零=${zeroCount}%`)
  })
}

/* compute preview of awareness */
const awarenessPreview = computed(()=>{
  // accumulate awarenessDelta for answered questions so far
  let base = 50
  for(let i=0;i<answers.length;i++){
    const a = answers[i]
    if(a === null) continue
    const key = `q${i+1}`
    const map = SCORING_MAP[key]
    if(map && map[a]){
      base += map[a].awarenessDelta || 0
    }
  }
  return base
})

/* ========== 核心計算函數 ========== */

function calculateResult(answersArray){
  // 四大軸線累計器 [K/T, D/I, S/G, L/R]
  const axesScores = [0, 0, 0, 0]
  let awareness = 50
  const fraudRisks = []
  let ageGroup = 'adult'
  let gender = 'unknown'
  
  // 科技素養評分系統 (Q5, Q6, Q8, Q9, Q11 專項評估)
  let techLiteracy = 0
  const techQuestions = [4, 5, 7, 8, 10] // Q5, Q6, Q8, Q9, Q11 (0-based index)

  answersArray.forEach((choice, idx)=>{
    const key = `q${idx+1}`
    const map = SCORING_MAP[key]
    if(!map || !map[choice]) return
    
    const option = map[choice]
    
    // 計算權重 (Q13, Q14 為自我認知題，權重加重)
    const weight = option.weight || 1.0
    
    // 累計四軸分數 (應用權重)
    if(option.axes) {
      option.axes.forEach((score, axisIdx) => {
        axesScores[axisIdx] += Math.round(score * weight)
      })
    }
    
    // 累計其他屬性
    awareness += (option.awarenessDelta || 0)
    if(option.fraudRisk) fraudRisks.push(...option.fraudRisk)
    if(option.ageGroup) ageGroup = option.ageGroup
    if(option.gender) gender = option.gender
    
    // 科技素養專項評分 (獨立計算)
    if(techQuestions.includes(idx)) {
      const techScore = option.awarenessDelta || 0
      if(techScore >= 2) techLiteracy += 2        // 高科技素養
      else if(techScore >= 0) techLiteracy += 1   // 中等科技素養
      else techLiteracy += 0                      // 低科技素養
    }
  })

  // 根據四軸分數決定 16 型動物
  const animalType = determineAnimalType(axesScores)
  
  // 計算防詐意識等級
  let awarenessLabel = '中等'
  if (awareness >= 70) awarenessLabel = '高'
  else if (awareness >= 50) awarenessLabel = '中等'
  else awarenessLabel = '低'
  
  // 科技素養等級評定 (0-10 分制)
  let techLabel = '低'
  if (techLiteracy >= 7) techLabel = '高'
  else if (techLiteracy >= 4) techLabel = '中等'
  else techLabel = '低'

  // 根據動物人格判斷 Top 3 詐騙風險 (IF...THEN... 邏輯規則)
  const personalizedRisks = getFraudRisksByAnimal(animalType.code)

  return {
    animalType: animalType.type,
    animalData: animalType,
    axesScores,
    axesAnalysis: analyzeAxes(axesScores),
    awareness: Math.max(0, Math.min(100, Math.round(awareness))),
    awarenessLabel,
    techLiteracy,
    techLabel,
    ageGroup,
    gender,
    topFraudRisks: personalizedRisks, // 使用人格化風險分析
    // 向後兼容的欄位
    finalAnimal: animalType.type,
    agePrediction: ageGroup,
    genderPrediction: gender
  }
}

// 根據四軸分數決定 16 型動物
function determineAnimalType(axesScores) {
  const [kt, di, sg, lr] = axesScores
  
  console.log('=== 動物類型計算 Debug ===')
  console.log('四軸分數:', axesScores)
  console.log('kt:', kt, 'di:', di, 'sg:', sg, 'lr:', lr)
  
  // 決定每個軸線的傾向 (K/T, D/I, S/G, L/R)
  const authority = kt < 0 ? 'K' : 'T'    // 懷疑 vs 信任
  const timing = di < 0 ? 'D' : 'I'       // 審慎 vs 即時  
  const verification = sg < 0 ? 'G' : 'S'  // 直覺 vs 細節
  const motivation = lr < 0 ? 'L' : 'R'    // 損失規避 vs 獎勵追求
  
  const typeCode = authority + timing + verification + motivation
  
  console.log('軸線判斷:')
  console.log('authority:', kt, '->', authority, '(', kt < 0 ? '懷疑' : '信任', ')')
  console.log('timing:', di, '->', timing, '(', di < 0 ? '審慎' : '即時', ')')
  console.log('verification:', sg, '->', verification, '(', sg < 0 ? '直覺' : '細節', ')')
  console.log('motivation:', lr, '->', motivation, '(', lr < 0 ? '損失規避' : '獎勵追求', ')')
  console.log('最終類型代碼:', typeCode)
  
  // 16 型動物對應表
  const animalMap = {
    // 深潜分析局 (K-D - 懷疑且審慎)  
    'KDSL': { type: 'fox', name: '🦊 狐狸型', group: '深潛分析局', code: 'KDSL' },
    'KDSR': { type: 'eagle', name: '🦅 老鷹型', group: '深潛分析局', code: 'KDSR' },
    'KDGL': { type: 'owl', name: '🦉 貓頭鷹型', group: '深潛分析局', code: 'KDGL' },
    'KDGR': { type: 'shark', name: '🦈 鯊魚型', group: '深潛分析局', code: 'KDGR' },
    
    // 影襲特攻隊 (K-I - 懷疑但即時)
    'KISL': { type: 'squirrel', name: '🐿️ 松鼠型', group: '影襲特攻隊', code: 'KISL' },
    'KISR': { type: 'octopus', name: '🐙 章魚型', group: '影襲特攻隊', code: 'KISR' },
    'KIGL': { type: 'cat', name: '🐱 貓咪型', group: '影襲特攻隊', code: 'KIGL' },
    'KIGR': { type: 'wolf', name: '🐺 狼型', group: '影襲特攻隊', code: 'KIGR' },
    
    // 重裝守備隊 (T-D - 信任且審慎)
    'TDSL': { type: 'turtle', name: '🐢 烏龜型', group: '精準執行局', code: 'TDSL' },
    'TDSR': { type: 'elephant', name: '🐘 大象型', group: '精準執行局', code: 'TDSR' },
    'TDGL': { type: 'hippo', name: '🦛 河馬型', group: '精準執行局', code: 'TDGL' },
    'TDGR': { type: 'gorilla', name: '🦍 金剛型', group: '精準執行局', code: 'TDGR' },
    
    // 閃電先鋒 (T-I - 信任且即時)
    'TISL': { type: 'deer', name: '🦌 鹿型', group: '領導先鋒局', code: 'TISL' },
    'TISR': { type: 'lion', name: '🦁 獅子型', group: '領導先鋒局', code: 'TISR' },
    'TIGL': { type: 'elephant', name: '🐘 大象型', group: '領導先鋒局', code: 'TIGL' },
    'TIGR': { type: 'horse', name: '🐎 馬型', group: '領導先鋒局', code: 'TIGR' }
  }
  
  const result = animalMap[typeCode]
  if (!result) {
    console.warn('找不到對應的動物類型，使用預設狐狸型')
    return animalMap['KDSL'] // 預設為狐狸型
  }
  
  console.log('找到動物類型:', result)
  console.log('=== Debug 結束 ===')
  
  return result
}

// 分析四軸傾向
function analyzeAxes(axesScores) {
  const [kt, di, sg, lr] = axesScores
  
  return {
    authority: {
      score: kt,
      tendency: kt <= 0 ? 'Skeptical (懷疑型)' : 'Trusting (信任型)',
      strength: Math.abs(kt)
    },
    timing: {
      score: di, 
      tendency: di <= 0 ? 'Deliberate (審慎型)' : 'Immediate (即時型)',
      strength: Math.abs(di)
    },
    verification: {
      score: sg,
      tendency: sg <= 0 ? 'Gist (直覺型)' : 'Specifics (細節型)', 
      strength: Math.abs(sg)
    },
    motivation: {
      score: lr,
      tendency: lr <= 0 ? 'Loss-Averse (規避損失)' : 'Reward-Seeking (追求獎勵)',
      strength: Math.abs(lr)
    }
  }
}

// 根據動物人格判斷個人化詐騙風險 (IF...THEN... 邏輯規則)
function getFraudRisksByAnimal(animalCode) {
  const riskDatabase = {
    // 深潛分析局 (K-D) - 懷疑且審慎
    'KDSL': [
      ['複雜投資詐騙', '高', '對於過於複雜的投資商品可能因為想要理解而花費過多時間'],
      ['權威偽裝詐騙', '中', '對專業權威的質疑可能不夠徹底'],
      ['長期養套詐騙', '中', '謹慎的性格可能在長期接觸後降低警戒心']
    ],
    'KDSR': [
      ['高報酬投資詐騙', '中', '對投資機會的敏銳度可能成為弱點'],
      ['假專家詐騙', '低', '對權威的懷疑態度提供很好的保護'],
      ['技術類詐騙', '中', '對新技術的興趣可能被利用']
    ],
    'KDGL': [
      ['情感操控詐騙', '中', '直覺判斷可能被情緒化的詐騙手法影響'],
      ['熟人詐騙', '低', '對人的懷疑態度提供保護'],
      ['複雜金融詐騙', '低', '謹慎的分析能力很難被欺騙']
    ],
    'KDGR': [
      ['高風險投資詐騙', '中', '對獎勵的敏感可能在謹慎分析後仍被說服'],
      ['博弈類詐騙', '中', '對勝利的渴望可能成為弱點'],
      ['競爭類詐騙', '中', '好勝心可能被利用']
    ],
    
    // 影襲特攻隊 (K-I) - 懷疑但即時
    'KISL': [
      ['緊急威脅詐騙', '中', '面對威脅時的快速反應可能不夠深思熟慮'],
      ['損失恐懼詐騙', '高', '對損失的敏感和即時反應是主要弱點'],
      ['時間壓力詐騙', '中', '在時間壓力下可能做出衝動決定']
    ],
    'KISR': [
      ['快速獲利詐騙', '高', '對機會的敏感和快速行動可能被利用'],
      ['限時優惠詐騙', '中', '害怕錯過機會的心理可能被操控'],
      ['新潮詐騙', '中', '對新事物的好奇可能成為弱點']
    ],
    'KIGL': [
      ['直覺陷阱詐騙', '中', '過度依賴直覺可能誤判複雜詐騙'],
      ['情緒操控詐騙', '中', '情緒化的即時反應可能被利用'],
      ['社交詐騙', '低', '獨立性格提供一定保護']
    ],
    'KIGR': [
      ['競爭類詐騙', '高', '好勝心和快速行動的組合是主要弱點'],
      ['挑戰類詐騙', '中', '喜歡挑戰的性格可能被利用'],
      ['群體壓力詐騙', '中', '在群體中可能做出衝動決定']
    ],
    
    // 重裝守備隊 (T-D) - 信任且審慎
    'TDSL': [
      ['權威詐騙', '高', '對權威的信任是最大弱點'],
      ['長期詐騙', '中', '謹慎但信任的態度可能在長期接觸後被利用'],
      ['損失威脅詐騙', '高', '對損失的擔憂和對權威的信任結合是危險組合']
    ],
    'TDSR': [
      ['投資專家詐騙', '高', '對專家的信任和對獎勵的渴望是主要弱點'],
      ['穩健投資詐騙', '中', '看似穩健的投資方案可能降低警戒心'],
      ['權威推薦詐騙', '高', '來自權威的推薦很難抗拒']
    ],
    'TDGL': [
      ['情感詐騙', '中', '信任他人和依賴直覺的組合可能被利用'],
      ['慈善詐騙', '中', '同情心可能被不當利用'],
      ['熟人詐騙', '高', '對熟人的信任是最大弱點']
    ],
    'TDGR': [
      ['權威投資詐騙', '高', '權威+獎勵的組合是最危險的弱點'],
      ['成功故事詐騙', '中', '他人的成功故事可能很有說服力'],
      ['群體投資詐騙', '高', '看到他人獲利會強化投資慾望']
    ],
    
    // 閃電先鋒 (T-I) - 信任且即時
    'TISL': [
      ['緊急詐騙', '高', '信任+恐慌的組合是最危險的弱點'],
      ['權威威脅詐騙', '高', '對權威的信任在緊急情況下特別危險'],
      ['親友緊急詐騙', '高', '對親友的信任和即時反應的組合']
    ],
    'TISR': [
      ['快速機會詐騙', '高', '信任+機會敏感度是主要弱點'],
      ['社群詐騙', '高', '在社群中容易被影響做出快速決定'],
      ['新潮投資詐騙', '高', '對新事物的信任和快速行動']
    ],
    'TIGL': [
      ['情感詐騙', '高', '信任+情感+直覺的組合極其危險'],
      ['戀愛詐騙', '高', '情感操控是最大弱點'],
      ['同情心詐騙', '高', '同情心可能被嚴重利用']
    ],
    'TIGR': [
      ['社群投資詐騙', '高', '在群體中容易被成功故事說服'],
      ['朋友推薦詐騙', '高', '對朋友的信任+快速行動是最大弱點'],
      ['熱門趨勢詐騙', '高', '對熱門事物的敏感度和信任態度']
    ]
  }
  
  return riskDatabase[animalCode] || [
    ['一般詐騙', '中', '請保持基本的防詐意識'],
    ['網路詐騙', '中', '注意網路安全'],
    ['電話詐騙', '中', '小心陌生來電']
  ]
}
</script>

<style scoped>
/* 微小 UI 調整 */
</style>