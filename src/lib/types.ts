// Mirrors com.mayfairtechexpertsolutions.crms.common.response.ApiResponse on the backend.
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string | null;
  timestamp: string;
  /** Stable error code (an ErrorCode name) on failure: translate this, not `message`. */
  code?: string | null;
  params?: Record<string, unknown> | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export type UserRole = "CLIENT" | "SPECIALIST" | "ASSISTANT";
export type AdminRole = "SUPER_ADMIN" | "CONTENT_EDITOR" | "VIEWER";

export interface UserSummary {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
}

export interface AdminSummary {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  user: UserSummary;
}

export interface AdminAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  admin: AdminSummary;
}

export interface AdminSetupStatusResponse {
  needsSetup: boolean;
}
