export { LughProvider, LughContext } from "./provider";
export type {
  LughProviderProps,
  LughContextValue,
  LughTheme,
  LughEnvironment,
} from "./provider";

export {
  SUPPORTED_LUGH_LANGUAGES,
  DEFAULT_LUGH_LANGUAGE,
  ERROR_MESSAGES,
  isSupportedLughLanguage,
  getLughMessages,
  useLughMessages,
} from "./i18n";
export type { LughLanguage, LughMessages } from "./i18n";

export { useLugh, useLughCredits } from "./hooks";
export type {
  UseLughCreditsResult,
  LughCreditBlock,
  LughCreditsBreakdown,
} from "./hooks";

export { LughSignInButton } from "./components/SignInButton";
export type { LughSignInButtonProps } from "./components/SignInButton";

export {
  LughConsumeCreditsButton,
  InsufficientCreditsError,
} from "./components/ConsumeCreditsButton";
export type { LughConsumeCreditsButtonProps } from "./components/ConsumeCreditsButton";

export { LughCreditsBadge } from "./components/CreditsBadge";
export type { LughCreditsBadgeProps } from "./components/CreditsBadge";

export {
  getBalance,
  getBalanceBreakdown,
  openCreditRequest,
  type LughEnvironmentArg,
  type GetBalanceRef,
  type GetBalanceBreakdownRef,
  type OpenCreditRequestRef,
} from "./convexApi";

export type {
  LughAuth,
  LughAuthOptions,
  LughTokens,
  LughUserClaims,
} from "lugh-connect";
