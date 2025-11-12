import { scamMessages } from "../database";
import { realMessages } from "../database_true";
import soulAnimalStore from './soulAnimalStore.js';
import { EVOLUTION_STAGES } from './stores/soulAnimalSystem.js';
// 移除心理評分系統 - 改為使用Quiz.vue完成後給予+100經驗值
debugger; /* PartiallyEnd: #3632/script.vue */
const __VLS_export = (await import('vue')).defineComponent({
    name: "GameResults",
    props: {
        round: Number,
        score: Number,
        wrongIds: {
            type: Array,
            default: () => []
        },
        currentUser: {
            type: String,
            required: true
        },
        evolutionData: {
            type: Object,
            default: () => ({
                hasEvolved: false,
                xpGained: 0,
                totalXP: 0,
                techLevel: 1
            })
        }
    },
    emits: ["restart"],
    computed: {
        soulStore() {
            // 返回已import的soulAnimalStore實例
            return soulAnimalStore;
        },
        nextStageXP() {
            const currentStage = this.soulStore?.currentStage;
            if (currentStage === EVOLUTION_STAGES.EVOLUTION) {
                return 'MAX';
            }
            return (currentStage?.maxXP || 0) + 1;
        }
    },
    data() {
        return {
            leaderboard: [],
            wrongAnswers: [],
            scoreSubmitted: false,
            totalUserScore: 0,
            playerGameCount: 0,
            firstAnimalResult: null,
            calculatedScores: null, // 儲存計算後的心理學分數
            roundScoreChanges: null // 儲存本回合的分數變化
        };
    },
    methods: {
        closeEvolution() {
            this.$emit('close-evolution');
        },
        async submitScoreToStore() {
            console.log('GameResults: submitScoreToStore 開始執行');
            console.log('GameResults: currentUser:', this.currentUser);
            console.log('GameResults: score:', this.score);
            if (this.currentUser && this.score >= 0) {
                try {
                    console.log('GameResults: 正在提交分數到 soulAnimalStore');
                    this.totalUserScore = soulAnimalStore.addGameScore(this.currentUser, this.score);
                    this.scoreSubmitted = true;
                    const gameData = {
                        round: this.round,
                        score: this.score,
                        wrongAnswers: this.wrongAnswers,
                        mode: 'normal'
                    };
                    console.log('GameResults: 遊戲數據準備保存:', gameData);
                    if (soulAnimalStore.saveGameRecord) {
                        soulAnimalStore.saveGameRecord(this.currentUser, gameData);
                    }
                    this.loadLeaderboard();
                    console.log('GameResults: 分數提交完成，總分:', this.totalUserScore);
                }
                catch (error) {
                    console.error('提交分數時發生錯誤:', error);
                    this.scoreSubmitted = false;
                }
            }
            else {
                console.warn('GameResults: 無效的用戶或分數，跳過分數提交');
            }
        },
        loadLeaderboard() {
            console.log('GameResults: loadLeaderboard 被調用');
            this.leaderboard = soulAnimalStore.getLeaderboard();
            console.log('GameResults: 載入的排行榜數據:', this.leaderboard);
        },
        loadWrongQuestions() {
            console.log('GameResults: loadWrongQuestions 被調用，wrongIds:', this.wrongIds);
            const wrongIdStrs = this.wrongIds.map(id => String(id));
            console.log('GameResults: 轉換後的wrongIdStrs:', wrongIdStrs);
            const realArray = Array.isArray(realMessages) ? realMessages : [];
            this.wrongAnswers = realArray.filter((msg) => wrongIdStrs.includes(String(msg.id)));
            console.log('GameResults: 找到的錯誤訊息（真實訊息）:', this.wrongAnswers);
        },
        loadPlayerProgress() {
            if (!this.currentUser)
                return;
            const gameRecords = soulAnimalStore.getUserGameRecords(this.currentUser);
            this.playerGameCount = gameRecords.length;
            console.log(`玩家 ${this.currentUser} 已完成 ${this.playerGameCount} 次遊戲`);
            const userRecords = soulAnimalStore.getUserRecords(this.currentUser);
            if (userRecords && userRecords.length > 0) {
                this.firstAnimalResult = userRecords[userRecords.length - 1].animalResult;
                console.log('玩家第一次心理測驗結果:', this.firstAnimalResult);
            }
            else {
                this.firstAnimalResult = null;
                console.log('未找到玩家的心理測驗記錄');
            }
        },
        getAwakenedAnimalEmoji() {
            if (!this.firstAnimalResult)
                return '🥚';
            const animalName = this.firstAnimalResult.finalAnimal || this.firstAnimalResult.animalName || this.firstAnimalResult.animalId;
            const emojiMap = {
                'fox': '🦊', 'Fox': '🦊',
                'turtle': '🐢', 'Turtle': '🐢',
                'dog': '🐶', 'Dog': '🐶',
                'cat': '🐱', 'Cat': '🐱',
                'owl': '🦉', 'Owl': '🦉',
                'squirrel': '🐿️', 'Squirrel': '🐿️',
                'shark': '🦈', 'Shark': '🦈',
                'mouse': '🐭', 'Mouse': '🐭',
                'octopus': '🐙', 'Octopus': '🐙',
                'dove': '🕊️', 'Dove': '🕊️',
                'eagle': '🦅', 'Eagle': '🦅',
                'wolf': '🐺', 'Wolf': '🐺',
                'elephant': '🐘', 'Elephant': '🐘',
                'hippo': '🦛', 'Hippo': '🦛',
                'gorilla': '🦍', 'Gorilla': '🦍',
                'otter': '🦦', 'Otter': '🦦',
                'deer': '🦌', 'Deer': '🦌'
            };
            return emojiMap[animalName] || '🦁';
        },
        getAwakenedAnimalName() {
            if (!this.firstAnimalResult)
                return '未知靈魂';
            const animalName = this.firstAnimalResult.finalAnimal || this.firstAnimalResult.animalName || this.firstAnimalResult.animalId;
            const animalMeta = {
                'fox': '幽影偵探狐',
                'eagle': '天空監察鷹',
                'owl': '暗夜智者貓頭鷹',
                'shark': '深海獵殺者',
                'squirrel': '閃電警戒松鼠',
                'octopus': '變幻策略章魚',
                'cat': '月影忍者貓',
                'wolf': '荒野守護狼王',
                'turtle': '堡壘守護龜',
                'elephant': '古老記憶象',
                'hippo': '溫柔巨獸河馬',
                'gorilla': '鋼鐵金剛猩',
                'mouse': '好奇探險鼠',
                'otter': '社交明星水獺',
                'deer': '森林精靈鹿',
                'dog': '忠誠護衛犬',
                'Fox': '幽影偵探狐',
                'Eagle': '天空監察鷹',
                'Owl': '暗夜智者貓頭鷹',
                'Shark': '深海獵殺者',
                'Squirrel': '閃電警戒松鼠',
                'Octopus': '變幻策略章魚',
                'Cat': '月影忍者貓',
                'Wolf': '荒野守護狼王',
                'Turtle': '堡壘守護龜',
                'Elephant': '古老記憶象',
                'Hippo': '溫柔巨獸河馬',
                'Gorilla': '鋼鐵金剛猩',
                'Mouse': '好奇探險鼠',
                'Otter': '社交明星水獺',
                'Deer': '森林精靈鹿',
                'Dog': '忠誠護衛犬'
            };
            return animalMeta[animalName] || animalName || '神秘靈魂動物';
        },
        getSoulScores() {
            try {
                // 直接從 localStorage 讀取最新的心理分數
                const psychologyScoresData = localStorage.getItem('soul_psychologyScores');
                const techLevelData = localStorage.getItem('soul_techLevel');
                if (psychologyScoresData && techLevelData) {
                    const psychologyScores = JSON.parse(psychologyScoresData);
                    const techLevel = JSON.parse(techLevelData);
                    return {
                        authority: psychologyScores.value?.authority || 0,
                        timing: psychologyScores.value?.timing || 0,
                        style: psychologyScores.value?.style || 0,
                        motivation: psychologyScores.value?.motivation || 0,
                        tech: techLevel.value || 0
                    };
                }
                // 如果沒有數據，返回預設值
                return {
                    authority: 0,
                    timing: 0,
                    style: 0,
                    motivation: 0,
                    tech: 0
                };
            }
            catch (error) {
                console.error('讀取累積分數時發生錯誤:', error);
                return {
                    authority: 0,
                    timing: 0,
                    style: 0,
                    motivation: 0,
                    tech: 0
                };
            }
        },
        // 移除心理評分系統 - 改為使用Quiz.vue完成後給予+100經驗值
        async getQuestionPsychologyImpact(questionId, isCorrect) {
            // 返回預設影響值（保持原有的介面）
            const defaultImpact = {
                authority: isCorrect ? -2 : 3, // 答對增強懷疑，答錯增強信任
                timing: isCorrect ? -1 : 2, // 答對增強審慎，答錯增強衝動
                style: isCorrect ? 1 : -1, // 答對增強細節關注，答錯偏向直覺
                motivation: isCorrect ? 2 : -2, // 答對增強風險意識，答錯偏向獎勵追求
                tech: isCorrect ? 1 : -1 // 答對提升科技素養，答錯降低
            };
            return defaultImpact;
        },
        // 計算本回合的分數變化
        async calculateRoundScoreChanges() {
            console.log('🎯 計算本回合分數變化');
            if (!this.wrongAnswers || this.wrongAnswers.length === 0) {
                // 沒有錯題，只計算答對的影響
                const perfectRoundImpact = {
                    authority: -20, // 10題全對 × -2
                    timing: -10, // 10題全對 × -1  
                    style: 10, // 10題全對 × 1
                    motivation: 20, // 10題全對 × 2
                    tech: 10 // 10題全對 × 1
                };
                console.log('🏆 完美通關，本回合影響:', perfectRoundImpact);
                this.roundScoreChanges = perfectRoundImpact;
                return perfectRoundImpact;
            }
            let roundImpact = {
                authority: 0,
                timing: 0,
                style: 0,
                motivation: 0,
                tech: 0
            };
            // 計算錯題的影響
            for (const wrongAnswer of this.wrongAnswers) {
                const impact = await this.getQuestionPsychologyImpact(wrongAnswer.id, false);
                roundImpact.authority += impact.authority;
                roundImpact.timing += impact.timing;
                roundImpact.style += impact.style;
                roundImpact.motivation += impact.motivation;
                roundImpact.tech += impact.tech;
            }
            // 計算答對題目的影響
            const correctCount = 10 - this.wrongAnswers.length;
            const defaultCorrectImpact = {
                authority: -2, timing: -1, style: 1, motivation: 2, tech: 1
            };
            roundImpact.authority += correctCount * defaultCorrectImpact.authority;
            roundImpact.timing += correctCount * defaultCorrectImpact.timing;
            roundImpact.style += correctCount * defaultCorrectImpact.style;
            roundImpact.motivation += correctCount * defaultCorrectImpact.motivation;
            roundImpact.tech += correctCount * defaultCorrectImpact.tech;
            console.log(`📊 本回合: ${this.wrongAnswers.length}錯 ${correctCount}對, 影響:`, roundImpact);
            this.roundScoreChanges = roundImpact;
            return roundImpact;
        },
        // 格式化分數變化顯示
        formatScoreChange(change) {
            if (change > 0)
                return `+${change}`;
            if (change < 0)
                return `${change}`;
            return `+0`;
        }
    },
    mounted() {
        console.log('=== GameResults mounted 開始 ===');
        soulAnimalStore.setCurrentUser(this.currentUser);
        this.loadWrongQuestions();
        this.loadLeaderboard();
        this.submitScoreToStore();
        this.$nextTick(() => {
            setTimeout(async () => {
                this.loadPlayerProgress();
                // 計算本回合分數變化
                await this.calculateRoundScoreChanges();
                // 移除心理學分數計算 - 改為使用Quiz.vue完成後給予+100經驗值
                console.log('🔄 已移除心理評分系統，改用Quiz測驗結果');
            }, 100);
        });
        console.log('=== GameResults mounted 完成 ===');
    },
    watch: {
        wrongIds: {
            handler() {
                this.loadWrongQuestions();
            },
            immediate: true
        }
    }
});
const __VLS_self = (await import('vue')).defineComponent({
    name: "GameResults",
    props: {
        round: Number,
        score: Number,
        wrongIds: {
            type: Array,
            default: () => []
        },
        currentUser: {
            type: String,
            required: true
        },
        evolutionData: {
            type: Object,
            default: () => ({
                hasEvolved: false,
                xpGained: 0,
                totalXP: 0,
                techLevel: 1
            })
        }
    },
    emits: ["restart"],
    computed: {
        soulStore() {
            // 返回已import的soulAnimalStore實例
            return soulAnimalStore;
        },
        nextStageXP() {
            const currentStage = this.soulStore?.currentStage;
            if (currentStage === EVOLUTION_STAGES.EVOLUTION) {
                return 'MAX';
            }
            return (currentStage?.maxXP || 0) + 1;
        }
    },
    data() {
        return {
            leaderboard: [],
            wrongAnswers: [],
            scoreSubmitted: false,
            totalUserScore: 0,
            playerGameCount: 0,
            firstAnimalResult: null,
            calculatedScores: null, // 儲存計算後的心理學分數
            roundScoreChanges: null // 儲存本回合的分數變化
        };
    },
    methods: {
        closeEvolution() {
            this.$emit('close-evolution');
        },
        async submitScoreToStore() {
            console.log('GameResults: submitScoreToStore 開始執行');
            console.log('GameResults: currentUser:', this.currentUser);
            console.log('GameResults: score:', this.score);
            if (this.currentUser && this.score >= 0) {
                try {
                    console.log('GameResults: 正在提交分數到 soulAnimalStore');
                    this.totalUserScore = soulAnimalStore.addGameScore(this.currentUser, this.score);
                    this.scoreSubmitted = true;
                    const gameData = {
                        round: this.round,
                        score: this.score,
                        wrongAnswers: this.wrongAnswers,
                        mode: 'normal'
                    };
                    console.log('GameResults: 遊戲數據準備保存:', gameData);
                    if (soulAnimalStore.saveGameRecord) {
                        soulAnimalStore.saveGameRecord(this.currentUser, gameData);
                    }
                    this.loadLeaderboard();
                    console.log('GameResults: 分數提交完成，總分:', this.totalUserScore);
                }
                catch (error) {
                    console.error('提交分數時發生錯誤:', error);
                    this.scoreSubmitted = false;
                }
            }
            else {
                console.warn('GameResults: 無效的用戶或分數，跳過分數提交');
            }
        },
        loadLeaderboard() {
            console.log('GameResults: loadLeaderboard 被調用');
            this.leaderboard = soulAnimalStore.getLeaderboard();
            console.log('GameResults: 載入的排行榜數據:', this.leaderboard);
        },
        loadWrongQuestions() {
            console.log('GameResults: loadWrongQuestions 被調用，wrongIds:', this.wrongIds);
            const wrongIdStrs = this.wrongIds.map(id => String(id));
            console.log('GameResults: 轉換後的wrongIdStrs:', wrongIdStrs);
            const realArray = Array.isArray(realMessages) ? realMessages : [];
            this.wrongAnswers = realArray.filter((msg) => wrongIdStrs.includes(String(msg.id)));
            console.log('GameResults: 找到的錯誤訊息（真實訊息）:', this.wrongAnswers);
        },
        loadPlayerProgress() {
            if (!this.currentUser)
                return;
            const gameRecords = soulAnimalStore.getUserGameRecords(this.currentUser);
            this.playerGameCount = gameRecords.length;
            console.log(`玩家 ${this.currentUser} 已完成 ${this.playerGameCount} 次遊戲`);
            const userRecords = soulAnimalStore.getUserRecords(this.currentUser);
            if (userRecords && userRecords.length > 0) {
                this.firstAnimalResult = userRecords[userRecords.length - 1].animalResult;
                console.log('玩家第一次心理測驗結果:', this.firstAnimalResult);
            }
            else {
                this.firstAnimalResult = null;
                console.log('未找到玩家的心理測驗記錄');
            }
        },
        getAwakenedAnimalEmoji() {
            if (!this.firstAnimalResult)
                return '🥚';
            const animalName = this.firstAnimalResult.finalAnimal || this.firstAnimalResult.animalName || this.firstAnimalResult.animalId;
            const emojiMap = {
                'fox': '🦊', 'Fox': '🦊',
                'turtle': '🐢', 'Turtle': '🐢',
                'dog': '🐶', 'Dog': '🐶',
                'cat': '🐱', 'Cat': '🐱',
                'owl': '🦉', 'Owl': '🦉',
                'squirrel': '🐿️', 'Squirrel': '🐿️',
                'shark': '🦈', 'Shark': '🦈',
                'mouse': '🐭', 'Mouse': '🐭',
                'octopus': '🐙', 'Octopus': '🐙',
                'dove': '🕊️', 'Dove': '🕊️',
                'eagle': '🦅', 'Eagle': '🦅',
                'wolf': '🐺', 'Wolf': '🐺',
                'elephant': '🐘', 'Elephant': '🐘',
                'hippo': '🦛', 'Hippo': '🦛',
                'gorilla': '🦍', 'Gorilla': '🦍',
                'otter': '🦦', 'Otter': '🦦',
                'deer': '🦌', 'Deer': '🦌'
            };
            return emojiMap[animalName] || '🦁';
        },
        getAwakenedAnimalName() {
            if (!this.firstAnimalResult)
                return '未知靈魂';
            const animalName = this.firstAnimalResult.finalAnimal || this.firstAnimalResult.animalName || this.firstAnimalResult.animalId;
            const animalMeta = {
                'fox': '幽影偵探狐',
                'eagle': '天空監察鷹',
                'owl': '暗夜智者貓頭鷹',
                'shark': '深海獵殺者',
                'squirrel': '閃電警戒松鼠',
                'octopus': '變幻策略章魚',
                'cat': '月影忍者貓',
                'wolf': '荒野守護狼王',
                'turtle': '堡壘守護龜',
                'elephant': '古老記憶象',
                'hippo': '溫柔巨獸河馬',
                'gorilla': '鋼鐵金剛猩',
                'mouse': '好奇探險鼠',
                'otter': '社交明星水獺',
                'deer': '森林精靈鹿',
                'dog': '忠誠護衛犬',
                'Fox': '幽影偵探狐',
                'Eagle': '天空監察鷹',
                'Owl': '暗夜智者貓頭鷹',
                'Shark': '深海獵殺者',
                'Squirrel': '閃電警戒松鼠',
                'Octopus': '變幻策略章魚',
                'Cat': '月影忍者貓',
                'Wolf': '荒野守護狼王',
                'Turtle': '堡壘守護龜',
                'Elephant': '古老記憶象',
                'Hippo': '溫柔巨獸河馬',
                'Gorilla': '鋼鐵金剛猩',
                'Mouse': '好奇探險鼠',
                'Otter': '社交明星水獺',
                'Deer': '森林精靈鹿',
                'Dog': '忠誠護衛犬'
            };
            return animalMeta[animalName] || animalName || '神秘靈魂動物';
        },
        getSoulScores() {
            try {
                // 直接從 localStorage 讀取最新的心理分數
                const psychologyScoresData = localStorage.getItem('soul_psychologyScores');
                const techLevelData = localStorage.getItem('soul_techLevel');
                if (psychologyScoresData && techLevelData) {
                    const psychologyScores = JSON.parse(psychologyScoresData);
                    const techLevel = JSON.parse(techLevelData);
                    return {
                        authority: psychologyScores.value?.authority || 0,
                        timing: psychologyScores.value?.timing || 0,
                        style: psychologyScores.value?.style || 0,
                        motivation: psychologyScores.value?.motivation || 0,
                        tech: techLevel.value || 0
                    };
                }
                // 如果沒有數據，返回預設值
                return {
                    authority: 0,
                    timing: 0,
                    style: 0,
                    motivation: 0,
                    tech: 0
                };
            }
            catch (error) {
                console.error('讀取累積分數時發生錯誤:', error);
                return {
                    authority: 0,
                    timing: 0,
                    style: 0,
                    motivation: 0,
                    tech: 0
                };
            }
        },
        // 移除心理評分系統 - 改為使用Quiz.vue完成後給予+100經驗值
        async getQuestionPsychologyImpact(questionId, isCorrect) {
            // 返回預設影響值（保持原有的介面）
            const defaultImpact = {
                authority: isCorrect ? -2 : 3, // 答對增強懷疑，答錯增強信任
                timing: isCorrect ? -1 : 2, // 答對增強審慎，答錯增強衝動
                style: isCorrect ? 1 : -1, // 答對增強細節關注，答錯偏向直覺
                motivation: isCorrect ? 2 : -2, // 答對增強風險意識，答錯偏向獎勵追求
                tech: isCorrect ? 1 : -1 // 答對提升科技素養，答錯降低
            };
            return defaultImpact;
        },
        // 計算本回合的分數變化
        async calculateRoundScoreChanges() {
            console.log('🎯 計算本回合分數變化');
            if (!this.wrongAnswers || this.wrongAnswers.length === 0) {
                // 沒有錯題，只計算答對的影響
                const perfectRoundImpact = {
                    authority: -20, // 10題全對 × -2
                    timing: -10, // 10題全對 × -1  
                    style: 10, // 10題全對 × 1
                    motivation: 20, // 10題全對 × 2
                    tech: 10 // 10題全對 × 1
                };
                console.log('🏆 完美通關，本回合影響:', perfectRoundImpact);
                this.roundScoreChanges = perfectRoundImpact;
                return perfectRoundImpact;
            }
            let roundImpact = {
                authority: 0,
                timing: 0,
                style: 0,
                motivation: 0,
                tech: 0
            };
            // 計算錯題的影響
            for (const wrongAnswer of this.wrongAnswers) {
                const impact = await this.getQuestionPsychologyImpact(wrongAnswer.id, false);
                roundImpact.authority += impact.authority;
                roundImpact.timing += impact.timing;
                roundImpact.style += impact.style;
                roundImpact.motivation += impact.motivation;
                roundImpact.tech += impact.tech;
            }
            // 計算答對題目的影響
            const correctCount = 10 - this.wrongAnswers.length;
            const defaultCorrectImpact = {
                authority: -2, timing: -1, style: 1, motivation: 2, tech: 1
            };
            roundImpact.authority += correctCount * defaultCorrectImpact.authority;
            roundImpact.timing += correctCount * defaultCorrectImpact.timing;
            roundImpact.style += correctCount * defaultCorrectImpact.style;
            roundImpact.motivation += correctCount * defaultCorrectImpact.motivation;
            roundImpact.tech += correctCount * defaultCorrectImpact.tech;
            console.log(`📊 本回合: ${this.wrongAnswers.length}錯 ${correctCount}對, 影響:`, roundImpact);
            this.roundScoreChanges = roundImpact;
            return roundImpact;
        },
        // 格式化分數變化顯示
        formatScoreChange(change) {
            if (change > 0)
                return `+${change}`;
            if (change < 0)
                return `${change}`;
            return `+0`;
        }
    },
    mounted() {
        console.log('=== GameResults mounted 開始 ===');
        soulAnimalStore.setCurrentUser(this.currentUser);
        this.loadWrongQuestions();
        this.loadLeaderboard();
        this.submitScoreToStore();
        this.$nextTick(() => {
            setTimeout(async () => {
                this.loadPlayerProgress();
                // 計算本回合分數變化
                await this.calculateRoundScoreChanges();
                // 移除心理學分數計算 - 改為使用Quiz.vue完成後給予+100經驗值
                console.log('🔄 已移除心理評分系統，改用Quiz測驗結果');
            }, 100);
        });
        console.log('=== GameResults mounted 完成 ===');
    },
    watch: {
        wrongIds: {
            handler() {
                this.loadWrongQuestions();
            },
            immediate: true
        }
    }
});
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['score-display']} */ ;
/** @type {__VLS_StyleScopedClasses['restart']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-from']} */ ;
/** @type {__VLS_StyleScopedClasses['awakening-analysis']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-scores-simple']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-scores-detailed']} */ ;
/** @type {__VLS_StyleScopedClasses['round-change']} */ ;
/** @type {__VLS_StyleScopedClasses['round-change']} */ ;
/** @type {__VLS_StyleScopedClasses['score-item']} */ ;
/** @type {__VLS_StyleScopedClasses['axes-analysis']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-status']} */ ;
/** @type {__VLS_StyleScopedClasses['wrong-section']} */ ;
/** @type {__VLS_StyleScopedClasses['leaderboard']} */ ;
/** @type {__VLS_StyleScopedClasses['leaderboard']} */ ;
/** @type {__VLS_StyleScopedClasses['results']} */ ;
/** @type {__VLS_StyleScopedClasses['evolution-stages']} */ ;
/** @type {__VLS_StyleScopedClasses['evolution-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['current-animal']} */ ;
/** @type {__VLS_StyleScopedClasses['animal-info']} */ ;
/** @type {__VLS_StyleScopedClasses['axes-grid']} */ ;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "results" },
});
if (__VLS_ctx.evolutionData?.hasEvolved) {
    // @ts-ignore
    [evolutionData,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (__VLS_ctx.closeEvolution) },
        ...{ class: "evolution-overlay" },
    });
    // @ts-ignore
    [closeEvolution,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: () => { } },
        ...{ class: "evolution-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: "evolution-title" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "evolution-stages" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stage-from" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "stage-label" },
    });
    (__VLS_ctx.evolutionData?.previousStage?.name || '未知');
    // @ts-ignore
    [evolutionData,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stage-desc" },
    });
    (__VLS_ctx.evolutionData?.previousStage?.description || '前階段描述');
    // @ts-ignore
    [evolutionData,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "evolution-arrow" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stage-to" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "stage-label" },
    });
    (__VLS_ctx.evolutionData?.newStage?.name || '未知');
    // @ts-ignore
    [evolutionData,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stage-desc" },
    });
    (__VLS_ctx.evolutionData?.newStage?.description || '新階段描述');
    // @ts-ignore
    [evolutionData,];
    if (__VLS_ctx.evolutionData?.currentAnimal) {
        // @ts-ignore
        [evolutionData,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "animal-reveal" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "animal-name" },
        });
        (__VLS_ctx.evolutionData?.currentAnimal?.animal || '未知動物');
        // @ts-ignore
        [evolutionData,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "animal-group" },
        });
        (__VLS_ctx.evolutionData?.currentAnimal?.group || '未知組別');
        // @ts-ignore
        [evolutionData,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "animal-traits" },
        });
        for (const [trait] of __VLS_getVForSourceType(((__VLS_ctx.evolutionData?.currentAnimal?.traits || [])))) {
            // @ts-ignore
            [evolutionData,];
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                key: (trait),
                ...{ class: "trait-tag" },
            });
            (trait);
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "evolution-stats" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
    (__VLS_ctx.evolutionData?.xpGained || 0);
    // @ts-ignore
    [evolutionData,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
    (__VLS_ctx.evolutionData?.totalXP || 0);
    // @ts-ignore
    [evolutionData,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
    (__VLS_ctx.evolutionData?.techLevel || 1);
    // @ts-ignore
    [evolutionData,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.closeEvolution) },
        ...{ class: "close-evolution" },
    });
    // @ts-ignore
    [closeEvolution,];
}
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "mission" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "soul-status" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "soul-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
if (__VLS_ctx.firstAnimalResult) {
    // @ts-ignore
    [firstAnimalResult,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "soul-scores-detailed" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
    if (__VLS_ctx.roundScoreChanges) {
        // @ts-ignore
        [roundScoreChanges,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "round-changes" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "round-change-item" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "dimension-name" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "round-change" },
            ...{ class: ({ 'positive': __VLS_ctx.roundScoreChanges.authority > 0, 'negative': __VLS_ctx.roundScoreChanges.authority < 0 }) },
        });
        // @ts-ignore
        [roundScoreChanges, roundScoreChanges,];
        (__VLS_ctx.formatScoreChange(__VLS_ctx.roundScoreChanges.authority));
        // @ts-ignore
        [roundScoreChanges, formatScoreChange,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "round-change-item" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "dimension-name" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "round-change" },
            ...{ class: ({ 'positive': __VLS_ctx.roundScoreChanges.timing > 0, 'negative': __VLS_ctx.roundScoreChanges.timing < 0 }) },
        });
        // @ts-ignore
        [roundScoreChanges, roundScoreChanges,];
        (__VLS_ctx.formatScoreChange(__VLS_ctx.roundScoreChanges.timing));
        // @ts-ignore
        [roundScoreChanges, formatScoreChange,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "round-change-item" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "dimension-name" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "round-change" },
            ...{ class: ({ 'positive': __VLS_ctx.roundScoreChanges.style > 0, 'negative': __VLS_ctx.roundScoreChanges.style < 0 }) },
        });
        // @ts-ignore
        [roundScoreChanges, roundScoreChanges,];
        (__VLS_ctx.formatScoreChange(__VLS_ctx.roundScoreChanges.style));
        // @ts-ignore
        [roundScoreChanges, formatScoreChange,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "round-change-item" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "dimension-name" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "round-change" },
            ...{ class: ({ 'positive': __VLS_ctx.roundScoreChanges.motivation > 0, 'negative': __VLS_ctx.roundScoreChanges.motivation < 0 }) },
        });
        // @ts-ignore
        [roundScoreChanges, roundScoreChanges,];
        (__VLS_ctx.formatScoreChange(__VLS_ctx.roundScoreChanges.motivation));
        // @ts-ignore
        [roundScoreChanges, formatScoreChange,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "round-change-item" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "dimension-name" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "round-change" },
            ...{ class: ({ 'positive': __VLS_ctx.roundScoreChanges.tech > 0, 'negative': __VLS_ctx.roundScoreChanges.tech < 0 }) },
        });
        // @ts-ignore
        [roundScoreChanges, roundScoreChanges,];
        (__VLS_ctx.formatScoreChange(__VLS_ctx.roundScoreChanges.tech));
        // @ts-ignore
        [roundScoreChanges, formatScoreChange,];
    }
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "scores-list" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "score-item total" },
    });
    (__VLS_ctx.getSoulScores().authority);
    // @ts-ignore
    [getSoulScores,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "score-item total" },
    });
    (__VLS_ctx.getSoulScores().timing);
    // @ts-ignore
    [getSoulScores,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "score-item total" },
    });
    (__VLS_ctx.getSoulScores().style);
    // @ts-ignore
    [getSoulScores,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "score-item total" },
    });
    (__VLS_ctx.getSoulScores().motivation);
    // @ts-ignore
    [getSoulScores,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "score-item total" },
    });
    (__VLS_ctx.getSoulScores().tech);
    // @ts-ignore
    [getSoulScores,];
}
if (__VLS_ctx.playerGameCount >= 5 && __VLS_ctx.firstAnimalResult) {
    // @ts-ignore
    [firstAnimalResult, playerGameCount,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "soul-hint" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "current-animal" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "animal-emoji" },
    });
    (__VLS_ctx.getAwakenedAnimalEmoji());
    // @ts-ignore
    [getAwakenedAnimalEmoji,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "animal-info" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "animal-name" },
    });
    (__VLS_ctx.getAwakenedAnimalName());
    // @ts-ignore
    [getAwakenedAnimalName,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "animal-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "animal-traits" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "trait-badge" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "trait-badge" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "awakening-analysis" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "awakening-text" },
    });
    if (__VLS_ctx.evolutionData?.hasEvolved && __VLS_ctx.evolutionData?.previousAnimal && __VLS_ctx.evolutionData?.currentAnimal) {
        // @ts-ignore
        [evolutionData, evolutionData, evolutionData,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (__VLS_ctx.playerGameCount);
        (__VLS_ctx.evolutionData.previousAnimal);
        (__VLS_ctx.evolutionData.currentAnimal);
        // @ts-ignore
        [evolutionData, evolutionData, playerGameCount,];
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (__VLS_ctx.playerGameCount);
        (__VLS_ctx.getAwakenedAnimalName());
        // @ts-ignore
        [playerGameCount, getAwakenedAnimalName,];
    }
    (__VLS_ctx.playerGameCount);
    // @ts-ignore
    [playerGameCount,];
}
if (__VLS_ctx.playerGameCount < 5) {
    // @ts-ignore
    [playerGameCount,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "soul-hint" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "progress-hint" },
    });
    (__VLS_ctx.playerGameCount);
    // @ts-ignore
    [playerGameCount,];
    if (!__VLS_ctx.firstAnimalResult) {
        // @ts-ignore
        [firstAnimalResult,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "quiz-reminder" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "reminder-text" },
        });
    }
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "user-score-info" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "current-user" },
});
(__VLS_ctx.currentUser);
// @ts-ignore
[currentUser,];
if (__VLS_ctx.scoreSubmitted) {
    // @ts-ignore
    [scoreSubmitted,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "submit-status success" },
    });
    (__VLS_ctx.totalUserScore);
    // @ts-ignore
    [totalUserScore,];
}
else {
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "submit-status" },
    });
}
if (__VLS_ctx.wrongAnswers.length) {
    // @ts-ignore
    [wrongAnswers,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "wrong-section" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.wrongAnswers))) {
        // @ts-ignore
        [wrongAnswers,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (item.id),
            ...{ class: "wrong-item" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "question-title" },
        });
        (index + 1);
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "question-content" },
        });
        (item.content);
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "question-explanation" },
        });
        (item.explanation);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "perfect-text" },
    });
}
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.ol, __VLS_elements.ol)({
    ...{ class: "leaderboard" },
});
for (const [entry, index] of __VLS_getVForSourceType((__VLS_ctx.leaderboard))) {
    // @ts-ignore
    [leaderboard,];
    __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({
        key: (index),
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "rank" },
    });
    (index + 1);
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "name" },
    });
    (entry.name);
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "score" },
    });
    (entry.score);
}
if (__VLS_ctx.leaderboard.length === 0) {
    // @ts-ignore
    [leaderboard,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "empty-leaderboard" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
}
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('restart');
            // @ts-ignore
            [$emit,];
        } },
    ...{ class: "restart" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "hacker-grid" },
});
/** @type {__VLS_StyleScopedClasses['results']} */ ;
/** @type {__VLS_StyleScopedClasses['evolution-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['evolution-content']} */ ;
/** @type {__VLS_StyleScopedClasses['evolution-title']} */ ;
/** @type {__VLS_StyleScopedClasses['evolution-stages']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-from']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['evolution-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-to']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['animal-reveal']} */ ;
/** @type {__VLS_StyleScopedClasses['animal-name']} */ ;
/** @type {__VLS_StyleScopedClasses['animal-group']} */ ;
/** @type {__VLS_StyleScopedClasses['animal-traits']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['evolution-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['close-evolution']} */ ;
/** @type {__VLS_StyleScopedClasses['mission']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-status']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-info']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-scores-detailed']} */ ;
/** @type {__VLS_StyleScopedClasses['round-changes']} */ ;
/** @type {__VLS_StyleScopedClasses['round-change-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-name']} */ ;
/** @type {__VLS_StyleScopedClasses['round-change']} */ ;
/** @type {__VLS_StyleScopedClasses['positive']} */ ;
/** @type {__VLS_StyleScopedClasses['negative']} */ ;
/** @type {__VLS_StyleScopedClasses['round-change-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-name']} */ ;
/** @type {__VLS_StyleScopedClasses['round-change']} */ ;
/** @type {__VLS_StyleScopedClasses['positive']} */ ;
/** @type {__VLS_StyleScopedClasses['negative']} */ ;
/** @type {__VLS_StyleScopedClasses['round-change-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-name']} */ ;
/** @type {__VLS_StyleScopedClasses['round-change']} */ ;
/** @type {__VLS_StyleScopedClasses['positive']} */ ;
/** @type {__VLS_StyleScopedClasses['negative']} */ ;
/** @type {__VLS_StyleScopedClasses['round-change-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-name']} */ ;
/** @type {__VLS_StyleScopedClasses['round-change']} */ ;
/** @type {__VLS_StyleScopedClasses['positive']} */ ;
/** @type {__VLS_StyleScopedClasses['negative']} */ ;
/** @type {__VLS_StyleScopedClasses['round-change-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-name']} */ ;
/** @type {__VLS_StyleScopedClasses['round-change']} */ ;
/** @type {__VLS_StyleScopedClasses['positive']} */ ;
/** @type {__VLS_StyleScopedClasses['negative']} */ ;
/** @type {__VLS_StyleScopedClasses['scores-list']} */ ;
/** @type {__VLS_StyleScopedClasses['score-item']} */ ;
/** @type {__VLS_StyleScopedClasses['total']} */ ;
/** @type {__VLS_StyleScopedClasses['score-item']} */ ;
/** @type {__VLS_StyleScopedClasses['total']} */ ;
/** @type {__VLS_StyleScopedClasses['score-item']} */ ;
/** @type {__VLS_StyleScopedClasses['total']} */ ;
/** @type {__VLS_StyleScopedClasses['score-item']} */ ;
/** @type {__VLS_StyleScopedClasses['total']} */ ;
/** @type {__VLS_StyleScopedClasses['score-item']} */ ;
/** @type {__VLS_StyleScopedClasses['total']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['current-animal']} */ ;
/** @type {__VLS_StyleScopedClasses['animal-emoji']} */ ;
/** @type {__VLS_StyleScopedClasses['animal-info']} */ ;
/** @type {__VLS_StyleScopedClasses['animal-name']} */ ;
/** @type {__VLS_StyleScopedClasses['animal-group']} */ ;
/** @type {__VLS_StyleScopedClasses['animal-traits']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['awakening-analysis']} */ ;
/** @type {__VLS_StyleScopedClasses['awakening-text']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['quiz-reminder']} */ ;
/** @type {__VLS_StyleScopedClasses['reminder-text']} */ ;
/** @type {__VLS_StyleScopedClasses['user-score-info']} */ ;
/** @type {__VLS_StyleScopedClasses['current-user']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-status']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-status']} */ ;
/** @type {__VLS_StyleScopedClasses['wrong-section']} */ ;
/** @type {__VLS_StyleScopedClasses['wrong-item']} */ ;
/** @type {__VLS_StyleScopedClasses['question-title']} */ ;
/** @type {__VLS_StyleScopedClasses['question-content']} */ ;
/** @type {__VLS_StyleScopedClasses['question-explanation']} */ ;
/** @type {__VLS_StyleScopedClasses['perfect-text']} */ ;
/** @type {__VLS_StyleScopedClasses['leaderboard']} */ ;
/** @type {__VLS_StyleScopedClasses['rank']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['score']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-leaderboard']} */ ;
/** @type {__VLS_StyleScopedClasses['restart']} */ ;
/** @type {__VLS_StyleScopedClasses['hacker-grid']} */ ;
export default {};
//# sourceMappingURL=GameResults.vue.js.map