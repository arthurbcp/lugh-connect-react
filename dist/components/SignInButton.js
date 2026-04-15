"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLugh } from "../hooks";
export function LughSignInButton({ children = "Entrar com Lugh", className, showIcon = true, onClick, onError, }) {
    const { signIn, loading, isSignedIn } = useLugh();
    const handleClick = async () => {
        onClick?.();
        try {
            await signIn();
        }
        catch (err) {
            onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };
    return (_jsxs("button", { type: "button", className: `lugh-btn${className ? ` ${className}` : ""}`, onClick: () => {
            void handleClick();
        }, disabled: loading || isSignedIn, children: [showIcon && (_jsxs("svg", { className: "lugh-btn__icon", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "2" }), _jsx("path", { d: "M8 8v8h8", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })] })), _jsx("span", { children: children })] }));
}
//# sourceMappingURL=SignInButton.js.map