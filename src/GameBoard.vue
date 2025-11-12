<template>
  <div class="game-board" :class="{ 'warn': dangerLevel===1, 'danger': dangerLevel===2 }">
    <!-- 倒數計時器 - 顏色/動畫由 CSS 控制：
      .game-board.warn .timer  => 橘色慢節奏脈動（當剩餘時間 <= 10 秒時觸發）
      .game-board.danger .timer => 紅色快速脈動（當剩餘時間 <= 3 秒時觸發）
      對應的狀態由下方 script 的 updateDangerLevel() 來設定。 -->
    <div v-if="mode === 'challenge'" class="timer">
      剩餘時間: {{ timeLeft }} 秒
    </div>

    <h2>找出唯一的詐騙訊息</h2>
    
    <!-- EXP 顯示 - 標題下方置中 -->
    <div class="title-section">
      <div class="exp-display">
        <SoulDisplay compact :initial-animal="initialAnimalLegacy" :current-animal="currentSoulAnimalLegacy" />
      </div>
    </div>

    <div class="cards">
      <div
        v-for="msg in gameMessages"
        :key="msg.id"
        class="card"
        :class="{
          selected: selectedMessage && selectedMessage.id === msg.id,
          correct: showResult && selectedMessage?.id === msg.id && msg.isScam,
          wrong: showResult && selectedMessage?.id === msg.id && !msg.isScam,
          urgent: dangerLevel === 2 && timeLeft <= 3
        }"
        @click="selectMessage(msg)"
      >
        <div class="msg-sender">{{ msg.sender }}</div>
        <p class="msg-content">{{ msg.content }}</p>
        <div class="msg-source">{{ msg.source }}</div>
      </div>
    </div>
  </div>
  <!-- 駭客電網動畫層 -->
    <div class="hacker-grid"></div> <!-- ✅ 加上背景 -->
</template>

<script>
import { ref, onMounted, watch, onUnmounted } from "vue";
import SoulDisplay from "./SoulDisplay.vue";

export default {
  name: "GameBoard",
  components: {
    SoulDisplay
  },
  props: {
    round: Number,
    score: Number,
    mode: { type: String, default: "normal" },
    gameData: { type: Object, default: null }, // 從後端獲取的遊戲數據
    currentRoundData: { type: Array, default: [] }, // 當前關卡的題目數據
    initialAnimalLegacy: { type: Object, default: null },
    currentSoulAnimalLegacy: { type: Object, default: null }
  },
  emits: ["next-round", "end-game", "wrong-ids", "user-choices", "soul-evolution"],
  setup(props, { emit }) {
    const gameMessages = ref([]);
    const selectedMessage = ref(null);
    const wrongIds = ref([]) // 儲存本場遊戲錯誤的訊息 id（會 emit 給父元件）
    const showResult = ref(false);
    const userChoices = ref([]) // 儲存用戶選擇的題目和正確答案的 message_id
    const timeLeft = ref(20);
    const dangerLevel = ref(0); // 0: normal, 1: warn, 2: danger
    const answerStartTime = ref(null);
    
    
    let audioCtx = null;
    let masterGain = null;
    const timerStarted = ref(false);
    let timer = null;


  // startTimer：啟動整體挑戰倒數（總計 20 秒）
  // 注意：timerStarted 用來避免換題或重入時重複啟動計時器。
  const startTimer = () => {
      if (timerStarted.value) return;
      // total challenge timer (60s for the whole game)
      dangerLevel.value = 0;
      timeLeft.value = 60;
      ensureAudio();
      // main countdown (1s resolution)
      timer = setInterval(() => {
        timeLeft.value--;
        updateDangerLevel();
        updateTickLoop();
        if (timeLeft.value <= 0) {
          clearInterval(timer);
          stopTickLoop();
          dangerLevel.value = 0;
          emit('wrong-ids', wrongIds.value.slice()) // 傳一個淺拷貝，型別是陣列
          emit("end-game");
        }
      }, 1000);
      // start the tick loop (plays short sounds at variable interval)
      startTickLoop();
      timerStarted.value = true;
    };

    let tickTimer = null;
  // getTickIntervalMs：依據剩餘秒數回傳滴答頻率（毫秒）
  // - >10s => 1000ms
  // - <=10s => 500ms
  // - <=3s => 250ms
  // 如要調整加速時機，可在此修改數值門檻。
  const getTickIntervalMs = () => {
      if (timeLeft.value <= 3) return 250; // very fast
      if (timeLeft.value <= 10) return 500; // faster
      return 1000; // normal
    };

    const startTickLoop = () => {
      stopTickLoop();
      const ms = getTickIntervalMs();
      tickTimer = setInterval(() => {
        try { playTick(); } catch (e) {}
      }, ms);
    };

    const stopTickLoop = () => {
      if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
    };

    // 新增：停止所有音效活動（遊戲結束時調用）
    const stopAllAudio = () => {
      stopTickLoop();
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
        audioCtx = null;
        masterGain = null;
      }
    };

    const updateTickLoop = () => {
      // adjust tick speed if needed
      const ms = getTickIntervalMs();
      if (!tickTimer) {
        startTickLoop();
        return;
      }
      // if current interval differs, restart
      // can't read interval from setInterval, so restart unconditionally when threshold changes
      // simple approach: restart tick loop whenever dangerLevel changes
      // handled by updateDangerLevel caller below
    };

  // ensureAudio：初始化 WebAudio 的 AudioContext 與總音量（masterGain）
  // 若要調整滴答聲音量，可修改下方 masterGain.gain.value 的數值。
  const ensureAudio = () => {
      if (audioCtx && audioCtx.state !== 'closed') return;
      try {
        // Close previous context if it exists
        if (audioCtx && audioCtx.state !== 'closed') {
          audioCtx.close().catch(() => {});
        }
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.14; // increased volume
        masterGain.connect(audioCtx.destination);
      } catch (e) {
        console.warn('AudioContext not available', e);
        audioCtx = null;
      }
    };

  // playTick：播放短促的滴答聲。依緊迫程度改變頻率與波形。
  // 若要改為使用音檔，可在此改為載入 AudioBuffer 或使用 HTMLAudioElement 播放。
  const playTick = () => {
      // only play when audio available (and in challenge mode)
      if (!audioCtx || audioCtx.state === 'closed') {
        // try to create on first use (user gesture likely happened)
        ensureAudio();
        if (!audioCtx || audioCtx.state === 'closed') return;
      }
      
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        // pitch depends on remaining time: higher pitch as time approaches 0
        let freq = 600;
        if (timeLeft.value <= 3) freq = 1400;
        else if (timeLeft.value <= 10) freq = 1000;
        else freq = 600;
        osc.frequency.value = freq;
        osc.type = 'square';
        // sharper tick: short envelope
        gain.gain.value = 1;
        osc.connect(gain);
        gain.connect(masterGain);
        const now = audioCtx.currentTime;
        osc.start(now);
        // very short tick (sharp click)
        gain.gain.setValueAtTime(1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.stop(now + 0.035);
      } catch (e) {
        // Audio context might be closed, ignore silently
        console.warn('Audio playback failed:', e.message);
      }
    };

  // updateDangerLevel：根據剩餘時間設定 dangerLevel
  // dangerLevel 對應意義：
  // 0 = 正常、1 = 警示（會顯示橘色計時器）、2 = 危急（紅色計時器 + 卡片 urgent 樣式）
  // 若要更改視覺切換的時機，可修改下方的數字門檻（例如 3 秒、10 秒）。
  const updateDangerLevel = () => {
      const prev = dangerLevel.value;
      if (timeLeft.value <= 3) dangerLevel.value = 2;
      else if (timeLeft.value <= 10) dangerLevel.value = 1;
      else dangerLevel.value = 0;
      if (dangerLevel.value !== prev) {
        // when danger level changes, restart tick loop to adjust speed
        startTickLoop();
      }
    };


    const initGame = () => {
      // 使用從後端獲取的題目數據
      if (props.currentRoundData && props.currentRoundData.length > 0) {
        // 將後端數據格式轉換為前端需要的格式
        const roundMessages = props.currentRoundData.map(msg => ({
          id: msg[0], // message_id
          sender: msg[4] || 'unknown', // scam_category (顯示類別)
          content: msg[2], // message_text
          isScam: !msg[3], // is_truth_message (取反)
          type: msg[4] || 'unknown', // scam_category
          source: msg[1] || 'unknown' // message_source
        }));

        gameMessages.value = roundMessages;
        selectedMessage.value = null;
        showResult.value = false;
        answerStartTime.value = Date.now(); // 記錄回合開始時間

        if (props.mode === "challenge") startTimer();

        console.log("Round messages from backend:", roundMessages);
        
        // 測試程式碼：打印當前關卡的題目詳細信息
        console.log(`=== 測試：第${props.round}關題目詳細信息 ===`)
        roundMessages.forEach((msg, index) => {
          console.log(`題目${index + 1}:`)
          console.log(`  ID: ${msg.id}`)
          console.log(`  類別: ${msg.sender}`)
          console.log(`  內容: ${msg.content}`)
          console.log(`  來源: ${msg.source}`)
          console.log(`  是否詐騙: ${msg.isScam}`)
          console.log('  ---')
        })
        console.log('=== 測試結束 ===')
      } else {
        console.warn("No round data provided from backend");
        // 如果沒有後端數據，可以顯示錯誤或使用備用邏輯
        gameMessages.value = [];
      }
    };

    const selectMessage = (msg) => {
      if (selectedMessage.value) return;
      selectedMessage.value = msg;
      showResult.value = true;

      const correct = msg.isScam; // 正確答案判斷：選擇詐騙訊息才是正確答案（2真1假遊戲）

      // 找到正確答案的 message_id（詐騙訊息）
      const correctMessage = gameMessages.value.find(m => m.isScam);
      const correctMessageId = correctMessage ? correctMessage.id : null;

      // 計算答題時間（毫秒）
      const responseTime = answerStartTime.value ? Date.now() - answerStartTime.value : 0;

      // 記錄用戶選擇和正確答案的 message_id
      const choiceData = {
        round: props.round,
        userChoiceId: msg.id,
        correctAnswerId: correctMessageId,
        isCorrect: correct,
        responseTime: responseTime
      };
      userChoices.value.push(choiceData);
      console.log('GameBoard: 記錄用戶選擇:', choiceData);

 // ---------- 新增：選擇後若答錯就記錄 id（放在 selectMessage 內，判斷 correct 之後） ----------
if (!correct) {
  // 現在答錯意味著選到了真實訊息（應該選詐騙訊息），記錄該真實訊息的 id
  if (!wrongIds.value.includes(msg.id)) {
    wrongIds.value.push(msg.id)
    console.log('GameBoard: 記錄錯誤選擇ID（應選詐騙訊息但選到真實訊息）:', msg.id, '當前錯題列表:', wrongIds.value);
  }
}
      
  // do NOT clear the total timer when selecting — timer runs across rounds

      setTimeout(() => {
        // 每回合結束時都傳遞當前錯題ID和用戶選擇數據
        console.log('GameBoard: 傳遞錯題ID到App:', wrongIds.value);
        console.log('GameBoard: 傳遞用戶選擇數據到App:', userChoices.value);
        emit("wrong-ids", wrongIds.value.slice());
        emit("user-choices", userChoices.value.slice()); // 新增：傳遞用戶選擇數據
        emit("next-round", correct);
        initGame();
      }, 1200);
    };

    // 監聽 currentRoundData 變化，當新關卡數據傳入時重新初始化
    watch(() => props.currentRoundData, (newData) => {
      if (newData && newData.length > 0) {
        initGame();
      }
    }, { immediate: true });

    onMounted(() => {
      // 重置錯題ID列表（新遊戲開始）
      wrongIds.value = [];
      console.log('GameBoard: 遊戲開始，重置錯題ID列表');
      
      // 如果已經有數據，則初始化遊戲
      if (props.currentRoundData && props.currentRoundData.length > 0) {
        initGame();
      }
      
      // start challenge timer only once when component mounts and mode is challenge
      if (props.mode === 'challenge' && !timerStarted.value) {
        startTimer();
      }
    });

    onUnmounted(() => {
      if (timer) clearInterval(timer);
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
        audioCtx = null;
        masterGain = null;
      }
    });

    watch(() => props.mode, () => initGame());

    return { 
      gameMessages, 
      selectedMessage, 
      selectMessage, 
      showResult, 
      timeLeft, 
      dangerLevel,
      stopAllAudio // 暴露給父組件調用
    };
  }
};
</script>

<style scoped>
.game-board {
  text-align: center;
  padding: 40px 20px;
  color: #00ffcc;
  position: relative;
  z-index: 10;
  animation: fadeIn 1s ease;
}
.game-board.warn { /* orange subtle heartbeat */ transform: translateZ(0); }
.game-board.danger { /* red fast heartbeat */ transform: translateZ(0); }

/* 標題區域 */
.game-board h2 {
  margin: 0 0 15px 0;
  text-align: center;
  font-size: 1.8rem;
  font-weight: bold;
}

/* 標題和EXP區域容器 */
.title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 25px;
}

/* EXP 顯示 - 標題下方置中 */
.exp-display {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px 0;
  width: 100%;
}

.exp-display .soul-display {
  display: flex;
  justify-content: center;
  align-items: center;
  width: auto;
  min-width: 150px;
  text-align: center;
}

.cards {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.card {
  background: linear-gradient(135deg, #111, #222); /* 背景顏色 */
  border: 2px solid #00ffcc; /* 邊框顏色 */
  border-radius: 15px;
  padding: 20px;
  width: 300px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
  text-align: left;
  box-shadow: 0 0 10px #00ffcc50;
  position: relative;
  z-index: 10;
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px #00ffcc;
  border-color: #66fff0;
}

.card.selected {
  border-color: #ffcc00;
  box-shadow: 0 0 25px #ffcc00;
}

.card.correct {
  border-color: #0f0;
  box-shadow: 0 0 25px #0f0;
  animation: glow 1s ease;
}

.card.wrong {
  border-color: #f00;
  box-shadow: 0 0 25px #f00;
  animation: shake 0.5s ease;
}

.card.urgent {
  border-color: #ff3333;
  box-shadow: 0 0 12px #ff6666;
  animation: urgent-shake 0.22s ease-in-out infinite;
}

@keyframes urgent-shake {
  0% { transform: translateY(0) scale(1); }
  25% { transform: translateY(-1px) scale(1.005); }
  50% { transform: translateY(0) scale(1); }
  75% { transform: translateY(1px) scale(0.999); }
  100% { transform: translateY(0) scale(1); }
}

/* heartbeat effect applied to the whole board when warn/danger */
.game-board.warn { transform: translateZ(0); }
.game-board.danger { transform: translateZ(0); }
@keyframes heartbeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.02); }
  40% { transform: scale(1); }
  60% { transform: scale(1.01); }
  100% { transform: scale(1); }
}

.msg-sender {
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.msg-content {
  background-color: #1a1a1a;
  border-radius: 10px;
  padding: 10px;
  word-wrap: break-word;
  line-height: 1.4;
  color: #f0f0f0;
  font-size: 0.9rem;
  white-space: pre-line; /* 支援換行符號 \n */
  overflow-y: auto /* 保留超出的文字,用滾動方是閱讀 */
}

.msg-source {
  text-align: right;
  font-size: 0.7rem;
  color: #888;
  margin-top: 5px;
  font-style: italic;
}



.timer {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0be43a;
  margin-bottom: 15px;
  transition: color 0.2s ease, transform 0.15s ease;
}
.game-board.warn .timer { color: #ffae00; transform: scale(1.02); animation: timer-pulse-slow 1s infinite ease-in-out; }
.game-board.danger .timer { color: #ff4d4d; transform: scale(1.08); animation: timer-pulse-fast 0.45s infinite ease-in-out; }

@keyframes timer-pulse-slow {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}
@keyframes timer-pulse-fast {
  0% { transform: scale(1); }
  25% { transform: scale(1.06); }
  50% { transform: scale(1); }
  75% { transform: scale(1.04); }
  100% { transform: scale(1); }
}

@keyframes glow {
  0% { box-shadow: 0 0 0 #0f0; }
  50% { box-shadow: 0 0 25px #0f0; }
  100% { box-shadow: 0 0 10px #0f0; }
}

@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  50% { transform: translateX(8px); }
  75% { transform: translateX(-8px); }
  100% { transform: translateX(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .game-board {
    padding: 20px 10px;
  }
  
  .cards {
    gap: 15px;
  }
  
  .card {
    width: 280px;
    padding: 15px;
  }
  
  .exp-display .soul-display {
    min-width: 120px;
  }
}
</style>
