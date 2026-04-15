"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useLugh, useLughCredits } from "../hooks";
import { useLughMessages, ERROR_MESSAGES } from "../i18n";
const UPGRADE_URL = "https://app.lugh.digital/en/pricing";
export class InsufficientCreditsError extends Error {
    code = "insufficient_credits";
    required;
    available;
    constructor(required, available, message) {
        super(message);
        this.name = "InsufficientCreditsError";
        this.required = required;
        this.available = available;
    }
}
export function LughConsumeCreditsButton({ action, amount, children, className, classOverride, disabled, loadingLabel, onClick, onSuccess, onError, }) {
    const { auth, authBase, publicToken, isSignedIn } = useLugh();
    const { total, refetch } = useLughCredits();
    const t = useLughMessages();
    const [loading, setLoading] = useState(false);
    const [insufficient, setInsufficient] = useState(false);
    const hasEnough = total >= amount;
    const handleClick = async () => {
        if (!auth || !isSignedIn) {
            onError?.(new Error(ERROR_MESSAGES.notSignedIn));
            return;
        }
        if (!Number.isInteger(amount) || amount <= 0) {
            onError?.(new Error(ERROR_MESSAGES.invalidAmount));
            return;
        }
        if (!publicToken) {
            onError?.(new Error(ERROR_MESSAGES.missingPublicToken));
            return;
        }
        if (total < amount) {
            setInsufficient(true);
            onError?.(new InsufficientCreditsError(amount, total, t.insufficientCredits));
            return;
        }
        setInsufficient(false);
        setLoading(true);
        try {
            if (onClick) {
                await onClick();
            }
            const res = await auth.fetchWithAuth(`${authBase}/credits/consume`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, amount, publicToken }),
            });
            if (!res.ok) {
                const detail = await res.text();
                throw new Error(`PUT /credits/consume ${res.status}: ${detail}`);
            }
            const data = await res.json();
            onSuccess?.({ action, amount, response: data });
            void refetch();
        }
        catch (err) {
            onError?.(err instanceof Error ? err : new Error(String(err)));
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "lugh-consume", children: [_jsx("button", { type: "button", className: `${classOverride ?? "lugh-btn lugh-btn--gradient"}${className ? ` ${className}` : ""}`, onClick: () => {
                    void handleClick();
                }, disabled: disabled || loading || !isSignedIn || !hasEnough, "aria-busy": loading, children: loading
                    ? (loadingLabel ?? t.consumeLoading)
                    : (children ?? t.consumeDefault(amount)) }), (insufficient || (isSignedIn && !hasEnough)) && (_jsxs("p", { className: "lugh-consume__insufficient", role: "alert", children: [_jsx("span", { children: t.insufficientCredits }), " ", _jsx("a", { className: "lugh-consume__link", href: UPGRADE_URL, target: "_blank", rel: "noopener noreferrer", children: t.getMoreCredits })] }))] }));
}
//# sourceMappingURL=ConsumeCreditsButton.js.map