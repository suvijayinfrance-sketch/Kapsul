"""
Kapsul Database Layer — Supabase Persistence
=============================================
All database operations in one place.
server.py imports from here — no Supabase client code in server.py.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv(".env.local")
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")  # service key, not anon key

_client: Optional[Client] = None


def get_db() -> Optional[Client]:
    global _client
    if not _client and SUPABASE_URL and SUPABASE_KEY:
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


# ─────────────────────────────────────────────────────────────────────────────
# SESSION OPERATIONS
# ─────────────────────────────────────────────────────────────────────────────

def db_create_session(session_id: str, files: list[str]) -> bool:
    """Create a new session row in Supabase."""
    db = get_db()
    if not db:
        return False
    try:
        db.table("sessions").insert({
            "id":    session_id,
            "files": files,
        }).execute()
        return True
    except Exception as e:
        print(f"[db] create_session failed: {e}")
        return False


def db_update_session_master_md(session_id: str, master_md: str,
                                 char_count: int, files: list[str]) -> bool:
    """Update master_md and file list after upload/add-files."""
    db = get_db()
    if not db:
        return False
    try:
        db.table("sessions").update({
            "master_md":  master_md,
            "char_count": char_count,
            "files":      files,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", session_id).execute()
        return True
    except Exception as e:
        print(f"[db] update_session_master_md failed: {e}")
        return False


def db_get_session(session_id: str) -> Optional[dict]:
    """
    Load a full session from Supabase including chunks and messages.
    Returns a dict in the same format as the in-memory sessions dict,
    or None if not found.
    """
    db = get_db()
    if not db:
        return None
    try:
        # Get session row
        res = db.table("sessions").select("*").eq("id", session_id).single().execute()
        if not res.data:
            return None
        row = res.data

        # Get chunks (with embeddings)
        chunks_res = db.table("chunks").select("*").eq("session_id", session_id).execute()
        chunks = []
        for c in (chunks_res.data or []):
            # Convert embedding from list/string back to list[float]
            emb = c.get("embedding")
            if isinstance(emb, str):
                import json
                emb = json.loads(emb)
            chunks.append({
                "chunk_id":    f"{session_id}__{c['doc_name']}__{c['chunk_index']}",
                "session_id":  session_id,
                "doc_name":    c["doc_name"],
                "chunk_index": c["chunk_index"],
                "content":     c["content"],
                "word_start":  c.get("word_start", 0),
                "word_end":    c.get("word_end", 0),
                "embedding":   emb,
            })

        # Get messages
        msgs_res = db.table("messages").select("role,content").eq("session_id", session_id)\
                     .order("created_at").execute()
        messages = msgs_res.data or []

        return {
            "master_md":     row.get("master_md", ""),
            "files":         row.get("files", []),
            "char_count":    row.get("char_count", 0),
            "blocked_count": row.get("blocked_count", 0),
            "chunks":        chunks,
            "messages":      messages,
        }
    except Exception as e:
        print(f"[db] get_session failed: {e}")
        return None


def db_increment_blocked(session_id: str) -> None:
    """Increment the blocked message counter."""
    db = get_db()
    if not db:
        return
    try:
        db.rpc("increment_blocked", {"sid": session_id}).execute()
    except Exception:
        pass  # non-critical


# ─────────────────────────────────────────────────────────────────────────────
# CHUNK OPERATIONS
# ─────────────────────────────────────────────────────────────────────────────

def db_save_chunks(chunks: list[dict]) -> bool:
    """
    Upsert embedded chunks to Supabase.
    Skips chunks with no embedding.
    Batches in groups of 50 to avoid payload limits.
    """
    db = get_db()
    if not db or not chunks:
        return False

    rows = []
    for c in chunks:
        if c.get("embedding") is None:
            continue
        rows.append({
            "session_id":  c["session_id"],
            "doc_name":    c["doc_name"],
            "chunk_index": c["chunk_index"],
            "content":     c["content"],
            "word_start":  c.get("word_start", 0),
            "word_end":    c.get("word_end", 0),
            "embedding":   c["embedding"],
        })

    if not rows:
        return False

    # Batch insert
    batch_size = 50
    try:
        for i in range(0, len(rows), batch_size):
            batch = rows[i:i + batch_size]
            db.table("chunks").insert(batch).execute()
        print(f"[db] Saved {len(rows)} chunks to Supabase")
        return True
    except Exception as e:
        print(f"[db] save_chunks failed: {e}")
        return False


def db_delete_chunks_for_session(session_id: str) -> None:
    """Delete all chunks for a session (used before re-embedding on add-files)."""
    db = get_db()
    if not db:
        return
    try:
        db.table("chunks").delete().eq("session_id", session_id).execute()
    except Exception as e:
        print(f"[db] delete_chunks failed: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# MESSAGE OPERATIONS
# ─────────────────────────────────────────────────────────────────────────────

def db_save_message(session_id: str, role: str, content: str) -> bool:
    """Append a single message to the messages table."""
    db = get_db()
    if not db:
        return False
    try:
        db.table("messages").insert({
            "session_id": session_id,
            "role":       role,
            "content":    content,
        }).execute()
        return True
    except Exception as e:
        print(f"[db] save_message failed: {e}")
        return False


def db_get_messages(session_id: str) -> list[dict]:
    """Get all messages for a session ordered by time."""
    db = get_db()
    if not db:
        return []
    try:
        res = db.table("messages").select("role,content").eq("session_id", session_id)\
                .order("created_at").execute()
        return res.data or []
    except Exception as e:
        print(f"[db] get_messages failed: {e}")
        return []


# ─────────────────────────────────────────────────────────────────────────────
# DOCUMENT OPERATIONS
# ─────────────────────────────────────────────────────────────────────────────

def db_save_document(session_id: str, filename: str, file_size: int) -> bool:
    """Record an uploaded document."""
    db = get_db()
    if not db:
        return False
    try:
        db.table("documents").insert({
            "session_id": session_id,
            "filename":   filename,
            "file_size":  file_size,
        }).execute()
        return True
    except Exception as e:
        print(f"[db] save_document failed: {e}")
        return False
