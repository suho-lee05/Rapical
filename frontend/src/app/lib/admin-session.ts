import type { AdminSession } from "./api";
import { useSyncExternalStore } from "react";

const ADMIN_SESSION_KEY = "rapical.admin.session";
const ADMIN_SPACE_ID_KEY = "rapical.admin.spaceId";
const ADMIN_SPACE_EVENT = "rapical:admin-space-changed";

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
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_SPACE_EVENT));
  }
}

export function getSelectedSpaceId(): number | null {
  const raw = localStorage.getItem(ADMIN_SPACE_ID_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function setSelectedSpaceId(spaceId: number) {
  localStorage.setItem(ADMIN_SPACE_ID_KEY, String(spaceId));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_SPACE_EVENT));
  }
}

export function clearSelectedSpaceId() {
  localStorage.removeItem(ADMIN_SPACE_ID_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_SPACE_EVENT));
  }
}

function subscribeSelectedSpace(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(ADMIN_SPACE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(ADMIN_SPACE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function getSelectedSpaceSnapshot() {
  return getSelectedSpaceId();
}

export function useSelectedSpaceId() {
  return useSyncExternalStore(
    subscribeSelectedSpace,
    getSelectedSpaceSnapshot,
    () => null,
  );
}

