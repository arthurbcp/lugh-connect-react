import { type JSX, type ReactNode } from "react";
import { LughAuth, type LughTheme, type UserClaims } from "lugh-connect";
import type { LughLanguage } from "./i18n";
export type { LughTheme };
export interface LughContextValue {
    auth: LughAuth | null;
    lughApiUrl: string;
    publicToken: string | undefined;
    isSignedIn: boolean;
    user: UserClaims | null;
    loading: boolean;
    error: Error | null;
    language: LughLanguage | undefined;
    theme: LughTheme | undefined;
    primaryColor: string | undefined;
    signIn: () => Promise<void>;
    signOut: (opts?: {
        revoke?: boolean;
    }) => Promise<void>;
}
export declare const LughContext: import("react").Context<LughContextValue | null>;
export interface LughProviderProps {
    clientId: string;
    redirectUri: string;
    /**
     * Base URL of the lugh-api authorization server (no trailing slash).
     * Default: `https://api.lugh.digital`.
     */
    lughApiUrl?: string;
    scope?: string;
    refreshSkewSeconds?: number;
    /** Public token of the app registered on Lugh (required to consume credits). */
    publicToken?: string;
    /** Design system primary color (overrides `--lugh-primary`). */
    primaryColor?: string;
    /** Language used by the components. Default: `"en"`. */
    language?: LughLanguage;
    /** Visual theme. Default: follows `prefers-color-scheme`. */
    theme?: LughTheme;
    children: ReactNode;
}
export declare function LughProvider({ clientId, redirectUri, lughApiUrl, scope, refreshSkewSeconds, publicToken, primaryColor, language, theme, children, }: LughProviderProps): JSX.Element;
//# sourceMappingURL=provider.d.ts.map