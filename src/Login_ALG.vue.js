import { ref } from 'vue';
import { MessageSquare, ArrowLeft } from 'lucide-vue-next';
import BackgroundEffect from './BackgroundEffect.vue';
const emit = defineEmits(['back', 'loginSuccess', 'analytSuccess']);
const activeTab = ref('login');
// Login / Register Forms
const loginForm = ref({ username: '', password: '' });
const registerForm = ref({ name: '', email: '', password: '' });
// 預設帳號
const defaultAccounts = [
    { username: 'test', password: '123', type: 'admin' },
    { username: 'white', password: '123', type: 'analyt' }
];
// 從 localStorage 載入已註冊的用戶，合併預設帳號
const loadValidAccounts = () => {
    const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    return [...defaultAccounts, ...savedUsers];
};
// 儲存新用戶到 localStorage
const saveUserToStorage = (userData) => {
    const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    savedUsers.push({
        username: userData.username,
        password: userData.password,
        type: userData.type
    });
    localStorage.setItem('registeredUsers', JSON.stringify(savedUsers));
};
// Matrix bars (80 條，更密集)
const matrixBars = ref([]);
for (let i = 0; i < 80; i++) {
    matrixBars.value.push({
        x: Math.random() * 100,
        height: 100 + Math.random() * 300,
        width: 2 + Math.random() * 4,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 3
    });
}
// Floating SMS icons
const smsIcons = ref([]);
for (let i = 0; i < 15; i++) {
    smsIcons.value.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 20 + Math.random() * 24,
        delay: Math.random() * 5,
        duration: 12 + Math.random() * 8
    });
}
// Login handler
const handleLogin = () => {
    const { username, password } = loginForm.value;
    const validAccounts = loadValidAccounts(); // 動態載入所有有效帳號
    const validAccount = validAccounts.find(acc => acc.username === username && acc.password === password);
    if (validAccount) {
        if (validAccount.type === 'analyt') {
            // 發出特殊事件，讓 App.vue 知道要打開 Analyt 頁面
            emit('analytSuccess', { username, type: 'analyt' });
        }
        else if (validAccount.type === 'admin') {
            emit('loginSuccess', { username, type: validAccount.type });
        }
        else {
            // 一般用戶登入，跳轉到個人頁面
            emit('loginSuccess', { username, type: 'user' });
        }
    }
    else {
        alert('無此帳號或密碼錯誤！\n\n測試帳號：test/123 (管理員)\nwhite/123 (分析頁面)');
    }
};
// Register handler
const handleRegister = () => {
    const { name, email, password } = registerForm.value;
    if (name && email && password) {
        // 檢查用戶名是否已存在
        const existingAccounts = loadValidAccounts();
        const userExists = existingAccounts.some(acc => acc.username === name);
        if (userExists) {
            alert('此帳號名稱已被使用，請選擇其他名稱！');
            return;
        }
        // 創建新用戶資料
        const newUser = {
            id: Date.now(), // 使用時間戳作為唯一 ID
            username: name,
            email: email,
            password: password,
            type: 'user', // 一般用戶
            registeredAt: new Date().toISOString(),
            status: 'active'
        };
        // 儲存到 localStorage
        saveUserToStorage(newUser);
        // 清空註冊表單
        registerForm.value = { name: '', email: '', password: '' };
        // 直接自動登入新用戶，不顯示提示
        emit('loginSuccess', {
            username: name,
            type: 'user', // 註冊的用戶為一般用戶
            userData: newUser // 傳遞完整用戶資料
        });
    }
    else {
        alert('請填寫完整的註冊資料！');
    }
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
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "relative w-screen h-screen overflow-hidden bg-black" },
});
/** @type {[typeof BackgroundEffect, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(BackgroundEffect, new BackgroundEffect({
    ...{ class: "absolute inset-0 z-0" },
}));
const __VLS_1 = __VLS_0({
    ...{ class: "absolute inset-0 z-0" },
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute inset-0 z-1 w-screen h-screen" },
});
for (const [bar, i] of __VLS_getVForSourceType((__VLS_ctx.matrixBars))) {
    // @ts-ignore
    [matrixBars,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        key: ('bar-' + i),
        ...{ style: ({
                left: bar.x + '%',
                animationDelay: bar.delay + 's',
                animationDuration: bar.duration + 's',
                height: bar.height + 'px',
                width: bar.width + 'px'
            }) },
        ...{ class: "absolute top-0 bg-gradient-to-b from-cyan-500/40 via-cyan-500/20 to-transparent animate-matrix-fall" },
    });
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute inset-0 z-5 w-screen h-screen" },
});
for (const [sms, i] of __VLS_getVForSourceType((__VLS_ctx.smsIcons))) {
    // @ts-ignore
    [smsIcons,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        key: ('sms-' + i),
        ...{ style: ({
                left: sms.x + '%',
                top: sms.y + '%',
                animationDelay: sms.delay + 's',
                animationDuration: sms.duration + 's'
            }) },
        ...{ class: "absolute animate-float opacity-30" },
    });
    const __VLS_4 = {}.MessageSquare;
    /** @type {[typeof __VLS_components.MessageSquare, ]} */ ;
    // @ts-ignore
    MessageSquare;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        size: (sms.size),
        color: "#ffffff",
        strokeWidth: (1.5),
    }));
    const __VLS_6 = __VLS_5({
        size: (sms.size),
        color: "#ffffff",
        strokeWidth: (1.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('back');
            // @ts-ignore
            [$emit,];
        } },
    ...{ class: "absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-gray-800/60 backdrop-blur-md rounded-lg border border-gray-700 hover:border-cyan-400 transition-all duration-300 text-gray-300 hover:text-cyan-400 text-sm font-medium" },
});
const __VLS_9 = {}.ArrowLeft;
/** @type {[typeof __VLS_components.ArrowLeft, ]} */ ;
// @ts-ignore
ArrowLeft;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    size: (16),
}));
const __VLS_11 = __VLS_10({
    size: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "relative z-10 flex items-center justify-center w-screen h-screen" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-800 w-full max-w-md mx-4" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
    ...{ class: "text-2xl font-bold text-white mb-2 text-center" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "text-sm text-gray-400 text-center mb-4" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex gap-2 mb-4" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = 'login';
            // @ts-ignore
            [activeTab,];
        } },
    ...{ class: ([
            'flex-1 py-2 rounded-lg font-semibold transition-all duration-300 text-sm',
            __VLS_ctx.activeTab === 'login' ? 'bg-cyan-500 text-white' : 'bg-transparent text-gray-400 hover:text-white'
        ]) },
});
// @ts-ignore
[activeTab,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = 'register';
            // @ts-ignore
            [activeTab,];
        } },
    ...{ class: ([
            'flex-1 py-2 rounded-lg font-semibold transition-all duration-300 text-sm',
            __VLS_ctx.activeTab === 'register' ? 'bg-cyan-500 text-white' : 'bg-transparent text-gray-400 hover:text-white'
        ]) },
});
// @ts-ignore
[activeTab,];
if (__VLS_ctx.activeTab === 'login') {
    // @ts-ignore
    [activeTab,];
    __VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
        ...{ onSubmit: (__VLS_ctx.handleLogin) },
        ...{ class: "space-y-3" },
    });
    // @ts-ignore
    [handleLogin,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "block text-sm font-medium text-gray-300 mb-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        value: (__VLS_ctx.loginForm.username),
        type: "text",
        ...{ class: "w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm" },
        placeholder: "請輸入帳號名稱",
        required: true,
    });
    // @ts-ignore
    [loginForm,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between items-center mb-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "block text-sm font-medium text-gray-300" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        type: "button",
        ...{ class: "text-xs text-cyan-400 hover:text-cyan-300" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "password",
        ...{ class: "w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm" },
        placeholder: "••••••••",
        required: true,
    });
    (__VLS_ctx.loginForm.password);
    // @ts-ignore
    [loginForm,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        type: "submit",
        ...{ class: "w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-cyan-500/50 mt-4 text-sm" },
    });
}
if (__VLS_ctx.activeTab === 'register') {
    // @ts-ignore
    [activeTab,];
    __VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
        ...{ onSubmit: (__VLS_ctx.handleRegister) },
        ...{ class: "space-y-3" },
    });
    // @ts-ignore
    [handleRegister,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "block text-sm font-medium text-gray-300 mb-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        value: (__VLS_ctx.registerForm.name),
        type: "text",
        ...{ class: "w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm" },
        placeholder: "請輸入帳號名稱",
        required: true,
    });
    // @ts-ignore
    [registerForm,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "block text-sm font-medium text-gray-300 mb-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "email",
        ...{ class: "w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm" },
        placeholder: "請輸入電子郵件",
        required: true,
    });
    (__VLS_ctx.registerForm.email);
    // @ts-ignore
    [registerForm,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "block text-sm font-medium text-gray-300 mb-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "password",
        ...{ class: "w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm" },
        placeholder: "請輸入密碼",
        required: true,
    });
    (__VLS_ctx.registerForm.password);
    // @ts-ignore
    [registerForm,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        type: "submit",
        ...{ class: "w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-cyan-500/50 mt-4 text-sm" },
    });
}
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "text-center text-xs text-gray-400 mt-4" },
});
(__VLS_ctx.activeTab === 'login' ? "Don't have an account?" : "Already have an account?");
// @ts-ignore
[activeTab,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = __VLS_ctx.activeTab === 'login' ? 'register' : 'login';
            // @ts-ignore
            [activeTab, activeTab,];
        } },
    ...{ class: "text-cyan-400 hover:text-cyan-300 font-medium ml-1" },
});
(__VLS_ctx.activeTab === 'login' ? 'Sign up' : 'Login');
// @ts-ignore
[activeTab,];
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['w-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-0']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
/** @type {__VLS_StyleScopedClasses['from-cyan-500/40']} */ ;
/** @type {__VLS_StyleScopedClasses['via-cyan-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-matrix-fall']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-float']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-30']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-4']} */ ;
/** @type {__VLS_StyleScopedClasses['left-4']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800/60']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-cyan-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-cyan-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['w-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-900/80']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800/50']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-cyan-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800/50']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-cyan-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:scale-[1.02]']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-cyan-500/50']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800/50']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800/50']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800/50']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-cyan-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:scale-[1.02]']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-cyan-500/50']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-cyan-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => ({}),
});
export default {};
//# sourceMappingURL=Login_ALG.vue.js.map