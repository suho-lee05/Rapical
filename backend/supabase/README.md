# Supabase Setup (MVP)

현재 백엔드는 아래 6개 테이블을 사용합니다.

- `Admins`
- `Spaces`
- `Participants`
- `Questions`
- `QuestionMessages`
- `FeedPosts`

## 1) Supabase 프로젝트 생성

1. Supabase 새 프로젝트 생성
2. 프로젝트의 `Project URL` 확인
3. `Settings > API`에서 아래 키 확인
   - `anon` key
   - `service_role` key

## 2) 스키마 적용

Supabase SQL Editor에서 아래 파일 내용을 실행하세요.

- `supabase/migrations/0001_mvp_schema.sql`

## 3) 백엔드 환경변수 설정

`backend/.env` 생성 후 값 입력:

```env
NODE_ENV=development
PORT=4000
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## 4) 실행 확인

```bash
npm run dev
```

아래 엔드포인트로 확인:

- `GET /api/health`
- `GET /api/spaces` (초기에는 빈 배열)

## 참고

- 현재 `POST /api/admins/login`은 MVP 임시 방식(평문 비교)입니다.
- 실서비스 전에는 비밀번호 해시(`bcrypt`) + JWT 인증으로 교체가 필요합니다.
