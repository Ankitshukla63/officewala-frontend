export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return "http://localhost:8080";
  }

  const protocol = window.location.protocol === "https:" ? "https" : "http";
  const hostname = window.location.hostname || "localhost";
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(hostname);

  return `${protocol}://${isLocalhost ? "localhost" : hostname}:8080`;
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
