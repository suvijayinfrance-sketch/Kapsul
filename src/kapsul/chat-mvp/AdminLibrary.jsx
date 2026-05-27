import { useCallback, useEffect, useState } from 'react';
import { KAPSUL_THEME, useKapsul } from '../shell.jsx';
import { adminUploadToLibrary, adminGetLibrary, adminDeleteDocument } from './api.js';

export function AdminLibrary() {
  const { version, lang } = useKapsul();
  const k = KAPSUL_THEME[version];
  const isV2 = version === 'v2';
  const fr = lang === 'fr';

  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [uploadResults, setUploadResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const fetchDocs = useCallback(async () => {
    try {
      const data = await adminGetLibrary();
      setDocuments(data.documents || []);
    } catch (e) {
      console.error('[AdminLibrary] fetch failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleUpload = async () => {
    if (!uploadFiles.length) return;
    setUploading(true);
    setUploadResults(null);
    try {
      const data = await adminUploadToLibrary(uploadFiles, subject, description);
      setUploadResults(data);
      setUploadFiles([]);
      setSubject('');
      setDescription('');
      fetchDocs();
    } catch (e) {
      alert(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId, docName) => {
    if (!window.confirm(fr
      ? `Supprimer "${docName}" ? Cette action est irréversible.`
      : `Delete "${docName}"? This cannot be undone.`
    )) return;
    try {
      await adminDeleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length) setUploadFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileInput = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (picked.length) setUploadFiles((prev) => [...prev, ...picked]);
  };

  const statusPill = (status) => {
    const map = {
      processing: { label: fr ? '⏳ En cours' : '⏳ Processing', bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
      indexed:    { label: fr ? '✓ Indexé' : '✓ Indexed', bg: '#DCFCE7', color: '#166534', border: '#86EFAC' },
      error:      { label: fr ? '✗ Erreur' : '✗ Error', bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
    };
    const s = map[status] || map.processing;
    return (
      <span style={{
        padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        whiteSpace: 'nowrap',
      }}>{s.label}</span>
    );
  };

  return (
    <div style={{
      flex: 1, overflowY: 'auto', background: k.bg, color: k.text, fontFamily: k.fontUI,
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
              {fr ? 'Bibliothèque de cours' : 'Course Library'}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: k.textMuted }}>
              {fr
                ? 'Uploadez des documents pour les rendre disponibles aux étudiants.'
                : 'Upload documents to make them available to students.'}
            </p>
          </div>
          <span style={{
            padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
            background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE',
          }}>
            {documents.length} {fr ? 'documents' : 'documents'}
          </span>
        </div>

        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            padding: '32px 24px', marginBottom: 20,
            background: dragOver ? '#EFF6FF' : '#F8FAFC',
            border: `2px dashed ${dragOver ? '#2563EB' : '#CBD5E1'}`,
            borderRadius: 8,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            transition: 'all 0.15s',
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#DBEAFE', color: '#2563EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>↑</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            {fr ? 'Déposez vos fichiers ici' : 'Drop files here'}
          </div>
          <div style={{ fontSize: 13, color: k.textMuted }}>
            PDF, DOCX, PPTX, TXT
          </div>
          <label style={{
            marginTop: 8, padding: '8px 18px', borderRadius: 6,
            background: '#0F172A', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            {fr ? 'Parcourir' : 'Browse'}
            <input type="file" multiple accept=".pdf,.docx,.pptx,.txt"
              style={{ display: 'none' }} onChange={handleFileInput} />
          </label>
        </div>

        {/* Selected files list */}
        {uploadFiles.length > 0 && (
          <div style={{
            marginBottom: 20, padding: '14px 18px',
            background: '#fff', border: `1px solid ${k.border}`, borderRadius: 8,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
              {uploadFiles.length} {fr ? 'fichier(s) sélectionné(s)' : 'file(s) selected'}
            </div>
            {uploadFiles.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 0', borderBottom: i < uploadFiles.length - 1 ? `1px solid ${k.border}` : 'none',
              }}>
                <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.name}
                </span>
                <span style={{ fontSize: 11, color: k.textMuted }}>
                  {(f.size / 1024).toFixed(0)} KB
                </span>
                <button onClick={() => setUploadFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  style={{
                    background: 'none', border: 'none', color: '#DC2626',
                    cursor: 'pointer', fontSize: 16, padding: '0 4px',
                  }}>×</button>
              </div>
            ))}

            {/* Subject + Description */}
            <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={fr ? 'Matière (optionnel)' : 'Subject (optional)'}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 6,
                  border: `1px solid ${k.border}`, background: '#F8FAFC',
                  fontFamily: 'inherit', fontSize: 13, color: k.text,
                }}
              />
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={fr ? 'Description (optionnel)' : 'Description (optional)'}
                style={{
                  flex: 2, padding: '8px 12px', borderRadius: 6,
                  border: `1px solid ${k.border}`, background: '#F8FAFC',
                  fontFamily: 'inherit', fontSize: 13, color: k.text,
                }}
              />
            </div>

            <button onClick={handleUpload} disabled={uploading}
              style={{
                width: '100%', marginTop: 14, height: 44,
                background: uploading ? '#94A3B8' : '#2563EB',
                color: '#fff', border: 'none', borderRadius: 8,
                fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
                cursor: uploading ? 'default' : 'pointer',
              }}>
              {uploading
                ? (fr ? 'Indexation en cours...' : 'Indexing...')
                : (fr ? 'Uploader et indexer →' : 'Upload & index →')}
            </button>
          </div>
        )}

        {/* Upload results */}
        {uploadResults && (
          <div style={{
            marginBottom: 20, padding: '14px 18px',
            background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 6 }}>
              {fr ? 'Résultat' : 'Result'}: {uploadResults.indexed}/{uploadResults.total} {fr ? 'indexé(s)' : 'indexed'}
            </div>
            {uploadResults.results?.map((r, i) => (
              <div key={i} style={{ fontSize: 12, color: r.status === 'indexed' ? '#166534' : '#991B1B', marginTop: 2 }}>
                {r.filename}: {r.status === 'indexed' ? `✓ ${r.chunk_count} chunks` : `✗ ${r.error}`}
              </div>
            ))}
            <button onClick={() => setUploadResults(null)} style={{
              marginTop: 8, background: 'none', border: 'none', color: '#64748B',
              fontSize: 11, cursor: 'pointer', textDecoration: 'underline',
            }}>{fr ? 'Fermer' : 'Dismiss'}</button>
          </div>
        )}

        {/* Documents table */}
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          {fr ? 'Documents indexés' : 'Indexed Documents'}
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: k.textMuted, fontSize: 14 }}>
            {fr ? 'Chargement...' : 'Loading...'}
          </div>
        ) : documents.length === 0 ? (
          <div style={{
            padding: 40, textAlign: 'center', color: k.textMuted, fontSize: 14,
            background: '#F8FAFC', borderRadius: 8, border: `1px solid ${k.border}`,
          }}>
            {fr ? 'Aucun document dans la bibliothèque.' : 'No documents in the library yet.'}
          </div>
        ) : (
          <div style={{ background: '#fff', border: `1px solid ${k.border}`, borderRadius: 8, overflow: 'hidden' }}>
            {documents.map((doc, i) => (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px',
                borderBottom: i < documents.length - 1 ? `1px solid ${k.border}` : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: '#EFF6FF', color: '#2563EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, flexShrink: 0,
                }}>
                  {doc.display_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: k.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.display_name || doc.filename}
                  </div>
                  <div style={{ fontSize: 12, color: k.textMuted, marginTop: 2 }}>
                    {doc.filename}
                    {doc.subject && <span style={{ marginLeft: 8, padding: '1px 6px', background: '#EFF6FF', borderRadius: 4, fontSize: 10, color: '#2563EB' }}>{doc.subject}</span>}
                  </div>
                </div>
                {statusPill(doc.status)}
                {doc.status === 'indexed' && (
                  <span style={{ fontSize: 11, color: k.textMuted, whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                    {doc.chunk_count} chunks · {doc.word_count?.toLocaleString()} {fr ? 'mots' : 'words'}
                  </span>
                )}
                <span style={{ fontSize: 11, color: k.textFaint, whiteSpace: 'nowrap' }}>
                  {doc.created_at ? new Date(doc.created_at).toLocaleDateString(fr ? 'fr-FR' : 'en-GB') : ''}
                </span>
                <button
                  onClick={() => handleDelete(doc.id, doc.display_name || doc.filename)}
                  style={{
                    background: 'none', border: '1px solid #FCA5A5', borderRadius: 4,
                    color: '#DC2626', padding: '4px 10px', fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>
                  {fr ? 'Supprimer' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
