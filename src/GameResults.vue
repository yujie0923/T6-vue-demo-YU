<template>
  <div class="results">
    <!-- 靈魂進化特效層 -->
    <div v-if="evolutionData?.hasEvolved" class="evolution-overlay" @click="closeEvolution">
      <div class="evolution-content" @click.stop>
        <h2 class="evolution-title">🌟 靈魂覺醒 🌟</h2>
        <div class="evolution-stages">
          <div class="stage-from">
            <span class="stage-label">{{ evolutionData?.previousStage?.name || '未知' }}</span>
            <div class="stage-desc">{{ evolutionData?.previousStage?.description || '前階段描述' }}</div>
          </div>
          <div class="evolution-arrow">➤</div>
          <div class="stage-to">
            <span class="stage-label">{{ evolutionData?.newStage?.name || '未知' }}</span>
            <div class="stage-desc">{{ evolutionData?.newStage?.description || '新階段描述' }}</div>
          </div>
        </div>
        
        <div v-if="evolutionData?.currentAnimal" class="animal-reveal">
          <h3 class="animal-name">{{ evolutionData?.currentAnimal?.animal || '未知動物' }}</h3>
          <div class="animal-group">{{ evolutionData?.currentAnimal?.group || '未知組別' }}</div>
          <div class="animal-traits">
            <span v-for="trait in (evolutionData?.currentAnimal?.traits || [])" :key="trait" class="trait-tag">
              {{ trait }}
            </span>
          </div>
        </div>
        
        <div class="evolution-stats">
          <p><strong>獲得XP:</strong> +{{ evolutionData?.xpGained || 0 }}</p>
          <p><strong>總XP:</strong> {{ evolutionData?.totalXP || 0 }}</p>
          <p><strong>科技等級:</strong> {{ evolutionData?.techLevel || 1 }}</p>
        </div>
        
        <button class="close-evolution" @click="closeEvolution">繼續遊戲</button>
      </div>
    </div>

    <h2>遊戲結束</h2>
    <p class="mission">MISSION COMPLETE</p>
    
    <!-- 靈魂狀態顯示 -->
    <div class="soul-status">
      <div class="soul-info">
        <h3>靈魂狀態</h3>
        
        <!-- 靈魂分數詳細顯示：只要有心理測驗結果或靈魂動物就顯示 -->
        <div v-if="userId">
          <div class="soul-scores-detailed">
            <h4>本回合靈魂分數</h4>
            <div class="scores-list">
              <span class="score-item total">權威: {{ currentSessionSoulScore.auth }}</span>
              <span class="score-item total">時間: {{ currentSessionSoulScore.time }}</span>
              <span class="score-item total">動機: {{ currentSessionSoulScore.motive }}</span>
            </div>
            
            <div v-if="roundScoreChanges" class="round-changes">
              <div class="round-change-item">
                <span class="dimension-name">權威變化</span>
                <span class="round-change" :class="{'positive': roundScoreChanges.auth > 0, 'negative': roundScoreChanges.auth < 0}">
                  {{ formatScoreChange(roundScoreChanges.auth) }}
                </span>
              </div>
              <div class="round-change-item">
                <span class="dimension-name">時間變化</span>
                <span class="round-change" :class="{'positive': roundScoreChanges.time > 0, 'negative': roundScoreChanges.time < 0}">
                  {{ formatScoreChange(roundScoreChanges.time) }}
                </span>
              </div>
              <div class="round-change-item">
                <span class="dimension-name">動機變化</span>
                <span class="round-change" :class="{'positive': roundScoreChanges.motive > 0, 'negative': roundScoreChanges.motive < 0}">
                  {{ formatScoreChange(roundScoreChanges.motive) }}
                </span>
              </div>
            </div>

            <h4>歷史靈魂總分</h4>
            <div class="scores-list">
              <span class="score-item total">權威: {{ getSoulScores().auth }}</span>
              <span class="score-item total">時間: {{ getSoulScores().time }}</span>
              <span class="score-item total">動機: {{ getSoulScores().motive }}</span>
            </div>
          </div>
        </div>
        
        <!-- 靈魂覺醒分析：五次後才顯示 -->
        <div v-if="playerGameCount >= 5 && currentSoulAnimalLegacy">
          <p class="soul-hint">🌟 靈魂覺醒！你的防詐動物靈魂已顯現</p>
          
          <div class="current-animal">
            <div class="animal-emoji">{{ getAwakenedAnimalEmoji() }}</div>
            <div class="animal-info">
              <div class="animal-name">{{ getAwakenedAnimalName() }}</div>
              <div class="animal-code" v-if="currentSoulAnimalLegacy">
                代碼：{{ currentSoulAnimalLegacy.code }}
              </div>
              <div class="animal-description" v-if="currentSoulAnimalLegacy">
                {{ currentSoulAnimalLegacy.description }}
              </div>
              <div class="animal-scores" v-if="currentSoulAnimalLegacy?.soulScores">
                <p v-if="currentSoulAnimalLegacy.soulScores.quiz">
                  心理測驗：權威 {{ currentSoulAnimalLegacy.soulScores.quiz.auth ?? 0 }} /
                  時間 {{ currentSoulAnimalLegacy.soulScores.quiz.time ?? 0 }} /
                  動機 {{ currentSoulAnimalLegacy.soulScores.quiz.motive ?? 0 }}
                </p>
                <p v-if="currentSoulAnimalLegacy.soulScores.history">
                  遊戲加權：權威 {{ currentSoulAnimalLegacy.soulScores.history.auth ?? 0 }} /
                  時間 {{ currentSoulAnimalLegacy.soulScores.history.time ?? 0 }} /
                  動機 {{ currentSoulAnimalLegacy.soulScores.history.motive ?? 0 }}
                </p>
                <p v-if="currentSoulAnimalLegacy.soulScores.combined">
                  合併結果：權威 {{ currentSoulAnimalLegacy.soulScores.combined.auth ?? 0 }} /
                  時間 {{ currentSoulAnimalLegacy.soulScores.combined.time ?? 0 }} /
                  動機 {{ currentSoulAnimalLegacy.soulScores.combined.motive ?? 0 }}
                </p>
              </div>
              <div class="animal-traits">
                <span class="trait-badge">防詐覺醒</span>
                <span class="trait-badge">靈魂顯現</span>
              </div>
            </div>
          </div>
          
          <div class="awakening-analysis">
            <h4>靈魂覺醒分析</h4>
            <p class="awakening-text">
              <span v-if="evolutionData?.hasEvolved && evolutionData?.previousAnimal && evolutionData?.currentAnimal">
                經過{{ playerGameCount }}次防詐實戰訓練後，你的靈魂動物 {{ evolutionData.previousAnimal }} 已發生轉換，轉為 {{ evolutionData.currentAnimal }} 靈魂！
              </span>
              <span v-else>
                經過{{ playerGameCount }}次防詐實戰訓練後，你的 {{ getAwakenedAnimalName() }} 靈魂已完全覺醒！
                這是根據你心理測驗的結果確定的守護動物，代表著你獨特的防詐特質和能力。
              </span>
              (目前總共已完成 {{ playerGameCount }} 次訓練)
            </p>
          </div>
        </div>
        
        <!-- 未完成5次遊戲：顯示未覺醒狀態 -->
        <div v-if="playerGameCount < 5">
          <p class="soul-hint">🥚 靈魂未覺醒，完成5次詐騙測試後解鎖你的防詐動物靈魂...</p>
          <p class="progress-hint">目前進度: {{ playerGameCount }}/5 次遊戲</p>

          <div v-if="loadingInitialAnimal" class="initial-loading">
            正在分析你的初始靈魂動物...
          </div>

          <div v-else-if="initialAnimalLegacy" class="initial-animal">
            <p class="soul-hint">🔮 初始靈魂守護者</p>
            <div class="current-animal">
              <div class="animal-emoji">
                {{ getAnimalEmojiByCode(initialAnimalLegacy.code) }}
              </div>
              <div class="animal-info">
                <div class="animal-name">
                  {{ initialAnimalLegacy.animalName || getAnimalNameByCode(initialAnimalLegacy.code) }}
                </div>
                <div class="animal-code">
                  代碼：{{ initialAnimalLegacy.code }}
                </div>
                <div class="animal-description" v-if="initialAnimalLegacy.description">
                  {{ initialAnimalLegacy.description }}
                </div>
              <div class="animal-scores" v-if="initialAnimalLegacy.soulScores">
                <p>
                  心理測驗：權威 {{ initialAnimalLegacy.soulScores.auth ?? 0 }} /
                  時間 {{ initialAnimalLegacy.soulScores.time ?? 0 }} /
                  動機 {{ initialAnimalLegacy.soulScores.motive ?? 0 }}
                </p>
              </div>
                <div class="animal-traits">
                  <span class="trait-badge">心理測驗結果</span>
                  <span class="trait-badge">初始守護者</span>
                </div>
              </div>
            </div>
            <p class="initial-note">
              這是根據心理測驗產生的初始靈魂動物，象徵你的防詐直覺。
              完成 5 次遊戲後，我們會加入實戰分數重新評估你的靈魂形象。
            </p>
          </div>

          <div v-else class="quiz-reminder">
            <p class="reminder-text">⚠️ 請先完成心理測驗以確定你的靈魂動物類型</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 顯示當前登錄用戶及當輪分數 -->
    <div class="user-score-info" v-if="username">
      <p class="current-user">玩家: {{ username }}</p>
      <p class="submit-status success">本輪分數: {{ currentGameScore }} 分</p>
    </div>

    <!-- ✅ 遊戲解析區域 -->
    <div v-if="gameAnalysis.length" class="analysis-section">
      <h3>遊戲解析</h3>
      <div
        v-for="analysis in gameAnalysis"
        :key="analysis.round"
        class="analysis-item"
        :class="{ 'correct': analysis.isCorrect, 'incorrect': !analysis.isCorrect }"
      >
        <div class="round-header">
          <h4>第{{ analysis.round }}關</h4>
          <span class="result-badge" :class="{ 'correct': analysis.isCorrect, 'incorrect': !analysis.isCorrect }">
            {{ analysis.isCorrect ? '✓ 正確' : '✗ 錯誤' }}
          </span>
        </div>
        
        <div class="choice-comparison">
          <div class="user-choice">
            <h5>你的選擇</h5>
            <p class="message-content">「{{ analysis.userChoice.content }}」</p>
            <p class="message-category">類別：{{ analysis.userChoice.category }}</p>
            <p class="message-analysis" v-if="analysis.userChoice.analysis">
              解析：{{ analysis.userChoice.analysis }}
            </p>
          </div>
          
          <div class="correct-answer">
            <h5>正確答案</h5>
            <p class="message-content">「{{ analysis.correctAnswer.content }}」</p>
            <p class="message-category">類別：{{ analysis.correctAnswer.category }}</p>
            <p class="message-analysis" v-if="analysis.correctAnswer.analysis">
              解析：{{ analysis.correctAnswer.analysis }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 排行榜（直接顯示，無按鈕）-->
    <h3>排行榜</h3>
    <ol class="leaderboard">
      <li v-for="(entry, index) in leaderboard" :key="index">
        <span class="rank">{{ index + 1 }}.</span>
        <span class="name">{{ entry.name }}</span>
        <span class="score">{{ entry.score }} 分</span>
      </li>
    </ol>

    <!-- 如果排行榜為空的情況 -->
    <div v-if="leaderboard.length === 0" class="empty-leaderboard">
      <p>尚無排行榜記錄</p>
    </div>

    <!-- 回首頁 -->
    <button class="restart" @click="$emit('restart')">回首頁</button>
  </div>

  <!-- 駭客電網動畫層 -->
  <div class="hacker-grid"></div>
</template>

<script>

export default {
  name: "GameResults",
  props: {
    round: Number,
    score: Number,
    userChoices: { // 新增：用戶選擇數據
      type: Array,
      default: () => []
    },
    userData: { // Allen1: 用戶數據
      type: Object,
      default: () => null
    },
    currentUser: { // main: 當前用戶名
      type: String,
      default: ''
    },
    userId: { // 新增：當前用戶ID（用於API調用）
      type: [Number, String],
      default: null
    },
    sessionId: { // 新增：當前遊戲 session ID（用於獲取遊戲分數）
      type: [Number, String],
      default: null
    },
    evolutionData: { // 靈魂系統：進化資訊
      type: Object,
      default: () => ({ hasEvolved: false, xpGained: 0 })
    },
    initialAnimalLegacyProp: {
      type: Object,
      default: null
    },
    currentSoulAnimalLegacyProp: {
      type: Object,
      default: null
    }
  },
  emits: ['update-initial-animal', 'update-current-animal'],
  computed: {
  },
  data() {
    return {
      leaderboard: [],
      gameAnalysis: [], // Allen1: 遊戲解析數據
      playerGameCount: 0, // main: 玩家遊戲次數
      currentSoulAnimal: null, // 新增：當前靈魂動物數據（從後端API獲取）
      loadingAnimal: false, // 新增：靈魂動物載入狀態
      initialAnimal: null, // 心理測驗計算出的初始靈魂動物
      loadingInitialAnimal: false, // 初始動物載入狀態
      initialAnimalLegacy: this.initialAnimalLegacyProp || null, // 與舊 UI 相容的初始動物資料
      username: null, // 新增：從後端獲取的用戶名
      currentGameScore: 0, // 新增：當輪遊戲分數（從 game_sessions 獲取）
      roundScoreChanges: null, // 新增：本回合靈魂分數變化（待後端 API）
      currentSessionSoulScore: {
        auth: 0,
        time: 0,
        motive: 0
      },
      historicalSoulTotals: {
        auth: 0,
        time: 0,
        motive: 0
      },
      currentSoulAnimalLegacy: this.currentSoulAnimalLegacyProp || null // 與舊 UI 相容的合併靈魂動物資料
    };
  },
  watch: {
    initialAnimalLegacyProp(newVal) {
      if (newVal) {
        this.initialAnimalLegacy = newVal
      } else if (newVal === null) {
        this.initialAnimalLegacy = null
      }
    },
    currentSoulAnimalLegacyProp(newVal) {
      if (newVal) {
        this.currentSoulAnimalLegacy = newVal
      } else if (newVal === null) {
        this.currentSoulAnimalLegacy = null
      }
    }
  },
  methods: {
    formatAnimalForLegacyUI(animal) {
      if (!animal) return null;
      const atmCode = animal.animal_ATM_code || animal.animal_atm_code || '';
      return {
        animalName: animal.animal_name || this.getAnimalNameByCode(atmCode),
        description: animal.animal_description || '',
        code: atmCode,
        soulScores: animal.soul_scores || {
          auth: animal.auth ?? 0,
          time: animal.time ?? 0,
          motive: animal.motive ?? 0
        }
      };
    },

    async fetchLeaderboard() {
      try {
        const response = await fetch('http://localhost:8000/leaderboard?limit=10', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('GameResults: 排行榜獲取成功:', result);
        
        if (result.success) {
          // 轉換後端數據格式為前端需要的格式
          this.leaderboard = result.data.map(entry => ({
            name: entry.username,
            score: entry.total_score
          }));
        } else {
          console.error('獲取排行榜失敗:', result.error || result.message);
          this.leaderboard = [];
        }
      } catch (err) {
        console.error("取得排行榜失敗", err);
        this.leaderboard = [];
      }
    },
    async fetchCurrentGameScore() {
      if (!this.sessionId) {
        console.warn('無法獲取當輪分數：缺少 session_id');
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:8000/games/${this.sessionId}/details`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const { total_score, session_soul } = result.data
          this.currentGameScore = total_score ?? 0
          this.currentSessionSoulScore = {
            auth: session_soul?.auth ?? 0,
            time: session_soul?.time ?? 0,
            motive: session_soul?.motive ?? 0
          }
          console.log('當輪遊戲分數獲取成功:', this.currentGameScore, '靈魂分數:', this.currentSessionSoulScore)
        } else {
          console.warn('獲取當輪分數失敗:', result.message);
          this.currentGameScore = 0;
          this.currentSessionSoulScore = { auth: 0, time: 0, motive: 0 }
        }
      } catch (error) {
        console.error('獲取當輪分數失敗:', error);
        this.currentGameScore = 0;
        this.currentSessionSoulScore = { auth: 0, time: 0, motive: 0 }
      }
    },
    async fetchGameAnalysis() {
      try {
        if (this.userChoices && this.userChoices.length > 0) {
          console.log('GameResults: 開始獲取遊戲解析，用戶選擇:', this.userChoices);
          
          const response = await fetch('http://localhost:8000/games/analysis', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userChoices: this.userChoices
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          console.log('GameResults: 遊戲解析獲取成功:', result);
          
          if (result.success) {
            this.gameAnalysis = result.data || [];
          } else {
            console.error('獲取遊戲解析失敗:', result.error || result.message);
          }
        }
      } catch (error) {
        console.error('GameResults: 獲取遊戲解析失敗:', error);
      }
    },
    closeEvolution() {
      this.$emit('close-evolution');
    },
    async loadPlayerProgress() {
      // 從後端 API 獲取用戶名和遊戲次數
      if (!this.userId) {
        console.warn('無法加載進度：缺少 user_id');
        return;
      }
      
      try {
        // 獲取用戶名
        await this.fetchUsername();
        
        // 獲取遊戲次數
        const response = await fetch(`http://localhost:8000/users/${this.userId}/game-history?limit=20`);
        const result = await response.json();
        
        if (result.success && result.data) {
          this.playerGameCount = result.data.length;
          console.log(`玩家已完成 ${this.playerGameCount} 次遊戲`);
        } else {
          this.playerGameCount = 0;
          console.warn('無法獲取遊戲歷史');
        }

        await this.fetchInitialAnimal();
      } catch (error) {
        console.error('獲取遊戲歷史失敗:', error);
        this.playerGameCount = 0;
        await this.fetchInitialAnimal();
      }
    },
    async fetchHistoricalSoulTotals() {
      if (!this.userId) {
        this.historicalSoulTotals = { auth: 0, time: 0, motive: 0 }
        return
      }

      try {
        const response = await fetch(`http://localhost:8000/users/${this.userId}/history-soul-score`)
        const result = await response.json()
        if (result.success && result.data) {
          this.historicalSoulTotals = {
            auth: result.data.auth ?? 0,
            time: result.data.time ?? 0,
            motive: result.data.motive ?? 0
          }
        } else {
          console.warn('獲取歷史靈魂分數失敗:', result.message)
          this.historicalSoulTotals = { auth: 0, time: 0, motive: 0 }
        }
      } catch (error) {
        console.error('獲取歷史靈魂分數失敗:', error)
        this.historicalSoulTotals = { auth: 0, time: 0, motive: 0 }
      }
    },
    
    async fetchUsername() {
      if (!this.userId) return;
      
      try {
        const response = await fetch(`http://localhost:8000/users/${this.userId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          this.username = result.data.username || result.data.name;
          console.log('用戶名獲取成功:', this.username);
        } else {
          console.warn('無法獲取用戶名:', result.message);
          this.username = null;
        }
      } catch (error) {
        console.error('獲取用戶名失敗:', error);
        this.username = null;
      }
    },
    
    async fetchSoulAnimal() {
      if (!this.userId) {
        this.currentSoulAnimal = null;
        this.currentSoulAnimalLegacy = null;
        this.$emit('update-current-animal', null);
        return;
      }
      if (this.playerGameCount < 5) {
        this.currentSoulAnimal = null;
        this.currentSoulAnimalLegacy = null;
        this.$emit('update-current-animal', null);
        return;
      }
      
      this.loadingAnimal = true;
      try {
        const response = await fetch(`http://localhost:8000/users/${this.userId}/animal`);
        const result = await response.json();
        
        if (result.success && result.data) {
          this.currentSoulAnimal = result.data;
          this.currentSoulAnimalLegacy = this.formatAnimalForLegacyUI(result.data);
          this.$emit('update-current-animal', this.currentSoulAnimalLegacy);
          console.log('靈魂動物獲取成功:', this.currentSoulAnimal);
        } else {
          console.warn('無法計算靈魂動物:', result.message);
          this.currentSoulAnimal = null;
          this.currentSoulAnimalLegacy = null;
          this.$emit('update-current-animal', null);
        }
      } catch (error) {
        console.error('獲取靈魂動物失敗:', error);
        this.currentSoulAnimal = null;
        this.currentSoulAnimalLegacy = null;
        this.$emit('update-current-animal', null);
      } finally {
        this.loadingAnimal = false;
      }
    },

    async fetchInitialAnimal() {
      if (!this.userId) {
        this.initialAnimal = null
        return
      }

      this.loadingInitialAnimal = true
      try {
        const response = await fetch(`http://localhost:8000/users/${this.userId}/initial-animal`)
        const result = await response.json()
        if (result.success && result.data) {
          this.initialAnimal = result.data
          this.initialAnimalLegacy = this.formatAnimalForLegacyUI(result.data)
          this.$emit('update-initial-animal', this.initialAnimalLegacy)
          console.log('初始靈魂動物獲取成功:', this.initialAnimal)
        } else {
          console.warn('無法獲取初始靈魂動物:', result.message)
          this.initialAnimal = null
          this.initialAnimalLegacy = null
          this.$emit('update-initial-animal', null)
        }
      } catch (error) {
        console.error('獲取初始靈魂動物失敗:', error)
        this.initialAnimal = null
        this.initialAnimalLegacy = null
        this.$emit('update-initial-animal', null)
      } finally {
        this.loadingInitialAnimal = false
      }
    },
    
    getAnimalEmojiByCode(code) {
      if (!code) return '🥚'
      const normalized = code.toUpperCase()
      const emojiMap = {
        'R-J-P': '🐙',
        'R-J-R': '🐱',
        'R-C-R': '🦊',
        'R-C-P': '🦁',
        'A-J-R': '🐢',
        'A-C-P': '🐶',
        'A-C-R': '🐎',
        'A-J-P': '🦉'
      }
      return emojiMap[normalized] || '🥚'
    },

    getAnimalNameByCode(code) {
      if (!code) return '神秘靈魂動物'
      const normalized = code.toUpperCase()
      const nameMap = {
        'R-J-P': '章魚型 SHADE',
        'R-J-R': '貓型 MUSE',
        'R-C-R': '狐狸型 ROGUE',
        'R-C-P': '獅子型 REBEL',
        'A-J-R': '烏龜型 SAGE',
        'A-C-P': '黃金獵犬型 SENTINEL',
        'A-C-R': '馬型 VALOR',
        'A-J-P': '貓頭鷹型 ORACLE'
      }
      return nameMap[normalized] || '神秘靈魂動物'
    },

    getAwakenedAnimalEmoji() {
      const code = this.currentSoulAnimalLegacy?.code
        || this.currentSoulAnimal?.animal_ATM_code
        || this.currentSoulAnimal?.animal_atm_code
      return this.getAnimalEmojiByCode(code)
    },
    
    getAwakenedAnimalName() {
      if (this.currentSoulAnimalLegacy?.animalName) {
        return this.currentSoulAnimalLegacy.animalName
      }
      if (this.currentSoulAnimal?.animal_name) {
        return this.currentSoulAnimal.animal_name
      }
      const code = this.currentSoulAnimalLegacy?.code
        || this.currentSoulAnimal?.animal_ATM_code
        || this.currentSoulAnimal?.animal_atm_code
      return this.getAnimalNameByCode(code)
    },
    
    getSoulScores() {
      return {
        auth: this.historicalSoulTotals.auth || 0,
        time: this.historicalSoulTotals.time || 0,
        motive: this.historicalSoulTotals.motive || 0
      };
    },

    formatScoreChange(value) {
      if (value > 0) return `+${value}`;
      if (value < 0) return `${value}`;
      return '0';
    },
    
    // TODO: 計算本回合靈魂分數變化（待後端實現）
    // 可能的 API: GET /games/{session_id}/round-soul-changes
    // 或從 complete_game 響應中獲取
    async calculateRoundScoreChanges() {
      try {
        // TODO: 之後從後端 API 獲取本回合的靈魂分數變化
        // const response = await fetch(`http://localhost:8000/games/${sessionId}/round-soul-changes`);
        // const result = await response.json();
        // if (result.success) {
        //   this.roundScoreChanges = {
        //     auth: result.data.auth_change || 0,
        //     time: result.data.time_change || 0,
        //     motive: result.data.motive_change || 0
        //   };
        // }
        
        // 暫時設為 null，待後端實現
        this.roundScoreChanges = null;
      } catch (error) {
        console.error('獲取本回合靈魂分數變化失敗:', error);
        this.roundScoreChanges = null;
      }
    },
    

  },
  mounted() {
    console.log('=== GameResults mounted 開始 ===');
    
    this.fetchGameAnalysis();
    this.fetchLeaderboard();
    
    // 獲取當輪遊戲分數（只要有 sessionId 就可以）
    if (this.sessionId) {
      this.fetchCurrentGameScore();
    }
    
    // 如果有 userId，加载灵魂系统相关数据
    if (this.userId) {
      this.$nextTick(() => {
        setTimeout(async () => {
          // 1. 載入遊戲次數
          await this.loadPlayerProgress();
          
          await this.fetchHistoricalSoulTotals();
          
          // 2. 計算本回合靈魂分數變化
          await this.calculateRoundScoreChanges();
          
          // 3. 載入靈魂動物（方法內部會判斷遊戲次數）
          await this.fetchSoulAnimal();
          
          console.log('🔄 已加载灵魂评分系统');
        }, 100);
      });
    }
    
    console.log('=== GameResults mounted 完成 ===');
  }
};
</script>

<style scoped>
.results {
  position: relative;
  z-index: 999;
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #0a0a0a, #111, #1b1b1b);
  color: #00ffcc;
  border-radius: 20px;
  box-shadow: 0 0 20px rgba(0,255,200,0.2), 0 10px 25px rgba(0,0,0,0.5);
  overflow-y: auto;
  max-height: 90vh;
}

.mission {
  font-weight: bold;
  font-size: 1.3rem;
  margin-bottom: 25px;
  text-shadow: 0 0 5px #00ffcc;
}

.user-info {
  margin: 15px 0;
  padding: 10px 20px;
  background: rgba(0, 40, 40, 0.3);
  border-radius: 10px;
  border: 1px solid #00ffcc;
}

.user-name {
  color: #00ffff;
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 0 3px #00ffcc;
}

.leaderboard-input {
  margin: 20px 0;
  padding: 20px;
  background: rgba(0, 255, 204, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 204, 0.3);
}

.score-display p {
  margin: 10px 0;
  font-size: 1.1rem;
}

.restart {
  background: linear-gradient(45deg, #00ffcc, #0ff);
  color: #000;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
  margin-top: 20px;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.restart:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0,255,200,0.5);
}

/* 靈魂進化特效 */
.evolution-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.evolution-content {
  background: linear-gradient(135deg, #0a0a0a, #1a1a3a, #2a2a4a);
  padding: 40px;
  border-radius: 20px;
  max-width: 600px;
  width: 90%;
  text-align: center;
  border: 2px solid #00ffcc;
  box-shadow: 0 0 30px rgba(0,255,200,0.5);
}

.evolution-title {
  color: #ffd700;
  font-size: 2rem;
  margin-bottom: 30px;
  text-shadow: 0 0 10px #ffd700;
}

.evolution-stages {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30px 0;
}

.stage-from, .stage-to {
  flex: 1;
  padding: 20px;
  background: rgba(0, 255, 204, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 204, 0.3);
}

.stage-from {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
}

.stage-label {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 10px;
}

.stage-desc {
  font-size: 0.9rem;
  color: #ccc;
  line-height: 1.4;
}

.evolution-arrow {
  font-size: 2rem;
  color: #00ffcc;
  margin: 0 20px;
  animation: pulse 2s infinite;
}

.animal-reveal {
  margin: 30px 0;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(0, 255, 204, 0.1));
  border-radius: 15px;
  border: 1px solid rgba(255, 215, 0, 0.5);
}

.animal-name {
  font-size: 1.5rem;
  color: #ffd700;
  margin-bottom: 10px;
}

.animal-code {
  color: #00ffff;
  font-size: 0.95rem;
  margin-bottom: 8px;
  font-weight: bold;
}

.animal-group {
  color: #00ffcc;
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.animal-description {
  color: #e0e0e0;
  font-size: 0.9rem;
  margin-bottom: 10px;
  line-height: 1.4;
  font-style: italic;
}

.animal-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.trait-tag {
  background: rgba(0, 255, 204, 0.2);
  color: #00ffcc;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  border: 1px solid rgba(0, 255, 204, 0.4);
}

.evolution-stats {
  margin: 20px 0;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.close-evolution {
  background: linear-gradient(45deg, #00ffcc, #0ff);
  color: #000;
  border: none;
  padding: 12px 25px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 20px;
}

/* 靈魂狀態 */
.soul-status {
  margin: 30px 0;
  padding: 25px;
  background: linear-gradient(135deg, rgba(0, 255, 204, 0.1), rgba(0, 100, 255, 0.1));
  border-radius: 15px;
  border: 1px solid rgba(0, 255, 204, 0.3);
}

.soul-info h3 {
  color: #ffd700;
  margin-bottom: 20px;
  font-size: 1.4rem;
  text-shadow: 0 0 8px #ffd700;
}

.soul-hint {
  font-size: 1.1rem;
  margin-bottom: 20px;
  color: #00ffcc;
  font-style: italic;
}

.progress-hint {
  font-size: 0.9rem;
  color: #ffd700;
  margin: 10px 0;
}

.quiz-reminder {
  margin: 15px 0;
  padding: 15px;
  background: rgba(255, 165, 0, 0.1);
  border: 1px solid rgba(255, 165, 0, 0.3);
  border-radius: 10px;
}

.reminder-text {
  color: #ffa500;
  font-size: 0.9rem;
  margin: 0;
}

.awakening-analysis {
  margin: 20px 0;
  padding: 20px;
  background: linear-gradient(135deg, rgba(0, 255, 204, 0.1), rgba(0, 150, 255, 0.1));
  border: 1px solid rgba(0, 255, 204, 0.3);
  border-radius: 15px;
}

.awakening-analysis h4 {
  color: #00ffcc;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
}

.awakening-text {
  color: #e0e0e0;
  line-height: 1.6;
  margin: 0;
}

.soul-scores-simple {
  margin: 25px 0;
  padding: 20px;
  background: linear-gradient(135deg, rgba(0, 255, 204, 0.1), rgba(0, 150, 255, 0.1));
  border: 1px solid rgba(0, 255, 204, 0.3);
  border-radius: 15px;
  text-align: center;
}

.soul-scores-detailed {
  margin: 25px 0;
  padding: 20px;
  background: linear-gradient(135deg, rgba(0, 255, 204, 0.1), rgba(0, 150, 255, 0.1));
  border: 1px solid rgba(0, 255, 204, 0.3);
  border-radius: 15px;
  text-align: center;
}

.soul-scores-simple h4,
.soul-scores-detailed h4 {
  color: #00ffcc;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
}

.round-changes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.round-change-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-width: 80px;
}

.dimension-name {
  font-size: 0.9rem;
  color: #ccc;
  font-weight: bold;
}

.round-change {
  font-size: 1.1rem;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  min-width: 50px;
  text-align: center;
}

.round-change.positive {
  color: #00ff88;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.round-change.negative {
  color: #ff6666;
  background: rgba(255, 102, 102, 0.1);
  border: 1px solid rgba(255, 102, 102, 0.3);
}

.scores-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
}
.score-item {
  background: rgba(0, 255, 204, 0.1);
  color: #00ffcc;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  border: 1px solid rgba(0, 255, 204, 0.3);
  min-width: 80px;
  text-align: center;
}

.score-item.total {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(0, 255, 204, 0.1));
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.4);
  font-size: 1.1rem;
}

.current-animal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 15px;
}

.animal-emoji {
  font-size: 4rem;
  animation: bounce 2s infinite;
}

.animal-info {
  text-align: left;
}

.animal-code {
  color: #00ffff;
  font-size: 0.95rem;
  margin-bottom: 8px;
  font-weight: bold;
}

.animal-description {
  color: #e0e0e0;
  font-size: 0.9rem;
  margin-bottom: 10px;
  line-height: 1.4;
  font-style: italic;
}

.leaderboard-input button:hover:not(:disabled) {
  background: #0ff;
}

/* 遊戲解析樣式 */
.analysis-section {
  margin: 30px auto;
  padding: 20px;
  background: rgba(0, 30, 30, 0.6);
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(0,255,200,0.2);
  max-width: 900px;
  text-align: left;
}

.analysis-section h3 {
  text-align: center;
  margin-bottom: 20px;
  color: #00ffee;
  text-shadow: 0 0 8px #00ffcc;
}

.analysis-item {
  margin-bottom: 25px;
  padding: 20px;
  border-radius: 12px;
  background: rgba(10, 10, 10, 0.8);
  border: 2px solid transparent;
  transition: all 0.3s;
}

.analysis-item.correct {
  border-color: #00ff88;
  background: rgba(0, 40, 20, 0.3);
}

.analysis-item.incorrect {
  border-color: #ff4444;
  background: rgba(40, 0, 0, 0.3);
}

.round-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.round-header h4 {
  color: #00ffff;
  margin: 0;
}

.result-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
}

.result-badge.correct {
  background: #00ff88;
  color: #000;
}

.result-badge.incorrect {
  background: #ff4444;
  color: #fff;
}

.choice-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.user-choice, .correct-answer {
  padding: 15px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.4);
}

.user-choice h5, .correct-answer h5 {
  margin: 0 0 10px 0;
  color: #00ffcc;
  font-size: 1rem;
}

.message-content {
  color: #fff;
  margin-bottom: 8px;
  font-style: italic;
  line-height: 1.4;
}

.message-category {
  color: #00ffff;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.message-analysis {
  color: #ccc;
  font-size: 0.85rem;
  line-height: 1.3;
}

.trait-badge {
  display: inline-block;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(0, 255, 204, 0.1));
  color: #ffd700;
  padding: 4px 10px;
  margin: 2px;
  border-radius: 12px;
  font-size: 0.8rem;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.initial-animal {
  margin-top: 16px;
}

.initial-note {
  margin-top: 12px;
  font-size: 0.9rem;
  color: #80ffe6;
}

.initial-loading {
  margin-top: 12px;
  color: #80ffe6;
  font-style: italic;
}

.animal-scores {
  margin-top: 8px;
  color: #80ffe6;
  font-size: 0.85rem;
  line-height: 1.4;
}

.axes-analysis {
  margin: 25px 0;
  padding: 20px;
  background: rgba(0, 100, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(0, 100, 255, 0.2);
}

.axes-analysis h4 {
  color: #0084ff;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.axes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.axis-item {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(0, 100, 255, 0.2);
}

.axis-label {
  display: block;
  color: #0084ff;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.axis-value {
  color: #00ffcc;
  font-weight: bold;
}

/* 用戶分數資訊 */
.user-score-info {
  margin: 20px 0;
  padding: 15px;
  background: rgba(0, 255, 204, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 204, 0.3);
}

.current-user {
  font-size: 1.1rem;
  color: #00ffcc;
  margin-bottom: 10px;
}

.submit-status {
  font-size: 1rem;
}

.submit-status.success {
  color: #00ff88;
}

/* 排行榜 */
.leaderboard {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  background: rgba(0, 255, 204, 0.1);
  border-radius: 10px;
  padding: 20px;
}

.leaderboard li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 255, 204, 0.2);
}

.leaderboard li:last-child {
  border-bottom: none;
}

.rank {
  font-weight: bold;
  color: #ffd700;
  min-width: 30px;
}

.name {
  flex: 1;
  text-align: left;
  margin-left: 15px;
}

.score {
  color: #00ffcc;
  font-weight: bold;
}

.empty-leaderboard {
  color: #888;
  font-style: italic;
  padding: 20px;
}

/* 動畫 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

/* 駭客電網背景 */
.hacker-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(rgba(0,255,200,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,200,0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .results {
    padding: 40px 15px;
  }
  
  .evolution-stages {
    flex-direction: column;
    gap: 15px;
  }
  
  .evolution-arrow {
    transform: rotate(90deg);
    margin: 15px 0;
  }
  
  .current-animal {
    flex-direction: column;
    text-align: center;
  }
  
  .animal-info {
    text-align: center;
  }
  
  .axes-grid {
    grid-template-columns: 1fr;
  }
}
</style>