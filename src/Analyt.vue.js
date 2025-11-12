import { ref, onMounted, watch, computed } from 'vue';
import logoM from './assets/svg/Logo_M.svg';
import soulAnimalStore from './soulAnimalStore.js';
import { useSoulAnimalStore } from './stores/soulAnimalSystem.js';
import { SmartAnimalRangeSystem } from './SmartAnimalRangeSystem.js';
// 宣告元件會發出的事件：close
const emit = defineEmits(['close']);
const activeTab = ref('overview');
// 接收用戶資訊 props
const props = defineProps({
    currentUser: {
        type: String,
        default: 'white' // 預設用戶
    }
});
// 初始化靈魂動物系統
const soulSystem = useSoulAnimalStore();
// 初始化智能動物範圍系統
const smartRangeSystem = new SmartAnimalRangeSystem();
// Logo sizing defaults (no tuner): tweak these variables to change default appearance
const logoBaseSize = ref(84); // px
const logoWidthVal = ref(0); // 0 => auto
// NOTE: default scale set in CSS variables below; change in stylesheet if you want different default
// no dev-tuner functions needed
const tabs = [
    { id: 'overview', label: '總覽' },
    { id: 'missions', label: '任務' },
    { id: 'leaderboard', label: '排行榜' },
    { id: 'soulanimals', label: '靈魂動物' },
    { id: 'soultransform', label: '靈魂轉換' },
    { id: 'analysis', label: 'AI 分析' }
];
// 靈魂動物測驗記錄 - 從store獲取
const soulAnimalHistory = ref([]);
// 移除心理評分系統相關變數 - 改為使用Quiz.vue完成後給予+100經驗值
// 根據用戶記錄計算的統計數據
const userStats = computed(() => {
    try {
        const records = soulAnimalHistory.value;
        const gameRecords = soulAnimalStore.getUserGameRecords ?
            soulAnimalStore.getUserGameRecords(props.currentUser) :
            soulAnimalStore.getUserGameErrors(props.currentUser); // 向後兼容
        if (!records || records.length === 0) {
            return {
                totalTests: gameRecords.length || 0, // 只計算詐騙遊戲測驗次數
                averageAwareness: 0,
                globalRank: 'N/A',
                aiConfidence: 0,
                totalExperience: 0,
                soulAnimalTests: 0,
                gameTests: gameRecords.length || 0
            };
        }
        const soulAnimalTests = records.length;
        const gameTests = gameRecords.length;
        const totalTests = gameTests; // 測驗次數只計算詐騙遊戲次數，不包括靈魂性格測驗
        const totalAwareness = records.reduce((sum, record) => sum + (record.animalResult.awareness || 0), 0);
        const averageAwareness = soulAnimalTests > 0 ? Math.round(totalAwareness / soulAnimalTests) : 0;
        const totalExperience = soulSystem.soulXP.value || 0; // 使用真實的靈魂XP
        return {
            totalTests,
            averageAwareness,
            globalRank: totalTests > 0 ? `#${Math.max(1, 150 - totalTests * 5)}` : 'N/A',
            aiConfidence: Math.min(95, 50 + totalTests * 3), // 基於總測驗次數計算信心度
            totalExperience,
            soulAnimalTests,
            gameTests
        };
    }
    catch (error) {
        console.error('userStats計算錯誤:', error);
        return {
            totalTests: 0,
            averageAwareness: 0,
            globalRank: 'N/A',
            aiConfidence: 0,
            totalExperience: 0,
            soulAnimalTests: 0,
            gameTests: 0
        };
    }
});
// 根據經驗值計算用戶等級
const userLevel = computed(() => {
    const experience = userStats.value.totalExperience;
    if (experience === 0)
        return 1; // 初始等級為1
    return Math.floor(experience / 500) + 1; // 每500經驗值升一級
});
// 根據用戶記錄計算詐騙類型數據（基於實際遊戲記錄）
const fraudTypeData = computed(() => {
    const gameRecords = soulAnimalStore.getUserGameRecords ?
        soulAnimalStore.getUserGameRecords(props.currentUser) :
        soulAnimalStore.getUserGameErrors(props.currentUser); // 向後兼容
    // 初始化十大詐騙類型統計
    const tenMainFraudTypes = {
        '假冒金融機構': { total: 0, correct: 0, wrong: 0 },
        '假冒政府機構': { total: 0, correct: 0, wrong: 0 },
        '假冒電商平台': { total: 0, correct: 0, wrong: 0 },
        '假冒貸款服務': { total: 0, correct: 0, wrong: 0 },
        '假冒獎勳或優惠': { total: 0, correct: 0, wrong: 0 },
        '假冒交友或戀愛關係': { total: 0, correct: 0, wrong: 0 },
        '假冒親友或家人': { total: 0, correct: 0, wrong: 0 },
        '假冒中獎或抽獎': { total: 0, correct: 0, wrong: 0 },
        '假冒金融商品或投資機會': { total: 0, correct: 0, wrong: 0 },
        '假冒公務機關或法務機構': { total: 0, correct: 0, wrong: 0 }
    };
    if (!gameRecords || gameRecords.length === 0) {
        // 如果沒有遊戲記錄，返回初始狀態的十大類型
        return Object.entries(tenMainFraudTypes).map(([type, stats]) => ({
            type,
            accuracy: 0,
            total: 0,
            correct: 0,
            wrong: 0
        }));
    }
    // 統計每場遊戲的詐騙識別情況
    gameRecords.forEach(gameRecord => {
        const gameRounds = gameRecord.round || 5;
        // 每場遊戲每輪有1個詐騙訊息需要識別，總共有 gameRounds 個詐騙訊息
        // 假設各類型平均分布
        const scamPerType = gameRounds / Object.keys(tenMainFraudTypes).length;
        // 初始化各類型的出現次數
        Object.keys(tenMainFraudTypes).forEach(type => {
            tenMainFraudTypes[type].total += Math.round(scamPerType);
            tenMainFraudTypes[type].correct += Math.round(scamPerType); // 先假設全部答對
        });
        // 統計實際錯誤：用戶沒有選中詐騙訊息的情況
        if (gameRecord.wrongAnswers && gameRecord.wrongAnswers.length > 0) {
            gameRecord.wrongAnswers.forEach(wrongItem => {
                // wrongAnswers 記錄的是用戶誤選的真實訊息
                // 這意味著用戶沒有選中正確的詐騙訊息
                // 我們需要反推出這個錯誤對應的詐騙類型
                // 由於我們無法直接知道對應的詐騙訊息類型，
                // 暫時假設錯誤平均分布在各個詐騙類型中
                const errorTypes = Object.keys(tenMainFraudTypes);
                const randomTypeIndex = Math.floor(Math.random() * errorTypes.length);
                const affectedType = errorTypes[randomTypeIndex];
                if (tenMainFraudTypes[affectedType].correct > 0) {
                    tenMainFraudTypes[affectedType].correct--;
                    tenMainFraudTypes[affectedType].wrong++;
                }
            });
        }
    });
    // 轉換為顯示格式
    return Object.entries(tenMainFraudTypes).map(([type, stats]) => {
        const total = stats.total;
        const correct = Math.max(0, stats.correct);
        const wrong = stats.wrong;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        return {
            type,
            accuracy,
            total,
            correct,
            wrong
        };
    });
});
// 將數據庫類型映射到十大主要詐騙類型
const mapToMainFraudType = (originalType) => {
    const typeMapping = {
        // 金融機構相關
        '金融機構': '假冒金融機構',
        '假冒金融機構': '假冒金融機構',
        // 政府機構相關
        '政府機構': '假冒政府機構',
        '假冒政府機構': '假冒政府機構',
        // 電商平台相關
        '電商平台': '假冒電商平台',
        '電商／物流平台': '假冒電商平台',
        '假冒電商平台': '假冒電商平台',
        // 貸款服務相關
        '貸款服務': '假冒貸款服務',
        '假冒貸款服務': '假冒貸款服務',
        '假冒貸款／借款服務': '假冒貸款服務',
        // 獎勵優惠相關
        '獎勵優惠': '假冒獎勳或優惠',
        '假冒獎勳或優惠': '假冒獎勳或優惠',
        '假冒中獎／獎勵／優惠': '假冒獎勳或優惠',
        // 交友戀愛相關
        '假冒交友或戀愛關係': '假冒交友或戀愛關係',
        '社交詐騙': '假冒交友或戀愛關係',
        // 親友家人相關
        '假冒親友或家人': '假冒親友或家人',
        '親友詐騙': '假冒親友或家人',
        // 中獎抽獎相關
        '假冒中獎或抽獎': '假冒中獎或抽獎',
        '假冒中獎／獎勵／優惠': '假冒中獎或抽獎', // 注意：這個可能同時屬於獎勵優惠，但我們優先歸類為中獎抽獎
        // 投資機會相關
        '假冒金融商品或投資機會': '假冒金融商品或投資機會',
        '投資詐騙': '假冒金融商品或投資機會',
        // 法務機構相關
        '假冒公務機關或法務機構': '假冒公務機關或法務機構',
        '法務詐騙': '假冒公務機關或法務機構',
        '假冒教育機構': '假冒公務機關或法務機構'
    };
    return typeMapping[originalType] || '假冒金融機構'; // 默認歸類為金融機構
};
// 任務數據（基於用戶統計）
const missionData = computed(() => {
    const stats = userStats.value;
    if (stats.totalTests === 0) {
        return [
            { id: 1, type: '假冒金融機構', difficulty: '困難', reward: 250, completed: 0, total: 50, status: '尚未開始' },
            { id: 2, type: '假冒政府機構', difficulty: '困難', reward: 240, completed: 0, total: 45, status: '尚未開始' },
            { id: 3, type: '假冒電商平台', difficulty: '中等', reward: 200, completed: 0, total: 60, status: '尚未開始' },
            { id: 4, type: '假冒貸款服務', difficulty: '困難', reward: 260, completed: 0, total: 40, status: '尚未開始' },
            { id: 5, type: '假冒獎勳或優惠', difficulty: '中等', reward: 210, completed: 0, total: 55, status: '尚未開始' },
            { id: 6, type: '假冒交友或戀愛', difficulty: '極難', reward: 300, completed: 0, total: 35, status: '尚未開始' },
            { id: 7, type: '假冒親友或家人', difficulty: '困難', reward: 270, completed: 0, total: 42, status: '尚未開始' },
            { id: 8, type: '假冒中獎或抽獎', difficulty: '簡單', reward: 180, completed: 0, total: 58, status: '尚未開始' },
            { id: 9, type: '假冒投資機會', difficulty: '極難', reward: 320, completed: 0, total: 48, status: '尚未開始' },
            { id: 10, type: '假冒法務機構', difficulty: '困難', reward: 250, completed: 0, total: 52, status: '尚未開始' }
        ];
    }
    // 根據測驗次數計算任務進度
    const testMultiplier = stats.totalTests;
    return [
        { id: 1, type: '假冒金融機構', difficulty: '困難', reward: 250, completed: testMultiplier * 9, total: 50, status: testMultiplier * 9 >= 50 ? '已完成' : '進行中' },
        { id: 2, type: '假冒政府機構', difficulty: '困難', reward: 240, completed: testMultiplier * 8, total: 45, status: testMultiplier * 8 >= 45 ? '已完成' : '進行中' },
        { id: 3, type: '假冒電商平台', difficulty: '中等', reward: 200, completed: testMultiplier * 11, total: 60, status: testMultiplier * 11 >= 60 ? '已完成' : '進行中' },
        { id: 4, type: '假冒貸款服務', difficulty: '困難', reward: 260, completed: testMultiplier * 7, total: 40, status: testMultiplier * 7 >= 40 ? '已完成' : '進行中' },
        { id: 5, type: '假冒獎勳或優惠', difficulty: '中等', reward: 210, completed: testMultiplier * 10, total: 55, status: testMultiplier * 10 >= 55 ? '已完成' : '進行中' },
        { id: 6, type: '假冒交友或戀愛', difficulty: '極難', reward: 300, completed: testMultiplier * 5, total: 35, status: testMultiplier * 5 >= 35 ? '已完成' : testMultiplier * 5 > 0 ? '進行中' : '尚未開始' },
        { id: 7, type: '假冒親友或家人', difficulty: '困難', reward: 270, completed: testMultiplier * 7, total: 42, status: testMultiplier * 7 >= 42 ? '已完成' : '進行中' },
        { id: 8, type: '假冒中獎或抽獎', difficulty: '簡單', reward: 180, completed: testMultiplier * 12, total: 58, status: testMultiplier * 12 >= 58 ? '已完成' : '進行中' },
        { id: 9, type: '假冒投資機會', difficulty: '極難', reward: 320, completed: testMultiplier * 6, total: 48, status: testMultiplier * 6 >= 48 ? '已完成' : testMultiplier * 6 > 0 ? '進行中' : '尚未開始' },
        { id: 10, type: '假冒法務機構', difficulty: '困難', reward: 250, completed: testMultiplier * 9, total: 52, status: testMultiplier * 9 >= 52 ? '已完成' : '進行中' }
    ];
});
const leaderboardData = computed(() => {
    // 從 soulAnimalStore 獲取實時排行榜數據
    const storeLeaderboard = soulAnimalStore.getLeaderboard();
    // 轉換為需要的格式並添加排名和額外資訊
    return storeLeaderboard.map((entry, index) => ({
        rank: index + 1,
        name: entry.name,
        score: entry.score,
        accuracy: Math.min(98, 85 + index * 2), // 模擬準確率，排名越高準確率越高
        missions: Math.floor(entry.score / 20) // 根據分數估算完成任務數
    }));
});
// 詐騙類型對照表
const fraudLabelMap = {
    '1_bank': '假冒金融機構',
    '2_gov': '假冒政府機構',
    '3_ecommerce': '假冒電商平台',
    '4_loan': '假冒貸款服務',
    '5_offer': '假冒獎勳或優惠',
    '6_social': '假冒交友或戀愛',
    '7_family': '假冒親友或家人',
    '8_lottery': '假冒中獎或抽獎',
    '9_investment': '假冒投資機會',
    '10_law': '假冒法務機構'
};
// Animal.vue 詐騙風險映射
const animalFraudLabelMap = {
    '複雜投資詐騙': '複雜投資', '高報酬投資詐騙': '高報酬投資', '情感操控詐騙': '情感操控',
    '高風險投資詐騙': '高風險投資', '損失恐懼詐騙': '損失恐懼', '快速獲利詐騙': '快速獲利',
    '直覺陷阱詐騙': '直覺陷阱', '競爭類詐騙': '競爭壓力', '權威詐騙': '權威迷惑',
    '投資專家詐騙': '專家推薦', '熟人詐騙': '熟人利用', '權威投資詐騙': '權威投資',
    '緊急詐騙': '緊急威脅', '快速機會詐騙': '快速機會', '情感詐騙': '情感操控',
    '朋友推薦詐騙': '朋友推薦', '社群投資詐騙': '社群投資', '技術類詐騙': '技術陷阱',
    '一般詐騙': '一般', '網路詐騙': '網路', '電話詐騙': '電話'
};
// 動物SVG圖庫
const SVG_BANK = {
    fox: '<svg viewBox="0 0 100 100"><defs><linearGradient id="foxGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" /><stop offset="100%" style="stop-color:#FF8E53;stop-opacity:1" /></linearGradient></defs><circle cx="50" cy="45" r="25" fill="url(#foxGrad)" /><path d="M35 35 L25 25 L30 40 Z" fill="#FF6B35" /><path d="M65 35 L75 25 L70 40 Z" fill="#FF6B35" /><circle cx="42" cy="40" r="2" fill="black" /><circle cx="58" cy="40" r="2" fill="black" /><path d="M45 48 Q50 52 55 48" stroke="black" stroke-width="2" fill="none" /></svg>',
    eagle: '<svg viewBox="0 0 100 100"><defs><linearGradient id="eagleGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#8B4513;stop-opacity:1" /><stop offset="100%" style="stop-color:#A0522D;stop-opacity:1" /></linearGradient></defs><circle cx="50" cy="45" r="25" fill="url(#eagleGrad)" /><path d="M25 40 Q35 35 45 40 Q50 35 55 40 Q65 35 75 40" stroke="#654321" stroke-width="3" fill="none" /><circle cx="42" cy="40" r="2" fill="black" /><circle cx="58" cy="40" r="2" fill="black" /><path d="M45 48 L50 52 L55 48" stroke="orange" stroke-width="2" fill="orange" /></svg>',
    owl: '<svg viewBox="0 0 100 100"><defs><linearGradient id="owlGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#8B7355;stop-opacity:1" /><stop offset="100%" style="stop-color:#A0522D;stop-opacity:1" /></linearGradient></defs><ellipse cx="50" cy="50" rx="25" ry="30" fill="url(#owlGrad)" /><circle cx="42" cy="42" r="8" fill="white" /><circle cx="58" cy="42" r="8" fill="white" /><circle cx="42" cy="42" r="4" fill="black" /><circle cx="58" cy="42" r="4" fill="black" /><path d="M48 55 L50 60 L52 55" fill="orange" /></svg>',
    shark: '<svg viewBox="0 0 100 100"><defs><linearGradient id="sharkGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#4682B4;stop-opacity:1" /><stop offset="100%" style="stop-color:#1E90FF;stop-opacity:1" /></linearGradient></defs><ellipse cx="50" cy="50" rx="35" ry="20" fill="url(#sharkGrad)" /><path d="M15 50 L35 35 L40 50 L35 65 Z" fill="#4682B4" /><path d="M80 45 L90 35 L85 50 L90 65 L80 55" fill="#4682B4" /><circle cx="40" cy="45" r="2" fill="black" /><path d="M25 50 L35 50" stroke="white" stroke-width="2" /></svg>',
    squirrel: '<svg viewBox="0 0 100 100"><defs><linearGradient id="squirrelGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#D2691E;stop-opacity:1" /><stop offset="100%" style="stop-color:#CD853F;stop-opacity:1" /></linearGradient></defs><circle cx="50" cy="50" r="20" fill="url(#squirrelGrad)" /><ellipse cx="30" cy="30" rx="15" ry="25" fill="#D2691E" /><circle cx="45" cy="45" r="2" fill="black" /><circle cx="55" cy="45" r="2" fill="black" /><ellipse cx="50" cy="52" rx="3" ry="2" fill="black" /></svg>',
    octopus: '<svg viewBox="0 0 100 100"><defs><linearGradient id="octopusGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#9932CC;stop-opacity:1" /><stop offset="100%" style="stop-color:#BA55D3;stop-opacity:1" /></linearGradient></defs><circle cx="50" cy="40" r="20" fill="url(#octopusGrad)" /><path d="M30 55 Q25 70 30 75" stroke="#9932CC" stroke-width="4" fill="none" /><path d="M40 58 Q35 73 40 78" stroke="#9932CC" stroke-width="4" fill="none" /><path d="M60 58 Q65 73 60 78" stroke="#9932CC" stroke-width="4" fill="none" /><path d="M70 55 Q75 70 70 75" stroke="#9932CC" stroke-width="4" fill="none" /><circle cx="45" cy="35" r="2" fill="black" /><circle cx="55" cy="35" r="2" fill="black" /></svg>',
    wolf: '<svg viewBox="0 0 100 100"><defs><linearGradient id="wolfGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#4A4A4A;stop-opacity:1" /><stop offset="100%" style="stop-color:#696969;stop-opacity:1" /></linearGradient></defs><circle cx="50" cy="45" r="25" fill="url(#wolfGrad)" /><path d="M35 30 L30 20 L40 35 Z" fill="#4A4A4A" /><path d="M65 30 L70 20 L60 35 Z" fill="#4A4A4A" /><circle cx="42" cy="40" r="2" fill="red" /><circle cx="58" cy="40" r="2" fill="red" /><path d="M45 48 Q50 55 55 48" stroke="black" stroke-width="2" fill="none" /></svg>',
    turtle: '<svg viewBox="0 0 100 100"><defs><linearGradient id="turtleGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#228B22;stop-opacity:1" /><stop offset="100%" style="stop-color:#32CD32;stop-opacity:1" /></linearGradient></defs><ellipse cx="50" cy="50" rx="30" ry="20" fill="url(#turtleGrad)" /><circle cx="50" cy="35" r="12" fill="#90EE90" /><circle cx="45" cy="32" r="1.5" fill="black" /><circle cx="55" cy="32" r="1.5" fill="black" /><path d="M30 45 L40 50 L30 55 Z" fill="#90EE90" /><path d="M70 45 L60 50 L70 55 Z" fill="#90EE90" /></svg>',
    elephant: '<svg viewBox="0 0 100 100"><defs><linearGradient id="elephantGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#A9A9A9;stop-opacity:1" /><stop offset="100%" style="stop-color:#C0C0C0;stop-opacity:1" /></linearGradient></defs><circle cx="50" cy="45" r="28" fill="url(#elephantGrad)" /><ellipse cx="35" cy="45" rx="8" ry="15" fill="#A9A9A9" /><ellipse cx="65" cy="45" rx="8" ry="15" fill="#A9A9A9" /><circle cx="45" cy="40" r="2" fill="black" /><circle cx="55" cy="40" r="2" fill="black" /><path d="M45 60 Q50 75 55 60" stroke="#A9A9A9" stroke-width="8" fill="none" /></svg>',
    hippo: '<svg viewBox="0 0 100 100"><defs><linearGradient id="hippoGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#8B8682;stop-opacity:1" /><stop offset="100%" style="stop-color:#A0A0A0;stop-opacity:1" /></linearGradient></defs><ellipse cx="50" cy="50" rx="30" ry="25" fill="url(#hippoGrad)" /><circle cx="50" cy="35" r="18" fill="#A0A0A0" /><circle cx="45" cy="32" r="2" fill="black" /><circle cx="55" cy="32" r="2" fill="black" /><ellipse cx="50" cy="45" rx="12" ry="8" fill="#8B8682" /><circle cx="47" cy="43" r="1" fill="black" /><circle cx="53" cy="43" r="1" fill="black" /></svg>',
    gorilla: '<svg viewBox="0 0 100 100"><defs><linearGradient id="gorillaGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#2F2F2F;stop-opacity:1" /><stop offset="100%" style="stop-color:#4A4A4A;stop-opacity:1" /></linearGradient></defs><circle cx="50" cy="50" r="28" fill="url(#gorillaGrad)" /><circle cx="50" cy="40" r="20" fill="#2F2F2F" /><circle cx="45" cy="35" r="2" fill="black" /><circle cx="55" cy="35" r="2" fill="black" /><ellipse cx="50" cy="45" rx="8" ry="6" fill="#1A1A1A" /><circle cx="50" cy="42" r="2" fill="black" /></svg>',
    mouse: '<svg viewBox="0 0 100 100"><defs><linearGradient id="mouseGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#C0C0C0;stop-opacity:1" /><stop offset="100%" style="stop-color:#D3D3D3;stop-opacity:1" /></linearGradient></defs><circle cx="50" cy="55" r="20" fill="url(#mouseGrad)" /><circle cx="35" cy="35" r="12" fill="#C0C0C0" /><circle cx="65" cy="35" r="12" fill="#C0C0C0" /><circle cx="47" cy="50" r="2" fill="black" /><circle cx="53" cy="50" r="2" fill="black" /><ellipse cx="50" cy="58" rx="2" ry="1" fill="black" /><path d="M65 70 Q80 75 85 85" stroke="#C0C0C0" stroke-width="3" fill="none" /></svg>',
    otter: '<svg viewBox="0 0 100 100"><defs><linearGradient id="otterGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#8B4513;stop-opacity:1" /><stop offset="100%" style="stop-color:#A0522D;stop-opacity:1" /></linearGradient></defs><ellipse cx="50" cy="50" rx="20" ry="25" fill="url(#otterGrad)" /><circle cx="47" cy="42" r="2" fill="black" /><circle cx="53" cy="42" r="2" fill="black" /><ellipse cx="50" cy="48" rx="3" ry="2" fill="black" /><path d="M30 65 Q35 75 25 80" stroke="#8B4513" stroke-width="4" fill="none" /><circle cx="35" cy="30" r="6" fill="#8B4513" /><circle cx="65" cy="30" r="6" fill="#8B4513" /></svg>',
    deer: '<svg viewBox="0 0 100 100"><defs><linearGradient id="deerGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#D2691E;stop-opacity:1" /><stop offset="100%" style="stop-color:#CD853F;stop-opacity:1" /></linearGradient></defs><circle cx="50" cy="50" r="22" fill="url(#deerGrad)" /><path d="M35 25 L30 15 M35 25 L40 15 M40 15 L45 20" stroke="#8B4513" stroke-width="2" fill="none" /><path d="M65 25 L70 15 M65 25 L60 15 M60 15 L55 20" stroke="#8B4513" stroke-width="2" fill="none" /><circle cx="45" cy="45" r="2" fill="black" /><circle cx="55" cy="45" r="2" fill="black" /><path d="M48 52 Q50 54 52 52" stroke="black" stroke-width="1" fill="none" /></svg>',
    dog: '<svg viewBox="0 0 100 100"><defs><linearGradient id="dogGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#DEB887;stop-opacity:1" /><stop offset="100%" style="stop-color:#F4A460;stop-opacity:1" /></linearGradient></defs><circle cx="50" cy="50" r="25" fill="url(#dogGrad)" /><ellipse cx="35" cy="40" rx="8" ry="12" fill="#DEB887" /><ellipse cx="65" cy="40" rx="8" ry="12" fill="#DEB887" /><circle cx="45" cy="45" r="2" fill="black" /><circle cx="55" cy="45" r="2" fill="black" /><ellipse cx="50" cy="52" rx="4" ry="2" fill="black" /><path d="M45 58 Q50 62 55 58" stroke="red" stroke-width="2" fill="none" /></svg>',
    cat: '<svg viewBox="0 0 100 100"><defs><linearGradient id="catGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#FF69B4;stop-opacity:1" /><stop offset="100%" style="stop-color:#FFB6C1;stop-opacity:1" /></linearGradient></defs><circle cx="50" cy="50" r="22" fill="url(#catGrad)" /><path d="M35 35 L30 25 L40 30 Z" fill="#FF69B4" /><path d="M65 35 L70 25 L60 30 Z" fill="#FF69B4" /><circle cx="45" cy="45" r="2" fill="black" /><circle cx="55" cy="45" r="2" fill="black" /><path d="M45 52 Q50 56 55 52" stroke="black" stroke-width="2" fill="none" /><path d="M50 56 L50 65" stroke="black" stroke-width="1" /></svg>'
};
// 動物元資料 - 基於 KTDI 四軸心理學分析
const ANIMAL_META = {
    // 深潛分析局 (K-D) - 懷疑且審慎
    fox: {
        chineseName: '幽影偵探狐',
        group: '戰術偵查專家',
        axisAnalysis: {
            authority: '🔍 天生懷疑者：不輕信權威，習慣質疑一切',
            timing: '⏰ 深思熟慮：寧可慢一步，也要想清楚',
            style: '🎯 細節偵探：擅長從蛛絲馬跡中發現真相',
            reward: '🛡️ 謹慎保守：避免損失比追求獲利更重要'
        },
        personality: '你是天生的幽影偵探！對任何事情都保持理性懷疑，喜歡深入分析細節。在防詐方面，你的謹慎性格是最大優勢。',
        tips: ['相信你的懷疑本能，通常是對的', '用你的分析能力拆解詐騙話術', '成為朋友圈的防詐顧問']
    },
    eagle: {
        chineseName: '天空監察鷹',
        group: '戰術監控專家',
        axisAnalysis: {
            authority: '🔍 理性質疑：不盲從，但會評估權威的可信度',
            timing: '⏰ 計劃行動：喜歡深思熟慮後再行動',
            style: '🎯 精準判斷：注重證據和細節驗證',
            reward: '💎 機會捕手：在安全前提下積極尋找機會'
        },
        personality: '你擁有敏銳的天空視野！能夠從高度俯瞰全局，在深思熟慮後做出精準判斷。既謹慎又不錯失良機。',
        tips: ['運用你的全局視野識別詐騙模式', '平衡謹慎與機會的關係', '幫助他人建立風險意識']
    },
    owl: {
        chineseName: '暗夜智者貓頭鷹',
        group: '戰術洞察專家',
        axisAnalysis: {
            authority: '🔍 獨立思考：習慣用自己的邏輯判斷',
            timing: '⏰ 沉穩觀察：耐心等待，把握時機',
            style: '🎭 直覺智慧：善用第六感和經驗判斷',
            reward: '🛡️ 風險規避：更重視保護既有的安全'
        },
        personality: '你是暗夜的智者！擅長在黑暗中發現他人看不見的危險，直覺敏銳且判斷精準。',
        tips: ['相信你的直覺警報系統', '在夜深人靜時冷靜思考可疑事件', '用智慧引導迷茫的朋友']
    },
    shark: {
        chineseName: '深海獵殺者',
        group: '戰術獵殺專家',
        axisAnalysis: {
            authority: '🔍 挑戰權威：喜歡測試和質疑既定規則',
            timing: '⏰ 戰略思考：會仔細規劃攻擊時機',
            style: '🎭 本能反應：依賴敏銳的嗅覺和直覺',
            reward: '💎 積極進取：敢於追求高回報的機會'
        },
        personality: '你是深海的終極獵殺者！擁有敏銳的嗅覺能察覺危險，同時也敢於在安全範圍內追求機會。',
        tips: ['運用你的敏銳嗅覺識別詐騙', '在追求機會時保持理性分析', '成為團隊的風險控管專家']
    },
    // 影襲特攻隊 (K-I) - 懷疑但即時
    squirrel: {
        chineseName: '閃電警戒松鼠',
        group: '快速反應專家',
        axisAnalysis: {
            authority: '🔍 本能警戒：天生對陌生事物保持警覺',
            timing: '⚡ 快速反應：遇到危險立即閃避',
            style: '🎯 細心觀察：注意環境中的細微變化',
            reward: '🛡️ 安全第一：逃避損失是首要考量'
        },
        personality: '你是閃電般的生存專家！反應迅速，善於在第一時間發現危險並快速脫身。',
        tips: ['相信你的危險警報系統', '快速遠離可疑情況', '隨時保持逃脫路線暢通']
    },
    octopus: {
        chineseName: '變幻策略章魚',
        group: '靈活適應專家',
        axisAnalysis: {
            authority: '🔍 靈活應對：不完全信任，但會適應環境',
            timing: '⚡ 即時變化：能夠快速調整策略',
            style: '🎯 多重思考：同時分析多個角度',
            reward: '💎 彈性追求：在機會中尋找最佳選擇'
        },
        personality: '你是變幻莫測的策略大師！能夠快速變換策略，在複雜環境中找到最安全的路徑。',
        tips: ['運用你的多元思考破解詐騙', '快速適應新型詐騙手法', '成為防詐策略的創新者']
    },
    cat: {
        chineseName: '月影忍者貓',
        group: '直覺感應專家',
        axisAnalysis: {
            authority: '🔍 獨立自主：習慣依靠自己的判斷',
            timing: '⚡ 敏捷反應：身手敏捷，反應迅速',
            style: '🎭 敏銳直覺：善用第六感察覺異狀',
            reward: '🛡️ 謹慎好奇：在安全範圍內探索'
        },
        personality: '你是月夜的忍者！擁有敏銳的第六感，能在瞬間察覺不對勁的地方。',
        tips: ['相信你的直覺警告', '保持獨立思考不隨波逐流', '用敏捷反應遠離詐騙陷阱']
    },
    wolf: {
        chineseName: '荒野守護狼王',
        group: '群體守護專家',
        axisAnalysis: {
            authority: '🔍 群體智慧：信任團隊但質疑外人',
            timing: '⚡ 迅速行動：保護群體時毫不猶豫',
            style: '🎭 本能判斷：依靠群體經驗和直覺',
            reward: '💎 護群積極：為了群體利益勇於行動'
        },
        personality: '你是荒野的守護狼王！擁有強烈的群體意識，會快速行動保護身邊重要的人。',
        tips: ['建立家庭防詐聯盟', '快速分享詐騙預警給親友', '成為社群的防詐領導者']
    },
    // 重裝守備隊 (T-D) - 信任且審慎
    turtle: {
        chineseName: '堡壘守護龜',
        group: '穩健防禦專家',
        axisAnalysis: {
            authority: '🤝 尊重權威：相信專業人士的建議',
            timing: '⏰ 慢工細活：喜歡慢慢來，確保正確',
            style: '🎯 系統分析：按部就班地檢查細節',
            reward: '🛡️ 穩健保守：安全勝過一切'
        },
        personality: '你是堅固的堡壘守護者！雖然步調較慢，但每一步都很踏實，不容易被急躁的詐騙手法影響。',
        tips: ['善用你的穩健性格抵抗時間壓力', '建立系統化的驗證流程', '成為朋友的可靠諮詢對象']
    },
    elephant: {
        chineseName: '古老記憶象',
        group: '記憶守護專家',
        axisAnalysis: {
            authority: '🤝 敬重經驗：相信有經驗的權威',
            timing: '⏰ 深思熟慮：依靠豐富經驗慢慢判斷',
            style: '🎯 經驗法則：善用過往案例分析',
            reward: '💎 穩健投資：偏好長期穩定的機會'
        },
        personality: '你是擁有古老智慧的記憶守護者！擁有優秀的記憶力，能從過往經驗中學習，做出明智決定。',
        tips: ['建立個人的詐騙案例資料庫', '用經驗幫助年輕人識別風險', '投資前仔細研究歷史表現']
    },
    hippo: {
        chineseName: '溫柔巨獸河馬',
        group: '溫和守護專家',
        axisAnalysis: {
            authority: '🤝 和諧相處：通常相信他人的善意',
            timing: '⏰ 穩定節奏：不喜歡被催促',
            style: '🎭 感性判斷：重視感覺和氛圍',
            reward: '🛡️ 和平主義：避免衝突和損失'
        },
        personality: '你是溫柔的巨獸！擁有寬容的心，但也要小心善良被利用。',
        tips: ['學會在善良中保持理性', '建立溫和但堅定的拒絕方式', '尋求可信任朋友的意見']
    },
    gorilla: {
        chineseName: '鋼鐵金剛猩',
        group: '強力守護專家',
        axisAnalysis: {
            authority: '🤝 尊重強者：欣賞有實力的權威',
            timing: '⏰ 力量蓄積：深思熟慮後強力行動',
            style: '🎭 直覺力量：依靠強大的直覺',
            reward: '💎 積極進取：有實力就勇於追求'
        },
        personality: '你是鋼鐵般的守護金剛！雖然信任他人，但擁有強大的保護能力和直覺判斷力。',
        tips: ['運用你的力量保護弱勢群體', '相信直覺但也要理性驗證', '成為社群的堅強後盾']
    },
    // 閃電先鋒 (T-I) - 信任且即時
    mouse: {
        chineseName: '好奇探險鼠',
        group: '靈活探索專家',
        axisAnalysis: {
            authority: '🤝 友善信任：容易相信他人的好意',
            timing: '⚡ 活潑敏捷：反應快速，行動積極',
            style: '🎯 好奇探索：喜歡嘗試新事物',
            reward: '🛡️ 小心翼翼：雖然好奇但會注意安全'
        },
        personality: '你是充滿好奇心的探險家！活潑友善，但有時過於信任他人，需要加強防範意識。',
        tips: ['保持好奇心但增加驗證步驟', '建立可信任的諮詢網絡', '學會在熱情中保持冷靜']
    },
    otter: {
        chineseName: '社交明星水獺',
        group: '社交活躍專家',
        axisAnalysis: {
            authority: '🤝 社交信任：喜歡相信社群中的朋友',
            timing: '⚡ 即時分享：喜歡立即與他人互動',
            style: '🎯 細節分享：注意有趣的小細節',
            reward: '💎 樂觀進取：相信好事會發生'
        },
        personality: '你是社交圈的閃耀明星！熱愛分享，但要小心在社交中洩露過多個人資訊。',
        tips: ['在社交中保護個人隱私', '驗證網友身份後再深度交流', '成為朋友圈的正向能量']
    },
    deer: {
        chineseName: '森林精靈鹿',
        group: '溫柔感知專家',
        axisAnalysis: {
            authority: '🤝 溫和信任：通常相信他人的善意',
            timing: '⚡ 感性即時：容易被情感影響而快速反應',
            style: '🎭 直覺感受：依賴感覺和直覺判斷',
            reward: '🛡️ 害羞保守：雖然信任但會保持距離'
        },
        personality: '你是森林中的溫柔精靈！擁有敏感的心，容易感受他人情緒，但也要小心被情感操控。',
        tips: ['學會區分真誠與操控', '在情感衝動時給自己冷靜時間', '尋求理性朋友的建議']
    },
    dog: {
        chineseName: '忠誠護衛犬',
        group: '忠誠守護專家',
        axisAnalysis: {
            authority: '🤝 絕對忠誠：完全信任認定的對象',
            timing: '⚡ 即時反應：對主人的需求立即回應',
            style: '🎭 情感判斷：用心感受對方的真誠',
            reward: '💎 無私奉獻：為了他人利益勇於行動'
        },
        personality: '你是最忠誠的護衛戰士！擁有純真的心，但要小心忠誠被不當利用。',
        tips: ['建立值得信任的朋友圈', '學會識別真正值得守護的對象', '在忠誠中保持基本判斷力']
    }
};
// 靈魂動物相關函數
const getAnimalSVG = (animalResult) => {
    const animalId = animalResult.animalId || animalResult.animalName;
    return SVG_BANK[animalId] || SVG_BANK['fox'];
};
const getDisplayAnimalName = (animalResult) => {
    // 直接使用 Animal.vue 的動物名稱格式
    if (animalResult.animalName) {
        console.log(`🔄 轉換動物名稱: ${animalResult.animalName}`);
        // 將 soulAnimalStore 的格式轉換為 Animal.vue 格式
        const soulStoreToAnimalVue = {
            // 小寫英文格式
            'squirrel': '🐿️ 松鼠型',
            'fox': '🦊 狐狸型',
            'eagle': '🦅 老鷹型',
            'owl': '🦉 貓頭鷹型',
            'shark': '🦈 鯊魚型',
            'octopus': '🐙 章魚型',
            'cat': '🐱 貓咪型',
            'wolf': '🐺 狼型',
            'turtle': '🐢 烏龜型',
            'elephant': '🐘 大象型',
            'hippo': '🦛 河馬型',
            'kong': '🦍 金剛型',
            'mouse': '🐭 老鼠型',
            'lion': '🦁 獅子型',
            'deer': '🦌 麋鹿型',
            'horse': '🐎 馬型',
            // 中文格式
            '狐狸 (Fox)': '🦊 狐狸型',
            '老鷹 (Eagle)': '🦅 老鷹型',
            '貓頭鷹 (Owl)': '🦉 貓頭鷹型',
            '鯊魚 (Shark)': '🦈 鯊魚型',
            '松鼠 (Squirrel)': '🐿️ 松鼠型',
            '章魚 (Octopus)': '🐙 章魚型',
            '貓 (Cat)': '🐱 貓咪型',
            '狼 (Wolf)': '🐺 狼型',
            '烏龜 (Turtle)': '🐢 烏龜型',
            '大象 (Elephant)': '🐘 大象型',
            '河馬 (Hippo)': '🦛 河馬型',
            '金剛 (Kong)': '🦍 金剛型',
            '老鼠 (Mouse)': '🐭 老鼠型',
            '獅子 (Lion)': '🦁 獅子型',
            '麋鹿 (Deer)': '🦌 麋鹿型',
            '馬 (Horse)': '🐎 馬型'
        };
        const convertedName = soulStoreToAnimalVue[animalResult.animalName];
        if (convertedName) {
            console.log(`✅ 轉換成功: ${animalResult.animalName} -> ${convertedName}`);
            return convertedName;
        }
        return animalResult.animalName; // 如果沒有對應就返回原名
    }
    // 如果是動物ID，轉換為 Animal.vue 格式
    const animalCodeToFullName = {
        'KDSL': '🦊 狐狸型', 'KDSR': '🦅 老鷹型', 'KDGL': '🦉 貓頭鷹型', 'KDGR': '🦈 鯊魚型',
        'KISL': '🐿️ 松鼠型', 'KISR': '🐙 章魚型', 'KIGL': '🐱 貓咪型', 'KIGR': '🐺 狼型',
        'TDSL': '🐢 烏龜型', 'TDSR': '🐘 大象型', 'TDGL': '🦛 河馬型', 'TDGR': '🦍 金剛型',
        'TISL': '🐭 老鼠型', 'TISR': '🦁 獅子型', 'TIGL': '🦌 麋鹿型', 'TIGR': '🐎 駿馬型'
    };
    const mappedName = animalCodeToFullName[animalResult.animalId];
    const finalResult = mappedName || animalResult.animalId || '🐭 老鼠型'; // 使用老鼠型作為安全默認值
    console.log(`✅ 轉換成功: ${animalResult.animalId || animalResult.animalName} -> ${finalResult}`);
    return finalResult;
};
// 標準化動物名稱 - 處理各種可能的格式
const normalizeAnimalName = (animalName) => {
    if (!animalName)
        return '🐭 老鼠型';
    // 如果已經是標準格式，直接返回
    const standardNames = [
        '🦊 狐狸型', '🦅 老鷹型', '🦉 貓頭鷹型', '🦈 鯊魚型',
        '🐿️ 松鼠型', '🐙 章魚型', '🐱 貓咪型', '🐺 狼型',
        '🐢 烏龜型', '🐘 大象型', '🦛 河馬型', '🦍 金剛型',
        '🐭 老鼠型', '🦁 獅子型', '🦌 麋鹿型', '🐎 駿馬型'
    ];
    if (standardNames.includes(animalName)) {
        return animalName;
    }
    // 嘗試從名稱中提取動物類型
    const nameMapping = {
        '狐狸': '🦊 狐狸型', '老鷹': '🦅 老鷹型', '貓頭鷹': '🦉 貓頭鷹型', '鯊魚': '🦈 鯊魚型',
        '松鼠': '🐿️ 松鼠型', '章魚': '🐙 章魚型', '貓咪': '🐱 貓咪型', '狼': '🐺 狼型',
        '烏龜': '🐢 烏龜型', '大象': '🐘 大象型', '河馬': '🦛 河馬型', '金剛': '🦍 金剛型',
        '老鼠': '🐭 老鼠型', '獅子': '🦁 獅子型', '麋鹿': '🦌 麋鹿型', '駿馬': '🐎 駿馬型', '馬': '🐎 駿馬型'
    };
    for (const [key, value] of Object.entries(nameMapping)) {
        if (animalName.includes(key)) {
            return value;
        }
    }
    return '🐭 老鼠型'; // 安全默認值
};
// 獲取酷炫的動物名稱（反詐特務代號）
const getCoolAnimalName = (animalName) => {
    const coolNameMap = {
        '🦊 狐狸型': '🦊 幽影偵探狐',
        '🦅 老鷹型': '🦅 天空監察鷹',
        '🦉 貓頭鷹型': '🦉 暗夜智者',
        '🦈 鯊魚型': '🦈 深海獵殺者',
        '🐿️ 松鼠型': '🐿️ 閃電警戒松鼠',
        '🐙 章魚型': '🐙 變幻策略章魚',
        '🐱 貓咪型': '🐱 影襲獨行貓',
        '🐺 狼型': '🐺 獵食突擊狼',
        '🐢 烏龜型': '🐢 重裝守護龜',
        '🐘 大象型': '🐘 穩健指揮象',
        '🦛 河馬型': '🦛 領域守衛河馬',
        '🦍 金剛型': '🦍 族長金剛',
        '🐭 老鼠型': '🐭 警戒偵查鼠',
        '🦁 獅子型': '🦁 王者領袖獅',
        '🦌 麋鹿型': '🦌 心靈感應鹿',
        '🐎 馬型': '🐎 自由奔騰馬'
    };
    return coolNameMap[animalName] || animalName;
};
// 根據遊戲記錄分析用戶最容易受騙的簡訊類型
const getTopVulnerableMessageTypes = (username) => {
    try {
        console.log('🔍 分析用戶簡訊弱點:', username);
        // 獲取用戶的遊戲記錄
        const gameRecords = soulAnimalStore.getUserGameRecords ? soulAnimalStore.getUserGameRecords(username) : [];
        console.log('🔍 遊戲記錄:', gameRecords);
        // 十大簡訊詐騙類型映射
        const messageTypeMap = {
            '1_bank': '假冒金融機構',
            '2_gov': '假冒政府機構',
            '3_ecommerce': '假冒電商平台',
            '4_loan': '假冒貸款服務',
            '5_offer': '假冒獎勳或優惠',
            '6_social': '假冒交友或戀愛關係',
            '7_family': '假冒親友或家人',
            '8_lottery': '假冒中獎或抽獎',
            '9_investment': '假冒金融商品或投資機會',
            '10_law': '假冒公務機關或法務機構'
        };
        // 統計每種類型的錯誤次數
        const typeErrorCount = {};
        let totalErrors = 0;
        gameRecords.forEach(record => {
            if (record.wrongAnswers && record.wrongAnswers.length > 0) {
                record.wrongAnswers.forEach(wrong => {
                    const messageType = wrong.type || '未知類型';
                    typeErrorCount[messageType] = (typeErrorCount[messageType] || 0) + 1;
                    totalErrors++;
                });
            }
        });
        // 如果沒有錯誤記錄，根據動物類型給出預設分析
        if (totalErrors === 0) {
            return getDefaultVulnerableTypes(username);
        }
        // 計算錯誤率並排序
        const vulnerableTypes = Object.entries(typeErrorCount)
            .map(([type, count]) => ({
            type: messageTypeMap[type] || type,
            typeCode: type,
            count,
            percentage: Math.round((count / totalErrors) * 100)
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3); // 取前3名
        return vulnerableTypes;
    }
    catch (error) {
        console.error('分析簡訊類型失敗:', error);
        return getDefaultVulnerableTypes(username);
    }
};
// 根據動物類型給出預設的容易受騙簡訊類型
const getDefaultVulnerableTypes = (username) => {
    // 獲取用戶的動物類型
    const quizRecords = soulAnimalStore.getUserRecords(username);
    if (quizRecords.length === 0)
        return [];
    const animalResult = quizRecords[0].animalResult;
    const animalName = getDisplayAnimalName(animalResult);
    // 根據動物特性推測容易受騙的類型
    const animalVulnerabilities = {
        '🐿️ 松鼠型': [
            { type: '假冒獎勳或優惠', typeCode: '5_offer', count: 0, percentage: 35 },
            { type: '假冒金融機構', typeCode: '1_bank', count: 0, percentage: 30 },
            { type: '假冒政府機構', typeCode: '2_gov', count: 0, percentage: 25 }
        ],
        '🦊 狐狸型': [
            { type: '假冒金融商品或投資機會', typeCode: '9_investment', count: 0, percentage: 40 },
            { type: '假冒獎勳或優惠', typeCode: '5_offer', count: 0, percentage: 30 },
            { type: '假冒金融機構', typeCode: '1_bank', count: 0, percentage: 25 }
        ],
        '🐢 烏龜型': [
            { type: '假冒政府機構', typeCode: '2_gov', count: 0, percentage: 35 },
            { type: '假冒公務機關或法務機構', typeCode: '10_law', count: 0, percentage: 30 },
            { type: '假冒金融機構', typeCode: '1_bank', count: 0, percentage: 25 }
        ],
        '🐶 柴犬型': [
            { type: '假冒親友或家人', typeCode: '7_family', count: 0, percentage: 40 },
            { type: '假冒交友或戀愛關係', typeCode: '6_social', count: 0, percentage: 30 },
            { type: '假冒獎勳或優惠', typeCode: '5_offer', count: 0, percentage: 20 }
        ]
    };
    return animalVulnerabilities[animalName] || [
        { type: '假冒金融機構', typeCode: '1_bank', count: 0, percentage: 30 },
        { type: '假冒政府機構', typeCode: '2_gov', count: 0, percentage: 25 },
        { type: '假冒電商平台', typeCode: '3_ecommerce', count: 0, percentage: 20 }
    ];
};
// 獲取心理軸線分析
const getPsychologyAnalysis = (animalResult) => {
    const animalName = getDisplayAnimalName(animalResult);
    // 心理軸線分析映射 - 基於16種動物轉換分數列表官方數據
    const psychologyMap = {
        // 🕵️ 【深潛分析局】(K-D - 懷疑且審慎)
        '🦊 狐狸型': {
            authority: { level: 30, description: '🤔 謹慎質疑：對權威保持適度懷疑' },
            timing: { level: 30, description: '🐌 深思熟慮：偏好審慎分析勝過即時反應' },
            style: { level: 70, description: '🔍 細節導向：重視訊息的具體細節和準確性' },
            motivation: { level: 80, description: '🛡️ 損失規避：非常重視避免損失和風險' },
            tech: { level: 60, description: '💻 技術敏銳：具備良好的技術識別能力' }
        },
        '🦅 老鷹型': {
            authority: { level: 25, description: '🤔 高度質疑：對權威機構保持高度懷疑' },
            timing: { level: 25, description: '⏳ 極度審慎：非常重視深入調查和驗證' },
            style: { level: 75, description: '📊 數據導向：極度重視具體數據和詳細資訊' },
            motivation: { level: 30, description: '💰 機會導向：對高回報機會特別敏感' },
            tech: { level: 70, description: '🔧 技術專精：擅長使用技術工具進行驗證' }
        },
        '🦉 貓頭鷹型': {
            authority: { level: 30, description: '🤔 智慧質疑：運用智慧對權威保持懷疑' },
            timing: { level: 30, description: '🧘 冥想思考：偏好深度思考勝過快速決定' },
            style: { level: 35, description: '🎯 直覺洞察：依賴敏銳直覺識別問題' },
            motivation: { level: 80, description: '🛡️ 智慧保守：運用智慧避免不必要風險' },
            tech: { level: 90, description: '🚀 科技達人：極度擅長運用科技工具' }
        },
        '🦈 鯊魚型': {
            authority: { level: 25, description: '⚔️ 挑戰權威：勇於挑戰既有權威體系' },
            timing: { level: 25, description: '🎯 策略等待：善於等待最佳時機出手' },
            style: { level: 30, description: '⚡ 敏銳直覺：依賴強烈直覺快速判斷' },
            motivation: { level: 30, description: '🏆 勝利渴望：對征服和勝利有強烈渴望' },
            tech: { level: 92, description: '🤖 科技霸主：在科技應用上達到極致水準' }
        },
        // ⚡ 【影襲特攻隊】(K-I - 懷疑但即時)
        '🐿️ 松鼠型': {
            authority: { level: 30, description: '🤔 謹慎質疑：對權威保持適度懷疑' },
            timing: { level: 70, description: '⚡ 時機敏感：容易被時間壓力影響' },
            style: { level: 70, description: '🔍 細節敏感：重視訊息的具體細節' },
            motivation: { level: 80, description: '🛡️ 風險規避：非常重視避免損失' },
            tech: { level: 50, description: '💻 技術中等：基本的數位識別能力' }
        },
        '🐙 章魚型': {
            authority: { level: 25, description: '🔎 深度質疑：對所有權威都保持質疑' },
            timing: { level: 75, description: '🏃 快速行動：傾向立即採取行動' },
            style: { level: 75, description: '📋 多重細節：能同時處理多個複雜細節' },
            motivation: { level: 30, description: '🎯 多重機會：善於同時追求多個機會' },
            tech: { level: 80, description: '🐙 多工科技：擅長同時運用多種科技工具' }
        },
        '🐱 貓咪型': {
            authority: { level: 30, description: '😼 獨立懷疑：保持獨立思考和適度懷疑' },
            timing: { level: 70, description: '🐱 敏捷反應：具備敏捷的即時反應能力' },
            style: { level: 35, description: '💝 情感直覺：依賴敏銳的情感直覺' },
            motivation: { level: 80, description: '🛡️ 自保本能：強烈的自我保護意識' },
            tech: { level: 70, description: '📱 靈活科技：靈活運用各種科技工具' }
        },
        '🐺 狼型': {
            authority: { level: 25, description: '🐺 群體質疑：質疑權威但信任群體智慧' },
            timing: { level: 75, description: '⚡ 狩獵本能：具備快速捕捉機會的本能' },
            style: { level: 30, description: '🐺 野性直覺：依賴強烈的野性直覺' },
            motivation: { level: 30, description: '🏹 狩獵慾望：對獲取獵物有強烈慾望' },
            tech: { level: 90, description: '🚀 科技先鋒：在科技應用上領先群體' }
        },
        // 🛡️ 【重裝守備隊】(T-D - 信任且審慎)
        '🐢 烏龜型': {
            authority: { level: 70, description: '🏛️ 權威信任：高度信任官方和專業機構' },
            timing: { level: 30, description: '🐌 從容不迫：不易被時間壓力影響' },
            style: { level: 70, description: '📋 細節保守：重視細節但偏好保守方式' },
            motivation: { level: 80, description: '🛡️ 穩健保守：極度重視穩健和安全' },
            tech: { level: 30, description: '📚 技術保守：偏好傳統驗證方式' }
        },
        '🐘 大象型': {
            authority: { level: 75, description: '👑 權威尊重：對權威機構展現高度尊重' },
            timing: { level: 25, description: '🗻 穩重思考：極度重視深思熟慮和穩重' },
            style: { level: 75, description: '📚 知識細節：重視知識的細節和準確性' },
            motivation: { level: 30, description: '🎯 長期目標：專注於長期穩定的回報' },
            tech: { level: 40, description: '📖 傳統偏好：偏好傳統方式但會學習新技術' }
        },
        '🦛 河馬型': {
            authority: { level: 70, description: '🏛️ 制度信任：對既有制度和權威保持信任' },
            timing: { level: 30, description: '🌊 悠閒節奏：偏好悠閒舒適的處理節奏' },
            style: { level: 35, description: '🌊 流動直覺：依賴如流水般的自然直覺' },
            motivation: { level: 80, description: '🛡️ 安全感：極度重視安全感和穩定' },
            tech: { level: 30, description: '🏞️ 自然偏好：偏好自然傳統的處理方式' }
        },
        '🦍 金剛型': {
            authority: { level: 75, description: '👨‍💼 領導信任：信任有能力的領導者和權威' },
            timing: { level: 25, description: '🗻 力量積蓄：重視積蓄力量勝過快速行動' },
            style: { level: 30, description: '💪 力量直覺：依賴強大的力量感知直覺' },
            motivation: { level: 30, description: '🏆 統治慾望：對掌控和統治有強烈慾望' },
            tech: { level: 50, description: '⚖️ 平衡科技：在科技運用上保持平衡態度' }
        },
        // 🚀 【閃電先鋒】(T-I - 信任且即時)
        '🐭 老鼠型': {
            authority: { level: 70, description: '🤝 適度信任：偏向相信權威但會保持警覺' },
            timing: { level: 70, description: '⚡ 快速反應：傾向即時行動但會小心' },
            style: { level: 70, description: '🔍 細節敏感：注重訊息的具體細節' },
            motivation: { level: 80, description: '🛡️ 損失規避：非常重視避免損失和風險' },
            tech: { level: 40, description: '💻 技術謹慎：對新科技保持謹慎態度' }
        },
        '🦦 水獺型': {
            authority: { level: 75, description: '🤝 社交信任：透過社交關係建立對權威的信任' },
            timing: { level: 75, description: '🏄 流暢行動：能夠流暢快速地採取行動' },
            style: { level: 75, description: '🎯 精準細節：在細節處理上展現精準能力' },
            motivation: { level: 30, description: '🎣 機會捕捉：善於捕捉各種獲利機會' },
            tech: { level: 60, description: '💻 靈活科技：靈活運用科技工具達成目標' }
        },
        '🦌 麋鹿型': {
            authority: { level: 70, description: '🌟 純真信任：以純真的心態信任權威' },
            timing: { level: 70, description: '🦌 敏捷反應：具備敏捷優雅的反應能力' },
            style: { level: 35, description: '🌸 溫柔直覺：依賴溫柔敏感的直覺感知' },
            motivation: { level: 80, description: '🛡️ 群體保護：重視保護自己和群體的安全' },
            tech: { level: 50, description: '🌐 平衡科技：在科技運用上保持自然平衡' }
        },
        '🐶 柴犬型': {
            authority: { level: 75, description: '👥 忠誠信任：對可信賴的權威展現忠誠' },
            timing: { level: 75, description: '🏃 熱情行動：以熱情積極的態度立即行動' },
            style: { level: 30, description: '❤️ 情感直覺：依賴溫暖的情感直覺判斷' },
            motivation: { level: 30, description: '🎾 遊戲心態：以遊戲心態追求各種獎勵' },
            tech: { level: 70, description: '📱 友善科技：以友善態度學習運用新科技' }
        }
    };
    return psychologyMap[animalName] || {
        authority: { level: 50, description: '🤷 平衡態度：對權威保持中性態度' },
        timing: { level: 50, description: '⏱️ 時機平衡：不易受時間壓力影響' },
        style: { level: 50, description: '📝 風格中性：內容與形式並重' },
        motivation: { level: 50, description: '⚖️ 動機平衡：理性評估風險與回報' },
        tech: { level: 50, description: '🔍 技術中等：基本的識別能力' }
    };
};
// 計算心理軸線雷達圖的點座標
const getPsychologyRadarPoints = (psychologyData) => {
    if (!psychologyData)
        return '';
    const center = 100; // SVG中心點
    const maxRadius = 80; // 最大半徑
    // 五個軸的角度（從正上方開始，順時針）
    const angles = [
        -90, // 權威偏好 (上)
        -18, // 時間習慣 (右上) 
        54, // 溝通風格 (右下)
        126, // 獎懲誘惑 (左下)
        198 // 科技適應 (左上)
    ];
    // 按順序獲取五個維度的數據
    const dimensions = ['authority', 'timing', 'style', 'motivation', 'tech'];
    const points = dimensions.map((dim, index) => {
        const value = psychologyData[dim]?.level || 50;
        const radius = (value / 100) * maxRadius;
        const angleRad = (angles[index] * Math.PI) / 180;
        const x = center + radius * Math.cos(angleRad);
        const y = center + radius * Math.sin(angleRad);
        return `${x},${y}`;
    });
    return points.join(' ');
};
// 計算心理軸線雷達圖的點座標數組（用於顯示圓點）
const getPsychologyRadarPointsArray = (psychologyData) => {
    if (!psychologyData)
        return [];
    const center = 100;
    const maxRadius = 80;
    const angles = [
        -90, // 權威偏好 (上)
        -18, // 時間習慣 (右上) 
        54, // 溝通風格 (右下)
        126, // 獎懲誘惑 (左下)
        198 // 科技適應 (左上)
    ];
    const dimensions = ['authority', 'timing', 'style', 'motivation', 'tech'];
    return dimensions.map((dim, index) => {
        const value = psychologyData[dim]?.level || 50;
        const radius = (value / 100) * maxRadius;
        const angleRad = (angles[index] * Math.PI) / 180;
        return {
            x: center + radius * Math.cos(angleRad),
            y: center + radius * Math.sin(angleRad)
        };
    });
};
// 獲取動物的戰術群組和詳細資訊
const getAnimalDetails = (animalResult) => {
    const rawAnimalName = getDisplayAnimalName(animalResult);
    const animalName = normalizeAnimalName(rawAnimalName);
    console.log(`🎯 getAnimalDetails 處理動物: ${rawAnimalName} -> ${animalName}`);
    // 基於 Animal.vue 的戰術群組資訊
    const animalDetailsMap = {
        '🦊 狐狸型': {
            group: '深潛分析局 (Deep Analysis Bureau)',
            role: '幽影偵探',
            squad: '戰術偵查專家',
            description: '機警反應型 - 深潜分析局斥候，反應神速',
            fullDescription: '你反應迅速且機警敏感，能夠快速識別威脅。雖然擔心損失，但你的懷疑天性會讓你在行動前先想一想。',
            specialties: ['相信你的第一直覺，通常是警告信號', '不要讓恐懼影響理性判斷', '建立緊急應變的標準流程'],
            topFraudRisks: [
                ['複雜投資詐騙', '中高', '細節分析能力強但可能被複雜包裝欺騙'],
                ['損失恐懼詐騙', '中', '對損失敏感，容易被恐懼威脅影響'],
                ['技術類詐騙', '中低', '技術能力良好，較難被技術手法欺騙']
            ]
        },
        '🦅 老鷹型': {
            group: '深潛分析局 (Deep Analysis Bureau)',
            role: '天空監察者',
            squad: '戰術監控專家',
            description: '精準判斷型 - 深潜分析局監控員，高空俯瞰',
            fullDescription: '你擁有敏銳的天空視野！能夠從高度俯瞰全局，在深思熟慮後做出精準判斷。既謹慎又不錯失良機。',
            specialties: ['運用你的全局視野識別詐騙模式', '平衡謹慎與機會的關係', '幫助他人建立風險意識'],
            topFraudRisks: [
                ['高報酬投資詐騙', '中', '對機會敏感，可能被高回報誘惑'],
                ['複雜投資詐騙', '中', '雖然分析能力強但複雜包裝可能混淆判斷'],
                ['權威詐騙', '中低', '懷疑天性會對權威保持警戒']
            ]
        },
        '🦉 貓頭鷹型': {
            group: '深潛分析局 (Deep Analysis Bureau)',
            role: '暗夜智者',
            squad: '戰術洞察專家',
            description: '直覺洞察型 - 深潜分析局智者，暗夜洞察',
            fullDescription: '你是暗夜的智者！擅長在黑暗中發現他人看不見的危險，直覺敏銳且判斷精準。',
            specialties: ['相信你的直覺警報系統', '在夜深人靜時冷靜思考可疑事件', '用智慧引導迷茫的朋友'],
            topFraudRisks: [
                ['直覺陷阱詐騙', '中', '過度依賴直覺可能錯判刻意包裝的騙局'],
                ['損失恐懼詐騙', '中', '對風險敏感，易被損失威脅影響'],
                ['技術類詐騙', '低', '科技素養極高，很難被技術手法欺騙']
            ]
        },
        '🦈 鯊魚型': {
            group: '深潛分析局 (Deep Analysis Bureau)',
            role: '深海獵殺者',
            squad: '戰術獵殺專家',
            description: '敏銳獵食型 - 深潜分析局獵手，深海追擊',
            fullDescription: '你是深海的終極獵殺者！擁有敏銳的嗅覺能察覺危險，同時也敢於在安全範圍內追求機會。',
            specialties: ['運用你的敏銳嗅覺識別詐騙', '在追求機會時保持理性分析', '成為團隊的風險控管專家'],
            topFraudRisks: [
                ['高報酬投資詐騙', '中高', '機會導向特質容易被極高回報誘惑'],
                ['快速獲利詐騙', '中', '對快速機會的敏感度較高'],
                ['技術類詐騙', '低', '技術能力極強，難以被技術手法欺騙']
            ]
        },
        '🐿️ 松鼠型': {
            group: '影襲特攻隊 (Shadow Strike Force)',
            role: '閃電斥候',
            squad: '快速反應專家',
            description: '機警反應型 - 影襲特攻隊斥候，反應神速',
            fullDescription: '你反應迅速且機警敏感，能夠快速識別威脅。雖然擔心損失，但你的懷疑天性會讓你在行動前先想一想。',
            specialties: ['相信你的第一直覺，通常是警告信號', '不要讓恐懼影響理性判斷', '建立緊急應變的標準流程'],
            topFraudRisks: [
                ['緊急詐騙', '高', '即時反應特質容易被時間壓力操控'],
                ['快速機會詐騙', '中高', '對機會敏感但行動迅速可能輕忽風險'],
                ['損失恐懼詐騙', '中', '對損失敏感，容易被威脅影響']
            ]
        },
        '🐙 章魚型': {
            group: '影襲特攻隊 (Shadow Strike Force)',
            role: '變幻策略師',
            squad: '靈活適應專家',
            description: '靈活探索型 - 影襲特攻隊偵察兵，多方驗證',
            fullDescription: '你善於多角度思考，靈活應對各種情況。對獎勵的敏感讓你容易被誘惑，但懷疑的天性會提醒你保持警戒。',
            specialties: ['利用你的多元思維驗證資訊', '設定獲利機會的評估標準', '避免過度自信而忽略風險警訊'],
            topFraudRisks: [
                ['複雜投資詐騙', '中', '細節導向但複雜多層包裝可能混淆判斷'],
                ['快速機會詐騙', '中', '即時行動特質可能錯失深度分析時間'],
                ['技術類詐騙', '中低', '技術能力良好，較能識別技術陷阱']
            ]
        },
        '🐱 貓咪型': {
            group: '影襲特攻隊 (Shadow Strike Force)',
            role: '影襲獨行者',
            squad: '獨立作戰專家',
            description: '獨立冷靜型 - 影襲特攻隊獨行俠，我行我素',
            fullDescription: '你獨立且冷靜，喜歡按照自己的節奏行動。直覺敏銳但有時會過度依賴感覺，需要更多理性分析的平衡。',
            specialties: ['結合直覺與理性分析', '不要完全依賴第一印象', '保持獨立思考的優勢'],
            topFraudRisks: [
                ['直覺陷阱詐騙', '中高', '直覺導向可能被刻意誤導'],
                ['損失恐懼詐騙', '中', '對風險敏感，易被損失威脅影響'],
                ['快速機會詐騙', '中', '即時特質可能在機會面前降低警戒']
            ]
        },
        '🐺 狼型': {
            group: '影襲特攻隊 (Shadow Strike Force)',
            role: '獵食突擊手',
            squad: '團隊突擊專家',
            description: '果斷獵食型 - 影襲特攻隊突擊手，勇猛無懼',
            fullDescription: '你果斷勇猛，敢於追求機會和挑戰。雖然行動迅速，但懷疑的本能會讓你在關鍵時刻保持警覺。',
            specialties: ['在行動前做基本的風險評估', '避免競爭心理影響判斷', '利用你的領導力幫助他人防詐'],
            topFraudRisks: [
                ['高報酬投資詐騙', '中', '機會導向特質可能被極高回報誘惑'],
                ['競爭類詐騙', '中', '競爭天性可能被挑戰或競爭手法操控'],
                ['技術類詐騙', '低', '技術能力強，較難被技術手法欺騙']
            ]
        },
        '🐢 烏龜型': {
            group: '重裝守備隊 (Heavy Defense Corps)',
            role: '重裝守護者',
            squad: '穩定防守專家',
            description: '理性冷靜型 - 重裝守備隊核心，穩如泰山',
            fullDescription: '你穩重謹慎且善於深思熟慮。雖然容易信任權威，但審慎的天性會讓你花時間驗證重要決定。',
            specialties: ['對權威來源進行多重驗證', '設定重要決定的冷靜期', '保持你穩健的判斷風格'],
            topFraudRisks: [
                ['權威詐騙', '中高', '對權威的信任可能被假權威利用'],
                ['損失恐懼詐騙', '中', '對風險敏感，易被損失威脅影響'],
                ['複雜投資詐騙', '中低', '審慎天性會仔細檢視投資細節']
            ]
        },
        '🐘 大象型': {
            group: '重裝守備隊 (Heavy Defense Corps)',
            role: '穩健指揮官',
            squad: '戰略規劃專家',
            description: '穩健計畫型 - 重裝守備隊指揮官，深謀遠慮',
            fullDescription: '你善於長期規劃，追求穩健的成長。對專家建議的信任需要配合更嚴格的身份驗證程序。',
            specialties: ['建立可信專家的名單和驗證流程', '避免被「穩健投資」的包裝欺騙', '利用你的規劃能力建立防詐檢查清單'],
            topFraudRisks: [
                ['權威投資詐騙', '中高', '對專家權威的信任可能被利用'],
                ['複雜投資詐騙', '中', '細節分析但可能被專業包裝混淆'],
                ['穩健投資詐騙', '中', '對穩健投資的偏好可能被利用']
            ]
        },
        '🦛 河馬型': {
            group: '重裝守備隊 (Heavy Defense Corps)',
            role: '領域守衛者',
            squad: '領域守護專家',
            description: '領域守護型 - 重裝守備隊守護者，保衛家園',
            fullDescription: '你重視家庭和熟悉的環境，直覺敏銳且富有同情心。對熟人的信任是你的弱點，需要額外小心。',
            specialties: ['對熟人的緊急求助要電話確認', '不要讓情感影響理性判斷', '建立家庭防詐的溝通機制'],
            topFraudRisks: [
                ['熟人詐騙', '高', '對熟人的信任容易被冒用身份利用'],
                ['情感操控詐騙', '中高', '同情心和直覺可能被情感手法操控'],
                ['家庭緊急詐騙', '中', '對家人安危的擔心可能被利用']
            ]
        },
        '🦍 金剛型': {
            group: '重裝守備隊 (Heavy Defense Corps)',
            role: '族長領袖',
            squad: '團隊領導專家',
            description: '家族領袖型 - 重裝守備隊族長，責任為重',
            fullDescription: '你是天生的領導者，重視群體利益和權威指導。需要特別注意權威+投資結合的詐騙手法。',
            specialties: ['權威推薦的投資要格外小心求證', '利用你的影響力教育群體防詐知識', '建立群體決策的討論機制'],
            topFraudRisks: [
                ['權威投資詐騙', '高', '對權威的信任加上機會導向容易被利用'],
                ['社群投資詐騙', '中', '領導責任感可能被群體投資手法操控'],
                ['高報酬投資詐騙', '中低', '審慎天性會對過高回報保持警戒']
            ]
        },
        '🐭 老鼠型': {
            group: '閃電先鋒 (Lightning Vanguard)',
            role: '警戒偵查員',
            squad: '警戒反應專家',
            description: '恐慌反應型 - 閃電先鋒偵察員，易受驚嚇 ⚠️',
            fullDescription: '你善良且信任他人，但在緊急情況下容易恐慌。損失的恐懼會讓你做出衝動決定，這是詐騙者最愛利用的弱點。',
            specialties: ['遇到緊急威脅時深呼吸冷靜 5 分鐘', '建立緊急情況的確認流程', '找可信任的朋友作為緊急諮詢對象'],
            topFraudRisks: [
                ['緊急威脅詐騙', '高', '信任天性加上恐慌反應容易被緊急情況操控'],
                ['損失恐懼詐騙', '高', '對損失的恐懼可能導致匆忙決定'],
                ['權威詐騙', '中高', '對權威的信任可能被假權威利用']
            ]
        },
        '� 獅子型': {
            group: '閃電先鋒 (Lightning Vanguard)',
            role: '探索先鋒',
            squad: '探索適應專家',
            description: '好奇探索型 - 閃電先鋒探險家，熱愛嘗鮮 ⚠️',
            fullDescription: '你好奇心強且喜歡探索新事物。對機會的敏感和快速行動的習慣，容易讓你成為新型詐騙的目標。',
            specialties: ['新機會要設定「24小時冷靜期」', '建立新事物的安全評估清單', '與經驗豐富的朋友討論再決定'],
            topFraudRisks: [
                ['快速機會詐騙', '高', '對新機會的熱情和即時行動容易被利用'],
                ['高報酬投資詐騙', '中高', '探索天性和機會導向容易被誘惑'],
                ['新型詐騙', '中', '喜歡嘗鮮可能成為新詐騙手法的目標']
            ],
            topFraudRisks: [
                ['快速機會詐騙', '高', '對新機會的熱情和即時行動容易被利用'],
                ['高報酬投資詐騙', '中高', '探索天性和機會導向容易被誘惑'],
                ['新型詐騙', '中', '喜歡嘗鮮可能成為新詐騙手法的目標']
            ]
        },
        '🦌 麋鹿型': {
            group: '閃電先鋒 (Lightning Vanguard)',
            role: '心靈感應師',
            squad: '情感分析專家',
            description: '情感信任型 - 閃電先鋒心靈導師，容易動心 ⚠️',
            fullDescription: '你情感豐富且富有同情心，直覺敏銳但容易被情感操控。這種組合讓你特別容易成為情感詐騙的受害者。',
            specialties: ['涉及感情或金錢時要理性分析', '建立重要決定的朋友諮詢機制', '學習識別情感操控的手法'],
            topFraudRisks: [
                ['情感操控詐騙', '高', '豐富情感和同情心容易被情感手法操控'],
                ['愛情詐騙', '中高', '對愛情的渴望可能被戀愛詐騙利用'],
                ['慈善詐騙', '中', '同情心可能被假慈善組織利用']
            ],
            topFraudRisks: [
                ['情感操控詐騙', '高', '豐富情感和同情心容易被情感手法操控'],
                ['愛情詐騙', '中高', '對愛情的渴望可能被戀愛詐騙利用'],
                ['慈善詐騙', '中', '同情心可能被假慈善組織利用']
            ]
        },
        '� 馬型': {
            group: '閃電先鋒 (Lightning Vanguard)',
            role: '忠誠突擊手',
            squad: '社群防護專家',
            description: '熱情衝動型 - 閃電先鋒突擊隊，義氣為重 ⚠️',
            fullDescription: '你熱情忠誠且重視友情，但衝動的性格加上對朋友的信任，讓你很容易被社群推薦詐騙影響。',
            specialties: ['朋友推薦的投資要獨立研究', '避免群體壓力影響個人判斷', '利用你的社交影響力傳播防詐知識']
        },
        // 修復損壞的動物條目
        '🦁 獅子型': {
            group: '閃電先鋒 (Lightning Vanguard)',
            role: '探索先鋒',
            squad: '探索適應專家',
            description: '好奇探索型 - 閃電先鋒探險家，熱愛嘗鮮 ⚠️',
            fullDescription: '你好奇心強且喜歡探索新事物。對機會的敏感和快速行動的習慣，容易讓你成為新型詐騙的目標。',
            specialties: ['新機會要設定「24小時冷靜期」', '建立新事物的安全評估清單', '與經驗豐富的朋友討論再決定'],
            topFraudRisks: [
                ['快速機會詐騙', '高', '對新機會的熱情和即時行動容易被利用'],
                ['高報酬投資詐騙', '中高', '探索天性和機會導向容易被誘惑'],
                ['新型詐騙', '中', '喜歡嘗鮮可能成為新詐騙手法的目標']
            ]
        },
        '🐎 駿馬型': {
            group: '閃電先鋒 (Lightning Vanguard)',
            role: '忠誠突擊手',
            squad: '社群防護專家',
            description: '熱情衝動型 - 閃電先鋒突擊隊，義氣為重 ⚠️',
            fullDescription: '你熱情忠誠且重視友情，但衝動的性格加上對朋友的信任，讓你很容易被社群推薦詐騙影響。',
            specialties: ['朋友推薦的投資要獨立研究', '避免群體壓力影響個人判斷', '利用你的社交影響力傳播防詐知識'],
            topFraudRisks: [
                ['友情詐騙', '高', '重視友誼和社交關係容易被假友誼利用'],
                ['群組詐騙', '中高', '活躍於社群網路容易被拉入詐騙群組'],
                ['助人詐騙', '中', '樂於助人的天性可能被有心人士利用']
            ]
        }
    };
    return animalDetailsMap[animalName] || {
        group: '閃電先鋒 (Lightning Vanguard)',
        role: '防詐戰士',
        squad: '智慧防詐專家',
        description: '靈活應變型 - 防詐能力正在覺醒中',
        fullDescription: '正在發展獨特的防詐能力，建議多進行測驗以發掘潛能',
        specialties: ['保持學習心態', '理性分析訊息', '謹慎判斷機會'],
        topFraudRisks: ['一般詐騙', '投資詐騙', '情感操控']
    };
};
const getAnimalGroup = (animalResult) => {
    // 根據 Animal.vue 的分組邏輯，從動物名稱或ID推導群組
    const animalId = animalResult.animalId || animalResult.animalName;
    // 四大組織對應邏輯
    // 【深潛分析局】(K-D - 懷疑且審慎)
    if (animalId && (animalId.includes('KDSL') || animalId.includes('狐狸')))
        return '深潛分析局';
    if (animalId && (animalId.includes('KDSR') || animalId.includes('老鷹')))
        return '深潛分析局';
    if (animalId && (animalId.includes('KDGL') || animalId.includes('貓頭鷹')))
        return '深潛分析局';
    if (animalId && (animalId.includes('KDGR') || animalId.includes('鯊魚')))
        return '深潛分析局';
    // 【影襲特攻隊】(K-I - 懷疑但即時)
    if (animalId && (animalId.includes('KISL') || animalId.includes('松鼠')))
        return '影襲特攻隊';
    if (animalId && (animalId.includes('KISR') || animalId.includes('章魚')))
        return '影襲特攻隊';
    if (animalId && (animalId.includes('KIGL') || animalId.includes('貓咪')))
        return '影襲特攻隊';
    if (animalId && (animalId.includes('KIGR') || animalId.includes('狼')))
        return '影襲特攻隊';
    // 【重裝守備隊】(T-D - 信任且審慎)
    if (animalId && (animalId.includes('TDSL') || animalId.includes('烏龜')))
        return '重裝守備隊';
    if (animalId && (animalId.includes('TDSR') || animalId.includes('大象')))
        return '重裝守備隊';
    if (animalId && (animalId.includes('TDGL') || animalId.includes('河馬')))
        return '重裝守備隊';
    if (animalId && (animalId.includes('TDGR') || animalId.includes('金剛')))
        return '重裝守備隊';
    // 【閃電先鋒】(T-I - 信任且即時)
    if (animalId && (animalId.includes('TISL') || animalId.includes('老鼠')))
        return '閃電先鋒';
    if (animalId && (animalId.includes('TISR') || animalId.includes('獅子')))
        return '閃電先鋒';
    if (animalId && (animalId.includes('TIGL') || animalId.includes('麋鹿')))
        return '閃電先鋒';
    if (animalId && (animalId.includes('TIGR') || animalId.includes('駿馬') || animalId.includes('馬')))
        return '閃電先鋒';
    return '未知組織';
};
const getAnimalPersonality = (animalResult) => {
    const animalMeta = ANIMAL_META[animalResult.animalId || animalResult.animalName];
    return animalMeta?.personality || '擁有獨特的防詐能力和個性特質';
};
const getAnimalAxisAnalysis = (animalResult) => {
    const animalMeta = ANIMAL_META[animalResult.animalId || animalResult.animalName];
    return animalMeta?.axisAnalysis || {
        authority: '🤝 平衡態度：在信任與懷疑間保持平衡',
        timing: '⏰ 適中節奏：根據情況調整決策速度',
        style: '🎯 綜合判斷：結合理性分析與直覺感受',
        reward: '⚖️ 平衡考量：在機會與風險間謹慎權衡'
    };
};
const getAnimalLevel = (awareness) => {
    if (awareness >= 85)
        return '精英';
    if (awareness >= 70)
        return '高級';
    if (awareness >= 55)
        return '中級';
    if (awareness >= 40)
        return '初級';
    return '新手';
};
const getAnimalTips = (animalResult) => {
    const animalMeta = ANIMAL_META[animalResult.animalId || animalResult.animalName];
    if (animalMeta?.tips) {
        return animalMeta.tips;
    }
    // 基於動物等級提供通用建議
    const awareness = animalResult.awareness || 50;
    if (awareness >= 80) {
        return [
            '保持現有的高度警覺性',
            '協助身邊的人提升防詐意識',
            '關注最新的詐騙手法趨勢'
        ];
    }
    else if (awareness >= 60) {
        return [
            '加強對新型詐騙手法的認識',
            '遇到可疑情況時多方求證',
            '定期更新防詐知識'
        ];
    }
    else {
        return [
            '提高對常見詐騙的基本認識',
            '建立"慢思考"的習慣',
            '遇到金錢相關要求時務必謹慎'
        ];
    }
};
// AI分析歷史（基於用戶的遊戲記錄和靈魂動物測驗結果）
const smsHistory = computed(() => {
    // 獲取用戶的所有遊戲記錄（不只是錯題記錄）
    let gameRecords = soulAnimalStore.getUserGameRecords ?
        soulAnimalStore.getUserGameRecords(props.currentUser) :
        soulAnimalStore.getUserGameErrors(props.currentUser); // 向後兼容
    const soulAnimalRecords = soulAnimalHistory.value;
    if (!gameRecords || gameRecords.length === 0) {
        return [];
    }
    // 按時間排序遊戲記錄（最早的在前面）
    gameRecords = [...gameRecords].sort((a, b) => {
        const timeA = new Date(a.timestamp.replace(/\//g, '-')).getTime();
        const timeB = new Date(b.timestamp.replace(/\//g, '-')).getTime();
        return timeA - timeB; // 升序排列，最早的在前
    });
    // 將所有遊戲記錄轉換為 AI 分析格式
    const analysisHistory = [];
    gameRecords.forEach((gameRecord, gameIndex) => {
        // 為每一回測驗創建分組標頭
        const gameHeader = {
            id: `game-header-${gameRecord.id}`,
            type: 'game-header',
            isGameHeader: true,
            gameNumber: gameIndex + 1, // 正確的回合編號：第1回、第2回、第3回...
            timestamp: gameRecord.timestamp,
            gameScore: gameRecord.score,
            gameRound: gameRecord.round,
            wrongCount: (gameRecord.wrongAnswers && gameRecord.wrongAnswers.length) || 0,
            mode: gameRecord.mode || 'normal',
            isPerfectRound: (!gameRecord.wrongAnswers || gameRecord.wrongAnswers.length === 0)
        };
        analysisHistory.push(gameHeader);
        // 如果有錯題，顯示錯題分析
        if (gameRecord.wrongAnswers && gameRecord.wrongAnswers.length > 0) {
            gameRecord.wrongAnswers.forEach((wrongItem, index) => {
                // 找到最近的靈魂動物測驗結果作為性格分析基礎
                const latestSoulTest = soulAnimalRecords.length > 0 ? soulAnimalRecords[soulAnimalRecords.length - 1] : null;
                // 根據錯題類型和用戶的靈魂動物特質生成個性化建議
                const personalizedAnalysis = generatePersonalizedAnalysis(wrongItem, latestSoulTest, props.currentUser);
                analysisHistory.push({
                    id: `${gameRecord.id}-${index}`,
                    type: wrongItem.type || getMessageType(wrongItem),
                    content: wrongItem.content,
                    userAnswer: '詐騙', // 用戶選擇了錯誤答案（真實訊息），說明認為是詐騙
                    correctAnswer: '真實',
                    isCorrect: false,
                    timestamp: gameRecord.timestamp,
                    gameScore: gameRecord.score,
                    gameRound: gameRecord.round,
                    gameNumber: gameIndex + 1, // 正確的回合編號
                    questionNumber: index + 1,
                    aiAnalysis: {
                        confidence: 95 + Math.random() * 4, // 95-99%的信心度
                        redFlags: extractRedFlags(wrongItem.content),
                        explanation: personalizedAnalysis,
                        soulAnimalInsight: latestSoulTest ? getSoulAnimalInsight(latestSoulTest.animalResult, wrongItem) : null
                    }
                });
            });
        }
        else {
            // 如果沒有錯題，創建一個完美通關的特殊條目
            analysisHistory.push({
                id: `${gameRecord.id}-perfect`,
                type: 'perfect-round',
                isPerfectRound: true,
                timestamp: gameRecord.timestamp,
                gameScore: gameRecord.score,
                gameRound: gameRecord.round,
                gameNumber: gameIndex + 1, // 正確的回合編號
                aiAnalysis: {
                    confidence: 100,
                    explanation: `🎉 完美表現！在第 ${gameIndex + 1} 回測驗中，您成功識別出所有詐騙訊息，展現了優秀的防詐意識和判斷能力。繼續保持這種警覺性！`,
                    soulAnimalInsight: soulAnimalRecords.length > 0 ? {
                        animalName: soulAnimalRecords[soulAnimalRecords.length - 1].animalResult.animalName,
                        insight: `您的 ${soulAnimalRecords[soulAnimalRecords.length - 1].animalResult.animalName} 特質在這次測驗中發揮了關鍵作用，幫助您準確識別了所有風險。`
                    } : null
                }
            });
        }
    });
    // 按時間倒序排列，最新的在前
    return analysisHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50); // 增加顯示數量到50
});
// ========== 靈魂轉換系統：五維度評估 ==========
// 檢查靈魂是否已覺醒（5次遊戲即可覺醒）
const isSoulAwakened = computed(() => {
    try {
        // 先檢查是否完成了 Quiz 測驗
        const hasQuizResult = soulAnimalStore.getUserRecords ?
            soulAnimalStore.getUserRecords(props.currentUser).length > 0 : false;
        if (!hasQuizResult) {
            return false; // 沒有完成 Quiz 就不可能覺醒
        }
        const gameRecords = soulAnimalStore.getUserGameRecords ?
            soulAnimalStore.getUserGameRecords(props.currentUser) :
            soulAnimalStore.getUserGameErrors(props.currentUser);
        const totalGames = gameRecords ? gameRecords.length : 0;
        // 使用真實的靈魂XP而不是估算
        const realXP = soulSystem.soulXP.value || 0;
        // 開發模式下才輸出覺醒檢查
        if (import.meta.env.DEV) {
            console.log('覺醒檢查:', { hasQuizResult, totalGames, realXP, awakened: totalGames >= 5 });
        }
        // 條件：完成心理測驗 且 遊戲5次以上（移除XP限制）
        return totalGames >= 5;
    }
    catch (error) {
        console.error('isSoulAwakened計算錯誤:', error);
        return false;
    }
});
// 五維度靈魂評估（簡化版本 - 移除心理評分系統）
const soulDimensions = computed(() => {
    try {
        // 先檢查用戶是否完成了 Quiz 測驗
        const hasQuizResult = soulAnimalStore.getUserRecords ?
            soulAnimalStore.getUserRecords(props.currentUser).length > 0 : false;
        if (!hasQuizResult) {
            // 如果沒有完成 Quiz 測驗，返回空的評估
            return [
                { id: 'authority', name: '權威偏好', score: 0, color: 'bg-red-500', description: '需要先完成心理測驗' },
                { id: 'timing', name: '時間習慣', score: 0, color: 'bg-blue-500', description: '需要先完成心理測驗' },
                { id: 'style', name: '溝通風格', score: 0, color: 'bg-green-500', description: '需要先完成心理測驗' },
                { id: 'motivation', name: '獎懲誘惑', score: 0, color: 'bg-yellow-500', description: '需要先完成心理測驗' },
                { id: 'tech', name: '科技適應', score: 0, color: 'bg-purple-500', description: '需要先完成心理測驗' }
            ];
        }
        const gameRecords = soulAnimalStore.getUserGameRecords ?
            soulAnimalStore.getUserGameRecords(props.currentUser) :
            soulAnimalStore.getUserGameErrors(props.currentUser);
        const totalGames = gameRecords ? gameRecords.length : 0;
        // 簡化的靈魂維度評估 - 基於遊戲次數和完成心理測驗狀態
        const baseScore = Math.min(totalGames * 5, 50); // 基礎分數基於遊戲次數
        // 檢查是否完成心理測驗（已經在上面確認過了）
        const quizBonus = 20; // 已完成測驗的加分
        // 如果還沒覺醒，顯示基礎評估分數
        if (!isSoulAwakened.value) {
            return [
                {
                    id: 'authority',
                    name: '權威偏好',
                    score: baseScore + quizBonus,
                    color: 'bg-red-500',
                    description: '累積分數: ' + (baseScore + quizBonus) + ' (含心理測驗加成)'
                },
                {
                    id: 'timing',
                    name: '時間習慣',
                    score: baseScore + quizBonus,
                    color: 'bg-blue-500',
                    description: '累積分數: ' + (baseScore + quizBonus) + ' (含心理測驗加成)'
                },
                {
                    id: 'style',
                    name: '溝通風格',
                    score: baseScore + quizBonus,
                    color: 'bg-green-500',
                    description: '累積分數: ' + (baseScore + quizBonus) + ' (含心理測驗加成)'
                },
                {
                    id: 'motivation',
                    name: '獎懲誘惑',
                    score: baseScore + quizBonus,
                    color: 'bg-yellow-500',
                    description: '累積分數: ' + (baseScore + quizBonus) + ' (含心理測驗加成)'
                },
                {
                    id: 'tech',
                    name: '科技適應',
                    score: baseScore + quizBonus,
                    color: 'bg-purple-500',
                    description: '累積分數: ' + (baseScore + quizBonus) + ' (含心理測驗加成)'
                }
            ];
        }
        // 靈魂覺醒後：動態計算靈魂動物轉換
        // 獲取初始Quiz測驗結果作為基準靈魂動物
        const soulSystem = useSoulAnimalStore();
        // 從靈魂動物系統中獲取當前動物代碼
        const currentAnimalCode = soulSystem.currentAnimalCode?.value || 'TDGR';
        // 將動物代碼轉換為動物名稱（與Animal.vue一致）
        const animalCodeToName = {
            'KDSL': '🦊 狐狸型', 'KDSR': '🦅 老鷹型', 'KDGL': '🦉 貓頭鷹型', 'KDGR': '🦈 鯊魚型',
            'KISL': '🐿️ 松鼠型', 'KISR': '🐙 章魚型', 'KIGL': '🐱 貓咪型', 'KIGR': '🐺 狼型',
            'TDSL': '🐢 烏龜型', 'TDSR': '🐘 大象型', 'TDGL': '🦛 河馬型', 'TDGR': '🦍 金剛型',
            'TISL': '🐭 老鼠型', 'TISR': '🦁 獅子型', 'TIGL': '🦌 麋鹿型', 'TIGR': '🐎 駿馬型'
        };
        const baseAnimal = animalCodeToName[currentAnimalCode] || '🦍 金剛型'; // Quiz測驗的初始動物
        console.log(`🎯 Quiz基準動物: currentAnimalCode=${currentAnimalCode}, baseAnimal=${baseAnimal}`);
        // Quiz測驗動物的初始分數（使用官方區間的中間值作為基準）
        const initialScores = {
            // 【深潛分析局】(K-D - 懷疑且審慎)
            '🦊 狐狸型': { authority: 30, timing: 30, style: 70, motivation: 80, tech: 60 }, // [20-40, 20-40, 60-80, 70-90, 50-70]
            '🦅 老鷹型': { authority: 25, timing: 25, style: 75, motivation: 30, tech: 70 }, // [15-35, 15-35, 65-85, 20-40, 60-80]
            '🦉 貓頭鷹型': { authority: 30, timing: 30, style: 35, motivation: 80, tech: 90 }, // [20-40, 20-40, 25-45, 70-90, 80-100]
            '🦈 鯊魚型': { authority: 25, timing: 25, style: 30, motivation: 30, tech: 93 }, // [15-35, 15-35, 20-40, 20-40, 85-100]
            // 【影襲特攻隊】(K-I - 懷疑但即時)
            '🐿️ 松鼠型': { authority: 30, timing: 70, style: 70, motivation: 80, tech: 50 }, // [20-40, 60-80, 60-80, 70-90, 40-60]
            '🐙 章魚型': { authority: 25, timing: 75, style: 75, motivation: 30, tech: 80 }, // [15-35, 65-85, 65-85, 20-40, 70-90]
            '🐱 貓咪型': { authority: 30, timing: 70, style: 35, motivation: 80, tech: 70 }, // [20-40, 60-80, 25-45, 70-90, 60-80]
            '🐺 狼型': { authority: 25, timing: 75, style: 30, motivation: 30, tech: 90 }, // [15-35, 65-85, 20-40, 20-40, 80-100]
            // 【重裝守備隊】(T-D - 信任且審慎)
            '🐢 烏龜型': { authority: 70, timing: 30, style: 70, motivation: 80, tech: 30 }, // [60-80, 20-40, 60-80, 70-90, 20-40]
            '🐘 大象型': { authority: 75, timing: 25, style: 75, motivation: 30, tech: 40 }, // [65-85, 15-35, 65-85, 20-40, 30-50]
            '🦛 河馬型': { authority: 70, timing: 30, style: 35, motivation: 80, tech: 30 }, // [60-80, 20-40, 25-45, 70-90, 20-40]
            '🦍 金剛型': { authority: 75, timing: 25, style: 30, motivation: 30, tech: 50 }, // [65-85, 15-35, 20-40, 20-40, 40-60]
            // 【閃電先鋒】(T-I - 信任且即時)
            '🐭 老鼠型': { authority: 70, timing: 70, style: 70, motivation: 80, tech: 40 }, // [60-80, 60-80, 60-80, 70-90, 30-50]
            '� 獅子型': { authority: 75, timing: 75, style: 75, motivation: 30, tech: 60 }, // [65-85, 65-85, 65-85, 20-40, 50-70]
            '🦌 麋鹿型': { authority: 70, timing: 70, style: 35, motivation: 80, tech: 50 }, // [60-80, 60-80, 25-45, 70-90, 40-60]
            '� 馬型': { authority: 75, timing: 75, style: 30, motivation: 30, tech: 70 } // [65-85, 65-85, 20-40, 20-40, 60-80]
        };
        // 使用智能動物範圍系統動態生成範圍
        const generateDynamicAnimalRanges = () => {
            // 獲取當前用戶的心理分數
            const currentPsychologyScores = soulSystem.psychologyScores?.value || { authority: 0, timing: 0, style: 0, motivation: 0, tech: 0 };
            console.log('🧠 當前用戶心理分數:', currentPsychologyScores);
            console.log('📊 分數有效性檢查:', {
                authority: currentPsychologyScores.authority > 0,
                timing: currentPsychologyScores.timing > 0,
                style: currentPsychologyScores.style > 0,
                motivation: currentPsychologyScores.motivation > 0,
                tech: currentPsychologyScores.tech > 0
            });
            // 如果有有效的心理分數，使用動態調整
            if (currentPsychologyScores.authority > 0 || currentPsychologyScores.timing > 0 ||
                currentPsychologyScores.style > 0 || currentPsychologyScores.motivation > 0 || currentPsychologyScores.tech > 0) {
                console.log('🎯 使用智能動物範圍系統，基於用戶分數動態調整');
                console.log('🔄 調用 adjustRangesForUser，傳入分數:', currentPsychologyScores);
                return smartRangeSystem.adjustRangesForUser(currentPsychologyScores);
            }
            else {
                console.log('📊 使用標準動物範圍系統');
                return smartRangeSystem.generateOptimalRanges();
            }
        };
        // 動態獲取動物範圍
        const animalRanges = generateDynamicAnimalRanges();
        // 計算當前實際的五維度分數（按階段性演化規則）
        const calculateCurrentScores = () => {
            // 從Quiz基準動物的區間中間值開始
            const baseScores = initialScores[baseAnimal] || initialScores['🦍 金剛型'];
            console.log(`📊 開始計算五維度演變: 基準動物=${baseAnimal}, 遊戲次數=${totalGames}次`, baseScores);
            // === 階段1: 前5次遊戲（未覺醒期）===
            if (totalGames < 5) {
                console.log(`📊 階段1: 前5次遊戲期（${totalGames}/5），返回基準分數`);
                return baseScores; // 直接返回心理測驗的中間值，無任何變化
            }
            // === 階段2: 第5-6次遊戲（覺醒控制期）===
            if (totalGames <= 6) {
                console.log(`📊 階段2: 覺醒控制期（第${totalGames}次遊戲）`);
                // *** 修正：獲取靈魂系統中累積的真實心理分數 ***
                const currentPsychologyScores = soulSystem.psychologyScores?.value || { authority: 0, timing: 0, style: 0, motivation: 0, tech: 0 };
                console.log(`📊 靈魂系統中累積的心理分數:`, currentPsychologyScores);
                // 計算累積分數的平均調整值（限制在±5範圍內）
                const maxAdjustment = 5;
                const adjustedScores = {};
                // 使用智能動物範圍系統獲取當前範圍
                const animalRanges = generateDynamicAnimalRanges();
                const currentAnimalRange = animalRanges[baseAnimal];
                // 安全檢查：如果動物範圍不存在，使用預設範圍
                if (!currentAnimalRange) {
                    console.warn(`⚠️ 無法找到動物範圍: ${baseAnimal}，使用基準分數`);
                    return baseScores;
                }
                // 將累積的心理分數轉換為五維度分數調整
                Object.keys(baseScores).forEach(dim => {
                    const baseScore = baseScores[dim];
                    let adjustment = 0;
                    if (dim === 'tech') {
                        // 科技維度使用科技等級
                        const techLevel = soulSystem.techLevel?.value || 1;
                        adjustment = (techLevel - 1) * 2; // 每級+2分
                    }
                    else {
                        // 心理維度使用累積的心理分數，縮放到±5範圍
                        const psychKey = dim === 'style' ? 'style' : dim; // style對應style
                        const cumulativeScore = currentPsychologyScores[psychKey] || 0;
                        adjustment = Math.max(-maxAdjustment, Math.min(maxAdjustment, cumulativeScore / 5)); // 除以5來縮放
                    }
                    // 應用調整值但確保不超出該動物的官方區間
                    const [min, max] = currentAnimalRange[dim];
                    adjustedScores[dim] = Math.max(min, Math.min(max, baseScore + adjustment));
                    console.log(`  ${dim}: ${baseScore} + ${adjustment.toFixed(2)} = ${adjustedScores[dim].toFixed(2)} (限制在[${min}-${max}])`);
                });
                console.log(`📊 階段2調整結果:`, adjustedScores);
                return adjustedScores;
            }
            // === 階段3: 第7次遊戲後（自由演化期）===
            console.log(`📊 階段3: 自由演化期（第${totalGames}次遊戲）`);
            // *** 修正：使用靈魂系統中累積的真實心理分數進行自由演化 ***
            const currentPsychologyScores = soulSystem.psychologyScores?.value || { authority: 0, timing: 0, style: 0, motivation: 0, tech: 0 };
            const techLevel = soulSystem.techLevel?.value || 1;
            console.log(`📊 靈魂系統累積分數:`, currentPsychologyScores);
            console.log(`📊 科技等級:`, techLevel);
            // 從基準分數開始，應用累積的心理分數影響
            let evolvedScores = { ...baseScores };
            // 將累積的心理分數轉換為演化分數
            Object.keys(evolvedScores).forEach(dim => {
                const baseScore = baseScores[dim];
                let totalEvolution = 0;
                if (dim === 'tech') {
                    // 科技維度基於科技等級
                    totalEvolution = (techLevel - 1) * 3; // 每級+3分，影響較大
                }
                else {
                    // 心理維度基於累積的心理分數
                    const psychKey = dim === 'style' ? 'style' : dim;
                    const cumulativeScore = currentPsychologyScores[psychKey] || 0;
                    totalEvolution = cumulativeScore / 3; // 縮放係數，讓影響適中
                }
                // 應用演化（只有0-100的絕對限制）
                evolvedScores[dim] = Math.max(0, Math.min(100, baseScore + totalEvolution));
                console.log(`  ${dim}: ${baseScore} + ${totalEvolution.toFixed(2)} = ${evolvedScores[dim].toFixed(2)}`);
            });
            console.log(`📊 最終自由演化結果:`, evolvedScores);
            return evolvedScores;
        };
        // 計算實際演變的分數
        const currentScores = calculateCurrentScores();
        // 根據演變後的分數判斷最適合的靈魂動物（純基於區間匹配）
        const determineCurrentAnimal = (scores) => {
            console.log(`🎯 開始動物匹配分析，當前分數:`, scores);
            // 使用智能動物範圍系統獲取動態範圍
            const animalRanges = generateDynamicAnimalRanges();
            // 使用智能系統直接獲取最佳匹配動物
            const bestMatchAnimal = smartRangeSystem.getAnimalForScores(scores, animalRanges);
            if (bestMatchAnimal) {
                console.log(`🦁 智能系統推薦動物: ${bestMatchAnimal}`);
                return bestMatchAnimal;
            }
            let bestMatch = baseAnimal;
            let bestScore = Infinity; // 使用最小距離匹配
            let perfectMatches = []; // 記錄完全匹配的動物
            // 遍歷所有動物的標準區間，找到最匹配的
            Object.entries(animalRanges).forEach(([animal, ranges]) => {
                // 計算分數與該動物區間的距離
                let totalDistance = 0;
                let perfectDimensions = 0; // 完全匹配的維度數
                const checkDistance = (score, range, dimensionName) => {
                    const [min, max] = range;
                    let distance = 0;
                    if (score < min) {
                        distance = min - score; // 低於區間下限的距離
                    }
                    else if (score > max) {
                        distance = score - max; // 高於區間上限的距離
                    }
                    else {
                        // 在區間內，距離為0（完美匹配）
                        distance = 0;
                        perfectDimensions++;
                    }
                    console.log(`   ${animal} ${dimensionName}: ${score} vs [${min}-${max}] = 距離${distance}`);
                    return distance;
                };
                totalDistance += checkDistance(scores.authority, ranges.authority, '權威');
                totalDistance += checkDistance(scores.timing, ranges.timing, '時間');
                totalDistance += checkDistance(scores.style, ranges.style, '溝通');
                totalDistance += checkDistance(scores.motivation, ranges.motivation, '獎懲');
                totalDistance += checkDistance(scores.tech, ranges.tech, '科技');
                console.log(`🎯 ${animal} 總距離: ${totalDistance}, 完美匹配維度: ${perfectDimensions}/5`);
                // 如果完全匹配（所有5個維度都在區間內）
                if (perfectDimensions === 5) {
                    perfectMatches.push(animal);
                    console.log(`🏆 完美匹配發現: ${animal}`);
                }
                // 距離越小，匹配度越高
                if (totalDistance < bestScore) {
                    bestScore = totalDistance;
                    bestMatch = animal;
                }
            });
            // 如果有完美匹配，優先選擇第一個（維持穩定性）
            if (perfectMatches.length > 0) {
                console.log(`🌟 發現 ${perfectMatches.length} 個完美匹配，選擇: ${perfectMatches[0]}`);
                return perfectMatches[0];
            }
            console.log(`🏆 最佳距離匹配: ${bestMatch} (總距離: ${bestScore})`);
            return bestMatch;
        };
        const currentAnimal = determineCurrentAnimal(currentScores);
        console.log(`🧮 當前計算結果:`, {
            baseAnimal,
            currentScores,
            currentAnimal,
            totalGames
        });
        // 檢查並記錄靈魂動物轉換（按階段控制）
        const checkAndRecordTransformation = () => {
            const currentUserAnimal = soulSystem.getUserSoulAnimal(props.currentUser);
            console.log(`🔍 轉換檢查: 記錄中的動物=${currentUserAnimal}, 計算出的動物=${currentAnimal}, 遊戲次數=${totalGames}`);
            // === 階段1: 前5次遊戲（未覺醒期）===
            if (totalGames < 5) {
                console.log(`🌙 未覺醒期: ${totalGames}/5 次遊戲，無動物設定`);
                return; // 不設定任何動物
            }
            // === 階段2: 第5次遊戲（首次覺醒）===
            if (totalGames === 5) {
                if (!currentUserAnimal) {
                    console.log(`🌟 首次靈魂覺醒: 設定為心理測驗結果 ${baseAnimal}`);
                    soulSystem.updateUserSoulAnimal(props.currentUser, baseAnimal);
                    // 記錄覺醒事件
                    const awakeningRecord = {
                        fromAnimal: null,
                        toAnimal: baseAnimal,
                        reason: '心理測驗靈魂覺醒',
                        date: new Date().toLocaleDateString(),
                        time: new Date().toLocaleTimeString(),
                        scores: currentScores,
                        phase: 'awakening'
                    };
                    soulSystem.addTransformHistory(props.currentUser, awakeningRecord);
                    console.log('✅ 覺醒記錄已添加:', awakeningRecord);
                }
                return;
            }
            // === 階段3: 第6次遊戲（覺醒調整期）===
            if (totalGames === 6) {
                // 確保用戶有初始動物設定
                if (!currentUserAnimal) {
                    console.log(`🔄 補設定初始動物: ${baseAnimal}`);
                    soulSystem.updateUserSoulAnimal(props.currentUser, baseAnimal);
                }
                console.log(`🎯 覺醒調整期: 維持心理測驗動物 ${baseAnimal}，數值微調中...`);
                // 第6次不進行動物轉換，只是數值調整
                return;
            }
            // === 階段4: 第7次遊戲後（自由演化期）===
            if (totalGames >= 7) {
                // 確保用戶有初始動物設定
                if (!currentUserAnimal) {
                    console.log(`🔄 補設定初始動物: ${baseAnimal} → 立即檢查轉換到 ${currentAnimal}`);
                    soulSystem.updateUserSoulAnimal(props.currentUser, baseAnimal);
                    // 如果計算出的動物與基準動物不同，立即轉換
                    if (baseAnimal !== currentAnimal) {
                        const transformRecord = {
                            fromAnimal: baseAnimal,
                            toAnimal: currentAnimal,
                            reason: `${totalGames}次遊戲累積效果觸發轉換`,
                            date: new Date().toLocaleDateString(),
                            time: new Date().toLocaleTimeString(),
                            scores: currentScores,
                            phase: 'free-evolution'
                        };
                        soulSystem.updateUserSoulAnimal(props.currentUser, currentAnimal);
                        soulSystem.addTransformHistory(props.currentUser, transformRecord);
                        console.log('✅ 立即轉換記錄已添加:', transformRecord);
                    }
                    return;
                }
                // 正常自由演化轉換邏輯
                if (currentUserAnimal !== currentAnimal) {
                    console.log(`🔄 自由演化轉換: ${currentUserAnimal} → ${currentAnimal}`);
                    // 記錄轉換歷史
                    const transformRecord = {
                        fromAnimal: currentUserAnimal,
                        toAnimal: currentAnimal,
                        reason: `五維度分數變化觸發轉換 (遊戲${totalGames}次)`,
                        date: new Date().toLocaleDateString(),
                        time: new Date().toLocaleTimeString(),
                        scores: currentScores,
                        phase: 'free-evolution'
                    };
                    // 更新用戶的靈魂動物
                    soulSystem.updateUserSoulAnimal(props.currentUser, currentAnimal);
                    // 添加到轉換歷史
                    soulSystem.addTransformHistory(props.currentUser, transformRecord);
                    console.log('✅ 轉換記錄已添加:', transformRecord);
                }
                else {
                    console.log(`✅ 動物未改變，維持: ${currentUserAnimal}`);
                }
            }
        };
        // 執行轉換檢查
        checkAndRecordTransformation();
        // 獲取實際顯示的動物（轉換檢查後的最新狀態）
        const finalDisplayAnimal = soulSystem.getUserSoulAnimal(props.currentUser) || baseAnimal;
        console.log(`📊 顯示邏輯: 記錄動物=${soulSystem.getUserSoulAnimal(props.currentUser)}, 基準動物=${baseAnimal}, 計算動物=${currentAnimal}, 最終顯示=${finalDisplayAnimal}`);
        return [
            {
                id: 'authority',
                name: '權威偏好',
                score: Math.round(currentScores.authority),
                color: 'bg-red-500',
                description: `${Math.round(currentScores.authority)}分 - 靈魂轉換評估: ${currentScores.authority > 60 ? '高度信任權威機構和專家意見' : currentScores.authority < 40 ? '質疑權威，傾向獨立思考判斷' : '對權威保持適度信任和理性懷疑'}`
            },
            {
                id: 'timing',
                name: '時間習慣',
                score: Math.round(currentScores.timing),
                color: 'bg-blue-500',
                description: `${Math.round(currentScores.timing)}分 - 靈魂轉換評估: ${currentScores.timing > 60 ? '偏好快速決策和即時行動' : currentScores.timing < 40 ? '偏好深思熟慮，謹慎做決定' : '在即時反應和審慎思考間取得平衡'}`
            },
            {
                id: 'style',
                name: '溝通風格',
                score: Math.round(currentScores.style),
                color: 'bg-green-500',
                description: `${Math.round(currentScores.style)}分 - 靈魂轉換評估: ${currentScores.style > 60 ? '注重細節分析和具體事實' : currentScores.style < 40 ? '依賴直覺判斷和整體感受' : '能靈活運用直覺和邏輯分析'}`
            },
            {
                id: 'motivation',
                name: '獎懲誘惑',
                score: Math.round(currentScores.motivation),
                color: 'bg-yellow-500',
                description: `${Math.round(currentScores.motivation)}分 - 靈魂轉換評估: ${currentScores.motivation > 60 ? '風險厭惡，重視損失防範' : currentScores.motivation < 40 ? '積極追求機會和潛在收益' : '在風險和收益間尋求平衡'}`
            },
            {
                id: 'tech',
                name: '科技適應',
                score: Math.round(currentScores.tech),
                color: 'bg-purple-500',
                description: `${Math.round(currentScores.tech)}分 - 靈魂轉換評估: ${currentScores.tech > 60 ? '積極擁抱新科技和數位工具' : currentScores.tech < 40 ? '偏好傳統方式，對科技較為保守' : '對科技持開放但謹慎的態度'}`
            }
        ];
    }
    catch (error) {
        console.error('soulDimensions計算錯誤:', error);
        return [
            { id: 'authority', name: '權威偏好', score: 0, color: 'bg-red-500', description: '計算錯誤' },
            { id: 'timing', name: '時間習慣', score: 0, color: 'bg-blue-500', description: '計算錯誤' },
            { id: 'style', name: '溝通風格', score: 0, color: 'bg-green-500', description: '計算錯誤' },
            { id: 'motivation', name: '獎懲誘惑', score: 0, color: 'bg-yellow-500', description: '計算錯誤' },
            { id: 'tech', name: '科技適應', score: 0, color: 'bg-purple-500', description: '計算錯誤' }
        ];
    }
});
// 靈魂動物轉換預測（只有在覺醒後才顯示）- 基於五維度區間匹配
const transformPredictions = computed(() => {
    // 必須先覺醒才能看到轉換預測
    if (!isSoulAwakened.value) {
        return [];
    }
    const dimensions = soulDimensions.value;
    const authority = dimensions.find(d => d.id === 'authority')?.score || 50;
    const timing = dimensions.find(d => d.id === 'timing')?.score || 50;
    const style = dimensions.find(d => d.id === 'style')?.score || 50;
    const motivation = dimensions.find(d => d.id === 'motivation')?.score || 50;
    const tech = dimensions.find(d => d.id === 'tech')?.score || 50;
    console.log(`🎯 轉換預測分析 - 當前五維度:`, { authority, timing, style, motivation, tech });
    // 定義16種動物的五維度特徵範圍（與官方轉換分數列表一致）
    const animalProfiles = {
        // 【深潛分析局】(K-D - 懷疑且審慎)
        '狐狸': { emoji: '🦊', code: 'KDSL', authority: [10, 35], timing: [10, 35], style: [65, 90], motivation: [75, 100], tech: [40, 70] },
        '老鷹': { emoji: '🦅', code: 'KDSR', authority: [5, 30], timing: [5, 30], style: [70, 95], motivation: [10, 35], tech: [60, 85] },
        '貓頭鷹': { emoji: '🦉', code: 'KDGL', authority: [15, 40], timing: [15, 40], style: [10, 35], motivation: [80, 100], tech: [75, 100] },
        '鯊魚': { emoji: '🦈', code: 'KDGR', authority: [0, 25], timing: [0, 25], style: [5, 30], motivation: [0, 25], tech: [85, 100] },
        // 【影襲特攻隊】(K-I - 懷疑但即時)
        '松鼠': { emoji: '🐿️', code: 'KISL', authority: [15, 40], timing: [65, 90], style: [15, 40], motivation: [80, 100], tech: [25, 50] },
        '章魚': { emoji: '🐙', code: 'KISR', authority: [10, 35], timing: [75, 100], style: [65, 90], motivation: [5, 30], tech: [20, 45] },
        '貓咪': { emoji: '🐱', code: 'KIGL', authority: [20, 45], timing: [60, 85], style: [20, 45], motivation: [75, 100], tech: [30, 55] },
        '狼': { emoji: '🐺', code: 'KIGR', authority: [5, 30], timing: [70, 95], style: [60, 85], motivation: [70, 95], tech: [15, 40] },
        // 【重裝守備隊】(T-D - 信任且審慎)
        '烏龜': { emoji: '🐢', code: 'TDSL', authority: [65, 90], timing: [20, 45], style: [55, 80], motivation: [65, 90], tech: [0, 25] },
        '大象': { emoji: '🐘', code: 'TDSR', authority: [80, 100], timing: [85, 100], style: [0, 25], motivation: [45, 70], tech: [55, 80] },
        '河馬': { emoji: '🦛', code: 'TDGL', authority: [60, 85], timing: [15, 40], style: [40, 65], motivation: [60, 85], tech: [10, 35] },
        '金剛': { emoji: '🦍', code: 'TDGR', authority: [70, 95], timing: [25, 50], style: [50, 75], motivation: [35, 60], tech: [5, 30] },
        // 【閃電先鋒】(T-I - 信任且即時)
        '老鼠': { emoji: '🐭', code: 'TISL', authority: [55, 80], timing: [10, 35], style: [35, 60], motivation: [55, 80], tech: [15, 40] },
        '獅子': { emoji: '🦁', code: 'TISR', authority: [75, 100], timing: [80, 100], style: [75, 100], motivation: [85, 100], tech: [50, 75] },
        '麋鹿': { emoji: '🦌', code: 'TIGL', authority: [50, 75], timing: [55, 80], style: [45, 70], motivation: [50, 75], tech: [35, 60] },
        '馬': { emoji: '🐎', code: 'TIGR', authority: [85, 100], timing: [90, 100], style: [25, 50], motivation: [65, 90], tech: [70, 95] }
    };
    // 計算每種動物的區間匹配度（基於距離）
    const predictions = Object.entries(animalProfiles).map(([animalName, profile]) => {
        // 計算與該動物區間的總距離
        let totalDistance = 0;
        let perfectMatches = 0; // 完美匹配的維度數
        const dimensions_scores = [
            { score: authority, range: profile.authority, name: '權威' },
            { score: timing, range: profile.timing, name: '時間' },
            { score: style, range: profile.style, name: '溝通' },
            { score: motivation, range: profile.motivation, name: '獎懲' },
            { score: tech, range: profile.tech, name: '科技' }
        ];
        dimensions_scores.forEach(({ score, range, name }) => {
            const [min, max] = range;
            let distance = 0;
            if (score < min) {
                distance = min - score;
            }
            else if (score > max) {
                distance = score - max;
            }
            else {
                perfectMatches++; // 在區間內，完美匹配
            }
            totalDistance += distance;
        });
        // 計算適合度分數（反距離，距離越小分數越高）
        const maxPossibleDistance = 100 * 5; // 每個維度最大距離100，共5個維度
        const matchScore = Math.max(0, 100 - (totalDistance / maxPossibleDistance * 100));
        console.log(`   ${animalName}: 總距離=${totalDistance}, 完美匹配=${perfectMatches}/5, 適合度=${matchScore.toFixed(1)}%`);
        return {
            animal: animalName,
            emoji: profile.emoji,
            code: profile.code,
            distance: totalDistance,
            perfectMatches: perfectMatches,
            suitability: Math.round(matchScore * 100) / 100
        };
    });
    // 按適合度排序（距離越小，完美匹配越多，適合度越高）
    const sortedPredictions = predictions
        .sort((a, b) => {
        // 首先按完美匹配數排序
        if (b.perfectMatches !== a.perfectMatches) {
            return b.perfectMatches - a.perfectMatches;
        }
        // 然後按距離排序（距離越小越好）
        return a.distance - b.distance;
    })
        .slice(0, 5) // 取前5名
        .map(p => ({
        animal: p.animal,
        emoji: p.emoji,
        probability: p.suitability,
        perfectMatches: p.perfectMatches
    }));
    console.log(`🏆 轉換預測結果:`, sortedPredictions);
    return sortedPredictions;
});
// 輔助函數：檢查數值是否在範圍內
const isInRange = (value, range) => {
    return value >= range[0] && value <= range[1];
};
// 轉換建議（覺醒後才顯示）
const transformSuggestions = computed(() => {
    if (!isSoulAwakened.value) {
        return [];
    }
    const dimensions = soulDimensions.value;
    const suggestions = [];
    dimensions.forEach(dimension => {
        let advice = '';
        let action = '';
        switch (dimension.id) {
            case 'authority':
                if (dimension.score < 40) {
                    advice = '您對權威機構保持高度警戒，這很好，但也要學會識別真實官方訊息';
                    action = '建議：學習官方機構的正確聯絡方式和特徵';
                }
                else if (dimension.score > 70) {
                    advice = '您比較信任權威，但要小心詐騙分子冒充官方機構';
                    action = '建議：提升對假冒官方詐騙的識別能力';
                }
                else {
                    advice = '您在權威認知上保持良好平衡';
                    action = '建議：繼續維持這種理性的權威認知態度';
                }
                break;
            case 'timing':
                if (dimension.score < 40) {
                    advice = '您容易受到緊急訊息影響，這是詐騙分子常用的手法';
                    action = '建議：遇到緊急訊息時，先冷靜3分鐘再做決定';
                }
                else if (dimension.score > 70) {
                    advice = '您習慣慢思考，這有助於防詐，但也要注意真實緊急情況';
                    action = '建議：建立緊急情況的判斷標準';
                }
                else {
                    advice = '您在時間反應上保持很好的平衡';
                    action = '建議：繼續保持這種穩健的決策節奏';
                }
                break;
            case 'style':
                if (dimension.score < 40) {
                    advice = '您習慣口語化交流，要小心詐騙分子模仿非正式語調';
                    action = '建議：注意識別過於親近的詐騙話術';
                }
                else if (dimension.score > 70) {
                    advice = '您偏好正式溝通，但要小心詐騙分子偽裝的正式語調';
                    action = '建議：學會從內容實質判斷訊息真偽';
                }
                else {
                    advice = '您對不同溝通風格都能適應';
                    action = '建議：繼續保持這種靈活的溝通判斷能力';
                }
                break;
            case 'motivation':
                if (dimension.score < 40) {
                    advice = '您容易被獎勵誘惑，需要提升對優惠陷阱的警覺';
                    action = '建議：建立"天下沒有免費午餐"的心態';
                }
                else if (dimension.score > 70) {
                    advice = '您對獎懲誘惑有很好的抵抗力，但也要避免過度懷疑真實優惠';
                    action = '建議：學會從可信管道驗證優惠真實性';
                }
                else {
                    advice = '您在獎懲評估上表現均衡';
                    action = '建議：繼續保持這種理性的誘惑判斷能力';
                }
                break;
            case 'tech':
                if (dimension.score < 40) {
                    advice = '您對科技應用較為保守，這能避免部分科技詐騙';
                    action = '建議：學習基本的科技安全知識';
                }
                else if (dimension.score > 70) {
                    advice = '您對科技接受度高，但要小心新型科技詐騙';
                    action = '建議：提升對釣魚網站、假APP等的識別能力';
                }
                else {
                    advice = '您在科技適應上保持良好平衡';
                    action = '建議：繼續保持謹慎而開放的科技態度';
                }
                break;
        }
        suggestions.push({
            dimension: dimension.name,
            advice,
            action
        });
    });
    return suggestions;
});
// 轉換歷史（只有在覺醒後且發生過轉換才顯示）
const transformHistory = computed(() => {
    // 必須先覺醒才可能有轉換歷史
    if (!isSoulAwakened.value) {
        return [];
    }
    // 從靈魂動物系統獲取用戶專屬的轉換歷史
    try {
        const soulSystem = useSoulAnimalStore();
        const userHistory = soulSystem.getUserTransformHistory(props.currentUser) || [];
        console.log(`📚 載入用戶 ${props.currentUser} 的轉換歷史:`, userHistory);
        // 轉換為顯示格式
        return userHistory.map(record => ({
            date: `${record.date} ${record.time}`,
            animal: record.toAnimal,
            emoji: getAnimalEmoji(record.toAnimal),
            reason: record.reason,
            fromAnimal: record.fromAnimal
        }));
    }
    catch (error) {
        console.error('Failed to load transform history:', error);
        return [];
    }
});
// 獲取動物表情符號
const getAnimalEmoji = (animalNameOrCode) => {
    // 如果是動物名稱，直接映射
    const nameEmojiMap = {
        '狐狸': '🦊',
        '老鷹': '🦅',
        '貓頭鷹': '🦉',
        '鯊魚': '🦈',
        '松鼠': '🐿️',
        '章魚': '🐙',
        '貓咪': '🐱',
        '狼': '🐺',
        '烏龜': '🐢',
        '大象': '🐘',
        '河馬': '🦛',
        '金剛': '🦍',
        '老鼠': '🐭',
        '水獺': '🦦',
        '麋鹿': '🦌',
        '柴犬': '🐕'
    };
    // 如果是代碼，轉換成名稱後映射
    const codeEmojiMap = {
        'KDSL': '🦊', // 狐狸
        'KDSR': '🦅', // 鷹
        'KDGL': '🦉', // 貓頭鷹  
        'KDGR': '🦈', // 鯊魚
        'KISL': '🐿️', // 松鼠
        'KISR': '🐙', // 章魚
        'KIGL': '🐱', // 貓
        'KIGR': '🐺', // 狼
        'TDSL': '🐢', // 烏龜
        'TDSR': '🐘', // 大象
        'TDGL': '🦛', // 河馬
        'TDGR': '🦍', // 大猩猩
        'TISL': '🐭', // 老鼠
        'TISR': '🦁', // 獅子
        'TIGL': '🦌', // 鹿
        'TIGR': '🐎' // 馬
    };
    return nameEmojiMap[animalNameOrCode] || codeEmojiMap[animalNameOrCode] || '🐾';
};
// 根據簡訊內容或 type 屬性判斷訊息類型
const getMessageType = (wrongItem) => {
    // 優先使用訊息自帶的 type 屬性
    if (wrongItem.type) {
        return wrongItem.type;
    }
    // 如果沒有 type 屬性，則根據內容判斷（備用方案）
    const content = wrongItem.content || '';
    if (content.includes('銀行') || content.includes('帳戶') || content.includes('ATM'))
        return '金融機構';
    if (content.includes('政府') || content.includes('法院') || content.includes('警察'))
        return '政府機構';
    if (content.includes('購物') || content.includes('訂單') || content.includes('退款') || content.includes('宅配'))
        return '電商／物流平台';
    if (content.includes('貸款') || content.includes('借錢') || content.includes('利率'))
        return '假冒貸款／借款服務';
    if (content.includes('優惠') || content.includes('折扣') || content.includes('免費') || content.includes('促銷'))
        return '獎勵優惠';
    if (content.includes('交友') || content.includes('約會') || content.includes('聊天'))
        return '社交詐騙';
    if (content.includes('家人') || content.includes('朋友') || content.includes('急用'))
        return '親友詐騙';
    if (content.includes('中獎') || content.includes('抽獎') || content.includes('獎品'))
        return '假冒中獎／獎勵／優惠';
    if (content.includes('投資') || content.includes('股票') || content.includes('賺錢'))
        return '投資詐騙';
    if (content.includes('法務') || content.includes('違法') || content.includes('罰款'))
        return '法務詐騙';
    return '其他類型';
};
// 提取真實訊息特徵
const extractRedFlags = (content) => {
    const flags = [];
    if (content.includes('官方') || content.includes('正式') || content.includes('合法')) {
        flags.push('具有官方或正式機構特徵');
    }
    if (content.includes('聯絡電話') || content.includes('客服專線') || content.includes('官方網站')) {
        flags.push('提供正確的官方聯絡方式');
    }
    if (content.includes('個人資料保護') || content.includes('隱私政策') || content.includes('安全提醒')) {
        flags.push('包含隱私保護和安全提醒');
    }
    if (content.includes('詳情請洽') || content.includes('如有疑問') || content.includes('客服查詢')) {
        flags.push('提供適當的查詢管道');
    }
    if (content.includes('本訊息為系統發送') || content.includes('請勿回覆') || content.includes('自動發送')) {
        flags.push('明確標示為系統自動發送');
    }
    if (content.includes('感謝您的配合') || content.includes('祝您順心') || content.includes('謝謝')) {
        flags.push('使用適當的禮貌用語');
    }
    return flags.length > 0 ? flags : ['具有真實訊息的典型特徵'];
};
// 基於靈魂動物特質的個性化分析
const generatePersonalizedAnalysis = (wrongItem, soulTest, username) => {
    if (!soulTest) {
        return `親愛的 ${username}，這是一則真實的訊息，但您誤判為詐騙。${wrongItem.explanation || '建議在判斷時要更仔細分析訊息特徵。'}`;
    }
    const animalName = soulTest.animalResult.animalName || '特務';
    const awareness = soulTest.animalResult.awareness || 50;
    let personalizedAdvice = `根據您的 ${animalName} 特質分析：\n\n`;
    // 根據不同動物特質給出針對性建議
    switch (animalName) {
        case '狐狸 (Fox)':
            personalizedAdvice += `您的警覺性很高，但有時可能過度謹慎。這則真實訊息被您誤判為詐騙，可能是因為您對新機會保持高度警戒。建議：學會區分真實機會和詐騙陷阱的細微差別。`;
            break;
        case '烏龜 (Turtle)':
            personalizedAdvice += `您的謹慎個性讓您對所有訊息都保持懷疑，這是好的防詐態度。但這次誤判了真實訊息，建議：學會識別官方訊息的真實特徵，如正確的聯絡方式和網址。`;
            break;
        case '狗 (Dog)':
            personalizedAdvice += `您重視安全，但有時可能因為過度保護而錯失真實訊息。建議：學會從可信來源驗證訊息真實性，而不是一概拒絕。`;
            break;
        case '貓 (Cat)':
            personalizedAdvice += `您的直覺通常很準，但這次可能被某些表面特徵誤導。這則真實訊息有您認為可疑的元素，建議：深入分析訊息的完整脈絡。`;
            break;
        case '貓頭鷹 (Owl)':
            personalizedAdvice += `您善於分析，但可能在某些細節上過度解讀。這則真實訊息被誤判，建議：平衡理性分析和實際情況，避免過度懷疑。`;
            break;
        case '松鼠 (Squirrel)':
            personalizedAdvice += `您對金融安全的重視讓您對相關訊息高度警戒，但這次誤判了真實通知。建議：學會識別真實金融機構的正確聯絡方式。`;
            break;
        case '鯊魚 (Shark)':
            personalizedAdvice += `您的決斷力強，但有時快速判斷可能導致誤判。建議：在做決定前花一點時間驗證訊息來源的真實性。`;
            break;
        case '老鼠 (Mouse)':
            personalizedAdvice += `您的觀察力敏銳，但可能對某些表面特徵過度敏感。建議：結合多個判斷標準，而不只依賴單一可疑點。`;
            break;
        case '章魚 (Octopus)':
            personalizedAdvice += `您的多元思考有時會讓您想得過於複雜。這則真實訊息被過度分析而誤判，建議：有時簡單直接的判斷反而更準確。`;
            break;
        case '鴿子 (Dove)':
            personalizedAdvice += `您的謹慎是美德，但要學會在保護自己和接受真實訊息間找到平衡。建議：建立可靠的驗證管道來確認訊息真實性。`;
            break;
        default:
            personalizedAdvice += `這則真實訊息被誤判為詐騙，建議加強對真實訊息特徵的識別能力。`;
    }
    // 根據防詐意識等級給出額外建議
    if (awareness < 50) {
        personalizedAdvice += `\n\n您目前的防詐意識為 ${awareness}，適度的懷疑是好的，但也要學會識別真實訊息。`;
    }
    else if (awareness < 70) {
        personalizedAdvice += `\n\n您的防詐意識為 ${awareness}，已有良好的警覺性，現在需要提升判斷的精確度。`;
    }
    else {
        personalizedAdvice += `\n\n您的防詐意識為 ${awareness}，屬於高警覺群體，但要避免因過度警戒而錯失真實訊息。`;
    }
    return personalizedAdvice;
};
// 靈魂動物特質洞察
const getSoulAnimalInsight = (animalResult, wrongItem) => {
    return {
        animalName: animalResult.animalName,
        awareness: animalResult.awareness,
        vulnerability: animalResult.topFraudRisks?.[0] ? animalFraudLabelMap[animalResult.topFraudRisks[0][0]] : '未知風險',
        strengthTip: `發揮您的 ${animalResult.animalName} 特質優勢，加強防詐判斷力`
    };
};
// 載入用戶的靈魂動物記錄
const loadSoulAnimalRecords = () => {
    soulAnimalHistory.value = soulAnimalStore.getUserRecords(props.currentUser);
    // 簡化記錄輸出
    if (import.meta.env.DEV && soulAnimalHistory.value.length > 0) {
        console.log(`載入用戶記錄: ${soulAnimalHistory.value.length} 筆`);
    }
};
// 當前顯示的靈魂動物（優先使用轉換系統的記錄，並確保與五維度計算同步）
const currentDisplayAnimal = computed(() => {
    // 先檢查用戶是否完成了 Quiz 測驗
    const hasQuizResult = soulAnimalStore.getUserRecords ?
        soulAnimalStore.getUserRecords(props.currentUser).length > 0 : false;
    if (!hasQuizResult) {
        // 如果沒有完成 Quiz 測驗，返回 null 表示沒有靈魂動物
        console.log(`🚫 用戶 ${props.currentUser} 尚未完成心理測驗`);
        return null;
    }
    // 先觸發 soulDimensions 的計算（確保轉換檢查已執行）
    const _ = soulDimensions.value; // 觸發計算但不使用結果
    const soulSystem = useSoulAnimalStore();
    const userAnimal = soulSystem.getUserSoulAnimal(props.currentUser);
    if (userAnimal) {
        // 使用轉換系統的記錄
        console.log(`🐾 使用轉換系統動物: ${userAnimal}`);
        const normalizedAnimal = normalizeAnimalName(userAnimal);
        console.log(`🔧 標準化動物名稱: ${userAnimal} -> ${normalizedAnimal}`);
        const animalDetails = getAnimalDetails({ animalName: normalizedAnimal });
        return {
            animalName: normalizedAnimal,
            chineseName: getCoolAnimalName(normalizedAnimal),
            normalName: normalizedAnimal,
            group: animalDetails.group,
            role: animalDetails.role,
            squad: animalDetails.squad,
            description: animalDetails.description,
            fullDescription: animalDetails.fullDescription,
            topFraudRisks: animalDetails.topFraudRisks || [],
            topVulnerableMessageTypes: getTopVulnerableMessageTypes(props.currentUser),
            psychologyAnalysis: getPsychologyAnalysis({ animalName: normalizedAnimal }),
            awareness: 85, // 覺醒狀態的預設警覺性
            timestamp: '當前狀態'
        };
    }
    else {
        // 有 Quiz 結果但還沒有轉換記錄，使用 Quiz 的結果
        const quizRecords = soulAnimalStore.getUserRecords(props.currentUser);
        if (quizRecords.length > 0) {
            const latestQuiz = quizRecords[0]; // 最新的測驗結果
            console.log(`🐾 用戶 ${props.currentUser} 使用 Quiz 測驗結果:`, latestQuiz);
            console.log(`🐾 latestQuiz.animalResult:`, latestQuiz.animalResult);
            const animalName = latestQuiz.animalResult.animalName || getDisplayAnimalName(latestQuiz.animalResult);
            console.log(`🐾 最終解析的 animalName:`, animalName);
            const animalDetails = getAnimalDetails(latestQuiz.animalResult);
            console.log(`🐾 getAnimalDetails 回傳的結果:`, animalDetails);
            return {
                animalName: animalName,
                chineseName: getCoolAnimalName(animalName),
                normalName: animalName,
                group: animalDetails.group,
                role: animalDetails.role,
                squad: animalDetails.squad,
                description: animalDetails.description,
                fullDescription: animalDetails.fullDescription,
                topFraudRisks: animalDetails.topFraudRisks || [],
                topVulnerableMessageTypes: getTopVulnerableMessageTypes(props.currentUser),
                psychologyAnalysis: getPsychologyAnalysis(latestQuiz.animalResult),
                awareness: latestQuiz.animalResult.awareness || 60,
                timestamp: latestQuiz.timestamp || 'Quiz測驗結果'
            };
        }
        console.log(`⚠️ 用戶 ${props.currentUser} 有測驗記錄但無法解析`);
        return null;
    }
});
// 動物名稱到 Animal.vue 格式的映射
const getChineseAnimalName = (animalName) => {
    // 如果已經是 Animal.vue 的完整格式，直接返回
    if (animalName && animalName.includes('型')) {
        return animalName;
    }
    // 從轉換系統的簡短名稱轉為 Animal.vue 格式
    const nameMap = {
        '🦊 狐狸型': '🦊 狐狸型',
        '🦅 老鷹型': '🦅 老鷹型',
        '🦉 貓頭鷹型': '🦉 貓頭鷹型',
        '🦈 鯊魚型': '🦈 鯊魚型',
        '🐿️ 松鼠型': '🐿️ 松鼠型',
        '🐙 章魚型': '🐙 章魚型',
        '🐱 貓咪型': '🐱 貓咪型',
        '🐺 狼型': '🐺 狼型',
        '🐢 烏龜型': '🐢 烏龜型',
        '🐘 大象型': '🐘 大象型',
        '🦛 河馬型': '🦛 河馬型',
        '🦍 金剛型': '🦍 金剛型',
        '🐭 老鼠型': '🐭 老鼠型',
        '� 獅子型': '� 獅子型',
        '🦌 麋鹿型': '🦌 麋鹿型',
        '� 駿馬型': '� 駿馬型'
    };
    // 修復損壞的編碼映射
    const fixedNames = {
        '� 獅子型': '🦁 獅子型',
        '� 駿馬型': '🐎 駿馬型'
    };
    const fixedName = fixedNames[animalName];
    if (fixedName)
        return fixedName;
    return nameMap[animalName] || animalName;
};
// 重新載入排行榜數據
const refreshLeaderboard = () => {
    // 由於 leaderboardData 是 computed，它會自動響應 soulAnimalStore 的變化
    // 這個函數可以用來強制觸發重新計算（如果需要的話）
    if (import.meta.env.DEV) {
        console.log('排行榜已刷新');
    }
};
// 組件掛載時載入數據
onMounted(() => {
    // 簡化初始化日誌
    if (import.meta.env.DEV) {
        console.log('Analyt.vue 初始化完成');
    }
});
// 監聽 currentUser 變化，重新載入數據
watch(() => props.currentUser, (newUser) => {
    if (newUser) {
        soulAnimalStore.setCurrentUser(newUser);
        // 避免重複設置登入狀態
        if (soulSystem.getCurrentUser() !== newUser) {
            soulSystem.setUserLoginStatus(true, newUser);
        }
        loadSoulAnimalRecords();
        // 精簡用戶切換日誌
        if (import.meta.env.DEV) {
            console.log(`用戶切換: ${newUser}`);
        }
    }
}, { immediate: true });
// 輔助函數
const getDifficultyGradient = (difficulty) => {
    const gradients = {
        '極難': 'bg-gradient-to-br from-red-500 to-orange-500',
        '困難': 'bg-gradient-to-br from-purple-500 to-pink-500',
        '中等': 'bg-gradient-to-br from-blue-500 to-cyan-500',
        '簡單': 'bg-gradient-to-br from-green-500 to-emerald-500'
    };
    return gradients[difficulty] || gradients['中等'];
};
const getRankGradient = (rank) => {
    const gradients = {
        1: 'bg-gradient-to-r from-yellow-400 to-orange-500',
        2: 'bg-gradient-to-r from-purple-400 to-pink-500',
        3: 'bg-gradient-to-r from-blue-400 to-cyan-500',
        4: 'bg-gradient-to-r from-green-400 to-emerald-500',
        5: 'bg-gradient-to-r from-indigo-400 to-blue-500'
    };
    return gradients[rank] || '';
};
const getRankShadow = (rank) => {
    const shadows = {
        1: 'shadow-yellow-500/50',
        2: 'shadow-purple-500/50',
        3: 'shadow-blue-500/50',
        4: 'shadow-green-500/50',
        5: 'shadow-indigo-500/50'
    };
    return shadows[rank] || '';
};
const getRankBadgeStyle = (rank) => {
    const styles = {
        1: 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/50',
        2: 'bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-lg shadow-purple-500/50',
        3: 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg shadow-blue-500/50',
        4: 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/50',
        5: 'bg-gradient-to-br from-indigo-400 to-blue-500 text-white shadow-lg shadow-indigo-500/50'
    };
    return styles[rank] || 'bg-secondary text-secondary-foreground';
};
const getRankTitle = (rank) => {
    const titles = {
        1: '傳奇特務',
        2: '大師級特務',
        3: '精英特務',
        4: '專家特務',
        5: '資深特務'
    };
    return titles[rank] || '';
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-center']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-b']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-header']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-left']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-right']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['large']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-screen-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-tuner-row']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-tuner']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['fraud-card']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['game-round-header']} */ ;
/** @type {__VLS_StyleScopedClasses['game-round-header']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "analyt-root self-stretch w-full" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "hacker-grid" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute inset-0 bg-grid-pattern opacity-5" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "container mx-auto hidden" },
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_elements.header, __VLS_elements.header)({
    ...{ class: "sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "w-full" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "max-w-screen-xl w-full px-4" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "analyt-header flex items-center justify-between" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "analyt-left flex items-center" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.emit('close');
            // @ts-ignore
            [emit,];
        } },
    'aria-label': "返回",
    title: "返回",
    ...{ class: "analyt-back-btn icon-btn bg-transparent text-primary p-3 rounded-md" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    ...{ class: "h-6 w-6" },
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    'stroke-width': "2",
    d: "M15 19l-7-7 7-7",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "analyt-center flex-1 flex items-center justify-center" },
    'aria-hidden': "false",
});
__VLS_asFunctionalElement(__VLS_elements.img)({
    src: (__VLS_ctx.logoM),
    alt: "Logo",
    ...{ class: "analyt-logo large" },
});
// @ts-ignore
[logoM,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "analyt-right flex items-center gap-4" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center gap-1 px-3 py-1 border border-primary/40 rounded-full" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    ...{ class: "h-3 w-3 text-primary" },
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    'stroke-width': "2",
    d: "M13 10V3L4 14h7v7l9-11h-7z",
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "text-primary font-semibold" },
});
(__VLS_ctx.userStats.totalExperience);
// @ts-ignore
[userStats,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "text-xs text-muted-foreground" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center gap-2" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    ...{ class: "h-4 w-4 text-primary-foreground" },
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    'stroke-width': "2",
    d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "text-sm" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "font-medium" },
});
(props.currentUser);
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "text-xs text-muted-foreground" },
});
(__VLS_ctx.userLevel);
// @ts-ignore
[userLevel,];
__VLS_asFunctionalElement(__VLS_elements.main, __VLS_elements.main)({
    ...{ class: "relative z-10 w-full py-6 px-4 space-y-6" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "tabs-wrapper flex gap-2 p-1 card card-variant-3 rounded-lg border border-border/40 backdrop-blur" },
});
for (const [tab] of __VLS_getVForSourceType((__VLS_ctx.tabs))) {
    // @ts-ignore
    [tabs,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.activeTab = tab.id;
                // @ts-ignore
                [activeTab,];
            } },
        key: (tab.id),
        ...{ class: ([
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all btn btn-md',
                __VLS_ctx.activeTab === tab.id ? 'btn-style-1' : 'btn-style-3'
            ]) },
    });
    // @ts-ignore
    [activeTab,];
    const __VLS_0 = ((tab.icon));
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ class: "h-4 w-4" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "h-4 w-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "font-medium" },
    });
    (tab.label);
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "text-center text-muted-foreground" },
});
if (__VLS_ctx.activeTab === 'overview') {
    // @ts-ignore
    [activeTab,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-6 animate-fade-in" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid gap-4 md:grid-cols-2 lg:grid-cols-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "border border-primary/20 bg-gradient-to-br from-card to-primary/5 rounded-lg p-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-sm font-medium" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "h-4 w-4 text-primary" },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-2xl font-bold" },
    });
    (__VLS_ctx.userStats.totalTests);
    // @ts-ignore
    [userStats,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-xs text-muted-foreground" },
    });
    (__VLS_ctx.userStats.totalTests > 0 ? `平均警覺性: ${__VLS_ctx.userStats.averageAwareness}%` : '尚未開始測驗');
    // @ts-ignore
    [userStats, userStats,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "border border-accent/20 bg-gradient-to-br from-card to-accent/5 rounded-lg p-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-sm font-medium" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "h-4 w-4 text-accent" },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-2xl font-bold" },
    });
    (__VLS_ctx.userStats.averageAwareness);
    // @ts-ignore
    [userStats,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-xs text-muted-foreground" },
    });
    (__VLS_ctx.userStats.totalTests > 0 ? '基於測驗結果' : '尚無數據');
    // @ts-ignore
    [userStats,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "border border-primary/20 bg-gradient-to-br from-card to-primary/5 rounded-lg p-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-sm font-medium" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "h-4 w-4 text-primary" },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-2xl font-bold" },
    });
    (__VLS_ctx.userStats.globalRank);
    // @ts-ignore
    [userStats,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-xs text-muted-foreground" },
    });
    (__VLS_ctx.userStats.totalTests > 0 ? '模擬排名' : '尚未排名');
    // @ts-ignore
    [userStats,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "border border-accent/20 bg-gradient-to-br from-card to-accent/5 rounded-lg p-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-sm font-medium" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "h-4 w-4 text-accent" },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-2xl font-bold" },
    });
    (__VLS_ctx.userStats.aiConfidence);
    // @ts-ignore
    [userStats,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-xs text-muted-foreground" },
    });
    (__VLS_ctx.userStats.totalTests > 0 ? '測驗數據' : '初始狀態');
    // @ts-ignore
    [userStats,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "border border-primary/20 rounded-lg bg-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-6 border-b border-border/40" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "text-lg font-semibold flex items-center gap-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "h-5 w-5" },
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement(__VLS_elements.defs, __VLS_elements.defs)({});
    __VLS_asFunctionalElement(__VLS_elements.linearGradient, __VLS_elements.linearGradient)({
        id: "gSmall",
        x1: "0",
        x2: "1",
    });
    __VLS_asFunctionalElement(__VLS_elements.stop)({
        offset: "0%",
        'stop-color': "#06B6D4",
    });
    __VLS_asFunctionalElement(__VLS_elements.stop)({
        offset: "100%",
        'stop-color': "#7C3AED",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M12 2c-3 0-6 2-6 5v4c0 6 5 10 6 11 1-1 6-5 6-11V7c0-3-3-5-6-5z",
        fill: "url(#gSmall)",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M9.5 11.5l1.8 1.8L14.5 9",
        stroke: "#fff",
        'stroke-width': "1.2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        fill: "none",
        opacity: "0.95",
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-muted-foreground mt-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid gap-4 md:grid-cols-2" },
    });
    for (const [fraud] of __VLS_getVForSourceType((__VLS_ctx.fraudTypeData))) {
        // @ts-ignore
        [fraudTypeData,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (fraud.type),
            ...{ class: "fraud-card space-y-2 p-4 rounded-lg border border-border/40 transition-colors" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex items-center justify-between" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "text-sm font-medium" },
        });
        (fraud.type);
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: ([
                    'px-2 py-1 text-xs font-semibold rounded border',
                    fraud.accuracy >= 90
                        ? 'border-green-500/50 text-green-500'
                        : fraud.accuracy >= 80
                            ? 'border-yellow-500/50 text-yellow-500'
                            : 'border-red-500/50 text-red-500'
                ]) },
        });
        (fraud.accuracy);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "w-full bg-secondary rounded-full h-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "bg-primary h-2 rounded-full transition-all" },
            ...{ style: ({ width: fraud.accuracy + '%' }) },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex justify-between text-xs text-muted-foreground" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (fraud.correct);
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (fraud.wrong);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-center text-xs text-muted-foreground mt-1" },
        });
        (fraud.total);
    }
}
if (__VLS_ctx.activeTab === 'missions') {
    // @ts-ignore
    [activeTab,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-6 animate-fade-in" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "text-xl font-bold flex items-center gap-2 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "h-6 w-6 text-primary" },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-muted-foreground" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid gap-4 md:grid-cols-2 lg:grid-cols-3" },
    });
    for (const [mission] of __VLS_getVForSourceType((__VLS_ctx.missionData))) {
        // @ts-ignore
        [missionData,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (mission.id),
            ...{ class: "border border-primary/20 hover:border-primary/40 rounded-lg bg-card transition-all hover:shadow-lg hover:shadow-primary/10 group" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "p-6 space-y-3" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex items-start justify-between" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: (['p-3 rounded-lg shadow-lg', __VLS_ctx.getDifficultyGradient(mission.difficulty)]) },
        });
        // @ts-ignore
        [getDifficultyGradient,];
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            ...{ class: "h-6 w-6 text-white" },
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'stroke-width': "2",
            d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: (['px-2 py-1 text-xs font-semibold rounded text-white border-0 shadow-md', __VLS_ctx.getDifficultyGradient(mission.difficulty)]) },
        });
        // @ts-ignore
        [getDifficultyGradient,];
        (mission.difficulty);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
            ...{ class: "text-base font-bold leading-tight" },
        });
        (mission.type);
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-sm text-muted-foreground mt-1" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "p-6 pt-0 space-y-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "space-y-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex justify-between text-sm" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "text-muted-foreground" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "font-medium" },
        });
        (mission.completed);
        (mission.total);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "w-full bg-secondary rounded-full h-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "bg-primary h-2 rounded-full transition-all" },
            ...{ style: ({ width: (mission.completed / mission.total * 100) + '%' }) },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex items-center justify-between pt-2 border-t border-border/40" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex items-center gap-1 text-sm" },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            ...{ class: "h-4 w-4 text-primary" },
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'stroke-width': "2",
            d: "M13 10V3L4 14h7v7l9-11h-7z",
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "font-semibold text-primary" },
        });
        (mission.reward);
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "text-muted-foreground text-xs" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: ([
                    'px-2 py-1 text-xs rounded',
                    mission.status === '需加強' ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-secondary-foreground'
                ]) },
        });
        (mission.status);
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ class: "w-full px-4 py-2 btn btn-lg btn-style-4 rounded-md transition-all flex items-center justify-center gap-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            ...{ class: "h-4 w-4" },
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'stroke-width': "2",
            d: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'stroke-width': "2",
            d: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        });
    }
}
if (__VLS_ctx.activeTab === 'leaderboard') {
    // @ts-ignore
    [activeTab,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-6 animate-fade-in" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "border border-primary/20 rounded-lg bg-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-6 border-b border-border/40" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "text-lg font-semibold flex items-center gap-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "h-5 w-5 text-primary" },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-muted-foreground mt-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-6 space-y-4" },
    });
    if (__VLS_ctx.leaderboardData.length > 0) {
        // @ts-ignore
        [leaderboardData,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        for (const [player] of __VLS_getVForSourceType((__VLS_ctx.leaderboardData))) {
            // @ts-ignore
            [leaderboardData,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (player.rank),
                ...{ class: ([
                        'relative flex items-center gap-4 p-4 rounded-lg border transition-all',
                        player.rank <= 3
                            ? `border-primary/40 ${__VLS_ctx.getRankGradient(player.rank)} shadow-lg ${__VLS_ctx.getRankShadow(player.rank)}`
                            : 'border-border/40 bg-card/50 hover:bg-card'
                    ]) },
            });
            // @ts-ignore
            [getRankGradient, getRankShadow,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "relative" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: ([
                        'flex items-center justify-center w-12 h-12 rounded-full font-bold',
                        __VLS_ctx.getRankBadgeStyle(player.rank)
                    ]) },
            });
            // @ts-ignore
            [getRankBadgeStyle,];
            (player.rank);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex-1" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-center gap-2 mb-1" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: (['font-bold', player.rank <= 3 ? 'text-white' : 'text-foreground']) },
            });
            (player.name);
            if (player.rank <= 5) {
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: (['px-2 py-1 text-xs font-semibold rounded text-white border-0 shadow-md flex items-center gap-1', __VLS_ctx.getRankGradient(player.rank)]) },
                });
                // @ts-ignore
                [getRankGradient,];
                (__VLS_ctx.getRankTitle(player.rank));
                // @ts-ignore
                [getRankTitle,];
            }
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: (['text-sm', player.rank <= 3 ? 'text-white/90' : 'text-muted-foreground']) },
            });
            (player.accuracy);
            (player.missions);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-right" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: (['text-xl font-bold', player.rank <= 3 ? 'text-white' : 'text-primary']) },
            });
            (player.score.toLocaleString());
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: (['text-xs', player.rank <= 3 ? 'text-white/80' : 'text-muted-foreground']) },
            });
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-center py-12" },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            ...{ class: "h-16 w-16 text-muted-foreground mx-auto mb-4" },
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'stroke-width': "2",
            d: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "text-lg font-semibold mb-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-muted-foreground mb-4" },
        });
    }
}
if (__VLS_ctx.activeTab === 'soulanimals') {
    // @ts-ignore
    [activeTab,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-6 animate-fade-in" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "text-xl font-bold flex items-center gap-2 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "h-6 w-6 text-primary" },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-muted-foreground" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-4" },
    });
    if (!__VLS_ctx.currentDisplayAnimal) {
        // @ts-ignore
        [currentDisplayAnimal,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "border border-orange-400/30 rounded-lg bg-slate-900/85 backdrop-blur-md p-6 text-center" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-6xl mb-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "text-xl font-semibold mb-2 text-orange-300" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-slate-300 mb-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "text-orange-400 font-semibold" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-sm text-slate-400" },
        });
    }
    if (__VLS_ctx.currentDisplayAnimal) {
        // @ts-ignore
        [currentDisplayAnimal,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "border border-cyan-400/30 rounded-lg bg-slate-900/85 backdrop-blur-md transition-all hover:shadow-lg hover:shadow-cyan-400/20 hover:bg-slate-900/90 hover:border-cyan-400/40" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "p-6" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex items-center justify-between mb-6" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex items-center gap-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "w-20 h-20 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-700/90 flex items-center justify-center border-2 border-cyan-400/40 shadow-lg backdrop-blur" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "w-16 h-16" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.getAnimalSVG(__VLS_ctx.currentDisplayAnimal)) }, null, null);
        // @ts-ignore
        [currentDisplayAnimal, getAnimalSVG,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
            ...{ class: "text-xl font-bold bg-gradient-to-r from-cyan-300 to-cyan-100 bg-clip-text text-transparent" },
        });
        (__VLS_ctx.currentDisplayAnimal.chineseName);
        // @ts-ignore
        [currentDisplayAnimal,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex items-center gap-2 mt-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-400/40 shadow-sm backdrop-blur" },
        });
        (__VLS_ctx.currentDisplayAnimal.group);
        // @ts-ignore
        [currentDisplayAnimal,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border border-orange-400/40 backdrop-blur" },
        });
        (__VLS_ctx.currentDisplayAnimal.role);
        // @ts-ignore
        [currentDisplayAnimal,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-xs text-slate-400 mt-2 font-medium" },
        });
        (__VLS_ctx.currentDisplayAnimal.timestamp);
        // @ts-ignore
        [currentDisplayAnimal,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-right" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent" },
        });
        (__VLS_ctx.currentDisplayAnimal.awareness);
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "text-lg" },
        });
        // @ts-ignore
        [currentDisplayAnimal,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-sm text-slate-300 font-medium" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "mt-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-400/40 backdrop-blur" },
        });
        (__VLS_ctx.currentDisplayAnimal.squad);
        // @ts-ignore
        [currentDisplayAnimal,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "mb-6 p-5 rounded-xl bg-gradient-to-br from-slate-800/60 via-blue-900/50 to-purple-900/40 border border-cyan-400/30 shadow-sm backdrop-blur" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h5, __VLS_elements.h5)({
            ...{ class: "text-lg font-bold text-cyan-200 mb-3" },
        });
        (__VLS_ctx.currentDisplayAnimal.description);
        // @ts-ignore
        [currentDisplayAnimal,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-slate-300 leading-relaxed mb-4" },
        });
        (__VLS_ctx.currentDisplayAnimal.fullDescription);
        // @ts-ignore
        [currentDisplayAnimal,];
        if (__VLS_ctx.currentDisplayAnimal.topFraudRisks && __VLS_ctx.currentDisplayAnimal.topFraudRisks.length > 0) {
            // @ts-ignore
            [currentDisplayAnimal, currentDisplayAnimal,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "mt-4" },
            });
            __VLS_asFunctionalElement(__VLS_elements.h6, __VLS_elements.h6)({
                ...{ class: "text-sm font-semibold text-red-300 mb-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "space-y-2" },
            });
            for (const [risk, idx] of __VLS_getVForSourceType((__VLS_ctx.currentDisplayAnimal.topFraudRisks))) {
                // @ts-ignore
                [currentDisplayAnimal,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    key: (idx),
                    ...{ class: "flex items-center justify-between bg-slate-800/40 rounded-lg p-3 border border-red-400/20" },
                });
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "text-sm font-medium text-slate-200" },
                });
                (__VLS_ctx.animalFraudLabelMap[risk[0]] || risk[0]);
                // @ts-ignore
                [animalFraudLabelMap,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "text-xs text-slate-400 mt-1" },
                });
                (risk[2]);
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "text-xs px-2 py-1 rounded text-white" },
                    ...{ class: ({
                            'bg-red-500': risk[1] === '高',
                            'bg-orange-500': risk[1] === '中高',
                            'bg-yellow-500': risk[1] === '中',
                            'bg-green-500': risk[1] === '低'
                        }) },
                });
                (risk[1]);
            }
            if (__VLS_ctx.currentDisplayAnimal.topFraudRisks.length === 0) {
                // @ts-ignore
                [currentDisplayAnimal,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "text-slate-400 text-sm" },
                });
            }
        }
        if (__VLS_ctx.currentDisplayAnimal.psychologyAnalysis) {
            // @ts-ignore
            [currentDisplayAnimal,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "mt-4" },
            });
            __VLS_asFunctionalElement(__VLS_elements.h6, __VLS_elements.h6)({
                ...{ class: "text-sm font-semibold text-purple-300 mb-3" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "bg-slate-800/60 rounded-xl p-6 border border-purple-400/30" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "grid grid-cols-1 lg:grid-cols-3 gap-6 items-center" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "lg:col-span-2 flex justify-center" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "relative w-80 h-80" },
            });
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 240 240",
                ...{ class: "w-full h-full" },
            });
            __VLS_asFunctionalElement(__VLS_elements.circle)({
                cx: "120",
                cy: "120",
                r: "100",
                fill: "none",
                stroke: "#475569",
                'stroke-width': "1",
                opacity: "0.3",
            });
            __VLS_asFunctionalElement(__VLS_elements.circle)({
                cx: "120",
                cy: "120",
                r: "80",
                fill: "none",
                stroke: "#475569",
                'stroke-width': "1",
                opacity: "0.3",
            });
            __VLS_asFunctionalElement(__VLS_elements.circle)({
                cx: "120",
                cy: "120",
                r: "60",
                fill: "none",
                stroke: "#475569",
                'stroke-width': "1",
                opacity: "0.3",
            });
            __VLS_asFunctionalElement(__VLS_elements.circle)({
                cx: "120",
                cy: "120",
                r: "40",
                fill: "none",
                stroke: "#475569",
                'stroke-width': "1",
                opacity: "0.3",
            });
            __VLS_asFunctionalElement(__VLS_elements.circle)({
                cx: "120",
                cy: "120",
                r: "20",
                fill: "none",
                stroke: "#475569",
                'stroke-width': "1",
                opacity: "0.3",
            });
            __VLS_asFunctionalElement(__VLS_elements.line)({
                x1: "120",
                y1: "120",
                x2: "120",
                y2: "20",
                stroke: "#64748b",
                'stroke-width': "1.5",
                opacity: "0.5",
            });
            __VLS_asFunctionalElement(__VLS_elements.line)({
                x1: "120",
                y1: "120",
                x2: "190",
                y2: "52",
                stroke: "#64748b",
                'stroke-width': "1.5",
                opacity: "0.5",
            });
            __VLS_asFunctionalElement(__VLS_elements.line)({
                x1: "120",
                y1: "120",
                x2: "190",
                y2: "188",
                stroke: "#64748b",
                'stroke-width': "1.5",
                opacity: "0.5",
            });
            __VLS_asFunctionalElement(__VLS_elements.line)({
                x1: "120",
                y1: "120",
                x2: "50",
                y2: "188",
                stroke: "#64748b",
                'stroke-width': "1.5",
                opacity: "0.5",
            });
            __VLS_asFunctionalElement(__VLS_elements.line)({
                x1: "120",
                y1: "120",
                x2: "50",
                y2: "52",
                stroke: "#64748b",
                'stroke-width': "1.5",
                opacity: "0.5",
            });
            __VLS_asFunctionalElement(__VLS_elements.polygon)({
                points: "120,50 162,76 162,164 88,164 88,76",
                fill: "rgba(147, 51, 234, 0.25)",
                stroke: "#a855f7",
                'stroke-width': "3",
            });
            __VLS_asFunctionalElement(__VLS_elements.circle)({
                cx: "120",
                cy: "50",
                r: "5",
                fill: "#a855f7",
                stroke: "#ffffff",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_elements.circle)({
                cx: "162",
                cy: "76",
                r: "5",
                fill: "#10d9c4",
                stroke: "#ffffff",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_elements.circle)({
                cx: "162",
                cy: "164",
                r: "5",
                fill: "#10b981",
                stroke: "#ffffff",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_elements.circle)({
                cx: "88",
                cy: "164",
                r: "5",
                fill: "#f59e0b",
                stroke: "#ffffff",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_elements.circle)({
                cx: "88",
                cy: "76",
                r: "5",
                fill: "#3b82f6",
                stroke: "#ffffff",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "absolute top-2 left-1/2 transform -translate-x-1/2 text-center" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-sm font-bold text-purple-300" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-xs text-purple-200 mt-1 px-2 py-1 bg-purple-900/40 rounded" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "absolute top-8 right-2 text-center" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-sm font-bold text-cyan-300" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-xs text-cyan-200 mt-1 px-2 py-1 bg-cyan-900/40 rounded" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "absolute bottom-8 right-2 text-center" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-sm font-bold text-green-300" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-xs text-green-200 mt-1 px-2 py-1 bg-green-900/40 rounded" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "absolute bottom-8 left-2 text-center" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-sm font-bold text-orange-300" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-xs text-orange-200 mt-1 px-2 py-1 bg-orange-900/40 rounded" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "absolute top-8 left-2 text-center" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-sm font-bold text-blue-300" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-xs text-blue-200 mt-1 px-2 py-1 bg-blue-900/40 rounded" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-400 rounded-full shadow-lg" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "space-y-3" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-center lg:text-left mb-4" },
            });
            __VLS_asFunctionalElement(__VLS_elements.h5, __VLS_elements.h5)({
                ...{ class: "text-lg font-bold text-slate-200 mb-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "text-xs text-slate-400" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "p-4 bg-slate-700/40 rounded-lg border border-slate-600/40" },
            });
            __VLS_asFunctionalElement(__VLS_elements.h6, __VLS_elements.h6)({
                ...{ class: "text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-purple-400" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "space-y-2 text-xs" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-center justify-between bg-slate-600/20 rounded px-3 py-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-purple-300 font-medium" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-slate-300" },
            });
            __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({
                ...{ class: "text-purple-200 bg-purple-900/30 px-1 rounded" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-center justify-between bg-slate-600/20 rounded px-3 py-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-cyan-300 font-medium" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-slate-300" },
            });
            __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({
                ...{ class: "text-cyan-200 bg-cyan-900/30 px-1 rounded" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-center justify-between bg-slate-600/20 rounded px-3 py-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-green-300 font-medium" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-slate-300" },
            });
            __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({
                ...{ class: "text-green-200 bg-green-900/30 px-1 rounded" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-center justify-between bg-slate-600/20 rounded px-3 py-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-orange-300 font-medium" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-slate-300" },
            });
            __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({
                ...{ class: "text-orange-200 bg-orange-900/30 px-1 rounded" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-center justify-between bg-slate-600/20 rounded px-3 py-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-blue-300 font-medium" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-slate-300" },
            });
            __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({
                ...{ class: "text-blue-200 bg-blue-900/30 px-1 rounded" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "mt-3 pt-3 border-t border-slate-600/60" },
            });
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "text-xs text-slate-400 leading-relaxed" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-slate-300 font-medium" },
            });
        }
        if (__VLS_ctx.currentDisplayAnimal.topVulnerableMessageTypes && __VLS_ctx.currentDisplayAnimal.topVulnerableMessageTypes.length > 0) {
            // @ts-ignore
            [currentDisplayAnimal, currentDisplayAnimal,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "mt-4" },
            });
            __VLS_asFunctionalElement(__VLS_elements.h6, __VLS_elements.h6)({
                ...{ class: "text-sm font-semibold text-orange-300 mb-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-xs text-slate-400 mb-3" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "space-y-2" },
            });
            for (const [msgType, idx] of __VLS_getVForSourceType((__VLS_ctx.currentDisplayAnimal.topVulnerableMessageTypes))) {
                // @ts-ignore
                [currentDisplayAnimal,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    key: (idx),
                    ...{ class: "flex items-center justify-between bg-slate-800/40 rounded-lg p-3 border border-orange-400/20" },
                });
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "flex-1" },
                });
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "text-sm font-medium text-slate-200" },
                });
                (msgType.type);
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "text-xs text-slate-400 mt-1" },
                });
                (msgType.count > 0 ? `錯誤 ${msgType.count} 次` : '根據動物特性推測');
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "flex items-center gap-2" },
                });
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "text-xs px-2 py-1 rounded text-white bg-orange-500" },
                });
                (msgType.percentage);
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "text-xs text-slate-400" },
                });
                (idx + 1);
            }
        }
    }
    if (__VLS_ctx.soulAnimalHistory.length > 0) {
        // @ts-ignore
        [soulAnimalHistory,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
            ...{ class: "text-lg font-semibold mb-4 text-slate-300" },
        });
        for (const [record] of __VLS_getVForSourceType((__VLS_ctx.soulAnimalHistory))) {
            // @ts-ignore
            [soulAnimalHistory,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (record.id),
                ...{ class: "border border-slate-600/30 rounded-lg bg-slate-900/60 backdrop-blur-md transition-all hover:shadow-md hover:bg-slate-900/70 mb-4" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "p-4" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-center justify-between" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-center gap-3" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "w-12 h-12 rounded-lg bg-slate-800/90 flex items-center justify-center border border-slate-600/40" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "w-8 h-8" },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.getAnimalSVG(record.animalResult)) }, null, null);
            // @ts-ignore
            [getAnimalSVG,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
            __VLS_asFunctionalElement(__VLS_elements.h5, __VLS_elements.h5)({
                ...{ class: "font-semibold text-slate-200" },
            });
            (__VLS_ctx.getDisplayAnimalName(record.animalResult));
            // @ts-ignore
            [getDisplayAnimalName,];
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "text-xs text-slate-400" },
            });
            (record.timestamp);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-right" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-lg font-bold text-teal-300" },
            });
            (record.animalResult.awareness);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-xs text-slate-400" },
            });
        }
    }
    for (const [record] of __VLS_getVForSourceType((__VLS_ctx.soulAnimalHistory.slice(0, 0)))) {
        // @ts-ignore
        [soulAnimalHistory,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (record.id),
            ...{ class: "border border-cyan-400/30 rounded-lg bg-slate-900/85 backdrop-blur-md transition-all hover:shadow-lg hover:shadow-cyan-400/20 hover:bg-slate-900/90 hover:border-cyan-400/40" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "p-6" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex items-center justify-between mb-6" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex items-center gap-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "w-20 h-20 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-700/90 flex items-center justify-center border-2 border-cyan-400/40 shadow-lg backdrop-blur" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "w-16 h-16" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.getAnimalSVG(record.animalResult)) }, null, null);
        // @ts-ignore
        [getAnimalSVG,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
            ...{ class: "text-xl font-bold bg-gradient-to-r from-cyan-300 to-cyan-100 bg-clip-text text-transparent" },
        });
        (__VLS_ctx.getDisplayAnimalName(record.animalResult));
        // @ts-ignore
        [getDisplayAnimalName,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex items-center gap-2 mt-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-400/40 shadow-sm backdrop-blur" },
        });
        (__VLS_ctx.getAnimalGroup(record.animalResult));
        // @ts-ignore
        [getAnimalGroup,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-xs text-slate-400 mt-2 font-medium" },
        });
        (record.timestamp);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-right" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent" },
        });
        (record.animalResult.awareness);
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "text-lg" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-sm text-slate-300 font-medium" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "mt-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-400/40 backdrop-blur" },
        });
        (__VLS_ctx.getAnimalLevel(record.animalResult.awareness));
        // @ts-ignore
        [getAnimalLevel,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "mb-6 p-5 rounded-xl bg-gradient-to-br from-slate-800/60 via-blue-900/50 to-purple-900/40 border border-cyan-400/30 shadow-sm backdrop-blur" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h5, __VLS_elements.h5)({
            ...{ class: "text-lg font-bold text-cyan-200 mb-4 flex items-center gap-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "text-xl" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "grid gap-4 md:grid-cols-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-400/15 border border-blue-400/40 shadow-sm hover:shadow-md transition-all backdrop-blur" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-sm font-semibold text-blue-300 mb-2 flex items-center gap-1" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "w-2 h-2 bg-blue-400 rounded-full" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-sm text-slate-200 leading-relaxed font-medium" },
        });
        (__VLS_ctx.getAnimalAxisAnalysis(record.animalResult).authority);
        // @ts-ignore
        [getAnimalAxisAnalysis,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-400/15 border border-green-400/40 shadow-sm hover:shadow-md transition-all backdrop-blur" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-sm font-semibold text-green-300 mb-2 flex items-center gap-1" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "w-2 h-2 bg-green-400 rounded-full" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-sm text-slate-200 leading-relaxed font-medium" },
        });
        (__VLS_ctx.getAnimalAxisAnalysis(record.animalResult).timing);
        // @ts-ignore
        [getAnimalAxisAnalysis,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-400/15 border border-purple-400/40 shadow-sm hover:shadow-md transition-all backdrop-blur" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-sm font-semibold text-purple-300 mb-2 flex items-center gap-1" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "w-2 h-2 bg-purple-400 rounded-full" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-sm text-slate-200 leading-relaxed font-medium" },
        });
        (__VLS_ctx.getAnimalAxisAnalysis(record.animalResult).style);
        // @ts-ignore
        [getAnimalAxisAnalysis,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "p-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-400/15 border border-orange-400/40 shadow-sm hover:shadow-md transition-all backdrop-blur" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-sm font-semibold text-orange-300 mb-2 flex items-center gap-1" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "w-2 h-2 bg-orange-400 rounded-full" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-sm text-slate-200 leading-relaxed font-medium" },
        });
        (__VLS_ctx.getAnimalAxisAnalysis(record.animalResult).reward);
        // @ts-ignore
        [getAnimalAxisAnalysis,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "mb-4 p-4 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/15 border border-indigo-400/40 shadow-sm backdrop-blur" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-sm font-semibold text-indigo-300 mb-2 flex items-center gap-1" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "w-2 h-2 bg-indigo-400 rounded-full" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-sm text-slate-200 leading-relaxed font-medium" },
        });
        (__VLS_ctx.getAnimalPersonality(record.animalResult));
        // @ts-ignore
        [getAnimalPersonality,];
        if (record.animalResult.topFraudRisks && record.animalResult.topFraudRisks.length > 0) {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "mb-4" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-lg" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex gap-3 flex-wrap" },
            });
            for (const [[type, level, description], index] of __VLS_getVForSourceType((record.animalResult.topFraudRisks.slice(0, 3)))) {
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    key: (index),
                    ...{ class: ([
                            'px-4 py-2 rounded-xl text-sm font-medium border-2 shadow-sm transition-all hover:shadow-md backdrop-blur',
                            level === '高' ? 'bg-gradient-to-r from-red-500/25 to-rose-500/20 text-red-300 border-red-400/50' :
                                level === '中' ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-300 border-amber-400/50' :
                                    'bg-gradient-to-r from-green-500/25 to-emerald-500/20 text-green-300 border-green-400/50'
                        ]) },
                });
                (type);
                (level);
            }
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "pt-4 border-t border-cyan-400/30" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-sm font-semibold mb-3 flex items-center gap-2 text-slate-200" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "text-lg" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        __VLS_asFunctionalElement(__VLS_elements.ul, __VLS_elements.ul)({
            ...{ class: "space-y-2" },
        });
        for (const [tip, index] of __VLS_getVForSourceType((__VLS_ctx.getAnimalTips(record.animalResult)))) {
            // @ts-ignore
            [getAnimalTips,];
            __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({
                key: (index),
                ...{ class: "flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-800/40 to-blue-900/30 border border-slate-600/40 backdrop-blur" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mt-2 flex-shrink-0" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-sm text-slate-200 leading-relaxed font-medium" },
            });
            (tip);
        }
    }
    if (__VLS_ctx.soulAnimalHistory.length === 0) {
        // @ts-ignore
        [soulAnimalHistory,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-center py-12" },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            ...{ class: "h-16 w-16 text-slate-400 mx-auto mb-4" },
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'stroke-width': "2",
            d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "text-lg font-semibold mb-2 text-slate-200" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-slate-400 mb-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ class: "px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg" },
        });
    }
}
if (__VLS_ctx.activeTab === 'soultransform') {
    // @ts-ignore
    [activeTab,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-6 animate-fade-in" },
    });
    if (!__VLS_ctx.currentDisplayAnimal) {
        // @ts-ignore
        [currentDisplayAnimal,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "bg-gray-800 rounded-lg p-6 text-center" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-6xl mb-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "text-xl font-semibold mb-2 text-white" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-gray-300 mb-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "text-blue-400 font-semibold" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-sm text-gray-400" },
        });
    }
    else if (!__VLS_ctx.isSoulAwakened) {
        // @ts-ignore
        [isSoulAwakened,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "bg-gray-800 rounded-lg p-6 text-center" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-6xl mb-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "text-xl font-semibold mb-2 text-white" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-gray-300 mb-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "text-blue-400 font-semibold" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "space-y-2 text-sm text-gray-400" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        ((__VLS_ctx.soulAnimalStore.getUserGameRecords ?
            __VLS_ctx.soulAnimalStore.getUserGameRecords(props.currentUser) :
            __VLS_ctx.soulAnimalStore.getUserGameErrors(props.currentUser) || []).length);
        // @ts-ignore
        [soulAnimalStore, soulAnimalStore, soulAnimalStore,];
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "grid grid-cols-1 lg:grid-cols-2 gap-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "bg-gray-800 rounded-lg p-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "text-lg font-semibold mb-3 text-white" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "space-y-3" },
        });
        for (const [dimension] of __VLS_getVForSourceType((__VLS_ctx.soulDimensions))) {
            // @ts-ignore
            [soulDimensions,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (dimension.id),
                ...{ class: "space-y-1" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex justify-between text-sm" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-gray-300" },
            });
            (dimension.name);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-white" },
            });
            (dimension.score.toFixed(1));
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "w-full bg-gray-700 rounded-full h-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "h-2 rounded-full transition-all duration-300" },
                ...{ class: (dimension.color) },
                ...{ style: ({ width: dimension.score + '%' }) },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-xs text-gray-400" },
            });
            (dimension.description);
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "bg-gray-800 rounded-lg p-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "text-lg font-semibold mb-3 text-white" },
        });
        if (__VLS_ctx.transformPredictions.length === 0) {
            // @ts-ignore
            [transformPredictions,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-center text-gray-400 py-4" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-4xl mb-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "space-y-2" },
            });
            for (const [prediction] of __VLS_getVForSourceType((__VLS_ctx.transformPredictions))) {
                // @ts-ignore
                [transformPredictions,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    key: (prediction.animal),
                    ...{ class: "flex items-center justify-between p-2 bg-gray-700 rounded" },
                });
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "flex items-center space-x-2" },
                });
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "text-2xl" },
                });
                (prediction.emoji);
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "text-white" },
                });
                (prediction.animal);
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "flex items-center space-x-2" },
                });
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "w-20 bg-gray-600 rounded-full h-2" },
                });
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300" },
                    ...{ style: ({ width: prediction.probability + '%' }) },
                });
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "text-sm text-gray-300" },
                });
                (prediction.probability.toFixed(1));
            }
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "bg-gray-800 rounded-lg p-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "text-lg font-semibold mb-3 text-white" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "space-y-2" },
        });
        for (const [suggestion] of __VLS_getVForSourceType((__VLS_ctx.transformSuggestions))) {
            // @ts-ignore
            [transformSuggestions,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (suggestion.dimension),
                ...{ class: "p-3 bg-gray-700 rounded" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-sm font-medium text-blue-400" },
            });
            (suggestion.dimension);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-sm text-gray-300" },
            });
            (suggestion.advice);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-xs text-gray-400 mt-1" },
            });
            (suggestion.action);
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "bg-gray-800 rounded-lg p-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "text-lg font-semibold mb-3 text-white" },
        });
        if (__VLS_ctx.transformHistory.length === 0) {
            // @ts-ignore
            [transformHistory,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-center text-gray-400 py-4" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-4xl mb-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "text-xs mt-1" },
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "space-y-2" },
            });
            for (const [history] of __VLS_getVForSourceType((__VLS_ctx.transformHistory))) {
                // @ts-ignore
                [transformHistory,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    key: (history.date),
                    ...{ class: "flex items-center justify-between p-2 bg-gray-700 rounded" },
                });
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "flex items-center space-x-2" },
                });
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "text-sm text-gray-400" },
                });
                (history.date);
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "text-sm text-gray-300" },
                });
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "text-lg" },
                });
                (history.emoji);
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "text-white" },
                });
                (history.animal);
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "text-xs text-gray-400" },
                });
                (history.reason);
            }
        }
    }
    if (!__VLS_ctx.isSoulAwakened && __VLS_ctx.soulDimensions.some(d => d.score > 0)) {
        // @ts-ignore
        [isSoulAwakened, soulDimensions,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "bg-gray-800 rounded-lg p-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "text-lg font-semibold mb-3 text-white" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "space-y-3" },
        });
        for (const [dimension] of __VLS_getVForSourceType((__VLS_ctx.soulDimensions))) {
            // @ts-ignore
            [soulDimensions,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (dimension.id),
                ...{ class: "space-y-1" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex justify-between text-sm" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-gray-300" },
            });
            (dimension.name);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-white" },
            });
            (dimension.score.toFixed(1));
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "w-full bg-gray-700 rounded-full h-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "h-2 rounded-full transition-all duration-300" },
                ...{ class: (dimension.color) },
                ...{ style: ({ width: dimension.score + '%' }) },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-xs text-gray-400" },
            });
            (dimension.description);
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "mt-4 p-3 bg-blue-900/30 rounded text-sm text-blue-300" },
        });
    }
}
if (__VLS_ctx.activeTab === 'analysis') {
    // @ts-ignore
    [activeTab,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-6 animate-fade-in" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "border border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-6 border-b border-border/40" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "text-xl font-bold flex items-center gap-2 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "h-6 w-6 text-accent" },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-muted-foreground" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid gap-6 md:grid-cols-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-2 p-4 rounded-lg bg-card/50 border border-border/40" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center gap-2 text-muted-foreground text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "h-4 w-4" },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-2xl font-bold text-primary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-xs text-muted-foreground" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-2 p-4 rounded-lg bg-card/50 border border-border/40" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center gap-2 text-muted-foreground text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "h-4 w-4" },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-2xl font-bold text-accent" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-xs text-muted-foreground" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-2 p-4 rounded-lg bg-card/50 border border-border/40" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center gap-2 text-muted-foreground text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "h-4 w-4" },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-2xl font-bold text-primary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-xs text-muted-foreground" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-2 p-4 rounded-lg bg-card/50 border border-border/40" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center gap-2 text-muted-foreground text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "h-4 w-4" },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-2xl font-bold text-accent" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-xs text-muted-foreground" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "border border-accent/20 rounded-lg bg-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-6 border-b border-border/40" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "text-lg font-semibold flex items-center gap-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "h-5 w-5 text-accent" },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-muted-foreground mt-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-6 space-y-4" },
    });
    for (const [sms] of __VLS_getVForSourceType((__VLS_ctx.smsHistory))) {
        // @ts-ignore
        [smsHistory,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (sms.id),
        });
        if (sms.isGameHeader) {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "game-round-header mb-4" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: ([
                        'flex items-center justify-between p-4 rounded-lg border',
                        sms.isPerfectRound
                            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30'
                            : 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30'
                    ]) },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-center gap-3" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: ([
                        'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                        sms.isPerfectRound
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                            : 'bg-gradient-to-br from-primary to-accent'
                    ]) },
            });
            if (sms.isPerfectRound) {
                __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                    ...{ class: "h-6 w-6" },
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                });
                __VLS_asFunctionalElement(__VLS_elements.path)({
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    'stroke-width': "2",
                    d: "M5 13l4 4L19 7",
                });
            }
            else {
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                (sms.gameNumber);
            }
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
            __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
                ...{ class: ([
                        'font-bold text-lg',
                        sms.isPerfectRound ? 'text-green-600' : 'text-primary'
                    ]) },
            });
            (sms.gameNumber);
            if (sms.isPerfectRound) {
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "text-sm text-green-500" },
                });
            }
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "text-sm text-muted-foreground" },
            });
            (sms.timestamp);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-right" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-center gap-4" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-center" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: ([
                        'text-xl font-bold',
                        sms.isPerfectRound ? 'text-green-600' : 'text-accent'
                    ]) },
            });
            (sms.gameScore);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-xs text-muted-foreground" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-center" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: ([
                        'text-xl font-bold',
                        sms.isPerfectRound ? 'text-green-600' : 'text-red-500'
                    ]) },
            });
            (sms.wrongCount);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-xs text-muted-foreground" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-center" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-xl font-bold" },
            });
            (sms.gameRound);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-xs text-muted-foreground" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "px-3 py-1 rounded-full text-xs font-semibold" },
                ...{ class: (sms.mode === 'challenge' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700') },
            });
            (sms.mode === 'challenge' ? '極限挑戰' : '新手挑戰');
        }
        else if (!sms.isPerfectRound) {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: ([
                        'p-4 rounded-lg border transition-all ml-6 mb-3 relative',
                        sms.isCorrect
                            ? 'border-green-500/30 bg-green-500/5'
                            : 'border-red-500/30 bg-red-500/5 hover:border-red-500/50'
                    ]) },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "absolute -left-6 top-6 w-4 h-0.5 bg-primary/50" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "absolute -left-8 top-5 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-xs font-bold text-primary" },
            });
            (sms.questionNumber);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-start justify-between mb-3" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-center gap-2" },
            });
            if (sms.isCorrect) {
                __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                    ...{ class: "h-5 w-5 text-green-500" },
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                });
                __VLS_asFunctionalElement(__VLS_elements.path)({
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    'stroke-width': "2",
                    d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                });
            }
            else {
                __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                    ...{ class: "h-5 w-5 text-red-500" },
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                });
                __VLS_asFunctionalElement(__VLS_elements.path)({
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    'stroke-width': "2",
                    d: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
                });
            }
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "px-2 py-1 text-xs border border-primary/40 rounded" },
            });
            (sms.type);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "px-2 py-1 text-xs bg-primary/10 text-primary rounded" },
            });
            (sms.questionNumber);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-xs text-muted-foreground" },
            });
            (sms.timestamp);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "mb-3 p-3 rounded bg-card/50 border border-border/40" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-sm leading-relaxed" },
            });
            (sms.content);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-center gap-4 mb-3 text-sm" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: (sms.isCorrect ? 'text-green-500 font-medium' : 'text-red-500 font-medium') },
            });
            (sms.userAnswer);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-primary font-medium" },
            });
            (sms.correctAnswer);
            if (!sms.isCorrect) {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "mt-4 p-4 rounded-lg bg-card border border-accent/20" },
                });
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "flex items-center gap-2 mb-3" },
                });
                __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                    ...{ class: "h-5 w-5 text-accent" },
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                });
                __VLS_asFunctionalElement(__VLS_elements.path)({
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    'stroke-width': "2",
                    d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                });
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "font-semibold" },
                });
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "ml-auto px-2 py-1 text-xs border border-accent/40 text-accent rounded" },
                });
                (sms.aiAnalysis.confidence);
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "space-y-3" },
                });
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "text-sm font-medium mb-2 flex items-center gap-2" },
                });
                __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                    ...{ class: "h-4 w-4 text-red-500" },
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                });
                __VLS_asFunctionalElement(__VLS_elements.path)({
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    'stroke-width': "2",
                    d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
                });
                __VLS_asFunctionalElement(__VLS_elements.ul, __VLS_elements.ul)({
                    ...{ class: "space-y-1.5 ml-6" },
                });
                for (const [flag, index] of __VLS_getVForSourceType((sms.aiAnalysis.redFlags))) {
                    __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({
                        key: (index),
                        ...{ class: "text-sm text-muted-foreground list-disc" },
                    });
                    (flag);
                }
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "pt-3 border-t border-border/40" },
                });
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "text-sm font-medium mb-2" },
                });
                __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                    ...{ class: "text-sm text-muted-foreground leading-relaxed" },
                });
                (sms.aiAnalysis.explanation);
            }
        }
        else if (sms.isPerfectRound) {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "p-4 rounded-lg border border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/5 ml-6 mb-3 relative" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "absolute -left-6 top-6 w-4 h-0.5 bg-green-500/50" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "absolute -left-8 top-5 w-4 h-4 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center" },
            });
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                ...{ class: "h-3 w-3 text-green-500" },
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
            });
            __VLS_asFunctionalElement(__VLS_elements.path)({
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'stroke-width': "3",
                d: "M5 13l4 4L19 7",
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-start justify-between mb-3" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-center gap-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                ...{ class: "h-5 w-5 text-green-500" },
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
            });
            __VLS_asFunctionalElement(__VLS_elements.path)({
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'stroke-width': "2",
                d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "px-2 py-1 text-xs border border-green-500/40 rounded text-green-600" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "px-2 py-1 text-xs bg-green-500/10 text-green-600 rounded" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-xs text-muted-foreground" },
            });
            (sms.timestamp);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "mt-4 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex items-center gap-2 mb-3" },
            });
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                ...{ class: "h-5 w-5 text-green-500" },
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
            });
            __VLS_asFunctionalElement(__VLS_elements.path)({
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'stroke-width': "2",
                d: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "font-semibold text-green-600" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "ml-auto px-2 py-1 text-xs border border-green-500/40 text-green-600 rounded" },
            });
            (sms.aiAnalysis.confidence);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "space-y-3" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "pt-1" },
            });
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "text-sm text-green-700 leading-relaxed" },
            });
            (sms.aiAnalysis.explanation);
            if (sms.aiAnalysis.soulAnimalInsight) {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "pt-3 border-t border-green-500/20" },
                });
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "text-sm font-medium mb-2 text-green-600" },
                });
                __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                    ...{ class: "text-sm text-green-700 leading-relaxed" },
                });
                (sms.aiAnalysis.soulAnimalInsight.insight);
            }
        }
    }
}
/** @type {__VLS_StyleScopedClasses['analyt-root']} */ ;
/** @type {__VLS_StyleScopedClasses['self-stretch']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['hacker-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-grid-pattern']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-5']} */ ;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border/40']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-background/95']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-screen-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-header']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-left']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-center']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['large']} */ ;
/** @type {__VLS_StyleScopedClasses['analyt-right']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-primary/40']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['w-8']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['to-accent']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-variant-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border/40']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-md']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-primary/20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-card']} */ ;
/** @type {__VLS_StyleScopedClasses['to-primary/5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-accent/20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-card']} */ ;
/** @type {__VLS_StyleScopedClasses['to-accent/5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-accent']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-primary/20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-card']} */ ;
/** @type {__VLS_StyleScopedClasses['to-primary/5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-accent/20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-card']} */ ;
/** @type {__VLS_StyleScopedClasses['to-accent/5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-accent']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-primary/20']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-card']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border/40']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['fraud-card']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border/40']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-primary/20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-primary/5']} */ ;
/** @type {__VLS_StyleScopedClasses['to-accent/5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-primary/20']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-primary/40']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-card']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-primary/10']} */ ;
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['border-0']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-0']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border/40']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-style-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-primary/20']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-card']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border/40']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['w-12']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['border-0']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-12']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['w-16']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-primary/20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-primary/5']} */ ;
/** @type {__VLS_StyleScopedClasses['to-accent/5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-orange-400/30']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-900/85']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-6xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-orange-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-orange-400']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-cyan-400/30']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-900/85']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-cyan-400/20']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-slate-900/90']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-cyan-400/40']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-20']} */ ;
/** @type {__VLS_StyleScopedClasses['h-20']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-slate-800/90']} */ ;
/** @type {__VLS_StyleScopedClasses['to-slate-700/90']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-cyan-400/40']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['w-16']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-cyan-300']} */ ;
/** @type {__VLS_StyleScopedClasses['to-cyan-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-clip-text']} */ ;
/** @type {__VLS_StyleScopedClasses['text-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-indigo-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['to-purple-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-indigo-300']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-indigo-400/40']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-orange-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['to-red-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-orange-300']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-orange-400/40']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-emerald-400']} */ ;
/** @type {__VLS_StyleScopedClasses['to-teal-300']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-clip-text']} */ ;
/** @type {__VLS_StyleScopedClasses['text-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-emerald-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['to-teal-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-emerald-300']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-emerald-400/40']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-slate-800/60']} */ ;
/** @type {__VLS_StyleScopedClasses['via-blue-900/50']} */ ;
/** @type {__VLS_StyleScopedClasses['to-purple-900/40']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-cyan-400/30']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-800/40']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-400/20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-orange-500']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-yellow-500']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-purple-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-800/60']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-purple-400/30']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:col-span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['w-80']} */ ;
/** @type {__VLS_StyleScopedClasses['h-80']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-2']} */ ;
/** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-purple-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-purple-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-purple-900/40']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-8']} */ ;
/** @type {__VLS_StyleScopedClasses['right-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-900/40']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-8']} */ ;
/** @type {__VLS_StyleScopedClasses['right-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-900/40']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-8']} */ ;
/** @type {__VLS_StyleScopedClasses['left-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-orange-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-orange-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-orange-900/40']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-8']} */ ;
/** @type {__VLS_StyleScopedClasses['left-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-900/40']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-purple-400']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-700/40']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-600/40']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-purple-400']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-600/20']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-purple-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-purple-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-purple-900/30']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-600/20']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-900/30']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-600/20']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-900/30']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-600/20']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-orange-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-orange-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-orange-900/30']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-600/20']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-900/30']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-600/60']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-orange-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-800/40']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-orange-400/20']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-orange-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-600/30']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-900/60']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-slate-900/70']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['w-12']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-800/90']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-600/40']} */ ;
/** @type {__VLS_StyleScopedClasses['w-8']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-teal-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-cyan-400/30']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-900/85']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-cyan-400/20']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-slate-900/90']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-cyan-400/40']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-20']} */ ;
/** @type {__VLS_StyleScopedClasses['h-20']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-slate-800/90']} */ ;
/** @type {__VLS_StyleScopedClasses['to-slate-700/90']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-cyan-400/40']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['w-16']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-cyan-300']} */ ;
/** @type {__VLS_StyleScopedClasses['to-cyan-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-clip-text']} */ ;
/** @type {__VLS_StyleScopedClasses['text-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-indigo-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['to-purple-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-indigo-300']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-indigo-400/40']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-emerald-400']} */ ;
/** @type {__VLS_StyleScopedClasses['to-teal-300']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-clip-text']} */ ;
/** @type {__VLS_StyleScopedClasses['text-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-emerald-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['to-teal-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-emerald-300']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-emerald-400/40']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-slate-800/60']} */ ;
/** @type {__VLS_StyleScopedClasses['via-blue-900/50']} */ ;
/** @type {__VLS_StyleScopedClasses['to-purple-900/40']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-cyan-400/30']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-cyan-300']} */ ;
/** @type {__VLS_StyleScopedClasses['to-purple-300']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-clip-text']} */ ;
/** @type {__VLS_StyleScopedClasses['text-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-blue-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['to-blue-400/15']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-blue-400/40']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-400']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-green-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['to-emerald-400/15']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-green-400/40']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-400']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-purple-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['to-violet-400/15']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-purple-400/40']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-purple-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-purple-400']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-orange-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['to-amber-400/15']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-orange-400/40']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-orange-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-orange-400']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-indigo-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['via-purple-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['to-pink-500/15']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-indigo-400/40']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-indigo-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-indigo-400']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-cyan-400/30']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-slate-800/40']} */ ;
/** @type {__VLS_StyleScopedClasses['to-blue-900/30']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-600/40']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['w-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-cyan-400']} */ ;
/** @type {__VLS_StyleScopedClasses['to-blue-400']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-12']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['w-16']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['to-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:from-cyan-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:to-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-6xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-400']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-6xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-400']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['to-purple-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-900/30']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-accent/20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-accent/5']} */ ;
/** @type {__VLS_StyleScopedClasses['to-primary/5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border/40']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-accent']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-card/50']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border/40']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-card/50']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border/40']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-accent']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-card/50']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border/40']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-card/50']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border/40']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-accent']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-accent/20']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-card']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border/40']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-accent']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['game-round-header']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['-left-6']} */ ;
/** @type {__VLS_StyleScopedClasses['top-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-primary/50']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['-left-8']} */ ;
/** @type {__VLS_StyleScopedClasses['top-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-primary/20']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-primary/40']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-primary/10']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-card/50']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border/40']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-card']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-accent/20']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-accent']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-accent/40']} */ ;
/** @type {__VLS_StyleScopedClasses['text-accent']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['list-disc']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border/40']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-green-500/30']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-green-500/5']} */ ;
/** @type {__VLS_StyleScopedClasses['to-emerald-500/5']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['-left-6']} */ ;
/** @type {__VLS_StyleScopedClasses['top-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-500/50']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['-left-8']} */ ;
/** @type {__VLS_StyleScopedClasses['top-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-green-500/40']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-600']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-500/10']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-600']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-green-500/10']} */ ;
/** @type {__VLS_StyleScopedClasses['to-emerald-500/10']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-green-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-600']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-green-500/40']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-600']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-700']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-green-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-700']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => ({
        ...props,
        ...{},
        ...{},
    }),
});
export default {};
//# sourceMappingURL=Analyt.vue.js.map