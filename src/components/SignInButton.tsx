"use client";

import type { JSX, ReactNode } from "react";
import { useLugh } from "../hooks";
import { useLughMessages } from "../i18n";

export interface LughSignInButtonProps {
  children?: ReactNode;
  className?: string;
  /** Substitui completamente as classes padrão do botão (`lugh-btn`). */
  classOverride?: string;
  showIcon?: boolean;
  onClick?: () => void;
  onError?: (err: Error) => void;
}

export function LughSignInButton({
  children,
  className,
  classOverride,
  showIcon = true,
  onClick,
  onError,
}: LughSignInButtonProps): JSX.Element {
  const { signIn, loading, isSignedIn } = useLugh();
  const t = useLughMessages();

  const handleClick = async (): Promise<void> => {
    onClick?.();
    try {
      await signIn();
    } catch (err: unknown) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  };

  return (
    <button
      type="button"
      className={`${classOverride ?? "lugh-btn"}${className ? ` ${className}` : ""}`}
      onClick={() => {
        void handleClick();
      }}
      disabled={loading || isSignedIn}
    >
      {showIcon && (
        <svg
          className="lugh-btn__icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 8v8h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span>{children ?? t.signInWithLugh}</span>
    </button>
  );
}
