"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useEffect, useMemo, useState, } from "react";
import { LughAuth, } from "lugh-connect";
export const LughContext = createContext(null);
const DEFAULT_AUTH_BASE = "https://api.lugh.digital";
export function LughProvider({ clientId, redirectUri, authBase, scope, refreshSkewSeconds, children, }) {
    const [auth, setAuth] = useState(null);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const normalizedAuthBase = (authBase ?? DEFAULT_AUTH_BASE).replace(/\/$/, "");
    useEffect(() => {
        if (typeof window === "undefined")
            return;
        let cancelled = false;
        const opts = { clientId, redirectUri };
        if (authBase !== undefined)
            opts.authBase = authBase;
        if (scope !== undefined)
            opts.scope = scope;
        if (refreshSkewSeconds !== undefined) {
            opts.refreshSkewSeconds = refreshSkewSeconds;
        }
        LughAuth.init(opts)
            .then((instance) => {
            if (cancelled)
                return;
            const sync = () => {
                setIsSignedIn(instance.isSignedIn);
                setUser(instance.user);
            };
            const onError = (err) => setError(err);
            instance.on("signin", sync);
            instance.on("signout", sync);
            instance.on("refresh", sync);
            instance.on("error", onError);
            setAuth(instance);
            sync();
            if (instance.bootstrapError)
                setError(instance.bootstrapError);
            setLoading(false);
        })
            .catch((err) => {
            if (cancelled)
                return;
            setError(err instanceof Error ? err : new Error(String(err)));
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [clientId, redirectUri, authBase, scope, refreshSkewSeconds]);
    const signIn = useCallback(async () => {
        if (!auth)
            throw new Error("LughProvider not initialized");
        await auth.signIn();
    }, [auth]);
    const signOut = useCallback(async (opts) => {
        if (!auth)
            return;
        await auth.signOut(opts);
    }, [auth]);
    const value = useMemo(() => ({
        auth,
        authBase: normalizedAuthBase,
        isSignedIn,
        user,
        loading,
        error,
        signIn,
        signOut,
    }), [
        auth,
        normalizedAuthBase,
        isSignedIn,
        user,
        loading,
        error,
        signIn,
        signOut,
    ]);
    return _jsx(LughContext.Provider, { value: value, children: children });
}
//# sourceMappingURL=provider.js.map