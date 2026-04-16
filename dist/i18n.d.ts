export declare const SUPPORTED_LUGH_LANGUAGES: readonly ["pt", "en", "es"];
export type LughLanguage = (typeof SUPPORTED_LUGH_LANGUAGES)[number];
export declare const DEFAULT_LUGH_LANGUAGE: LughLanguage;
export interface LughMessages {
    signInWithLugh: string;
    creditsTitle: string;
    creditsBalanceAria: (total: string) => string;
    creditsEmpty: string;
    creditsPackLabel: string;
    creditsUpgrade: string;
    consumeDefault: (amount: number) => string;
    consumeLoading: string;
    insufficientCredits: string;
    getMoreCredits: string;
}
/** Error messages are always in English regardless of the selected language. */
export declare const ERROR_MESSAGES: {
    readonly notSignedIn: "user not signed in";
    readonly invalidCost: "cost must be a non-negative integer";
    readonly providerMissing: "useLugh: must be used within <LughProvider>";
};
export declare function isSupportedLughLanguage(lang: string): lang is LughLanguage;
export declare function getLughMessages(lang: string | undefined): LughMessages;
export declare function useLughMessages(): LughMessages;
//# sourceMappingURL=i18n.d.ts.map