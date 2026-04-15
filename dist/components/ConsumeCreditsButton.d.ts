import { type JSX, type ReactNode } from "react";
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
export declare function LughConsumeCreditsButton({ action, amount, children, className, disabled, loadingLabel, onSuccess, onError, }: LughConsumeCreditsButtonProps): JSX.Element;
//# sourceMappingURL=ConsumeCreditsButton.d.ts.map