# 골목 꽁초판 (Alley Butt Board)

Next.js 14(App Router) + Supabase(PostgreSQL) 익명 메시지 보드입니다. 배경 골목 이미지 위에 꽁초(🚬)를 두고, 한 번 읽고 줍으면 DB에서 사라집니다.

## 로컬 실행

1. [Node.js 18+](https://nodejs.org/) 설치
2. 의존성 설치 및 개발 서버

```bash
npm install
cp .env.local.example .env.local
# .env.local에 Supabase URL / anon key 입력
npm run dev
```

3. Supabase SQL Editor에서 `supabase/schema.sql` 실행  
   - `alter publication supabase_realtime add table butts` 가 이미 등록된 경우 에러가 날 수 있습니다. 대시보드 **Database → Replication** 에서 `butts` Realtime 을 켜 주세요.

## 배경 이미지

`public/alley.jpg` 를 원하는 골목 사진으로 교체하면 됩니다. (현재는 플레이스홀더 이미지)

## Vercel 배포

1. GitHub 등에 저장소를 푸시합니다.
2. [Vercel](https://vercel.com) 에서 해당 저장소를 **Import** 합니다.
3. **Environment Variables** 에 다음을 추가합니다.

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase `anon` `public` 키 |

4. 배포 후 Production URL 로 접속해 동작을 확인합니다.

> API Route와 브라우저 Realtime 모두 anon 키를 사용합니다. `schema.sql` 의 RLS 정책이 익명 공개 보드용이므로, 운영 정책에 맞게 정책을 조정하세요.

## API 요약

- `GET /api/butts` — 위치만 목록 반환 (메시지 없음)
- `POST /api/butts` — 꽁초 생성
- `GET /api/butts/[id]` — 메시지만 반환
- `DELETE /api/butts/[id]` — 삭제

## 기술 스택

- Next.js 14, TypeScript, Tailwind CSS
- Supabase(PostgreSQL + Realtime)
