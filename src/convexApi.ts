// Referências tipadas às functions públicas de créditos expostas pelo
// lugh-app (ver `convex/partnerApi.ts`). Como o SDK não consegue importar
// o módulo `_generated/api` de outro projeto, reconstruímos as
// FunctionReferences à mão com os tipos certos — a string passada pro
// `makeFunctionReference` é o path `<arquivo>:<nome>` dentro da pasta
// `convex/` do servidor.
//
// Só vivem aqui as funções que nascem no front (OAuth-authenticated).
// Confirmação de cobrança (consumeCreditRequest), refund e cancel rodam
// no backend do parceiro via lugh-sdk-ts + partnerServerApi.

import { makeFunctionReference, type FunctionReference } from "convex/server";
import type { LughCreditsBreakdown } from "./hooks";

export type LughEnvironmentArg = "production" | "sandbox";

export type GetBalanceRef = FunctionReference<
  "query",
  "public",
  { environment?: LughEnvironmentArg; appSlug?: string },
  { total: number; reserved: number; available: number }
>;

export type GetBalanceBreakdownRef = FunctionReference<
  "query",
  "public",
  { environment?: LughEnvironmentArg; appSlug?: string },
  LughCreditsBreakdown | null
>;

export type OpenCreditRequestRef = FunctionReference<
  "mutation",
  "public",
  {
    appSlug: string;
    actionSlug: string;
    environment: LughEnvironmentArg;
    idempotencyKey?: string;
  },
  { requestId: string; expiresAt: number; creditsReserved: number }
>;

export const getBalance = makeFunctionReference<"query">(
  "partnerApi:getBalance",
) as GetBalanceRef;

export const getBalanceBreakdown = makeFunctionReference<"query">(
  "partnerApi:getBalanceBreakdown",
) as GetBalanceBreakdownRef;

export const openCreditRequest = makeFunctionReference<"mutation">(
  "partnerApi:openCreditRequest",
) as OpenCreditRequestRef;
