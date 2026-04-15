"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type JSX,
  type ReactNode,
} from "react";
import {
  LughAuth,
  type LughAuthOptions,
  type UserClaims,
} from "lugh-connect";

export interface LughContextValue {
  auth: LughAuth | null;
  authBase: string;
  isSignedIn: boolean;
  user: UserClaims | null;
  loading: boolean;
  error: Error | null;
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
  children: ReactNode;
}

const DEFAULT_AUTH_BASE = "https://api.lugh.digital";

export function LughProvider({
  clientId,
  redirectUri,
  authBase,
  scope,
  refreshSkewSeconds,
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
      isSignedIn,
      user,
      loading,
      error,
      signIn,
      signOut,
    }),
    [
      auth,
      normalizedAuthBase,
      isSignedIn,
      user,
      loading,
      error,
      signIn,
      signOut,
    ],
  );

  return <LughContext.Provider value={value}>{children}</LughContext.Provider>;
}
