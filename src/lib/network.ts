export function getApiBaseUrl(): string {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }

  if (import.meta.env.PROD) {
    return "https://officewala-backend-ankit-aacuckbuc3fsb0fv.eastasia-01.azurewebsites.net";
  }

  if (typeof window === "undefined") {
    return "http://localhost:8080";
  }

  const protocol = window.location.protocol === "https:" ? "https" : "http";
  const hostname = window.location.hostname || "localhost";
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(hostname);

  return `${protocol}://${isLocalhost ? "localhost" : hostname}:8080`;
}

export function buildSamePageUploadUrl(path?: string, token?: string | null): string {
  if (typeof window === "undefined") {
    return "http://localhost:5173";
  }

  const hostname = window.location.hostname;
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(hostname);

  // If accessed via localhost on PC, use computer's LAN IP so any phone on the same Wi-Fi can open it
  const host =
    isLocalhost && typeof __LAN_IP__ !== "undefined" && __LAN_IP__ !== "localhost"
      ? `${__LAN_IP__}:${window.location.port || "5173"}`
      : window.location.host;

  const protocol = window.location.protocol;
  const targetPath = path || window.location.pathname;
  const url = new URL(targetPath, `${protocol}//${host}`);
  url.searchParams.set("upload", "open");
  if (token) {
    url.searchParams.set("auth_token", token);
  }
  return url.toString();
}

export function buildWirelessUploadUrl(bucket = "videos", category = "chai") {
  if (typeof window === "undefined") {
    return `http://localhost:5173/wireless-upload?bucket=${encodeURIComponent(bucket)}&category=${encodeURIComponent(category)}`;
  }

  const url = new URL("/wireless-upload", window.location.origin);
  url.searchParams.set("bucket", bucket);
  url.searchParams.set("category", category);
  return url.toString();
}
