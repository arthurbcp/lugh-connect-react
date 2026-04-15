"use client";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { LughContext } from "./provider";
import { ERROR_MESSAGES } from "./i18n";
export function useLugh() {
    const ctx = useContext(LughContext);
    if (!ctx) {
        throw new Error(ERROR_MESSAGES.providerMissing);
    }
    return ctx;
}
function toWebSocketUrl(lughApiUrl, accessToken) {
    const url = new URL(`${lughApiUrl}/ws/credits`);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.searchParams.set("access_token", accessToken);
    return url.toString();
}
export function useLughCredits() {
    const { auth, lughApiUrl, isSignedIn } = useLugh();
    const [breakdown, setBreakdown] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const refetch = useCallback(async () => {
        if (!auth || !isSignedIn) {
            setBreakdown(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await auth.api.credits.breakdown();
            setBreakdown(data);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        }
        finally {
            setLoading(false);
        }
    }, [auth, isSignedIn]);
    useEffect(() => {
        void refetch();
    }, [refetch]);
    useEffect(() => {
        if (!auth)
            return;
        const onChange = () => {
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
    const socketRef = useRef(null);
    useEffect(() => {
        if (typeof window === "undefined")
            return;
        if (!auth || !isSignedIn)
            return;
        let cancelled = false;
        let reconnectTimer = null;
        let attempt = 0;
        const connect = () => {
            const token = auth.accessToken;
            if (!token || cancelled)
                return;
            let ws;
            try {
                ws = new WebSocket(toWebSocketUrl(lughApiUrl, token));
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
                return;
            }
            socketRef.current = ws;
            ws.onmessage = (event) => {
                try {
                    const parsed = JSON.parse(event.data);
                    if (parsed?.type === "credits.update") {
                        setBreakdown(parsed.breakdown ?? null);
                    }
                }
                catch {
                    /* ignore malformed frames */
                }
            };
            ws.onopen = () => {
                attempt = 0;
            };
            ws.onclose = () => {
                if (cancelled)
                    return;
                socketRef.current = null;
                attempt += 1;
                const delay = Math.min(30_000, 500 * 2 ** Math.min(attempt, 6));
                reconnectTimer = setTimeout(connect, delay);
            };
            ws.onerror = () => {
                // Let onclose handle reconnection — closing here avoids a double
                // reconnect if the browser fires both.
                try {
                    ws.close();
                }
                catch {
                    /* noop */
                }
            };
        };
        connect();
        return () => {
            cancelled = true;
            if (reconnectTimer !== null)
                clearTimeout(reconnectTimer);
            const ws = socketRef.current;
            socketRef.current = null;
            if (ws) {
                ws.onclose = null;
                ws.onerror = null;
                ws.onmessage = null;
                ws.onopen = null;
                try {
                    ws.close();
                }
                catch {
                    /* noop */
                }
            }
        };
    }, [auth, lughApiUrl, isSignedIn]);
    return {
        breakdown,
        total: breakdown?.total ?? 0,
        loading,
        error,
        refetch,
    };
}
//# sourceMappingURL=hooks.js.map