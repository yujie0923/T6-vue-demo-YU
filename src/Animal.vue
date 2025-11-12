<!-- Animal.vue -->
<template>
    
  <div class="min-h-screen flex items-center justify-center p-6 relative bg-black">
    <!-- 駭客電網動畫層 -->
    <div class="hacker-grid"></div>

    <div class="w-full max-w-3xl bg-[rgba(0,0,0,0.6)] rounded-2xl border border-[rgba(255,255,255,0.04)] p-6 backdrop-blur-md text-slate-100 relative z-10">
      <div class="flex items-center mb-6">
        <h1 class="text-2xl font-bold">你的防詐靈魂動物</h1>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <!-- 左：動物卡 -->
        <div class="col-span-1 flex flex-col items-center p-4 bg-[rgba(255,255,255,0.02)] rounded-xl">
          <div class="w-40 h-40 flex items-center justify-center mb-3">
            <!-- 簡易卡通 SVG 根據 animalKey 顯示不同圖（示範幾種） -->
            <div v-html="animalSVG" class="w-36 h-36"></div>
          </div>
          <div class="text-lg font-semibold mb-1">{{ animalNameLocal }}</div>
          <div class="text-sm text-slate-300 text-center max-w-xs">{{ animalShort }}</div>
          <div class="mt-3 text-xs text-slate-400">等級：{{ level }}</div>
        </div>

        <!-- 中：深度分析 -->
        <div class="col-span-2 p-4 bg-[rgba(255,255,255,0.02)] rounded-xl">
          <h3 class="font-semibold mb-2">詳細分析</h3>
          
          <!-- 3 維後端 / 16 型群組顯示 -->
          <div v-if="displayGroup || displayCode" class="mb-3 p-2 bg-[rgba(255,255,255,0.05)] rounded-md">
            <div class="text-xs text-slate-400">戰術群組</div>
            <div class="font-medium text-cyan-400">{{ displayGroup || '—' }}</div>
            <div v-if="displayCode" class="text-xs text-slate-500 mt-1">代碼：{{ displayCode }}</div>
          </div>
          
          <p class="text-slate-300 mb-3">{{ animalLong }}</p>

          <!-- 後端 3 維靈魂分數 -->
          <div v-if="isBackendAnimal && backendSoulScores" class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-sm">
            <div class="p-3 bg-cyan-500/10 border border-cyan-400/20 rounded-md text-cyan-300 font-semibold text-center">
              權威 {{ backendSoulScores.auth ?? 0 }}
            </div>
            <div class="p-3 bg-emerald-500/10 border border-emerald-400/20 rounded-md text-emerald-300 font-semibold text-center">
              時間 {{ backendSoulScores.time ?? 0 }}
            </div>
            <div class="p-3 bg-violet-500/10 border border-violet-400/20 rounded-md text-violet-300 font-semibold text-center">
              動機 {{ backendSoulScores.motive ?? 0 }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 bg-[rgba(255,255,255,0.02)] rounded-md">
              <div class="text-xs text-slate-400">反詐意識</div>
              <div class="font-medium">{{ awareness }}分 （{{ awarenessLabel }}）</div>
            </div>

            <div class="p-3 bg-[rgba(255,255,255,0.02)] rounded-md">
              <div class="text-xs text-slate-400">科技素養</div>
              <div class="font-medium">
                {{ isNew16System ? `${ro.techLabel} (${ro.techLiteracy}分)` : '中等適應 (65分)' }}
              </div>
            </div>
          </div>

          <!-- 16 型系統的四軸分析 -->
          <div v-if="isNew16System && ro.axesAnalysis" class="mt-4">
            <div class="text-sm text-slate-300 mb-2">心理軸線分析</div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-2 bg-[rgba(255,255,255,0.05)] rounded">
                <strong>權威態度:</strong> {{ ro.axesAnalysis.authority.tendency }}
              </div>
              <div class="p-2 bg-[rgba(255,255,255,0.05)] rounded">
                <strong>時間偏好:</strong> {{ ro.axesAnalysis.timing.tendency }}
              </div>
              <div class="p-2 bg-[rgba(255,255,255,0.05)] rounded">
                <strong>驗證方式:</strong> {{ ro.axesAnalysis.verification.tendency }}
              </div>
              <div class="p-2 bg-[rgba(255,255,255,0.05)] rounded">
                <strong>風險偏好:</strong> {{ ro.axesAnalysis.motivation.tendency }}
              </div>
            </div>
          </div>

          <div class="mt-4">
            <div class="text-sm text-slate-300 mb-2">
              {{ isNew16System ? '個人化詐騙風險分析' : '最易受騙的前三類型' }}
            </div>
            <div class="flex gap-2 flex-wrap">
              <div v-if="isNew16System" class="space-y-1">
                <div v-for="(risk, idx) in topFraudRisks" :key="idx" 
                     class="flex items-center gap-2 p-2 bg-red-600/10 border border-red-600/20 rounded-md">
                  <span class="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs font-bold">
                    {{ risk[1] }}
                  </span>
                  <div class="flex-1">
                    <div class="text-sm text-red-300 font-medium">{{ risk[0] }}</div>
                    <div class="text-xs text-red-400/80">{{ risk[2] }}</div>
                  </div>
                </div>
              </div>
              <div v-else>
                <span v-for="(f, idx) in topFraudRisks" :key="idx" 
                      class="px-3 py-1 bg-red-600/10 text-red-400 rounded-full text-sm border border-red-600/10">
                  {{ fraudLabelMap[f[0]] }} ({{ f[1] }})
                </span>
              </div>
              <span v-if="topFraudRisks.length===0" class="text-slate-400">- 無明顯高風險類型 -</span>
            </div>
          </div>

          <div class="mt-4 text-slate-300">
            <div class="font-semibold">防詐小建議</div>
            <ul class="list-disc ml-5 mt-2">
              <li v-for="(t, idx) in tips" :key="idx" class="text-sm">{{ t }}</li>
            </ul>
          </div>
          
          <!-- 心理測驗完成獎勵 -->
          <div class="mt-4 p-3 bg-[rgba(34,211,238,0.1)] border border-cyan-400/20 rounded-md">
            <div class="flex items-center gap-2 text-cyan-400">
              <span class="text-lg">🎉</span>
              <span class="font-semibold">心理測驗完成獎勵</span>
            </div>
            <div class="text-sm text-slate-300 mt-1">
              恭喜完成防詐心理測驗！獲得 <span class="text-cyan-400 font-semibold">+100 XP</span> 經驗值獎勵
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button @click="onBack" class="px-4 py-2 border rounded-md">準備遊戲挑戰</button>
      </div>
    </div>
  </div>
   
</template>

<script setup>
import { computed } from 'vue'

/**
 * props: resultObject - 新 16 型系統資料結構
 * - animalType: string (fox, eagle, etc.)
 * - animalData: { type, name, group, code }
 * - axesScores: [kt, di, sg, lr]
 * - axesAnalysis: { authority, timing, verification, motivation }
 * - awareness: number (0-100)
 * - awarenessLabel: string (高/中等/低)
 * - techLiteracy: number
 * - techLabel: string (高/中等/低)
 * - ageGroup: string
 * - gender: string
 * - topFraudRisks: [[type, risk, description], ...]
 * - finalAnimal: string (向後兼容)
 * - agePrediction: string (向後兼容)
 * - genderPrediction: string (向後兼容)
 */
const props = defineProps({
  resultObject: { type: Object, default: null },
  initialAnimal: { type: Object, default: null }
})
const emit = defineEmits(['backToWelcome','retry'])

// 16 型防詐靈魂動物資料庫（新系統）
const ANIMALS_16 = {
  fox: {
    name:'🦊 狐狸型',
    short:'絕對防禦型 - 深潛分析局精英，幾乎無懈可擊',
    long:`你是深潛分析局的絕對防禦專家。懷疑且審慎的特質讓你在面對詐騙時具有極強的免疫力。你會仔細分析每個細節，不輕易相信任何可疑的訊息。`,
    tips:[
      '保持你的懷疑精神，這是你最大的優勢',
      '可以成為朋友圈的防詐顧問',
      '注意不要過度懷疑而錯失正當機會'
    ]
  },
  eagle: {
    name:'🦅 老鷹型',
    short:'精準分析型 - 深潛分析局狙擊手，眼光銳利',
    long:`你具備老鷹般的銳利眼光，能夠精準分析威脅。雖然對獎勵敏感，但你的懷疑天性和審慎態度提供了很好的保護。`,
    tips:[
      '利用你的分析能力仔細評估投資機會',
      '避免被高報酬沖昏頭腦',
      '多重驗證是你的專長，繼續發揮'
    ]
  },
  owl: {
    name:'🦉 貓頭鷹型',
    short:'智慧觀察型 - 深潛分析局智囊，洞察人心',
    long:`你是智慧的象徵，憑藉直覺和經驗做出判斷。懷疑的天性配合審慎的行動，讓你很難被一般詐騙手法欺騙。`,
    tips:[
      '信任你的直覺，它通常是對的',
      '注意情感操控類的詐騙手法',
      '繼續培養你的觀察力和判斷力'
    ]
  },
  shark: {
    name:'🦈 鯊魚型',
    short:'謀定投機型 - 深潛分析局突擊手，危機就是轉機',
    long:`你是天生的投機者，善於在危機中尋找機會。雖然追求獎勵，但你的懷疑天性會讓你三思而後行。`,
    tips:[
      '設定投資的風險上限',
      '保持冷靜分析，不被情緒影響',
      '利用你的敏銳度識別真正的機會'
    ]
  },
  squirrel: {
    name:'🐿️ 松鼠型',
    short:'機警反應型 - 影襲特攻隊斥候，反應神速',
    long:`你反應迅速且機警敏感，能夠快速識別威脅。雖然擔心損失，但你的懷疑天性會讓你在行動前先想一想。`,
    tips:[
      '相信你的第一直覺，通常是警告信號',
      '不要讓恐懼影響理性判斷',
      '建立緊急應變的標準流程'
    ]
  },
  octopus: {
    name:'🐙 章魚型',
    short:'靈活探索型 - 影襲特攻隊偵察兵，多方驗證',
    long:`你善於多角度思考，靈活應對各種情況。對獎勵的敏感讓你容易被誘惑，但懷疑的天性會提醒你保持警戒。`,
    tips:[
      '利用你的多元思維驗證資訊',
      '設定獲利機會的評估標準',
      '避免過度自信而忽略風險警訊'
    ]
  },
  cat: {
    name:'🐱 貓咪型',
    short:'獨立冷靜型 - 影襲特攻隊獨行俠，我行我素',
    long:`你獨立且冷靜，喜歡按照自己的節奏行動。直覺敏銳但有時會過度依賴感覺，需要更多理性分析的平衡。`,
    tips:[
      '結合直覺與理性分析',
      '不要完全依賴第一印象',
      '保持獨立思考的優勢'
    ]
  },
  wolf: {
    name:'🐺 狼型',
    short:'果斷獵食型 - 影襲特攻隊突擊手，勇猛無懼',
    long:`你果斷勇猛，敢於追求機會和挑戰。雖然行動迅速，但懷疑的本能會讓你在關鍵時刻保持警覺。`,
    tips:[
      '在行動前做基本的風險評估',
      '避免競爭心理影響判斷',
      '利用你的領導力幫助他人防詐'
    ]
  },
  turtle: {
    name:'🐢 烏龜型',
    short:'理性冷靜型 - 重裝守備隊核心，穩如泰山',
    long:`你穩重謹慎且善於深思熟慮。雖然容易信任權威，但審慎的天性會讓你花時間驗證重要決定。`,
    tips:[
      '對權威來源進行多重驗證',
      '設定重要決定的冷靜期',
      '保持你穩健的判斷風格'
    ]
  },
  elephant: {
    name:'🐘 大象型',
    short:'穩健計畫型 - 重裝守備隊指揮官，深謀遠慮',
    long:`你善於長期規劃，追求穩健的成長。對專家建議的信任需要配合更嚴格的身份驗證程序。`,
    tips:[
      '建立可信專家的名單和驗證流程',
      '避免被「穩健投資」的包裝欺騙',
      '利用你的規劃能力建立防詐檢查清單'
    ]
  },
  hippo: {
    name:'🦛 河馬型',
    short:'領域守護型 - 重裝守備隊守護者，保衛家園',
    long:`你重視家庭和熟悉的環境，直覺敏銳且富有同情心。對熟人的信任是你的弱點，需要額外小心。`,
    tips:[
      '對熟人的緊急求助要電話確認',
      '不要讓情感影響理性判斷',
      '建立家庭防詐的溝通機制'
    ]
  },
  gorilla: {
    name:'🦍 金剛型',
    short:'家族領袖型 - 重裝守備隊鋼鐵戰神，守護家族',
    long:`你是重裝守備隊的鋼鐵戰神，信任權威且為家族承擔責任。需要特別注意熟人推薦的「保證獲利」投資詐騙。`,
    tips:[
      '拒絕任何「朋友介紹」但「保證獲利」的投資',
      '運用家族領袖的影響力教育防詐知識',
      '建立家族內部的投資決策討論機制'
    ]
  },
  mouse: {
    name:'🐭 老鼠型',
    short:'恐慌反應型 - 閃電先鋒偵察員，易受驚嚇 ⚠️',
    long:`你善良且信任他人，但在緊急情況下容易恐慌。損失的恐懼會讓你做出衝動決定，這是詐騙者最愛利用的弱點。`,
    tips:[
      '遇到緊急威脅時深呼吸冷靜 5 分鐘',
      '建立緊急情況的確認流程',
      '找可信任的朋友作為緊急諮詢對象'
    ]
  },
  otter: {
    name:'🦦 水獺型',
    short:'好奇探索型 - 閃電先鋒探險家，熱愛嘗鮮 ⚠️',
    long:`你好奇心強且喜歡探索新事物。對機會的敏感和快速行動的習慣，容易讓你成為新型詐騙的目標。`,
    tips:[
      '新機會要設定「24小時冷靜期」',
      '建立新事物的安全評估清單',
      '與經驗豐富的朋友討論再決定'
    ]
  },
  deer: {
    name:'🦌 鹿型',
    short:'平衡協調型 - 領導先鋒局協調員，中庸之道',
    long:`你具備平衡的特質，既信任權威又能即時反應，善於在詳細分析和損失規避之間找到平衡。是天生的協調者。`,
    tips:[
      '利用你的平衡感做出明智決策',
      '不要因為急於決定而忽略細節',
      '保持開放態度但要有底線'
    ]
  },
  lion: {
    name:'🦁 獅子型',
    short:'王者領導型 - 領導先鋒局指揮官，威嚴霸氣',
    long:`你是天生的領導者，信任權威且能快速決策。你的自信和果斷是優勢，但要注意不要被權威光環蒙蔽了判斷。`,
    tips:[
      '保持你的領導風範，但要謹慎驗證',
      '不要讓權威迷信影響獨立思考',
      '建立可信賴的諮詢管道'
    ]
  },
  elephant: {
    name:'🐘 大象型',
    short:'智慧長者型 - 領導先鋒局元老，穩重睿智',
    long:`你擁有大象般的智慧和記憶力，能夠從經驗中學習。你的直覺很強，但有時也需要更多的細節分析。`,
    tips:[
      '相信你的經驗和直覺',
      '在重要決定時多收集一些細節',
      '分享你的智慧幫助他人防詐'
    ]
  },
  horse: {
    name:'🐴 馬型',
    short:'奔馳追求型 - 領導先鋒局騎兵，追求卓越',
    long:`你像馬一樣充滿活力，追求獎勵和成就。你的信任天性和即時反應讓你容易被高回報機會吸引，需要謹慎評估。`,
    tips:[
      '設定投資風險的明確上限',
      '保持你的衝勁但要三思而後行',
      '建立投資前的驗證清單'
    ]
  }
}

// 舊系統動物對照（向後兼容）
const ANIMALS_LEGACY = {
  Fox: {
    name:'狐狸 (Fox)',
    short:'聰明好奇、反應快，但容易被高報酬誘惑。',
    long:`你天生好奇且行動力強，擅長抓住機會與新事物。但這種嗅覺也會讓你在高回報誘因下掉以輕心。財務/投資型詐騙與假金融商品是你需要特別警惕的方向。`,
    tips:[
      '遇到投資邀請務必查證對方資本與牌照。',
      '大額轉帳前設定冷靜期（例如 24 小時）。',
      '對陌生連結先到官網或官方客服比對。'
    ]
  },
  Turtle:{
    name:'烏龜 (Turtle)',
    short:'穩重謹慎、慢而安全，但可能會被官方語氣迷惑。',
    long:`你的穩重是防詐大優勢：不衝動、喜歡查證。但詐騙者常用官方語氣或法務字眼迷惑你，建議遇到「行政/法務/銀行」字眼時，一律以官方電話或官方網站為準。`,
    tips:[
      '看到官方語氣時打官方客服電話確認。',
      '不要輕易在簡訊或連結輸入個資。',
      '遇到法律或行政字眼，可請朋友或律師協助判斷。'
    ]
  },
  Dog:{
    name:'狗 (Dog)',
    short:'情感導向、信任他人，擅長社群互動但易被親友式詐騙影響。',
    long:`你很在意人際關係，容易從情感面給予信任。詐騙者正是利用親友或情感做為切入點。遇到求助訊息，先用電話或共同朋友確認。`,
    tips:[
      '若有人急需金錢，先用電話或面對面確認。',
      '避免透過簡訊直接匯款或提供銀行資料。',
      '鼓勵親友使用多一步驗證（例如語音或視訊確認）。'
    ]
  },
  Cat:{
    name:'貓 (Cat)',
    short:'直覺敏銳、獨立，但熟悉語氣可能讓你漏判假客服/電商。',
    long:`你保有很強的直覺與自主性，不喜歡被強迫。但詐騙會用熟悉用語或品牌信箱來降低你的警覺。建議核對訂單號與官方平台。`,
    tips:[
      '有疑慮時，到原廠官網或APP比對訂單。',
      '保留交易紀錄與客服對話截圖以便查證。',
      '對於要求提供敏感資料的客服多一份懷疑。'
    ]
  },
  Owl:{
    name:'貓頭鷹 (Owl)',
    short:'分析型特務，習慣查證與冷靜思考，是防詐高手。',
    long:`你偏好以證據為基礎，不輕信未驗證資訊，通常會先查證發件來源。持續保持這個習慣，你會是朋友圈裡的防詐諮詢者。`,
    tips:[
      '繼續使用多重來源查證（官網、客服、新聞）',
      '對跨平台不一致的資訊提高警覺',
      '分享防詐知識給身邊人形成正循環'
    ]
  },
  Squirrel:{
    name:'松鼠 (Squirrel)',
    short:'資產保護意識高、習慣儲備與安全，但貸款/借款陷阱要小心。',
    long:`你注重儲備與日常安全，但對金融條款細節可能不熟，詐騙會打「緊急借款/貸款」的票。建議在貸款前詳細核對合約與年利率。`,
    tips:[
      '貸款前仔細審閱合約與總成本',
      '不要回覆要求提供身分證或銀行截圖的訊息',
      '利用官方貸款平台或銀行分行洽詢'
    ]
  },
  Shark:{
    name:'鯊魚 (Shark)',
    short:'機會導向、求利心強；高報酬投資風險是主要威脅。',
    long:`你果敢、追求機會，但這增加你接觸高風險／詐騙投資的次數。把「冷靜查證」當作投資流程的一部分會大幅降低風險。`,
    tips:[
      '設定投資前的三項查證（公司、牌照、交易紀錄）',
      '避免一次投入大額資金給陌生管道',
      '使用受監理平台交易或投資'
    ]
  },
  Mouse:{
    name:'老鼠 (Mouse)',
    short:'觀察保守、容易受群組訊息影響，群組連鎖詐騙要小心。',
    long:`你觀察力佳但在群組裡可能因為大量訊息而被影響。碰到群組中瘋傳的消息，先在外部查證再回覆或分享。`,
    tips:[
      '不要在群組中匆忙回覆或轉發可疑連結',
      '遇到「大家都在做」的說法先查證',
      '使用小範圍先試驗的方式驗證資訊真偽'
    ]
  },
  Octopus:{
    name:'章魚 (Octopus)',
    short:'跨平台高手、社群能力強，但也可能遇到社群混合詐騙。',
    long:`你擅長使用多種社群與平台，這是優勢但也讓你暴露於跨平台詐騙（例如假電商＋假客服）。建議為不同平台使用不同帳密並啟用雙重驗證。`,
    tips:[
      '不同平台使用不同帳號密碼並啟動 2FA',
      '對跨平台一致性錯誤（品牌logo小差異）提高警覺',
      '定期檢查帳戶安全與登入紀錄'
    ]
  },
  Dove:{
    name:'鴿子 (Dove)',
    short:'善良樂於助人、對公益敏感；假募款或情感勒索可能傷害你。',
    long:`你的善良是社會美德，但詐騙者常利用善意做誘餌。捐款或協助他人前，優先透過官方或熟悉的 NGO。`,
    tips:[
      '捐款請透過官方或信用良好的 NGO',
      '對急迫募款保持懷疑態度並查證組織背景',
      '保護自己的個資與轉帳紀錄'
    ]
  }
}

const createBackendEntry = ({ displayName, emoji, base, legacy, group, awareness = 62, awarenessLabel = '中等', background = '#0f172a' }) => {
  const source = base || legacy || {}
  return {
    name: displayName,
    emoji,
    short: source.short || '保持警覺，善用既有優勢識破詐騙。',
    long: source.long || '你擁有獨特的防詐傾向，學會善用並持續練習，就能在詐騙場景中保持優勢。',
    tips: source.tips || [],
    group,
    awareness,
    awarenessLabel,
    background
  }
}

const BACKEND_ATM_MAP = {
  'R-J-P': createBackendEntry({
    displayName: '🐙 章魚型 SHADE',
    emoji: '🐙',
    base: ANIMALS_16.octopus,
    group: '影襲特攻隊',
    awareness: 66,
    awarenessLabel: '中等偏高',
    background: '#312e81'
  }),
  'R-J-R': createBackendEntry({
    displayName: '🐱 貓型 MUSE',
    emoji: '🐱',
    base: ANIMALS_16.cat,
    group: '影襲特攻隊',
    awareness: 64,
    awarenessLabel: '中等',
    background: '#1f2937'
  }),
  'R-C-R': createBackendEntry({
    displayName: '🦊 狐狸型 ROGUE',
    emoji: '🦊',
    base: ANIMALS_16.fox,
    group: '深潛分析局',
    awareness: 70,
    awarenessLabel: '偏高',
    background: '#7c2d12'
  }),
  'R-C-P': createBackendEntry({
    displayName: '🦁 獅子型 REBEL',
    emoji: '🦁',
    base: ANIMALS_16.lion,
    group: '深潛分析局',
    awareness: 67,
    awarenessLabel: '中等偏高',
    background: '#78350f'
  }),
  'A-J-R': createBackendEntry({
    displayName: '🐢 烏龜型 SAGE',
    emoji: '🐢',
    base: ANIMALS_16.turtle,
    legacy: ANIMALS_LEGACY.Turtle,
    group: '重裝守備隊',
    awareness: 60,
    awarenessLabel: '中等',
    background: '#14532d'
  }),
  'A-C-P': createBackendEntry({
    displayName: '🐶 黃金獵犬型 SENTINEL',
    emoji: '🐶',
    legacy: ANIMALS_LEGACY.Dog,
    group: '重裝守備隊',
    awareness: 58,
    awarenessLabel: '中等',
    background: '#1e3a8a'
  }),
  'A-C-R': createBackendEntry({
    displayName: '🐴 馬型 VALOR',
    emoji: '🐴',
    base: ANIMALS_16.horse,
    group: '閃電先鋒',
    awareness: 63,
    awarenessLabel: '中等',
    background: '#1d4ed8'
  }),
  'A-J-P': createBackendEntry({
    displayName: '🦉 貓頭鷹型 ORACLE',
    emoji: '🦉',
    base: ANIMALS_16.owl,
    legacy: ANIMALS_LEGACY.Owl,
    group: '深潛分析局',
    awareness: 72,
    awarenessLabel: '偏高',
    background: '#312e81'
  })
}

/* fraud map label */
const fraudLabelMap = {
  '複雜投資詐騙':'複雜投資','高報酬投資詐騙':'高報酬投資','情感操控詐騙':'情感操控',
  '高風險投資詐騙':'高風險投資','損失恐懼詐騙':'損失恐懼','快速獲利詐騙':'快速獲利',
  '直覺陷阱詐騙':'直覺陷阱','競爭類詐騙':'競爭壓力','權威詐騙':'權威迷惑',
  '投資專家詐騙':'專家推薦','熟人詐騙':'熟人利用','權威投資詐騙':'權威投資',
  '緊急詐騙':'緊急威脅','快速機會詐騙':'快速機會','情感詐騙':'情感操控',
  '朋友推薦詐騙':'朋友推薦','社群投資詐騙':'社群投資','技術類詐騙':'技術陷阱',
  '一般詐騙':'一般','網路詐騙':'網路','電話詐騙':'電話'
}

/* extract data */
const ro = props.resultObject || {}
const backendAnimal = props.initialAnimal || null
const backendCode = backendAnimal?.code ? String(backendAnimal.code).toUpperCase() : null
const backendContent = backendCode ? BACKEND_ATM_MAP[backendCode] || null : null
const backendSoulScores = backendAnimal?.soulScores || null
const backendDisplayCode = backendCode

const isBackendAnimal = !!backendAnimal
const isNew16System = !isBackendAnimal && ro.animalData && ro.animalData.name

let animalKey, animalMeta, animalNameLocal, animalShort, animalLong, tips
let awareness = 0, awarenessLabel = '中等', topFraudRisks = []
let displayGroup = null

if (isBackendAnimal) {
  animalKey = null
  animalMeta = null
  animalNameLocal = backendContent?.name || backendAnimal.animalName || '靈魂動物'
  animalShort = backendContent?.short || backendAnimal.description || '保持警覺，持續練習你的防詐直覺。'
  animalLong = backendContent?.long || backendAnimal.description || '透過心理測驗 + 遊戲數據計算出的靈魂動物，代表你目前的防詐風格。'
  tips = backendContent?.tips || []
  awareness = backendContent?.awareness ?? 60
  awarenessLabel = backendContent?.awarenessLabel ?? '中等'
  topFraudRisks = backendContent?.topFraudRisks || []
  displayGroup = backendContent?.group || null
} else if (isNew16System) {
  // 新 16 型系統
  animalKey = ro.animalType
  animalMeta = ANIMALS_16[animalKey] || ANIMALS_16.fox
  animalNameLocal = ro.animalData.name
  animalShort = animalMeta.short
  animalLong = animalMeta.long
  tips = animalMeta.tips
  awareness = ro.awareness
  awarenessLabel = ro.awarenessLabel
  topFraudRisks = ro.topFraudRisks || []
  displayGroup = ro.animalData.group || null
} else {
  // 舊系統向後兼容
  animalKey = ro.finalAnimal?.split('-')[0] || 'Fox'
  animalMeta = ANIMALS_LEGACY[animalKey] || ANIMALS_LEGACY.Fox
  animalNameLocal = animalMeta.name
  animalShort = animalMeta.short
  animalLong = animalMeta.long
  tips = animalMeta.tips
  awareness = ro.awareness
  awarenessLabel = ro.awarenessLabel
  topFraudRisks = ro.topFraudRisks || []
}

const displayCode = isBackendAnimal ? backendDisplayCode : (ro.animalData?.code || ro.finalAnimal || null)

/* 等級判定 */
let level = '特務•見習'
if (awareness >= 70) level = '特務•高階'
else if (awareness >= 55) level = '特務•中階'

/* 簡單可愛 SVG 新版 */
const SVG_BANK_16 = {
  fox: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#FFEDD5"/><g transform="translate(20,20)"><path d="M20 4c6 0 12 5 20 5s14-5 20-5c0 8-7 12-7 20s7 12 7 20c-8 0-14-5-20-5s-14 5-20 5c0-8 7-12 7-20S20 12 20 4z" fill="#FF9F43"/></g><text x="60" y="75" text-anchor="middle" font-size="24">🦊</text></svg>`,
  eagle: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#E8F5E8"/><text x="60" y="75" text-anchor="middle" font-size="24">🦅</text></svg>`,
  owl: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#F3E8FF"/><text x="60" y="75" text-anchor="middle" font-size="24">🦉</text></svg>`,
  shark: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#E0F2FE"/><text x="60" y="75" text-anchor="middle" font-size="24">🦈</text></svg>`,
  squirrel: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#FEF3C7"/><text x="60" y="75" text-anchor="middle" font-size="24">🐿️</text></svg>`,
  octopus: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#FCE7F3"/><text x="60" y="75" text-anchor="middle" font-size="24">🐙</text></svg>`,
  cat: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#EDF2FF"/><text x="60" y="75" text-anchor="middle" font-size="24">🐱</text></svg>`,
  wolf: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#F1F5F9"/><text x="60" y="75" text-anchor="middle" font-size="24">🐺</text></svg>`,
  turtle: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#DCFCE7"/><text x="60" y="75" text-anchor="middle" font-size="24">🐢</text></svg>`,
  elephant: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#F0FDF4"/><text x="60" y="75" text-anchor="middle" font-size="24">🐘</text></svg>`,
  hippo: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#F0F9FF"/><text x="60" y="75" text-anchor="middle" font-size="24">🦛</text></svg>`,
  gorilla: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#F8FAFC"/><text x="60" y="75" text-anchor="middle" font-size="24">🦍</text></svg>`,
  mouse: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#FEF2F2"/><text x="60" y="75" text-anchor="middle" font-size="24">🐭</text></svg>`,
  deer: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#FDF2F8"/><text x="60" y="75" text-anchor="middle" font-size="24">🦌</text></svg>`,
  lion: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#FEF3C7"/><text x="60" y="75" text-anchor="middle" font-size="24">🦁</text></svg>`,
  horse: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#F0F4FF"/><text x="60" y="75" text-anchor="middle" font-size="24">🐎</text></svg>`
}

/* 舊系統 SVG（向後兼容）*/
const SVG_BANK_LEGACY = {
  Fox: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#FFEDD5"/><g transform="translate(20,20)"><path d="M20 4c6 0 12 5 20 5s14-5 20-5c0 8-7 12-7 20s7 12 7 20c-8 0-14-5-20-5s-14 5-20 5c0-8 7-12 7-20S20 12 20 4z" fill="#FF9F43"/></g></svg>`,
  Turtle: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="104" height="104" rx="20" fill="#E6FFFA"/><g fill="#2F855A"><circle cx="60" cy="60" r="30"/></g></svg>`,
  Dog: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="20" fill="#FFF7ED"/><g><circle cx="60" cy="60" r="34" fill="#F6AD55"/></g></svg>`,
  Cat: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="20" fill="#EDF2FF"/><g><circle cx="60" cy="60" r="34" fill="#9F7AEA"/></g></svg>`,
  Owl: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="20" fill="#FFF7ED"/><g><circle cx="60" cy="60" r="34" fill="#805AD5"/></g></svg>`,
  Squirrel:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="20" fill="#FFFBEB"/><g><circle cx="60" cy="60" r="34" fill="#D69E2E"/></g></svg>`,
  Shark:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="20" fill="#EDFDFD"/><g><circle cx="60" cy="60" r="34" fill="#2C7A7B"/></g></svg>`,
  Mouse:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="20" fill="#F7FAFC"/><g><circle cx="60" cy="60" r="34" fill="#A0AEC0"/></g></svg>`,
  Octopus:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="20" fill="#FFF5F7"/><g><circle cx="60" cy="60" r="34" fill="#DD6B20"/></g></svg>`,
  Dove:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="20" fill="#F0FFF4"/><g><circle cx="60" cy="60" r="34" fill="#48BB78"/></g></svg>`
}

const createEmojiSVG = (emoji, fill = '#0f172a') => `
  <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="56" fill="${fill}"/>
    <text x="60" y="75" text-anchor="middle" font-size="30">${emoji}</text>
  </svg>
`

const animalSVG = (() => {
  if (isBackendAnimal) {
    const emoji = backendContent?.emoji || '🥚'
    const fill = backendContent?.background || '#0f172a'
    return createEmojiSVG(emoji, fill)
  }
  if (isNew16System && animalKey) {
    return SVG_BANK_16[animalKey] || SVG_BANK_16.fox
  }
  return SVG_BANK_LEGACY[animalKey] || SVG_BANK_LEGACY.Fox
})()

function onBack(){ emit('backToWelcome') }
function onRetry(){ emit('retry') }
</script>

<style scoped>
/* 使用全局的駭客電網動畫背景，定義在 global.css 中 */
</style>
