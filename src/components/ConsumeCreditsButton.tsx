"use client";

import { useState, type JSX, type ReactNode } from "react";
import { useLugh, useLughCredits } from "../hooks";
import { useLughMessages, ERROR_MESSAGES } from "../i18n";

export interface ConsumeCreditsResult {
  action: string;
  amount: number;
  /** Resposta crua devolvida pelo endpoint /credits/consume. */
  response: unknown;
}

export interface LughConsumeCreditsButtonProps {
  /** Identificador da ação de negócio que está consumindo créditos. */
  action: string;
  /** Quantidade de créditos a consumir (inteiro positivo). */
  amount: number;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  /** Texto exibido enquanto a request está em andamento. */
  loadingLabel?: ReactNode;
  /**
   * Ação do clique (pode ser async). O consumo de créditos só é executado
   * após a resolução desta função. Se ela lançar, o consumo é abortado.
   */
  onClick?: () => void | Promise<void>;
  onSuccess?: (result: ConsumeCreditsResult) => void;
  onError?: (err: Error) => void;
}

const UPGRADE_URL = "https://app.lugh.digital/en/pricing";

export class InsufficientCreditsError extends Error {
  readonly code = "insufficient_credits" as const;
  readonly required: number;
  readonly available: number;
  constructor(required: number, available: number, message: string) {
    super(message);
    this.name = "InsufficientCreditsError";
    this.required = required;
    this.available = available;
  }
}

export function LughConsumeCreditsButton({
  action,
  amount,
  children,
  className,
  disabled,
  loadingLabel,
  onClick,
  onSuccess,
  onError,
}: LughConsumeCreditsButtonProps): JSX.Element {
  const { auth, authBase, publicToken, isSignedIn } = useLugh();
  const { total, refetch } = useLughCredits();
  const t = useLughMessages();
  const [loading, setLoading] = useState<boolean>(false);
  const [insufficient, setInsufficient] = useState<boolean>(false);

  const hasEnough = total >= amount;

  const handleClick = async (): Promise<void> => {
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
      onError?.(
        new InsufficientCreditsError(amount, total, t.insufficientCredits),
      );
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
      const data: unknown = await res.json();
      onSuccess?.({ action, amount, response: data });
      void refetch();
    } catch (err: unknown) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lugh-consume">
      <button
        type="button"
        className={`lugh-btn lugh-btn--gradient${className ? ` ${className}` : ""}`}
        onClick={() => {
          void handleClick();
        }}
        disabled={disabled || loading || !isSignedIn || !hasEnough}
        aria-busy={loading}
      >
        {loading
          ? (loadingLabel ?? t.consumeLoading)
          : (children ?? t.consumeDefault(amount))}
      </button>

      {(insufficient || (isSignedIn && !hasEnough)) && (
        <p className="lugh-consume__insufficient" role="alert">
          <span>{t.insufficientCredits}</span>{" "}
          <a
            className="lugh-consume__link"
            href={UPGRADE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.getMoreCredits}
          </a>
        </p>
      )}
    </div>
  );
}
