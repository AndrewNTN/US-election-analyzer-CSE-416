const DEFAULT_API_BASE_URL = "http://localhost:8080/api";

const sanitizeBaseUrl = (url: string): string => url.replace(/\/+$/, "");

const API_BASE_URL = sanitizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
);

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const ensureAbsoluteUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export async function fetchJson<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const url = ensureAbsoluteUrl(path);
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  let data: unknown;

  const contentType = response.headers.get("content-type")?.toLowerCase();

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new ApiError(
      `Request to ${url} failed with status ${response.status}`,
      response.status,
      data,
    );
  }

  return data as TResponse;
}

export const apiConfig = {
  baseUrl: API_BASE_URL,
};
