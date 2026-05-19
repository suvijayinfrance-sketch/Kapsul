import ReactMarkdown from 'react-markdown';
import { KapsulIcons as Ic } from '../icons.jsx';

export function MasterMDPreview({ k, isV2, masterMD, onClose, mobile, lang = 'fr' }) {
  const fr = lang === 'fr';

  const copy = () => {
    navigator.clipboard.writeText(masterMD).catch(() => {});
  };

  return (
    <div style={{
      width: mobile ? '100%' : 420,
      flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      background: isV2 ? k.surface : '#F8FAFC',
      borderLeft: mobile ? 'none' : `1px solid ${k.border}`,
      minHeight: 0,
      ...(mobile ? {
        position: 'absolute', inset: 0, zIndex: 20,
      } : {}),
    }}>
      <div style={{
        padding: '14px 16px', borderBottom: `1px solid ${k.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: k.text }}>
          {fr ? 'Référence Maître' : 'Master Reference'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={copy} style={{
            background: 'none', border: 'none', color: k.textMuted, cursor: 'pointer',
            fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Ic.Copy size={14} /> {fr ? 'Copier' : 'Copy'}
          </button>
          {mobile && (
            <button type="button" onClick={onClose} style={{
              background: 'none', border: 'none', color: k.text, cursor: 'pointer', fontSize: 20,
            }}>×</button>
          )}
        </div>
      </div>
      <div
        className="kapsul-mvp-md"
        style={{
          flex: 1, overflowY: 'auto', padding: 16,
          '--mvp-border': k.border,
        }}
      >
        <ReactMarkdown>{masterMD}</ReactMarkdown>
      </div>
    </div>
  );
}
