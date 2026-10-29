import { API_BASE_URL } from "@config";
import { clearFieldErrors, setFieldErrors } from "./field-errors";
import { fieldLabel, t, translateError } from "@/i18n";
import type { ApiEnvelope } from "./types";

const BASE_URL = API_BASE_URL;

/** Absolute URL for a given API path. */
export function apiUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

/** One field's problem as the API reports it: a code to translate, its {placeholder} values and the English fallback. */
export interface FieldIssue {
  code: string;
  params?: Record<string, unknown>;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  /** Translated reason per request field (e.g. `email`) from a 400 "Validation failed" response. */
  fieldErrors: Record<string, string>;
  /** The API's error code (e.g. `AUTH_INVALID_CREDENTIALS`), for logic that must not depend on wording. */
  code?: string;
  params?: Record<string, unknown>;
  /** The raw per-field codes, so callers can react to a specific rule (`VALIDATION_EMAIL`). */
  fieldIssues: Record<string, FieldIssue>;
  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string> = {},
    code?: string,
    params?: Record<string, unknown>,
    fieldIssues: Record<string, FieldIssue> = {}
  ) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.code = code;
    this.params = params;
    this.fieldIssues = fieldIssues;
  }
}

/** `data` of a failed @Valid request: `{ field: { code, params, message } }` (older servers sent plain strings). */
function readFieldIssues(data: unknown): Record<string, FieldIssue> {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const out: Record<string, FieldIssue> = {};
  for (const [field, v] of Object.entries(data as Record<string, unknown>)) {
    if (typeof v === "string" && v) out[field] = { code: "", message: v };
    else if (v && typeof v === "object" && typeof (v as FieldIssue).code === "string") out[field] = v as FieldIssue;
  }
  return out;
}

/**
 * Builds the error for a failed envelope. The server sends codes, not sentences: the message shown is the code
 * translated into the current language (English text from the server only if the code is unknown). A failed form
 * names each field: "Email: must be a well-formed email address".
 */
export function apiErrorFrom(
  envelope: { message?: string | null; data?: unknown; code?: string | null; params?: Record<string, unknown> | null },
  status: number
): ApiError {
  const issues = readFieldIssues(envelope.data);
  const fieldErrors: Record<string, string> = {};
  for (const [field, issue] of Object.entries(issues)) {
    fieldErrors[field] = issue.code ? translateError(issue.code, issue.params, issue.message) : (issue.message ?? "");
  }
  const entries = Object.entries(fieldErrors);
  const message = entries.length
    ? entries.map(([field, reason]) => `${fieldLabel(field)}: ${reason}`).join("; ")
    : envelope.code
      ? translateError(envelope.code, envelope.params, envelope.message ?? undefined)
      : (envelope.message ?? t("error.generic"));
  return new ApiError(message, status, fieldErrors, envelope.code ?? undefined, envelope.params ?? undefined, issues);
}

/** An error for a response that wasn't the API's JSON envelope (a proxy page, a 502…). */
function httpError(status: number): ApiError {
  return new ApiError(t("error.http", { status }), status, {}, "HTTP_ERROR", { status });
}

/** Text for any failure caught from apiFetch: the API's reason in the current language, or a connection / generic hint. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof TypeError) return t("error.network");
  return t("error.generic");
}

/** The reason for one request field, if the last failure was about it (for showing under that input). */
export function fieldError(err: unknown, field: string): string | undefined {
  return err instanceof ApiError ? err.fieldErrors[field] : undefined;
}

/** True when the failure was this API error code. */
export function hasCode(err: unknown, ...codes: string[]): boolean {
  return err instanceof ApiError && !!err.code && codes.includes(err.code);
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
  const isWrite = (init.method ?? "GET").toUpperCase() !== "GET";
  if (isWrite) clearFieldErrors();
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  const isJson = (res.headers.get("content-type") ?? "").includes("application/json");
  if (!isJson) {
    if (!res.ok) throw httpError(res.status);
    return (await res.text()) as unknown as T;
  }

  const envelope: ApiEnvelope<T> = await res.json();
  if (!res.ok || !envelope.success) {
    // A server older than this app answers new endpoints with ENDPOINT_NOT_FOUND and no params; name the request.
    if (envelope.code === "ENDPOINT_NOT_FOUND" && !envelope.params?.path) {
      envelope.params = { method: (init.method ?? "GET").toUpperCase(), path: new URL(res.url || `${BASE_URL}${path}`, "http://x").pathname };
    }
    const error = apiErrorFrom(envelope, res.status);
    if (isWrite && Object.keys(error.fieldErrors).length) setFieldErrors(error.fieldErrors);
    throw error;
  }
  return envelope.data;
}
