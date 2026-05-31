import React from 'react';

const MODE_COLORS = {
  explication: '#2563EB',
  socratique: '#7C3AED',
  entrainement: '#F97316',
  verification: '#22C55E',
  revision: '#6D28D9',
};

const SCHEMA_SECTION_COLORS = {
  'Réponse courte': '#64748B',
  Explication: '#2563EB',
  Exemple: '#F97316',
  'Mini-question': '#22C55E',
  Sources: '#06B6D4',
};

const KAPSUL_CARD_STYLE = {
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
  borderRadius: 16,
};

const SCHEMA_HEADER_RE = /\*\*(Réponse courte|Explication|Exemple|Mini-question|Sources)\*\*/g;

function TypingDots({ color }) {
  return (
    <span style={{ display: 'inline-flex', gap: 5, marginLeft: 4, verticalAlign: 'middle' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="kapsul-mvp-typing-dot"
          style={{
            width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block',
          }}
        />
      ))}
    </span>
  );
}

function renderColoredContent(content) {
  if (!content) return null;
  const parts = content.split(SCHEMA_HEADER_RE);
  return parts.map((part, i) => {
    const color = SCHEMA_SECTION_COLORS[part];
    if (color) {
      return (
        <span key={i} style={{ color, fontWeight: 700 }}>
          {part}
        </span>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function highestSourceScore(sources) {
  if (!sources?.length) return null;
  return sources.reduce((max, s) => {
    if (s.score == null) return max;
    return max == null ? s.score : Math.max(max, s.score);
  }, null);
}

function CitationBlock({ sources, isV2 }) {
  const [expanded, setExpanded] = React.useState(null);

  const toggle = (i) => setExpanded(expanded === i ? null : i);

  const pillBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  };

  const getScore = (score) => {
    if (!score) return null;
    if (score >= 0.85) return { label: 'Strong match', color: '#16A34A' };
    if (score >= 0.70) return { label: 'Good match', color: '#2563EB' };
    return { label: 'Partial match', color: '#F97316' };
  };

  return (
    <div style={{
      marginTop: 12,
      paddingTop: 10,
      borderTop: `1px solid ${isV2 ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
    }}>
      <div style={{
        fontSize: 10,
        color: isV2 ? '#6B7280' : '#94A3B8',
        marginBottom: 6,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        Sources used to answer
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {sources.map((s, i) => {
          const isActive = expanded === i;
          return (
            <button
              key={`${s.doc}-${s.chunk}-${i}`}
              type="button"
              onClick={() => toggle(i)}
              style={{
                ...pillBase,
                background: isActive
                  ? (isV2 ? 'rgba(124,58,237,0.25)' : '#DBEAFE')
                  : (isV2 ? 'rgba(124,58,237,0.12)' : '#EFF6FF'),
                color: isV2 ? '#A78BFA' : '#2563EB',
                borderColor: isActive
                  ? (isV2 ? '#7C3AED' : '#2563EB')
                  : 'transparent',
              }}
            >
              <span style={{ fontSize: 12 }}>📄</span>
              {s.doc} · chunk {s.chunk}
              {s.score != null && (
                <span style={{
                  fontSize: 9,
                  padding: '1px 5px',
                  borderRadius: 999,
                  background: isV2 ? 'rgba(255,255,255,0.1)' : 'rgba(37,99,235,0.1)',
                  marginLeft: 2,
                }}>
                  {Math.round(s.score * 100)}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {expanded !== null && sources[expanded] && (
        <div
          key={`cite-detail-${expanded}`}
          style={{
            marginTop: 8,
            padding: '10px 12px',
            borderRadius: 6,
            background: isV2 ? 'rgba(0,0,0,0.3)' : '#F8FAFC',
            border: `1px solid ${isV2 ? 'rgba(124,58,237,0.3)' : '#BFDBFE'}`,
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
          }}>
            <span style={{ fontSize: 10, color: isV2 ? '#A78BFA' : '#2563EB', fontWeight: 600 }}>
              {sources[expanded].doc} · chunk {sources[expanded].chunk}
              {sources[expanded].words ? ` · ${sources[expanded].words} words` : ''}
            </span>
            {sources[expanded].score != null && (() => {
              const si = getScore(sources[expanded].score);
              return (
                <span style={{ fontSize: 10, color: si.color, fontWeight: 600 }}>
                  {si.label} ({Math.round(sources[expanded].score * 100)}% similarity)
                </span>
              );
            })()}
          </div>
          <div style={{
            fontSize: 11,
            fontFamily: 'monospace',
            color: isV2 ? '#D1D5DB' : '#374151',
            lineHeight: 1.6,
            maxHeight: 120,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {sources[expanded].text}
            {sources[expanded].text && sources[expanded].text.length >= 300 && (
              <span style={{ color: isV2 ? '#6B7280' : '#94A3B8' }}> [...]</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AssistantBody({ content, streaming, textColor }) {
  const waiting = streaming && !content;
  return (
    <div
      className="kapsul-mvp-md"
      style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: waiting ? '1.5em' : undefined }}
    >
      {waiting ? (
        <TypingDots color={textColor} />
      ) : (
        <>
          {content ? renderColoredContent(content) : (
            <span style={{ fontStyle: 'italic', opacity: 0.7 }}>(No response text)</span>
          )}
          {streaming && content ? <span className="kapsul-mvp-cursor"> ▋</span> : null}
        </>
      )}
    </div>
  );
}

export function ChatMessage({ k, isV2, msg, streaming, lang = 'fr' }) {
  const user = msg.role === 'user';
  const fr = lang === 'fr';
  const showCitations = !streaming && msg.role === 'assistant' && msg.sources?.length > 0;
  const maxScore = highestSourceScore(msg.sources);
  const modeColor = msg.mode ? MODE_COLORS[msg.mode] : null;

  const assistantBubbleStyle = user
    ? {
        padding: '12px 16px',
        background: k.primary,
        color: '#fff',
        borderRadius: isV2 ? 4 : 14,
        borderTopLeftRadius: isV2 ? 4 : 14,
        fontSize: 14,
        lineHeight: 1.55,
        border: 'none',
      }
    : {
        padding: '12px 16px',
        ...(isV2
          ? {
              background: k.surfaceAlt,
              color: k.text,
              borderRadius: 4,
              borderTopLeftRadius: 4,
              border: `1px solid ${k.border}`,
            }
          : {
              ...KAPSUL_CARD_STYLE,
              ...(modeColor ? { border: `1px solid ${modeColor}` } : {}),
              color: k.text,
              borderTopLeftRadius: 4,
            }),
        fontSize: 15,
        lineHeight: 1.55,
      };

  return (
    <div
      className={!user ? 'kapsul-assistant-msg' : undefined}
      style={{
        display: 'flex',
        justifyContent: user ? 'flex-end' : 'flex-start',
        marginBottom: 16,
        alignItems: 'flex-start',
      }}
    >
      {!user && (
        <div style={{
          width: 32, height: 32, marginRight: 10, flexShrink: 0,
          borderRadius: isV2 ? 6 : '50%',
          background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 13,
        }}>K</div>
      )}
      <div style={{ maxWidth: user ? '75%' : '85%' }}>
        <div style={assistantBubbleStyle}>
          {msg.role === 'assistant' && msg.content && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              paddingBottom: 8,
              borderBottom: '1px solid #F1F5F9',
              fontSize: 11,
              color: '#94A3B8',
              fontWeight: 500,
            }}>
              <span style={{ color: '#22C55E', fontWeight: 600 }}>
                Confiance {maxScore != null
                  ? `${Math.round(maxScore * 100)}%`
                  : '—'}
              </span>
              <span>·</span>
              <span>
                Couverture {msg.sources?.length > 0
                  ? `${msg.sources.length}/5`
                  : '—'}
              </span>
              <span>·</span>
              <span>L3</span>
              <span>·</span>
              <span>
                {Math.max(1, Math.ceil(msg.content.split(' ').length / 200))} min
              </span>
              {msg.mode && MODE_COLORS[msg.mode] && (
                <>
                  <span>·</span>
                  <span style={{
                    color: MODE_COLORS[msg.mode],
                    fontWeight: 600,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {msg.mode}
                  </span>
                </>
              )}
            </div>
          )}
          {user ? (
            msg.content
          ) : (
            <AssistantBody content={msg.content} streaming={streaming} textColor={k.textMuted} />
          )}
          {showCitations && (
            <CitationBlock sources={msg.sources} isV2={isV2} />
          )}
          {msg.role === 'assistant' && msg.content && !streaming && (
            <div style={{
              display: 'flex',
              gap: 6,
              marginTop: 10,
              flexWrap: 'wrap',
            }}>
              {[
                { label: 'Ajouter au document', color: '#2563EB', bg: '#EFF6FF' },
                { label: 'Créer flashcard', color: '#6D28D9', bg: '#F5F3FF' },
                { label: 'Me tester', color: '#22C55E', bg: '#F0FDF4' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => console.log(`${btn.label} clicked`)}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: 999,
                    border: `1px solid ${btn.color}30`,
                    background: btn.bg,
                    color: btn.color,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
          {msg.role === 'assistant' && msg.content.includes('🃏 RECTO') && (
            <div style={{
              marginTop: 10,
              padding: '10px 14px',
              borderRadius: 8,
              background: isV2 ? 'rgba(109,40,217,0.1)' : '#F5F3FF',
              border: `1px solid ${isV2 ? 'rgba(109,40,217,0.3)' : '#DDD6FE'}`,
              fontSize: 12,
              color: isV2 ? '#C4B5FD' : '#6D28D9',
              fontWeight: 600,
            }}>
              🃏 {fr ? 'Mode Révision actif — répondez pour voir le verso' : 'Revision mode active — answer to reveal the back'}
            </div>
          )}
        </div>
        {!user && !streaming && (
          <div style={{
            marginTop: 4, fontSize: 10, color: k.textFaint,
            fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.06em',
          }}>mistral-small</div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator({ k, isV2 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 6,
        background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: 13,
      }}>K</div>
      <div style={{
        padding: '12px 16px',
        ...(isV2
          ? { background: k.surfaceAlt, border: `1px solid ${k.border}`, borderRadius: 4 }
          : { ...KAPSUL_CARD_STYLE }),
        display: 'flex', gap: 6,
      }}>
        <TypingDots color={k.textMuted} />
      </div>
    </div>
  );
}
