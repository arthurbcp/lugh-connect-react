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
    /**
     * Ação do clique (pode ser async). O consumo de créditos só é executado
     * após a resolução desta função. Se ela lançar, o consumo é abortado.
     */
    onClick?: () => void | Promise<void>;
    onSuccess?: (result: ConsumeCreditsResult) => void;
    onError?: (err: Error) => void;
}
export declare class InsufficientCreditsError extends Error {
    readonly code: "insufficient_credits";
    readonly required: number;
    readonly available: number;
    constructor(required: number, available: number, message: string);
}
export declare function LughConsumeCreditsButton({ action, amount, children, className, disabled, loadingLabel, onClick, onSuccess, onError, }: LughConsumeCreditsButtonProps): JSX.Element;
//# sourceMappingURL=ConsumeCreditsButton.d.ts.map