각 모듈은 아래 4계층 구조를 권장합니다.

- `*.routes.js` : 라우팅/미들웨어 바인딩
- `*.controller.js` : 요청/응답 처리
- `*.service.js` : 비즈니스 로직
- `*.repository.js` : Supabase 쿼리

현재는 서버 부팅과 구조 정리에 집중해 라우트 골격만 생성되어 있습니다.
