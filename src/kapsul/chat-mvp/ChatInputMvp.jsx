import { useRef, useState } from 'react';
import { KapsulIcons as Ic } from '../icons.jsx';
import { Badge } from '../screens-auth.jsx';

const ACCEPT = '.pdf,.docx,.pptx,.txt';

export function ChatInputMvp({
  k, isV2, v, placeholder, onSend, onAddFiles, disabled, lang, attachDisabled,
  enabledSources = [], onSourceToggle,
}) {
  const [text, setText] = useState('');
  const fileRef = useRef(null);
  const fr = lang === 'fr';

  const DATA_SOURCES = [
    { id: 'entreprises', label: 'Entreprises FR', emoji: '🏢', group: 'french', color: '#003F7D' },
    { id: 'bodacc', label: 'BODACC', emoji: '📋', group: 'french', color: '#003F7D' },
    { id: 'worldbank', label: 'World Bank', emoji: '🌍', group: 'economic', color: '#2563EB' },
    { id: 'eurostat', label: 'Eurostat', emoji: '🇪🇺', group: 'economic', color: '#2563EB' },
    { id: 'oecd', label: 'OECD', emoji: '📊', group: 'economic', color: '#2563EB' },
  ];

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const onFilePick = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (picked.length && onAddFiles) onAddFiles(picked);
  };

  const attachBusy = disabled || attachDisabled;

  return (
    <div style={{
      padding: isV2 ? '12px 20px 20px' : '16px 24px',
      borderTop: `1px solid ${k.border}`,
      background: isV2 ? k.bg : '#fff',
      flexShrink: 0,
    }}>
      <div style={{
        background: isV2 ? k.surface : '#fff',
        border: `1px solid ${k.border}`,
        borderRadius: isV2 ? 8 : 16,
        boxShadow: isV2 ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        {isV2 && (
          <div style={{ display: 'flex', gap: 8, padding: '10px 14px 0', borderBottom: `1px solid ${k.border}` }}>
            <Badge v={v} tone="primary" mono>{lang === 'fr' ? 'GÉNÉRATIF' : 'GENERATIVE'}</Badge>
            <Badge v={v} tone="default" mono>RAG INFO</Badge>
            <Badge v={v} tone="cyan" mono>SMART</Badge>
          </div>
        )}

        {/* Data Source Tickers */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 16px 4px',
          borderBottom: `1px solid ${k.border}`,
          flexWrap: 'wrap',
          background: isV2 ? 'rgba(0,0,0,0.15)' : '#F8FAFC',
        }}>
          <span style={{
            fontSize: 10, fontWeight: 600, color: k.textMuted,
            textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 4,
            whiteSpace: 'nowrap',
          }}>
            {fr ? 'Sources :' : 'Sources:'}
          </span>

          <span style={{ fontSize: 9, color: isV2 ? k.textMuted : '#94A3B8', fontWeight: 500 }}>
            {fr ? 'Données FR' : 'French Data'}
          </span>
          {DATA_SOURCES.filter((s) => s.group === 'french').map((source) => {
            const active = enabledSources.includes(source.id);
            return (
              <button
                key={source.id}
                type="button"
                onClick={() => onSourceToggle?.(source.id)}
                title={active ? `Désactiver ${source.label}` : `Activer ${source.label}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                  border: `1.5px solid ${active ? source.color : k.border}`,
                  background: active
                    ? (isV2 ? 'rgba(0,63,125,0.25)' : '#EFF6FF')
                    : (isV2 ? 'rgba(255,255,255,0.04)' : '#FFFFFF'),
                  color: active ? source.color : (isV2 ? k.textMuted : '#64748B'),
                }}
              >
                <span style={{ fontSize: 12 }}>{source.emoji}</span>
                {source.label}
                {active && (
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: source.color, display: 'inline-block', marginLeft: 2,
                  }} />
                )}
              </button>
            );
          })}

          <span style={{ color: k.border, fontSize: 14 }}>|</span>

          <span style={{ fontSize: 9, color: isV2 ? k.textMuted : '#94A3B8', fontWeight: 500 }}>
            {fr ? 'Données Éco' : 'Economic Data'}
          </span>
          {DATA_SOURCES.filter((s) => s.group === 'economic').map((source) => {
            const active = enabledSources.includes(source.id);
            return (
              <button
                key={source.id}
                type="button"
                onClick={() => onSourceToggle?.(source.id)}
                title={active ? `Désactiver ${source.label}` : `Activer ${source.label}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                  border: `1.5px solid ${active ? source.color : k.border}`,
                  background: active
                    ? (isV2 ? 'rgba(37,99,235,0.2)' : '#EFF6FF')
                    : (isV2 ? 'rgba(255,255,255,0.04)' : '#FFFFFF'),
                  color: active ? source.color : (isV2 ? k.textMuted : '#64748B'),
                }}
              >
                <span style={{ fontSize: 12 }}>{source.emoji}</span>
                {source.label}
                {active && (
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: source.color, display: 'inline-block', marginLeft: 2,
                  }} />
                )}
              </button>
            );
          })}

          {enabledSources.length > 0 && (
            <span style={{
              marginLeft: 'auto',
              fontSize: 10,
              color: '#16A34A',
              fontWeight: 600,
            }}>
              {enabledSources.length} {fr ? 'active(s)' : 'active'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '10px 12px' }}>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            multiple
            style={{ display: 'none' }}
            onChange={onFilePick}
          />
          <button
            type="button"
            onClick={() => !attachBusy && fileRef.current?.click()}
            disabled={attachBusy || !onAddFiles}
            title={lang === 'fr' ? 'Ajouter des fichiers' : 'Add files'}
            style={{
              width: 36, height: 36, border: `1px solid ${k.border}`, borderRadius: 6,
              background: attachBusy ? 'transparent' : (isV2 ? k.surfaceAlt : '#F8FAFC'),
              color: attachBusy ? k.textFaint : k.primary,
              opacity: attachBusy ? 0.45 : 1,
              cursor: attachBusy || !onAddFiles ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
            aria-label={lang === 'fr' ? 'Ajouter des fichiers' : 'Add files'}
          >
            <Ic.Plus size={18} sw={1.8} />
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            style={{
              flex: 1, resize: 'none', border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'inherit', fontSize: 15, color: k.text, lineHeight: 1.45, minHeight: 24,
              opacity: disabled ? 0.6 : 1,
            }}
          />
          <button type="button" onClick={send} disabled={disabled || !text.trim()} style={{
            width: 40, height: 40, borderRadius: isV2 ? 6 : 8, border: 'none',
            background: disabled || !text.trim() ? k.border : k.primary,
            color: '#fff', cursor: disabled || !text.trim() ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Ic.Send size={17} sw={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
