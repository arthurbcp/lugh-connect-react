"use client";
import { useLugh } from "./hooks";
export const SUPPORTED_LANGUAGES = ["pt", "en", "es"];
export const DEFAULT_LANGUAGE = "en";
/** Error messages are always in English regardless of the selected language. */
export const ERROR_MESSAGES = {
    notSignedIn: "user not signed in",
    invalidAmount: "amount must be a positive integer",
    missingPublicToken: "LughProvider.publicToken is required to consume credits",
    providerMissing: "useLugh: must be used within <LughProvider>",
};
const pt = {
    signInWithLugh: "Entrar com Lugh",
    creditsTitle: "Créditos",
    creditsBalanceAria: (total) => `Saldo: ${total} créditos`,
    creditsEmpty: "Sem créditos disponíveis.",
    creditsPackLabel: "Pack extra",
    creditsUpgrade: "Fazer upgrade de plano",
    consumeDefault: (amount) => `Consumir ${amount} créditos`,
    consumeLoading: "...",
    insufficientCredits: "Você não possui créditos suficientes.",
    getMoreCredits: "Adquirir mais créditos",
};
const en = {
    signInWithLugh: "Sign in with Lugh",
    creditsTitle: "Credits",
    creditsBalanceAria: (total) => `Balance: ${total} credits`,
    creditsEmpty: "No credits available.",
    creditsPackLabel: "Extra pack",
    creditsUpgrade: "Upgrade plan",
    consumeDefault: (amount) => `Consume ${amount} credits`,
    consumeLoading: "...",
    insufficientCredits: "You don't have enough credits.",
    getMoreCredits: "Get more credits",
};
const es = {
    signInWithLugh: "Iniciar sesión con Lugh",
    creditsTitle: "Créditos",
    creditsBalanceAria: (total) => `Saldo: ${total} créditos`,
    creditsEmpty: "Sin créditos disponibles.",
    creditsPackLabel: "Pack extra",
    creditsUpgrade: "Mejorar plan",
    consumeDefault: (amount) => `Consumir ${amount} créditos`,
    consumeLoading: "...",
    insufficientCredits: "No tienes suficientes créditos.",
    getMoreCredits: "Obtener más créditos",
};
const MESSAGES = { pt, en, es };
export function isSupportedLanguage(lang) {
    return SUPPORTED_LANGUAGES.includes(lang);
}
export function getMessages(lang) {
    if (lang && isSupportedLanguage(lang))
        return MESSAGES[lang];
    return MESSAGES[DEFAULT_LANGUAGE];
}
export function useLughMessages() {
    const { language } = useLugh();
    return getMessages(language);
}
//# sourceMappingURL=i18n.js.map