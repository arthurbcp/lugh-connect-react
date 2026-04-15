export { LughProvider, LughContext } from "./provider";
export type {
  LughProviderProps,
  LughContextValue,
  LughTheme,
} from "./provider";

export {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  ERROR_MESSAGES,
  isSupportedLanguage,
  getMessages,
  useLughMessages,
} from "./i18n";
export type { LughLanguage, LughMessages } from "./i18n";

export { useLugh, useLughCredits } from "./hooks";
export type {
  UseLughCreditsResult,
  CreditBlock,
  CreditsBreakdown,
} from "./hooks";

export { LughSignInButton } from "./components/SignInButton";
export type { LughSignInButtonProps } from "./components/SignInButton";

export {
  LughConsumeCreditsButton,
  InsufficientCreditsError,
} from "./components/ConsumeCreditsButton";
export type {
  LughConsumeCreditsButtonProps,
  ConsumeCreditsResult,
} from "./components/ConsumeCreditsButton";

export { LughCreditsBadge } from "./components/CreditsBadge";
export type { LughCreditsBadgeProps } from "./components/CreditsBadge";

export type {
  LughAuth,
  LughAuthOptions,
  Tokens,
  UserClaims,
} from "lugh-connect";
