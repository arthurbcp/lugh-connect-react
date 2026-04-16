"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { useLughCredits } from "../hooks";
import { useLughMessages } from "../i18n";
const UPGRADE_URL = "https://app.lugh.digital/en/pricing";
const DAY_MS = 24 * 60 * 60 * 1000;
function isSandbox(plan) {
    return plan?.toLowerCase() === "sandbox";
}
function toneFor(block) {
    const daysLeft = Math.max(0, Math.ceil((block.expiresAt - Date.now()) / DAY_MS));
    if (daysLeft <= 3)
        return "amber";
    if (isSandbox(block.plan))
        return "orange";
    return block.plan ? "primary" : "emerald";
}
export function LughCreditsBadge({ title, blockSubscriptionLabel = (plan) => plan.toUpperCase(), blockPackLabel, emptyLabel, className, }) {
    const { breakdown, total, loading, error } = useLughCredits();
    const t = useLughMessages();
    const resolvedTitle = title ?? t.creditsTitle;
    const resolvedPackLabel = blockPackLabel ?? t.creditsPackLabel;
    const resolvedEmptyLabel = emptyLabel ?? t.creditsEmpty;
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    useEffect(() => {
        if (!open)
            return;
        const onMouseDown = (e) => {
            if (!rootRef.current?.contains(e.target))
                setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === "Escape")
                setOpen(false);
        };
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);
    if (error)
        return null;
    if (loading && !breakdown)
        return null;
    const blocks = breakdown?.blocks ?? [];
    return (_jsxs("div", { ref: rootRef, className: `lugh-credits${className ? ` ${className}` : ""}`, children: [_jsxs("button", { type: "button", className: "lugh-credits__trigger", onClick: () => setOpen((v) => !v), "aria-expanded": open, "aria-haspopup": "dialog", "aria-label": t.creditsBalanceAria(total.toLocaleString()), children: [_jsx("svg", { viewBox: "0 0 24 24", width: "12", height: "12", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" }) }), _jsx("span", { className: "lugh-credits__value", children: total.toLocaleString() })] }), open && (_jsxs("div", { className: "lugh-credits__panel", role: "dialog", children: [_jsx("div", { className: "lugh-credits__header", children: _jsx("span", { className: "lugh-credits__title", children: resolvedTitle }) }), _jsx("div", { className: "lugh-credits__total", children: total.toLocaleString() }), blocks.length > 0 ? (_jsx("div", { className: "lugh-credits__blocks", children: blocks.map((block) => {
                            const percent = block.amount > 0
                                ? Math.max(0, Math.min(100, Math.round((block.remaining / block.amount) * 100)))
                                : 0;
                            const tone = toneFor(block);
                            const label = block.plan
                                ? blockSubscriptionLabel(block.plan)
                                : resolvedPackLabel;
                            return (_jsxs("div", { className: "lugh-credits__block-row", children: [_jsxs("div", { className: "lugh-credits__block-head", children: [_jsxs("span", { className: `lugh-credits__block-label${tone === "orange" ? " lugh-credits__block-label--orange" : ""}`, children: [_jsx(BlockIcon, { isPack: block.plan === null }), label] }), _jsxs("span", { className: `lugh-credits__block-nums${tone === "orange" ? " lugh-credits__block-nums--orange" : ""}`, children: [block.remaining.toLocaleString(), " /", " ", block.amount.toLocaleString()] })] }), _jsx("div", { className: "lugh-credits__bar", children: _jsx("div", { className: `lugh-credits__bar-fill lugh-credits__bar-fill--${tone}`, style: { width: `${percent}%` } }) })] }, block.id));
                        }) })) : (_jsx("p", { className: "lugh-credits__empty", children: resolvedEmptyLabel })), _jsxs("a", { className: "lugh-credits__upgrade", href: UPGRADE_URL, target: "_blank", rel: "noopener noreferrer", children: [_jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("path", { d: "M12 19V5" }), _jsx("path", { d: "m5 12 7-7 7 7" })] }), t.creditsUpgrade] })] }))] }));
}
function BlockIcon({ isPack }) {
    if (isPack) {
        return (_jsxs("svg", { className: "lugh-credits__block-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("path", { d: "M16.5 9.4 7.55 4.24" }), _jsx("path", { d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" }), _jsx("path", { d: "M3.27 6.96 12 12.01l8.73-5.05" }), _jsx("path", { d: "M12 22.08V12" })] }));
    }
    return (_jsxs("svg", { className: "lugh-credits__block-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("rect", { x: "2", y: "5", width: "20", height: "14", rx: "2" }), _jsx("path", { d: "M2 10h20" })] }));
}
//# sourceMappingURL=CreditsBadge.js.map