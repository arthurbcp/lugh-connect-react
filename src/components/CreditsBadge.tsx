"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { useLughCredits, type CreditBlock } from "../hooks";
import { useLughMessages } from "../i18n";

export interface LughCreditsBadgeProps {
  /** Título do popover. Default: tradução de `creditsTitle`. */
  title?: string;
  /** Rótulo de cada bloco de assinatura. Recebe o nome do plano. */
  blockSubscriptionLabel?: (plan: string) => string;
  /** Rótulo dos blocos avulsos (packs). Default: tradução de `creditsPackLabel`. */
  blockPackLabel?: string;
  /** Texto exibido quando o saldo está zerado. */
  emptyLabel?: string;
  className?: string;
}

const UPGRADE_URL = "https://app.lugh.digital/en/pricing";

const DAY_MS = 24 * 60 * 60 * 1000;

type Tone = "primary" | "emerald" | "amber";

function toneFor(block: CreditBlock): Tone {
  const daysLeft = Math.max(
    0,
    Math.ceil((block.expiresAt - Date.now()) / DAY_MS),
  );
  if (daysLeft <= 3) return "amber";
  return block.plan ? "primary" : "emerald";
}

export function LughCreditsBadge({
  title,
  blockSubscriptionLabel = (plan) => plan.toUpperCase(),
  blockPackLabel,
  emptyLabel,
  className,
}: LughCreditsBadgeProps): JSX.Element | null {
  const { breakdown, total, loading, error } = useLughCredits();
  const t = useLughMessages();
  const resolvedTitle = title ?? t.creditsTitle;
  const resolvedPackLabel = blockPackLabel ?? t.creditsPackLabel;
  const resolvedEmptyLabel = emptyLabel ?? t.creditsEmpty;
  const [open, setOpen] = useState<boolean>(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent): void => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (error) return null;
  if (loading && !breakdown) return null;

  const blocks: CreditBlock[] = breakdown?.blocks ?? [];

  return (
    <div
      ref={rootRef}
      className={`lugh-credits${className ? ` ${className}` : ""}`}
    >
      <button
        type="button"
        className="lugh-credits__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t.creditsBalanceAria(total.toLocaleString())}
      >
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span className="lugh-credits__value">{total.toLocaleString()}</span>
      </button>

      {open && (
        <div className="lugh-credits__panel" role="dialog">
          <div className="lugh-credits__header">
            <span className="lugh-credits__title">{resolvedTitle}</span>
          </div>

          <div className="lugh-credits__total">{total.toLocaleString()}</div>

          {blocks.length > 0 ? (
            <div className="lugh-credits__blocks">
              {blocks.map((block) => {
                const percent =
                  block.amount > 0
                    ? Math.max(
                        0,
                        Math.min(
                          100,
                          Math.round((block.remaining / block.amount) * 100),
                        ),
                      )
                    : 0;
                const tone = toneFor(block);
                const label = block.plan
                  ? blockSubscriptionLabel(block.plan)
                  : resolvedPackLabel;

                return (
                  <div key={block.id} className="lugh-credits__block-row">
                    <div className="lugh-credits__block-head">
                      <span className="lugh-credits__block-label">
                        <BlockIcon isPack={block.plan === null} />
                        {label}
                      </span>
                      <span className="lugh-credits__block-nums">
                        {block.remaining.toLocaleString()} /{" "}
                        {block.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="lugh-credits__bar">
                      <div
                        className={`lugh-credits__bar-fill lugh-credits__bar-fill--${tone}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="lugh-credits__empty">{resolvedEmptyLabel}</p>
          )}

          <a
            className="lugh-credits__upgrade"
            href={UPGRADE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
            {t.creditsUpgrade}
          </a>
        </div>
      )}
    </div>
  );
}

function BlockIcon({ isPack }: { isPack: boolean }): JSX.Element {
  if (isPack) {
    return (
      <svg
        className="lugh-credits__block-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16.5 9.4 7.55 4.24" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="M3.27 6.96 12 12.01l8.73-5.05" />
        <path d="M12 22.08V12" />
      </svg>
    );
  }
  return (
    <svg
      className="lugh-credits__block-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}
