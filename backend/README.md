# Rapical Backend

Node.js + Express 기반 API 서버 초기 구조입니다.  
DB는 Supabase(PostgreSQL), 배포는 Railway를 기준으로 구성했습니다.

## 1차 MVP 실사용 테이블

초기 버전에서는 아래 6개 테이블만 우선 실사용합니다.

- `Admins`
- `Spaces`
- `Participants`
- `Questions`
- `QuestionMessages`
- `FeedPosts`

## 실행

1. `.env.example` 파일을 참고해 `.env` 생성
2. 패키지 설치
   - `npm install`
3. 개발 서버 실행
   - `npm run dev`

## 기본 구조

```text
backend
├─ src
│  ├─ app.js
│  ├─ server.js
│  ├─ config
│  │  ├─ env.js
│  │  └─ supabase.js
│  ├─ common
│  │  ├─ middlewares
│  │  │  ├─ error-handler.js
│  │  │  └─ not-found.js
│  │  └─ utils
│  │     └─ async-handler.js
│  ├─ routes
│  │  └─ index.js
│  └─ modules
│     ├─ admins
│     ├─ spaces
│     ├─ space-admin-members
│     ├─ space-settings
│     ├─ participants
│     ├─ participant-sessions
│     ├─ feed-posts
│     ├─ feed-reactions
│     ├─ questions
│     ├─ question-messages
│     ├─ answer-templates
│     ├─ participant-restrictions
│     └─ audit-logs
├─ .env.example
├─ .gitignore
└─ package.json
```

## DBML 테이블 -> 모듈 매핑

- `Admins` -> `modules/admins`
- `Spaces` -> `modules/spaces`
- `SpaceAdminMembers` -> `modules/space-admin-members`
- `SpaceSettings` -> `modules/space-settings`
- `Participants` -> `modules/participants`
- `ParticipantSessions` -> `modules/participant-sessions`
- `FeedPosts` -> `modules/feed-posts`
- `FeedReactions` -> `modules/feed-reactions`
- `Questions` -> `modules/questions`
- `QuestionMessages` -> `modules/question-messages`
- `AnswerTemplates` -> `modules/answer-templates`
- `ParticipantRestrictions` -> `modules/participant-restrictions`
- `AuditLogs` -> `modules/audit-logs`

## 현재 활성 API 라우트 (MVP)

- `/api/admins`
- `/api/spaces`
- `/api/participants`
- `/api/questions`
- `/api/question-messages`
- `/api/feed-posts`

## MVP 엔드포인트 (프론트 디자인 연동용)

- `GET /api/admins`
- `GET /api/admins/:adminId`
- `POST /api/admins/login`
- `GET /api/spaces`
- `GET /api/spaces/:spaceId`
- `GET /api/spaces/join-code/:joinCode`
- `POST /api/spaces`
- `PATCH /api/spaces/:spaceId`
- `GET /api/participants`
- `GET /api/participants/:participantId`
- `POST /api/participants/join`
- `PATCH /api/participants/:participantId`
- `GET /api/questions`
- `GET /api/questions/:questionId`
- `POST /api/questions`
- `PATCH /api/questions/:questionId`
- `GET /api/question-messages?questionId=...`
- `POST /api/question-messages`
- `GET /api/feed-posts`
- `GET /api/feed-posts/:feedPostId`
- `POST /api/feed-posts`
- `PATCH /api/feed-posts/:feedPostId`

## Railway 배포 메모

- Railway Start Command: `npm start`
- 환경변수:
  - `NODE_ENV`
  - `PORT`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (서버 API에서 주로 사용)

## 지금 네가 할 일 (우선순위)

1. Supabase 프로젝트 생성
2. `supabase/migrations/0001_mvp_schema.sql` 실행
3. `backend/.env`에 Supabase URL/키 입력
4. `npm run dev`로 서버 실행
