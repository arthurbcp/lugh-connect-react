"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
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

interface CreditsUpdateMessage {
  type: "credits.update";
  breakdown: CreditsBreakdown | null;
}

function toWebSocketUrl(authBase: string, accessToken: string): string {
  const url = new URL(`${authBase}/ws/credits`);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("access_token", accessToken);
  return url.toString();
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

  // Live updates via WebSocket. The server pushes a fresh breakdown on connect
  // and after every consume, so we overwrite local state directly without
  // refetching. Reconnects with exponential backoff on unexpected closes.
  const socketRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!auth || !isSignedIn) return;

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;

    const connect = (): void => {
      const token = auth.accessToken;
      if (!token || cancelled) return;

      let ws: WebSocket;
      try {
        ws = new WebSocket(toWebSocketUrl(authBase, token));
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return;
      }
      socketRef.current = ws;

      ws.onmessage = (event: MessageEvent<string>): void => {
        try {
          const parsed = JSON.parse(event.data) as CreditsUpdateMessage;
          if (parsed?.type === "credits.update") {
            setBreakdown(parsed.breakdown ?? null);
          }
        } catch {
          /* ignore malformed frames */
        }
      };

      ws.onopen = (): void => {
        attempt = 0;
      };

      ws.onclose = (): void => {
        if (cancelled) return;
        socketRef.current = null;
        attempt += 1;
        const delay = Math.min(30_000, 500 * 2 ** Math.min(attempt, 6));
        reconnectTimer = setTimeout(connect, delay);
      };

      ws.onerror = (): void => {
        // Let onclose handle reconnection — closing here avoids a double
        // reconnect if the browser fires both.
        try {
          ws.close();
        } catch {
          /* noop */
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer !== null) clearTimeout(reconnectTimer);
      const ws = socketRef.current;
      socketRef.current = null;
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        ws.onopen = null;
        try {
          ws.close();
        } catch {
          /* noop */
        }
      }
    };
  }, [auth, authBase, isSignedIn]);

  return {
    breakdown,
    total: breakdown?.total ?? 0,
    loading,
    error,
    refetch,
  };
}
