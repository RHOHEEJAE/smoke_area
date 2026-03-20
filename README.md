# 골목 꽁초판 (Alley Butt Board)

Next.js 14(App Router) + PostgreSQL(Supabase) 익명 메시지 보드입니다. API는 **`DATABASE_URL`** 로 DB에 직접 접속하고, 브라우저 Realtime만 Supabase JS + 공개 키를 씁니다.

## 로컬 실행

1. [Node.js 18+](https://nodejs.org/) 설치
2. 의존성 설치 및 개발 서버

```bash
npm install
cp .env.local.example .env.local
# .env.local 에 DATABASE_URL 필수 (연결 문자열 전체)
npm run dev
```

3. Supabase SQL Editor에서 `supabase/schema.sql` 실행  
   - `alter publication supabase_realtime add table butts` 가 이미 등록된 경우 에러가 날 수 있습니다. 대시보드 **Database → Replication** 에서 `butts` Realtime 을 켜 주세요.  
   - **다른 기기에서 꽁초 삭제가 바로 반영되지 않으면** `alter table butts replica identity full;` 를 한 번 실행했는지 확인하세요. (예전에 만든 테이블에는 이 줄이 없을 수 있습니다.)

## 배경 이미지

`public/alley.jpg` 를 원하는 골목 사진으로 교체하면 됩니다.

## Vercel 배포

1. 저장소를 Import 한 뒤 **Environment Variables** 에 추가합니다.

| Name | 설명 |
|------|------|
| **`DATABASE_URL`** | Supabase **Connection pooling** URI (예: `postgresql://...@...pooler.supabase.com:6543/postgres`). **Server** 전용 — `NEXT_PUBLIC_` 접두사 금지. |
| `NEXT_PUBLIC_SUPABASE_URL` | (선택) Realtime용 **Project URL** (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (선택) **Publishable key** (`sb_publishable_...`) 또는 [Legacy](https://supabase.com/docs/guides/api/api-keys) **anon** 키. `createClient` 두 번째 인자는 둘 다 동일하게 넣으면 됩니다. |

2. `DATABASE_URL` 만으로 목록/읽기/쓰기/삭제는 동작합니다. Realtime 변수를 빼면 다른 탭에서 꽁초가 실시간으로는 안 보이고, 새로고침하면 보입니다.

3. **보안**: DB 비밀번호가 유출된 적이 있다면 Supabase에서 비밀번호를 바꾼 뒤, Vercel의 `DATABASE_URL` 도 함께 갱신하세요.

## API 요약

- `GET /api/butts` — 위치만 목록 반환 (메시지 없음)
- `POST /api/butts` — 꽁초 생성
- `GET /api/butts/[id]` — 메시지만 반환
- `DELETE /api/butts/[id]` — 삭제

## 기술 스택

- Next.js 14, TypeScript, Tailwind CSS
- `postgres`(서버) + Supabase Pooler, (선택) `@supabase/supabase-js` Realtime
