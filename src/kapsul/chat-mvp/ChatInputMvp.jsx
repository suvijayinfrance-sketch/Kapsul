import { useRef, useState } from 'react';
import { KapsulIcons as Ic } from '../icons.jsx';
import { Badge } from '../screens-auth.jsx';

const ACCEPT = '.pdf,.docx,.pptx,.txt';

export function ChatInputMvp({
  k, isV2, v, placeholder, onSend, onAddFiles, disabled, lang, attachDisabled,
}) {
  const [text, setText] = useState('');
  const fileRef = useRef(null);

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
