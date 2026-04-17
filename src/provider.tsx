"use client";

import {
  createContext,
  useCallback,
  useContext,
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
  type LughTheme,
  type LughUserClaims,
} from "lugh-connect";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import type { LughLanguage } from "./i18n";

export type { LughTheme };

export type LughEnvironment = "production" | "sandbox";

export const DEFAULT_LUGH_PRICING_URL = "https://app.lugh.digital/en/pricing";

export interface LughContextValue {
  auth: LughAuth | null;
  apiUrl: string;
  cloudUrl: string;
  pricingUrl: string;
  isSignedIn: boolean;
  user: LughUserClaims | null;
  loading: boolean;
  error: Error | null;
  language: LughLanguage | undefined;
  theme: LughTheme | undefined;
  primaryColor: string | undefined;
  env: LughEnvironment | undefined;
  clientId: string;
  signIn: () => Promise<void>;
  signOut: (opts?: { revoke?: boolean }) => Promise<void>;
}

export const LughContext = createContext<LughContextValue | null>(null);

// Hook consumido pelo `ConvexProviderWithAuth`. Precisa retornar um objeto
// com identidade **estável** entre renders quando o estado não mudou —
// Convex compara por referência pra decidir se reinicia a subscription.
// Criar um objeto novo a cada render causa loop infinito de
// `fetchAccessToken(forceRefreshToken: true)`. Daí o `useMemo` com deps
// primitivas + a referência da instância de `LughAuth`.
function useAuthFromLugh(): {
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchAccessToken: (args: {
    forceRefreshToken: boolean;
  }) => Promise<string | null>;
} {
  const ctx = useContext(LughContext);
  const auth = ctx?.auth ?? null;
  const isSignedIn = ctx?.isSignedIn ?? false;
  const loading = ctx?.loading ?? true;

  const fetchAccessToken = useCallback(
    async ({
      forceRefreshToken,
    }: {
      forceRefreshToken: boolean;
    }): Promise<string | null> => {
      if (!auth) return null;
      if (forceRefreshToken) {
        try {
          const next = await auth.refresh();
          return next.access_token ?? null;
        } catch {
          return null;
        }
      }
      return auth.accessToken;
    },
    [auth],
  );

  return useMemo(
    () => ({
      isLoading: loading,
      isAuthenticated: Boolean(isSignedIn && auth),
      fetchAccessToken,
    }),
    [loading, isSignedIn, auth, fetchAccessToken],
  );
}

export interface LughProviderProps {
  clientId: string;
  redirectUri: string;
  /**
   * URL do deployment Convex do lugh-app (ex:
   * `https://<slug>.convex.cloud`). O saldo de créditos é servido direto
   * daqui via queries reativas — sem polling.
   */
  cloudUrl: string;
  /**
   * Base URL of the Lugh app authorization server (no trailing slash).
   */
  apiUrl: string;
  /**
   * Destino do link "get more credits" dos componentes (CreditsBadge,
   * ConsumeCreditsButton). Default: página pública de pricing do Lugh.
   */
  pricingUrl?: string;
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

export function LughProvider({
  clientId,
  redirectUri,
  cloudUrl,
  apiUrl,
  pricingUrl,
  refreshSkewSeconds,
  primaryColor,
  language,
  theme,
  children,
  env,
}: LughProviderProps): JSX.Element {
  const resolvedPricingUrl = pricingUrl ?? DEFAULT_LUGH_PRICING_URL;
  const [auth, setAuth] = useState<LughAuth | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [user, setUser] = useState<LughUserClaims | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const resolvedApiUrl = apiUrl.replace(/\/+$/, "");

  // `ConvexReactClient` é stateful (abre websocket, mantém subscriptions).
  // Uma instância por URL, criada **uma vez** — reagir à mudança de URL
  // implica reassinar tudo. `useMemo` basta porque as deps quase nunca
  // mudam em runtime.
  const convex = useMemo(
    () => new ConvexReactClient(cloudUrl),
    [cloudUrl],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const opts: LughAuthOptions = {
      clientId,
      redirectUri,
      lughApiUrl: resolvedApiUrl,
    };
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
    refreshSkewSeconds,
    language,
    theme,
    primaryColor,
    env,
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
      apiUrl: resolvedApiUrl,
      cloudUrl,
      pricingUrl: resolvedPricingUrl,
      isSignedIn,
      user,
      loading,
      error,
      language,
      theme,
      primaryColor,
      env,
      clientId,
      signIn,
      signOut,
    }),
    [
      auth,
      resolvedApiUrl,
      cloudUrl,
      resolvedPricingUrl,
      isSignedIn,
      user,
      loading,
      error,
      language,
      theme,
      primaryColor,
      env,
      clientId,
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
      <ConvexProviderWithAuth client={convex} useAuth={useAuthFromLugh}>
        <div
          className="lugh-root"
          data-lugh-theme={theme}
          lang={language}
          style={wrapperStyle}
        >
          {children}
        </div>
      </ConvexProviderWithAuth>
    </LughContext.Provider>
  );
}

