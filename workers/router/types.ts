export interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export interface RouterEnv {
  APP_A: Fetcher;
  APP_B: Fetcher;
  ROUTER_VERSION?: string;
  ENVIRONMENT?: string;
}

export type UpstreamTarget = "APP_A" | "APP_B";

export interface LogEntry {
  timestamp: string;
  requestId: string;
  method: string;
  pathname: string;
  search: string;
  primaryTarget: string;
  finalTarget: string;
  status: number;
  latencyMs: number;
  failover: boolean;
  failoverReason?: string;
  idempotent: boolean;
  clientIp?: string;
}

export interface RouterMetrics {
  totalRequests: number;
  requestsAppA: number;
  requestsAppB: number;
  failoverAttempts: number;
  workerErrors: number;
  totalLatencyMs: number;
  startedAt: string;
}
