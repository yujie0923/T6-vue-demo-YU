import { reactive } from "vue";
const __VLS_props = defineProps({
    eyeColors: Array
});
const labels = ["眼球底色", "中間色", "外圍色", "瞳孔顏色"];
const saveEyeColors = async () => {
    try {
        const res = await fetch("http://localhost:3000/eye-settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eyeColors })
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "admin-panel fixed right-4 top-1/4 p-4 bg-gray-900 rounded-lg w-72 flex flex-col gap-3 z-50 shadow-lg" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
    ...{ class: "text-white font-bold mb-2" },
});
for (const [label, index] of __VLS_getVForSourceType((__VLS_ctx.labels))) {
    // @ts-ignore
    [labels,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex flex-col gap-2" },
        key: (index),
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "text-cyan-200" },
    });
    (label);
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "color",
    });
    (__VLS_ctx.eyeColors[index]);
    // @ts-ignore
    [eyeColors,];
}
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.saveEyeColors) },
    ...{ class: "game-btn mt-3 bg-green-600 hover:bg-green-500" },
});
// @ts-ignore
[saveEyeColors,];
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
/** @type {__VLS_StyleScopedClasses['game-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-green-500']} */ ;
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => ({
        ...__VLS_props,
        ...{},
    }),
});
export default {};
//# sourceMappingURL=Adm.vue.js.map