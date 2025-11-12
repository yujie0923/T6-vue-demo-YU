import { ref, onMounted, onUnmounted } from 'vue';
import { MessageSquare } from 'lucide-vue-next';
const canvasRef = ref(null);
const particles = ref([]);
const smsIcons = ref([]);
const matrixBars = ref([]);
// 初始化粒子
for (let i = 0; i < 80; i++) {
    particles.value.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 4
    });
}
// 初始化 SMS icon
for (let i = 0; i < 15; i++) {
    smsIcons.value.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 24 + Math.random() * 32,
        delay: Math.random() * 5,
        duration: 15 + Math.random() * 10
    });
}
// 初始化 Matrix bar
for (let i = 0; i < 80; i++) {
    matrixBars.value.push({
        x: Math.random() * 100,
        height: 100 + Math.random() * 300,
        width: 2 + Math.random() * 4,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 3
    });
}
let animationId = null;
let centerX = 0;
let centerY = 0;
onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas)
        return;
    const ctx = canvas.getContext('2d');
    const updateCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
    };
    updateCanvasSize();
    const radius = Math.max(window.innerWidth, window.innerHeight) * 0.8;
    const segments = 48;
    const rings = 24;
    const vertices = [];
    for (let i = 0; i <= rings; i++) {
        const theta = (i * Math.PI) / rings;
        for (let j = 0; j <= segments; j++) {
            const phi = (j * 2 * Math.PI) / segments;
            vertices.push({
                x: radius * Math.sin(theta) * Math.cos(phi),
                y: radius * Math.cos(theta),
                z: radius * Math.sin(theta) * Math.sin(phi)
            });
        }
    }
    let rotation = 0;
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rotation += 0.003;
        const projected = vertices.map(v => {
            const x = v.x * Math.cos(rotation) - v.z * Math.sin(rotation);
            const z = v.x * Math.sin(rotation) + v.z * Math.cos(rotation);
            const y = v.y;
            const scale = 800 / (800 + z);
            return { x: centerX + x * scale, y: centerY + y * scale };
        });
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
        ctx.lineWidth = 0.8;
        for (let i = 0; i < rings; i++) {
            for (let j = 0; j < segments; j++) {
                const idx1 = i * (segments + 1) + j;
                const idx2 = idx1 + 1;
                const idx3 = (i + 1) * (segments + 1) + j;
                ctx.beginPath();
                ctx.moveTo(projected[idx1].x, projected[idx1].y);
                ctx.lineTo(projected[idx2].x, projected[idx2].y);
                ctx.lineTo(projected[idx3].x, projected[idx3].y);
                ctx.closePath();
                ctx.stroke();
            }
        }
        animationId = requestAnimationFrame(animate);
    };
    animate();
    const handleResize = () => {
        updateCanvasSize();
    };
    window.addEventListener('resize', handleResize);
    onUnmounted(() => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute inset-0 overflow-hidden" },
});
__VLS_asFunctionalElement(__VLS_elements.canvas, __VLS_elements.canvas)({
    ref: "canvasRef",
    ...{ class: "absolute inset-0 w-full h-full" },
});
/** @type {typeof __VLS_ctx.canvasRef} */ ;
// @ts-ignore
[canvasRef,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute inset-0" },
});
for (const [bar, i] of __VLS_getVForSourceType((__VLS_ctx.matrixBars))) {
    // @ts-ignore
    [matrixBars,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        key: ('bar-' + i),
        ...{ style: ({
                left: bar.x + '%',
                height: bar.height + 'px',
                width: bar.width + 'px',
                animationDelay: bar.delay + 's',
                animationDuration: bar.duration + 's'
            }) },
        ...{ class: "absolute top-0 bg-gradient-to-b from-cyan-500/40 via-cyan-500/20 to-transparent animate-matrix-fall" },
    });
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute inset-0" },
});
for (const [particle, i] of __VLS_getVForSourceType((__VLS_ctx.particles))) {
    // @ts-ignore
    [particles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        key: ('particle-' + i),
        ...{ style: ({
                left: particle.x + '%',
                top: particle.y + '%',
                animationDelay: particle.delay + 's',
                animationDuration: particle.duration + 's'
            }) },
        ...{ class: "absolute w-2 h-2 bg-cyan-400 rounded-full animate-float-particle opacity-60" },
    });
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute inset-0" },
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
        ...{ class: "absolute animate-float-sms opacity-40" },
    });
    const __VLS_0 = {}.MessageSquare;
    /** @type {[typeof __VLS_components.MessageSquare, ]} */ ;
    // @ts-ignore
    MessageSquare;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        size: (sms.size),
        color: "#ffffff",
        strokeWidth: (1.5),
    }));
    const __VLS_2 = __VLS_1({
        size: (sms.size),
        color: "#ffffff",
        strokeWidth: (1.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
/** @type {__VLS_StyleScopedClasses['from-cyan-500/40']} */ ;
/** @type {__VLS_StyleScopedClasses['via-cyan-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-matrix-fall']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['w-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-400']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-float-particle']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-60']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-float-sms']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-40']} */ ;
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
//# sourceMappingURL=BackgroundEffect.vue.js.map