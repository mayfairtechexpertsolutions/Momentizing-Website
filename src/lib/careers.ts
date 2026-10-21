import { apiFetch, type ApiFetchOptions } from "./api";

export const PROFESSIONS = [
  { value: "PSYCHOLOGIST", label: "Psychologist" },
  { value: "THERAPIST", label: "Therapist / Counsellor" },
  { value: "PSYCHIATRIST", label: "Psychiatrist" },
  { value: "COACH", label: "Coach" },
] as const;

export type ProfessionValue = (typeof PROFESSIONS)[number]["value"];

export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export interface CareerFormToken {
  formToken: string;
  minSeconds: number;
}

export interface ResumeUpload {
  uploadUrl: string;
  resumeKey: string;
  expiresAt: string;
}

export interface CareerApplicationPayload {
  fullName: string;
  email: string;
  whatsapp: string;
  professionType: ProfessionValue;
  licenceNumber?: string;
  yearsExperience?: number;
  languages?: string;
  bio?: string;
  portfolioUrl?: string;
  resumeKey?: string;
  resumeFilename?: string;
  consentAccepted: boolean;
  turnstileToken?: string;
  formToken: string;
  /** Honeypot: a person never fills this. */
  website: string;
}

const json = (body: unknown): ApiFetchOptions => ({ method: "POST", body: JSON.stringify(body), anonymous: true });

export const fetchCareerFormToken = () => apiFetch<CareerFormToken>("/public/careers/form-token", { anonymous: true });

export const requestResumeUpload = (file: Pick<File, "name" | "type" | "size">, formToken: string) =>
  apiFetch<ResumeUpload>("/public/careers/resume-upload", {
    ...json({ filename: file.name, mimeType: file.type, sizeBytes: file.size, formToken, website: "" }),
    anonymous: true,
  });

export const submitCareerApplication = (payload: CareerApplicationPayload, idempotencyKey: string) =>
  apiFetch<{ received: boolean }>("/public/careers/applications", {
    ...json(payload),
    headers: { "Idempotency-Key": idempotencyKey },
    anonymous: true,
  });

/** PUT straight to storage with exactly the type and length the server pinned into the signed URL. */
export async function putResume(upload: ResumeUpload, file: File): Promise<void> {
  const res = await fetch(upload.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!res.ok) throw new Error("We couldn't upload your resume. Please try again.");
}

/** Client-side pre-check so people get an instant message; the server enforces the same rules. */
export function resumeProblem(file: Pick<File, "type" | "size">): string | null {
  if (!RESUME_TYPES[file.type]) return "Please upload your resume as a PDF or Word (.docx) file.";
  if (file.size > RESUME_MAX_BYTES) return "Your resume must be 5 MB or smaller.";
  if (file.size === 0) return "That file looks empty. Please choose another.";
  return null;
}
