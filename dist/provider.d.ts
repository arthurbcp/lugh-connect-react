import { type JSX, type ReactNode } from "react";
import { LughAuth, type UserClaims } from "lugh-connect";
export interface LughContextValue {
    auth: LughAuth | null;
    authBase: string;
    isSignedIn: boolean;
    user: UserClaims | null;
    loading: boolean;
    error: Error | null;
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
    children: ReactNode;
}
export declare function LughProvider({ clientId, redirectUri, authBase, scope, refreshSkewSeconds, children, }: LughProviderProps): JSX.Element;
//# sourceMappingURL=provider.d.ts.map