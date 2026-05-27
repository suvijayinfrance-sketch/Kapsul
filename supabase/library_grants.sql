-- Run this if tables exist but uploads fail with "permission denied" / "DB create failed"
-- (Supabase SQL Editor → New query → Run)

grant usage on schema public to service_role;

grant all on table public.library_documents to service_role;
grant all on table public.library_chunks to service_role;
grant all on table public.student_sessions to service_role;
grant all on table public.student_messages to service_role;

grant all on all sequences in schema public to service_role;
