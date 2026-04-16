import { type JSX, type ReactNode } from "react";
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
export declare class InsufficientCreditsError extends Error {
    readonly code: "insufficient_credits";
    readonly required: number;
    readonly available: number;
    constructor(required: number, available: number, message: string);
}
export declare function LughConsumeCreditsButton({ cost, children, className, classOverride, disabled, loadingLabel, onClick, onSuccess, onError, }: LughConsumeCreditsButtonProps): JSX.Element;
//# sourceMappingURL=ConsumeCreditsButton.d.ts.map