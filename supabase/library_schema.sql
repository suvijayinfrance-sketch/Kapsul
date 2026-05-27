-- Kapsul shared document library (run in Supabase SQL Editor)
-- If tables already exist, run only the GRANT block at the bottom.

create extension if not exists vector;

create table if not exists library_documents (
  id            uuid primary key default gen_random_uuid(),
  filename      text not null,
  display_name  text not null,
  subject       text default '',
  description   text default '',
  file_size     int default 0,
  status        text not null default 'processing',
  master_md     text default '',
  chunk_count   int default 0,
  word_count    int default 0,
  uploaded_by   text default 'admin',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists library_chunks (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references library_documents(id) on delete cascade,
  doc_name      text not null,
  chunk_index   int not null,
  content       text not null,
  word_start    int default 0,
  word_end      int default 0,
  embedding     vector(1024),
  created_at    timestamptz not null default now()
);

create table if not exists student_sessions (
  id              text primary key,
  document_ids    uuid[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists student_messages (
  id            uuid primary key default gen_random_uuid(),
  session_id    text not null references student_sessions(id) on delete cascade,
  role          text not null check (role in ('user', 'assistant')),
  content       text not null,
  created_at    timestamptz not null default now()
);

create index if not exists idx_library_chunks_doc
  on library_chunks(document_id);

-- HNSW works on empty tables; use IVFFlat only after you have many rows
create index if not exists idx_library_chunks_embedding
  on library_chunks using hnsw (embedding vector_cosine_ops);

create index if not exists idx_student_messages_session
  on student_messages(session_id, created_at);

-- Required: API uses SUPABASE_SERVICE_KEY (service_role)
grant usage on schema public to service_role;
grant all on table public.library_documents to service_role;
grant all on table public.library_chunks to service_role;
grant all on table public.student_sessions to service_role;
grant all on table public.student_messages to service_role;

grant all on all sequences in schema public to service_role;
