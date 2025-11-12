import { reactive, ref, onMounted } from "vue";
import axios from "axios";
// ✅ 宣告 emit（包含 start 與 back）
const emit = defineEmits(['start', 'back']);
// ===========================
// 互動眼睛設定
// ===========================
const pupilOffset = reactive({ x: 0, y: 0 });
// 🔧 預設使用保存的眼球顏色（白色眼球，黑色瞳孔）
const eyeColors = reactive(["#ffffff", "#ffffff", "#ffffff", "#010404"]);
const fetchEyeColors = async () => {
    try {
        // 嘗試從後端 API 獲取設定
        const res = await fetch("http://localhost:3000/get-eye-settings");
        const data = await res.json();
        eyeColors.splice(0, 4, ...data.eyeColors);
        console.log("眼球顏色已從後端加載:", data.eyeColors);
    }
    catch (err) {
        console.warn("後端伺服器不可用，使用預設的白色眼球設定", err);
        // 後端不可用時，保持現有的白色眼球設定
        // 這樣即使後端伺服器沒啟動，也能維持用戶之前的設定
    }
};
const saveEyeColors = async () => {
    try {
        const res = await fetch("http://localhost:3000/save-eye-settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eyeColors }),
        });
        const result = await res.json();
        if (result.success)
            alert("儲存成功");
        else
            alert("儲存失敗");
    }
    catch (err) {
        console.error(err);
        alert("儲存失敗");
    }
};
// ===========================
// 主畫面互動與管理員設定
// ===========================
const isAdmin = ref(false);
function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    const maxOffset = 15;
    pupilOffset.x = Math.max(Math.min(deltaX / 10, maxOffset), -maxOffset);
    pupilOffset.y = Math.max(Math.min(deltaY / 10, maxOffset), -maxOffset);
}
function promptAdmin() {
    const pwd = prompt("請輸入管理員密碼");
    if (pwd === "123") {
        isAdmin.value = true;
        alert("已進入管理員模式");
    }
    else {
        alert("密碼錯誤");
    }
}
function logoutAdmin() {
    isAdmin.value = false;
}
// ===========================
// 排行榜 Modal
// ===========================
const showLeaderboard = ref(false);
const leaderboard = ref([]);
const openLeaderboard = async () => {
    try {
        const res = await axios.get("http://localhost:3000/leaderboard");
        leaderboard.value = res.data;
        showLeaderboard.value = true;
    }
    catch (err) {
        console.error("取得排行榜失敗", err);
    }
};
const closeLeaderboard = () => {
    showLeaderboard.value = false;
};
onMounted(fetchEyeColors);
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
/** @type {__VLS_StyleScopedClasses['game-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lb-item']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ onMousemove: (__VLS_ctx.handleMouseMove) },
    ...{ class: "welcome-screen relative flex flex-col items-center justify-start min-h-screen gap-4 z-10" },
});
// @ts-ignore
[handleMouseMove,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "pt-4" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "text-center mb-4" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
    ...{ class: "text-4xl font-bold text-cyan-400 drop-shadow-lg" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "text-lg text-cyan-200" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "eye-container relative w-40 h-40 mb-1" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 100 100",
    ...{ class: "w-full h-full" },
});
__VLS_asFunctionalElement(__VLS_elements.defs, __VLS_elements.defs)({});
__VLS_asFunctionalElement(__VLS_elements.radialGradient, __VLS_elements.radialGradient)({
    id: "grad-eye",
    cx: "50%",
    cy: "50%",
    r: "50%",
});
__VLS_asFunctionalElement(__VLS_elements.stop)({
    offset: "0%",
    'stop-color': (__VLS_ctx.eyeColors[0]),
});
// @ts-ignore
[eyeColors,];
__VLS_asFunctionalElement(__VLS_elements.stop)({
    offset: "70%",
    'stop-color': (__VLS_ctx.eyeColors[1]),
});
// @ts-ignore
[eyeColors,];
__VLS_asFunctionalElement(__VLS_elements.stop)({
    offset: "100%",
    'stop-color': (__VLS_ctx.eyeColors[2]),
});
// @ts-ignore
[eyeColors,];
__VLS_asFunctionalElement(__VLS_elements.circle)({
    cx: "50",
    cy: "50",
    r: "45",
    fill: "url(#grad-eye)",
    ...{ class: "animate-pulse-slow" },
});
__VLS_asFunctionalElement(__VLS_elements.circle)({
    cx: (65 + __VLS_ctx.pupilOffset.x),
    cy: (41.85 + __VLS_ctx.pupilOffset.y),
    r: "15",
    fill: (__VLS_ctx.eyeColors[3]),
});
// @ts-ignore
[eyeColors, pupilOffset, pupilOffset,];
__VLS_asFunctionalElement(__VLS_elements.circle)({
    cx: (65 + __VLS_ctx.pupilOffset.x - 5),
    cy: (41.85 + __VLS_ctx.pupilOffset.y - 5),
    r: "4",
    fill: "white",
    opacity: "0.7",
});
// @ts-ignore
[pupilOffset, pupilOffset,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "text-center mb-2" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
    ...{ class: "text-3xl font-bold text-cyan-300 drop-shadow-lg" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "text-lg text-cyan-200" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex justify-center items-center gap-4 w-full max-w-md mb-16" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('start', 'normal');
            // @ts-ignore
            [$emit,];
        } },
    ...{ class: "game-btn w-40 bg-cyan-700 hover:bg-cyan-500" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('start', 'challenge');
            // @ts-ignore
            [$emit,];
        } },
    ...{ class: "game-btn w-40 bg-purple-700 hover:bg-purple-500" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('back');
            // @ts-ignore
            [$emit,];
        } },
    ...{ class: "icon-btn bg-cyan-700 hover:bg-cyan-500 text-cyan-200" },
    title: "返回",
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.openLeaderboard) },
    ...{ class: "icon-btn bg-cyan-700 hover:bg-cyan-600 text-cyan-400 hover:text-cyan-200" },
    title: "排行榜",
});
// @ts-ignore
[openLeaderboard,];
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    ...{ class: "icon-img" },
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M3 3v18h18V3H3zm2 16V5h14v14H5zm3-2h2v-6H8v6zm6 0h2V9h-2v8zm-3 0h2v-4h-2v4z",
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.promptAdmin) },
    ...{ class: "icon-btn bg-cyan-600 hover:bg-cyan-500 text-cyan-900 hover:text-black" },
    title: "管理員",
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (!__VLS_ctx.isAdmin) }, null, null);
// @ts-ignore
[promptAdmin, isAdmin,];
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    ...{ class: "icon-img" },
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "\u004d\u0031\u0032\u0020\u0031\u0032\u0063\u0032\u002e\u0032\u0031\u0020\u0030\u0020\u0034\u002d\u0031\u002e\u0037\u0039\u0020\u0034\u002d\u0034\u0053\u0031\u0034\u002e\u0032\u0031\u0020\u0034\u0020\u0031\u0032\u0020\u0034\u0073\u002d\u0034\u0020\u0031\u002e\u0037\u0039\u002d\u0034\u0020\u0034\u0020\u0031\u002e\u0037\u0039\u0020\u0034\u0020\u0034\u0020\u0034\u007a\u006d\u0030\u0020\u0032\u0063\u002d\u0032\u002e\u0036\u0037\u0020\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0030\u002d\u0038\u0020\u0031\u002e\u0033\u0034\u002d\u0038\u0020\u0034\u0076\u0032\u0068\u0031\u0036\u0076\u002d\u0032\u0063\u0030\u002d\u0032\u002e\u0036\u0036\u002d\u0035\u002e\u0033\u0033\u002d\u0034\u002d\u0038\u002d\u0034\u007a",
});
if (__VLS_ctx.isAdmin) {
    // @ts-ignore
    [isAdmin,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "admin-panel fixed right-4 top-1/4 p-4 bg-gray-900 rounded-lg w-72 flex flex-col gap-3 z-50 shadow-lg" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "text-white font-bold mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex flex-col gap-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "text-cyan-200" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "color",
    });
    (__VLS_ctx.eyeColors[0]);
    // @ts-ignore
    [eyeColors,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex flex-col gap-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "text-cyan-200" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "color",
    });
    (__VLS_ctx.eyeColors[1]);
    // @ts-ignore
    [eyeColors,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex flex-col gap-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "text-cyan-200" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "color",
    });
    (__VLS_ctx.eyeColors[2]);
    // @ts-ignore
    [eyeColors,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex flex-col gap-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "text-cyan-200" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "color",
    });
    (__VLS_ctx.eyeColors[3]);
    // @ts-ignore
    [eyeColors,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.saveEyeColors) },
        ...{ class: "game-btn mt-3 bg-green-600 hover:bg-green-500" },
    });
    // @ts-ignore
    [saveEyeColors,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.logoutAdmin) },
        ...{ class: "game-btn mt-3 bg-red-600 hover:bg-red-500" },
    });
    // @ts-ignore
    [logoutAdmin,];
}
if (__VLS_ctx.showLeaderboard) {
    // @ts-ignore
    [showLeaderboard,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "leaderboard-modal" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "leaderboard-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.closeLeaderboard) },
        ...{ class: "close-btn" },
    });
    // @ts-ignore
    [closeLeaderboard,];
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: "lb-title" },
    });
    __VLS_asFunctionalElement(__VLS_elements.ol, __VLS_elements.ol)({
        ...{ class: "leaderboard-list" },
    });
    for (const [entry, index] of __VLS_getVForSourceType((__VLS_ctx.leaderboard))) {
        // @ts-ignore
        [leaderboard,];
        __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({
            key: (index),
            ...{ class: "lb-item" },
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
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "hacker-grid" },
});
/** @type {__VLS_StyleScopedClasses['welcome-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-start']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-200']} */ ;
/** @type {__VLS_StyleScopedClasses['eye-container']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['w-40']} */ ;
/** @type {__VLS_StyleScopedClasses['h-40']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-pulse-slow']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-300']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-16']} */ ;
/** @type {__VLS_StyleScopedClasses['game-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['w-40']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['game-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['w-40']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-purple-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-purple-500']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-200']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-cyan-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-cyan-200']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-img']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-900']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-img']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['right-4']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1/4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['w-72']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-200']} */ ;
/** @type {__VLS_StyleScopedClasses['game-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['game-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['leaderboard-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['leaderboard-content']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lb-title']} */ ;
/** @type {__VLS_StyleScopedClasses['leaderboard-list']} */ ;
/** @type {__VLS_StyleScopedClasses['lb-item']} */ ;
/** @type {__VLS_StyleScopedClasses['rank']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['score']} */ ;
/** @type {__VLS_StyleScopedClasses['hacker-grid']} */ ;
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => ({}),
});
export default {};
//# sourceMappingURL=WelcomeScreen.vue.js.map