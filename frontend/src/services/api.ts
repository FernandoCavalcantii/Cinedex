const DEFAULT_BASE_URL = "http://localhost:8000/api/v1";

type QueryValue = string | number | boolean | string[] | null | undefined;

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  return (configured || DEFAULT_BASE_URL).replace(/\/$/, "");
}

export async function apiGet<T>(
  path: string,
  query?: Record<string, QueryValue>,
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(path.replace(/^\//, ""), `${getApiBaseUrl()}/`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== "") {
            url.searchParams.append(key, item);
          }
        }
      } else if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new ApiError(response.status, `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

async function errorFromResponse(response: Response): Promise<ApiError> {
  let message = `Request failed with status ${response.status}`;
  try {
    const payload = (await response.json()) as { detail?: unknown };
    if (typeof payload.detail === "string" && payload.detail.trim()) {
      message = payload.detail;
    }
  } catch {
    // The status line is enough when the body is empty.
  }
  return new ApiError(response.status, message);
}

async function apiWrite<T>(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown): Promise<T> {
  const url = new URL(path.replace(/^\//, ""), `${getApiBaseUrl()}/`);
  const response = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiWrite<T>(path, "POST", body);
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return apiWrite<T>(path, "PUT", body);
}

export function apiDelete(path: string): Promise<void> {
  return apiWrite<void>(path, "DELETE");
}
