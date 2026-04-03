import type { Participant, Space } from "./api";

export type ParticipantSession = {
  ParticipantID: number | null;
  SpaceID: number;
  Nickname: string;
  SpaceName: string;
  IsGuest: boolean;
};

const PARTICIPANT_SESSION_KEY = "rapical.participant.session";

export function getParticipantSession(): ParticipantSession | null {
  const raw = localStorage.getItem(PARTICIPANT_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ParticipantSession;
  } catch {
    localStorage.removeItem(PARTICIPANT_SESSION_KEY);
    return null;
  }
}

export function setParticipantSession(session: ParticipantSession) {
  localStorage.setItem(PARTICIPANT_SESSION_KEY, JSON.stringify(session));
}

export function setParticipantFromJoin(participant: Participant, space: Space) {
  setParticipantSession({
    ParticipantID: participant.ParticipantID,
    SpaceID: participant.SpaceID,
    Nickname: participant.Nickname,
    SpaceName: space.SpaceName,
    IsGuest: false,
  });
}

export function setGuestParticipant(space: Space) {
  setParticipantSession({
    ParticipantID: null,
    SpaceID: space.SpaceID,
    Nickname: "Guest",
    SpaceName: space.SpaceName,
    IsGuest: true,
  });
}

export function clearParticipantSession() {
  localStorage.removeItem(PARTICIPANT_SESSION_KEY);
}

