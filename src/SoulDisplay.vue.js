import { computed } from 'vue';
import { useSoulAnimalStore, EVOLUTION_STAGES, GROUP_COLORS } from './stores/soulAnimalSystem.js';
debugger; /* PartiallyEnd: #3632/script.vue */
const __VLS_export = (await import('vue')).defineComponent({
    name: 'SoulDisplay',
    props: {
        compact: {
            type: Boolean,
            default: false
        }
    },
    setup() {
        const soulStore = useSoulAnimalStore();
        const nextStageXP = computed(() => {
            const currentStage = soulStore.currentStage;
            if (currentStage === EVOLUTION_STAGES.EVOLUTION) {
                return 'MAX';
            }
            return currentStage.maxXP + 1;
        });
        const groupColor = computed(() => {
            if (!soulStore.currentAnimal)
                return '#666';
            return GROUP_COLORS[soulStore.currentAnimal.group]?.primary || '#666';
        });
        const syncInfo = computed(() => soulStore.getSyncInfo());
        return {
            soulStore,
            nextStageXP,
            groupColor,
            syncInfo
        };
    }
});
const __VLS_self = (await import('vue')).defineComponent({
    name: 'SoulDisplay',
    props: {
        compact: {
            type: Boolean,
            default: false
        }
    },
    setup() {
        const soulStore = useSoulAnimalStore();
        const nextStageXP = computed(() => {
            const currentStage = soulStore.currentStage;
            if (currentStage === EVOLUTION_STAGES.EVOLUTION) {
                return 'MAX';
            }
            return currentStage.maxXP + 1;
        });
        const groupColor = computed(() => {
            if (!soulStore.currentAnimal)
                return '#666';
            return GROUP_COLORS[soulStore.currentAnimal.group]?.primary || '#666';
        });
        const syncInfo = computed(() => soulStore.getSyncInfo());
        return {
            soulStore,
            nextStageXP,
            groupColor,
            syncInfo
        };
    }
});
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['soul-display']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-display']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-header']} */ ;
/** @type {__VLS_StyleScopedClasses['sync-status']} */ ;
/** @type {__VLS_StyleScopedClasses['sync-status']} */ ;
/** @type {__VLS_StyleScopedClasses['sync-status']} */ ;
/** @type {__VLS_StyleScopedClasses['sync-status']} */ ;
/** @type {__VLS_StyleScopedClasses['xp-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-display']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-header']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-display']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-stage']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-display']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-header']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-display']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-name']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-display']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['animal-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-display']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['xp-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-display']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-header']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-stage']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-display']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-info']} */ ;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "soul-display" },
    ...{ class: ({ 'compact': __VLS_ctx.compact }) },
});
// @ts-ignore
[compact,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "soul-header" },
});
if (!__VLS_ctx.compact) {
    // @ts-ignore
    [compact,];
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "soul-stage" },
});
if (__VLS_ctx.compact) {
    // @ts-ignore
    [compact,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "compact-info" },
    });
    (__VLS_ctx.soulStore.soulXP);
    (__VLS_ctx.soulStore.currentAnimal && __VLS_ctx.soulStore.currentAnimal.emoji && __VLS_ctx.soulStore.currentAnimal.animal
        ? ` | ${__VLS_ctx.soulStore.currentAnimal.emoji}${__VLS_ctx.soulStore.currentAnimal.animal}`
        : '');
    // @ts-ignore
    [soulStore, soulStore, soulStore, soulStore, soulStore, soulStore,];
}
else {
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "stage-name" },
    });
    (__VLS_ctx.soulStore.currentStage.name);
    // @ts-ignore
    [soulStore,];
    if (__VLS_ctx.soulStore.currentAnimal && __VLS_ctx.soulStore.currentAnimal.emoji && __VLS_ctx.soulStore.currentAnimal.animal) {
        // @ts-ignore
        [soulStore, soulStore, soulStore,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "animal-indicator" },
        });
        (__VLS_ctx.soulStore.currentAnimal.emoji);
        (__VLS_ctx.soulStore.currentAnimal.animal);
        // @ts-ignore
        [soulStore, soulStore,];
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "no-animal" },
        });
    }
}
if (!__VLS_ctx.compact) {
    // @ts-ignore
    [compact,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "sync-status" },
        ...{ class: (__VLS_ctx.syncInfo.status) },
    });
    // @ts-ignore
    [syncInfo,];
    if (__VLS_ctx.syncInfo.status === 'syncing') {
        // @ts-ignore
        [syncInfo,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "sync-indicator" },
        });
    }
    else if (__VLS_ctx.syncInfo.status === 'synced') {
        // @ts-ignore
        [syncInfo,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "sync-indicator" },
        });
    }
    else if (__VLS_ctx.syncInfo.status === 'sync_error') {
        // @ts-ignore
        [syncInfo,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "sync-indicator" },
        });
    }
    else if (__VLS_ctx.syncInfo.isLoggedIn) {
        // @ts-ignore
        [syncInfo,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "sync-indicator" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "sync-indicator" },
        });
    }
}
if (!__VLS_ctx.compact) {
    // @ts-ignore
    [compact,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "soul-stats" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "xp-info" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "value" },
    });
    (__VLS_ctx.soulStore.soulXP);
    // @ts-ignore
    [soulStore,];
    if (__VLS_ctx.nextStageXP !== 'MAX') {
        // @ts-ignore
        [nextStageXP,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "next" },
        });
        (__VLS_ctx.nextStageXP);
        // @ts-ignore
        [nextStageXP,];
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "xp-bar" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "xp-fill" },
        ...{ style: ({ width: __VLS_ctx.soulStore.progressToNextStage + '%' }) },
    });
    // @ts-ignore
    [soulStore,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "secondary-stats" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "tech-level" },
    });
    (__VLS_ctx.soulStore.techLevel);
    // @ts-ignore
    [soulStore,];
    if (__VLS_ctx.soulStore.answerStreak > 0) {
        // @ts-ignore
        [soulStore,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "streak" },
        });
        (__VLS_ctx.soulStore.answerStreak);
        // @ts-ignore
        [soulStore,];
    }
}
if (__VLS_ctx.soulStore.currentAnimal && !__VLS_ctx.compact) {
    // @ts-ignore
    [compact, soulStore,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "group-indicator" },
        ...{ style: ({ backgroundColor: __VLS_ctx.groupColor }) },
    });
    // @ts-ignore
    [groupColor,];
    (__VLS_ctx.soulStore.currentAnimal.group);
    // @ts-ignore
    [soulStore,];
}
/** @type {__VLS_StyleScopedClasses['soul-display']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-header']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-stage']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-info']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-name']} */ ;
/** @type {__VLS_StyleScopedClasses['animal-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['no-animal']} */ ;
/** @type {__VLS_StyleScopedClasses['sync-status']} */ ;
/** @type {__VLS_StyleScopedClasses['sync-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['sync-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['sync-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['sync-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['sync-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['soul-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['xp-info']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['next']} */ ;
/** @type {__VLS_StyleScopedClasses['xp-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['xp-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['tech-level']} */ ;
/** @type {__VLS_StyleScopedClasses['streak']} */ ;
/** @type {__VLS_StyleScopedClasses['group-indicator']} */ ;
export default {};
//# sourceMappingURL=SoulDisplay.vue.js.map