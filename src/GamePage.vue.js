import { ref, onMounted } from 'vue';
import GameBoard from './GameBoard.vue';
const quizQuestions = ref([]);
const currentIndex = ref(0);
const fetchQuiz = async () => {
    const res = await fetch('http://localhost:3000/get-quiz');
    const data = await res.json();
    // --- 兩假一真邏輯 ---
    const grouped = {};
    data.forEach(d => {
        if (!grouped[d.type])
            grouped[d.type] = [];
        grouped[d.type].push(d);
    });
    const finalQuestions = [];
    Object.values(grouped).forEach(group => {
        // 先抽兩假一真
        const scams = group.filter(q => q.isScam).slice(0, 2);
        const real = group.filter(q => !q.isScam).slice(0, 1);
        finalQuestions.push(...shuffleArray([...scams, ...real]));
    });
    quizQuestions.value = finalQuestions;
};
// 工具函式：洗牌
const shuffleArray = arr => [...arr].sort(() => 0.5 - Math.random());
const nextQuestion = () => {
    if (currentIndex.value < quizQuestions.value.length - 1)
        currentIndex.value++;
};
const prevQuestion = () => {
    if (currentIndex.value > 0)
        currentIndex.value--;
};
const goHome = () => {
    window.location.reload(); // 或呼叫父組件事件
};
onMounted(fetchQuiz);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "game-page" },
});
if (__VLS_ctx.quizQuestions.length) {
    // @ts-ignore
    [quizQuestions,];
    /** @type {[typeof GameBoard, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(GameBoard, new GameBoard({
        ...{ 'onNextQuestion': {} },
        ...{ 'onPrevQuestion': {} },
        question: (__VLS_ctx.quizQuestions[__VLS_ctx.currentIndex]),
        questionIndex: (__VLS_ctx.currentIndex),
        totalQuestions: (__VLS_ctx.quizQuestions.length),
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onNextQuestion': {} },
        ...{ 'onPrevQuestion': {} },
        question: (__VLS_ctx.quizQuestions[__VLS_ctx.currentIndex]),
        questionIndex: (__VLS_ctx.currentIndex),
        totalQuestions: (__VLS_ctx.quizQuestions.length),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    const __VLS_5 = ({ nextQuestion: {} },
        { onNextQuestion: (__VLS_ctx.nextQuestion) });
    const __VLS_6 = ({ prevQuestion: {} },
        { onPrevQuestion: (__VLS_ctx.prevQuestion) });
    // @ts-ignore
    [quizQuestions, quizQuestions, currentIndex, currentIndex, nextQuestion, prevQuestion,];
    var __VLS_2;
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "navigation-buttons mt-6 flex justify-center gap-4" },
});
if (__VLS_ctx.currentIndex > 0) {
    // @ts-ignore
    [currentIndex,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.prevQuestion) },
        ...{ class: "game-btn bg-cyan-700 hover:bg-cyan-500" },
    });
    // @ts-ignore
    [prevQuestion,];
}
if (__VLS_ctx.currentIndex < __VLS_ctx.quizQuestions.length - 1) {
    // @ts-ignore
    [quizQuestions, currentIndex,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.nextQuestion) },
        ...{ class: "game-btn bg-cyan-700 hover:bg-cyan-500" },
    });
    // @ts-ignore
    [nextQuestion,];
}
if (__VLS_ctx.currentIndex === 0) {
    // @ts-ignore
    [currentIndex,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.goHome) },
        ...{ class: "game-btn bg-gray-700 hover:bg-gray-600" },
    });
    // @ts-ignore
    [goHome,];
}
if (__VLS_ctx.currentIndex === __VLS_ctx.quizQuestions.length - 1) {
    // @ts-ignore
    [quizQuestions, currentIndex,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.prevQuestion) },
        ...{ class: "game-btn bg-gray-700 hover:bg-gray-600" },
    });
    // @ts-ignore
    [prevQuestion,];
}
/** @type {__VLS_StyleScopedClasses['game-page']} */ ;
/** @type {__VLS_StyleScopedClasses['navigation-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['game-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['game-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['game-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['game-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-600']} */ ;
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
//# sourceMappingURL=GamePage.vue.js.map