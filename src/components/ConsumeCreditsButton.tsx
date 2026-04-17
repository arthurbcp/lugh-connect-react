"use client";

import { useContext, useState, type JSX, type ReactNode } from "react";
import { useMutation } from "convex/react";
import { useLugh, useLughActions, useLughCredits } from "../hooks";
import { useLughMessages, ERROR_MESSAGES } from "../i18n";
import { DEFAULT_LUGH_PRICING_URL, LughContext } from "../provider";
import { openCreditRequest, type LughEnvironmentArg } from "../convexApi";

export interface LughConsumeRequestContext {
  /** ID da reserva criada por `openCreditRequest`. Passe pro seu backend pra confirmar o débito. */
  requestId: string;
  /** Quantidade de créditos reservados no lugh-app (fonte da verdade é server-side). */
  creditsReserved: number;
  /** Epoch ms de expiração da reserva — o backend tem até esse instante pra confirmar. */
  expiresAt: number;
}

export interface LughConsumeCreditsButtonProps {
  /**
   * Slug da ação cobrada — precisa existir como `app_action` publicada para
   * o app no lugh-app. O custo é resolvido automaticamente a partir dele
   * via `useLughActions()` (com cache em `localStorage` pra evitar flash
   * de loading). Passado também pra `openCreditRequest` no clique.
   */
  actionSlug: string;
  /**
   * Override opcional do environment. Default: o `env` do `LughProvider`
   * (ou `"production"` se não definido).
   */
  environment?: LughEnvironmentArg;
  /**
   * Chave de idempotência opcional. Se o usuário clicar duas vezes, o
   * lugh-app devolve a mesma reserva em vez de criar outra.
   */
  idempotencyKey?: string;
  children?: ReactNode;
  className?: string;
  /** Substitui completamente as classes padrão do botão (`lugh-btn lugh-btn--gradient`). */
  classOverride?: string;
  disabled?: boolean;
  /** Texto exibido enquanto a request está em andamento. */
  loadingLabel?: ReactNode;
  /**
   * Handler do clique. O botão **já abriu a reserva** via `openCreditRequest`
   * antes de chamar isto — é aqui que o integrador faz o trabalho pago,
   * tipicamente um `fetch` pra uma rota do próprio backend que confirma
   * via lugh-sdk (`PUT /api/v1/credits/consume`) usando a private key.
   * Pode ser sync ou async. Se lançar, o erro vira `onError`; se resolver,
   * `onSuccess` é chamado.
   */
  onClick?: (ctx: LughConsumeRequestContext) => void | Promise<void>;
  onSuccess?: (ctx: LughConsumeRequestContext) => void;
  onError?: (err: Error) => void;
}

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

export class ActionNotFoundError extends Error {
  readonly code = "action_not_found" as const;
  readonly actionSlug: string;
  constructor(actionSlug: string) {
    super(`No action registered with slug "${actionSlug}".`);
    this.name = "ActionNotFoundError";
    this.actionSlug = actionSlug;
  }
}

export function LughConsumeCreditsButton({
  actionSlug,
  environment,
  idempotencyKey,
  children,
  className,
  classOverride,
  disabled,
  loadingLabel,
  onClick,
  onSuccess,
  onError,
}: LughConsumeCreditsButtonProps): JSX.Element {
  const { isSignedIn, clientId, env } = useLugh();
  const { total } = useLughCredits();
  const { byslug, loading: actionsLoading } = useLughActions();
  const t = useLughMessages();
  const ctx = useContext(LughContext);
  const upgradeUrl = ctx?.pricingUrl ?? DEFAULT_LUGH_PRICING_URL;
  const openRequest = useMutation(openCreditRequest);
  const [loading, setLoading] = useState<boolean>(false);
  const [insufficient, setInsufficient] = useState<boolean>(false);

  const action = byslug(actionSlug);
  const cost = action?.amount ?? null;
  const hasEnough = cost !== null && total >= cost;

  const handleClick = async (): Promise<void> => {
    if (!isSignedIn) {
      onError?.(new Error(ERROR_MESSAGES.notSignedIn));
      return;
    }
    if (cost === null) {
      onError?.(new ActionNotFoundError(actionSlug));
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
      const opened = await openRequest({
        appSlug: clientId,
        actionSlug,
        environment: environment ?? env ?? "production",
        ...(idempotencyKey ? { idempotencyKey } : {}),
      });
      const requestCtx: LughConsumeRequestContext = {
        requestId: opened.requestId,
        creditsReserved: opened.creditsReserved,
        expiresAt: opened.expiresAt,
      };
      if (onClick) {
        await onClick(requestCtx);
      }
      onSuccess?.(requestCtx);
    } catch (err: unknown) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const label =
    loading
      ? (loadingLabel ?? t.consumeLoading)
      : children ?? (cost !== null ? t.consumeDefault(cost) : t.consumeLoading);

  return (
    <div className="lugh-consume">
      <button
        type="button"
        className={`${classOverride ?? "lugh-btn lugh-btn--gradient"}${className ? ` ${className}` : ""}`}
        onClick={() => {
          void handleClick();
        }}
        disabled={
          disabled ||
          loading ||
          !isSignedIn ||
          actionsLoading ||
          cost === null ||
          !hasEnough
        }
        aria-busy={loading}
      >
        {label}
      </button>

      {(insufficient || (isSignedIn && cost !== null && !hasEnough)) && (
        <p className="lugh-consume__insufficient" role="alert">
          <span>{t.insufficientCredits}</span>{" "}
          <a
            className="lugh-consume__link"
            href={upgradeUrl}
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
