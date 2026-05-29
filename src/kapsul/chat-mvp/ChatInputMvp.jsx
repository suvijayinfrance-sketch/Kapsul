import { useRef, useState } from 'react';
import { KapsulIcons as Ic } from '../icons.jsx';

const ACCEPT = '.pdf,.docx,.pptx,.txt';

function generateShadowPills(text, currentMode, fr) {
  if (!text || text.trim().length < 3) return [];

  const t = text.toLowerCase();
  const pills = [];

  if (!t.includes('l1') && !t.includes('l2') && !t.includes('master') &&
      !t.includes('licence') && !t.includes('débutant')) {
    pills.push({ id: 'level-l1',     label: fr ? 'Niveau L1'     : 'Level L1',     type: 'level'   });
    pills.push({ id: 'level-master', label: fr ? 'Niveau Master' : 'Master level', type: 'level'   });
  }

  if (t.includes('expli') || t.includes('résume') || t.includes('defin') ||
      t.includes('explain') || t.includes('summar')) {
    pills.push({ id: 'time-5',  label: fr ? 'En 5 minutes'  : 'In 5 minutes',  type: 'time' });
    pills.push({ id: 'time-2',  label: fr ? 'En 2 minutes'  : 'In 2 minutes',  type: 'time' });
  }

  if ((t.includes('exercice') || t.includes('quiz') || t.includes('test') ||
       t.includes('pratique') || t.includes('practice')) && currentMode !== 'verificateur') {
    pills.push({ id: 'mode-verif', label: fr ? 'Mode Vérificateur' : 'Checker mode', type: 'mode', targetMode: 'verificateur' });
  }
  if ((t.includes('révise') || t.includes('flashcard') || t.includes('recall') ||
       t.includes('mémoris') || t.includes('memori')) && currentMode !== 'recall') {
    pills.push({ id: 'mode-recall', label: fr ? 'Mode Recall' : 'Recall mode', type: 'mode', targetMode: 'recall' });
  }
  if ((t.includes('comprend') || t.includes('understand') || t.includes('confused') ||
       t.includes('perdu') || t.includes('lost')) && currentMode !== 'socratique') {
    pills.push({ id: 'mode-socrate', label: fr ? 'Mode Socratique' : 'Socratic mode', type: 'mode', targetMode: 'socratique' });
  }

  if (t.includes('expli') || t.includes('explain') || t.includes('comment') || t.includes('pourquoi')) {
    pills.push({ id: 'detail-simple',  label: fr ? 'En termes simples'  : 'In simple terms',  type: 'detail' });
    pills.push({ id: 'detail-exemple', label: fr ? 'Avec un exemple'    : 'With an example',  type: 'detail' });
  }

  return pills.slice(0, 4);
}

export function ChatInputMvp({
  k, isV2, v, placeholder, onSend, onAddFiles, disabled, lang, attachDisabled,
  enabledSources = [], onSourceToggle,
  activeMode = 'tuteur', onModeChange = () => {},
}) {
  const [inputValue, setInputValue] = useState('');
  const [shadowPills, setShadowPills] = useState([]);
  const fileRef = useRef(null);
  const fr = lang === 'fr';

  const LEARNING_MODES = [
    {
      id: 'tuteur',
      label: 'Tuteur',
      labelEn: 'Tutor',
      icon: '📖',
      desc: fr ? 'Explique pas à pas' : 'Step-by-step explanation',
      color: '#2563EB',
      bg: '#EFF6FF',
      bgActive: '#2563EB',
    },
    {
      id: 'socratique',
      label: 'Socratique',
      labelEn: 'Socratic',
      icon: '🤔',
      desc: fr ? 'Guide par des questions' : 'Guides with questions',
      color: '#7C3AED',
      bg: '#F5F3FF',
      bgActive: '#7C3AED',
    },
    {
      id: 'coach',
      label: 'Coach',
      labelEn: 'Coach',
      icon: '🎯',
      desc: fr ? 'Motive et structure' : 'Motivates and structures',
      color: '#059669',
      bg: '#ECFDF5',
      bgActive: '#059669',
    },
    {
      id: 'verificateur',
      label: 'Vérificateur',
      labelEn: 'Checker',
      icon: '✅',
      desc: fr ? 'Teste et évalue' : 'Tests and grades',
      color: '#D97706',
      bg: '#FFFBEB',
      bgActive: '#D97706',
    },
    {
      id: 'recall',
      label: 'Recall',
      labelEn: 'Recall',
      icon: '🃏',
      desc: fr ? 'Flashcards de révision' : 'Spaced repetition cards',
      color: '#DC2626',
      bg: '#FEF2F2',
      bgActive: '#DC2626',
    },
  ];

  const DATA_SOURCES = [
    { id: 'entreprises', label: 'Entreprises FR', emoji: '🏢', group: 'french', color: '#003F7D' },
    { id: 'bodacc', label: 'BODACC', emoji: '📋', group: 'french', color: '#003F7D' },
    { id: 'worldbank', label: 'World Bank', emoji: '🌍', group: 'economic', color: '#2563EB' },
    { id: 'eurostat', label: 'Eurostat', emoji: '🇪🇺', group: 'economic', color: '#2563EB' },
    { id: 'oecd', label: 'OECD', emoji: '📊', group: 'economic', color: '#2563EB' },
  ];

  const handlePillClick = (pill) => {
    if (pill.type === 'mode' && pill.targetMode) {
      onModeChange(pill.targetMode);
      setShadowPills((prev) => prev.filter((p) => p.id !== pill.id));
      return;
    }
    const tag = ` [${pill.label}]`;
    setInputValue((prev) => prev + tag);
    setShadowPills((prev) => prev.filter((p) => p.id !== pill.id));
  };

  const send = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInputValue('');
    setShadowPills([]);
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
        {/* Mode selector row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px 6px',
          borderBottom: `1px solid ${k.border}`,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          background: isV2 ? 'rgba(0,0,0,0.1)' : '#FAFAFA',
        }}>
          {LEARNING_MODES.map((mode) => {
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onModeChange(mode.id)}
                title={mode.desc}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 12px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  border: `1.5px solid ${isActive ? mode.color : k.border}`,
                  background: isActive
                    ? mode.bgActive
                    : (isV2 ? 'rgba(255,255,255,0.04)' : mode.bg),
                  color: isActive ? '#FFFFFF' : (isV2 ? k.textMuted : mode.color),
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 13 }}>{mode.icon}</span>
                {fr ? mode.label : mode.labelEn}
              </button>
            );
          })}
        </div>

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

        {/* Shadow coaching pills */}
        {shadowPills.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 5,
            padding: '6px 16px 2px',
            background: isV2 ? 'rgba(37,99,235,0.05)' : '#F0F7FF',
            borderBottom: `1px solid ${isV2 ? 'rgba(37,99,235,0.15)' : '#BFDBFE'}`,
          }}>
            <span style={{
              fontSize: 10, color: isV2 ? '#60A5FA' : '#2563EB',
              fontWeight: 600, alignSelf: 'center', marginRight: 2,
            }}>
              {fr ? '💡 Affiner :' : '💡 Refine:'}
            </span>
            {shadowPills.map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => handlePillClick(pill)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  border: `1px solid ${isV2 ? 'rgba(37,99,235,0.4)' : '#BFDBFE'}`,
                  background: isV2 ? 'rgba(37,99,235,0.12)' : '#EFF6FF',
                  color: isV2 ? '#60A5FA' : '#2563EB',
                  transition: 'all 0.1s',
                }}
              >
                + {pill.label}
              </button>
            ))}
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
            value={inputValue}
            onChange={(e) => {
              const val = e.target.value;
              setInputValue(val);
              setShadowPills(generateShadowPills(val, activeMode, fr));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
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
          <button type="button" onClick={send} disabled={disabled || !inputValue.trim()} style={{
            width: 40, height: 40, borderRadius: isV2 ? 6 : 8, border: 'none',
            background: disabled || !inputValue.trim() ? k.border : k.primary,
            color: '#fff', cursor: disabled || !inputValue.trim() ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Ic.Send size={17} sw={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
