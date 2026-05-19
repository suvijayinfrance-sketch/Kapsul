"""Kapsul MVP backend — upload, Master MD synthesis, streaming chat."""

from __future__ import annotations

import json
import math
import os
import time
import uuid
from io import BytesIO
from typing import Any

import fitz
import httpx
from docx import Document
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from mistralai.client import Mistral
from pptx import Presentation
from pydantic import BaseModel

load_dotenv(".env.local")
load_dotenv()

app = FastAPI(title="Kapsul API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("MISTRAL_API_KEY")
# Default SDK timeout is 60s; large PDF synthesis often needs several minutes.
MISTRAL_TIMEOUT_MS = int(os.getenv("MISTRAL_TIMEOUT_MS", "600000"))
MISTRAL_SYNTHESIS_MODEL = os.getenv("MISTRAL_SYNTHESIS_MODEL", "mistral-small-latest")
MAX_UPLOAD_CHARS = int(os.getenv("MAX_UPLOAD_CHARS", "60000"))
_HTTP_TIMEOUT_SEC = MISTRAL_TIMEOUT_MS / 1000
_HTTP_TIMEOUT = httpx.Timeout(
    _HTTP_TIMEOUT_SEC,
    connect=30.0,
    read=_HTTP_TIMEOUT_SEC,
    write=_HTTP_TIMEOUT_SEC,
    pool=30.0,
)
if not api_key:
    print("WARNING: MISTRAL_API_KEY not set — /api/upload and /api/chat will fail")
else:
    print(
        f"Kapsul API: Mistral ready "
        f"(synthesis={MISTRAL_SYNTHESIS_MODEL}, timeout={MISTRAL_TIMEOUT_MS}ms)"
    )
client = (
    Mistral(
        api_key=api_key,
        timeout_ms=MISTRAL_TIMEOUT_MS,
        client=httpx.Client(follow_redirects=True, timeout=_HTTP_TIMEOUT),
    )
    if api_key
    else None
)

# { session_id: { "master_md": str, "files": [str], "char_count": int } }
sessions: dict[str, dict[str, Any]] = {}

MASTER_MD_SYSTEM = """Tu es un assistant académique expert. Tu vas recevoir le contenu brut de plusieurs fichiers académiques.
Ta mission : synthétiser tout ce contenu en un seul document Markdown structuré appelé "Référence Maître".

Format du document Markdown :
# Référence Maître — [titre général déduit du contenu]

## Résumé Exécutif
[3-5 phrases résumant l'ensemble du contenu]

## Concepts Clés
[liste des concepts importants avec définitions brèves]

## Contenu Détaillé
[sections organisées par thème ou par fichier source]

## Points à Retenir
[liste des points essentiels pour un étudiant]

## Glossaire
[termes techniques avec définitions]

Sois exhaustif mais structuré. Utilise des titres clairs. Cite les sources par nom de fichier."""

MERGE_MD_SYSTEM = """Tu es un assistant académique expert.
Tu reçois une Référence Maître existante et du nouveau contenu brut extrait de fichiers.
Fusionne tout en une seule Référence Maître Markdown mise à jour, en conservant la structure :
# Référence Maître, ## Résumé Exécutif, ## Concepts Clés, ## Contenu Détaillé, ## Points à Retenir, ## Glossaire.
Intègre les nouvelles informations sans supprimer l'existant pertinent. Cite les nouveaux fichiers sources."""

RAG_SYSTEM_PROMPT = """Tu es un assistant académique expert. Tu dois répondre aux questions
en te basant EXCLUSIVEMENT sur les SOURCES fournies ci-dessous.

RÈGLES OBLIGATOIRES :
- Utilise UNIQUEMENT les informations présentes dans les SOURCES.
- Si la réponse n'est pas dans les SOURCES, réponds exactement : "Cette information n'est pas disponible dans vos documents."
- Pour chaque affirmation importante, cite la source avec [doc=NOM chunk=N].
- Ne complète JAMAIS avec tes connaissances générales.
- Ne fais JAMAIS de suppositions.

INTERDIT :
- Ne jamais inventer des faits.
- Ne jamais paraphraser depuis ta mémoire générale.

{evidence_pack}"""


def extract_text(filename: str, data: bytes) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext == "pdf":
        doc = fitz.open(stream=data, filetype="pdf")
        parts = [page.get_text() for page in doc]
        doc.close()
        return "\n".join(parts).strip()
    if ext == "docx":
        doc = Document(BytesIO(data))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip()).strip()
    if ext == "pptx":
        prs = Presentation(BytesIO(data))
        lines: list[str] = []
        for slide in prs.slides:
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text:
                    lines.append(shape.text)
                elif shape.has_text_frame:
                    for para in shape.text_frame.paragraphs:
                        if para.text:
                            lines.append(para.text)
        return "\n".join(lines).strip()
    if ext == "txt":
        return data.decode("utf-8", errors="replace").strip()
    raise ValueError(f"Unsupported file type: .{ext}")


def _stream_delta(event: Any) -> str | None:
    try:
        choice = event.data.choices[0]
        if choice.delta and choice.delta.content:
            return choice.delta.content
    except (AttributeError, IndexError, TypeError):
        pass
    return None


def mistral_complete(messages: list[dict], model: str) -> str:
    """Stream tokens from Mistral so long generations don't hit read timeouts."""
    if not client:
        raise HTTPException(status_code=500, detail="MISTRAL_API_KEY not configured")
    parts: list[str] = []
    try:
        stream = client.chat.stream(
            model=model,
            messages=messages,
            timeout_ms=MISTRAL_TIMEOUT_MS,
        )
        for event in stream:
            delta = _stream_delta(event)
            if delta:
                parts.append(delta)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Mistral API error: {e}") from e
    text = "".join(parts).strip()
    if not text:
        raise HTTPException(
            status_code=502,
            detail="Mistral returned an empty response. Try a smaller file or retry.",
        )
    return text


# ── RAG STEP 1: CHUNKER ──────────────────────────────────────────────────────

CHUNK_WORDS   = 300
OVERLAP_WORDS = 37

def chunk_text(text: str, doc_name: str, session_id: str) -> list[dict]:
    words = text.split()
    if not words:
        return []
    chunks: list[dict] = []
    start = 0
    index = 0
    while start < len(words):
        end     = min(start + CHUNK_WORDS, len(words))
        content = " ".join(words[start:end]).strip()
        if content:
            doc_slug = doc_name.replace(" ", "_").replace("/", "_").replace(".", "_")
            chunks.append({
                "chunk_id":    f"{session_id}__{doc_slug}__{index}",
                "session_id":  session_id,
                "doc_name":    doc_name,
                "chunk_index": index,
                "content":     content,
                "word_start":  start,
                "word_end":    end,
                "embedding":   None,
            })
            index += 1
        start += CHUNK_WORDS - OVERLAP_WORDS
    return chunks


# ── RAG STEP 2: EMBEDDER ─────────────────────────────────────────────────────

def embed_chunks(chunks: list[dict], batch_size: int = 20) -> list[dict]:
    if not client or not chunks:
        return chunks
    batches = [chunks[i:i + batch_size] for i in range(0, len(chunks), batch_size)]
    for batch_idx, batch in enumerate(batches):
        texts = [c["content"] for c in batch]
        for attempt in range(2):
            try:
                response = client.embeddings.create(
                    model="mistral-embed",
                    inputs=texts,
                )
                for chunk, emb_obj in zip(batch, response.data):
                    chunk["embedding"] = emb_obj.embedding
                break
            except Exception as e:
                if attempt == 0:
                    print(f"[embed] Batch {batch_idx} failed ({e}), retrying in 2s...")
                    time.sleep(2)
                else:
                    print(f"[embed] Batch {batch_idx} failed twice — skipping")
                    for chunk in batch:
                        chunk["embedding"] = None
    embedded = sum(1 for c in chunks if c["embedding"] is not None)
    print(f"[embed] {embedded}/{len(chunks)} chunks embedded")
    return chunks


# ── RAG STEP 3: RETRIEVAL ────────────────────────────────────────────────────

def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot   = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    return dot / (mag_a * mag_b) if mag_a and mag_b else 0.0


def find_relevant_chunks(
    question_embedding: list[float],
    chunks: list[dict],
    top_k: int = 5,
) -> list[dict]:
    scored = [
        (cosine_similarity(question_embedding, c["embedding"]), c)
        for c in chunks
        if c.get("embedding") is not None
    ]
    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:top_k]
    for score, chunk in top:
        chunk["_score"] = round(score, 3)
    return [c for _, c in top]


def build_evidence_pack(chunks: list[dict]) -> str:
    if not chunks:
        return "SOURCES:\n(aucune source pertinente trouvée)"
    lines = ["SOURCES:"]
    for i, c in enumerate(chunks, 1):
        lines.append(f"({i}) doc={c['doc_name']} chunk={c['chunk_index']}")
        lines.append(f'Text: "{c["content"].strip()}"')
        lines.append("")
    return "\n".join(lines)


class ChatRequest(BaseModel):
    message: str
    history: list[dict[str, str]] = []


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "mistral": bool(api_key),
        "timeout_ms": MISTRAL_TIMEOUT_MS,
        "synthesis_model": MISTRAL_SYNTHESIS_MODEL,
    }


@app.post("/api/upload")
async def upload(files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    if not client:
        raise HTTPException(status_code=500, detail="MISTRAL_API_KEY not configured")

    session_id = str(uuid.uuid4())
    chunks_all: list[dict] = []
    chunks: list[str] = []
    filenames: list[str] = []

    for f in files:
        data = await f.read()
        name = f.filename or "unknown"
        try:
            text = extract_text(name, data)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e)) from e
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Could not read {name}: {e}"
            ) from e
        filenames.append(name)
        chunks.append(f"=== FILE: {name} ===\n{text}\n")
        chunks_all.extend(chunk_text(text, name, session_id))

    combined = "\n\n".join(chunks)
    if not combined.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from files")

    messages = [
        {"role": "system", "content": MASTER_MD_SYSTEM},
        {"role": "user", "content": combined[:MAX_UPLOAD_CHARS]},
    ]

    try:
        master_md = mistral_complete(messages, MISTRAL_SYNTHESIS_MODEL)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Analysis failed: {e}") from e

    print(f"[upload] Embedding {len(chunks_all)} chunks for session {session_id}...")
    chunks_all = embed_chunks(chunks_all)
    embedded_count = sum(1 for c in chunks_all if c["embedding"] is not None)

    sessions[session_id] = {
        "master_md":  master_md,
        "files":      filenames,
        "char_count": len(combined),
        "chunks":     chunks_all,
    }

    return {
        "session_id":     session_id,
        "master_md":      master_md,
        "file_count":     len(filenames),
        "char_count":     len(combined),
        "chunks_indexed": embedded_count,
    }


@app.post("/api/session/{session_id}/add-files")
async def add_files(session_id: str, files: list[UploadFile] = File(...)):
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    if not client:
        raise HTTPException(status_code=500, detail="MISTRAL_API_KEY not configured")

    chunks: list[str] = []
    new_names: list[str] = []
    new_file_chunks: list[dict] = []
    for f in files:
        data = await f.read()
        name = f.filename or "unknown"
        try:
            text = extract_text(name, data)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e)) from e
        new_names.append(name)
        chunks.append(f"=== FILE: {name} ===\n{text}\n")
        new_file_chunks.extend(chunk_text(text, name, session_id))

    combined = "\n\n".join(chunks)
    if not combined.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from files")

    existing = session["master_md"]
    messages = [
        {"role": "system", "content": MERGE_MD_SYSTEM},
        {
            "role": "user",
            "content": (
                f"RÉFÉRENCE EXISTANTE:\n{existing[:90000]}\n\n"
                f"NOUVEAU CONTENU:\n{combined[:30000]}"
            ),
        },
    ]
    master_md = mistral_complete(messages, MISTRAL_SYNTHESIS_MODEL)
    new_file_chunks = embed_chunks(new_file_chunks)
    session["master_md"] = master_md
    session["files"] = list(session.get("files", [])) + new_names
    session["char_count"] = session.get("char_count", 0) + len(combined)
    session["chunks"] = session.get("chunks", []) + new_file_chunks

    return {
        "session_id": session_id,
        "master_md": master_md,
        "file_count": len(session["files"]),
        "char_count": session["char_count"],
        "added_files": new_names,
    }


@app.get("/api/session/{session_id}")
def get_session(session_id: str):
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session_id": session_id,
        "master_md": session["master_md"],
        "files": session["files"],
        "char_count": session.get("char_count", 0),
    }


@app.post("/api/chat/{session_id}")
async def chat(session_id: str, body: ChatRequest):
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not client:
        raise HTTPException(status_code=500, detail="MISTRAL_API_KEY not configured")

    chunks  = session.get("chunks", [])
    use_rag = any(c.get("embedding") for c in chunks)
    sources = []

    if use_rag:
        try:
            q_resp = client.embeddings.create(
                model="mistral-embed",
                inputs=[body.message],
            )
            question_embedding = q_resp.data[0].embedding
            relevant       = find_relevant_chunks(question_embedding, chunks, top_k=5)
            evidence       = build_evidence_pack(relevant)
            system_content = RAG_SYSTEM_PROMPT.format(evidence_pack=evidence)
            sources = [
                {
                    "doc":   c["doc_name"],
                    "chunk": c["chunk_index"],
                    "text":  c["content"][:300],
                    "words": len(c["content"].split()),
                    "score": c.pop("_score", None),
                }
                for c in relevant
            ]
        except Exception as e:
            print(f"[chat] RAG failed ({e}) — falling back to Master MD")
            use_rag = False

    if not use_rag:
        master_md = session["master_md"]
        system_content = (
            "Tu es un assistant académique intelligent. Réponds en te basant EXCLUSIVEMENT "
            f"sur le document de référence suivant.\n\nDOCUMENT DE RÉFÉRENCE :\n{master_md}"
        )

    messages = [{"role": "system", "content": system_content}]
    for h in body.history:
        if h.get("role") in ("user", "assistant") and h.get("content"):
            messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": body.message})

    def generate():
        try:
            if sources:
                yield f"data: {json.dumps({'sources': sources})}\n\n"
            stream = client.chat.stream(model="mistral-small-latest", messages=messages)
            for event in stream:
                delta = None
                try:
                    choice = event.data.choices[0]
                    if choice.delta and choice.delta.content:
                        delta = choice.delta.content
                except (AttributeError, IndexError, TypeError):
                    pass
                if delta:
                    yield f"data: {json.dumps({'token': delta})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
