/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  // add other variables here as you create them...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}