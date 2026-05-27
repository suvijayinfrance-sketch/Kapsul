"""
Kapsul Library Database Layer
==============================
Handles admin document library and student session operations.
Completely separate from the existing db.py (personal sessions).
"""

from __future__ import annotations
import os
from datetime import datetime, timezone
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(".env.local")
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

_client: Optional[Client] = None

def get_db() -> Optional[Client]:
    global _client
    if not _client and SUPABASE_URL and SUPABASE_KEY:
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


# ── Library Document Operations ───────────────────────────────────────────────

def lib_create_document(filename: str, display_name: str,
                        subject: str = "", description: str = "",
                        file_size: int = 0) -> tuple[Optional[str], Optional[str]]:
    """
    Create a new library document record with status 'processing'.
    Returns (document_uuid, error_message). On success error_message is None.
    """
    db = get_db()
    if not db:
        return None, "Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY)"
    try:
        res = db.table("library_documents").insert({
            "filename":     filename,
            "display_name": display_name or filename,
            "subject":      subject,
            "description":  description,
            "file_size":    file_size,
            "status":       "processing",
        }).execute()
        if res.data:
            return res.data[0]["id"], None
        return None, "Insert returned no row"
    except Exception as e:
        print(f"[lib_db] create_document failed: {e}")
        return None, str(e)


def lib_update_document_ready(doc_id: str, master_md: str,
                               chunk_count: int, word_count: int) -> bool:
    """Mark a document as fully indexed and ready."""
    db = get_db()
    if not db:
        return False
    try:
        db.table("library_documents").update({
            "status":      "indexed",
            "master_md":   master_md,
            "chunk_count": chunk_count,
            "word_count":  word_count,
            "updated_at":  datetime.now(timezone.utc).isoformat(),
        }).eq("id", doc_id).execute()
        return True
    except Exception as e:
        print(f"[lib_db] update_document_ready failed: {e}")
        return False


def lib_update_document_error(doc_id: str, error_msg: str = "") -> bool:
    """Mark a document as failed."""
    db = get_db()
    if not db:
        return False
    try:
        db.table("library_documents").update({
            "status":     "error",
            "description": error_msg[:200],
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", doc_id).execute()
        return True
    except Exception as e:
        print(f"[lib_db] update_document_error failed: {e}")
        return False


def lib_get_all_documents() -> list[dict]:
    """Get all library documents for the admin view (ordered newest first)."""
    db = get_db()
    if not db:
        return []
    try:
        res = db.table("library_documents")\
                .select("id,filename,display_name,subject,description,status,chunk_count,word_count,file_size,created_at")\
                .order("created_at", desc=True)\
                .execute()
        return res.data or []
    except Exception as e:
        print(f"[lib_db] get_all_documents failed: {e}")
        return []


def lib_get_indexed_documents() -> list[dict]:
    """Get only indexed (ready) documents for the student library view."""
    db = get_db()
    if not db:
        return []
    try:
        res = db.table("library_documents")\
                .select("id,filename,display_name,subject,description,chunk_count,word_count,created_at")\
                .eq("status", "indexed")\
                .order("created_at", desc=True)\
                .execute()
        return res.data or []
    except Exception as e:
        print(f"[lib_db] get_indexed_documents failed: {e}")
        return []


def lib_delete_document(doc_id: str) -> bool:
    """Delete a library document and all its chunks (cascade)."""
    db = get_db()
    if not db:
        return False
    try:
        db.table("library_documents").delete().eq("id", doc_id).execute()
        return True
    except Exception as e:
        print(f"[lib_db] delete_document failed: {e}")
        return False


# ── Library Chunk Operations ──────────────────────────────────────────────────

def lib_save_chunks(document_id: str, chunks: list[dict]) -> bool:
    """Save embedded chunks for a library document. Batched in groups of 50."""
    db = get_db()
    if not db or not chunks:
        return False

    rows = []
    for c in chunks:
        if c.get("embedding") is None:
            continue
        rows.append({
            "document_id": document_id,
            "doc_name":    c["doc_name"],
            "chunk_index": c["chunk_index"],
            "content":     c["content"],
            "word_start":  c.get("word_start", 0),
            "word_end":    c.get("word_end", 0),
            "embedding":   c["embedding"],
        })

    if not rows:
        return False

    try:
        batch_size = 50
        for i in range(0, len(rows), batch_size):
            db.table("library_chunks").insert(rows[i:i+batch_size]).execute()
        print(f"[lib_db] Saved {len(rows)} chunks for document {document_id}")
        return True
    except Exception as e:
        print(f"[lib_db] save_chunks failed: {e}")
        return False


def lib_get_chunks_for_documents(document_ids: list[str]) -> list[dict]:
    """
    Load all chunks for a list of document IDs.
    Used by the student chat RAG retrieval.
    Returns chunks in the same format as the personal session chunks.
    """
    db = get_db()
    if not db or not document_ids:
        return []
    try:
        res = db.table("library_chunks")\
                .select("*")\
                .in_("document_id", document_ids)\
                .execute()
        chunks = []
        for c in (res.data or []):
            emb = c.get("embedding")
            if isinstance(emb, str):
                import json
                emb = json.loads(emb)
            chunks.append({
                "chunk_id":    f"{c['document_id']}__{c['chunk_index']}",
                "session_id":  c["document_id"],
                "doc_name":    c["doc_name"],
                "chunk_index": c["chunk_index"],
                "content":     c["content"],
                "word_start":  c.get("word_start", 0),
                "word_end":    c.get("word_end", 0),
                "embedding":   emb,
            })
        return chunks
    except Exception as e:
        print(f"[lib_db] get_chunks_for_documents failed: {e}")
        return []


def lib_get_master_mds_for_documents(document_ids: list[str]) -> str:
    """
    Get and combine master_md for multiple documents.
    Used to build a combined reference for the student chat.
    """
    db = get_db()
    if not db or not document_ids:
        return ""
    try:
        res = db.table("library_documents")\
                .select("display_name,master_md")\
                .in_("id", document_ids)\
                .execute()
        parts = []
        for doc in (res.data or []):
            if doc.get("master_md"):
                parts.append(f"## {doc['display_name']}\n{doc['master_md']}")
        return "\n\n---\n\n".join(parts)
    except Exception as e:
        print(f"[lib_db] get_master_mds failed: {e}")
        return ""


# ── Student Session Operations ────────────────────────────────────────────────

def lib_create_student_session(session_id: str, document_ids: list[str]) -> bool:
    """Create a student chat session linked to selected library documents."""
    db = get_db()
    if not db:
        return False
    try:
        db.table("student_sessions").insert({
            "id":           session_id,
            "document_ids": document_ids,
        }).execute()
        return True
    except Exception as e:
        print(f"[lib_db] create_student_session failed: {e}")
        return False


def lib_get_student_session(session_id: str) -> Optional[dict]:
    """Get a student session with its linked document IDs."""
    db = get_db()
    if not db:
        return None
    try:
        res = db.table("student_sessions")\
                .select("*")\
                .eq("id", session_id)\
                .single()\
                .execute()
        return res.data
    except Exception as e:
        print(f"[lib_db] get_student_session failed: {e}")
        return None


def lib_save_student_message(session_id: str, role: str, content: str) -> bool:
    """Append a message to the student session history."""
    db = get_db()
    if not db:
        return False
    try:
        db.table("student_messages").insert({
            "session_id": session_id,
            "role":       role,
            "content":    content,
        }).execute()
        return True
    except Exception as e:
        print(f"[lib_db] save_student_message failed: {e}")
        return False


def lib_get_student_messages(session_id: str) -> list[dict]:
    """Get all messages for a student session."""
    db = get_db()
    if not db:
        return []
    try:
        res = db.table("student_messages")\
                .select("role,content")\
                .eq("session_id", session_id)\
                .order("created_at")\
                .execute()
        return res.data or []
    except Exception as e:
        print(f"[lib_db] get_student_messages failed: {e}")
        return []
