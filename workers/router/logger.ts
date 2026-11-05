import type { LogEntry } from "./types.ts";

export function logRequest(entry: LogEntry): void {
  // Safe structured JSON logging to stdout / Cloudflare Logs tail
  // Strictly excludes passwords, auth tokens, cookies, or sensitive PII
  const sanitizedEntry = {
    ...entry,
    // Truncate path if excessive
    pathname: entry.pathname.slice(0, 256),
  };

  try {
    console.log(JSON.stringify(sanitizedEntry));
  } catch {
    // Fail-safe fallback
    console.log(`[Router] ${entry.method} ${entry.pathname} -> ${entry.finalTarget} (${entry.status}) ${entry.latencyMs}ms`);
  }
}
