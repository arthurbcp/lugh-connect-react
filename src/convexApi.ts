// Referências tipadas às functions públicas de créditos expostas pelo
// lugh-app (ver `convex/credits.ts` no lugh-app). Como o SDK não consegue
// importar o módulo `_generated/api` de outro projeto, reconstruímos as
// FunctionReferences à mão com os tipos certos — a string passada pro
// `makeFunctionReference` é o path `<arquivo>:<nome>` dentro da pasta
// `convex/` do servidor.
//
// Se os args ou o retorno dessas functions mudarem no lugh-app, atualize
// os tipos aqui junto. A assinatura vive nos dois lados.

import { makeFunctionReference, type FunctionReference } from "convex/server";
import type { LughCreditsBreakdown } from "./hooks";

export type LughEnvironmentArg = "production" | "sandbox";

export type GetBalanceRef = FunctionReference<
  "query",
  "public",
  { environment?: LughEnvironmentArg; appSlug?: string },
  number
>;

export type GetBalanceBreakdownRef = FunctionReference<
  "query",
  "public",
  { environment?: LughEnvironmentArg; appSlug?: string },
  LughCreditsBreakdown | null
>;

export type ConsumeCreditsRef = FunctionReference<
  "mutation",
  "public",
  {
    appSecret: string;
    actionSlug: string;
    environment: LughEnvironmentArg;
  },
  { balance: number }
>;

export const getBalance = makeFunctionReference<"query">(
  "partnerApi:getBalance",
) as GetBalanceRef;

export const getBalanceBreakdown = makeFunctionReference<"query">(
  "partnerApi:getBalanceBreakdown",
) as GetBalanceBreakdownRef;

export const consumeCredits = makeFunctionReference<"mutation">(
  "partnerApi:consumeCredits",
) as ConsumeCreditsRef;
