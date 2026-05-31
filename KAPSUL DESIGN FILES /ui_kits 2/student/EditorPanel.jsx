// Editor panel — with Kapsul IA suggestion annotations
const EditorPanel = ({ onClose, highlight = false }) => {
  const [tab, setTab] = React.useState('kapsul');
  const [suggestions, setSuggestions] = React.useState([
    { id: 1, text: 'Ajouter une figure illustrant les 3 types de charge cognitive en page 4 ?', action: 'schema', visible: true },
    { id: 2, text: 'Ce paragraphe est dense — diviser en 2 sous-sections améliorerait la lisibilité.', action: 'split', visible: true },
  ]);

  const dismissSuggestion = (id) => setSuggestions(s => s.map(x => x.id === id ? { ...x, visible: false } : x));

  return (
    <div style={{
      width: '50%', display: 'flex', flexDirection: 'column',
      background: '#ffffff', borderLeft: '1px solid #E5E7EB',
      outline: highlight ? '2px solid #2563EB' : 'none',
      transition: 'outline 400ms',
    }}>
      {/* Tab bar */}
      <div style={{ height: 52, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 3, borderBottom: '1px solid #E5E7EB', background: '#F8FAFC', flexShrink: 0 }}>
        {[
          { id: 'kapsul', label: 'Éditeur Kapsul', icon: 'file-text', color: '#2563EB' },
          { id: 'word',   label: 'MS Word',         icon: 'file-text', color: '#1E40AF' },
          { id: 'notion', label: 'Notion',           icon: 'box',       color: '#111827' },
        ].map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 13px', borderRadius: 8,
              background: active ? '#fff' : 'transparent',
              border: active ? '1px solid #E5E7EB' : '1px solid transparent',
              color: active ? t.color : '#6B7280',
              fontWeight: 600, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: active ? '0 1px 2px rgba(15,23,42,.04)' : 'none',
            }}>
              <Icon name={t.icon} size={13} color={active ? t.color : '#9CA3AF'} />
              {t.label}
              {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', marginLeft: 1 }} />}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 600 }}>Auto-saved</span>
        <IconBtn icon="x" onClick={onClose} title="Fermer" />
      </div>

      {/* Document */}
      <div style={{ flex: 1, overflow: 'auto', padding: '40px 52px', background: '#fff' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: '#9CA3AF', marginBottom: 8 }}>Mémoire · Brouillon</div>
          <h1 style={{ margin: '0 0 10px', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', color: '#111827', lineHeight: 1.1 }}>
            Charge cognitive et apprentissage profond
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: 13, color: '#9CA3AF' }}>Camille Durand · Sciences cognitives · 2025–2026</p>

          <h2 style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 20, color: '#111827', letterSpacing: '-0.01em' }}>1. Introduction</h2>
          <p style={{ margin: '0 0 14px', fontSize: 14, color: '#374151', lineHeight: 1.75 }}>
            La théorie de la charge cognitive développée par Sweller (1988) propose un cadre pour comprendre les limites de la mémoire de travail lors de l'apprentissage de tâches complexes.
          </p>

          {/* Kapsul IA suggestion */}
          {suggestions[0].visible && (
            <KapsulSuggestion
              key={suggestions[0].id}
              text={suggestions[0].text}
              onAdd={() => dismissSuggestion(1)}
              onIgnore={() => dismissSuggestion(1)}
              onTransform={() => dismissSuggestion(1)}
            />
          )}

          <p style={{ margin: '0 0 14px', fontSize: 14, color: '#374151', lineHeight: 1.75 }}>
            Cette approche distingue trois sources de charge — intrinsèque, extrinsèque et essentielle — qui interagissent dynamiquement durant le traitement de l'information.
          </p>

          <h2 style={{ margin: '24px 0 10px', fontWeight: 700, fontSize: 20, color: '#111827', letterSpacing: '-0.01em' }}>2. Méthodologie</h2>
          <p style={{ margin: '0 0 14px', fontSize: 14, color: '#374151', lineHeight: 1.75 }}>
            L'expérience repose sur un protocole intra-sujet à mesures répétées (n = 48). Les participants ont été soumis à deux conditions d'apprentissage — haute charge et basse charge — avec mesure de la performance et de la charge subjective (NASA-TLX).
          </p>

          {/* Second Kapsul suggestion */}
          {suggestions[1].visible && (
            <KapsulSuggestion
              key={suggestions[1].id}
              text={suggestions[1].text}
              onAdd={() => dismissSuggestion(2)}
              onIgnore={() => dismissSuggestion(2)}
              onTransform={() => dismissSuggestion(2)}
            />
          )}

          <p style={{ margin: '0', fontSize: 14, color: '#374151', lineHeight: 1.75 }}>
            Les résultats préliminaires confirment l'effet principal de la condition expérimentale sur les scores de rétention (p {'<'} .001, η² = .18)…
          </p>
        </div>
      </div>
    </div>
  );
};

// Kapsul IA suggestion annotation card
const KapsulSuggestion = ({ text, onAdd, onIgnore, onTransform }) => (
  <div style={{
    margin: '12px 0',
    background: '#ECFEFF',
    borderLeft: '3px solid #06B6D4',
    borderRadius: '0 10px 10px 0',
    padding: '10px 14px',
    display: 'flex', flexDirection: 'column', gap: 8,
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <div style={{ width: 20, height: 20, borderRadius: 6, background: 'linear-gradient(135deg,#2563EB,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <Icon name="sparkles" size={11} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#0E7490', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Suggestion Kapsul</div>
        <div style={{ fontSize: 13, color: '#0E7490', lineHeight: 1.5 }}>{text}</div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 6, paddingLeft: 28 }}>
      <button onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#06B6D4', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 7, fontWeight: 600, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer' }}>
        <Icon name="plus" size={11} color="#fff" />Ajouter
      </button>
      <button onClick={onTransform} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#CFFAFE', color: '#0E7490', border: '1px solid #A5F3FC', padding: '5px 10px', borderRadius: 7, fontWeight: 600, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer' }}>
        <Icon name="git-fork" size={11} color="#0E7490" />Transformer en schéma
      </button>
      <button onClick={onIgnore} style={{ background: 'transparent', border: 'none', color: '#67E8F9', fontSize: 11, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }}>Ignorer</button>
    </div>
  </div>
);

window.EditorPanel = EditorPanel;
