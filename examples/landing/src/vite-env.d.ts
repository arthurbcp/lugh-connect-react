/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LUGH_CLIENT_ID?: string;
  readonly VITE_LUGH_AUTH_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
