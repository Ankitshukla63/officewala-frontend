export interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export interface AppEnv {
  ASSETS: Fetcher;
  APP_INSTANCE: string;
  ENVIRONMENT?: string;
  BACKEND_API_URL?: string;
}
