"use client";

import { useState, type JSX, type ReactNode } from "react";
import { useLugh } from "../hooks";

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
  onSuccess?: (result: ConsumeCreditsResult) => void;
  onError?: (err: Error) => void;
}

export function LughConsumeCreditsButton({
  action,
  amount,
  children,
  className,
  disabled,
  loadingLabel = "...",
  onSuccess,
  onError,
}: LughConsumeCreditsButtonProps): JSX.Element {
  const { auth, authBase, isSignedIn } = useLugh();
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async (): Promise<void> => {
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
      const data: unknown = await res.json();
      onSuccess?.({ action, amount, response: data });
    } catch (err: unknown) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`lugh-btn lugh-btn--gradient${className ? ` ${className}` : ""}`}
      onClick={() => {
        void handleClick();
      }}
      disabled={disabled || loading || !isSignedIn}
      aria-busy={loading}
    >
      {loading ? loadingLabel : (children ?? `Consumir ${amount} créditos`)}
    </button>
  );
}
