"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useLugh } from "../hooks";
export function LughConsumeCreditsButton({ action, amount, children, className, disabled, loadingLabel = "...", onSuccess, onError, }) {
    const { auth, authBase, isSignedIn } = useLugh();
    const [loading, setLoading] = useState(false);
    const handleClick = async () => {
        if (!auth || !isSignedIn) {
            onError?.(new Error("usuário não autenticado"));
            return;
        }
        if (!Number.isInteger(amount) || amount <= 0) {
            onError?.(new Error("amount precisa ser inteiro positivo"));
            return;
        }
        setLoading(true);
        try {
            const res = await auth.fetchWithAuth(`${authBase}/credits/consume`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, amount }),
            });
            if (!res.ok) {
                const detail = await res.text();
                throw new Error(`PUT /credits/consume ${res.status}: ${detail}`);
            }
            const data = await res.json();
            onSuccess?.({ action, amount, response: data });
        }
        catch (err) {
            onError?.(err instanceof Error ? err : new Error(String(err)));
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("button", { type: "button", className: `lugh-btn lugh-btn--gradient${className ? ` ${className}` : ""}`, onClick: () => {
            void handleClick();
        }, disabled: disabled || loading || !isSignedIn, "aria-busy": loading, children: loading ? loadingLabel : (children ?? `Consumir ${amount} créditos`) }));
}
//# sourceMappingURL=ConsumeCreditsButton.js.map