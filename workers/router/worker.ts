import type { ExecutionContext, RouterEnv, UpstreamTarget } from "./types.ts";
import {
  pickTargets,
  isIdempotentMethod,
  recordMetrics,
  getMetricsSummary,
} from "./balancer.ts";
import { logRequest } from "./logger.ts";

function buildUpstreamName(target: UpstreamTarget): string {
  return target === "APP_A" ? "officewala-app-a" : "officewala-app-b";
}

export default {
  async fetch(request: Request, env: RouterEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const start = Date.now();
    const requestId = crypto.randomUUID();
    const clientIp = request.headers.get("cf-connecting-ip") || "unknown";

    // 1. Loop Prevention Guard
    const hopCount = parseInt(request.headers.get("x-officewala-router-hop") || "0", 10);
    if (hopCount > 2) {
      return new Response(
        JSON.stringify({ error: "Routing loop detected", status: 508 }),
        { status: 508, headers: { "content-type": "application/json" } }
      );
    }

    // 2. Direct Health & Status Endpoint
    if (url.pathname === "/healthz" || url.pathname === "/router-health") {
      const probeStart = Date.now();
      const [probeA, probeB] = await Promise.allSettled([
        env.APP_A.fetch(new Request("https://internal/healthz")),
        env.APP_B.fetch(new Request("https://internal/healthz")),
      ]);

      const aOk = probeA.status === "fulfilled" && probeA.value.status === 200;
      const bOk = probeB.status === "fulfilled" && probeB.value.status === 200;
      const overallStatus = aOk && bOk ? "healthy" : aOk || bOk ? "degraded" : "unhealthy";
      const statusCode = aOk || bOk ? 200 : 503;

      return new Response(
        JSON.stringify({
          status: overallStatus,
          router: "officewala-router",
          version: env.ROUTER_VERSION || "1.0.0",
          timestamp: new Date().toISOString(),
          probeLatencyMs: Date.now() - probeStart,
          upstreams: {
            "officewala-app-a": {
              status: aOk ? "healthy" : "failing",
              httpStatus: probeA.status === "fulfilled" ? probeA.value.status : 0,
            },
            "officewala-app-b": {
              status: bOk ? "healthy" : "failing",
              httpStatus: probeB.status === "fulfilled" ? probeB.value.status : 0,
            },
          },
        }),
        {
          status: statusCode,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "x-officewala-routed-by": "officewala-router",
            "cache-control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    // 3. Router Metrics Dashboard / API
    if (url.pathname === "/router-metrics" || url.pathname === "/api/router-metrics") {
      return new Response(
        JSON.stringify(getMetricsSummary(), null, 2),
        {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "x-officewala-routed-by": "officewala-router",
            "cache-control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    // 4. Target Selection (Active-Active 50/50 probabilistic distribution)
    const { primary, secondary } = pickTargets();
    const idempotent = isIdempotentMethod(request.method);

    // Prepare headers with hop tracking
    const forwardHeaders = new Headers(request.headers);
    forwardHeaders.set("x-officewala-router-hop", String(hopCount + 1));
    forwardHeaders.set("x-officewala-request-id", requestId);

    let upstreamResponse: Response | null = null;
    let finalTarget: UpstreamTarget = primary;
    let failoverOccurred = false;
    let failoverReason: string | undefined;
    let hadError = false;

    // Helper to generate request clones for safe idempotent retries
    const createForwardRequest = () => {
      const init: RequestInit & { duplex?: "half" } = {
        method: request.method,
        headers: forwardHeaders,
        redirect: "manual",
      };
      if (!idempotent && request.body) {
        init.body = request.body;
        init.duplex = "half";
      }
      return new Request(request.url, init as RequestInit);
    };

    // 5. Primary Attempt
    try {
      upstreamResponse = await env[primary].fetch(createForwardRequest());
    } catch (err: unknown) {
      hadError = true;
      if (idempotent) {
        // Safe to retry idempotent requests against secondary
        failoverOccurred = true;
        failoverReason = `primary_exception: ${err instanceof Error ? err.message : String(err)}`;
        finalTarget = secondary;

        try {
          upstreamResponse = await env[secondary].fetch(createForwardRequest());
          hadError = upstreamResponse.status >= 500;
        } catch (secErr: unknown) {
          hadError = true;
          const latency = Date.now() - start;
          recordMetrics(finalTarget, latency, true, true);
          logRequest({
            timestamp: new Date().toISOString(),
            requestId,
            method: request.method,
            pathname: url.pathname,
            search: url.search,
            primaryTarget: buildUpstreamName(primary),
            finalTarget: buildUpstreamName(secondary),
            status: 503,
            latencyMs: latency,
            failover: true,
            failoverReason: `all_workers_failed: ${secErr instanceof Error ? secErr.message : String(secErr)}`,
            idempotent,
            clientIp,
          });

          return new Response(
            JSON.stringify({
              error: "All application Workers are temporarily unreachable",
              router: "officewala-router",
              requestId,
            }),
            {
              status: 503,
              headers: {
                "content-type": "application/json; charset=utf-8",
                "x-officewala-routed-by": "officewala-router",
                "x-officewala-failover": "true",
              },
            }
          );
        }
      } else {
        // Non-idempotent operation: DO NOT retry blindly to avoid duplicate mutations/transactions
        const latency = Date.now() - start;
        recordMetrics(primary, latency, false, true);
        logRequest({
          timestamp: new Date().toISOString(),
          requestId,
          method: request.method,
          pathname: url.pathname,
          search: url.search,
          primaryTarget: buildUpstreamName(primary),
          finalTarget: buildUpstreamName(primary),
          status: 502,
          latencyMs: latency,
          failover: false,
          failoverReason: "non_idempotent_no_retry",
          idempotent,
          clientIp,
        });

        return new Response(
          JSON.stringify({
            error: "Application Worker failed on non-idempotent operation. Mutation not re-attempted.",
            router: "officewala-router",
            requestId,
            worker: buildUpstreamName(primary),
          }),
          {
            status: 502,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "x-officewala-routed-by": "officewala-router",
              "x-officewala-upstream": buildUpstreamName(primary),
            },
          }
        );
      }
    }

    // 6. Handle 5xx Upstream Response for Idempotent Requests (Failover attempt)
    if (upstreamResponse && upstreamResponse.status >= 500 && idempotent && !failoverOccurred) {
      hadError = true;
      try {
        const secResponse = await env[secondary].fetch(createForwardRequest());
        if (secResponse.status < 500) {
          // Secondary healed the request
          failoverOccurred = true;
          failoverReason = `primary_5xx_status_${upstreamResponse.status}`;
          finalTarget = secondary;
          upstreamResponse = secResponse;
          hadError = false;
        } else {
          // Secondary also returned 5xx; keep the best error response
          failoverOccurred = true;
          failoverReason = `both_workers_5xx_${upstreamResponse.status}_${secResponse.status}`;
          finalTarget = secondary;
          upstreamResponse = secResponse;
        }
      } catch {
        // If secondary fails, keep primary 5xx response
      }
    }

    // 7. Attach Architecture Transparency & Observability Headers
    const latencyMs = Date.now() - start;
    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.set("x-officewala-routed-by", "officewala-router");
    responseHeaders.set("x-officewala-upstream", buildUpstreamName(finalTarget));
    responseHeaders.set("x-officewala-failover", failoverOccurred ? "true" : "false");
    responseHeaders.set("x-officewala-latency-ms", String(latencyMs));
    responseHeaders.set("x-officewala-request-id", requestId);
    if (failoverReason) {
      responseHeaders.set("x-officewala-failover-reason", failoverReason.slice(0, 80));
    }

    // 8. Record Metrics & Safe Structured Log
    recordMetrics(finalTarget, latencyMs, failoverOccurred, hadError);
    logRequest({
      timestamp: new Date().toISOString(),
      requestId,
      method: request.method,
      pathname: url.pathname,
      search: url.search,
      primaryTarget: buildUpstreamName(primary),
      finalTarget: buildUpstreamName(finalTarget),
      status: upstreamResponse.status,
      latencyMs,
      failover: failoverOccurred,
      failoverReason,
      idempotent,
      clientIp,
    });

    // 9. Preserve Streaming Body Output
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  },
};
