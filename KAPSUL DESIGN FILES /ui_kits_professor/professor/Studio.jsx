// Kapsul Professor Kit — Studio split-screen

const PROF_AI_MODES = [
  { id: 'prepare',  label: 'Préparer un cours',        icon: 'book-open',       color: '#2563EB', bg: '#EFF6FF' },
  { id: 'exercise', label: 'Créer un exercice',         icon: 'dumbbell',        color: '#F97316', bg: '#FFF7ED' },
  { id: 'quiz',     label: 'Générer un quiz',           icon: 'clipboard-check', color: '#16A34A', bg: '#F0FDF4' },
  { id: 'correct',  label: 'Corriger une production',   icon: 'edit',            color: '#0891B2', bg: '#ECFEFF' },
  { id: 'flash',    label: 'Créer des flashcards',      icon: 'layers',          color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'adapt',    label: 'Adapter au niveau',         icon: 'sliders',         color: '#6D28D9', bg: '#F5F3FF' },
  { id: 'activity', label: 'Générer une activité',      icon: 'compass',         color: '#CA8A04', bg: '#FEFCE8' },
  { id: 'analyse',  label: 'Analyser une classe',       icon: 'bar-chart-2',     color: '#DC2626', bg: '#FEF2F2' },
  { id: 'rule',     label: 'Créer une règle péd.',      icon: 'flag',            color: '#1D4ED8', bg: '#DBEAFE' },
];

const QUICK_PROMPTS_P = [
  'Prépare une séance de 45 min sur la charge cognitive.',
  'Crée 10 questions de vérification pour ce cours.',
  'Transforme ce support en flashcards.',
  'Génère un exercice différencié pour les étudiants en difficulté.',
  'Propose une activité socratique de 15 minutes.',
  'Identifie les notions à consolider dans ma classe.',
];

const CONVERSATIONS_P = {
  prepare: [
    { role: 'user', text: 'Prépare une séance de 45 min sur la charge cognitive pour des L3.' },
    { role: 'ai', mode: 'prepare', sections: [
      { label: 'Plan de séance', icon: 'book-open', color: '#2563EB', lines: [
        '1. Introduction (5 min) — Activation des connaissances antérieures',
        '2. Exposé magistral (15 min) — Théorie de Sweller : charge intrinsèque, extrinsèque, essentielle',
        '3. Activité guidée (10 min) — Analyse d\'exemples concrets',
        '4. Travail en binôme (10 min) — Identifier la charge dans un exemple de cours',
        '5. Synthèse + vérification (5 min) — 3 questions flash',
      ]},
      { label: 'Objectifs pédagogiques', icon: 'target', color: '#16A34A', lines: [
        'Distinguer les 3 types de charge cognitive',
        'Appliquer la théorie à un cas pédagogique réel',
        'Identifier les stratégies de réduction de charge',
      ]},
      { label: 'Suggestion Kapsul', icon: 'lightbulb', color: '#7C3AED', lines: [
        'Créer un quiz de 5 questions après la séance pour mesurer la maîtrise immédiate.',
        'Programmer une révision espacée à J+3 et J+7.',
      ]},
    ]},
  ],
  quiz: [
    { role: 'user', text: 'Génère 5 questions de vérification sur la mémoire de travail, niveau L3.' },
    { role: 'ai', mode: 'quiz', sections: [
      { label: 'Quiz généré — Mémoire de travail', icon: 'clipboard-check', color: '#16A34A', lines: [
        'Q1. Quelle est la capacité maximale de la mémoire de travail selon Baddeley ? (4 ± 1 chunks)',
        'Q2. Citez les 3 composantes du modèle de Baddeley.',
        'Q3. Expliquez la différence entre la boucle phonologique et le calepin visuospatial.',
        'Q4. Comment la charge extrinsèque affecte-t-elle la mémoire de travail ?',
        'Q5. Proposez une stratégie pour réduire la surcharge cognitive lors d\'une lecture complexe.',
      ]},
      { label: 'Paramètres du quiz', icon: 'settings', color: '#0891B2', lines: [
        'Niveau : L3 · Durée estimée : 8 min · Difficulté : intermédiaire',
        'Types : définition · liste · comparaison · application',
        'Couverture : 4/5 notions clés du cours',
      ]},
    ]},
  ],
  flash: [
    { role: 'user', text: 'Crée 6 flashcards sur les notions clés de la charge cognitive.' },
    { role: 'ai', mode: 'flash', sections: [
      { label: '6 flashcards générées', icon: 'layers', color: '#7C3AED', lines: [
        '① Charge intrinsèque — Complexité inhérente au contenu lui-même.',
        '② Charge extrinsèque — Charge liée à la façon dont le contenu est présenté.',
        '③ Charge essentielle (germane) — Effort cognitif utile à la construction du schéma.',
        '④ Sweller (1988) — Théoricien fondateur de la CLT (Cognitive Load Theory).',
        '⑤ Effet de redondance — Présenter le même contenu en deux modalités augmente la charge extrinsèque.',
        '⑥ Effet split-attention — Séparer texte et schéma force une intégration coûteuse.',
      ]},
    ]},
  ],
  exercise: [
    { role: 'user', text: 'Génère un exercice différencié sur la charge cognitive pour les étudiants en difficulté.' },
    { role: 'ai', mode: 'exercise', sections: [
      { label: 'Exercice adapté — Niveau intermédiaire', icon: 'dumbbell', color: '#F97316', lines: [
        'Consigne : Lisez le texte ci-dessous et identifiez les types de charge cognitive présents.',
        '',
        'Texte support : "Un étudiant regarde un schéma complexe avec des annotations nombreuses, en écoutant simultanément une explication audio."',
        '',
        'Question 1 : Quelle charge est liée à la complexité du schéma lui-même ?',
        'Question 2 : Quelle charge est introduite par la double modalité (visuel + audio) ?',
        'Question 3 : Proposez une modification pour réduire la charge extrinsèque.',
      ]},
      { label: 'Aide et remédiation', icon: 'lightbulb', color: '#7C3AED', lines: [
        'Indice 1 : La complexité intrinsèque vient du contenu, pas de sa présentation.',
        'Indice 2 : La charge extrinsèque est celle que le professeur peut réduire.',
      ]},
    ]},
  ],
  analyse: [
    { role: 'user', text: 'Analyse la classe L3 Cognitives — que dois-je faire en priorité ?' },
    { role: 'ai', mode: 'analyse', sections: [
      { label: 'Analyse de la classe L3 Cognitives', icon: 'bar-chart-2', color: '#DC2626', lines: [
        '48 étudiants · Progression moyenne : 64% · 7 étudiants à accompagner',
        'Agent IA dominant : Explication (58%) — Vérification très faible (7%)',
        'Notion la plus fragile : Charge extrinsèque (maîtrise 56%)',
      ]},
      { label: 'Recommandations prioritaires', icon: 'target', color: '#16A34A', lines: [
        '① Créer un quiz de vérification sur la charge extrinsèque (impact estimé +12 pts)',
        '② Activer une règle pédagogique : limiter Explication → encourager Vérification',
        '③ Relancer les 7 étudiants en difficulté avec un exercice différencié',
      ]},
    ]},
  ],
};

const DEFAULT_CONV_P = [
  { role: 'system', text: 'Bonjour ! Je suis votre assistant pédagogique. Choisissez un mode ou tapez votre demande.' },
];

const PAIMessage = ({ msg }) => {
  if (msg.role === 'system') return (
    <div style={{ textAlign: 'center', padding: '6px 0' }}>
      <span style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>{msg.text}</span>
    </div>
  );
  if (msg.role === 'user') return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
      <div style={{ background: '#1D4ED8', color: '#fff', borderRadius: '14px 14px 4px 14px', padding: '10px 14px', maxWidth: '80%', fontSize: 13, lineHeight: 1.55 }}>{msg.text}</div>
    </div>
  );
  if (msg.role === 'ai') {
    const m = PROF_AI_MODES.find(x => x.id === msg.mode) || PROF_AI_MODES[0];
    return (
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start' }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PIcon name={m.icon} size={14} color={m.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: m.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>{m.label}</div>
          {msg.sections.map((sec, si) => (
            <div key={si} style={{ background: '#fff', border: '1px solid #F1F5F9', borderLeft: `3px solid ${sec.color}`, borderRadius: '0 10px 10px 0', padding: '9px 13px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <PIcon name={sec.icon} size={12} color={sec.color} />
                <span style={{ fontWeight: 700, fontSize: 12, color: sec.color }}>{sec.label}</span>
              </div>
              {sec.lines.map((l, li) => l === ''
                ? <div key={li} style={{ height: 6 }} />
                : <div key={li} style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, marginBottom: 2 }}>{l}</div>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
            {[
              { label: 'Ajouter au doc', icon: 'plus', color: '#2563EB' },
              { label: 'Publier à la classe', icon: 'send', color: '#7C3AED' },
              { label: 'Exporter PDF', icon: 'download', color: '#6B7280' },
            ].map((a, ai) => (
              <button key={ai} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: a.color + '12', color: a.color, border: `1px solid ${a.color}33`, padding: '5px 9px', borderRadius: 7, fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                <PIcon name={a.icon} size={10} color={a.color} />{a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// ── Document sections ─────────────────────────────────────────────────
const DOC_SECTIONS_P = [
  { title: 'Objectifs pédagogiques', content: 'Distinguer les 3 types de charge cognitive.\nAppliquer la théorie à un exemple réel.\nIdentifier des stratégies de réduction.', done: true },
  { title: 'Notions clés',           content: 'Charge intrinsèque · Charge extrinsèque · Charge essentielle\nMémoire de travail · Schèmes cognitifs', done: true },
  { title: 'Déroulé de séance',      content: '1. Activation (5 min)\n2. Exposé magistral (15 min)\n3. Activité guidée (10 min)\n4. Binôme (10 min)\n5. Vérification (5 min)', done: true },
  { title: 'Activité d\'entraînement', content: '', done: false },
  { title: 'Questions de vérification', content: '', done: false },
  { title: 'Supports associés',       content: '', done: false },
  { title: 'Révisions à planifier',   content: '', done: false },
];

const PDocSection = ({ sec, idx }) => {
  const [open, setOpen] = useState(idx < 3);
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 13px', background: open ? '#F8FAFC' : '#fff', cursor: 'pointer', borderBottom: open ? '1px solid #F1F5F9' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PIcon name="chevron-right" size={12} color="#94A3B8" />
          <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{sec.title}</span>
          {sec.done
            ? <PBadge color="#16A34A" bg="#F0FDF4" border="#BBF7D0">✓</PBadge>
            : <PBadge color="#F97316" bg="#FFF7ED" border="#FED7AA">Vide</PBadge>}
        </div>
        <button style={{ fontSize: 10, background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '3px 7px', borderRadius: 6, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
          IA
        </button>
      </div>
      {open && (
        <div style={{ padding: '10px 13px', background: '#fff' }}>
          {sec.content
            ? sec.content.split('\n').map((l, i) => <div key={i} style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{l}</div>)
            : <div style={{ fontSize: 13, color: '#CBD5E1', fontStyle: 'italic' }}>Cliquer sur "IA" pour générer ce contenu…</div>}
        </div>
      )}
    </div>
  );
};

// ── Quality KPI sidebar ───────────────────────────────────────────────
const QualityBar = () => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Qualité du support</div>
    {[
      { label: 'Temps gagné',    value: '2h15',   icon: 'clock',    color: '#7C3AED' },
      { label: 'Qualité péd.',   value: '87/100', icon: 'target',   color: '#16A34A' },
      { label: 'Niveau cible',   value: 'L3',     icon: 'graduation-cap', color: '#2563EB' },
      { label: 'Couverture',     value: '5/6',    icon: 'layers',   color: '#0891B2' },
      { label: 'Activités gén.', value: '4',      icon: 'compass',  color: '#F97316' },
      { label: 'Prêt à publier', value: '82%',    icon: 'send',     color: '#16A34A' },
    ].map((k, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 9, marginBottom: 6 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: k.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PIcon name={k.icon} size={12} color={k.color} />
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: '#9CA3AF' }}>{k.label}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
        </div>
      </div>
    ))}
    <div style={{ height: 1, background: '#E5E7EB', margin: '12px 0' }} />
    <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Publier</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <PPrimary icon="send" small>Publier à la classe</PPrimary>
      <PGhost icon="download" small>Exporter PDF</PGhost>
      <PGhost icon="file-text" small>PowerPoint</PGhost>
      <PGhost icon="calendar" small>Planifier révision</PGhost>
    </div>
  </div>
);

// ── Studio main component ─────────────────────────────────────────────
const StudioView = () => {
  const [activeMode, setActiveMode] = useState('prepare');
  const [input, setInput] = useState('');
  const modeConv = CONVERSATIONS_P[activeMode] || [];
  const messages = [...DEFAULT_CONV_P, ...modeConv];
  const modeInfo = PROF_AI_MODES.find(m => m.id === activeMode) || PROF_AI_MODES[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Context bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', background: '#fff', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PIcon name="compass" size={14} color="#fff" />
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Studio professeur</div>
        <div style={{ flex: 1 }} />
        <select style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 11px', fontSize: 12, color: '#374151', fontFamily: 'inherit', background: '#F8FAFC', outline: 'none' }}>
          {['Charge cognitive CM3', 'Neurosciences L3', 'Statistiques L3', 'Méthodologie M1'].map(c => <option key={c}>{c}</option>)}
        </select>
        <select style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 11px', fontSize: 12, color: '#374151', fontFamily: 'inherit', background: '#F8FAFC', outline: 'none' }}>
          {['L3 Cognitives', 'Neuro L3', 'Stats L3', 'M1 Méthodo'].map(c => <option key={c}>{c}</option>)}
        </select>
        <PPrimary icon="send" small>Publier à la classe</PPrimary>
      </div>

      {/* Split layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 190px', flex: 1, overflow: 'hidden' }}>

        {/* LEFT — Chat IA */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #F1F5F9', overflow: 'hidden' }}>
          {/* Mode picker */}
          <div style={{ padding: '10px 12px', background: '#FAFBFC', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>Mode IA</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {PROF_AI_MODES.map(m => (
                <button key={m.id} onClick={() => setActiveMode(m.id)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 9px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: 11, transition: 'all 150ms',
                  background: activeMode === m.id ? m.bg : '#F1F5F9',
                  color: activeMode === m.id ? m.color : '#6B7280',
                  boxShadow: activeMode === m.id ? `0 0 0 1.5px ${m.color}55` : 'none',
                }}>
                  <PIcon name={m.icon} size={11} color={activeMode === m.id ? m.color : '#9CA3AF'} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: '14px', background: '#FAFBFC' }}>
            {messages.map((msg, i) => <PAIMessage key={i} msg={msg} />)}
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #F1F5F9', background: '#fff', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
              {QUICK_PROMPTS_P.slice(0, 2).map((p, i) => (
                <button key={i} onClick={() => setInput(p)} style={{ fontSize: 10.5, background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '4px 8px', borderRadius: 6, fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500 }}>
                  {p.slice(0, 36)}...
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                placeholder="Demandez à Kapsul de préparer, créer, analyser..."
                style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: 10, padding: '9px 13px', fontSize: 13, fontFamily: 'inherit', background: '#F8FAFC', outline: 'none' }} />
              <PPrimary icon="arrow-up" small>Envoyer</PPrimary>
            </div>
          </div>
        </div>

        {/* CENTER — Document editor */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid #F1F5F9' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #F1F5F9', background: '#fff', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input defaultValue="Plan de séance — Charge cognitive CM3" style={{ fontWeight: 800, fontSize: 15, color: '#111827', border: 'none', background: 'transparent', fontFamily: 'inherit', flex: 1, outline: 'none' }} />
              <PGhost icon="layers" small>Flashcards</PGhost>
              <PGhost icon="clipboard-check" small>Quiz</PGhost>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px' }}>
            {DOC_SECTIONS_P.map((sec, i) => <PDocSection key={i} sec={sec} idx={i} />)}
            {/* Kapsul doc suggestion */}
            <div style={{ background: '#ECFEFF', border: '1px solid #A5F3FC', borderLeft: '4px solid #06B6D4', borderRadius: '0 10px 10px 0', padding: '10px 13px', marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <PIcon name="lightbulb" size={13} color="#0E7490" />
                <span style={{ fontWeight: 700, fontSize: 12, color: '#0E7490' }}>Suggestions Kapsul</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Créer 5 flashcards', 'Générer un quiz', 'Adapter au niveau L3', 'Publier à la classe', 'Ajouter un schéma'].map((s, i) => (
                  <button key={i} style={{ fontSize: 11, background: '#fff', color: '#0E7490', border: '1px solid #A5F3FC', padding: '4px 8px', borderRadius: 7, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Quality */}
        <div style={{ overflow: 'auto', padding: '14px 12px', background: '#FAFBFC' }}>
          <QualityBar />
        </div>

      </div>
    </div>
  );
};

window.StudioView = StudioView;
