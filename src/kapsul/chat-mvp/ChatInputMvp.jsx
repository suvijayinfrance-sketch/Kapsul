import { useEffect, useRef, useState } from 'react';
import { KapsulIcons as Ic } from '../icons.jsx';

const ACCEPT = '.pdf,.docx,.pptx,.txt';

export const MODE_CONFIG = {
  explication: {
    label: 'EXPLICATION',
    color: '#2563EB',
    bg: '#EFF6FF',
    desc: "Je t'explique pas à pas, avec des exemples adaptés à ton niveau",
    icon: '📘',
  },
  socratique: {
    label: 'SOCRATIQUE',
    color: '#7C3AED',
    bg: '#F5F3FF',
    desc: 'Je ne te donne pas la réponse, je te guide',
    icon: '🤔',
  },
  entrainement: {
    label: 'ENTRAÎNEMENT',
    color: '#F97316',
    bg: '#FFF7ED',
    desc: 'Je génère des exercices avec correction et difficulté progressive',
    icon: '🏋',
  },
  verification: {
    label: 'VÉRIFICATION',
    color: '#22C55E',
    bg: '#F0FDF4',
    desc: 'Mini test rapide, détection des lacunes et renvoi aux passages clés',
    icon: '✓',
  },
  revision: {
    label: 'RÉVISION',
    color: '#6D28D9',
    bg: '#F5F3FF',
    desc: 'Flashcards et rappels espacés sur ce que tu as déjà compris',
    icon: '🔁',
  },
};

const MODE_ORDER = ['explication', 'socratique', 'entrainement', 'verification', 'revision'];

function generateShadowPills(text, currentMode, fr) {
  if (!text || text.trim().length < 3) return [];

  const t = text.toLowerCase();
  const pills = [];

  if (!t.includes('[niveau l1]') && !t.includes('[niveau m1]') && !t.includes('[niveau m2]')) {
    pills.push({ id: 'level-l1', label: fr ? 'Niveau L1' : 'Level L1', type: 'append' });
    pills.push({ id: 'level-m1', label: fr ? 'Niveau M1' : 'Level M1', type: 'append' });
    pills.push({ id: 'level-m2', label: fr ? 'Niveau M2' : 'Level M2', type: 'append' });
  }

  if (currentMode !== 'socratique') {
    pills.push({
      id: 'mode-socrate',
      label: fr ? 'Mode Socratique' : 'Socratic mode',
      type: 'mode',
      targetMode: 'socratique',
    });
  }
  if (currentMode !== 'explication') {
    pills.push({
      id: 'mode-explication',
      label: fr ? 'Mode Explication' : 'Explanation mode',
      type: 'mode',
      targetMode: 'explication',
    });
  }
  if (currentMode !== 'revision') {
    pills.push({
      id: 'mode-revision',
      label: fr ? 'Mode Révision' : 'Revision mode',
      type: 'mode',
      targetMode: 'revision',
    });
  }

  if (
    t.includes('expliqu') || t.includes('expli') || t.includes('explain') ||
    t.includes('résume') || t.includes('resume') || t.includes('summar')
  ) {
    pills.push({ id: 'time-2', label: fr ? 'En 2 minutes' : 'In 2 minutes', type: 'append' });
    pills.push({ id: 'time-5', label: fr ? 'En 5 minutes' : 'In 5 minutes', type: 'append' });
    pills.push({ id: 'time-resume', label: fr ? 'Résumé rapide' : 'Quick summary', type: 'append' });
  }

  return pills;
}

export function ChatInputMvp({
  k, isV2, v, placeholder, onSend, onAddFiles, disabled, lang, attachDisabled,
  enabledSources = [], onSourceToggle,
  activeMode = 'explication', onModeChange,
}) {
  const [inputValue, setInputValue] = useState('');
  const [shadowPills, setShadowPills] = useState([]);
  const [appliedPillIds, setAppliedPillIds] = useState(new Set());
  const [selectedMode, setSelectedMode] = useState(activeMode);
  const [hoveredMode, setHoveredMode] = useState(null);
  const fileRef = useRef(null);
  const fr = lang === 'fr';

  useEffect(() => {
    setSelectedMode(activeMode);
  }, [activeMode]);

  const selectMode = (modeId) => {
    setSelectedMode(modeId);
    onModeChange?.(modeId);
  };

  const displayMode = hoveredMode || selectedMode;
  const displayConfig = MODE_CONFIG[displayMode];

  const DATA_SOURCES = [
    { id: 'entreprises', label: 'Entreprises FR', emoji: '🏢', group: 'french', color: '#003F7D' },
    { id: 'bodacc', label: 'BODACC', emoji: '📋', group: 'french', color: '#003F7D' },
    { id: 'worldbank', label: 'World Bank', emoji: '🌍', group: 'economic', color: '#2563EB' },
    { id: 'eurostat', label: 'Eurostat', emoji: '🇪🇺', group: 'economic', color: '#2563EB' },
    { id: 'oecd', label: 'OECD', emoji: '📊', group: 'economic', color: '#2563EB' },
  ];

  const handlePillClick = (pill) => {
    if (appliedPillIds.has(pill.id)) return;
    if (pill.type === 'mode' && pill.targetMode) {
      selectMode(pill.targetMode);
      const tag = ` [${pill.label}]`;
      setInputValue((prev) => (prev.trim() ? `${prev.trim()}${tag}` : tag.trim()));
      setAppliedPillIds((prev) => new Set(prev).add(pill.id));
      return;
    }
    const tag = ` [${pill.label}]`;
    setInputValue((prev) => (prev.trim() ? `${prev.trim()}${tag}` : tag.trim()));
    setAppliedPillIds((prev) => new Set(prev).add(pill.id));
  };

  const send = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInputValue('');
    setShadowPills([]);
    setAppliedPillIds(new Set());
  };

  const pillsVisible = !disabled && shadowPills.length > 0;

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
          position: 'relative',
          zIndex: 2,
          touchAction: 'pan-x',
        }}>
          {MODE_ORDER.map((modeId) => {
            const mode = MODE_CONFIG[modeId];
            const isActive = selectedMode === modeId;
            return (
              <button
                key={modeId}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  selectMode(modeId);
                }}
                onMouseEnter={() => setHoveredMode(modeId)}
                onMouseLeave={() => setHoveredMode(null)}
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
                  border: isActive
                    ? `1.5px solid ${mode.color}`
                    : `1px solid ${isV2 ? k.border : '#E2E8F0'}`,
                  background: isActive
                    ? mode.bg
                    : (isV2 ? 'rgba(255,255,255,0.04)' : '#F8FAFC'),
                  color: isActive ? mode.color : (isV2 ? k.textMuted : '#64748B'),
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  touchAction: 'manipulation',
                  pointerEvents: 'auto',
                }}
              >
                <span style={{ fontSize: 13 }}>{mode.icon}</span>
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Mode description */}
        {displayConfig && (
          <div
            key={displayMode}
            className="kapsul-mode-desc"
            style={{
              padding: '4px 16px 6px',
              fontSize: 11,
              color: displayConfig.color,
              borderBottom: `1px solid ${k.border}`,
              background: isV2 ? 'rgba(0,0,0,0.08)' : '#FAFAFA',
              opacity: 1,
              transition: 'opacity 0.2s ease',
            }}
          >
            {displayConfig.icon} {displayConfig.desc}
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
            value={inputValue}
            onChange={(e) => {
              const val = e.target.value;
              setInputValue(val);
              if (!val.trim()) {
                setShadowPills([]);
                setAppliedPillIds(new Set());
              } else {
                setShadowPills(generateShadowPills(val, selectedMode, fr));
              }
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

        {pillsVisible && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 5,
            padding: '4px 16px 10px',
            borderTop: `1px solid ${k.border}`,
          }}>
            <span style={{
              fontSize: 10,
              color: isV2 ? k.textMuted : '#64748B',
              fontWeight: 600,
              alignSelf: 'center',
              marginRight: 2,
            }}>
              {fr ? '💡 Affiner :' : '💡 Refine:'}
            </span>
            {shadowPills.map((pill) => {
              const pillActive = appliedPillIds.has(pill.id)
                || inputValue.includes(`[${pill.label}]`);
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handlePillClick(pill)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: pillActive ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    border: pillActive
                      ? (isV2 ? '1px solid rgba(37,99,235,0.5)' : '1px solid #BFDBFE')
                      : (isV2 ? `1px solid ${k.border}` : '1px solid #E2E8F0'),
                    background: pillActive
                      ? (isV2 ? 'rgba(37,99,235,0.2)' : '#EFF6FF')
                      : (isV2 ? 'rgba(255,255,255,0.04)' : '#F8FAFC'),
                    color: pillActive
                      ? (isV2 ? '#60A5FA' : '#2563EB')
                      : (isV2 ? k.textMuted : '#64748B'),
                    transition: 'all 0.1s',
                  }}
                >
                  {pillActive ? pill.label : `+ ${pill.label}`}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
