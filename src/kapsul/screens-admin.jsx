import { useState } from 'react';
import { KapsulIcons as Ic } from './icons.jsx';
import { KAPSUL_THEME, useKapsul } from './shell.jsx';
import { Badge, Toggle, LangToggle } from './screens-auth.jsx';
import { ChatInput, EditorPanel } from './screens-student.jsx';
import { LearningPulse } from './admin/LearningPulse.jsx';

// ═══════════════════════════════════════════════════════════
// STUDIO (Professor)
// ═══════════════════════════════════════════════════════════
export function StudioScreen() {
  const { version, t, lang } = useKapsul();
  const k = KAPSUL_THEME[version];
  const isV2 = version === 'v2';
  const [editorTab, setEditorTab] = useState('kapsul');
  const [dragOver, setDragOver] = useState(false);

  return (
    <div data-screen-label="04 Studio" style={{
      flex: 1, display: 'flex', background: k.bg, color: k.text, fontFamily: k.fontUI,
      minWidth: 0, overflow: 'hidden',
    }}>
      {/* LEFT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{
          padding: '0 24px', height: 56, display: 'flex', alignItems: 'center',
          gap: 12, borderBottom: `1px solid ${k.border}`, flexShrink: 0,
        }}>
          {isV2 ? (
            <>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 500,
                letterSpacing: '0.16em', color: k.textMuted, textTransform: 'uppercase',
              }}>{t.studioLabel}</div>
              <div style={{ flex: 1 }}/>
              <span style={{
                fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 500,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#A78BFA', padding: '4px 10px',
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(167,139,250,0.4)',
                borderRadius: 4,
              }}>{t.teacherBadge}</span>
            </>
          ) : (
            <>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{t.studioLabel}</h1>
              <div style={{ flex: 1 }}/>
              <span style={{
                padding: '4px 10px', background: '#EFF6FF', color: k.primary,
                borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
              }}>{t.teacherBadge}</span>
            </>
          )}
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, flex: 1, overflowY: 'auto' }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); }}
            style={{
              position: 'relative',
              padding: '32px 24px',
              background: isV2
                ? (dragOver ? 'rgba(124,58,237,0.08)' : k.surfaceAlt)
                : (dragOver ? '#EFF6FF' : '#F8FAFC'),
              border: `2px dashed ${dragOver ? k.primary : (isV2 ? k.border : '#BFDBFE')}`,
              borderRadius: isV2 ? 4 : 8,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 8, transition: 'all 0.15s', minHeight: 180, justifyContent: 'center',
            }}
          >
            <span style={{
              position: 'absolute', top: 12, right: 14,
              padding: '4px 8px',
              background: isV2 ? 'rgba(124,58,237,0.12)' : k.primary,
              color: isV2 ? '#A78BFA' : '#fff',
              border: isV2 ? '1px solid rgba(167,139,250,0.4)' : 'none',
              borderRadius: isV2 ? 3 : 999,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
              fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>{t.dragDropRag}</span>
            <div style={{
              width: 48, height: 48, borderRadius: isV2 ? 6 : 12,
              background: isV2 ? 'rgba(124,58,237,0.12)' : '#DBEAFE',
              color: k.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Ic.Upload size={22} sw={1.8}/></div>
            <div style={{
              fontSize: isV2 ? 18 : 16, fontWeight: 600, color: k.text,
              fontFamily: isV2 ? '"Space Grotesk", sans-serif' : 'inherit',
            }}>{t.dropPdf}</div>
            <div style={{ fontSize: 13, color: k.textMuted, textAlign: 'center' }}>{t.dropPdfSub}</div>
          </div>

          {/* AI message */}
          <div style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 32, height: 32, flexShrink: 0,
              borderRadius: isV2 ? 6 : '50%',
              background: isV2
                ? 'linear-gradient(135deg, #7C3AED, #06B6D4)'
                : 'linear-gradient(135deg, #2563EB, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13,
            }}>K</div>
            <div style={{
              padding: '12px 16px',
              background: isV2 ? 'rgba(124,58,237,0.12)' : '#EFF6FF',
              border: isV2 ? '1px solid rgba(167,139,250,0.3)' : 'none',
              color: isV2 ? k.text : '#1E3A8A',
              borderRadius: isV2 ? 4 : 14,
              borderTopLeftRadius: 4,
              fontSize: 14, lineHeight: 1.55, maxWidth: 520,
            }}>{isV2 ? t.profGreetingV2 : t.profGreeting}</div>
          </div>
        </div>

        <ChatInput v={version} placeholder={t.profPlaceholder}/>
      </div>

      {/* RIGHT */}
      <div style={{
        width: '50%',
        background: isV2 ? k.surface : k.surfaceAlt,
        borderLeft: `1px solid ${k.border}`,
        display: 'flex', flexDirection: 'column', minWidth: 0,
      }}>
        <EditorPanel v={version} editorTab={editorTab} setEditorTab={setEditorTab}/>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// LEARNING PULSE (Admin)
// ═══════════════════════════════════════════════════════════
export function PulseScreen() {
  const { version } = useKapsul();
  const k = KAPSUL_THEME[version];
  const isV2 = version === 'v2';

  return (
    <div data-screen-label="05 Pulse" style={{ flex: 1, display: 'flex', minWidth: 0, minHeight: 0 }}>
      <LearningPulse k={k} isV2={isV2} />
    </div>
  );
};

const cardStyle = (k, isV2) => ({
  background: isV2 ? k.surface : '#fff',
  border: `1px solid ${k.border}`,
  borderRadius: k.radius.card,
  overflow: 'hidden',
});

const PrivacyBadge = ({ v, t }) => {
  const k = KAPSUL_THEME[v];
  const isV2 = v === 'v2';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: isV2 ? '6px 10px' : '6px 12px',
      background: isV2 ? 'rgba(16,185,129,0.08)' : '#fff',
      color: isV2 ? '#34D399' : '#15803D',
      border: `1px solid ${isV2 ? 'rgba(52,211,153,0.4)' : '#BBF7D0'}`,
      borderRadius: isV2 ? 4 : 999,
      fontSize: 11, fontWeight: 600, letterSpacing: isV2 ? '0.1em' : '0.04em',
      textTransform: 'uppercase',
      fontFamily: isV2 ? '"JetBrains Mono", monospace' : 'inherit',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: isV2 ? '#34D399' : '#16A34A' }}/>
      {t.privacyFw}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════
// KAPSUL STORE
// ═══════════════════════════════════════════════════════════
export function StoreScreen() {
  const { version, t, lang, setLang } = useKapsul();
  const k = KAPSUL_THEME[version];
  const isV2 = version === 'v2';

  const integrations = [
    { id: 'ms', name: t.integ_ms, desc: t.integ_ms_d, icon: '⊞', flow: 'sec', defaultOn: true, color: '#0078D4' },
    { id: 'g',  name: t.integ_g,  desc: t.integ_g_d,  icon: '◇', flow: 'zero', defaultOn: true, color: '#4285F4' },
    { id: 'm',  name: t.integ_moodle, desc: t.integ_moodle_d, icon: '◉', flow: 'sec', defaultOn: true, color: '#F88B12' },
    { id: 'bb', name: t.integ_bb, desc: t.integ_bb_d, icon: '▲', flow: 'sec', defaultOn: false, color: '#FF6B35' },
    { id: 'cn', name: t.integ_canvas, desc: t.integ_canvas_d, icon: '◆', flow: 'zero', defaultOn: false, color: '#E13F27' },
    { id: 'n',  name: t.integ_notion, desc: t.integ_notion_d, icon: '✦', flow: 'zero', defaultOn: true, color: isV2 ? '#A78BFA' : '#0F172A' },
  ];

  const [states, setStates] = useState(integrations.reduce((acc, i) => ({ ...acc, [i.id]: i.defaultOn }), {}));

  return (
    <div data-screen-label="06 Store" style={{
      flex: 1, background: k.bg, color: k.text, fontFamily: k.fontUI,
      overflowY: 'auto', minWidth: 0,
    }}>
      <div style={{ padding: isV2 ? '36px 40px 56px' : '32px 40px', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
          <div style={{ flex: 1 }}>
            {isV2 ? (
              <>
                <div style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 500,
                  letterSpacing: '0.18em', color: k.textMuted, textTransform: 'uppercase', marginBottom: 10,
                }}>{t.storeTitle}</div>
                <h1 style={{
                  margin: 0, fontFamily: '"Playfair Display", Georgia, serif',
                  fontStyle: 'italic', fontSize: 36, fontWeight: 500,
                  letterSpacing: -0.5, color: k.text, lineHeight: 1.15, marginBottom: 6,
                }}>{lang === 'fr' ? 'Vos connexions, sous contrôle.' : 'Your connections, under control.'}</h1>
                <p style={{ margin: 0, fontSize: 14, color: k.textMuted }}>{t.storeSub}</p>
              </>
            ) : (
              <>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: -0.4 }}>{t.storeTitle}</h1>
                <p style={{ margin: 0, marginTop: 4, fontSize: 14, color: k.textMuted }}>{t.storeSub}</p>
              </>
            )}
          </div>
          <PrivacyBadge v={version} t={t}/>
          {!isV2 && <LangToggle v={version} lang={lang} setLang={setLang}/>}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: isV2 ? 16 : 20,
        }}>
          {integrations.map(it => {
            const on = states[it.id];
            return (
              <div key={it.id} style={{
                ...cardStyle(k, isV2),
                padding: 24, display: 'flex', flexDirection: 'column', gap: 14,
                opacity: on ? 1 : 0.7,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: isV2 ? 6 : 8,
                    background: isV2 ? k.surfaceAlt : '#F1F5F9',
                    color: it.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                    border: isV2 ? `1px solid ${k.border}` : 'none',
                  }}>{it.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 16, fontWeight: 600, color: k.text, lineHeight: 1.2,
                      fontFamily: isV2 ? '"Space Grotesk", sans-serif' : 'inherit',
                    }}>{it.name}</div>
                  </div>
                  <Toggle on={on} onChange={x => setStates(s => ({ ...s, [it.id]: x }))} v={version}/>
                </div>
                <p style={{
                  margin: 0, fontSize: 13, color: k.textMuted, lineHeight: 1.5, minHeight: 36,
                }}>{it.desc}</p>
                <div>
                  <Badge v={version} tone={it.flow === 'sec' ? 'success' : 'cyan'}>
                    {t.dataFlow}: {it.flow === 'sec' ? t.secNumCloud : t.zeroTraining}
                  </Badge>
                </div>
                {isV2 ? (
                  <a style={{
                    fontSize: 13, color: k.primary, textDecoration: 'underline',
                    cursor: 'pointer', marginTop: 4, fontWeight: 500,
                  }}>{t.apiSettings} →</a>
                ) : (
                  <button style={{
                    width: '100%', height: 36, marginTop: 4,
                    background: '#fff', color: k.text,
                    border: `1px solid ${k.border}`, borderRadius: 6,
                    fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  }}>{t.apiSettings}</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SOVEREIGN RAG (Brain Sync)
// ═══════════════════════════════════════════════════════════
export function RagScreen() {
  const { version, t, lang, setLang } = useKapsul();
  const k = KAPSUL_THEME[version];
  const isV2 = version === 'v2';
  const [dragOver, setDragOver] = useState(false);

  const corpus = [
    { name: t.corpus1, status: 'synced', size: '1.2 GB', count: '8 421' },
    { name: t.corpus2, status: 'processing', size: '4.5 GB', count: '32 104' },
    { name: t.corpus3, status: 'synced', size: '250 MB', count: '1 287' },
  ];

  return (
    <div data-screen-label="07 RAG" style={{
      flex: 1, background: k.bg, color: k.text, fontFamily: k.fontUI,
      overflowY: 'auto', minWidth: 0,
    }}>
      <div style={{ padding: isV2 ? '36px 40px 56px' : '32px 40px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
          <div style={{ flex: 1 }}>
            {isV2 ? (
              <>
                <div style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 500,
                  letterSpacing: '0.18em', color: k.textMuted, textTransform: 'uppercase', marginBottom: 10,
                }}>{t.ragTitle}</div>
                <h1 style={{
                  margin: 0, fontFamily: '"Playfair Display", Georgia, serif',
                  fontStyle: 'italic', fontSize: 36, fontWeight: 500,
                  letterSpacing: -0.5, color: k.text, lineHeight: 1.15, marginBottom: 6,
                }}>{lang === 'fr' ? 'La mémoire de votre institution.' : 'Your institutional memory.'}</h1>
                <p style={{ margin: 0, fontSize: 14, color: k.textMuted }}>{t.ragSub}</p>
              </>
            ) : (
              <>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: -0.4 }}>{t.ragTitle}</h1>
                <p style={{ margin: 0, marginTop: 4, fontSize: 14, color: k.textMuted }}>{t.ragSub}</p>
              </>
            )}
          </div>
          <PrivacyBadge v={version} t={t}/>
          {!isV2 && <LangToggle v={version} lang={lang} setLang={setLang}/>}
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); }}
          style={{
            padding: '40px 24px', minHeight: 220,
            background: isV2
              ? (dragOver ? 'rgba(124,58,237,0.08)' : k.surface)
              : (dragOver ? '#EFF6FF' : '#F8FAFC'),
            border: `2px dashed ${dragOver ? k.primary : (isV2 ? k.border : '#BFDBFE')}`,
            borderRadius: k.radius.card,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10,
            marginBottom: 32, transition: 'all 0.15s',
          }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: isV2 ? 6 : 14,
            background: isV2 ? 'rgba(124,58,237,0.12)' : '#DBEAFE',
            color: k.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Ic.Download size={26} sw={1.7}/></div>
          <div style={{
            fontSize: isV2 ? 20 : 18, fontWeight: 600, color: k.text,
            fontFamily: isV2 ? '"Space Grotesk", sans-serif' : 'inherit',
          }}>{t.dropCorpus}</div>
          <div style={{
            fontSize: 13, color: k.textMuted, textAlign: 'center', maxWidth: 540, lineHeight: 1.55,
          }}>{t.dropCorpusSub}</div>
          <button style={{
            marginTop: 8, padding: '10px 18px', height: 40,
            background: isV2 ? k.surfaceAlt : '#0F172A',
            color: isV2 ? k.text : '#fff',
            border: isV2 ? `1px solid ${k.border}` : 'none',
            borderRadius: isV2 ? 4 : 8, fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{t.browseFiles}</button>
        </div>

        {/* Corpus list */}
        <div style={{
          fontSize: isV2 ? 11 : 14,
          fontWeight: isV2 ? 500 : 600,
          letterSpacing: isV2 ? '0.14em' : 0,
          textTransform: isV2 ? 'uppercase' : 'none',
          color: isV2 ? k.textMuted : k.text,
          fontFamily: isV2 ? '"JetBrains Mono", monospace' : 'inherit',
          marginBottom: 12,
        }}>{t.activeCorpus}</div>

        <div style={cardStyle(k, isV2)}>
          {corpus.map((c, i) => (
            <div key={c.name} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 20px',
              borderBottom: i < corpus.length - 1 ? `1px solid ${k.border}` : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: isV2 ? 4 : 8,
                background: isV2 ? 'rgba(124,58,237,0.12)' : '#EFF6FF',
                color: k.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}><Ic.Database size={17} sw={1.6}/></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: k.text,
                  fontFamily: isV2 ? '"Space Grotesk", sans-serif' : 'inherit',
                }}>{c.name}</div>
                <div style={{
                  fontSize: 12, color: k.textFaint, marginTop: 2,
                  fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.04em',
                }}>{c.count} {lang === 'fr' ? 'documents vectorisés' : 'vectorised documents'}</div>
              </div>
              <Badge v={version} tone={c.status === 'synced' ? 'success' : 'warning'}>
                {c.status === 'synced'
                  ? <><span style={{ width: 6, height: 6, borderRadius: '50%', background: isV2 ? '#34D399' : '#16A34A' }}/>{t.syncedSise}</>
                  : <><span style={{ width: 6, height: 6, borderRadius: '50%', background: isV2 ? '#FBBF24' : '#EA580C', animation: 'kapsulPulse 1.4s infinite' }}/>{t.etlProcess}</>
                }
              </Badge>
              <div style={{
                fontSize: 13, color: k.textMuted, width: 70, textAlign: 'right',
                fontFamily: '"JetBrains Mono", monospace',
              }}>{c.size}</div>
              <button style={{
                width: 28, height: 28, background: 'transparent', border: 'none',
                borderRadius: 4, color: k.textMuted, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Ic.More size={16}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// PLACEHOLDER (for screens not built — Settings, etc.)
// ═══════════════════════════════════════════════════════════
export function PlaceholderScreen({ label }) {
  const { version, lang } = useKapsul();
  const k = KAPSUL_THEME[version];
  return (
    <div style={{
      flex: 1, background: k.bg, color: k.textMuted, fontFamily: k.fontUI,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 12, minWidth: 0,
    }}>
      <div style={{ fontSize: 40, opacity: 0.5 }}>◯</div>
      <div style={{
        fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase',
        fontFamily: '"JetBrains Mono", monospace',
      }}>{label}</div>
      <div style={{ fontSize: 13 }}>
        {lang === 'fr' ? 'Écran prévu — non maquetté dans cette version.' : 'Screen planned — not mocked in this version.'}
      </div>
    </div>
  );
};
