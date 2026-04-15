import { useState, type JSX, type ReactNode } from "react";
import {
  LughProvider,
  LughSignInButton,
  LughCreditsBadge,
  LughConsumeCreditsButton,
  useLugh,
  type ConsumeCreditsResult,
} from "lugh-connect-react";

const CLIENT_ID = import.meta.env.VITE_LUGH_CLIENT_ID ?? "demo-app";
const AUTH_BASE = import.meta.env.VITE_LUGH_AUTH_BASE ?? "http://localhost:8080";
const PUBLIC_TOKEN = import.meta.env.VITE_LUGH_PUBLIC_TOKEN ?? "lugh_pk_PCWC8O279cCno5UqidyPVbu0riO35iEKnOZG0tf7";

export function App(): JSX.Element {
  return (
    <LughProvider
      clientId={CLIENT_ID}
      redirectUri={window.location.origin + "/"}
      authBase={AUTH_BASE}
      publicToken={PUBLIC_TOKEN}
      theme="light"
      primaryColor="red"
    >
      <Page />
    </LughProvider>
  );
}

function Page(): JSX.Element {
  const { isSignedIn, user, signOut, loading, error } = useLugh();
  const [lastConsume, setLastConsume] = useState<string | null>(null);
  const [consumeError, setConsumeError] = useState<string | null>(null);

  const onSuccess = (r: ConsumeCreditsResult): void => {
    setConsumeError(null);
    setLastConsume(`${r.action} • ${r.amount} créditos`);
  };

  const onError = (err: Error): void => {
    setLastConsume(null);
    setConsumeError(err.message);
  };

  return (
    <div className="page">
      <header className="page__header">
        <div className="brand">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M8 8v8h8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Lugh Connect</span>
        </div>

        <nav className="page__nav">
          {isSignedIn && <LughCreditsBadge />}
          {isSignedIn ? (
            <button
              type="button"
              className="ghost-btn"
              onClick={() => {
                void signOut();
              }}
            >
              Sair
            </button>
          ) : (
            <LughSignInButton />
          )}
        </nav>
      </header>

      <main className="page__main">
        <section className="hero">
          <h1>
            Plug &amp; play <span className="grad">Login com Lugh</span> em React
          </h1>
          <p className="hero__sub">
            Provider, botão de SSO, badge de créditos e consumo de saldo —
            todos num único pacote, com o design system da Lugh App.
          </p>

          {loading && <p className="muted">Carregando sessão…</p>}
          {error && <p className="error">Erro: {error.message}</p>}

          {!isSignedIn && !loading && (
            <div className="hero__cta">
              <LughSignInButton />
              <span className="muted">
                Você será redirecionado para o lugh-api / Clerk.
              </span>
            </div>
          )}

          {isSignedIn && (
            <div className="hero__signed">
              <p>
                Logado como{" "}
                <code>{user?.sub ?? "?"}</code>
              </p>
            </div>
          )}
        </section>

        {isSignedIn && (
          <section className="grid">
            <Card title="Consumir 5 créditos" subtitle="action: generate_image">
              <LughConsumeCreditsButton
                action="generate_image"
                amount={5}
                onSuccess={onSuccess}
                onError={onError}
              >
                Gerar imagem (5)
              </LughConsumeCreditsButton>
            </Card>

            <Card title="Consumir 1 crédito" subtitle="action: chat_message">
              <LughConsumeCreditsButton
                action="chat_message"
                amount={1}
                onSuccess={onSuccess}
                onError={onError}
              >
                Enviar mensagem (1)
              </LughConsumeCreditsButton>
            </Card>

            <Card title="Consumir 25 créditos" subtitle="action: video_render">
              <LughConsumeCreditsButton
                action="video_render"
                amount={25}
                onSuccess={onSuccess}
                onError={onError}
              >
                Renderizar vídeo (25)
              </LughConsumeCreditsButton>
            </Card>
          </section>
        )}

        {(lastConsume || consumeError) && (
          <section className="toast">
            {lastConsume && (
              <div className="toast__ok">
                <strong>Consumido:</strong> {lastConsume}
              </div>
            )}
            {consumeError && (
              <div className="toast__err">
                <strong>Erro:</strong> {consumeError}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="page__footer">
        lugh-connect-react · OAuth2 + PKCE · {new Date().getFullYear()}
      </footer>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="card">
      <div className="card__head">
        <h3>{title}</h3>
        <code>{subtitle}</code>
      </div>
      <div className="card__body">{children}</div>
    </div>
  );
}
