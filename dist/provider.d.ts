import { type JSX, type ReactNode } from "react";
import { LughAuth, type UserClaims } from "lugh-connect";
import type { LughLanguage } from "./i18n";
export type LughTheme = "dark" | "light";
export interface LughContextValue {
    auth: LughAuth | null;
    authBase: string;
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
    authBase?: string;
    scope?: string;
    refreshSkewSeconds?: number;
    /** Public token do app registrado na Lugh (obrigatório para consumir créditos). */
    publicToken?: string;
    /** Cor primária do design system (override de `--lugh-primary`). */
    primaryColor?: string;
    /** Código do idioma usado pelos componentes. Default: "en". */
    language?: LughLanguage;
    /** Tema visual. Default: segue `prefers-color-scheme`. */
    theme?: LughTheme;
    children: ReactNode;
}
export declare function LughProvider({ clientId, redirectUri, authBase, scope, refreshSkewSeconds, publicToken, primaryColor, language, theme, children, }: LughProviderProps): JSX.Element;
//# sourceMappingURL=provider.d.ts.map