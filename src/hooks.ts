"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { LughContext, type LughContextValue } from "./provider";
import { ERROR_MESSAGES } from "./i18n";
import {
  getBalanceBreakdown,
  listAppActions,
  type LughAppAction,
  type LughEnvironmentArg,
} from "./convexApi";

export function useLugh(): LughContextValue {
  const ctx = useContext(LughContext);
  if (!ctx) {
    throw new Error(ERROR_MESSAGES.providerMissing);
  }
  return ctx;
}

export interface LughCreditBlock {
  id: string;
  plan: string | null;
  amount: number;
  used: number;
  remaining: number;
  startedAt: number;
  expiresAt: number;
}

export interface LughCreditsBreakdown {
  blocks: LughCreditBlock[];
  subscription: number;
  packs: number;
  total: number;
  sandbox: number;
}


export interface UseLughCreditsResult {
  breakdown: LughCreditsBreakdown | null;
  total: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Assinatura da query pública `credits.getBalanceBreakdown` no lugh-app.
// Em produção, `appSlug` é opcional; em sandbox, é obrigatório (a query
// usa ele pra achar o developer dono do app e retornar os créditos de
// teste, que pertencem ao developer, não ao usuário final).
type BreakdownArgs = {
  environment?: LughEnvironmentArg;
  appSlug?: string;
};

export function useLughCredits(): UseLughCreditsResult {
  const { isSignedIn, env, clientId } = useLugh();
  // `useConvexAuth` reflete o estado interno do Convex: `true` só quando o
  // token já foi aceito e a subscription autenticada está aberta. Sem
  // esperar por esse flag, a query dispara no primeiro tick em que
  // `isSignedIn` vira true — antes do Convex ter anexado o Bearer —
  // e `ctx.auth.getUserIdentity()` no servidor retorna null, lançando
  // `Unauthenticated` de volta pro cliente.
  const { isAuthenticated } = useConvexAuth();

  const args: BreakdownArgs | "skip" = useMemo(() => {
    if (!isSignedIn || !isAuthenticated) return "skip";
    if (env === "sandbox") {
      return { environment: "sandbox", appSlug: clientId };
    }
    return {};
  }, [isSignedIn, isAuthenticated, env, clientId]);

  // `useQuery` retorna `undefined` enquanto carrega e o valor (que pode
  // ser `null` se o user não existe no backend) quando chega. Erros de
  // runtime propagam pra ErrorBoundary — partner apps devem envolver em
  // <ErrorBoundary>.
  const data = useQuery(getBalanceBreakdown, args);

  const loading = isSignedIn && (!isAuthenticated || data === undefined);
  const breakdown = data ?? null;
  const total =
    env === "sandbox"
      ? breakdown?.sandbox ?? 0
      : breakdown?.total ?? 0;

  return useMemo(
    () => ({
      breakdown,
      total,
      loading,
      error: null,
      refetch: async () => {
        /* no-op: subscription reativa */
      },
    }),
    [breakdown, total, loading],
  );
}

export interface UseLughActionsResult {
  /** Array de `{ slug, amount, name }` do app atual. `null` até a 1ª carga. */
  actions: LughAppAction[] | null;
  /** `true` apenas se ainda não tem dado (nem cache, nem resposta). */
  loading: boolean;
  /** Retorna a action pelo slug ou `null` se não existe/ainda carregando. */
  byslug: (slug: string) => LughAppAction | null;
}

const ACTIONS_CACHE_PREFIX = "lugh:actions:";

function readCachedActions(appSlug: string): LughAppAction[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIONS_CACHE_PREFIX + appSlug);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const valid = parsed.filter(
      (a): a is LughAppAction =>
        typeof a === "object" &&
        a !== null &&
        typeof (a as { slug?: unknown }).slug === "string" &&
        typeof (a as { amount?: unknown }).amount === "number" &&
        typeof (a as { name?: unknown }).name === "string",
    );
    return valid;
  } catch {
    return null;
  }
}

function writeCachedActions(appSlug: string, actions: LughAppAction[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      ACTIONS_CACHE_PREFIX + appSlug,
      JSON.stringify(actions),
    );
  } catch {
    /* quota/cookies off — ignore */
  }
}

// Catálogo de actions do app (`{ slug, amount, name }[]`). Usa o `clientId`
// do `LughProvider` como appSlug. Seeded por `localStorage` pra evitar
// flash de loading a cada page load — quando o Convex responde, o cache é
// sobrescrito com o valor fresco.
export function useLughActions(): UseLughActionsResult {
  const { clientId } = useLugh();
  const [cached, setCached] = useState<LughAppAction[] | null>(() =>
    readCachedActions(clientId),
  );

  // Se trocar o appSlug (raro mas possível em dev), re-seed do cache.
  useEffect(() => {
    setCached(readCachedActions(clientId));
  }, [clientId]);

  const fresh = useQuery(listAppActions, { appSlug: clientId });

  useEffect(() => {
    if (fresh === undefined) return;
    writeCachedActions(clientId, fresh);
    setCached(fresh);
  }, [clientId, fresh]);

  const actions = fresh ?? cached;
  const loading = actions === null;

  return useMemo(
    () => ({
      actions,
      loading,
      byslug: (slug) => actions?.find((a) => a.slug === slug) ?? null,
    }),
    [actions, loading],
  );
}
