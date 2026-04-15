import type { CreditsBreakdown } from "lugh-connect";
import { type LughContextValue } from "./provider";
export declare function useLugh(): LughContextValue;
export type { CreditBlock, CreditsBreakdown } from "lugh-connect";
export interface UseLughCreditsResult {
    breakdown: CreditsBreakdown | null;
    total: number;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}
export declare function useLughCredits(): UseLughCreditsResult;
//# sourceMappingURL=hooks.d.ts.map