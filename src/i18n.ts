"use client";

import { useLugh } from "./hooks";

export const SUPPORTED_LUGH_LANGUAGES = ["pt", "en", "es"] as const;
export type LughLanguage = (typeof SUPPORTED_LUGH_LANGUAGES)[number];
export const DEFAULT_LUGH_LANGUAGE: LughLanguage = "en";

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
export const ERROR_MESSAGES = {
  notSignedIn: "user not signed in",
  invalidCost: "cost must be a non-negative integer",
  providerMissing: "useLugh: must be used within <LughProvider>",
} as const;

const pt: LughMessages = {
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

const en: LughMessages = {
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

const es: LughMessages = {
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

const MESSAGES: Record<LughLanguage, LughMessages> = { pt, en, es };

export function isSupportedLughLanguage(lang: string): lang is LughLanguage {
  return (SUPPORTED_LUGH_LANGUAGES as readonly string[]).includes(lang);
}

export function getLughMessages(lang: string | undefined): LughMessages {
  if (lang && isSupportedLughLanguage(lang)) return MESSAGES[lang];
  return MESSAGES[DEFAULT_LUGH_LANGUAGE];
}

export function useLughMessages(): LughMessages {
  const { language } = useLugh();
  return getLughMessages(language);
}
