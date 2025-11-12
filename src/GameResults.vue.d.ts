declare const _default: typeof __VLS_export;
export default _default;
declare const __VLS_export: import("vue").DefineComponent<{
    round?: any;
    score?: any;
}, {}, {
    playerName: string;
    leaderboard: {
        name: string;
        score: number;
    }[];
}, {
    sortedLeaderboard(): any[];
}, {
    submitScore(): void;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "restart"[], "restart", import("vue").PublicProps, Readonly<{
    round?: any;
    score?: any;
}> & Readonly<{
    onRestart?: (...args: any[]) => any;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
