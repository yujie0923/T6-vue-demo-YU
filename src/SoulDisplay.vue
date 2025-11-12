<template>
  <div class="soul-display" :class="{ 'compact': compact }">
    <div class="soul-header">
      <h3 v-if="!compact">靈魂狀態</h3>
      <div class="soul-stage">
        <span v-if="compact" class="compact-info">
          EXP: {{ soulStore.soulXP }}
          <template v-if="displayAnimalName">
            | {{ displayAnimalEmoji }}{{ displayAnimalName }}
          </template>
        </span>
        <template v-else>
          <span class="stage-name">{{ soulStore.currentStage.name }}</span>
          <span v-if="displayAnimalName" class="animal-indicator">
            {{ displayAnimalEmoji }} {{ displayAnimalName }}
          </span>
          <span v-else class="no-animal">🥚 未覺醒</span>
        </template>
      </div>
      
      <!-- 同步狀態指示器 - 只在非緊湊模式顯示 -->
      <div v-if="!compact" class="sync-status" :class="syncInfo.status">
        <span v-if="syncInfo.status === 'syncing'" class="sync-indicator">🔄 同步中...</span>
        <span v-else-if="syncInfo.status === 'synced'" class="sync-indicator">✅ 已同步</span>
        <span v-else-if="syncInfo.status === 'sync_error'" class="sync-indicator">❌ 同步失敗</span>
        <span v-else-if="syncInfo.isLoggedIn" class="sync-indicator">📱 本地存儲</span>
        <span v-else class="sync-indicator">🌐 訪客模式</span>
      </div>
    </div>
    
    <div v-if="!compact" class="soul-stats">
      <div class="xp-info">
        <span class="label">EXP:</span>
        <span class="value">{{ soulStore.soulXP }}</span>
        <span v-if="nextStageXP !== 'MAX'" class="next">/ {{ nextStageXP }}</span>
      </div>
      
      <div class="xp-bar">
        <div class="xp-fill" :style="{ width: soulStore.progressToNextStage + '%' }"></div>
      </div>
      
      <div class="secondary-stats">
        <span class="tech-level">科技等級: {{ soulStore.techLevel }}</span>
        <span v-if="soulStore.answerStreak > 0" class="streak">
          連擊: {{ soulStore.answerStreak }}
        </span>
      </div>
    </div>
    
    <!-- 動物組別顏色指示器 - 只在非緊湊模式顯示 -->
    <div v-if="displayGroup && !compact" class="group-indicator" :style="{ backgroundColor: groupColor }">
      {{ displayGroup }}
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useSoulAnimalStore, EVOLUTION_STAGES, GROUP_COLORS } from './stores/soulAnimalSystem.js';

export default {
  name: 'SoulDisplay',
  props: {
    compact: {
      type: Boolean,
      default: false
    },
    initialAnimal: {
      type: Object,
      default: null
    },
    currentAnimal: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const soulStore = useSoulAnimalStore();
    
    const getEmojiByCode = (code = '') => {
      const normalized = `${code}`.toUpperCase();
      const emojiMap = {
        'R-J-P': '🐙',
        'R-J-R': '🐱',
        'R-C-R': '🦊',
        'R-C-P': '🦁',
        'A-J-R': '🐢',
        'A-C-P': '🐶',
        'A-C-R': '🐎',
        'A-J-P': '🦉'
      };
      return emojiMap[normalized] || '🥚';
    };
    
    const legacyAnimal = computed(() => props.currentAnimal || props.initialAnimal || null);
    const storeAnimal = computed(() => soulStore.currentAnimal);
    
    const displayAnimalName = computed(() => {
      if (legacyAnimal.value?.animalName) {
        return legacyAnimal.value.animalName;
      }
      if (storeAnimal.value?.animal) {
        return storeAnimal.value.animal;
      }
      return null;
    });
    
    const displayAnimalCode = computed(() => {
      if (legacyAnimal.value?.code) {
        return legacyAnimal.value.code;
      }
      if (soulStore.currentAnimalCode?.value) {
        return soulStore.currentAnimalCode.value;
      }
      return null;
    });
    
    const displayAnimalEmoji = computed(() => {
      if (legacyAnimal.value?.code) {
        return getEmojiByCode(legacyAnimal.value.code);
      }
      if (storeAnimal.value?.emoji) {
        return storeAnimal.value.emoji;
      }
      if (displayAnimalCode.value) {
        return getEmojiByCode(displayAnimalCode.value);
      }
      return '🥚';
    });
    
    const nextStageXP = computed(() => {
      const currentStage = soulStore.currentStage;
      if (currentStage === EVOLUTION_STAGES.EVOLUTION) {
        return 'MAX';
      }
      return currentStage.maxXP + 1;
    });
    
    const groupColor = computed(() => {
      if (!storeAnimal.value) return '#666';
      return GROUP_COLORS[storeAnimal.value.group]?.primary || '#666';
    });
    
    const displayGroup = computed(() => storeAnimal.value?.group || null);
    
    const syncInfo = computed(() => soulStore.getSyncInfo());
    
    return {
      soulStore,
      nextStageXP,
      groupColor,
      syncInfo,
      displayAnimalName,
      displayAnimalEmoji,
      displayGroup
    };
  }
};
</script>

<style scoped>
.soul-display {
  background: linear-gradient(135deg, rgba(0, 255, 204, 0.05), rgba(0, 100, 255, 0.05));
  border: 1px solid rgba(0, 255, 204, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 5px 0;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(2px);
}

.soul-display.compact {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  margin: 0;
  font-size: 1rem;
}

/* 移除閃光動畫以減少干擾 */
.soul-display::before {
  display: none;
}

.soul-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.soul-header h3 {
  color: #00ffcc;
  margin: 0;
  font-size: 1.2rem;
}

.sync-status {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid;
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.sync-status.syncing {
  border-color: #ffa500;
  color: #ffa500;
  animation: pulse 1.5s ease-in-out infinite;
}

.sync-status.synced {
  border-color: #00ff88;
  color: #00ff88;
}

.sync-status.sync_error {
  border-color: #ff4444;
  color: #ff4444;
}

.sync-status.not_synced {
  border-color: #888;
  color: #888;
}

.sync-indicator {
  white-space: nowrap;
}

.soul-stage {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stage-name {
  color: #ffd700;
  font-weight: bold;
  font-size: 1.1rem;
}

.animal-indicator {
  color: #00ffcc;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.no-animal {
  color: #888;
  font-style: italic;
  font-size: 0.9rem;
}

.compact-info {
  color: #00ccaa;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;
  display: inline-block;
  padding: 4px 12px;
  background: rgba(0, 204, 170, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(0, 204, 170, 0.3);
  text-align: center;
  margin: 0 auto;
}

.soul-stats {
  margin-bottom: 10px;
}

.xp-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 1rem;
}

.label {
  color: #ccc;
}

.value {
  color: #00ffcc;
  font-weight: bold;
  font-size: 1.1rem;
}

.next {
  color: #888;
}

.xp-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 204, 0.2);
  margin-bottom: 6px;
}

.xp-fill {
  height: 100%;
  background: linear-gradient(90deg, #00aa99, #00ccaa);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 2px rgba(0, 255, 204, 0.2);
  position: relative;
}

.xp-fill::after {
  display: none; /* 移除發光動畫 */
}

.secondary-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.tech-level {
  color: #ffd700;
}

.streak {
  color: #ff8888;
  font-weight: bold;
  /* 移除脈動動畫 */
}

.group-indicator {
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px 10px;
  border-radius: 0 13px 0 10px;
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 緊湊模式樣式 */
.soul-display.compact .soul-header {
  margin-bottom: 0;
  justify-content: center;
  align-items: center;
}

.soul-display.compact .soul-stage {
  display: flex;
  justify-content: center;
  align-items: center;
}

.soul-display.compact .soul-header h3 {
  font-size: 1rem;
}

.soul-display.compact .stage-name {
  font-size: 1rem;
}

.soul-display.compact .animal-indicator {
  font-size: 0.9rem;
}

.soul-display.compact .xp-bar {
  height: 8px;
  margin-bottom: 6px;
}

.soul-display.compact .secondary-stats {
  font-size: 0.8rem;
}

/* 動畫效果 */
@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes glow {
  0% { opacity: 0.5; }
  100% { opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .soul-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .soul-stage {
    flex-wrap: wrap;
  }
  
  .secondary-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  /* 手機版緊湊模式調整 */
  .soul-display.compact {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
  
  .compact-info {
    font-size: 0.65rem;
  }
}
</style>