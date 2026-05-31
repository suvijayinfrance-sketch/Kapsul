// Chat AI — 5 pedagogical mode templates
// Each mode pill click → demo conversation showing that mode's response template

const MODES = [
  { id: 'explain',  label: 'Explication',  icon: 'book-open',    color: '#2563EB', bg: '#EFF6FF', bd: '#DBEAFE',
    sub: 'J\'explique pas à pas, avec des exemples de ton cours.',
    demoQ: 'Explique-moi la théorie de la charge cognitive de Sweller, avec un exemple tiré du CM3.' },
  { id: 'socratic', label: 'Socratique',   icon: 'compass',      color: '#7C3AED', bg: '#F5F3FF', bd: '#DDD6FE',
    sub: 'Je ne donne pas la réponse — je te guide par questions.',
    demoQ: 'Je veux comprendre le seuil de rentabilité, aide-moi.' },
  { id: 'practice', label: 'Entraînement', icon: 'dumbbell',     color: '#F97316', bg: '#FFF7ED', bd: '#FED7AA',
    sub: 'Exercices avec correction et difficulté progressive.',
    demoQ: 'Donne-moi un exercice sur les coûts fixes et variables.' },
  { id: 'check',    label: 'Vérification', icon: 'check-circle', color: '#22C55E', bg: '#F0FDF4', bd: '#BBF7D0',
    sub: 'Mini-test, détection des lacunes, renvoi aux passages clés.',
    demoQ: 'Fais-moi un quiz de vérification sur le contrôle de gestion.' },
  { id: 'recall',   label: 'Révision',     icon: 'repeat',       color: '#6D28D9', bg: '#EDE9FE', bd: '#C4B5FD',
    sub: 'Flashcards et rappels espacés sur ce que tu as déjà vu.',
    demoQ: 'Lance ma session de révision du soir.' },
];

const SUGGESTIONS = {
  explain:  ['Explique-moi la charge cognitive de Sweller', 'Différence mémoire de travail vs long terme ?'],
  socratic: ['Aide-moi à comprendre le seuil de rentabilité sans me donner la réponse', 'Guide-moi sur la méthode Kelsen'],
  practice: ['3 exercices sur les coûts fixes et variables', 'Exercice appliqué sur le seuil de rentabilité'],
  check:    ['Quiz de 5 questions sur le contrôle de gestion', 'Vérifie ma compréhension des ratios financiers'],
  recall:   ['Lance ma session de révision du jour', 'Flashcards sur mes 5 dernières notions vues'],
};

// ── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, icon, tone, onDone }) => {
  const c = { blue:'#2563EB', green:'#22C55E', cyan:'#06B6D4', violet:'#7C3AED', orange:'#F97316' }[tone] || '#2563EB';
  React.useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)',
      background:'#111827', color:'#fff', padding:'10px 18px', borderRadius:9999,
      fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:9, zIndex:100,
      boxShadow:'0 8px 24px rgba(0,0,0,.18)', animation:'toastIn 280ms cubic-bezier(.34,1.56,.64,1)' }}>
      <Icon name={icon} size={15} color={c} />{message}
    </div>
  );
};

// ── Mode picker ──────────────────────────────────────────────────────────────
const ModePicker = ({ mode, setMode }) => (
  <div style={{ display:'flex', gap:4, padding:3, background:'#F8FAFC', borderRadius:12, border:'1px solid #E5E7EB' }}>
    {MODES.map(m => { const a = mode === m.id; return (
      <button key={m.id} onClick={() => setMode(m.id)} title={m.sub} style={{
        display:'inline-flex', alignItems:'center', gap:6, padding:'6px 11px', borderRadius:8,
        background: a?'#fff':'transparent', color: a?m.color:'#6B7280',
        border: a?`1px solid ${m.bd}`:'1px solid transparent',
        boxShadow: a?'0 1px 2px rgba(15,23,42,.05)':'none',
        fontWeight:600, fontSize:12, fontFamily:'inherit', cursor:'pointer', transition:'all 180ms',
      }}><Icon name={m.icon} size={13} color={a?m.color:'#9CA3AF'} />{m.label}</button>
    ); })}
  </div>
);

// ── SectionLabel helper ──────────────────────────────────────────────────────
const SL = ({ icon, label, color }) => (
  <div style={{ display:'inline-flex', alignItems:'center', gap:5,
    fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color, marginBottom:6 }}>
    <Icon name={icon} size={11} color={color} />{label}
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATE 1 — EXPLICATION
// Résumé → Explication → Exemple cours → Mini-check → Sources → Actions
// ════════════════════════════════════════════════════════════════════════════
const TemplateExplain = ({ modeObj, onAddDoc, onFlashcard, onTest }) => {
  const [checked, setChecked] = React.useState(null);
  const [srcOpen, setSrcOpen] = React.useState(false);
  return (
    <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:20, overflow:'hidden',
      boxShadow:'0 1px 3px rgba(15,23,42,.05)' }}>
      <div style={{ padding:'10px 16px 0', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:modeObj.bg,
          color:modeObj.color, border:`1px solid ${modeObj.bd}`, padding:'3px 9px',
          borderRadius:9999, fontSize:11, fontWeight:700 }}>
          <Icon name={modeObj.icon} size={11} color={modeObj.color} />{modeObj.label}
        </span>
        <span style={{ fontSize:11, color:'#9CA3AF', marginLeft:'auto', fontFamily:'ui-monospace,monospace' }}>
          Confiance <span style={{ color:'#22C55E', fontWeight:700 }}>92%</span> · L3 · 4 min
        </span>
      </div>
      <div style={{ padding:'14px 18px' }}>
        <SL icon="zap" label="Résumé" color="#2563EB" />
        <p style={{ margin:'0 0 14px', fontSize:15, fontWeight:500, color:'#111827', lineHeight:1.6 }}>
          La charge cognitive mesure la quantité d'information traitée par la mémoire de travail à un instant donné. Sweller (1988) distingue 3 sources : <strong>intrinsèque</strong>, <strong>extrinsèque</strong> et <strong>essentielle</strong>.
        </p>
        <SL icon="list" label="Explication étape par étape" color="#2563EB" />
        <ol style={{ margin:'6px 0 14px', paddingLeft:18, fontSize:14, color:'#374151', lineHeight:1.7 }}>
          {['La charge intrinsèque vient de la complexité inhérente du contenu lui-même.',
            'La charge extrinsèque vient de la présentation — c\'est celle que l\'enseignant peut réduire.',
            'La charge essentielle est dédiée à la construction de schémas mentaux durables.',
            'Quand le total dépasse la capacité (~7±2 éléments, Miller 1956), l\'apprentissage chute.']
          .map((s,i) => <li key={i} style={{ marginBottom:4 }}>{s}</li>)}
        </ol>
        <SL icon="bookmark" label="Exemple · CM3 du 12 mars" color="#F97316" />
        <div style={{ margin:'6px 0 14px', background:'#FFF7ED', borderLeft:'3px solid #F97316',
          padding:'10px 14px', borderRadius:8, fontSize:14, color:'#1E293B', lineHeight:1.6 }}>
          Dans ton CM3 : lire un graphique <em>tout en</em> écoutant les consignes vocales double la charge extrinsèque inutilement. Séparer les deux supports libère ~30 % de capacité.
        </div>
        <SL icon="help-circle" label="Mini-check" color="#22C55E" />
        <div style={{ margin:'6px 0 14px', background:'#F8FAFC', border:'1px solid #F1F5F9', borderRadius:12, padding:14 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:10 }}>Sur quelle charge un bon design pédagogique agit-il en priorité ?</div>
          {['Charge intrinsèque','Charge extrinsèque ✓','Charge essentielle','Charge totale'].map((o,i) => {
            const correct = o.includes('✓'); const sel = checked===i; const label = o.replace(' ✓','');
            return (
              <div key={i} onClick={() => setChecked(i)} style={{
                display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8,
                cursor:'pointer', fontSize:13, marginBottom:5,
                background: sel?(correct?'#F0FDF4':'#FEF2F2'):'#fff',
                border:`1px solid ${sel?(correct?'#BBF7D0':'#FECACA'):'#F1F5F9'}`,
                color: sel?(correct?'#166534':'#991B1B'):'#374151', transition:'all 150ms',
              }}>
                <span style={{ width:16, height:16, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                  border:`1.5px solid ${sel?(correct?'#22C55E':'#EF4444'):'#CBD5E1'}`,
                  background: sel?(correct?'#22C55E':'#EF4444'):'#fff' }}>
                  {sel && <Icon name={correct?'check':'x'} size={10} color="#fff" />}
                </span>
                {label}
                {sel && <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, color: correct?'#22C55E':'#EF4444' }}>{correct?'Correct ✓':'Voir explication ↑'}</span>}
              </div>
            );
          })}
        </div>
        <button onClick={() => setSrcOpen(o=>!o)} style={{ display:'flex', alignItems:'center', gap:6,
          background:'transparent', border:'none', color:'#6B7280', fontSize:12, fontWeight:600,
          fontFamily:'inherit', cursor:'pointer', padding:'0 0 10px', marginBottom: srcOpen?8:0 }}>
          <Icon name="link" size={13} color="#9CA3AF" />
          {srcOpen ? 'Masquer les sources' : '3 sources RAG'}
          <Icon name={srcOpen?'chevron-up':'chevron-down'} size={13} color="#9CA3AF" />
        </button>
        {srcOpen && (
          <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:12 }}>
            {[['Sweller — Cognitive load during problem solving (1988)','257'],
              ['CM3 · Charge cognitive · 12 mars','4'],
              ['Paas & Van Merriënboer (1994)','122']].map(([t,p],i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 10px',
                borderRadius:8, background:'#F8FAFC', border:'1px solid #F1F5F9', fontSize:12 }}>
                <span style={{ fontFamily:'ui-monospace,monospace', color:'#0891B2', fontWeight:700, background:'#ECFEFF', padding:'2px 6px', borderRadius:4, fontSize:10 }}>#{i+1}</span>
                <span style={{ flex:1, color:'#111827', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t}</span>
                <span style={{ color:'#9CA3AF', fontFamily:'ui-monospace,monospace', flexShrink:0 }}>p.{p}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display:'flex', gap:8, paddingTop:12, borderTop:'1px solid #F1F5F9', flexWrap:'wrap', alignItems:'center' }}>
          <button onClick={onAddDoc} style={{ display:'inline-flex', alignItems:'center', gap:7,
            background:'#2563EB', color:'#fff', border:'none', padding:'9px 14px', borderRadius:10,
            fontWeight:600, fontSize:13, fontFamily:'inherit', cursor:'pointer', boxShadow:'0 4px 12px -2px rgba(37,99,235,.3)' }}>
            <Icon name="file-plus" size={14} color="#fff" />Ajouter au document
          </button>
          <button onClick={onFlashcard} style={{ display:'inline-flex', alignItems:'center', gap:7,
            background:'#F5F3FF', color:'#7C3AED', border:'1px solid #DDD6FE', padding:'9px 14px',
            borderRadius:10, fontWeight:600, fontSize:13, fontFamily:'inherit', cursor:'pointer' }}>
            <Icon name="layers" size={14} color="#7C3AED" />Créer une flashcard
          </button>
          <button onClick={onTest} style={{ display:'inline-flex', alignItems:'center', gap:7,
            background:'#F0FDF4', color:'#22C55E', border:'1px solid #BBF7D0', padding:'9px 14px',
            borderRadius:10, fontWeight:600, fontSize:13, fontFamily:'inherit', cursor:'pointer' }}>
            <Icon name="check-circle" size={14} color="#22C55E" />Me tester
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATE 2 — SOCRATIQUE
// Questions guidées, jamais de réponse directe, progression visible
// ════════════════════════════════════════════════════════════════════════════
const TemplateSocratic = ({ modeObj }) => {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [val, setVal] = React.useState('');

  const questions = [
    { q: "Commence par là : qu'est-ce qu'une entreprise doit couvrir chaque mois pour rester en vie, même si elle ne vend rien ?",
      hint: "Pense au loyer, aux salaires fixes, aux amortissements…",
      expected: "coûts fixes" },
    { q: "Bien. Et quand elle vend, elle encaisse des revenus. Qu'est-ce qui se passe au moment précis où ces revenus deviennent juste suffisants pour couvrir tous ces coûts ?",
      hint: "C'est un point d'équilibre — ni bénéfice, ni perte.",
      expected: "seuil / équilibre" },
    { q: "Exactement. Maintenant : si je te dis que les coûts fixes sont 60 000 € et que la marge sur coûts variables est de 40 %, comment tu calcules ce point d'équilibre ?",
      hint: "Coûts fixes ÷ taux de marge sur coûts variables.",
      expected: "150 000 €" },
  ];

  const current = questions[Math.min(step, questions.length - 1)];
  const done = step >= questions.length;

  const submit = () => {
    if (!val.trim()) return;
    setAnswers(a => ({ ...a, [step]: val }));
    setVal('');
    setStep(s => s + 1);
  };

  return (
    <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:20, overflow:'hidden',
      boxShadow:'0 1px 3px rgba(15,23,42,.05)' }}>
      <div style={{ padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between',
        borderBottom:'1px solid #F1F5F9', background:'#FAFBFF' }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:modeObj.bg,
          color:modeObj.color, border:`1px solid ${modeObj.bd}`, padding:'3px 9px',
          borderRadius:9999, fontSize:11, fontWeight:700 }}>
          <Icon name={modeObj.icon} size={11} color={modeObj.color} />{modeObj.label}
        </span>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          {questions.map((_,i) => (
            <div key={i} style={{ width: i < step ? 20 : 8, height:8, borderRadius:4,
              background: i < step ? '#7C3AED' : i === step ? '#C4B5FD' : '#E9D5FF',
              transition:'all 300ms' }} />
          ))}
          <span style={{ fontSize:11, color:'#7C3AED', fontWeight:700, marginLeft:4 }}>
            {done ? 'Compris !' : `${step + 1} / ${questions.length}`}
          </span>
        </div>
      </div>
      <div style={{ padding:'18px 18px 14px' }}>
        {done ? (
          <div style={{ textAlign:'center', padding:'16px 0' }}>
            <div style={{ width:52, height:52, borderRadius:'50%', background:'#EDE9FE', border:'2px solid #C4B5FD',
              display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
              <Icon name="check" size={24} color="#7C3AED" />
            </div>
            <div style={{ fontWeight:700, fontSize:16, color:'#111827', marginBottom:6 }}>Concept maîtrisé !</div>
            <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.6, marginBottom:16 }}>
              Tu as reconstruit la définition du seuil de rentabilité par toi-même. C'est ainsi que les connaissances s'ancrent durablement.
            </div>
            <div style={{ background:'#F5F3FF', border:'1px solid #DDD6FE', borderRadius:12, padding:'12px 16px', textAlign:'left', marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#7C3AED', marginBottom:6 }}>Synthèse · Seuil de rentabilité</div>
              <div style={{ fontSize:13, color:'#374151', lineHeight:1.6 }}>
                Le seuil de rentabilité = <strong>Coûts fixes ÷ Taux de marge/CV</strong>. C'est le niveau de CA à partir duquel l'entreprise cesse d'être en perte. Ici : 60 000 ÷ 0,40 = <strong>150 000 €</strong>.
              </div>
            </div>
            <button style={{ display:'inline-flex', alignItems:'center', gap:7, background:'#7C3AED', color:'#fff',
              border:'none', padding:'10px 18px', borderRadius:10, fontWeight:600, fontSize:13,
              fontFamily:'inherit', cursor:'pointer' }}>
              <Icon name="layers" size={14} color="#fff" />Créer une flashcard sur cette notion
            </button>
          </div>
        ) : (
          <>
            {Object.entries(answers).map(([i, a]) => (
              <div key={i} style={{ marginBottom:12, padding:'10px 14px', background:'#F5F3FF',
                borderRadius:10, border:'1px solid #DDD6FE', fontSize:13, color:'#374151' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#7C3AED', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  Question {parseInt(i)+1} · Ta réponse
                </div>
                {a}
              </div>
            ))}
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#06B6D4,#F97316)',
                display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:13, flexShrink:0 }}>K</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, color:'#111827', lineHeight:1.65, fontStyle:'italic', marginBottom:10 }}>
                  « {current.q} »
                </div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#EDE9FE',
                  border:'1px solid #C4B5FD', borderRadius:9, padding:'5px 10px',
                  fontSize:12, color:'#5B21B6', cursor:'pointer' }}>
                  <Icon name="lightbulb" size={13} color="#7C3AED" />
                  Indice : {current.hint}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <input
                value={val} onChange={e => setVal(e.target.value)}
                onKeyDown={e => e.key==='Enter' && submit()}
                placeholder="Ta réponse…"
                style={{ flex:1, padding:'9px 14px', border:'1px solid #E5E7EB', borderRadius:10,
                  fontFamily:'inherit', fontSize:13, outline:'none', color:'#111827', background:'#F8FAFC' }}
              />
              <button onClick={submit} style={{ background:'#7C3AED', color:'#fff', border:'none',
                padding:'9px 14px', borderRadius:10, fontWeight:600, fontSize:13,
                fontFamily:'inherit', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6 }}>
                <Icon name="arrow-right" size={14} color="#fff" />Répondre
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATE 3 — ENTRAÎNEMENT
// Exercice contextualisé, difficulté visible, correction étape par étape
// ════════════════════════════════════════════════════════════════════════════
const TemplatePractice = ({ modeObj }) => {
  const [showCorrection, setShowCorrection] = React.useState(false);
  const [step, setStep] = React.useState(0);

  const correction = [
    { label:"Identifier les coûts fixes", text:"Loyer : 8 000 €, Salaires : 22 000 €, Assurances : 2 000 €. Total CF = 32 000 €." },
    { label:"Calculer la marge sur coûts variables", text:"MSCV = CA − CV = 80 000 − 48 000 = 32 000 €. Taux MSCV = 32 000 ÷ 80 000 = 40 %." },
    { label:"Calculer le seuil de rentabilité", text:"SR = CF ÷ Taux MSCV = 32 000 ÷ 0,40 = 80 000 €. L'entreprise est exactement à l'équilibre." },
  ];

  return (
    <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:20, overflow:'hidden',
      boxShadow:'0 1px 3px rgba(15,23,42,.05)' }}>
      <div style={{ padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between',
        borderBottom:'1px solid #F1F5F9', background:'#FFFAF5' }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:modeObj.bg,
          color:modeObj.color, border:`1px solid ${modeObj.bd}`, padding:'3px 9px',
          borderRadius:9999, fontSize:11, fontWeight:700 }}>
          <Icon name={modeObj.icon} size={11} color={modeObj.color} />{modeObj.label}
        </span>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {['Facile','Moyen','Difficile'].map((d,i) => (
            <span key={i} style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:6,
              background: i===0?'#FFF7ED':'#F8FAFC',
              color: i===0?'#F97316':'#9CA3AF',
              border: i===0?'1px solid #FED7AA':'1px solid #F1F5F9' }}>{d}</span>
          ))}
        </div>
      </div>
      <div style={{ padding:'16px 18px' }}>
        <div style={{ background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#F97316', marginBottom:8 }}>Contexte · Exercice 1/3</div>
          <p style={{ margin:0, fontSize:14, color:'#1E293B', lineHeight:1.7 }}>
            L'entreprise <strong>TechFormation SAS</strong> réalise un chiffre d'affaires mensuel de <strong>80 000 €</strong>. Ses coûts variables s'élèvent à <strong>48 000 €</strong>. Elle supporte également des charges fixes : loyer (8 000 €), salaires fixes (22 000 €) et assurances (2 000 €).
          </p>
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:10 }}>Questions</div>
          {['Calculez le total des coûts fixes mensuels.',
            'Calculez la marge sur coûts variables et son taux.',
            'Calculez le seuil de rentabilité mensuel. Concluez.']
          .map((q,i) => (
            <div key={i} style={{ display:'flex', gap:10, padding:'10px 0',
              borderTop: i?'1px solid #F8FAFC':'none', alignItems:'flex-start' }}>
              <span style={{ width:22, height:22, borderRadius:7, background:'#FFF7ED',
                border:'1px solid #FED7AA', display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:700, fontSize:11, color:'#F97316', flexShrink:0, marginTop:1 }}>{i+1}</span>
              <div style={{ fontSize:13, color:'#374151', lineHeight:1.55 }}>{q}</div>
            </div>
          ))}
        </div>
        {!showCorrection ? (
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setShowCorrection(true)} style={{
              flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7,
              background:'#F97316', color:'#fff', border:'none', padding:'10px 16px', borderRadius:10,
              fontWeight:600, fontSize:13, fontFamily:'inherit', cursor:'pointer',
              boxShadow:'0 4px 12px -2px rgba(249,115,22,.3)' }}>
              <Icon name="eye" size={14} color="#fff" />Voir la correction pas à pas
            </button>
            <button style={{ background:'#FFF7ED', color:'#F97316', border:'1px solid #FED7AA',
              padding:'10px 14px', borderRadius:10, fontWeight:600, fontSize:13,
              fontFamily:'inherit', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6 }}>
              <Icon name="lightbulb" size={14} color="#F97316" />Indice
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#6B7280', marginBottom:10 }}>Correction · étape par étape</div>
            {correction.map((c,i) => (
              <div key={i} style={{
                padding:'12px 14px', borderRadius:10, marginBottom:8,
                background: i <= step ? '#F0FDF4' : '#F8FAFC',
                border:`1px solid ${i <= step ? '#BBF7D0' : '#F1F5F9'}`,
                opacity: i > step ? 0.5 : 1, transition:'all 300ms',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: i <= step ? 6 : 0 }}>
                  <span style={{ width:20, height:20, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                    background: i < step ? '#22C55E' : i === step ? '#2563EB' : '#CBD5E1',
                    color:'#fff', fontWeight:700, fontSize:10, flexShrink:0 }}>
                    {i < step ? <Icon name="check" size={11} color="#fff" /> : i+1}
                  </span>
                  <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{c.label}</span>
                  {i === step && (
                    <button onClick={() => setStep(s => Math.min(s+1, correction.length-1))} style={{
                      marginLeft:'auto', fontSize:11, fontWeight:600, color:'#2563EB',
                      background:'#EFF6FF', border:'1px solid #DBEAFE', padding:'3px 8px',
                      borderRadius:6, fontFamily:'inherit', cursor:'pointer' }}>Suivant →</button>
                  )}
                </div>
                {i <= step && <div style={{ fontSize:13, color:'#374151', lineHeight:1.55, paddingLeft:28 }}>{c.text}</div>}
              </div>
            ))}
            {step >= correction.length - 1 && (
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <button style={{ flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
                  background:'#F97316', color:'#fff', border:'none', padding:'9px', borderRadius:10,
                  fontWeight:600, fontSize:13, fontFamily:'inherit', cursor:'pointer' }}>
                  <Icon name="arrow-right" size={14} color="#fff" />Exercice suivant · Niveau moyen
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATE 4 — VÉRIFICATION
// QCM 5 questions → score → diagnostic lacunes → recommandations
// ════════════════════════════════════════════════════════════════════════════
const TemplateCheck = ({ modeObj }) => {
  const [answers, setAnswers] = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);

  const QCM = [
    { q:"Lequel de ces coûts est un coût fixe ?", opts:["Matières premières","Loyer","Commission commerciale","Transport"], correct:1 },
    { q:"Le seuil de rentabilité est atteint quand…", opts:["CA > Coûts fixes","CA = Coûts totaux","Marge > 0","CA < Coûts variables"], correct:1 },
    { q:"Quelle est la formule de la marge sur coûts variables ?", opts:["CA − Coûts fixes","CA − Coûts variables","Résultat net − Charges","CA × Taux de marge"], correct:1 },
    { q:"Si le taux de MSCV est de 25 % et les CF de 50 000 €, le seuil de rentabilité est…", opts:["12 500 €","200 000 €","75 000 €","125 000 €"], correct:1 },
    { q:"Un coût semi-variable est…", opts:["Uniquement fixe","Uniquement variable","À la fois fixe et variable","Indépendant du CA"], correct:2 },
  ];

  const score = submitted ? QCM.filter((q,i) => answers[i] === q.correct).length : 0;

  const gaps = submitted ? QCM.filter((q,i) => answers[i] !== q.correct).map((q,i) => ({ ...q, idx:i })) : [];

  return (
    <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:20, overflow:'hidden',
      boxShadow:'0 1px 3px rgba(15,23,42,.05)' }}>
      <div style={{ padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between',
        borderBottom:'1px solid #F1F5F9', background:'#F0FDF4' }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:modeObj.bg,
          color:modeObj.color, border:`1px solid ${modeObj.bd}`, padding:'3px 9px',
          borderRadius:9999, fontSize:11, fontWeight:700 }}>
          <Icon name={modeObj.icon} size={11} color={modeObj.color} />{modeObj.label}
        </span>
        {!submitted && <span style={{ fontSize:12, color:'#6B7280', fontWeight:600 }}>{Object.keys(answers).length} / {QCM.length} réponses</span>}
        {submitted && (
          <span style={{ fontSize:12, fontWeight:700,
            color: score >= 4 ? '#22C55E' : score >= 3 ? '#F97316' : '#EF4444' }}>
            Score : {score} / {QCM.length}
          </span>
        )}
      </div>
      <div style={{ padding:'16px 18px' }}>
        {!submitted ? (
          <>
            {QCM.map((q,qi) => (
              <div key={qi} style={{ marginBottom:16, padding:'12px 14px', borderRadius:12,
                background:'#FAFAFA', border:'1px solid #F1F5F9' }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:8 }}>
                  <span style={{ color:'#9CA3AF', fontFamily:'ui-monospace,monospace', fontSize:11, marginRight:8 }}>0{qi+1}</span>
                  {q.q}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  {q.opts.map((o,oi) => (
                    <div key={oi} onClick={() => setAnswers(a => ({...a,[qi]:oi}))} style={{
                      display:'flex', alignItems:'center', gap:10, padding:'7px 10px', borderRadius:8,
                      cursor:'pointer', fontSize:13,
                      background: answers[qi]===oi ? '#F0FDF4' : '#fff',
                      border:`1px solid ${answers[qi]===oi ? '#BBF7D0' : '#F1F5F9'}`,
                      color: answers[qi]===oi ? '#166534' : '#374151', transition:'all 100ms',
                    }}>
                      <span style={{ width:14, height:14, borderRadius:'50%', flexShrink:0,
                        border:`1.5px solid ${answers[qi]===oi?'#22C55E':'#CBD5E1'}`,
                        background: answers[qi]===oi?'#22C55E':'#fff',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {answers[qi]===oi && <Icon name="check" size={9} color="#fff" />}
                      </span>
                      {o}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => Object.keys(answers).length === QCM.length && setSubmitted(true)}
              style={{
                width:'100%', padding:'11px', borderRadius:12, fontWeight:700, fontSize:14,
                fontFamily:'inherit', cursor: Object.keys(answers).length === QCM.length ? 'pointer' : 'not-allowed',
                background: Object.keys(answers).length === QCM.length ? '#22C55E' : '#F1F5F9',
                color: Object.keys(answers).length === QCM.length ? '#fff' : '#9CA3AF',
                border:'none', boxShadow: Object.keys(answers).length === QCM.length ? '0 4px 12px -2px rgba(34,197,94,.3)' : 'none',
                transition:'all 200ms', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
              }}>
              <Icon name="send" size={15} color={Object.keys(answers).length === QCM.length ? '#fff' : '#9CA3AF'} />
              Soumettre le quiz
            </button>
          </>
        ) : (
          <>
            <div style={{ display:'flex', gap:16, marginBottom:20, padding:'16px', borderRadius:14,
              background: score >= 4 ? '#F0FDF4' : score >= 3 ? '#FFF7ED' : '#FEF2F2',
              border:`1px solid ${score >= 4 ? '#BBF7D0' : score >= 3 ? '#FED7AA' : '#FECACA'}`,
              alignItems:'center' }}>
              <div style={{ width:56, height:56, borderRadius:'50%',
                background: score >= 4 ? '#22C55E' : score >= 3 ? '#F97316' : '#EF4444',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ color:'#fff', fontWeight:900, fontSize:20, letterSpacing:'-0.02em' }}>{score}/{QCM.length}</span>
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:15, color:'#111827', marginBottom:4 }}>
                  {score >= 4 ? 'Excellent — bases solides' : score >= 3 ? 'Bonne base — à consolider' : 'Des lacunes à combler'}
                </div>
                <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.5 }}>
                  {score >= 4 ? 'Tu maîtrises les coûts et le seuil de rentabilité. Passe à la notion suivante.' :
                   score >= 3 ? '2 notions à revoir avant le prochain quiz.' :
                   'Reprends le cours sur les coûts et refais une session d\'explication.'}
                </div>
              </div>
            </div>
            {gaps.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9CA3AF', marginBottom:10 }}>Lacunes détectées</div>
                {gaps.map((g,i) => (
                  <div key={i} style={{ padding:'10px 14px', borderRadius:10, marginBottom:8,
                    background:'#FEF2F2', border:'1px solid #FECACA' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:4 }}>{g.q}</div>
                    <div style={{ fontSize:12, color:'#6B7280' }}>Bonne réponse : <strong style={{ color:'#059669' }}>{g.opts[g.correct]}</strong></div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => { setAnswers({}); setSubmitted(false); }} style={{
                flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
                background:'#fff', color:'#374151', border:'1px solid #E5E7EB',
                padding:'9px', borderRadius:10, fontWeight:600, fontSize:13, fontFamily:'inherit', cursor:'pointer' }}>
                <Icon name="repeat" size={14} color="#6B7280" />Recommencer
              </button>
              <button style={{ flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
                background:'#22C55E', color:'#fff', border:'none',
                padding:'9px', borderRadius:10, fontWeight:600, fontSize:13, fontFamily:'inherit', cursor:'pointer',
                boxShadow:'0 4px 12px -2px rgba(34,197,94,.3)' }}>
                <Icon name="book-open" size={14} color="#fff" />Revoir les notions manquées
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATE 5 — RÉVISION (RECALL)
// Flashcard flip, 3 boutons mémoire, planning espacé
// ════════════════════════════════════════════════════════════════════════════
const TemplateRecall = ({ modeObj }) => {
  const [cardIdx, setCardIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [ratings, setRatings] = React.useState({});

  const cards = [
    { front:'Charge cognitive', back:'Quantité d\'information traitée simultanément par la mémoire de travail. Sweller (1988) distingue 3 types : intrinsèque, extrinsèque, essentielle.', course:'Sciences cognitives', due:'Ce soir' },
    { front:'Seuil de rentabilité', back:'Niveau de CA à partir duquel l\'entreprise couvre tous ses coûts. SR = Coûts fixes ÷ Taux de marge sur coûts variables.', course:'Contrôle de gestion', due:'Demain' },
    { front:'Marge sur coûts variables', back:'MSCV = CA − Coûts variables. Le taux MSCV = MSCV ÷ CA. C\'est la contribution de chaque euro de vente à la couverture des charges fixes.', course:'Contrôle de gestion', due:'Ce soir' },
    { front:'Coût fixe', back:'Charge indépendante du volume produit à court terme (loyer, amortissements, salaires fixes). Reste stable dans une plage d\'activité donnée.', course:'Contrôle de gestion', due:'Dans 3j' },
  ];

  const card = cards[Math.min(cardIdx, cards.length - 1)];
  const done = cardIdx >= cards.length;

  const rate = (r) => {
    setRatings(rt => ({...rt, [cardIdx]: r}));
    setFlipped(false);
    setTimeout(() => setCardIdx(i => i + 1), 200);
  };

  return (
    <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:20, overflow:'hidden',
      boxShadow:'0 1px 3px rgba(15,23,42,.05)' }}>
      <div style={{ padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between',
        borderBottom:'1px solid #F1F5F9', background:'#EDE9FE' }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:modeObj.bg,
          color:modeObj.color, border:`1px solid ${modeObj.bd}`, padding:'3px 9px',
          borderRadius:9999, fontSize:11, fontWeight:700 }}>
          <Icon name={modeObj.icon} size={11} color={modeObj.color} />{modeObj.label}
        </span>
        <div style={{ display:'flex', gap:5 }}>
          {cards.map((_,i) => (
            <div key={i} style={{ width:24, height:6, borderRadius:3,
              background: i < cardIdx ? (ratings[i]==='easy'?'#22C55E':ratings[i]==='hard'?'#F97316':'#EF4444') :
                          i === cardIdx ? '#6D28D9' : '#E9D5FF',
              transition:'all 300ms' }} />
          ))}
          <span style={{ fontSize:11, color:'#6D28D9', fontWeight:700, marginLeft:6 }}>
            {done ? 'Terminé !' : `${cardIdx + 1} / ${cards.length}`}
          </span>
        </div>
      </div>
      <div style={{ padding:'20px 18px' }}>
        {done ? (
          <div style={{ textAlign:'center', padding:'12px 0' }}>
            <div style={{ width:52, height:52, borderRadius:'50%', background:'#EDE9FE', border:'2px solid #C4B5FD',
              display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
              <Icon name="star" size={24} color="#6D28D9" />
            </div>
            <div style={{ fontWeight:700, fontSize:16, color:'#111827', marginBottom:6 }}>Session terminée !</div>
            <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.6, marginBottom:16 }}>
              {Object.values(ratings).filter(r=>r==='easy').length} faciles · {Object.values(ratings).filter(r=>r==='hard').length} difficiles · {Object.values(ratings).filter(r=>r==='again').length} à revoir
            </div>
            <div style={{ background:'#EDE9FE', border:'1px solid #C4B5FD', borderRadius:12, padding:'12px 16px', marginBottom:14, textAlign:'left' }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#6D28D9', marginBottom:8 }}>Prochaine session</div>
              {cards.map((c,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#374151', marginBottom:4 }}>
                  <span>{c.front}</span>
                  <span style={{ color: ratings[i]==='easy'?'#22C55E':ratings[i]==='hard'?'#F97316':'#EF4444', fontWeight:600 }}>
                    {ratings[i]==='easy'?'Dans 7j':ratings[i]==='hard'?'Demain':'Ce soir'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em',
              color:'#6B7280', marginBottom:4 }}>{card.course} · Due : {card.due}</div>
            <div
              onClick={() => setFlipped(f => !f)}
              style={{
                minHeight:140, borderRadius:14, padding:'20px 22px', marginBottom:14,
                background: flipped ? '#EDE9FE' : '#F5F3FF',
                border:`2px solid ${flipped ? '#C4B5FD' : '#DDD6FE'}`,
                cursor:'pointer', transition:'all 250ms', position:'relative', overflow:'hidden',
                display:'flex', flexDirection:'column', justifyContent:'center',
              }}>
              <div style={{ position:'absolute', top:10, right:12, fontSize:11, fontWeight:600,
                color:'#A78BFA' }}>{flipped ? 'Verso — réponse' : 'Recto — concept'}</div>
              <div style={{ fontWeight: flipped ? 500 : 700,
                fontSize: flipped ? 14 : 20, color:'#111827', lineHeight:1.55, letterSpacing: flipped ? 0 : '-0.01em',
                transition:'all 250ms' }}>
                {flipped ? card.back : card.front}
              </div>
              {!flipped && (
                <div style={{ marginTop:12, fontSize:12, color:'#A78BFA', display:'flex', alignItems:'center', gap:6 }}>
                  <Icon name="mouse-pointer-click" size={13} color="#A78BFA" />Clique pour retourner
                </div>
              )}
            </div>
            {flipped ? (
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => rate('again')} style={{ flex:1, padding:'9px 6px', borderRadius:10, fontWeight:600, fontSize:13, fontFamily:'inherit', cursor:'pointer', border:'1px solid #FECACA', background:'#FEF2F2', color:'#DC2626', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                  <Icon name="repeat-2" size={14} color="#DC2626" />À revoir
                </button>
                <button onClick={() => rate('hard')} style={{ flex:1, padding:'9px 6px', borderRadius:10, fontWeight:600, fontSize:13, fontFamily:'inherit', cursor:'pointer', border:'1px solid #FED7AA', background:'#FFF7ED', color:'#F97316', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                  <Icon name="alert-circle" size={14} color="#F97316" />Difficile
                </button>
                <button onClick={() => rate('easy')} style={{ flex:1, padding:'9px 6px', borderRadius:10, fontWeight:600, fontSize:13, fontFamily:'inherit', cursor:'pointer', border:'1px solid #BBF7D0', background:'#F0FDF4', color:'#22C55E', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                  <Icon name="check" size={14} color="#22C55E" />Facile
                </button>
              </div>
            ) : (
              <button onClick={() => setFlipped(true)} style={{
                width:'100%', padding:'10px', borderRadius:10, fontWeight:600, fontSize:13,
                fontFamily:'inherit', cursor:'pointer', border:'1px solid #DDD6FE',
                background:'#F5F3FF', color:'#7C3AED', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <Icon name="flip-horizontal-2" size={14} color="#7C3AED" />Retourner la carte
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// Response dispatcher — picks the right template
// ════════════════════════════════════════════════════════════════════════════
const AIResponse = ({ modeId, modeObj, onAddDoc, onFlashcard, onTest }) => {
  if (modeId === 'explain')  return <TemplateExplain  modeObj={modeObj} onAddDoc={onAddDoc} onFlashcard={onFlashcard} onTest={onTest} />;
  if (modeId === 'socratic') return <TemplateSocratic modeObj={modeObj} />;
  if (modeId === 'practice') return <TemplatePractice modeObj={modeObj} />;
  if (modeId === 'check')    return <TemplateCheck    modeObj={modeObj} />;
  if (modeId === 'recall')   return <TemplateRecall   modeObj={modeObj} />;
  return null;
};

// ── Main ChatPanel ────────────────────────────────────────────────────────────
const ChatPanel = ({ onAddToDoc }) => {
  const [mode, setMode] = React.useState('explain');
  const [hasDemo, setHasDemo] = React.useState(true); // show demo on load
  const [val, setVal] = React.useState('');
  const [coachVisible, setCoachVisible] = React.useState(false);
  const [showSlash, setShowSlash] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const inputRef = React.useRef(null);
  const modeObj = MODES.find(m => m.id === mode);

  // Switch demo when mode changes
  React.useEffect(() => {
    setHasDemo(true);
    setMessages([]);
  }, [mode]);

  const showToast = (msg, icon, tone) => setToast({ msg, icon, tone });

  const submit = (override) => {
    const text = override ?? val;
    if (!text.trim()) return;
    setMessages(m => [...m, { role:'user', text }, { role:'ai' }]);
    setHasDemo(false);
    setVal(''); setShowSlash(false); setCoachVisible(false);
  };
  const onKey = (e) => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); submit(); } };

  React.useEffect(() => {
    const t = val.trim();
    setShowSlash(t.startsWith('/'));
    const vague = t.length > 0 && t.length < 20 && !t.startsWith('/');
    setCoachVisible(vague);
  }, [val]);

  const demoUserQ = modeObj.demoQ;

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#fefefe', minWidth:0 }}>
      {toast && <Toast message={toast.msg} icon={toast.icon} tone={toast.tone} onDone={() => setToast(null)} />}

      {/* Mode bar */}
      <div style={{ padding:'12px 24px 0', flexShrink:0 }}>
        <ModePicker mode={mode} setMode={setMode} />
        <div style={{ fontSize:12, color:'#6B7280', padding:'6px 2px', lineHeight:1.4 }}>{modeObj.sub}</div>
      </div>

      {/* Conversation */}
      <div style={{ flex:1, overflow:'auto', padding:'16px 28px' }}>
        <div style={{ maxWidth:720, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>
          {!hasDemo && messages.length === 0 && (
            <EmptyState modeObj={modeObj} onSuggest={submit} onLMX={() => submit('/LMX ')} />
          )}

          {/* Demo conversation — user Q + mode response template */}
          {hasDemo && (
            <>
              <div style={{ display:'flex', gap:11, flexDirection:'row-reverse' }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'#CBD5E1', flexShrink:0, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>CD</div>
                <div style={{ maxWidth:'78%' }}>
                  <div style={{ background:'#F1F5F9', borderRadius:16, padding:'11px 15px', fontSize:14, lineHeight:1.6, color:'#1E293B' }}>{demoUserQ}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:11 }}>
                <KMark size={28} />
                <div style={{ flex:1, minWidth:0 }}>
                  <AIResponse
                    modeId={mode} modeObj={modeObj}
                    onAddDoc={() => { onAddToDoc?.(); showToast('Ajouté au document', 'file-check', 'blue'); }}
                    onFlashcard={() => showToast('Flashcard créée · Révision dans 3 jours', 'layers', 'violet')}
                    onTest={() => showToast('Session de test lancée', 'check-circle', 'green')}
                  />
                </div>
              </div>
            </>
          )}

          {/* Real conversation (after user sends a message) */}
          {!hasDemo && messages.map((m,i) => (
            <div key={i} style={{ display:'flex', gap:11, flexDirection:m.role==='user'?'row-reverse':'row' }}>
              {m.role==='ai'
                ? <KMark size={28} />
                : <div style={{ width:28, height:28, borderRadius:'50%', background:'#CBD5E1', flexShrink:0, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>CD</div>
              }
              <div style={{ maxWidth: m.role==='ai'?'92%':'78%', flex: m.role==='ai'?1:'unset', minWidth:0 }}>
                {m.role==='user'
                  ? <div style={{ background:'#F1F5F9', borderRadius:16, padding:'11px 15px', fontSize:14, lineHeight:1.6, color:'#1E293B' }}>{m.text}</div>
                  : <AIResponse modeId={mode} modeObj={modeObj}
                      onAddDoc={() => { onAddToDoc?.(); showToast('Ajouté au document', 'file-check', 'blue'); }}
                      onFlashcard={() => showToast('Flashcard créée · Révision dans 3 jours', 'layers', 'violet')}
                      onTest={() => showToast('Session de test lancée', 'check-circle', 'green')}
                    />
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div style={{ padding:'0 28px 22px', flexShrink:0 }}>
        <div style={{ maxWidth:720, margin:'0 auto', position:'relative' }}>
          {coachVisible && (
            <PromptCoach draft={val} modeObj={modeObj}
              onAccept={(t) => { setVal(t); setCoachVisible(false); inputRef.current?.focus(); }}
              onDismiss={() => setCoachVisible(false)} />
          )}
          {showSlash && (
            <div style={{ position:'absolute', bottom:'100%', left:0, right:0, marginBottom:8,
              background:'#fff', border:'1px solid #F1F5F9', borderRadius:16, padding:8,
              boxShadow:'0 8px 30px rgba(0,0,0,.08)', zIndex:5 }}>
              <div style={{ padding:'5px 10px 3px', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#9CA3AF' }}>Modes pédagogiques</div>
              {MODES.map((m,i) => (
                <div key={i} onClick={() => { setMode(m.id); setVal(''); inputRef.current?.focus(); }} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, cursor:'pointer' }}>
                  <Icon name={m.icon} size={14} color={m.color} />
                  <span style={{ fontWeight:700, color:m.color, fontSize:13, fontFamily:'ui-monospace,monospace' }}>/{m.label}</span>
                  <span style={{ fontSize:12, color:'#6B7280' }}>{m.sub}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:22, boxShadow:'0 4px 24px rgba(15,23,42,.06)' }}>
            <div style={{ padding:'14px 18px 0' }}>
              <textarea ref={inputRef} value={val} onChange={e => setVal(e.target.value)} onKeyDown={onKey}
                placeholder={`Mode ${modeObj.label} — pose ta question ou colle un passage de cours…`}
                rows={1}
                style={{ width:'100%', border:'none', outline:'none', resize:'none', fontFamily:'inherit', fontSize:14, color:'#111827', background:'transparent', minHeight:24, lineHeight:1.5 }}
              />
            </div>
            <div style={{ padding:'8px 14px 14px', display:'flex', alignItems:'center', gap:7 }}>
              <IconBtn icon="paperclip" title="Joindre un fichier" />
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:modeObj.bg, color:modeObj.color, border:`1px solid ${modeObj.bd}`, padding:'4px 9px', borderRadius:9999, fontSize:11, fontWeight:700 }}>
                <Icon name={modeObj.icon} size={11} color={modeObj.color} />{modeObj.label}
              </span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#F0FDFA', color:'#0891B2', border:'1px solid #A5F3FC', padding:'4px 9px', borderRadius:9999, fontSize:11, fontWeight:700 }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'#22C55E' }} />RAG
              </span>
              <div style={{ flex:1 }} />
              <button onClick={() => submit()} style={{
                display:'inline-flex', alignItems:'center', gap:8,
                background: val.trim() ? '#2563EB' : '#F1F5F9',
                color: val.trim() ? '#fff' : '#9CA3AF',
                border:'none', padding:'9px 16px', borderRadius:12, fontWeight:700, fontSize:13,
                fontFamily:'inherit', cursor:'pointer',
                boxShadow: val.trim() ? '0 4px 12px -2px rgba(37,99,235,.35)' : 'none',
                transition:'all 200ms',
              }}>
                <Icon name="arrow-up" size={14} color={val.trim()?'#fff':'#9CA3AF'} />
                Demander à Kapsul
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.ChatPanel = ChatPanel;
