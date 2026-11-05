import type { RouterMetrics, UpstreamTarget } from "./types.ts";

export const metrics: RouterMetrics = {
  totalRequests: 0,
  requestsAppA: 0,
  requestsAppB: 0,
  failoverAttempts: 0,
  workerErrors: 0,
  totalLatencyMs: 0,
  startedAt: new Date().toISOString(),
};

export function pickTargets(): { primary: UpstreamTarget; secondary: UpstreamTarget } {
  // Balanced 50/50 probabilistic distribution with zero shared state
  const isAppA = Math.random() < 0.5;
  return {
    primary: isAppA ? "APP_A" : "APP_B",
    secondary: isAppA ? "APP_B" : "APP_A",
  };
}

export function isIdempotentMethod(method: string): boolean {
  const m = method.toUpperCase();
  return m === "GET" || m === "HEAD" || m === "OPTIONS";
}

export function recordMetrics(target: UpstreamTarget, latencyMs: number, isFailover: boolean, isError: boolean): void {
  metrics.totalRequests += 1;
  if (target === "APP_A") {
    metrics.requestsAppA += 1;
  } else {
    metrics.requestsAppB += 1;
  }
  if (isFailover) {
    metrics.failoverAttempts += 1;
  }
  if (isError) {
    metrics.workerErrors += 1;
  }
  metrics.totalLatencyMs += latencyMs;
}

export function getMetricsSummary() {
  const avgLatency = metrics.totalRequests > 0
    ? (metrics.totalLatencyMs / metrics.totalRequests).toFixed(2)
    : "0.00";

  const percentA = metrics.totalRequests > 0
    ? ((metrics.requestsAppA / metrics.totalRequests) * 100).toFixed(1)
    : "0.0";

  const percentB = metrics.totalRequests > 0
    ? ((metrics.requestsAppB / metrics.totalRequests) * 100).toFixed(1)
    : "0.0";

  const errorRate = metrics.totalRequests > 0
    ? ((metrics.workerErrors / metrics.totalRequests) * 100).toFixed(2)
    : "0.00";

  return {
    ...metrics,
    distribution: {
      app_a_percentage: `${percentA}%`,
      app_b_percentage: `${percentB}%`,
    },
    errorRate: `${errorRate}%`,
    averageLatencyMs: `${avgLatency}ms`,
  };
}
