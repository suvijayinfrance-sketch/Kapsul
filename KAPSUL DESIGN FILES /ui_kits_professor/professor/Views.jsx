// Kapsul Professor Kit — Views: Mes classes, Contenus, Analytics, Alertes

// ── MES CLASSES ────────────────────────────────────────────────────────
const MES_CLASSES = [
  { name: 'L3 Sciences Cognitives', students: 48, progress: 64, engagement: 78, risk: 7, agent: 'Explication', fragile: 'Charge extrinsèque', lastAction: 'Quiz de vérification · hier', color: '#2563EB' },
  { name: 'M1 Méthodologie',        students: 31, progress: 74, engagement: 86, risk: 2, agent: 'Entraînement', fragile: 'Mémoire de travail',  lastAction: 'Plan de séance · 27 mai',    color: '#16A34A' },
  { name: 'Statistiques L3',        students: 56, progress: 51, engagement: 62, risk: 11, agent: 'Explication', fragile: 'Modèles probabilistes', lastAction: 'Exercice ciblé · 25 mai',   color: '#DC2626' },
  { name: 'Neurosciences L3',       students: 38, progress: 71, engagement: 83, risk: 4, agent: 'Entraînement', fragile: 'Mémoire épisodique',  lastAction: 'Flashcards · hier',          color: '#7C3AED' },
];

const STUDENTS = [
  { name: 'Sophie Martin',  class: 'L3 Cognitives', last: 'Il y a 2h',  progress: 78, engagement: 85, mastery: 74, status: 'Actif' },
  { name: 'Thomas Lebrun',  class: 'L3 Cognitives', last: 'Il y a 4h',  progress: 62, engagement: 58, mastery: 55, status: 'À accompagner' },
  { name: 'Camille Dupont', class: 'M1 Méthodo',    last: 'Hier',        progress: 91, engagement: 94, mastery: 88, status: 'Actif' },
  { name: 'Lucas Bernard',  class: 'Stats L3',       last: '3 jours',    progress: 41, engagement: 32, mastery: 38, status: 'Inactif' },
  { name: 'Amina Toure',    class: 'M1 Méthodo',    last: 'Il y a 1h',  progress: 83, engagement: 79, mastery: 81, status: 'Actif' },
  { name: 'Mehdi Chafik',   class: 'L3 Cognitives', last: '14 jours',   progress: 29, engagement: 18, mastery: 24, status: 'Inactif' },
  { name: 'Julie Moreau',   class: 'Stats L3',       last: 'Il y a 6h',  progress: 67, engagement: 71, mastery: 63, status: 'Actif' },
  { name: 'Paul Girard',    class: 'Neuro L3',       last: '6 jours',    progress: 44, engagement: 38, mastery: 41, status: 'À accompagner' },
];

const STATUS_S = {
  'Actif':         { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  'À accompagner': { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  'Inactif':       { color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
};

const ClassesView = () => {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Classes suivies',        value: '4',    icon: 'graduation-cap', color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Étudiants suivis',       value: '173',  icon: 'users',          color: '#16A34A', bg: '#F0FDF4' },
          { label: 'Progression moyenne',    value: '65%',  icon: 'trending-up',    color: '#0891B2', bg: '#ECFEFF' },
          { label: 'Étudiants à accompagner', value: '24',  icon: 'alert-triangle', color: '#DC2626', bg: '#FEF2F2' },
        ].map((k, i) => (
          <PCard key={i} padding={16}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{k.label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PIcon name={k.icon} size={13} color={k.color} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>{k.value}</div>
          </PCard>
        ))}
      </div>

      {/* Class cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {MES_CLASSES.map((c, i) => (
          <PCard key={i} style={{ cursor: 'pointer', border: selected === i ? `2px solid ${c.color}` : '1px solid #E5E7EB', transition: 'all 150ms' }}>
            <div onClick={() => setSelected(selected === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{c.students} étudiants</div>
                </div>
                <PBadge color={c.risk > 6 ? '#DC2626' : c.risk > 3 ? '#F97316' : '#16A34A'} bg={c.risk > 6 ? '#FEF2F2' : c.risk > 3 ? '#FFF7ED' : '#F0FDF4'} border={c.risk > 6 ? '#FECACA' : c.risk > 3 ? '#FED7AA' : '#BBF7D0'} dot>{c.risk} à accompagner</PBadge>
              </div>
              {[{ label: 'Progression', value: c.progress }, { label: 'Engagement', value: c.engagement }].map(m => (
                <div key={m.label} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 3 }}><span>{m.label}</span><span style={{ fontWeight: 700 }}>{m.value}%</span></div>
                  <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3 }}>
                    <div style={{ width: `${m.value}%`, height: '100%', background: m.value >= 70 ? '#16A34A' : m.value >= 55 ? '#F97316' : '#DC2626', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
                <span style={{ fontSize: 10.5, background: AGENT_COLORS_P[c.agent] + '18', color: AGENT_COLORS_P[c.agent], border: `1px solid ${AGENT_COLORS_P[c.agent]}33`, padding: '2px 8px', borderRadius: 9999, fontWeight: 600 }}>Agent dominant : {c.agent}</span>
              </div>
              <div style={{ fontSize: 11.5, color: '#F97316', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 7, padding: '5px 9px', marginBottom: 10 }}>Notion fragile : {c.fragile}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>Dernière action : {c.lastAction}</div>
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <PGhost icon="eye" small>Voir la classe</PGhost>
              <PGhost icon="flag" small>Règle IA</PGhost>
              <PGhost icon="compass" small>Studio</PGhost>
            </div>
          </PCard>
        ))}
      </div>

      {/* Students table */}
      <PCard>
        <PSectionHeader title="Tous mes étudiants" subtitle="Progression · engagement · statut"
          action={<div style={{ display: 'flex', gap: 7 }}><PGhost icon="download" small>Exporter</PGhost><PPrimary icon="send" small>Relancer inactifs</PPrimary></div>} />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
              {['Étudiant', 'Classe', 'Dernière activité', 'Progression', 'Engagement', 'Maîtrise', 'Statut', ''].map(h => (
                <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STUDENTS.map((s, i) => {
              const st = STATUS_S[s.status];
              return (
                <tr key={i} style={{ borderBottom: '1px solid #F8FAFC', background: i % 2 === 0 ? '#FAFBFC' : '#fff' }}>
                  <td style={{ padding: '10px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, color: '#1D4ED8', flexShrink: 0 }}>
                        {s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontWeight: 600, color: '#111827' }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 10px', color: '#6B7280' }}>{s.class}</td>
                  <td style={{ padding: '10px 10px', color: '#9CA3AF', fontSize: 12 }}>{s.last}</td>
                  <td style={{ padding: '10px 10px', minWidth: 110 }}><PProgressBar value={s.progress} /></td>
                  <td style={{ padding: '10px 10px', minWidth: 110 }}><PProgressBar value={s.engagement} /></td>
                  <td style={{ padding: '10px 10px', minWidth: 110 }}><PProgressBar value={s.mastery} /></td>
                  <td style={{ padding: '10px 10px' }}><PBadge color={st.color} bg={st.bg} border={st.border} dot>{s.status}</PBadge></td>
                  <td style={{ padding: '10px 10px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <PGhost icon="eye" small>Profil</PGhost>
                      {s.status !== 'Actif' && <PGhost icon="send" small>Relancer</PGhost>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </PCard>
    </div>
  );
};

// ── CONTENUS CRÉÉS ────────────────────────────────────────────────────
const CONTENUS_P = [
  { title: 'Plan de séance CM3 — Charge cognitive', type: 'Support',   course: 'Charge CM3',  date: 'Aujourd\'hui', usage: 84, impact: '+12 pts', status: 'Publié' },
  { title: 'Quiz Mémoire de travail — 10 questions', type: 'Quiz',      course: 'Charge CM3',  date: 'Hier',         usage: 91, impact: '+9 pts',  status: 'Publié' },
  { title: 'Flashcards Neurosciences S6',           type: 'Flashcards', course: 'Neuro L3',    date: 'Hier',         usage: 73, impact: '+7 pts',  status: 'Publié' },
  { title: 'Exercice différencié Statistiques',     type: 'Exercice',   course: 'Stats L3',    date: '27 mai',       usage: 58, impact: '+4 pts',  status: 'Publié' },
  { title: 'Activité socratique — Épistémologie',   type: 'Activité',   course: 'M1 Méthodo',  date: '25 mai',       usage: 67, impact: '+8 pts',  status: 'Publié' },
  { title: 'Fiche révision Méthodologie M1',        type: 'Révision',   course: 'M1 Méthodo',  date: '23 mai',       usage: 79, impact: '+6 pts',  status: 'Publié' },
  { title: 'Évaluation partielle Cognitives',       type: 'Évaluation', course: 'L3 Cognitives', date: '20 mai',     usage: 88, impact: '+5 pts',  status: 'Terminée' },
];
const TYPE_C = { 'Support': '#2563EB', 'Quiz': '#F97316', 'Flashcards': '#7C3AED', 'Exercice': '#16A34A', 'Activité': '#0891B2', 'Révision': '#6D28D9', 'Évaluation': '#DC2626' };

const ContenusView = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
      {[
        { label: 'Contenus créés',   value: '28', icon: 'file-text', color: '#2563EB', bg: '#EFF6FF', delta: '+5 ce mois' },
        { label: 'Quiz générés',      value: '8',  icon: 'clipboard-check', color: '#F97316', bg: '#FFF7ED', delta: '+3' },
        { label: 'Flashcards',        value: '124', icon: 'layers', color: '#7C3AED', bg: '#F5F3FF', delta: '+24' },
        { label: 'Impact moyen',      value: '+8 pts', icon: 'trending-up', color: '#16A34A', bg: '#F0FDF4', delta: '+2 pts' },
      ].map((k, i) => (
        <PCard key={i} padding={16}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>{k.label}</span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PIcon name={k.icon} size={13} color={k.color} /></div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{k.value}</div>
          <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>{k.delta}</div>
        </PCard>
      ))}
    </div>

    <PCard>
      <PSectionHeader title="Mes contenus" subtitle="Tous types · utilisation et impact"
        action={<div style={{ display: 'flex', gap: 7 }}><PGhost icon="download" small>Exporter</PGhost><PPrimary icon="compass" small>Studio</PPrimary></div>} />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
            {['Titre', 'Type', 'Cours', 'Date', 'Utilisation', 'Impact', 'Statut', ''].map(h => (
              <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CONTENUS_P.map((c, i) => {
            const tc = TYPE_C[c.type] || '#6B7280';
            return (
              <tr key={i} style={{ borderBottom: '1px solid #F8FAFC', background: i % 2 === 0 ? '#FAFBFC' : '#fff' }}>
                <td style={{ padding: '11px 10px', fontWeight: 600, color: '#111827', maxWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <PIcon name="file-text" size={13} color="#9CA3AF" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                  </div>
                </td>
                <td style={{ padding: '11px 10px' }}>
                  <span style={{ background: tc + '18', color: tc, border: `1px solid ${tc}44`, padding: '3px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>{c.type}</span>
                </td>
                <td style={{ padding: '11px 10px', color: '#6B7280', fontSize: 12 }}>{c.course}</td>
                <td style={{ padding: '11px 10px', color: '#9CA3AF', fontSize: 12 }}>{c.date}</td>
                <td style={{ padding: '11px 10px', minWidth: 110 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 50, height: 5, background: '#F1F5F9', borderRadius: 3 }}>
                      <div style={{ width: `${c.usage}%`, height: '100%', background: c.usage >= 75 ? '#16A34A' : '#F97316', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{c.usage}%</span>
                  </div>
                </td>
                <td style={{ padding: '11px 10px', fontWeight: 700, color: '#16A34A' }}>{c.impact}</td>
                <td style={{ padding: '11px 10px' }}>
                  <PBadge color={c.status === 'Publié' ? '#16A34A' : '#6B7280'} bg={c.status === 'Publié' ? '#F0FDF4' : '#F9FAFB'} border={c.status === 'Publié' ? '#BBF7D0' : '#E5E7EB'} dot>{c.status}</PBadge>
                </td>
                <td style={{ padding: '11px 10px' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <PGhost icon="eye" small>Voir</PGhost>
                    <PGhost icon="bar-chart-2" small>Stats</PGhost>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </PCard>
  </div>
);

// ── PROGRESSION ────────────────────────────────────────────────────────
const ProgressionView = () => {
  const NOTIONS = [
    { name: 'Charge intrinsèque',    mastery: 72, trend: +8,  groups: [82, 74, 61, 72] },
    { name: 'Charge extrinsèque',    mastery: 56, trend: -3,  groups: [58, 63, 49, 56] },
    { name: 'Charge essentielle',    mastery: 71, trend: +5,  groups: [76, 71, 67, 71] },
    { name: 'Mémoire de travail',    mastery: 62, trend: +2,  groups: [69, 65, 52, 62] },
    { name: 'Apprentissage profond', mastery: 66, trend: +11, groups: [73, 68, 57, 66] },
    { name: 'Modèles probabilistes', mastery: 44, trend: -6,  groups: [48, 51, 38, 44] },
  ];
  const hColor = v => v >= 70 ? { bg: '#DCFCE7', text: '#166534' } : v >= 55 ? { bg: '#FEF9C3', text: '#854D0E' } : { bg: '#FEE2E2', text: '#991B1B' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Progression moyenne',  value: '65%',  icon: 'trending-up',    color: '#16A34A', bg: '#F0FDF4' },
          { label: 'Notions maîtrisées',   value: '31',   icon: 'check',          color: '#2563EB', bg: '#EFF6FF' },
          { label: 'À consolider',         value: '14',   icon: 'alert-triangle', color: '#F97316', bg: '#FFF7ED' },
          { label: 'Notions critiques',    value: '4',    icon: 'zap',            color: '#DC2626', bg: '#FEF2F2' },
        ].map((k, i) => (
          <PCard key={i} padding={16}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>{k.label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PIcon name={k.icon} size={13} color={k.color} /></div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{k.value}</div>
          </PCard>
        ))}
      </div>

      <PCard>
        <PSectionHeader title="Maîtrise par notion" subtitle="Score moyen · Groupe A / B / C / Moy."
          action={<PPrimary icon="plus" small>Exercice ciblé</PPrimary>} />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '4px 8px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, width: 200 }}>Notion</th>
                {['Groupe A', 'Groupe B', 'Groupe C', 'Moyenne', 'Tendance', 'Action'].map(h => (
                  <th key={h} style={{ textAlign: 'center', padding: '4px 8px', fontSize: 11, color: '#374151', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NOTIONS.map((n, ni) => (
                <tr key={ni}>
                  <td style={{ padding: '4px 8px', fontSize: 13, color: '#374151', fontWeight: 600 }}>{n.name}</td>
                  {n.groups.map((v, gi) => {
                    const c = hColor(v);
                    return (
                      <td key={gi} style={{ padding: 3 }}>
                        <div style={{ background: c.bg, color: c.text, borderRadius: 8, padding: '9px 0', textAlign: 'center', fontWeight: 700, fontSize: 13, minWidth: 60 }}>{v}%</div>
                      </td>
                    );
                  })}
                  <td style={{ padding: 3, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: n.trend > 0 ? '#16A34A' : '#DC2626', fontWeight: 700, fontSize: 12 }}>
                      <PIcon name={n.trend > 0 ? 'trending-up' : 'trending-down'} size={13} color={n.trend > 0 ? '#16A34A' : '#DC2626'} />
                      {n.trend > 0 ? '+' : ''}{n.trend} pts
                    </div>
                  </td>
                  <td style={{ padding: 3, textAlign: 'center' }}>
                    {n.mastery < 65 && <PGhost icon="plus" small>Exercice</PGhost>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PCard>
    </div>
  );
};

// ── ALERTES ────────────────────────────────────────────────────────────
const AlertesView = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {[
        { label: 'Alertes actives',  value: '7',  icon: 'alert-triangle', color: '#DC2626', bg: '#FEF2F2' },
        { label: 'Étudiants concern.', value: '24', icon: 'users',        color: '#F97316', bg: '#FFF7ED' },
        { label: 'Résolues ce mois', value: '12', icon: 'check',          color: '#16A34A', bg: '#F0FDF4' },
      ].map((k, i) => (
        <PCard key={i} padding={16}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>{k.label}</span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PIcon name={k.icon} size={13} color={k.color} /></div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{k.value}</div>
        </PCard>
      ))}
    </div>

    <PCard>
      <PSectionHeader title="Alertes pédagogiques" subtitle="Signaux actionnables détectés par Kapsul" />
      {[
        { border: '#DC2626', iconBg: '#FEF2F2', iconColor: '#DC2626', icon: 'alert-triangle', title: 'Notion à consolider', body: '62% des étudiants ont échoué aux questions liées à la Charge extrinsèque.', action: 'Créer exercice ciblé', actionColor: '#DC2626' },
        { border: '#F97316', iconBg: '#FFF7ED', iconColor: '#F97316', icon: 'trending-down', title: 'Groupe B · −24% d\'activité', body: 'L\'activité du Groupe B diminue depuis 7 jours. Aucune session IA cette semaine.', action: 'Voir les étudiants', actionColor: '#F97316' },
        { border: '#7C3AED', iconBg: '#F5F3FF', iconColor: '#7C3AED', icon: 'zap', title: 'Usage IA déséquilibré', body: 'CM3 Charge cognitive : 58% Explication, 7% Vérification. Déséquilibre détecté 3 semaines.', action: 'Activer une règle', actionColor: '#7C3AED' },
        { border: '#EAB308', iconBg: '#FEFCE8', iconColor: '#CA8A04', icon: 'repeat', title: 'Révisions faibles avant examen', body: 'Seulement 31% des étudiants ont utilisé le mode Révision cette semaine.', action: 'Planifier session', actionColor: '#CA8A04' },
        { border: '#DC2626', iconBg: '#FEF2F2', iconColor: '#DC2626', icon: 'user-check', title: '3 étudiants inactifs depuis 14 jours', body: 'Lucas Bernard, Mehdi Chafik et Paul Girard n\'ont réalisé aucune interaction IA.', action: 'Envoyer relance', actionColor: '#DC2626' },
        { border: '#0891B2', iconBg: '#ECFEFF', iconColor: '#0891B2', icon: 'lightbulb', title: 'Opportunité d\'action', body: 'Créer un quiz de vérification pourrait améliorer la maîtrise de la charge extrinsèque.', action: 'Créer quiz', actionColor: '#0891B2' },
        { border: '#16A34A', iconBg: '#F0FDF4', iconColor: '#16A34A', icon: 'trending-up', title: 'Amélioration Groupe A', body: 'Le Groupe A a gagné 12 points de progression depuis la dernière règle pédagogique.', action: 'Voir le détail', actionColor: '#16A34A' },
      ].map((a, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 0', borderBottom: i < 6 ? '1px solid #F8FAFC' : 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: a.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PIcon name={a.icon} size={14} color={a.iconColor} />
          </div>
          <div style={{ flex: 1, borderLeft: `3px solid ${a.border}`, paddingLeft: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: '#111827', marginBottom: 3 }}>{a.title}</div>
            <div style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.55, marginBottom: 9 }}>{a.body}</div>
            <div style={{ display: 'flex', gap: 7 }}>
              <button style={{ background: a.iconBg, color: a.actionColor, border: `1px solid ${a.border}44`, padding: '5px 11px', borderRadius: 8, fontWeight: 600, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}>{a.action}</button>
              <PGhost icon="check" small>Résolu</PGhost>
            </div>
          </div>
        </div>
      ))}
    </PCard>
  </div>
);

window.ClassesView = ClassesView;
window.ContenusView = ContenusView;
window.ProgressionView = ProgressionView;
window.AlertesView = AlertesView;
