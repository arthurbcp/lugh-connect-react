"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type JSX,
  type ReactNode,
} from "react";
import {
  LughAuth,
  type LughAuthOptions,
  type UserClaims,
} from "lugh-connect";
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
  signOut: (opts?: { revoke?: boolean }) => Promise<void>;
}

export const LughContext = createContext<LughContextValue | null>(null);

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

const DEFAULT_AUTH_BASE = "https://api.lugh.digital";

export function LughProvider({
  clientId,
  redirectUri,
  authBase,
  scope,
  refreshSkewSeconds,
  publicToken,
  primaryColor,
  language,
  theme,
  children,
}: LughProviderProps): JSX.Element {
  const [auth, setAuth] = useState<LughAuth | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [user, setUser] = useState<UserClaims | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const normalizedAuthBase = (authBase ?? DEFAULT_AUTH_BASE).replace(/\/$/, "");

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const opts: LughAuthOptions = { clientId, redirectUri };
    if (authBase !== undefined) opts.authBase = authBase;
    if (scope !== undefined) opts.scope = scope;
    if (refreshSkewSeconds !== undefined) {
      opts.refreshSkewSeconds = refreshSkewSeconds;
    }

    LughAuth.init(opts)
      .then((instance) => {
        if (cancelled) return;

        const sync = (): void => {
          setIsSignedIn(instance.isSignedIn);
          setUser(instance.user);
        };

        const onError = (err: Error): void => setError(err);

        instance.on("signin", sync);
        instance.on("signout", sync);
        instance.on("refresh", sync);
        instance.on("error", onError);

        setAuth(instance);
        sync();
        if (instance.bootstrapError) setError(instance.bootstrapError);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, redirectUri, authBase, scope, refreshSkewSeconds]);

  const signIn = useCallback(async (): Promise<void> => {
    if (!auth) throw new Error("LughProvider not initialized");
    await auth.signIn();
  }, [auth]);

  const signOut = useCallback(
    async (opts?: { revoke?: boolean }): Promise<void> => {
      if (!auth) return;
      await auth.signOut(opts);
    },
    [auth],
  );

  const value = useMemo<LughContextValue>(
    () => ({
      auth,
      authBase: normalizedAuthBase,
      publicToken,
      isSignedIn,
      user,
      loading,
      error,
      language,
      theme,
      primaryColor,
      signIn,
      signOut,
    }),
    [
      auth,
      normalizedAuthBase,
      publicToken,
      isSignedIn,
      user,
      loading,
      error,
      language,
      theme,
      primaryColor,
      signIn,
      signOut,
    ],
  );

  const wrapperStyle = primaryColor
    ? ({
        "--lugh-primary": primaryColor,
        "--lugh-primary-hover": primaryColor,
      } as CSSProperties)
    : undefined;

  return (
    <LughContext.Provider value={value}>
      <div
        className="lugh-root"
        data-lugh-theme={theme}
        lang={language}
        style={wrapperStyle}
      >
        {children}
      </div>
    </LughContext.Provider>
  );
}
