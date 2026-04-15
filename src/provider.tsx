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
  DEFAULT_LUGH_API_URL,
  LughAuth,
  type LughAuthOptions,
  type LughTheme,
  type UserClaims,
} from "lugh-connect";
import type { LughLanguage } from "./i18n";

export type { LughTheme };

export interface LughContextValue {
  auth: LughAuth | null;
  lughApiUrl: string;
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
  /**
   * Base URL of the lugh-api authorization server (no trailing slash).
   * Default: `https://api.lugh.digital`.
   */
  lughApiUrl?: string;
  scope?: string;
  refreshSkewSeconds?: number;
  /** Design system primary color (overrides `--lugh-primary`). */
  primaryColor?: string;
  /** Language used by the components. Default: `"en"`. */
  language?: LughLanguage;
  /** Visual theme. Default: follows `prefers-color-scheme`. */
  theme?: LughTheme;
  children: ReactNode;
}

export function LughProvider({
  clientId,
  redirectUri,
  lughApiUrl,
  scope,
  refreshSkewSeconds,
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

  const resolvedApiUrl = (lughApiUrl ?? DEFAULT_LUGH_API_URL).replace(/\/+$/, "");

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const opts: LughAuthOptions = { clientId, redirectUri, lughApiUrl: resolvedApiUrl };
    if (scope !== undefined) opts.scope = scope;
    if (refreshSkewSeconds !== undefined) {
      opts.refreshSkewSeconds = refreshSkewSeconds;
    }
    if (language !== undefined) opts.language = language;
    if (theme !== undefined) opts.theme = theme;
    if (primaryColor !== undefined) opts.primaryColor = primaryColor;

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
  }, [
    clientId,
    redirectUri,
    resolvedApiUrl,
    scope,
    refreshSkewSeconds,
    language,
    theme,
    primaryColor,
  ]);

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
      lughApiUrl: resolvedApiUrl,
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
      resolvedApiUrl,
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
