/**
 * DocumentCard — shows storage state for one uploaded document
 */
import { useEffect, useState } from 'react';

const STATE_CONFIG = {
  uploading:   { label: 'Uploading',         color: '#F59E0B', icon: '⬆', pulse: true  },
  extracting:  { label: 'Extracting text',   color: '#F59E0B', icon: '📄', pulse: true  },
  chunking:    { label: 'Chunking',          color: '#3B82F6', icon: '✂',  pulse: true  },
  embedding:   { label: 'Indexing for RAG',  color: '#3B82F6', icon: '🧠', pulse: true  },
  syncing:     { label: 'Saving to cloud',   color: '#06B6D4', icon: '☁',  pulse: true  },
  ready:       { label: 'Ready',             color: '#10B981', icon: '✓',  pulse: false },
  error:       { label: 'Error',             color: '#EF4444', icon: '✕',  pulse: false },
};

export function DocumentCard({
  filename, state = 'uploading', chunkCount = 0, wordCount = 0,
  errorMsg = '', compact = false, isV2 = true,
}) {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.ready;
  const ext = filename?.split('.').pop()?.toUpperCase() || 'FILE';

  const [opacity, setOpacity] = useState(1);
  useEffect(() => {
    if (!cfg.pulse) { setOpacity(1); return undefined; }
    const interval = setInterval(() => {
      setOpacity((prev) => (prev === 1 ? 0.5 : 1));
    }, 700);
    return () => clearInterval(interval);
  }, [cfg.pulse]);

  const rowBg = isV2 ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)';
  const rowBorder = isV2 ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)';
  const nameColor = isV2 ? '#D1D5DB' : '#334155';
  const mutedColor = isV2 ? '#6B7280' : '#64748B';
  const titleColor = isV2 ? '#E5E7EB' : '#0F172A';

  if (compact) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 10px', borderRadius: 6,
        background: rowBg,
        border: `1px solid ${rowBorder}`,
      }}>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '2px 5px',
          borderRadius: 3, background: 'rgba(124,58,237,0.2)',
          color: '#A78BFA', flexShrink: 0,
        }}>{ext}</span>
        <span style={{
          flex: 1, fontSize: 11.5, color: nameColor,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{filename}</span>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 8px',
          borderRadius: 999, flexShrink: 0,
          background: `${cfg.color}20`,
          color: cfg.color,
          opacity: cfg.pulse ? opacity : 1,
          transition: 'opacity 0.3s',
        }}>
          {cfg.icon} {cfg.label}
        </span>
        {state === 'ready' && chunkCount > 0 && (
          <span style={{ fontSize: 10, color: mutedColor, flexShrink: 0 }}>
            {chunkCount} chunks
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{
      padding: '12px 14px', borderRadius: 8,
      background: isV2 ? 'rgba(255,255,255,0.03)' : 'rgba(248,250,252,0.9)',
      border: `1px solid ${state === 'ready' ? 'rgba(16,185,129,0.3)' :
        state === 'error' ? 'rgba(239,68,68,0.3)' :
        rowBorder}`,
      transition: 'border-color 0.4s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: cfg.color,
          opacity: cfg.pulse ? opacity : 1,
          transition: 'opacity 0.3s',
          flexShrink: 0,
          boxShadow: state === 'ready' ? `0 0 8px ${cfg.color}60` : 'none',
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12.5, fontWeight: 600, color: titleColor,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{filename}</div>
          <div style={{ fontSize: 10.5, color: mutedColor, marginTop: 2 }}>
            {state === 'ready'
              ? `${chunkCount} chunks indexed${wordCount ? ` · ${wordCount.toLocaleString()} words` : ''}`
              : state === 'error' ? errorMsg || 'Processing failed'
              : `${cfg.label}...`}
          </div>
        </div>
        <span style={{
          fontSize: 16,
          opacity: cfg.pulse ? opacity : 1,
          transition: 'opacity 0.3s',
        }}>{cfg.icon}</span>
      </div>
      {state !== 'ready' && state !== 'error' && (
        <div style={{
          marginTop: 8, height: 2, borderRadius: 1,
          background: isV2 ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${cfg.color}40, ${cfg.color})`,
            borderRadius: 1,
            animation: 'kapsul-slide 1.5s ease-in-out infinite',
            width: '40%',
          }} />
        </div>
      )}
    </div>
  );
}
