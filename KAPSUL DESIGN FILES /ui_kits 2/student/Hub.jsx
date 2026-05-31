// Hub — Academic Progress Dashboard
// Remplace le Hub simple par un coach personnel d'apprentissage complet.
// Blocs : A (Header + score global) · B (Cours) · C (Erreurs) · D (Recs IA)
//          E (Notifications) · F (Historique chat) · G (Objectifs semaine)

const { useState } = React;

// ── Helpers ──────────────────────────────────────────────────────────────────

const masteryTheme = (pct) => {
  if (pct >= 80) return { fg: '#059669', bg: '#ecfdf5', bd: '#a7f3d0', label: 'Maîtrisé',    labelTone: 'green' };
  if (pct >= 60) return { fg: '#2563eb', bg: '#eff6ff', bd: '#bfdbfe', label: 'Bonne base',  labelTone: 'blue' };
  if (pct >= 40) return { fg: '#ea580c', bg: '#fff7ed', bd: '#fed7aa', label: 'À consolider',labelTone: 'orange' };
  return            { fg: '#dc2626', bg: '#fef2f2', bd: '#fecaca', label: 'Urgent',           labelTone: 'red' };
};

// Circular SVG ring, R=44, cx/cy=50
const ScoreRing = ({ pct, size = 120 }) => {
  const r = 44; const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb"/><stop offset="50%" stopColor="#06b6d4"/><stop offset="100%" stopColor="#f97316"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(.4,0,.2,1)' }}
      />
      <text x="50" y="46" textAnchor="middle" fill="#0f172a" fontSize="20" fontWeight="900" fontFamily="Inter,sans-serif" letterSpacing="-1">{pct}%</text>
      <text x="50" y="61" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600" fontFamily="Inter,sans-serif" letterSpacing="1">MAÎTRISE</text>
    </svg>
  );
};

// Mini sparkline
const Spark = ({ data, color = '#2563eb' }) => {
  const max = Math.max(...data); const min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 28 - ((v - min) / (max - min || 1)) * 24;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="80" height="32" viewBox="0 0 100 32" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// Mini ring for weekly goals
const MiniRing = ({ pct, size = 48, color = '#2563eb' }) => {
  const r = 18; const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6"/>
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" transform="rotate(-90 24 24)"/>
      <text x="24" y="28" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="800" fontFamily="Inter,sans-serif">{pct}%</text>
    </svg>
  );
};

// Progress bar with gradient
const MasteryBar = ({ pct, height = 8 }) => {
  const t = masteryTheme(pct);
  return (
    <div style={{ height, borderRadius: height / 2, background: '#f1f5f9', overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: pct >= 60 ? 'linear-gradient(90deg,#2563eb,#06b6d4)' : pct >= 40 ? '#f97316' : '#dc2626', borderRadius: height / 2, transition: 'width 600ms ease' }}/>
    </div>
  );
};

// Trend icon
const Trend = ({ direction }) => {
  const map = { up: { i: 'trending-up', c: '#059669' }, down: { i: 'trending-down', c: '#dc2626' }, flat: { i: 'minus', c: '#94a3b8' } };
  const t = map[direction];
  return <Icon name={t.i} size={14} color={t.c} />;
};

// Notification card
const Notif = ({ type, text, action, actionLabel }) => {
  const themes = {
    reminder: { bd: '#2563eb', bg: '#eff6ff', icon: 'bell', ic: '#2563eb' },
    error:    { bd: '#ea580c', bg: '#fff7ed', icon: 'alert-circle', ic: '#ea580c' },
    exam:     { bd: '#9333ea', bg: '#faf5ff', icon: 'calendar', ic: '#9333ea' },
    progress: { bd: '#059669', bg: '#ecfdf5', icon: 'trending-up', ic: '#059669' },
  };
  const t = themes[type] || themes.reminder;
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 12, background: t.bg, borderLeft: `3px solid ${t.bd}` }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={t.icon} size={15} color={t.ic} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: '#0f172a', lineHeight: 1.5, marginBottom: action ? 8 : 0 }}>{text}</div>
        {action && (
          <button onClick={action} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${t.bd}20`, color: t.bd, padding: '5px 10px', borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
            <Icon name="arrow-right" size={12} color={t.bd} />{actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

// Section header
const SectionHeader = ({ icon, title, badge, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
    <Icon name={icon} size={18} color="#2563eb" />
    <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', letterSpacing: '-0.01em' }}>{title}</span>
    {badge && <Pill tone="blue">{badge}</Pill>}
    {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
  </div>
);

// ── Data ─────────────────────────────────────────────────────────────────────

const COURSES = [
  { id: 1, name: 'Contrôle de gestion', pct: 82, quiz: 14, trend: 'up',   spark: [60,65,70,72,75,79,82] },
  { id: 2, name: 'Finance d\'entreprise', pct: 74, quiz: 11, trend: 'flat', spark: [68,70,71,73,74,73,74] },
  { id: 3, name: 'Marketing stratégique', pct: 68, quiz: 9,  trend: 'up',   spark: [52,55,59,62,64,66,68] },
  { id: 4, name: 'Comptabilité générale', pct: 61, quiz: 8,  trend: 'down', spark: [68,67,65,64,63,62,61] },
];

const ERRORS = [
  {
    id: 1, course: 'Contrôle de gestion',
    question: "Quelle est la différence entre coût fixe et coût variable ?",
    given: "Un coût fixe varie avec le volume.",
    correct: "Un coût fixe reste stable à court terme, indépendamment du volume produit.",
    explanation: "La distinction est fondamentale en contrôle de gestion. Les coûts fixes restent constants dans une plage d'activité donnée (loyer, amortissements), tandis que les coûts variables évoluent proportionnellement à la production (matières premières, énergie).",
    concept: "Typologie des coûts",
    action: "Refaire 3 questions sur les coûts fixes et variables."
  },
  {
    id: 2, course: 'Contrôle de gestion',
    question: "Qu'est-ce que le seuil de rentabilité ?",
    given: "Le chiffre d'affaires total.",
    correct: "Le point à partir duquel l'entreprise couvre tous ses coûts et commence à réaliser un bénéfice.",
    explanation: "Le seuil de rentabilité (SR) = Coûts fixes / Taux de marge sur coûts variables. En dessous de ce seuil, l'entreprise est en perte ; au-delà, elle est bénéficiaire. C'est un outil de pilotage clé.",
    concept: "Seuil de rentabilité",
    action: "Faire un quiz ciblé sur la marge sur coûts variables."
  },
  {
    id: 3, course: 'Finance d\'entreprise',
    question: "Que mesure le ratio d'endettement ?",
    given: "La rentabilité de l'entreprise.",
    correct: "Le niveau de dette de l'entreprise par rapport à ses fonds propres.",
    explanation: "Le ratio d'endettement = Dettes financières / Fonds propres. Il mesure le risque financier et la dépendance aux créanciers. Un ratio élevé fragilise la structure financière.",
    concept: "Structure financière",
    action: "Revoir la fiche sur les ratios financiers."
  },
];

const PRIORITIES = [
  { id: 1, notion: 'Écarts sur coûts standards', course: 'Contrôle de gestion', priority: 'high',   time: 15, errors: 4, examIn: 2 },
  { id: 2, notion: 'Seuil de rentabilité',       course: 'Contrôle de gestion', priority: 'high',   time: 10, errors: 3, examIn: 2 },
  { id: 3, notion: 'Coûts fixes / coûts variables', course: 'Contrôle de gestion', priority: 'medium', time: 8, errors: 2, examIn: 5 },
  { id: 4, notion: 'Structure financière',        course: 'Finance d\'entreprise', priority: 'medium', time: 12, errors: 1, examIn: 7 },
  { id: 5, notion: 'Matrice BCG',                 course: 'Marketing stratégique', priority: 'low',    time: 8, errors: 1, examIn: 14 },
];

const CHAT_HISTORY = [
  { id: 1, date: 'Aujourd\'hui · 11h32', topic: 'Charge cognitive', excerpt: 'Explique-moi la théorie de Sweller…', mode: 'explain', tags: ['Psychologie cog.', 'L3'] },
  { id: 2, date: 'Hier · 19h45', topic: 'Seuil de rentabilité', excerpt: '/Quiz sur les coûts variables', mode: 'check', tags: ['Contrôle de gestion'] },
  { id: 3, date: 'Lundi · 14h10', topic: 'Structure financière', excerpt: 'Quelle est la formule du ratio d\'endettement ?', mode: 'socratic', tags: ['Finance', 'Ratios'] },
];

const PRIORITY_THEME = {
  high:   { bg: '#fef2f2', bd: '#fca5a5', fg: '#dc2626', label: 'Priorité élevée' },
  medium: { bg: '#fff7ed', bd: '#fdba74', fg: '#ea580c', label: 'Priorité moyenne' },
  low:    { bg: '#f0fdf4', bd: '#86efac', fg: '#16a34a', label: 'Priorité faible' },
};

const MODE_META = {
  explain:  { icon: 'book-open', tone: 'blue',   label: 'Explication' },
  check:    { icon: 'clipboard-check', tone: 'green', label: 'Vérification' },
  socratic: { icon: 'compass', tone: 'purple',  label: 'Socratique' },
};

const MODE_RING = {
  blue:   '#2563eb', green: '#059669', purple: '#9333ea',
};

// ── Main Dashboard ────────────────────────────────────────────────────────────

const Hub = ({ onNav }) => {
  const [expandedError, setExpandedError] = useState(1);

  return (
    <div style={{
      flex: 1, overflow: 'auto', padding: '28px 36px',
      background: 'radial-gradient(#e5e7eb 1px, transparent 1px) 0 0/20px 20px, #fafafa',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── BLOC A — Header ── */}
        <div style={{
          background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
          padding: '24px 28px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, background: 'radial-gradient(circle,rgba(37,99,235,0.07),transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: '40%', width: 200, height: 200, background: 'radial-gradient(circle,rgba(249,115,22,0.06),transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, position: 'relative', zIndex: 1 }}>
            <ScoreRing pct={71} size={120} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 6 }}>Mardi 27 mai 2026</div>
              <h1 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', color: '#0f172a' }}>
                Bonjour, <span style={{ background: 'linear-gradient(90deg,#2563eb,#06b6d4,#f97316)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Camille</span>
              </h1>
              <div style={{
                display: 'inline-flex', alignItems: 'flex-start', gap: 10,
                background: '#f8faff', border: '1px solid #dbeafe', borderRadius: 12,
                padding: '10px 14px', marginBottom: 14, maxWidth: 680,
              }}>
                <Icon name="sparkles" size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: '#334155', lineHeight: 1.55 }}>
                  Tu maîtrises bien le <strong>contrôle de gestion</strong>, mais tu dois revoir les <strong>écarts sur coûts standards</strong> avant ton prochain quiz dans 2 jours. Priorité : seuil de rentabilité (10 min).
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => onNav('chat')} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#0f172a', color: '#fff', border: 'none',
                  padding: '10px 18px', borderRadius: 12, fontWeight: 600, fontSize: 14,
                  fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.2)',
                }}>
                  <Icon name="play" size={15} color="#fff" />Lancer ma session de révision
                </button>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9', fontSize: 13, color: '#475569' }}>
                  <Icon name="target" size={14} color="#ea580c" />
                  <span>Objectif du jour : <strong>revoir 3 notions · faire 2 quiz</strong></span>
                </div>
              </div>
            </div>
            {/* Mini KPIs */}
            <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
              {[
                { v: '41', label: 'Quiz réalisés', icon: 'clipboard-list', c: '#2563eb', bg: '#eff6ff' },
                { v: '28', label: 'Notions maîtrisées', icon: 'check-circle-2', c: '#059669', bg: '#ecfdf5' },
                { v: '7',  label: 'À revoir', icon: 'alert-circle', c: '#ea580c', bg: '#fff7ed' },
              ].map((k, i) => (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '14px 16px', background: k.bg, borderRadius: 14,
                  border: `1px solid ${k.c}20`, minWidth: 80,
                }}>
                  <Icon name={k.icon} size={18} color={k.c} />
                  <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.02em', color: '#0f172a', lineHeight: 1 }}>{k.v}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textAlign: 'center', lineHeight: 1.3 }}>{k.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 2: Cours + Objectifs semaine ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

          {/* BLOC B — Progression par cours */}
          <Card>
            <SectionHeader icon="bar-chart-3" title="Mes cours" badge="4 cours actifs"
              right={<button style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Voir tout</button>} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {COURSES.map((c, i) => {
                const t = masteryTheme(c.pct);
                return (
                  <div key={c.id} style={{
                    padding: '14px 0', borderTop: i ? '1px solid #f8fafc' : 'none',
                    display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, alignItems: 'center',
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.01em' }}>{c.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: t.fg, background: t.bg, padding: '2px 7px', borderRadius: 6, border: `1px solid ${t.bd}` }}>{t.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <MasteryBar pct={c.pct} height={7} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: t.fg, flexShrink: 0, width: 36 }}>{c.pct}%</span>
                      </div>
                      <div style={{ marginTop: 5, fontSize: 11, color: '#94a3b8' }}>{c.quiz} quiz réalisés</div>
                    </div>
                    <Spark data={c.spark} color={t.fg} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Trend direction={c.trend} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* BLOC G — Objectifs semaine */}
          <Card style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionHeader icon="target" title="Objectifs semaine" />
            {[
              { label: 'Quiz réalisés', done: 4, total: 6, color: '#2563eb' },
              { label: 'Notions maîtrisées', done: 8, total: 12, color: '#059669' },
            ].map((g, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MiniRing pct={Math.round(g.done / g.total * 100)} size={48} color={g.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{g.label}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{g.done} / {g.total} — encore {g.total - g.done}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                <span>Temps de révision</span>
                <span style={{ color: '#ea580c' }}>2h30 / 4h</span>
              </div>
              <MasteryBar pct={63} height={7} />
            </div>
            <div style={{
              padding: '12px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0',
              borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Icon name="trending-up" size={18} color="#059669" />
              <span style={{ fontSize: 13, color: '#065f46', fontWeight: 500, lineHeight: 1.4 }}>
                +12 % en Finance cette semaine. Continue comme ça.
              </span>
            </div>
          </Card>
        </div>

        {/* ── Row 3: Erreurs + Recommandations IA ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

          {/* BLOC C — Erreurs récentes */}
          <Card>
            <SectionHeader icon="alert-circle" title="Mes erreurs à revoir" badge={`${ERRORS.length} récentes`} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ERRORS.map((e) => {
                const open = expandedError === e.id;
                return (
                  <div key={e.id} style={{
                    border: `1px solid ${open ? '#fed7aa' : '#f1f5f9'}`,
                    borderRadius: 14, overflow: 'hidden',
                    transition: 'border-color 200ms',
                  }}>
                    <div
                      onClick={() => setExpandedError(open ? null : e.id)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        padding: '12px 14px', cursor: 'pointer',
                        background: open ? '#fff7ed' : '#fafafa',
                        transition: 'background 200ms',
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, background: '#fef2f2',
                        border: '1px solid #fecaca', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0, marginTop: 1,
                      }}>
                        <Icon name="x" size={14} color="#dc2626" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{e.course} · {e.concept}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.45 }}>{e.question}</div>
                      </div>
                      <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#94a3b8" style={{ flexShrink: 0, marginTop: 6 }} />
                    </div>
                    {open && (
                      <div style={{ padding: '0 14px 14px', background: '#fff' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12, marginTop: 12 }}>
                          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 12px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#dc2626', marginBottom: 5 }}>Ta réponse</div>
                            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{e.given}</div>
                          </div>
                          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: '10px 12px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#059669', marginBottom: 5 }}>Bonne réponse</div>
                            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{e.correct}</div>
                          </div>
                        </div>
                        <div style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb', marginBottom: 5 }}>Pourquoi ?</div>
                          <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>{e.explanation}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => onNav('chat')} style={{
                            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            background: '#2563eb', color: '#fff', border: 'none',
                            padding: '9px 14px', borderRadius: 10, fontWeight: 600, fontSize: 13,
                            fontFamily: 'inherit', cursor: 'pointer',
                          }}>
                            <Icon name="book-open" size={14} color="#fff" />Revoir cette notion
                          </button>
                          <button onClick={() => onNav('chat')} style={{
                            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            background: '#fff', color: '#334155', border: '1px solid #e2e8f0',
                            padding: '9px 14px', borderRadius: 10, fontWeight: 600, fontSize: 13,
                            fontFamily: 'inherit', cursor: 'pointer',
                          }}>
                            <Icon name="clipboard-check" size={14} color="#475569" />Me réévaluer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* BLOC D — Recommandations IA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card>
              <SectionHeader icon="sparkles" title="Priorités du jour" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PRIORITIES.slice(0, 3).map((p, i) => {
                  const t = PRIORITY_THEME[p.priority];
                  return (
                    <div key={p.id} style={{
                      display: 'flex', gap: 12, padding: '11px 12px', borderRadius: 12,
                      background: '#fafafa', border: '1px solid #f1f5f9',
                      alignItems: 'flex-start',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: t.bg, border: `1px solid ${t.bd}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        fontWeight: 900, fontSize: 12, color: t.fg,
                      }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 3, lineHeight: 1.3 }}>{p.notion}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: t.fg, background: t.bg, padding: '2px 6px', borderRadius: 5, border: `1px solid ${t.bd}` }}>{t.label}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Icon name="clock" size={11} color="#94a3b8" />{p.time} min
                          </span>
                          {p.examIn <= 7 && (
                            <span style={{ fontSize: 10, color: '#9333ea', fontWeight: 600, background: '#faf5ff', padding: '2px 6px', borderRadius: 5 }}>
                              Quiz dans {p.examIn}j
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => onNav('chat')} style={{
                        width: 28, height: 28, borderRadius: 8, background: '#fff',
                        border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0,
                      }}>
                        <Icon name="arrow-right" size={14} color="#64748b" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* BLOC E — Notifications */}
            <Card>
              <SectionHeader icon="bell" title="Rappels" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Notif type="exam" text="Quiz Contrôle de gestion dans 2 jours. 4 notions à consolider avant." action={() => onNav('chat')} actionLabel="Réviser maintenant" />
                <Notif type="reminder" text="Ce soir à 20h30 : session de 10 min sur tes 3 notions prioritaires." action={() => {}} actionLabel="Planifier" />
                <Notif type="progress" text="Bravo, +12 % en Finance d'entreprise cette semaine." />
              </div>
            </Card>
          </div>
        </div>

        {/* ── Row 4: Notions prioritaires + Historique chat ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Notions prioritaires full */}
          <Card>
            <SectionHeader icon="layers" title="Notions prioritaires" badge={`${PRIORITIES.length} notions`} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {PRIORITIES.map((p, i) => {
                const t = PRIORITY_THEME[p.priority];
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0',
                    borderTop: i ? '1px solid #f8fafc' : 'none',
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 7, background: t.bg,
                      border: `1px solid ${t.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 11, color: t.fg, flexShrink: 0,
                    }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.notion}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{p.course} · {p.errors} erreur{p.errors > 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' }}>
                        <Icon name="clock" size={12} color="#94a3b8" />{p.time} min
                      </div>
                      <button onClick={() => onNav('chat')} style={{
                        fontSize: 11, fontWeight: 600, color: '#2563eb', background: '#eff6ff',
                        border: '1px solid #bfdbfe', padding: '4px 9px', borderRadius: 7,
                        fontFamily: 'inherit', cursor: 'pointer',
                      }}>Réviser</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* BLOC F — Historique chat */}
          <Card>
            <SectionHeader icon="message-square" title="Historique des conversations" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {CHAT_HISTORY.map((h, i) => {
                const mMeta = MODE_META[h.mode] || MODE_META.explain;
                return (
                  <div key={h.id} onClick={() => onNav('chat')} style={{
                    display: 'flex', gap: 12, padding: '12px 0', cursor: 'pointer',
                    borderTop: i ? '1px solid #f8fafc' : 'none',
                    transition: 'all 200ms',
                  }}
                    onMouseEnter={e => e.currentTarget.style.paddingLeft = '6px'}
                    onMouseLeave={e => e.currentTarget.style.paddingLeft = '0'}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: '#eff6ff', border: '1px solid #dbeafe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={mMeta.icon} size={16} color="#2563eb" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.topic}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6, fontStyle: 'italic' }}>« {h.excerpt} »</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {h.tags.map(tag => (
                          <span key={tag} style={{ fontSize: 10, fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '2px 7px', borderRadius: 5 }}>{tag}</span>
                        ))}
                        <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 'auto' }}>{h.date}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button onClick={() => onNav('chat')} style={{
                marginTop: 8, width: '100%', padding: '10px', borderRadius: 10,
                border: '1px dashed #e2e8f0', background: 'transparent', color: '#2563eb',
                fontWeight: 600, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Icon name="plus" size={14} color="#2563eb" />Nouvelle conversation
              </button>
            </div>
          </Card>
        </div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
};

window.Hub = Hub;
