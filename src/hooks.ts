"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { LughContext, type LughContextValue } from "./provider";
import { ERROR_MESSAGES } from "./i18n";

export function useLugh(): LughContextValue {
  const ctx = useContext(LughContext);
  if (!ctx) {
    throw new Error(ERROR_MESSAGES.providerMissing);
  }
  return ctx;
}

export interface CreditBlock {
  id: string;
  plan: string | null;
  amount: number;
  used: number;
  remaining: number;
  startedAt: number;
  expiresAt: number;
}

export interface CreditsBreakdown {
  blocks: CreditBlock[];
  subscription: number;
  packs: number;
  total: number;
}

export interface UseLughCreditsResult {
  breakdown: CreditsBreakdown | null;
  total: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useLughCredits(): UseLughCreditsResult {
  const { auth, authBase, isSignedIn } = useLugh();
  const [breakdown, setBreakdown] = useState<CreditsBreakdown | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    if (!auth || !isSignedIn) {
      setBreakdown(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await auth.fetchWithAuth(`${authBase}/credits/breakdown`);
      if (!res.ok) {
        throw new Error(
          `GET /credits/breakdown ${res.status}: ${await res.text()}`,
        );
      }
      const data = (await res.json()) as CreditsBreakdown | null;
      setBreakdown(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [auth, authBase, isSignedIn]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (!auth) return;
    const onChange = (): void => {
      void refetch();
    };
    auth.on("signin", onChange);
    auth.on("refresh", onChange);
    auth.on("signout", onChange);
    return () => {
      auth.off("signin", onChange);
      auth.off("refresh", onChange);
      auth.off("signout", onChange);
    };
  }, [auth, refetch]);

  return {
    breakdown,
    total: breakdown?.total ?? 0,
    loading,
    error,
    refetch,
  };
}
