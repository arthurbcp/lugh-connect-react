"use client";
import { useCallback, useContext, useEffect, useState } from "react";
import { LughContext } from "./provider";
export function useLugh() {
    const ctx = useContext(LughContext);
    if (!ctx) {
        throw new Error("useLugh: precisa estar dentro de <LughProvider>");
    }
    return ctx;
}
export function useLughCredits() {
    const { auth, authBase, isSignedIn } = useLugh();
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
            const res = await auth.fetchWithAuth(`${authBase}/credits/breakdown`);
            if (!res.ok) {
                throw new Error(`GET /credits/breakdown ${res.status}: ${await res.text()}`);
            }
            const data = (await res.json());
            setBreakdown(data);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        }
        finally {
            setLoading(false);
        }
    }, [auth, authBase, isSignedIn]);
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
    return {
        breakdown,
        total: breakdown?.total ?? 0,
        loading,
        error,
        refetch,
    };
}
//# sourceMappingURL=hooks.js.map