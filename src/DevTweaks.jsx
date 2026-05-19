import { useKapsul } from './kapsul/shell.jsx';

const ROLE_LABELS = { student: 'Étudiant', professor: 'Prof', admin: 'Admin' };
const ROLE_IDS = { Étudiant: 'student', Prof: 'professor', Admin: 'admin' };

const SCREENS_BY_ROLE = {
  student: [['auth', 'Auth'], ['hub', 'Hub'], ['chat', 'AI Chat']],
  professor: [['auth', 'Auth'], ['studio', 'Studio']],
  admin: [['auth', 'Auth'], ['pulse', 'Pulse'], ['store', 'Store'], ['rag', 'RAG Hub']],
};

export function DevTweaks() {
  const {
    version, setVersion, role, setRole, lang, setLang, screen, setScreen,
  } = useKapsul();

  const onRoleChange = (r) => {
    setRole(r);
    if (screen === 'auth') return;
    if (r === 'student' && !['hub', 'chat', 'todo', 'collab'].includes(screen)) setScreen('hub');
    if (r === 'professor' && !['studio', 'classes', 'grader', 'synth', 'translator', 'radar'].includes(screen)) {
      setScreen('studio');
    }
    if (r === 'admin' && !['pulse', 'license', 'store', 'apikeys', 'rag'].includes(screen)) setScreen('pulse');
  };

  const screenOptions = SCREENS_BY_ROLE[role] || SCREENS_BY_ROLE.student;
  const labels = screenOptions.map(([, label]) => label);
  const ids = screenOptions.map(([id]) => id);
  const currentLabel = labels[ids.indexOf(screen)] || labels[0];

  return (
    <aside style={{
      position: 'fixed', right: 16, bottom: 16, zIndex: 9999,
      width: 260, background: 'rgba(17,17,24,0.92)', color: '#f0f0f8',
      border: '1px solid #2a2a3a', borderRadius: 10, padding: 14,
      fontFamily: 'system-ui, sans-serif', fontSize: 12,
      boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 12, letterSpacing: '0.04em' }}>Dev tweaks</div>
      <TweakRow label="Design">
        <Seg value={version === 'v1' ? 'V1' : 'V2'} options={['V1', 'V2']}
          onChange={(v) => setVersion(v === 'V1' ? 'v1' : 'v2')} />
      </TweakRow>
      <TweakRow label="Language">
        <Seg value={lang.toUpperCase()} options={['FR', 'EN']}
          onChange={(v) => setLang(v.toLowerCase())} />
      </TweakRow>
      <TweakRow label="Role">
        <Seg value={ROLE_LABELS[role]} options={['Étudiant', 'Prof', 'Admin']}
          onChange={(v) => onRoleChange(ROLE_IDS[v])} />
      </TweakRow>
      <TweakRow label="Screen">
        <select value={currentLabel} onChange={(e) => setScreen(ids[labels.indexOf(e.target.value)])}
          style={{
            width: '100%', padding: '6px 8px', borderRadius: 6,
            border: '1px solid #3a3a4f', background: '#111118', color: '#f0f0f8',
            fontFamily: 'inherit', fontSize: 12,
          }}
        >
          {labels.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </TweakRow>
    </aside>
  );
}

function TweakRow({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ color: '#8888aa', marginBottom: 4, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Seg({ value, options, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: '#1a1a24', borderRadius: 6, padding: 2 }}>
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          style={{
            flex: 1, padding: '5px 8px', border: 'none', borderRadius: 4,
            background: value === opt ? '#7c3aed' : 'transparent',
            color: value === opt ? '#fff' : '#8888aa',
            fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}
        >{opt}</button>
      ))}
    </div>
  );
}
