export type AdminSession = {
  AdminID: number;
  Email: string;
  AdminName: string;
  Role: string;
  IsActive: boolean;
};

export type Space = {
  SpaceID: number;
  SpaceName: string;
  Description: string | null;
  HostName: string | null;
  Status: "draft" | "active" | "ended" | "archived";
  JoinCode: string;
  QrToken: string;
  CreatedBy: number;
  CreatedAt: string;
  UpdatedAt: string;
};

export type Participant = {
  ParticipantID: number;
  SpaceID: number;
  Nickname: string;
  EntryCodeInput: string | null;
  JoinedVia: "qr" | "code";
  Status: "active" | "restricted" | "kicked";
  CreatedAt: string;
  UpdatedAt: string;
};

export type Question = {
  QuestionID: number;
  SpaceID: number;
  ParticipantID: number;
  Title: string | null;
  BodyText: string;
  Status: "pending" | "answered" | "rejected" | "closed";
  IsPrivate: boolean;
  PublishedFaqPostID: number | null;
  AssignedAdminID: number | null;
  CreatedAt: string;
  UpdatedAt: string;
};

export type QuestionMessage = {
  QuestionMessageID: number;
  QuestionID: number;
  SenderType: "participant" | "admin" | "system";
  AdminID: number | null;
  ParticipantID: number | null;
  MessageText: string;
  IsInternalNote: boolean;
  CreatedAt: string;
};

export type FeedPost = {
  FeedPostID: number;
  SpaceID: number;
  AuthorAdminID: number;
  PostType: "notice" | "faq";
  Title: string;
  BodyText: string;
  BodyJson: string | null;
  IsPinned: boolean;
  IsPublished: boolean;
  PublishedAt: string | null;
  CreatedAt: string;
  UpdatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "http://localhost:4000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  let json: ApiResponse<T> | { message?: string };
  try {
    json = await response.json();
  } catch {
    throw new Error("서버 응답 파싱에 실패했습니다.");
  }

  if (!response.ok) {
    throw new Error(json.message || "요청 처리에 실패했습니다.");
  }

  if (!("data" in json)) {
    throw new Error("유효하지 않은 API 응답입니다.");
  }

  return json.data;
}

export const api = {
  registerAdmin(body: {
    email: string;
    password: string;
    adminName: string;
    role?: "owner" | "admin" | "operator" | "viewer";
  }) {
    return request<AdminSession>("/admins/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  loginAdmin(email: string, password: string) {
    return request<AdminSession>("/admins/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  getAdmins() {
    return request<AdminSession[]>("/admins");
  },
  getSpaces(params: { status?: string; createdBy?: number } = {}) {
    const search = new URLSearchParams();
    if (params.status) search.set("status", params.status);
    if (params.createdBy) search.set("createdBy", String(params.createdBy));
    const query = search.toString();
    return request<Space[]>(`/spaces${query ? `?${query}` : ""}`);
  },
  getSpaceByJoinCode(joinCode: string) {
    return request<Space>(`/spaces/join-code/${encodeURIComponent(joinCode)}`);
  },
  createSpace(body: {
    SpaceName: string;
    Description?: string | null;
    HostName?: string | null;
    JoinCode: string;
    QrToken: string;
    CreatedBy: number;
  }) {
    return request<Space>("/spaces", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  updateSpace(spaceId: number, body: Partial<Space>) {
    return request<Space>(`/spaces/${spaceId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  joinParticipant(body: {
    joinCode: string;
    nickname: string;
    joinedVia?: "qr" | "code";
    entryCodeInput?: string;
  }) {
    return request<Participant>("/participants/join", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  getParticipants(params: { spaceId?: number; status?: string } = {}) {
    const search = new URLSearchParams();
    if (params.spaceId) search.set("spaceId", String(params.spaceId));
    if (params.status) search.set("status", params.status);
    const query = search.toString();
    return request<Participant[]>(`/participants${query ? `?${query}` : ""}`);
  },
  updateParticipant(participantId: number, body: Partial<Participant>) {
    return request<Participant>(`/participants/${participantId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  getQuestions(params: { spaceId?: number; participantId?: number; status?: string } = {}) {
    const search = new URLSearchParams();
    if (params.spaceId) search.set("spaceId", String(params.spaceId));
    if (params.participantId) search.set("participantId", String(params.participantId));
    if (params.status) search.set("status", params.status);
    const query = search.toString();
    return request<Question[]>(`/questions${query ? `?${query}` : ""}`);
  },
  getQuestionById(questionId: number) {
    return request<Question>(`/questions/${questionId}`);
  },
  updateQuestion(questionId: number, body: Partial<Question>) {
    return request<Question>(`/questions/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  getQuestionMessages(questionId: number) {
    return request<QuestionMessage[]>(`/question-messages?questionId=${questionId}`);
  },
  createQuestionMessage(body: {
    QuestionID: number;
    SenderType: "participant" | "admin" | "system";
    AdminID?: number | null;
    ParticipantID?: number | null;
    MessageText: string;
    IsInternalNote?: boolean;
  }) {
    return request<QuestionMessage>("/question-messages", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  getFeedPosts(params: {
    spaceId?: number;
    postType?: "notice" | "faq";
    isPublished?: boolean;
  } = {}) {
    const search = new URLSearchParams();
    if (params.spaceId) search.set("spaceId", String(params.spaceId));
    if (params.postType) {
      search.set("postType", params.postType);
    }
    if (params.isPublished !== undefined) {
      search.set("isPublished", String(params.isPublished));
    }
    const query = search.toString();
    return request<FeedPost[]>(`/feed-posts${query ? `?${query}` : ""}`);
  },
  getFeedPostById(feedPostId: number) {
    return request<FeedPost>(`/feed-posts/${feedPostId}`);
  },
  createFeedPost(body: {
    SpaceID: number;
    AuthorAdminID: number;
    PostType: "notice" | "faq";
    Title: string;
    BodyText: string;
    BodyJson?: string | null;
    IsPinned?: boolean;
    IsPublished?: boolean;
    PublishedAt?: string | null;
  }) {
    return request<FeedPost>("/feed-posts", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  updateFeedPost(feedPostId: number, body: Partial<FeedPost>) {
    return request<FeedPost>(`/feed-posts/${feedPostId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  createQuestion(body: {
    SpaceID: number;
    ParticipantID: number;
    Title?: string | null;
    BodyText: string;
    IsPrivate?: boolean;
  }) {
    return request<Question>("/questions", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

