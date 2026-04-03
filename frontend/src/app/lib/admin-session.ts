import type { AdminSession } from "./api";

const ADMIN_SESSION_KEY = "rapical.admin.session";
const ADMIN_SPACE_ID_KEY = "rapical.admin.spaceId";

export function getAdminSession(): AdminSession | null {
  const raw = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
}

export function setAdminSession(session: AdminSession) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_SPACE_ID_KEY);
}

export function getSelectedSpaceId(): number | null {
  const raw = localStorage.getItem(ADMIN_SPACE_ID_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function setSelectedSpaceId(spaceId: number) {
  localStorage.setItem(ADMIN_SPACE_ID_KEY, String(spaceId));
}

export function clearSelectedSpaceId() {
  localStorage.removeItem(ADMIN_SPACE_ID_KEY);
}

