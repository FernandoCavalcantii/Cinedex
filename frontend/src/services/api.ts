const DEFAULT_BASE_URL = "http://localhost:8000/api/v1";

type QueryValue = string | number | boolean | null | undefined;

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
): Promise<T> {
  const url = new URL(path.replace(/^\//, ""), `${getApiBaseUrl()}/`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new ApiError(response.status, `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
