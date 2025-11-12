import { ref, computed, onMounted } from 'vue';
import { LayoutDashboard, MessageSquare, Settings, Users, Code, BarChart3, Gamepad2, Activity, Shield, TrendingUp } from 'lucide-vue-next';
import axios from 'axios';
// 定義 emit 事件
const emit = defineEmits(['back']);
// 定義 props 接收用戶資料
const props = defineProps({
    newUserData: {
        type: Object,
        default: null
    }
});
const activeMenu = ref('dashboard');
const currentTheme = ref('dark'); // 當前主題
// === 真實資料響應式變數 ===
const dashboardStats = ref({
    totalUsers: 0,
    activeToday: 0,
    totalQueries: 0,
    avgXP: 0,
    maxTechLevel: 0,
    loading: true,
    lastUpdate: null
});
const apiConfig = ref({
    apiManagement: {},
    modelIntegration: {},
    loading: true
});
const usersData = ref([]);
const isDataLoading = ref(true);
// API 基礎URL
const API_BASE = 'http://localhost:3002/api/admin';
// 會員資料管理
const members = ref([]);
const editingMember = ref(null);
const showEditModal = ref(false);
// === API 呼叫函數 ===
const loadDashboardData = async () => {
    try {
        dashboardStats.value.loading = true;
        const response = await axios.get(`${API_BASE}/dashboard`);
        if (response.data.success) {
            dashboardStats.value = {
                ...response.data.data,
                loading: false
            };
        }
    }
    catch (error) {
        console.error('載入 Dashboard 資料失敗:', error);
        dashboardStats.value.loading = false;
        // 使用假資料作為後備
        dashboardStats.value = {
            totalUsers: 7,
            activeToday: 3,
            totalQueries: 1247,
            avgXP: 285,
            maxTechLevel: 9,
            loading: false,
            lastUpdate: new Date().toISOString()
        };
    }
};
const loadApiConfig = async () => {
    try {
        apiConfig.value.loading = true;
        const response = await axios.get(`${API_BASE}/config`);
        if (response.data.success) {
            apiConfig.value = {
                ...response.data.data,
                loading: false
            };
        }
    }
    catch (error) {
        console.error('載入 API 配置失敗:', error);
        apiConfig.value.loading = false;
    }
};
const loadUsersData = async () => {
    try {
        isDataLoading.value = true;
        const response = await axios.get(`${API_BASE}/users`);
        if (response.data.success) {
            usersData.value = response.data.data;
        }
    }
    catch (error) {
        console.error('載入用戶資料失敗:', error);
    }
    finally {
        isDataLoading.value = false;
    }
};
// 監聽新用戶註冊
onMounted(() => {
    // 載入真實資料
    loadDashboardData();
    loadApiConfig();
    loadUsersData();
    loadAllMembers();
    // 如果有新用戶資料，加入到會員列表
    if (props.newUserData) {
        addNewMember(props.newUserData);
    }
});
// 從所有存儲的數據中載入會員
const loadAllMembers = () => {
    const allMembers = [];
    // 預設管理員帳號 (ID=0)
    allMembers.push({
        id: 0,
        username: 'test',
        email: 'test@example.com',
        password: '123',
        type: 'admin',
        registeredAt: '2024-10-01T10:00:00.000Z',
        status: 'active'
    });
    // 預設分析師帳號 (ID=1)
    allMembers.push({
        id: 1,
        username: 'white',
        email: 'white@example.com',
        password: '123',
        type: 'analyt',
        registeredAt: '2024-10-01T11:00:00.000Z',
        status: 'active'
    });
    let nextId = 2;
    // 1. 從 registeredUsers 載入註冊的用戶
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    registeredUsers.forEach(user => {
        // 檢查是否已經存在於預設帳號中
        const existingInDefaults = allMembers.find(m => m.username === user.username);
        if (!existingInDefaults) {
            allMembers.push({
                id: nextId++,
                username: user.username,
                email: user.email || `${user.username}@example.com`,
                password: user.password || '123',
                type: user.type || 'user',
                registeredAt: user.registeredAt || new Date().toISOString(),
                status: user.status || 'active'
            });
        }
    });
    // 2. 從 localStorage 獲取有遊戲活動記錄的用戶
    const possibleUsers = ['lee222', 'lee555', 'alice', 'bob', 'charlie', 'diana', 'eva', 'frank', 'grace', 'henry'];
    possibleUsers.forEach(username => {
        // 檢查是否存在用戶的靈魂動物測驗記錄
        const soulAnimalKey = `soulAnimalHistory_${username}`;
        const gameRecordKey = `gameRecords_${username}`;
        const scoreKey = `userGameScores`;
        const hasSoulAnimalRecord = localStorage.getItem(soulAnimalKey);
        const hasGameRecord = localStorage.getItem(gameRecordKey);
        const scores = JSON.parse(localStorage.getItem(scoreKey) || '{}');
        const hasScore = scores[username] !== undefined;
        // 如果用戶有任何記錄，且還不在會員列表中
        if ((hasSoulAnimalRecord || hasGameRecord || hasScore)) {
            const existingMember = allMembers.find(m => m.username === username);
            if (!existingMember) {
                allMembers.push({
                    id: nextId++,
                    username: username,
                    email: `${username}@example.com`, // 預設 email
                    password: '123', // 預設密碼
                    type: 'user',
                    registeredAt: new Date().toISOString(),
                    status: 'active'
                });
            }
        }
    });
    // 3. 從管理員手動設定的會員列表載入
    const savedMembers = localStorage.getItem('adminMembers');
    if (savedMembers) {
        const savedMembersList = JSON.parse(savedMembers);
        savedMembersList.forEach(savedMember => {
            const existing = allMembers.find(m => m.username === savedMember.username);
            if (!existing) {
                // 確保 ID 是數字且不重複
                const maxId = Math.max(...allMembers.map(m => m.id), nextId - 1);
                allMembers.push({
                    ...savedMember,
                    id: maxId + 1
                });
            }
            else {
                // 更新現有會員的資訊（但保留 ID）
                Object.assign(existing, savedMember, { id: existing.id });
            }
        });
    }
    // 重新排序 ID
    allMembers.sort((a, b) => a.id - b.id);
    allMembers.forEach((member, index) => {
        if (member.username === 'test') {
            member.id = 0; // 管理員永遠是 ID 0
        }
        else if (member.username === 'white') {
            member.id = 1; // 分析師是 ID 1
        }
        else {
            member.id = index < 2 ? index + 2 : index;
        }
    });
    members.value = allMembers;
    saveMembers();
};
// 新增會員
const addNewMember = (userData) => {
    // 檢查是否已存在
    const existingMember = members.value.find(m => m.username === userData.username || m.email === userData.email);
    if (!existingMember) {
        // 計算新的 ID
        const maxId = Math.max(...members.value.map(m => m.id), -1);
        const newMember = {
            ...userData,
            id: maxId + 1
        };
        members.value.push(newMember);
        saveMembers();
    }
};
// 儲存會員資料到 localStorage
const saveMembers = () => {
    localStorage.setItem('adminMembers', JSON.stringify(members.value));
};
// 刪除會員
const deleteMember = (memberId) => {
    if (confirm('確定要刪除這個會員嗎？')) {
        members.value = members.value.filter(m => m.id !== memberId);
        saveMembers();
    }
};
// 更新會員狀態
const updateMemberStatus = (memberId, newStatus) => {
    const member = members.value.find(m => m.id === memberId);
    if (member) {
        member.status = newStatus;
        saveMembers();
    }
};
// 格式化日期
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};
// 獲取會員類型標籤
const getMemberTypeLabel = (type) => {
    const labels = {
        'admin': '管理員',
        'analyt': '分析師',
        'user': '一般用戶'
    };
    return labels[type] || '未知';
};
// 獲取狀態顏色
const getStatusColor = (status) => {
    const colors = {
        'active': 'text-green-400',
        'inactive': 'text-gray-400',
        'suspended': 'text-red-400'
    };
    return colors[status] || 'text-gray-400';
};
// 編輯會員
const editMember = (member) => {
    editingMember.value = { ...member }; // 創建副本避免直接修改
    showEditModal.value = true;
};
// 保存編輯
const saveEdit = () => {
    if (editingMember.value) {
        const index = members.value.findIndex(m => m.id === editingMember.value.id);
        if (index !== -1) {
            // 只允許修改特定欄位
            members.value[index].username = editingMember.value.username;
            members.value[index].email = editingMember.value.email;
            members.value[index].type = editingMember.value.type;
            saveMembers();
        }
    }
    closeEditModal();
};
// 取消編輯
const closeEditModal = () => {
    editingMember.value = null;
    showEditModal.value = false;
};
// 主題配色方案
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
    emerald: {
        name: '翠綠模式',
        sidebar: 'bg-gradient-to-b from-emerald-900 to-teal-900',
        sidebarBorder: 'border-teal-700',
        main: 'bg-gradient-to-br from-emerald-950 to-teal-950',
        card: 'bg-gradient-to-br from-emerald-800/40 to-teal-800/40 border-teal-600/50',
        cardHover: 'hover:from-emerald-700/60 hover:to-teal-700/60',
        activeButton: 'bg-gradient-to-r from-emerald-500 to-teal-600',
        text: 'text-white',
        textSecondary: 'text-emerald-200',
        input: 'bg-emerald-900/50 border-teal-600 text-white',
        gradient: 'from-emerald-800 to-teal-900'
    }
};
// 計算當前主題樣式
const currentThemeStyles = computed(() => themes[currentTheme.value]);
// 切換主題函數
const setTheme = (themeName) => {
    currentTheme.value = themeName;
};
const menuItems = [
    { id: 'dashboard', label: '數據分析', icon: LayoutDashboard },
    { id: 'sms', label: '簡訊資料庫', icon: MessageSquare },
    { id: 'members', label: '會員管理', icon: Users },
    { id: 'api', label: 'API 管理', icon: Settings },
    { id: 'models', label: '模型整合', icon: Activity },
    { id: 'code', label: '程式碼管理', icon: Code },
    { id: 'game', label: '遊戲管理', icon: Gamepad2 },
    { id: 'settings', label: '介面設定', icon: Settings },
];
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
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "min-h-screen w-screen transition-all duration-500 overflow-x-hidden flex" },
    ...{ class: (__VLS_ctx.currentThemeStyles.main) },
});
// @ts-ignore
[currentThemeStyles,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "w-64 h-screen border-r p-4 transition-all duration-500 z-30 flex-shrink-0 flex flex-col" },
    ...{ class: ([__VLS_ctx.currentThemeStyles.sidebar, __VLS_ctx.currentThemeStyles.sidebarBorder]) },
});
// @ts-ignore
[currentThemeStyles, currentThemeStyles,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "mb-8" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
    ...{ class: "text-2xl font-bold transition-colors duration-300" },
    ...{ class: (__VLS_ctx.currentThemeStyles.text) },
});
// @ts-ignore
[currentThemeStyles,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "text-sm transition-colors duration-300" },
    ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
});
// @ts-ignore
[currentThemeStyles,];
__VLS_asFunctionalElement(__VLS_elements.nav, __VLS_elements.nav)({
    ...{ class: "space-y-2 flex-1" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.menuItems))) {
    // @ts-ignore
    [menuItems,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.activeMenu = item.id;
                // @ts-ignore
                [activeMenu,];
            } },
        key: (item.id),
        ...{ class: ([
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300',
                __VLS_ctx.activeMenu === item.id ? [__VLS_ctx.currentThemeStyles.activeButton, __VLS_ctx.currentThemeStyles.text] : [__VLS_ctx.currentThemeStyles.textSecondary, __VLS_ctx.currentThemeStyles.cardHover]
            ]) },
    });
    // @ts-ignore
    [currentThemeStyles, currentThemeStyles, currentThemeStyles, currentThemeStyles, activeMenu,];
    const __VLS_0 = ((item.icon));
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        size: (20),
    }));
    const __VLS_2 = __VLS_1({
        size: (20),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (item.label);
}
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('back');
            // @ts-ignore
            [$emit,];
        } },
    ...{ class: "mt-auto mx-4 mb-4 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 border border-red-400" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "relative flex items-center justify-center gap-2" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    ...{ class: "w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" },
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    'stroke-width': "2",
    d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "font-semibold" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex-1 p-8 min-h-screen transition-all duration-500 overflow-y-auto" },
    ...{ class: (__VLS_ctx.currentThemeStyles.main) },
});
// @ts-ignore
[currentThemeStyles,];
if (__VLS_ctx.activeMenu === 'dashboard') {
    // @ts-ignore
    [activeMenu,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: (['text-3xl font-bold mb-6 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid md:grid-cols-5 gap-6 mb-8" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_5 = {}.Users;
    /** @type {[typeof __VLS_components.Users, ]} */ ;
    // @ts-ignore
    Users;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        size: (20),
        ...{ class: "text-blue-500" },
    }));
    const __VLS_7 = __VLS_6({
        size: (20),
        ...{ class: "text-blue-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: (['text-3xl font-bold transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.dashboardStats.loading ? '載入中...' : __VLS_ctx.dashboardStats.totalUsers);
    // @ts-ignore
    [dashboardStats, dashboardStats,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-green-500 mt-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_10 = {}.Activity;
    /** @type {[typeof __VLS_components.Activity, ]} */ ;
    // @ts-ignore
    Activity;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
        size: (20),
        ...{ class: "text-purple-500" },
    }));
    const __VLS_12 = __VLS_11({
        size: (20),
        ...{ class: "text-purple-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: (['text-3xl font-bold transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.dashboardStats.loading ? '載入中...' : __VLS_ctx.dashboardStats.totalQueries.toLocaleString());
    // @ts-ignore
    [dashboardStats, dashboardStats,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-green-500 mt-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_15 = {}.Shield;
    /** @type {[typeof __VLS_components.Shield, ]} */ ;
    // @ts-ignore
    Shield;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
        size: (20),
        ...{ class: "text-green-500" },
    }));
    const __VLS_17 = __VLS_16({
        size: (20),
        ...{ class: "text-green-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: (['text-3xl font-bold transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.dashboardStats.loading ? '載入中...' : __VLS_ctx.dashboardStats.avgXP);
    // @ts-ignore
    [dashboardStats, dashboardStats,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-green-500 mt-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_20 = {}.TrendingUp;
    /** @type {[typeof __VLS_components.TrendingUp, ]} */ ;
    // @ts-ignore
    TrendingUp;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        size: (20),
        ...{ class: "text-yellow-500" },
    }));
    const __VLS_22 = __VLS_21({
        size: (20),
        ...{ class: "text-yellow-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: (['text-3xl font-bold transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.dashboardStats.loading ? '載入中...' : `Lv.${__VLS_ctx.dashboardStats.maxTechLevel}`);
    // @ts-ignore
    [dashboardStats, dashboardStats,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-green-500 mt-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_25 = {}.BarChart3;
    /** @type {[typeof __VLS_components.BarChart3, ]} */ ;
    // @ts-ignore
    BarChart3;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        size: (20),
        ...{ class: "text-cyan-500" },
    }));
    const __VLS_27 = __VLS_26({
        size: (20),
        ...{ class: "text-cyan-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: (['text-3xl font-bold transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.dashboardStats.loading ? '載入中...' : __VLS_ctx.dashboardStats.activeToday);
    // @ts-ignore
    [dashboardStats, dashboardStats,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-green-500 mt-2" },
    });
}
if (__VLS_ctx.activeMenu === 'sms') {
    // @ts-ignore
    [activeMenu,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: (['text-3xl font-bold mb-6 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between items-center mb-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "text",
        placeholder: "搜尋簡訊...",
        ...{ class: (['px-4 py-2 rounded-lg w-96 transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ class: (['px-4 py-2 rounded-lg transition-all duration-300', __VLS_ctx.currentThemeStyles.activeButton, __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles, currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-2" },
    });
    for (const [i] of __VLS_getVForSourceType((5))) {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (i),
            ...{ class: (['p-4 rounded-lg flex justify-between items-center transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
        });
        // @ts-ignore
        [currentThemeStyles,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: (['font-semibold transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
        });
        // @ts-ignore
        [currentThemeStyles,];
        (i);
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: (['text-sm transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
        });
        // @ts-ignore
        [currentThemeStyles,];
        (Math.floor(Math.random() * 100));
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex gap-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ class: "px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ class: "px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm" },
        });
    }
}
if (__VLS_ctx.activeMenu === 'members') {
    // @ts-ignore
    [activeMenu,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: (['text-3xl font-bold mb-6 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid md:grid-cols-4 gap-6 mb-8" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_30 = {}.Users;
    /** @type {[typeof __VLS_components.Users, ]} */ ;
    // @ts-ignore
    Users;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
        size: (20),
        ...{ class: "text-blue-500" },
    }));
    const __VLS_32 = __VLS_31({
        size: (20),
        ...{ class: "text-blue-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: (['text-3xl font-bold transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.members.length);
    // @ts-ignore
    [members,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-green-500 mt-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_35 = {}.Shield;
    /** @type {[typeof __VLS_components.Shield, ]} */ ;
    // @ts-ignore
    Shield;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
        size: (20),
        ...{ class: "text-purple-500" },
    }));
    const __VLS_37 = __VLS_36({
        size: (20),
        ...{ class: "text-purple-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: (['text-3xl font-bold transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.members.filter(m => m.type === 'admin').length);
    // @ts-ignore
    [members,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-blue-500 mt-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_40 = {}.Activity;
    /** @type {[typeof __VLS_components.Activity, ]} */ ;
    // @ts-ignore
    Activity;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        size: (20),
        ...{ class: "text-green-500" },
    }));
    const __VLS_42 = __VLS_41({
        size: (20),
        ...{ class: "text-green-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: (['text-3xl font-bold transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.members.filter(m => m.type === 'analyt').length);
    // @ts-ignore
    [members,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-green-500 mt-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_45 = {}.Users;
    /** @type {[typeof __VLS_components.Users, ]} */ ;
    // @ts-ignore
    Users;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        size: (20),
        ...{ class: "text-yellow-500" },
    }));
    const __VLS_47 = __VLS_46({
        size: (20),
        ...{ class: "text-yellow-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: (['text-3xl font-bold transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.members.filter(m => m.type === 'user').length);
    // @ts-ignore
    [members,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-yellow-500 mt-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between items-center mb-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: (['text-xl font-semibold transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex gap-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "text",
        placeholder: "搜尋會員...",
        ...{ class: (['px-4 py-2 rounded-lg w-64 transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ class: (['px-4 py-2 rounded-lg transition-all duration-300', __VLS_ctx.currentThemeStyles.activeButton, __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles, currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "overflow-x-auto" },
    });
    __VLS_asFunctionalElement(__VLS_elements.table, __VLS_elements.table)({
        ...{ class: "w-full text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.thead, __VLS_elements.thead)({});
    __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
        ...{ class: (['border-b transition-colors duration-300', __VLS_ctx.currentTheme === 'light' ? 'border-gray-200' : 'border-gray-700']) },
    });
    // @ts-ignore
    [currentTheme,];
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
        ...{ class: (['text-left py-3 px-4 font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
        ...{ class: (['text-left py-3 px-4 font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
        ...{ class: (['text-left py-3 px-4 font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
        ...{ class: (['text-left py-3 px-4 font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
        ...{ class: (['text-left py-3 px-4 font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
        ...{ class: (['text-left py-3 px-4 font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
        ...{ class: (['text-left py-3 px-4 font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.tbody, __VLS_elements.tbody)({});
    for (const [member] of __VLS_getVForSourceType((__VLS_ctx.members))) {
        // @ts-ignore
        [members,];
        __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
            key: (member.id),
            ...{ class: (['border-b transition-colors duration-300 hover:bg-opacity-50',
                    __VLS_ctx.currentTheme === 'light' ? 'border-gray-100 hover:bg-gray-100' : 'border-gray-800 hover:bg-gray-800']) },
        });
        // @ts-ignore
        [currentTheme,];
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            ...{ class: (['py-3 px-4 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
        });
        // @ts-ignore
        [currentThemeStyles,];
        (member.id);
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            ...{ class: (['py-3 px-4 font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
        });
        // @ts-ignore
        [currentThemeStyles,];
        (member.username);
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            ...{ class: (['py-3 px-4 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
        });
        // @ts-ignore
        [currentThemeStyles,];
        (member.email);
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            ...{ class: "py-3 px-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: ([
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    member.type === 'admin' ? 'bg-purple-100 text-purple-800' :
                        member.type === 'analyt' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                ]) },
        });
        (__VLS_ctx.getMemberTypeLabel(member.type));
        // @ts-ignore
        [getMemberTypeLabel,];
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            ...{ class: "py-3 px-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: (['text-sm font-medium', __VLS_ctx.getStatusColor(member.status)]) },
        });
        // @ts-ignore
        [getStatusColor,];
        (member.status === 'active' ? '活躍' : member.status === 'inactive' ? '未活躍' : '停權');
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            ...{ class: (['py-3 px-4 text-sm transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
        });
        // @ts-ignore
        [currentThemeStyles,];
        (__VLS_ctx.formatDate(member.registeredAt));
        // @ts-ignore
        [formatDate,];
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            ...{ class: "py-3 px-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex gap-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeMenu === 'members'))
                        return;
                    __VLS_ctx.editMember(member);
                    // @ts-ignore
                    [editMember,];
                } },
            ...{ class: "px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeMenu === 'members'))
                        return;
                    __VLS_ctx.updateMemberStatus(member.id, member.status === 'active' ? 'inactive' : 'active');
                    // @ts-ignore
                    [updateMemberStatus,];
                } },
            ...{ class: ([
                    'px-3 py-1 text-xs rounded transition-colors',
                    member.status === 'active' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                ]) },
        });
        (member.status === 'active' ? '停用' : '啟用');
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeMenu === 'members'))
                        return;
                    __VLS_ctx.deleteMember(member.id);
                    // @ts-ignore
                    [deleteMember,];
                } },
            ...{ class: "px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" },
        });
    }
    if (__VLS_ctx.members.length === 0) {
        // @ts-ignore
        [members,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-center py-12" },
        });
        const __VLS_50 = {}.Users;
        /** @type {[typeof __VLS_components.Users, ]} */ ;
        // @ts-ignore
        Users;
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
            size: (48),
            ...{ class: (['mx-auto mb-4 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
        }));
        const __VLS_52 = __VLS_51({
            size: (48),
            ...{ class: (['mx-auto mb-4 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_51));
        // @ts-ignore
        [currentThemeStyles,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: (['text-lg font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
        });
        // @ts-ignore
        [currentThemeStyles,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: (['text-sm transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
        });
        // @ts-ignore
        [currentThemeStyles,];
    }
}
if (__VLS_ctx.activeMenu === 'api') {
    // @ts-ignore
    [activeMenu,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: (['text-3xl font-bold mb-6 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: (['text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_55 = {}.Activity;
    /** @type {[typeof __VLS_components.Activity, ]} */ ;
    // @ts-ignore
    Activity;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
        size: (24),
        ...{ class: "text-blue-500" },
    }));
    const __VLS_57 = __VLS_56({
        size: (24),
        ...{ class: "text-blue-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid md:grid-cols-3 gap-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['p-4 rounded-lg border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['font-medium mb-3 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-2 text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.text) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.apiConfig.loading ? '載入中...' : `${__VLS_ctx.apiConfig.apiManagement?.tokenQuota?.used || 0} tokens`);
    // @ts-ignore
    [apiConfig, apiConfig,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.text) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.apiConfig.loading ? '載入中...' : `${__VLS_ctx.apiConfig.apiManagement?.tokenQuota?.daily || 0} tokens`);
    // @ts-ignore
    [apiConfig, apiConfig,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-green-500" },
    });
    (__VLS_ctx.apiConfig.loading ? '載入中...' : `${(__VLS_ctx.apiConfig.apiManagement?.tokenQuota?.daily || 0) - (__VLS_ctx.apiConfig.apiManagement?.tokenQuota?.used || 0)} tokens`);
    // @ts-ignore
    [apiConfig, apiConfig, apiConfig,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['p-4 rounded-lg border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['font-medium mb-3 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-2 text-sm" },
    });
    if (__VLS_ctx.isDataLoading) {
        // @ts-ignore
        [isDataLoading,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
        });
        // @ts-ignore
        [currentThemeStyles,];
    }
    else if (__VLS_ctx.usersData.length === 0) {
        // @ts-ignore
        [usersData,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
        });
        // @ts-ignore
        [currentThemeStyles,];
    }
    else {
        for (const [user] of __VLS_getVForSourceType((__VLS_ctx.usersData.slice(0, 5)))) {
            // @ts-ignore
            [usersData,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (user.username),
                ...{ class: "flex justify-between" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
            });
            // @ts-ignore
            [currentThemeStyles,];
            (user.username);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: (__VLS_ctx.currentThemeStyles.text) },
            });
            // @ts-ignore
            [currentThemeStyles,];
            (user.gameCount);
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['p-4 rounded-lg border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['font-medium mb-3 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-2 text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.text) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.apiConfig.loading ? '載入中...' : `${__VLS_ctx.apiConfig.apiManagement?.apiKeys?.filter(k => k.status === 'active').length || 0}/${__VLS_ctx.apiConfig.apiManagement?.apiKeys?.length || 0}`);
    // @ts-ignore
    [apiConfig, apiConfig, apiConfig,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.text) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.dashboardStats.totalQueries.toLocaleString());
    // @ts-ignore
    [dashboardStats,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-green-500" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between items-center mb-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: (['text-xl font-semibold flex items-center gap-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_60 = {}.Shield;
    /** @type {[typeof __VLS_components.Shield, ]} */ ;
    // @ts-ignore
    Shield;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        size: (24),
        ...{ class: "text-green-500" },
    }));
    const __VLS_62 = __VLS_61({
        size: (24),
        ...{ class: "text-green-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ class: (['px-4 py-2 rounded-lg transition-all duration-300', __VLS_ctx.currentThemeStyles.activeButton, __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles, currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "overflow-x-auto" },
    });
    __VLS_asFunctionalElement(__VLS_elements.table, __VLS_elements.table)({
        ...{ class: "w-full text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.thead, __VLS_elements.thead)({});
    __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
        ...{ class: (['border-b transition-colors duration-300', __VLS_ctx.currentTheme === 'light' ? 'border-gray-200' : 'border-gray-700']) },
    });
    // @ts-ignore
    [currentTheme,];
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
        ...{ class: (['text-left py-3 px-4 font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
        ...{ class: (['text-left py-3 px-4 font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
        ...{ class: (['text-left py-3 px-4 font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
        ...{ class: (['text-left py-3 px-4 font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
        ...{ class: (['text-left py-3 px-4 font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
        ...{ class: (['text-left py-3 px-4 font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.tbody, __VLS_elements.tbody)({});
    if (__VLS_ctx.apiConfig.loading) {
        // @ts-ignore
        [apiConfig,];
        __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            colspan: "6",
            ...{ class: "py-6 text-center" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
        });
        // @ts-ignore
        [currentThemeStyles,];
    }
    else if (!__VLS_ctx.apiConfig.apiManagement?.apiKeys?.length) {
        // @ts-ignore
        [apiConfig,];
        __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            colspan: "6",
            ...{ class: "py-6 text-center" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
        });
        // @ts-ignore
        [currentThemeStyles,];
    }
    else {
        for (const [apiKey] of __VLS_getVForSourceType((__VLS_ctx.apiConfig.apiManagement.apiKeys))) {
            // @ts-ignore
            [apiConfig,];
            __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
                key: (apiKey.id),
                ...{ class: (['border-b transition-colors duration-300 hover:bg-opacity-50', __VLS_ctx.currentTheme === 'light' ? 'border-gray-100 hover:bg-gray-100' : 'border-gray-800 hover:bg-gray-800']) },
            });
            // @ts-ignore
            [currentTheme,];
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
                ...{ class: (['py-3 px-4 font-mono text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
            });
            // @ts-ignore
            [currentThemeStyles,];
            (apiKey.id);
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
                ...{ class: (['py-3 px-4 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
            });
            // @ts-ignore
            [currentThemeStyles,];
            (apiKey.name);
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800" },
            });
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
                ...{ class: (['py-3 px-4 text-sm transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
            });
            // @ts-ignore
            [currentThemeStyles,];
            (apiKey.created);
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: ([
                        'text-sm font-medium',
                        apiKey.status === 'active' ? 'text-green-500' :
                            apiKey.status === 'standby' ? 'text-yellow-500' : 'text-red-500'
                    ]) },
            });
            (apiKey.status === 'active' ? '活躍' : apiKey.status === 'standby' ? '待機' : '停用');
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
                ...{ class: "py-3 px-4" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "flex gap-2" },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ class: "px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs" },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ class: "px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs" },
            });
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: (['text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_65 = {}.TrendingUp;
    /** @type {[typeof __VLS_components.TrendingUp, ]} */ ;
    // @ts-ignore
    TrendingUp;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        size: (24),
        ...{ class: "text-yellow-500" },
    }));
    const __VLS_67 = __VLS_66({
        size: (24),
        ...{ class: "text-yellow-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid md:grid-cols-3 gap-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['p-4 rounded-lg border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['font-medium mb-3 text-blue-400 transition-colors duration-300']) },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: (['text-xs mb-3 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        value: (__VLS_ctx.apiConfig.loading ? '' : (__VLS_ctx.apiConfig.apiManagement?.rateLimits?.systemProtection?.globalLimit || 1000)),
        ...{ class: (['w-full px-3 py-2 rounded transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
        placeholder: (__VLS_ctx.apiConfig.loading ? '載入中...' : '1000'),
    });
    // @ts-ignore
    [currentThemeStyles, apiConfig, apiConfig, apiConfig,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: (['text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.apiConfig.loading ? '載入中...' : (__VLS_ctx.apiConfig.apiManagement?.rateLimits?.systemProtection?.description || '防止系統過載'));
    // @ts-ignore
    [apiConfig, apiConfig,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['p-4 rounded-lg border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['font-medium mb-3 text-green-400 transition-colors duration-300']) },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: (['text-xs mb-3 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        value: "100",
        ...{ class: (['w-full px-3 py-2 rounded transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        value: "50000",
        ...{ class: (['w-full px-3 py-2 rounded transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['p-4 rounded-lg border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['font-medium mb-3 text-purple-400 transition-colors duration-300']) },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: (['text-xs mb-3 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        value: "5000",
        ...{ class: (['w-full px-3 py-2 rounded transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        value: "1000",
        ...{ class: (['w-full px-3 py-2 rounded transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        value: "8000",
        ...{ class: (['w-full px-3 py-2 rounded transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['mt-6 p-4 rounded-lg border-l-4 border-blue-500 transition-all duration-300', __VLS_ctx.currentTheme === 'light' ? 'bg-blue-50' : 'bg-blue-900/20']) },
    });
    // @ts-ignore
    [currentTheme,];
    __VLS_asFunctionalElement(__VLS_elements.h5, __VLS_elements.h5)({
        ...{ class: (['font-medium mb-2 text-blue-400']) },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['text-sm space-y-1 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
}
if (__VLS_ctx.activeMenu === 'models') {
    // @ts-ignore
    [activeMenu,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: (['text-3xl font-bold mb-6 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: (['text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_70 = {}.Activity;
    /** @type {[typeof __VLS_components.Activity, ]} */ ;
    // @ts-ignore
    Activity;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
        size: (24),
        ...{ class: "text-purple-500" },
    }));
    const __VLS_72 = __VLS_71({
        size: (24),
        ...{ class: "text-purple-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid md:grid-cols-3 gap-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['p-4 rounded-lg border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-3 h-3 bg-green-500 rounded-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-2 text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-green-500" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.text) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.text) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-green-500" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['p-4 rounded-lg border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-3 h-3 bg-yellow-500 rounded-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-2 text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-yellow-500" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.text) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.text) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-green-500" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['p-4 rounded-lg border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['font-medium transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-3 h-3 bg-red-500 rounded-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-2 text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-red-500" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.text) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.text) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-red-500" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: (['text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_75 = {}.Shield;
    /** @type {[typeof __VLS_components.Shield, ]} */ ;
    // @ts-ignore
    Shield;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
        size: (24),
        ...{ class: "text-blue-500" },
    }));
    const __VLS_77 = __VLS_76({
        size: (24),
        ...{ class: "text-blue-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['p-4 rounded-lg border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['font-medium mb-3 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid md:grid-cols-3 gap-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-sm font-medium mb-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "password",
        value: "sk-proj-***",
        ...{ class: (['w-full px-3 py-2 rounded-lg transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-sm font-medium mb-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
        ...{ class: (['w-full px-3 py-2 rounded-lg transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({});
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-sm font-medium mb-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
        ...{ class: (['w-full px-3 py-2 rounded-lg transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({});
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({});
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['p-4 rounded-lg border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['font-medium mb-3 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid md:grid-cols-3 gap-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-sm font-medium mb-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "password",
        value: "AIza***",
        ...{ class: (['w-full px-3 py-2 rounded-lg transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-sm font-medium mb-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
        ...{ class: (['w-full px-3 py-2 rounded-lg transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({});
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-sm font-medium mb-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
        ...{ class: (['w-full px-3 py-2 rounded-lg transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({});
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between items-center mb-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: (['text-xl font-semibold flex items-center gap-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_80 = {}.TrendingUp;
    /** @type {[typeof __VLS_components.TrendingUp, ]} */ ;
    // @ts-ignore
    TrendingUp;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        size: (24),
        ...{ class: "text-green-500" },
    }));
    const __VLS_82 = __VLS_81({
        size: (24),
        ...{ class: "text-green-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ class: (['px-4 py-2 rounded-lg transition-all duration-300', __VLS_ctx.currentThemeStyles.activeButton, __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles, currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid md:grid-cols-2 gap-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['p-4 rounded-lg border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['font-medium mb-3 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center gap-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-2 h-2 bg-green-500 rounded-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.text) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center gap-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-2 h-2 bg-yellow-500 rounded-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.text) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center gap-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-2 h-2 bg-red-500 rounded-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-red-500" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['p-4 rounded-lg border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['font-medium mb-3 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-green-500" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-green-500" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.textSecondary) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-red-500" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: (['text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_85 = {}.Settings;
    /** @type {[typeof __VLS_components.Settings, ]} */ ;
    // @ts-ignore
    Settings;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
        size: (24),
        ...{ class: "text-orange-500" },
    }));
    const __VLS_87 = __VLS_86({
        size: (24),
        ...{ class: "text-orange-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid md:grid-cols-2 gap-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['p-4 rounded-lg border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['font-medium mb-3 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between p-3 rounded border" },
        ...{ class: (__VLS_ctx.currentTheme === 'light' ? 'border-gray-200 bg-green-50' : 'border-gray-700 bg-green-900/20') },
    });
    // @ts-ignore
    [currentTheme,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center gap-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "w-6 h-6 bg-green-500 text-white rounded text-xs flex items-center justify-center font-bold" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.text) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-green-500 text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between p-3 rounded border" },
        ...{ class: (__VLS_ctx.currentTheme === 'light' ? 'border-gray-200 bg-yellow-50' : 'border-gray-700 bg-yellow-900/20') },
    });
    // @ts-ignore
    [currentTheme,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center gap-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "w-6 h-6 bg-yellow-500 text-white rounded text-xs flex items-center justify-center font-bold" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.text) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-yellow-500 text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between p-3 rounded border" },
        ...{ class: (__VLS_ctx.currentTheme === 'light' ? 'border-gray-200 bg-red-50' : 'border-gray-700 bg-red-900/20') },
    });
    // @ts-ignore
    [currentTheme,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center gap-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "w-6 h-6 bg-red-500 text-white rounded text-xs flex items-center justify-center font-bold" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (__VLS_ctx.currentThemeStyles.text) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-red-500 text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['p-4 rounded-lg border transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['font-medium mb-3 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-sm font-medium mb-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        value: "3",
        ...{ class: (['w-full px-3 py-2 rounded transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-sm font-medium mb-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        value: "5",
        ...{ class: (['w-full px-3 py-2 rounded transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-sm font-medium mb-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        value: "5",
        ...{ class: (['w-full px-3 py-2 rounded transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
}
if (__VLS_ctx.activeMenu === 'code') {
    // @ts-ignore
    [activeMenu,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: "text-3xl font-bold text-white mb-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "bg-gray-800 rounded-xl p-6 border border-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center gap-4 mb-4" },
    });
    const __VLS_90 = {}.Code;
    /** @type {[typeof __VLS_components.Code, ]} */ ;
    // @ts-ignore
    Code;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
        size: (24),
        ...{ class: "text-blue-500" },
    }));
    const __VLS_92 = __VLS_91({
        size: (24),
        ...{ class: "text-blue-500" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "text-xl font-semibold text-white" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-gray-400" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        className: "mt-2",
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mt-4 flex gap-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ class: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ class: "px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg" },
    });
}
if (__VLS_ctx.activeMenu === 'game') {
    // @ts-ignore
    [activeMenu,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: "text-3xl font-bold text-white mb-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "bg-gray-800 rounded-xl p-6 border border-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "text-xl font-semibold text-white mb-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-gray-300" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ class: "w-12 h-6 bg-green-600 rounded-full relative" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "absolute right-1 top-1 w-4 h-4 bg-white rounded-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-gray-300" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ class: "w-12 h-6 bg-green-600 rounded-full relative" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "absolute right-1 top-1 w-4 h-4 bg-white rounded-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "block text-sm text-gray-400 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        value: "10",
        ...{ class: "w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" },
    });
}
if (__VLS_ctx.activeMenu === 'settings') {
    // @ts-ignore
    [activeMenu,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "max-w-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: (['text-3xl font-bold mb-6 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border w-full transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: (['text-xl font-semibold mb-6 flex items-center gap-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    const __VLS_95 = {}.Settings;
    /** @type {[typeof __VLS_components.Settings, ]} */ ;
    // @ts-ignore
    Settings;
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({
        size: (24),
        ...{ class: "text-cyan-400" },
    }));
    const __VLS_97 = __VLS_96({
        size: (24),
        ...{ class: "text-cyan-400" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeMenu === 'settings'))
                    return;
                __VLS_ctx.setTheme('dark');
                // @ts-ignore
                [setTheme,];
            } },
        ...{ class: ([
                'p-4 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                __VLS_ctx.currentTheme === 'dark' ? 'border-green-500 ring-2 ring-green-300' : 'border-gray-700 hover:border-gray-500',
                __VLS_ctx.currentThemeStyles.card
            ]) },
    });
    // @ts-ignore
    [currentThemeStyles, currentTheme,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-full h-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded mb-3 shadow-lg" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: ([__VLS_ctx.currentThemeStyles.text, 'text-center font-medium']) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: ([__VLS_ctx.currentThemeStyles.textSecondary, 'text-xs text-center mt-1']) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeMenu === 'settings'))
                    return;
                __VLS_ctx.setTheme('light');
                // @ts-ignore
                [setTheme,];
            } },
        ...{ class: ([
                'p-4 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                __VLS_ctx.currentTheme === 'light' ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-700 hover:border-gray-500',
                __VLS_ctx.currentThemeStyles.card
            ]) },
    });
    // @ts-ignore
    [currentThemeStyles, currentTheme,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-full h-20 bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded mb-3 shadow-lg border border-gray-200" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: ([__VLS_ctx.currentThemeStyles.text, 'text-center font-medium']) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: ([__VLS_ctx.currentThemeStyles.textSecondary, 'text-xs text-center mt-1']) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeMenu === 'settings'))
                    return;
                __VLS_ctx.setTheme('purple');
                // @ts-ignore
                [setTheme,];
            } },
        ...{ class: ([
                'p-4 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                __VLS_ctx.currentTheme === 'purple' ? 'border-purple-500 ring-2 ring-purple-300' : 'border-gray-700 hover:border-gray-500',
                __VLS_ctx.currentThemeStyles.card
            ]) },
    });
    // @ts-ignore
    [currentThemeStyles, currentTheme,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-full h-20 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 rounded mb-3 shadow-lg" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: ([__VLS_ctx.currentThemeStyles.text, 'text-center font-medium']) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: ([__VLS_ctx.currentThemeStyles.textSecondary, 'text-xs text-center mt-1']) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeMenu === 'settings'))
                    return;
                __VLS_ctx.setTheme('emerald');
                // @ts-ignore
                [setTheme,];
            } },
        ...{ class: ([
                'p-4 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all duration-200',
                __VLS_ctx.currentTheme === 'emerald' ? 'border-emerald-500 ring-2 ring-emerald-300' : 'border-gray-700 hover:border-gray-500',
                __VLS_ctx.currentThemeStyles.card
            ]) },
    });
    // @ts-ignore
    [currentThemeStyles, currentTheme,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-full h-20 bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-800 rounded mb-3 shadow-lg" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: ([__VLS_ctx.currentThemeStyles.text, 'text-center font-medium']) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: ([__VLS_ctx.currentThemeStyles.textSecondary, 'text-xs text-center mt-1']) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 border w-full transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: (['text-xl font-semibold mb-6 flex items-center gap-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-6 h-6 bg-gradient-to-r from-red-500 to-purple-500 rounded-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mb-8" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: (['text-lg font-medium mb-4 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex flex-col items-center space-y-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['text-sm transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "color",
        value: "#10b981",
        ...{ class: "w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600 hover:border-gray-400 transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex flex-col items-center space-y-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['text-sm transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "color",
        value: "#3b82f6",
        ...{ class: "w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600 hover:border-gray-400 transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['text-xs transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex flex-col items-center space-y-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "text-sm text-gray-400" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "color",
        value: "#f59e0b",
        ...{ class: "w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600 hover:border-gray-400 transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-xs text-gray-500" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex flex-col items-center space-y-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "text-sm text-gray-400" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "color",
        value: "#ef4444",
        ...{ class: "w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600 hover:border-gray-400 transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-xs text-gray-500" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex flex-col items-center space-y-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "text-sm text-gray-400" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "color",
        value: "#22c55e",
        ...{ class: "w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600 hover:border-gray-400 transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-xs text-gray-500" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex flex-col items-center space-y-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "text-sm text-gray-400" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "color",
        value: "#06b6d4",
        ...{ class: "w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600 hover:border-gray-400 transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-xs text-gray-500" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mb-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: "text-lg font-medium text-gray-200 mb-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-blue-500 cursor-pointer transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center space-x-3 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-6 h-6 bg-blue-500 rounded-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-white font-medium" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex space-x-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-blue-500 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-blue-400 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-blue-600 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-blue-700 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-green-500 cursor-pointer transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center space-x-3 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-6 h-6 bg-green-500 rounded-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-white font-medium" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex space-x-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-green-500 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-green-400 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-emerald-500 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-teal-500 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center space-x-3 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-6 h-6 bg-purple-500 rounded-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-white font-medium" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex space-x-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-purple-500 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-purple-400 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-indigo-500 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-violet-500 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-red-500 cursor-pointer transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center space-x-3 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-6 h-6 bg-red-500 rounded-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-white font-medium" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex space-x-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-red-500 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-red-400 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-rose-500 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-pink-500 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-orange-500 cursor-pointer transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center space-x-3 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-6 h-6 bg-orange-500 rounded-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-white font-medium" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex space-x-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-orange-500 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-orange-400 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-amber-500 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-yellow-500 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-cyan-500 cursor-pointer transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center space-x-3 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-6 h-6 bg-cyan-500 rounded-full" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-white font-medium" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex space-x-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-cyan-500 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-cyan-400 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-sky-500 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-4 h-4 bg-blue-400 rounded-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-end space-x-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ class: "px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ class: "px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all transform hover:scale-105" },
    });
}
if (__VLS_ctx.showEditModal) {
    // @ts-ignore
    [showEditModal,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['rounded-xl p-6 w-96 max-w-lg mx-4 transition-all duration-300', __VLS_ctx.currentThemeStyles.card]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: (['text-xl font-semibold mb-4 transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-sm font-medium mb-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.input)({
        value: (__VLS_ctx.editingMember.username),
        type: "text",
        ...{ class: (['w-full px-3 py-2 rounded-lg transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
        placeholder: "請輸入帳號名稱",
    });
    // @ts-ignore
    [currentThemeStyles, editingMember,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-sm font-medium mb-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "email",
        ...{ class: (['w-full px-3 py-2 rounded-lg transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
        placeholder: "請輸入電子郵件",
    });
    (__VLS_ctx.editingMember.email);
    // @ts-ignore
    [currentThemeStyles, editingMember,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: (['block text-sm font-medium mb-2 transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
        value: (__VLS_ctx.editingMember.type),
        ...{ class: (['w-full px-3 py-2 rounded-lg transition-all duration-300', __VLS_ctx.currentThemeStyles.input]) },
    });
    // @ts-ignore
    [currentThemeStyles, editingMember,];
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "user",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "analyt",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "admin",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "pt-4 border-t" },
        ...{ class: (__VLS_ctx.currentTheme === 'light' ? 'border-gray-200' : 'border-gray-700') },
    });
    // @ts-ignore
    [currentTheme,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid grid-cols-2 gap-4 text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.editingMember.id);
    // @ts-ignore
    [editingMember,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['transition-colors duration-300', __VLS_ctx.getStatusColor(__VLS_ctx.editingMember.status)]) },
    });
    // @ts-ignore
    [getStatusColor, editingMember,];
    (__VLS_ctx.editingMember.status === 'active' ? '活躍' : __VLS_ctx.editingMember.status === 'inactive' ? '未活躍' : '停權');
    // @ts-ignore
    [editingMember, editingMember,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-span-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['transition-colors duration-300', __VLS_ctx.currentThemeStyles.textSecondary]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['transition-colors duration-300', __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles,];
    (__VLS_ctx.formatDate(__VLS_ctx.editingMember.registeredAt));
    // @ts-ignore
    [formatDate, editingMember,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-end gap-3 mt-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.closeEditModal) },
        ...{ class: (['px-4 py-2 rounded-lg transition-all duration-300', __VLS_ctx.currentThemeStyles.textSecondary, __VLS_ctx.currentThemeStyles.cardHover]) },
    });
    // @ts-ignore
    [currentThemeStyles, currentThemeStyles, closeEditModal,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.saveEdit) },
        ...{ class: (['px-4 py-2 rounded-lg transition-all duration-300', __VLS_ctx.currentThemeStyles.activeButton, __VLS_ctx.currentThemeStyles.text]) },
    });
    // @ts-ignore
    [currentThemeStyles, currentThemeStyles, saveEdit,];
}
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['w-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-500']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-64']} */ ;
/** @type {__VLS_StyleScopedClasses['h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-500']} */ ;
/** @type {__VLS_StyleScopedClasses['z-30']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['to-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:from-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:to-red-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:scale-105']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-400']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['via-white/20']} */ ;
/** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['-skew-x-12']} */ ;
/** @type {__VLS_StyleScopedClasses['-translate-x-full']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:translate-x-full']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-700']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:rotate-12']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['p-8']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-500']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-5']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-purple-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-yellow-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['w-96']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-blue-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-red-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-4']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-purple-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-yellow-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-yellow-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['w-64']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-blue-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-red-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-12']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-100']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-800']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-blue-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-red-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-yellow-500']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-purple-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-purple-500']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-yellow-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-yellow-500']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-yellow-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-orange-500']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-yellow-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-yellow-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-blue-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-12']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-600']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['right-1']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-12']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-600']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['right-1']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:scale-105']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['via-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['to-black']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:scale-105']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-white']} */ ;
/** @type {__VLS_StyleScopedClasses['via-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['to-blue-50']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:scale-105']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-indigo-900']} */ ;
/** @type {__VLS_StyleScopedClasses['via-purple-800']} */ ;
/** @type {__VLS_StyleScopedClasses['to-pink-900']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:scale-105']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-emerald-800']} */ ;
/** @type {__VLS_StyleScopedClasses['via-teal-700']} */ ;
/** @type {__VLS_StyleScopedClasses['to-cyan-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['to-purple-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-6']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-12']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-12']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['w-12']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['w-12']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['w-12']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['w-12']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-400']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-400']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-emerald-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-teal-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-purple-500']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-purple-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-purple-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-purple-400']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-indigo-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-violet-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-400']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-rose-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-pink-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-orange-500']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-orange-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-orange-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-orange-400']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-yellow-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-400']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-sky-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-400']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['to-purple-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:from-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:to-purple-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:scale-105']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-96']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => ({
        ...props,
        ...{},
        ...{},
    }),
});
export default {};
//# sourceMappingURL=Admin.vue.js.map