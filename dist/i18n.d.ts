export declare const SUPPORTED_LANGUAGES: readonly ["pt", "en", "es"];
export type LughLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export declare const DEFAULT_LANGUAGE: LughLanguage;
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
    readonly invalidAmount: "amount must be a positive integer";
    readonly missingPublicToken: "LughProvider.publicToken is required to consume credits";
    readonly providerMissing: "useLugh: must be used within <LughProvider>";
};
export declare function isSupportedLanguage(lang: string): lang is LughLanguage;
export declare function getMessages(lang: string | undefined): LughMessages;
export declare function useLughMessages(): LughMessages;
//# sourceMappingURL=i18n.d.ts.map