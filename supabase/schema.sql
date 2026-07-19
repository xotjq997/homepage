-- 동로세무회계 홈페이지 상담 신청(inquiries) 테이블
-- Supabase 대시보드 > SQL Editor 에서 실행해 주세요.

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  topic text,
  message text,
  created_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;

-- 홈페이지(anon/publishable key)에서 상담 신청 폼을 통해 새 문의를 등록할 수 있도록 허용합니다.
-- 조회/수정/삭제 권한은 부여하지 않으므로, 접수된 문의는 Supabase 대시보드에서만 확인할 수 있습니다.
create policy "Allow public inserts" on public.inquiries
  for insert
  to anon
  with check (true);
