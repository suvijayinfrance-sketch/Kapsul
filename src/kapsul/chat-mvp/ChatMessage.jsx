import React from 'react';

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

/** Stable assistant body — no ReactMarkdown (incompatible with React 19 streaming updates). */
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
          {content || (
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

  return (
    <div style={{
      display: 'flex', justifyContent: user ? 'flex-end' : 'flex-start',
      marginBottom: 16, alignItems: 'flex-start',
    }}>
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
        <div style={{
          padding: '12px 16px',
          background: user ? k.primary : (isV2 ? k.surfaceAlt : '#F1F5F9'),
          color: user ? '#fff' : k.text,
          borderRadius: isV2 ? 4 : 14,
          borderTopLeftRadius: user ? (isV2 ? 4 : 14) : 4,
          fontSize: 14, lineHeight: 1.55,
          border: !user && isV2 ? `1px solid ${k.border}` : 'none',
        }}>
          {user ? (
            msg.content
          ) : (
            <AssistantBody content={msg.content} streaming={streaming} textColor={k.textMuted} />
          )}
          {showCitations && (
            <CitationBlock sources={msg.sources} isV2={isV2} />
          )}
          {msg.role === 'assistant' && msg.content.includes('🃏 RECTO') && (
            <div style={{
              marginTop: 10,
              padding: '10px 14px',
              borderRadius: 8,
              background: isV2 ? 'rgba(220,38,38,0.1)' : '#FEF2F2',
              border: `1px solid ${isV2 ? 'rgba(220,38,38,0.3)' : '#FECACA'}`,
              fontSize: 12,
              color: isV2 ? '#FCA5A5' : '#DC2626',
              fontWeight: 600,
            }}>
              🃏 {fr ? 'Mode Recall actif — répondez pour voir le verso' : 'Recall mode active — answer to reveal the back'}
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
        padding: '12px 16px', background: isV2 ? k.surfaceAlt : '#fff',
        border: `1px solid ${k.border}`, borderRadius: isV2 ? 4 : 14,
        display: 'flex', gap: 6,
      }}>
        <TypingDots color={k.textMuted} />
      </div>
    </div>
  );
}
