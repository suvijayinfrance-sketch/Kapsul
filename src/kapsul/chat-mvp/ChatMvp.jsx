import { useCallback, useEffect, useRef, useState } from 'react';
import { KAPSUL_THEME, useKapsul } from '../shell.jsx';
import { uploadFiles, addFilesToSession, streamChat, getSession, SESSION_STORAGE_KEY } from './api.js';
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
  }, [messages, streaming, loading]);

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
    const userMsg = { role: 'user', content: text };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, userMsg]);
    setStreaming(true);
    setLoading(true);

    let assistantText = '';
    let messageSources = [];
    setMessages((m) => [...m, { role: 'assistant', content: '' }]);

    streamChat(sessionId, text, history, {
      onToken: (token) => {
        assistantText += token;
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: assistantText };
          return copy;
        });
        setLoading(false);
      },
      onSources: (srcs) => {
        messageSources = srcs;
      },
      onDone: () => {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: 'assistant',
            content: assistantText,
            sources: messageSources,
          };
          return copy;
        });
        setStreaming(false);
        setLoading(false);
      },
      onError: (e) => {
        setStreaming(false);
        setLoading(false);
        alert(e.message || 'Chat error');
        setMessages((m) => m.slice(0, -1));
      },
    });
  }, [sessionId, messages, streaming]);

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
                  key={i}
                  k={k}
                  isV2={isV2}
                  msg={msg}
                  streaming={streaming && i === messages.length - 1 && msg.role === 'assistant'}
                />
              ))}
              {loading && !streaming && <TypingIndicator k={k} isV2={isV2} />}
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
        />
      </div>

      {showPreview && !mobilePreview && typeof window !== 'undefined' && window.innerWidth >= 768 && (
        <MasterMDPreview k={k} isV2={isV2} masterMD={masterMD} lang={lang} />
      )}
      {mobilePreview && (
        <MasterMDPreview k={k} isV2={isV2} masterMD={masterMD} lang={lang} mobile onClose={() => setMobilePreview(false)} />
      )}
    </div>
  );
}
