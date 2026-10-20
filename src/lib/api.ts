import { API_BASE_URL } from "@config";
import type { ApiEnvelope } from "./types";

const BASE_URL = API_BASE_URL;

/** Absolute URL for a given API path. */
export function apiUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface ApiFetchOptions extends RequestInit {
  /** Kept so callers shared with the CRMS app read the same; the website never sends credentials. */
  anonymous?: boolean;
}

/** Every call from the website is public/unauthenticated — logged-in sessions live in the CRMS app. */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { anonymous, ...init } = options;
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  const isJson = (res.headers.get("content-type") ?? "").includes("application/json");
  if (!isJson) {
    if (!res.ok) throw new ApiError(res.statusText, res.status);
    return (await res.text()) as unknown as T;
  }

  const envelope: ApiEnvelope<T> = await res.json();
  if (!res.ok || !envelope.success) {
    throw new ApiError(envelope.message ?? "Something went wrong", res.status);
  }
  return envelope.data;
}
