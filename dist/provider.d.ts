import { type JSX, type ReactNode } from "react";
import { LughAuth, type LughEnvironment, type LughTheme, type LughUserClaims } from "lugh-connect";
import type { LughLanguage } from "./i18n";
export type { LughTheme };
export interface LughContextValue {
    auth: LughAuth | null;
    lughApiUrl: string;
    isSignedIn: boolean;
    user: LughUserClaims | null;
    loading: boolean;
    error: Error | null;
    language: LughLanguage | undefined;
    theme: LughTheme | undefined;
    primaryColor: string | undefined;
    env: LughEnvironment | undefined;
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
    refreshSkewSeconds?: number;
    /** Design system primary color (overrides `--lugh-primary`). */
    primaryColor?: string;
    /** Language used by the components. Default: `"en"`. */
    language?: LughLanguage;
    /** Visual theme. Default: follows `prefers-color-scheme`. */
    theme?: LughTheme;
    children: ReactNode;
    env?: LughEnvironment;
}
export declare function LughProvider({ clientId, redirectUri, lughApiUrl, refreshSkewSeconds, primaryColor, language, theme, children, env, }: LughProviderProps): JSX.Element;
//# sourceMappingURL=provider.d.ts.map