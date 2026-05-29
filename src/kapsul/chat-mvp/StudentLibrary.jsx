import { useCallback, useEffect, useRef, useState } from 'react';
import { KAPSUL_THEME, useKapsul } from '../shell.jsx';
import {
  getStudentLibrary, startLibrarySession, streamLibraryChat, LIBRARY_SESSION_KEY,
} from './api.js';
import { ChatMessage, TypingIndicator } from './ChatMessage.jsx';
import { ChatInputMvp } from './ChatInputMvp.jsx';
import { MasterMDPreview } from './MasterMDPreview.jsx';

const MODE_SUGGESTIONS = {
  tuteur: {
    fr: ['Explique ce concept pas à pas →', 'Qu\'est-ce que signifie... ?', 'Donne-moi un exemple du cours'],
    en: ['Explain this concept step by step →', 'What does this mean?', 'Give me an example from the course'],
  },
  socratique: {
    fr: ['Je ne comprends pas ce concept', 'Comment fonctionne... ?', 'Aide-moi à réfléchir sur...'],
    en: ['I don\'t understand this concept', 'How does this work?', 'Help me think through...'],
  },
  coach: {
    fr: ['J\'ai un examen dans 2 jours', 'Crée mon plan de révision', 'Motive-moi pour réviser'],
    en: ['I have an exam in 2 days', 'Create my revision plan', 'Help me get motivated'],
  },
  verificateur: {
    fr: ['Teste ma compréhension', 'Génère un quiz sur ce chapitre', 'Évalue ma réponse :'],
    en: ['Test my understanding', 'Generate a quiz on this chapter', 'Evaluate my answer:'],
  },
  recall: {
    fr: ['Lance les flashcards', 'Révise les concepts clés', 'Mode flashcard sur ce cours'],
    en: ['Start flashcards', 'Revise key concepts', 'Flashcard mode for this course'],
  },
};

const MODE_TITLES = {
  tuteur:       { fr: 'Que souhaitez-vous apprendre ?',    en: 'What would you like to learn?' },
  socratique:   { fr: 'Posez votre question.',              en: 'Ask your question.' },
  coach:        { fr: 'Prêt à réviser ?',                  en: 'Ready to revise?' },
  verificateur: { fr: 'Prêt à être testé ?',               en: 'Ready to be tested?' },
  recall:       { fr: 'Mode Flashcards activé.',           en: 'Flashcard mode active.' },
};

function newMsgId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function patchLastAssistant(messages, patch) {
  const idx = messages.findLastIndex((m) => m.role === 'assistant');
  if (idx < 0) {
    return [...messages, { id: newMsgId(), role: 'assistant', content: '', ...patch }];
  }
  const copy = [...messages];
  copy[idx] = { ...copy[idx], ...patch };
  return copy;
}

function dropEmptyAssistantTail(messages) {
  const idx = messages.findLastIndex((m) => m.role === 'assistant');
  if (idx < 0) return messages;
  if (messages[idx].content) return messages;
  return messages.filter((_, i) => i !== idx);
}

export function StudentLibrary() {
  const { version, lang } = useKapsul();
  const k = KAPSUL_THEME[version];
  const isV2 = version === 'v2';
  const fr = lang === 'fr';

  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [starting, setStarting] = useState(false);

  // Chat phase state
  const [chatActive, setChatActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [masterMD, setMasterMD] = useState('');
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showPreview, setShowPreview] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [activeMode, setActiveMode] = useState('tuteur');
  const bottomRef = useRef(null);

  useEffect(() => {
    getStudentLibrary()
      .then((data) => setDocuments(data.documents || []))
      .catch((e) => console.error('[StudentLibrary] fetch failed:', e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streaming, loadingChat]);

  const filteredDocs = documents.filter((d) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (d.display_name || '').toLowerCase().includes(q) ||
      (d.filename || '').toLowerCase().includes(q) ||
      (d.subject || '').toLowerCase().includes(q)
    );
  });

  const toggleSelect = (docId) => {
    setSelected((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleStartChat = async () => {
    if (!selected.length) return;
    setStarting(true);
    try {
      const data = await startLibrarySession(selected);
      setSessionId(data.session_id);
      setMasterMD(data.master_md);
      sessionStorage.setItem(LIBRARY_SESSION_KEY, data.session_id);
      setChatActive(true);
    } catch (e) {
      alert(e.message || 'Failed to start session');
    } finally {
      setStarting(false);
    }
  };

  const handleBackToLibrary = () => {
    sessionStorage.removeItem(LIBRARY_SESSION_KEY);
    setChatActive(false);
    setSessionId(null);
    setMasterMD('');
    setMessages([]);
    setSelected([]);
  };

  const sendMessage = useCallback((text) => {
    if (!sessionId || streaming) return;
    const userMsg = { id: newMsgId(), role: 'user', content: text };
    const assistantPlaceholder = { id: newMsgId(), role: 'assistant', content: '' };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, userMsg, assistantPlaceholder]);
    setStreaming(true);
    setLoadingChat(true);

    let assistantText = '';
    let messageSources = [];
    let tokenFlushScheduled = false;

    streamLibraryChat(sessionId, text, history, {
      onToken: (token) => {
        assistantText += token;
        if (!tokenFlushScheduled) {
          tokenFlushScheduled = true;
          requestAnimationFrame(() => {
            tokenFlushScheduled = false;
            setMessages((m) => patchLastAssistant(m, { content: assistantText }));
          });
        }
        setLoadingChat(false);
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
        setLoadingChat(false);
      },
      onError: (e) => {
        setStreaming(false);
        setLoadingChat(false);
        alert(e.message || 'Chat error');
        setMessages((m) => dropEmptyAssistantTail(m));
      },
    }, [], activeMode);
  }, [sessionId, messages, streaming, activeMode]);

  // ── Chat phase ──
  if (chatActive && sessionId) {
    const suggests = fr
      ? MODE_SUGGESTIONS[activeMode]?.fr || MODE_SUGGESTIONS.tuteur.fr
      : MODE_SUGGESTIONS[activeMode]?.en || MODE_SUGGESTIONS.tuteur.en;
    const emptyTitle = fr
      ? MODE_TITLES[activeMode]?.fr || MODE_TITLES.tuteur.fr
      : MODE_TITLES[activeMode]?.en || MODE_TITLES.tuteur.en;
    return (
      <div style={{
        flex: 1, display: 'flex', minHeight: 0, minWidth: 0,
        background: k.bg, color: k.text, fontFamily: k.fontUI, position: 'relative',
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Chat header */}
          <div style={{
            padding: '12px 20px', borderBottom: `1px solid ${k.border}`,
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <button onClick={handleBackToLibrary} style={{
              background: 'none', border: `1px solid ${k.border}`, borderRadius: 6,
              padding: '5px 12px', fontSize: 12, color: k.textMuted, cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 500,
            }}>
              ← {fr ? 'Retour à la bibliothèque' : 'Back to library'}
            </button>
            <span style={{
              fontSize: 16, fontWeight: 600, color: k.primary, flexShrink: 0,
            }}>Kapsul AI</span>
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 999,
              background: '#EFF6FF', color: '#2563EB', fontWeight: 500,
            }}>
              {selected.length} {fr ? 'cours' : 'courses'}
            </span>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => (window.innerWidth < 768 ? setMobilePreview(true) : setShowPreview((s) => !s))}
              style={{
                background: 'none', border: 'none', color: k.textMuted, cursor: 'pointer',
                fontSize: 13, textDecoration: 'underline', fontFamily: 'inherit',
              }}>
              {fr ? 'Voir la référence →' : 'View reference →'}
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {messages.length === 0 && !loadingChat ? (
              <div style={{ maxWidth: 560, margin: '48px auto 0', textAlign: 'center' }}>
                <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600 }}>
                  {emptyTitle}
                </h2>
                <p style={{ margin: '0 0 24px', fontSize: 14, color: k.textMuted }}>
                  {fr ? 'Posez n\'importe quelle question sur vos documents.' : 'Ask anything about your documents.'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                  {suggests.map((s) => (
                    <button key={s} type="button" onClick={() => sendMessage(s.replace(/\s*→$/, ''))}
                      style={{
                        padding: '8px 16px', background: '#fff',
                        border: `1px solid ${k.border}`, borderRadius: 999,
                        color: k.text, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      }}>{s}</button>
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
                    lang={lang}
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
            disabled={streaming || loadingChat}
            attachDisabled={true}
            placeholder={fr ? 'Posez votre question...' : 'Ask your question...'}
            onSend={sendMessage}
            onAddFiles={() => {}}
            enabledSources={[]}
            onSourceToggle={() => {}}
            activeMode={activeMode}
            onModeChange={setActiveMode}
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

  // ── Library selection phase ──
  return (
    <div style={{
      flex: 1, overflowY: 'auto', background: k.bg, color: k.text, fontFamily: k.fontUI,
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
              {fr ? 'Cours disponibles' : 'Available Courses'}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: k.textMuted }}>
              {fr
                ? 'Sélectionnez les documents sur lesquels vous voulez travailler.'
                : 'Select the documents you want to study.'}
            </p>
          </div>
          <span style={{
            padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
            background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE',
          }}>
            {documents.length} {fr ? 'cours' : 'courses'}
          </span>
        </div>

        {/* Search + bulk actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={fr ? 'Rechercher par nom ou matière...' : 'Search by name or subject...'}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 8,
              border: `1px solid ${k.border}`, background: '#fff',
              fontFamily: 'inherit', fontSize: 14, color: k.text,
            }}
          />
          <button
            onClick={() => setSelected(filteredDocs.map((d) => d.id))}
            style={{
              padding: '8px 14px', borderRadius: 6, border: `1px solid ${k.border}`,
              background: '#fff', color: k.text, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>
            {fr ? 'Tout sélectionner' : 'Select all'}
          </button>
          <button
            onClick={() => setSelected([])}
            style={{
              padding: '8px 14px', borderRadius: 6, border: `1px solid ${k.border}`,
              background: '#fff', color: k.textMuted, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>
            {fr ? 'Tout désélectionner' : 'Deselect all'}
          </button>
        </div>

        {/* Document grid */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: k.textMuted }}>
            {fr ? 'Chargement...' : 'Loading...'}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div style={{
            padding: 40, textAlign: 'center', color: k.textMuted,
            background: '#F8FAFC', borderRadius: 8, border: `1px solid ${k.border}`,
          }}>
            {fr ? 'Aucun cours disponible.' : 'No courses available.'}
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14,
          }}>
            {filteredDocs.map((doc) => {
              const isSelected = selected.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleSelect(doc.id)}
                  style={{
                    padding: '18px 20px',
                    background: isSelected ? '#EFF6FF' : '#fff',
                    border: `2px solid ${isSelected ? '#2563EB' : k.border}`,
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                    position: 'relative',
                  }}
                >
                  {/* Checkbox indicator */}
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    width: 22, height: 22, borderRadius: 6,
                    border: `2px solid ${isSelected ? '#2563EB' : '#CBD5E1'}`,
                    background: isSelected ? '#2563EB' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                  }}>
                    {isSelected && '✓'}
                  </div>

                  <div style={{ fontSize: 15, fontWeight: 600, color: k.text, marginBottom: 6, paddingRight: 28 }}>
                    {doc.display_name || doc.filename}
                  </div>
                  {doc.subject && (
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                      background: '#EFF6FF', color: '#2563EB', fontSize: 11, fontWeight: 600,
                      marginBottom: 8,
                    }}>{doc.subject}</span>
                  )}
                  <div style={{ fontSize: 12, color: k.textMuted, marginTop: 4 }}>
                    {doc.chunk_count} chunks · {doc.word_count?.toLocaleString()} {fr ? 'mots' : 'words'}
                  </div>
                  {doc.description && (
                    <div style={{ fontSize: 12, color: k.textFaint, marginTop: 6, lineHeight: 1.4 }}>
                      {doc.description.slice(0, 100)}{doc.description.length > 100 ? '...' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom action bar */}
        {selected.length > 0 && (
          <div style={{
            position: 'sticky', bottom: 0, left: 0, right: 0,
            marginTop: 24, padding: '16px 24px',
            background: '#fff', borderTop: `1px solid ${k.border}`,
            borderRadius: '12px 12px 0 0',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: k.text }}>
              {selected.length} {fr ? 'document(s) sélectionné(s)' : 'document(s) selected'}
            </span>
            <button onClick={handleStartChat} disabled={starting}
              style={{
                padding: '12px 24px', borderRadius: 8, border: 'none',
                background: starting ? '#94A3B8' : '#2563EB',
                color: '#fff', fontSize: 15, fontWeight: 600,
                cursor: starting ? 'default' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
              {starting
                ? (fr ? 'Préparation...' : 'Preparing...')
                : (fr ? 'Commencer le chat →' : 'Start chat →')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
