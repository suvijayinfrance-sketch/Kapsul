import { useRef, useState } from 'react';
import { KapsulIcons as Ic } from '../icons.jsx';

const ACCEPT = '.pdf,.docx,.pptx,.txt';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const typeColor = { pdf: '#7C3AED', docx: '#10B981', pptx: '#F59E0B', txt: '#8888AA' };

function StepIndicator({ k, fr }) {
  const steps = fr ? ['① Déposer', '② Analyser', '③ Chat'] : ['① Upload', '② Analyze', '③ Chat'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <span key={s}>
          <span style={{ color: i === 0 ? k.primary : k.textFaint, fontWeight: i === 0 ? 600 : 400 }}>{s}</span>
          {i < steps.length - 1 && <span style={{ margin: '0 8px', color: k.textFaint }}>→</span>}
        </span>
      ))}
    </div>
  );
}

export function FileDropzone({ k, isV2, files, onFilesChange, lang }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const fr = lang === 'fr';

  const addFiles = (list) => {
    const next = [...files];
    for (const f of list) {
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'docx', 'pptx', 'txt'].includes(ext || '')) continue;
      if (next.length >= 10) break;
      if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f);
    }
    onFilesChange(next);
  };

  return (
    <div>
      <StepIndicator k={k} fr={fr} />
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        style={{
          marginTop: 24, padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
          borderRadius: isV2 ? 8 : 12,
          border: `2px dashed ${dragOver ? k.primary : k.border}`,
          background: dragOver ? (isV2 ? 'rgba(124,58,237,0.08)' : '#EFF6FF') : (isV2 ? k.surface : '#fff'),
          transition: 'all 0.15s',
        }}
      >
        <input ref={inputRef} type="file" accept={ACCEPT} multiple style={{ display: 'none' }}
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
        <div style={{
          width: 56, height: 56, margin: '0 auto 16px', borderRadius: 8,
          background: isV2 ? 'rgba(124,58,237,0.12)' : '#EFF6FF', color: k.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Ic.Upload size={28} sw={1.7} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: k.text, marginBottom: 6 }}>
          {fr ? 'Glissez vos fichiers ici' : 'Drop your files here'}
        </div>
        <span style={{ fontSize: 14, color: k.textMuted }}>
          {fr ? 'ou ' : 'or '}
          <span style={{ color: k.primary, textDecoration: 'underline' }}>
            {fr ? 'Parcourir les fichiers' : 'Browse files'}
          </span>
        </span>
        <div style={{ fontSize: 12, color: k.textFaint, marginTop: 12 }}>
          PDF, DOCX, PPTX, TXT — {fr ? "jusqu'à 10 fichiers" : 'up to 10 files'}
        </div>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {files.map((f, i) => {
            const ext = f.name.split('.').pop()?.toLowerCase() || 'txt';
            return (
              <div key={`${f.name}-${i}`} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                background: isV2 ? k.surface : '#fff', border: `1px solid ${k.border}`,
                borderRadius: isV2 ? 6 : 8,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 6,
                  background: `${typeColor[ext] || '#888'}22`, color: typeColor[ext],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace',
                }}>{ext.toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: k.textFaint }}>{formatSize(f.size)}</div>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); onFilesChange(files.filter((_, j) => j !== i)); }}
                  style={{ background: 'none', border: 'none', color: k.textMuted, cursor: 'pointer', fontSize: 20 }}>×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
