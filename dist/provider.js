"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useEffect, useMemo, useState, } from "react";
import { DEFAULT_LUGH_API_URL, LughAuth, } from "lugh-connect";
export const LughContext = createContext(null);
export function LughProvider({ clientId, redirectUri, lughApiUrl, scope, refreshSkewSeconds, publicToken, primaryColor, language, theme, children, }) {
    const [auth, setAuth] = useState(null);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const resolvedApiUrl = (lughApiUrl ?? DEFAULT_LUGH_API_URL).replace(/\/+$/, "");
    useEffect(() => {
        if (typeof window === "undefined")
            return;
        let cancelled = false;
        const opts = { clientId, redirectUri, lughApiUrl: resolvedApiUrl };
        if (scope !== undefined)
            opts.scope = scope;
        if (refreshSkewSeconds !== undefined) {
            opts.refreshSkewSeconds = refreshSkewSeconds;
        }
        if (language !== undefined)
            opts.language = language;
        if (theme !== undefined)
            opts.theme = theme;
        if (primaryColor !== undefined)
            opts.primaryColor = primaryColor;
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
        lughApiUrl: resolvedApiUrl,
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
    }), [
        auth,
        resolvedApiUrl,
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
    ]);
    const wrapperStyle = primaryColor
        ? {
            "--lugh-primary": primaryColor,
            "--lugh-primary-hover": primaryColor,
        }
        : undefined;
    return (_jsx(LughContext.Provider, { value: value, children: _jsx("div", { className: "lugh-root", "data-lugh-theme": theme, lang: language, style: wrapperStyle, children: children }) }));
}
//# sourceMappingURL=provider.js.map