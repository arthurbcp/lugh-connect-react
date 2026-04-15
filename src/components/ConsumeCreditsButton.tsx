"use client";

import { useState, type JSX, type ReactNode } from "react";
import { useLugh, useLughCredits } from "../hooks";
import { useLughMessages, ERROR_MESSAGES } from "../i18n";

export interface LughConsumeCreditsButtonProps {
  /**
   * Quantidade de créditos que esta ação custa. Usado **apenas** para UX
   * client-side: desabilita o botão quando `total < cost` e formata o label
   * default. O débito real acontece no backend do integrador (dentro do
   * `onClick`), que chama `/credits/consume` no lugh-api com a private key
   * do app — esse valor aqui não autoriza nada.
   */
  cost: number;
  children?: ReactNode;
  className?: string;
  /** Substitui completamente as classes padrão do botão (`lugh-btn lugh-btn--gradient`). */
  classOverride?: string;
  disabled?: boolean;
  /** Texto exibido enquanto a request está em andamento. */
  loadingLabel?: ReactNode;
  /**
   * Handler do clique. **É aqui que o integrador faz o trabalho pago** —
   * tipicamente um `fetch` para uma rota do próprio backend que, por sua
   * vez, chama `/credits/consume` server-to-server usando a private key do
   * app. Pode ser sync ou async. Se lançar, o erro vira `onError`; se
   * resolver, `onSuccess` é chamado.
   */
  onClick?: () => void | Promise<void>;
  onSuccess?: () => void;
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
  cost,
  children,
  className,
  classOverride,
  disabled,
  loadingLabel,
  onClick,
  onSuccess,
  onError,
}: LughConsumeCreditsButtonProps): JSX.Element {
  const { isSignedIn } = useLugh();
  const { total } = useLughCredits();
  const t = useLughMessages();
  const [loading, setLoading] = useState<boolean>(false);
  const [insufficient, setInsufficient] = useState<boolean>(false);

  const hasEnough = total >= cost;

  const handleClick = async (): Promise<void> => {
    if (!isSignedIn) {
      onError?.(new Error(ERROR_MESSAGES.notSignedIn));
      return;
    }
    if (!Number.isInteger(cost) || cost < 0) {
      onError?.(new Error(ERROR_MESSAGES.invalidCost));
      return;
    }

    if (total < cost) {
      setInsufficient(true);
      onError?.(
        new InsufficientCreditsError(cost, total, t.insufficientCredits),
      );
      return;
    }
    setInsufficient(false);

    setLoading(true);
    try {
      if (onClick) {
        await onClick();
      }
      onSuccess?.();
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
        className={`${classOverride ?? "lugh-btn lugh-btn--gradient"}${className ? ` ${className}` : ""}`}
        onClick={() => {
          void handleClick();
        }}
        disabled={disabled || loading || !isSignedIn || !hasEnough}
        aria-busy={loading}
      >
        {loading
          ? (loadingLabel ?? t.consumeLoading)
          : (children ?? t.consumeDefault(cost))}
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
