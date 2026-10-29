/**
 * The reasons the backend gave for the most recent failed save ("Validation failed" -> `{ email: "must be a
 * well-formed email address" }`), so every text field can show its own problem under the input without each page
 * wiring it up. `apiFetch` sets this when a write fails and clears it when the next write starts.
 */
interface Snapshot {
  version: number;
  errors: Record<string, string>;
}

let snapshot: Snapshot = { version: 0, errors: {} };
const listeners = new Set<() => void>();

/** "dateOfBirth", "Date of birth", "Working hours (optional)" all become comparable letters-only keys. */
export function normalizeFieldKey(s: string): string {
  return s
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function publish(errors: Record<string, string>) {
  const byKey: Record<string, string> = {};
  for (const [path, reason] of Object.entries(errors)) byKey[normalizeFieldKey(path.split(".").pop() ?? path)] = reason.charAt(0).toUpperCase() + reason.slice(1);
  snapshot = { version: snapshot.version + 1, errors: byKey };
  listeners.forEach((l) => l());
}

export function setFieldErrors(errors: Record<string, string>) {
  publish(errors);
}

export function clearFieldErrors() {
  if (Object.keys(snapshot.errors).length) publish({});
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
const getSnapshot = () => snapshot;
export const getFieldErrorSnapshot = getSnapshot;
export const subscribeFieldErrors = subscribe;
