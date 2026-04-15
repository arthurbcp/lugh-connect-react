import { type LughContextValue } from "./provider";
export declare function useLugh(): LughContextValue;
export interface CreditBlock {
    id: string;
    plan: string | null;
    amount: number;
    used: number;
    remaining: number;
    startedAt: number;
    expiresAt: number;
}
export interface CreditsBreakdown {
    blocks: CreditBlock[];
    subscription: number;
    packs: number;
    total: number;
}
export interface UseLughCreditsResult {
    breakdown: CreditsBreakdown | null;
    total: number;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}
export declare function useLughCredits(): UseLughCreditsResult;
//# sourceMappingURL=hooks.d.ts.map