import { useCallback, useEffect, useRef, useState } from 'react';
import { KAPSUL_THEME, useKapsul } from '../shell.jsx';
import { uploadFiles, addFilesToSession, streamChat, getSession, generateReport, SESSION_STORAGE_KEY } from './api.js';
import { FileDropzone } from './FileDropzone.jsx';
import { ProcessingScreen } from './ProcessingScreen.jsx';
import { ChatMessage, TypingIndicator } from './ChatMessage.jsx';
import { ChatInputMvp } from './ChatInputMvp.jsx';
import { MasterMDPreview } from './MasterMDPreview.jsx';
import './chat-mvp.css';

const SUGGESTIONS_FR = [
  'Résume les points clés →',
  'Quels sont les concepts importants ?',
  'Explique le premier concept du document',
];
const SUGGESTIONS_EN = [
  'Summarize the key points →',
  'What are the important concepts?',
  'Explain the first concept in the document',
];

function newMsgId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Update the last assistant bubble without clobbering the user message above it. */
function patchLastAssistant(messages, patch) {
  const idx = messages.findLastIndex((m) => m.role === 'assistant');
  if (idx < 0) {
    return [...messages, { id: newMsgId(), role: 'assistant', content: '', ...patch }];
  }
  const copy = [...messages];
  copy[idx] = { ...copy[idx], ...patch };
  return copy;
}

/** Remove trailing empty assistant placeholder after an error. */
function dropEmptyAssistantTail(messages) {
  const idx = messages.findLastIndex((m) => m.role === 'assistant');
  if (idx < 0) return messages;
  if (messages[idx].content) return messages;
  return messages.filter((_, i) => i !== idx);
}

export function ChatMvp() {
  const { version, lang, t } = useKapsul();
  const k = KAPSUL_THEME[version];
  const isV2 = version === 'v2';
  const fr = lang === 'fr';

  const [phase, setPhase] = useState('upload');
  const [files, setFiles] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [masterMD, setMasterMD] = useState('');
  const [fileCount, setFileCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [processingAppend, setProcessingAppend] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportStudent, setReportStudent] = useState('');
  const [reportCourse, setReportCourse] = useState('');
  const [enabledSources, setEnabledSources] = useState([]);
  const addFilesInputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!saved) return;
    getSession(saved)
      .then((data) => {
        setSessionId(data.session_id);
        setMasterMD(data.master_md);
        setFileCount(data.files?.length || 0);
        setPhase('chat');
      })
      .catch(() => sessionStorage.removeItem(SESSION_STORAGE_KEY));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streaming, loading]);

  const handleAddFiles = async (newFiles) => {
    if (!newFiles.length || !sessionId) return;
    setProcessingAppend(true);
    setPhase('processing');
    try {
      const data = await addFilesToSession(sessionId, newFiles);
      setMasterMD(data.master_md);
      setFileCount(data.file_count);
      setPhase('chat');
    } catch (e) {
      const msg = e.message || (fr ? 'Échec de l\'ajout' : 'Add files failed');
      if (msg.includes('Session expired') || msg.includes('Session not found')) {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
      alert(msg);
      setPhase('chat');
    } finally {
      setProcessingAppend(false);
    }
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setProcessingAppend(false);
    setPhase('processing');
    try {
      const data = await uploadFiles(files);
      setSessionId(data.session_id);
      setMasterMD(data.master_md);
      setFileCount(data.file_count);
      sessionStorage.setItem(SESSION_STORAGE_KEY, data.session_id);
      setPhase('chat');
    } catch (e) {
      alert(e.message || 'Upload failed');
      setPhase('upload');
    }
  };

  const sendMessage = useCallback((text) => {
    if (!sessionId || streaming) return;
    const userMsg = { id: newMsgId(), role: 'user', content: text };
    const assistantPlaceholder = { id: newMsgId(), role: 'assistant', content: '' };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, userMsg, assistantPlaceholder]);
    setStreaming(true);
    setLoading(true);

    let assistantText = '';
    let messageSources = [];
    let tokenFlushScheduled = false;

    streamChat(sessionId, text, history, {
      onToken: (token) => {
        assistantText += token;
        if (!tokenFlushScheduled) {
          tokenFlushScheduled = true;
          requestAnimationFrame(() => {
            tokenFlushScheduled = false;
            setMessages((m) => patchLastAssistant(m, { content: assistantText }));
          });
        }
        setLoading(false);
      },
      onSources: (srcs) => {
        messageSources = srcs;
        setMessages((m) => patchLastAssistant(m, { sources: srcs }));
      },
      onDone: () => {
        tokenFlushScheduled = false;
        setMessages((m) => patchLastAssistant(m, {
          content: assistantText,
          sources: messageSources.length ? messageSources : undefined,
        }));
        setStreaming(false);
        setLoading(false);
      },
      onError: (e) => {
        setStreaming(false);
        setLoading(false);
        const msg = e.message || 'Chat error';
        alert(msg.includes('429') || msg.includes('capacity')
          ? (fr
            ? 'Limite Mistral atteinte. Réessayez dans quelques minutes.'
            : 'Mistral rate limit reached. Please try again in a few minutes.')
          : msg);
        setMessages((m) => dropEmptyAssistantTail(m));
      },
    }, enabledSources);
  }, [sessionId, messages, streaming, enabledSources]);

  const handleGenerateReport = async () => {
    if (!sessionId || reportGenerating) return;
    setReportGenerating(true);
    try {
      await generateReport(sessionId, {
        title: reportTitle || (fr ? 'Rapport de Cours' : 'Course Report'),
        subtitle: fr ? 'Généré par Kapsul AI' : 'Generated by Kapsul AI',
        student: reportStudent,
        course: reportCourse,
        sections: [],
      });
      setShowReportModal(false);
    } catch (e) {
      alert(e.message || 'Report generation failed');
    } finally {
      setReportGenerating(false);
    }
  };

  const resetSession = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setPhase('upload');
    setFiles([]);
    setSessionId(null);
    setMasterMD('');
    setMessages([]);
  };

  if (phase === 'processing') {
    return <ProcessingScreen k={k} lang={lang} appending={processingAppend} />;
  }

  if (phase === 'upload') {
    return (
      <div data-screen-label="03 Chat — Upload" style={{
        flex: 1, overflowY: 'auto', background: k.bg, color: k.text, fontFamily: k.fontUI,
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: isV2 ? '32px 40px 48px' : '32px 40px' }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: k.textMuted }}>
            {fr ? 'Kapsul AI · Documents → Référence Maître → Chat' : 'Kapsul AI · Documents → Master MD → Chat'}
          </p>
          <h1 style={{
            margin: '0 0 8px', fontSize: isV2 ? 28 : 24, fontWeight: 600,
            fontFamily: isV2 ? '"Space Grotesk", sans-serif' : 'inherit',
          }}>
            {fr ? 'Déposez vos cours' : 'Upload your course materials'}
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: k.textMuted }}>
            {fr
              ? 'PDF, Word, PowerPoint ou texte — Mistral génère une référence unique pour le chat.'
              : 'PDF, Word, PowerPoint or text — Mistral builds one reference for chat.'}
          </p>
          <FileDropzone k={k} isV2={isV2} files={files} onFilesChange={setFiles} lang={lang} />
          {files.length > 0 && (
            <button type="button" onClick={handleUpload} style={{
              width: '100%', marginTop: 20, height: 48,
              background: k.primary, color: '#fff', border: 'none',
              borderRadius: isV2 ? 6 : 8, fontFamily: 'inherit',
              fontSize: 16, fontWeight: 600, cursor: 'pointer',
            }}>
              {fr ? 'Analyser avec Mistral →' : 'Analyze with Mistral →'}
            </button>
          )}
        </div>
      </div>
    );
  }

  const suggests = fr ? SUGGESTIONS_FR : SUGGESTIONS_EN;

  return (
    <div data-screen-label="03 Chat" style={{
      flex: 1, display: 'flex', minHeight: 0, minWidth: 0,
      background: k.bg, color: k.text, fontFamily: k.fontUI, position: 'relative',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{
          padding: '12px 20px', borderBottom: `1px solid ${k.border}`,
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <span style={{
            fontSize: 16, fontWeight: 600,
            background: isV2 ? 'linear-gradient(90deg, #7C3AED, #06B6D4)' : 'none',
            WebkitBackgroundClip: isV2 ? 'text' : 'unset',
            WebkitTextFillColor: isV2 ? 'transparent' : k.text,
            color: isV2 ? undefined : k.primary,
          }}>Kapsul AI</span>
          <span style={{
            fontSize: 11, padding: '4px 10px', borderRadius: 999,
            background: isV2 ? 'rgba(124,58,237,0.12)' : k.primarySoft,
            color: isV2 ? '#A78BFA' : k.primary, fontWeight: 500,
          }}>
            {fileCount} {fr ? 'fichiers analysés' : 'files analyzed'}
          </span>
          {messages.length > 0 && (() => {
            const lastMsg = messages[messages.length - 1];
            if (streaming) {
              return (
                <span style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 999, fontWeight: 600,
                  background: isV2 ? 'rgba(22,163,74,0.15)' : '#F0FDF4',
                  color: '#16A34A',
                }}>
                  ⚡ RAG active
                </span>
              );
            }
            if (lastMsg?.sources?.length > 0) {
              return (
                <span style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 999, fontWeight: 600,
                  background: isV2 ? 'rgba(22,163,74,0.15)' : '#F0FDF4',
                  color: '#16A34A',
                }}>
                  ✓ {lastMsg.sources.length} sources
                </span>
              );
            }
            return null;
          })()}
          <div style={{ flex: 1 }} />
          <button type="button" onClick={() => (window.innerWidth < 768 ? setMobilePreview(true) : setShowPreview((s) => !s))}
            style={{
              background: 'none', border: 'none', color: k.textMuted, cursor: 'pointer',
              fontSize: 13, textDecoration: 'underline', fontFamily: 'inherit',
            }}>
            {fr ? 'Voir la référence →' : 'View reference →'}
          </button>
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            disabled={streaming || loading || reportGenerating}
            style={{
              height: 30,
              padding: '0 12px',
              border: `1px solid ${k.border}`,
              borderRadius: 6,
              background: isV2 ? k.surfaceAlt : '#fff',
              color: isV2 ? '#A78BFA' : k.primary,
              fontSize: 12,
              fontWeight: 600,
              cursor: streaming || loading || reportGenerating ? 'default' : 'pointer',
              fontFamily: 'inherit',
              opacity: streaming || loading || reportGenerating ? 0.45 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {reportGenerating ? '⏳' : '📄'} {fr ? 'Rapport PDF' : 'PDF Report'}
          </button>
          <input
            ref={addFilesInputRef}
            type="file"
            accept=".pdf,.docx,.pptx,.txt"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              const picked = Array.from(e.target.files || []);
              e.target.value = '';
              if (picked.length) handleAddFiles(picked);
            }}
          />
          <button
            type="button"
            onClick={() => addFilesInputRef.current?.click()}
            disabled={streaming || loading}
            title={fr ? 'Ajouter des fichiers' : 'Add files'}
            style={{
              width: 32, height: 32, border: `1px solid ${k.border}`, borderRadius: 6,
              background: isV2 ? k.surfaceAlt : '#fff',
              color: k.primary, cursor: streaming || loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: streaming || loading ? 0.45 : 1,
            }}
            aria-label={fr ? 'Ajouter des fichiers' : 'Add files'}
          >
            <span style={{ fontSize: 20, fontWeight: 300, lineHeight: 1 }}>+</span>
          </button>
          <button type="button" onClick={resetSession} style={{
            background: 'none', border: `1px solid ${k.border}`, color: k.textMuted,
            padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {fr ? 'Nouveaux fichiers' : 'New files'}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {messages.length === 0 && !loading ? (
            <div style={{ maxWidth: 560, margin: '48px auto 0', textAlign: isV2 ? 'left' : 'center' }}>
              <h2 style={{
                margin: '0 0 8px', fontSize: 20, fontWeight: 600,
                fontFamily: isV2 ? '"Playfair Display", Georgia, serif' : 'inherit',
                fontStyle: isV2 ? 'italic' : 'normal',
              }}>
                {fr ? 'Votre référence maître est prête.' : 'Your master reference is ready.'}
              </h2>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: k.textMuted }}>
                {fr ? 'Posez n\'importe quelle question sur vos documents.' : 'Ask anything about your documents.'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {suggests.map((s) => (
                  <button key={s} type="button" onClick={() => sendMessage(s.replace(/\s*→$/, ''))}
                    style={{
                      padding: '8px 16px', background: isV2 ? k.surfaceAlt : '#fff',
                      border: `1px solid ${k.border}`, borderRadius: isV2 ? 4 : 999,
                      color: k.text, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    }}
                  >{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              {messages.map((msg, i) => (
                <ChatMessage
                  key={msg.id ?? `msg-${i}`}
                  k={k}
                  isV2={isV2}
                  msg={msg}
                  streaming={streaming && i === messages.length - 1 && msg.role === 'assistant'}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <ChatInputMvp
          k={k}
          isV2={isV2}
          v={version}
          lang={lang}
          disabled={streaming || loading}
          attachDisabled={false}
          placeholder={fr ? 'Posez votre question...' : 'Ask your question...'}
          onSend={sendMessage}
          onAddFiles={handleAddFiles}
          enabledSources={enabledSources}
          onSourceToggle={(sourceId) => {
            setEnabledSources((prev) =>
              prev.includes(sourceId)
                ? prev.filter((s) => s !== sourceId)
                : [...prev, sourceId],
            );
          }}
        />
      </div>

      {showPreview && !mobilePreview && typeof window !== 'undefined' && window.innerWidth >= 768 && (
        <MasterMDPreview k={k} isV2={isV2} masterMD={masterMD} lang={lang} />
      )}
      {mobilePreview && (
        <MasterMDPreview k={k} isV2={isV2} masterMD={masterMD} lang={lang} mobile onClose={() => setMobilePreview(false)} />
      )}

      {showReportModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowReportModal(false); }}
        >
          <div style={{
            background: isV2 ? '#1E1E2E' : '#fff',
            border: `1px solid ${k.border}`,
            borderRadius: 12,
            padding: '28px 32px',
            width: 420,
            maxWidth: '90vw',
            fontFamily: k.fontUI,
          }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 17, color: k.text, fontWeight: 700 }}>
              {fr ? 'Générer un rapport PDF' : 'Generate PDF Report'}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: k.textMuted }}>
              {fr
                ? 'Le rapport utilisera le contenu de vos documents uploadés.'
                : 'The report will use content from your uploaded documents.'}
            </p>

            <label style={{ fontSize: 12, fontWeight: 600, color: k.textMuted, display: 'block', marginBottom: 4 }}>
              {fr ? 'Titre du rapport' : 'Report title'}
            </label>
            <input
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder={fr ? 'Rapport de Cours — Finance' : 'Course Report — Finance'}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '8px 12px', borderRadius: 6, marginBottom: 12,
                border: `1px solid ${k.border}`,
                background: isV2 ? '#2A2A3E' : '#F8FAFC',
                color: k.text, fontFamily: 'inherit', fontSize: 13,
              }}
            />

            <label style={{ fontSize: 12, fontWeight: 600, color: k.textMuted, display: 'block', marginBottom: 4 }}>
              {fr ? "Nom de l'étudiant (optionnel)" : 'Student name (optional)'}
            </label>
            <input
              value={reportStudent}
              onChange={(e) => setReportStudent(e.target.value)}
              placeholder={fr ? 'Votre nom' : 'Your name'}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '8px 12px', borderRadius: 6, marginBottom: 12,
                border: `1px solid ${k.border}`,
                background: isV2 ? '#2A2A3E' : '#F8FAFC',
                color: k.text, fontFamily: 'inherit', fontSize: 13,
              }}
            />

            <label style={{ fontSize: 12, fontWeight: 600, color: k.textMuted, display: 'block', marginBottom: 4 }}>
              {fr ? 'Nom du cours (optionnel)' : 'Course name (optional)'}
            </label>
            <input
              value={reportCourse}
              onChange={(e) => setReportCourse(e.target.value)}
              placeholder={fr ? "Finance d'entreprise — M1" : 'Corporate Finance — M1'}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '8px 12px', borderRadius: 6, marginBottom: 20,
                border: `1px solid ${k.border}`,
                background: isV2 ? '#2A2A3E' : '#F8FAFC',
                color: k.text, fontFamily: 'inherit', fontSize: 13,
              }}
            />

            <div style={{
              padding: '10px 12px', borderRadius: 6, marginBottom: 20,
              background: isV2 ? 'rgba(124,58,237,0.12)' : '#EFF6FF',
              border: `1px solid ${isV2 ? 'rgba(124,58,237,0.3)' : '#BFDBFE'}`,
              fontSize: 12,
              color: isV2 ? '#A78BFA' : '#2563EB',
            }}>
              {fr
                ? `📄 ${fileCount} fichier(s) analysé(s) · Le rapport sera structuré automatiquement à partir de la Référence Maître`
                : `📄 ${fileCount} file(s) analysed · Report structured automatically from Master Reference`}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                style={{
                  padding: '9px 18px', borderRadius: 6, border: `1px solid ${k.border}`,
                  background: 'none', color: k.textMuted,
                  fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
                }}
              >
                {fr ? 'Annuler' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={reportGenerating}
                style={{
                  padding: '9px 18px', borderRadius: 6, border: 'none',
                  background: isV2 ? '#7C3AED' : k.primary,
                  color: '#fff', fontFamily: 'inherit', fontSize: 13,
                  fontWeight: 600, cursor: reportGenerating ? 'default' : 'pointer',
                  opacity: reportGenerating ? 0.6 : 1,
                }}
              >
                {reportGenerating
                  ? (fr ? 'Génération...' : 'Generating...')
                  : (fr ? '⬇ Télécharger le PDF' : '⬇ Download PDF')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
