import { type JSX } from "react";
export interface LughCreditsBadgeProps {
    /** Título do popover. Default: "Créditos". */
    title?: string;
    /** Rótulo de cada bloco de assinatura. Recebe o nome do plano. */
    blockSubscriptionLabel?: (plan: string) => string;
    /** Rótulo dos blocos avulsos (packs). Default: "Pack extra". */
    blockPackLabel?: string;
    /** Texto exibido quando o saldo está zerado. */
    emptyLabel?: string;
    className?: string;
}
export declare function LughCreditsBadge({ title, blockSubscriptionLabel, blockPackLabel, emptyLabel, className, }: LughCreditsBadgeProps): JSX.Element | null;
//# sourceMappingURL=CreditsBadge.d.ts.map