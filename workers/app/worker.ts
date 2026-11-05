import type { AppEnv, ExecutionContext } from "./types.ts";

const STATIC_EXT_REGEX = /\.(js|css|webp|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|txt|xml|json|webmanifest)$/i;

export default {
  async fetch(request: Request, env: AppEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. Health check endpoint for upstream verification
    if (url.pathname === "/healthz" || url.pathname === "/internal/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          worker: `officewala-${env.APP_INSTANCE || "app"}`,
          instance: env.APP_INSTANCE || "unknown",
          timestamp: new Date().toISOString(),
          uptime: "active",
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "x-officewala-app-instance": env.APP_INSTANCE || "unknown",
            "cache-control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    // 2. Fetch static asset from Cloudflare Assets binding
    let response: Response;
    try {
      response = await env.ASSETS.fetch(request);
    } catch (err: unknown) {
      return new Response(
        JSON.stringify({
          error: "Asset retrieval failed",
          instance: env.APP_INSTANCE || "unknown",
          message: err instanceof Error ? err.message : String(err),
        }),
        {
          status: 500,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "x-officewala-app-instance": env.APP_INSTANCE || "unknown",
          },
        }
      );
    }

    // 3. SPA Fallback: If 404 and is a navigational GET request, fallback to index.html
    if (response.status === 404 && request.method === "GET") {
      const isStaticFile = STATIC_EXT_REGEX.test(url.pathname);
      if (!isStaticFile) {
        try {
          const fallbackUrl = new URL("/", request.url);
          const fallbackReq = new Request(fallbackUrl.toString(), request);
          const fallbackResponse = await env.ASSETS.fetch(fallbackReq);
          if (fallbackResponse.status === 200) {
            response = fallbackResponse;
          }
        } catch {
          // Keep original 404 if fallback fails
        }
      }
    }

    // 4. Attach application instance headers
    const headers = new Headers(response.headers);
    headers.set("x-officewala-app-instance", env.APP_INSTANCE || "unknown");
    headers.set("x-officewala-version", "1.0.0");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
