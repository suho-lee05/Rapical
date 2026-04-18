# Rapical 배포 가이드

이 문서는 `backend`(Express API) + `frontend`(Vite) 를 Railway에 배포하는 기준입니다.

## 1) 사전 준비

- Railway 계정 로그인
- Supabase 프로젝트 생성 및 마이그레이션 반영
- 각 서비스별 환경변수 준비

## 2) Backend 배포 (Railway)

`backend` 서비스는 `backend/railway.json`을 사용합니다.

### 필수 환경변수

- `NODE_ENV=production`
- `PORT=4000` (Railway가 런타임에서 덮어쓸 수 있음)
- `SUPABASE_URL=<your-supabase-url>`
- `SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>`
- `SUPABASE_ANON_KEY=<optional-anon-key>`
- `CORS_ORIGINS=https://<frontend-domain>`  
  (여러 개면 쉼표로 구분: `https://a.com,https://b.com`)

### 검증 포인트

- 헬스체크: `GET /api/health` 가 `200` 반환
- API 호출: `GET /api/spaces` 등 주요 엔드포인트 확인

## 3) Frontend 배포 (Railway)

`frontend` 서비스는 `frontend/railway.json` + `npm run start`(`vite preview`)를 사용합니다.

### 필수 환경변수

- `VITE_API_BASE_URL=https://<backend-domain>/api`
- `VITE_SUPABASE_URL=<your-supabase-url>`
- `VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>`

## 4) Railway CLI 배포 순서 (로컬)

Railway CLI가 설치되어 있지 않다면:

```bash
npm i -g @railway/cli
```

로그인:

```bash
railway login
```

백엔드 배포:

```bash
cd backend
railway init
railway up
```

프론트 배포:

```bash
cd ../frontend
railway init
railway up
```

## 5) 최종 점검

- Frontend 도메인에서 로그인/익명 입장/질문 전송 확인
- Admin 로그인 및 답변/공지 발행 확인
- Supabase Realtime 동작 확인
- CORS 에러 없는지 브라우저 콘솔 확인
