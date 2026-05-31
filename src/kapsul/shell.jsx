import { useState, useEffect, useRef, useMemo, createContext, useContext } from 'react';
import { KapsulIcons as Icons } from './icons.jsx';
import { KAPSUL_I18N as T } from './i18n.js';
import { StudentDashboard } from './student/StudentDashboard.jsx';

const KapsulCtx = createContext(null);
export function useKapsul() {
  return useContext(KapsulCtx);
}

export function KapsulProvider({ children, initial }) {
  const [version, setVersion] = useState(initial?.version || 'v1');
  const [role, setRole] = useState(initial?.role || 'student');
  const [lang, setLang] = useState(initial?.lang || 'fr');
  const [screen, setScreen] = useState(initial?.screen || 'auth');

  // Update URL hash so refresh keeps state
  useEffect(() => {
    const h = `#${version}/${role}/${screen}/${lang}`;
    if (location.hash !== h) location.hash = h;
  }, [version, role, screen, lang]);

  const t = T[lang];
  const value = { version, setVersion, role, setRole, lang, setLang, screen, setScreen, t };
  return <KapsulCtx.Provider value={value}>{children}</KapsulCtx.Provider>;
};

// ─────────────── Theme tokens ───────────────
export const KAPSUL_THEME = {
  v1: {
    bg: '#FFFFFF', surface: '#FFFFFF', surfaceAlt: '#F8FAFC',
    border: '#E2E8F0', borderStrong: '#CBD5E1',
    text: '#0F172A', textMuted: '#64748B', textFaint: '#94A3B8',
    primary: '#2563EB', primaryHover: '#1D4ED8', primarySoft: '#EFF6FF',
    success: '#16A34A', warning: '#EA580C', danger: '#DC2626',
    accent2: '#06B6D4',
    sidebarBg: '#F8FAFC', sidebarActive: '#EFF6FF',
    radius: { card: 8, input: 6, modal: 12, badge: 999 },
    fontUI: '"DM Sans", system-ui, sans-serif',
    fontDisplay: '"DM Sans", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", ui-monospace, monospace',
  },
  v2: {
    bg: '#0A0A0F', surface: '#111118', surfaceAlt: '#1A1A24',
    border: '#2A2A3A', borderStrong: '#3A3A4F',
    text: '#F0F0F8', textMuted: '#8888AA', textFaint: '#5C5C7A',
    primary: '#7C3AED', primaryHover: '#6D28D9', primarySoft: 'rgba(124,58,237,0.12)',
    success: '#10B981', warning: '#F59E0B', danger: '#7F1D1D',
    accent2: '#06B6D4',
    sidebarBg: '#111118', sidebarActive: 'rgba(124,58,237,0.15)',
    radius: { card: 4, input: 4, modal: 8, badge: 4 },
    fontUI: '"Space Grotesk", system-ui, sans-serif',
    fontDisplay: '"Playfair Display", Georgia, serif',
    fontMono: '"JetBrains Mono", ui-monospace, monospace',
  },
};

// ─────────────── Nav definitions ───────────────
export const KAPSUL_NAV = {
  student: [
    { label: 'learning', items: [
      { id: 'hub', t: 'kapsulHub', icon: 'Grid' },
      { id: 'dashboard', label: 'Mon Tableau de Bord', icon: 'Pulse' },
      { id: 'chat', t: 'aiChat', sub: 'aiChatSub', icon: 'Chat' },
    ]},
    { label: 'creativeStudio', items: [
      { id: 'word', t: 'msWord', icon: 'Word' },
      { id: 'ppt', t: 'powerpoint', icon: 'Slides' },
      { id: 'excel', t: 'excel', icon: 'Sheet' },
      { id: 'gamma', t: 'gamma', icon: 'Wand' },
    ]},
  ],
  professor: [
    { label: 'teacherSpace', items: [
      { id: 'studio', t: 'studioCours', icon: 'Pen' },
      { id: 'classes', t: 'myClasses', icon: 'Users' },
    ]},
    { label: 'aiTools', items: [
      { id: 'grader', t: 'autoGrader', icon: 'Check' },
      { id: 'synth', t: 'synthesizer', icon: 'Sparkle' },
      { id: 'translator', t: 'translator', icon: 'Languages' },
    ]},
    { label: 'analytics', items: [
      { id: 'radar', t: 'radar', icon: 'Pulse' },
    ]},
  ],
  admin: [
    { label: 'governance', items: [
      { id: 'pulse', t: 'learningPulse', icon: 'Pulse' },
      { id: 'license', t: 'licenseCockpit', icon: 'License' },
    ]},
    { label: 'infrastructure', items: [
      { id: 'store', t: 'kapsulStore', icon: 'Store' },
      { id: 'apikeys', t: 'apiKeys', icon: 'Key' },
    ]},
    { label: 'aiMemory', items: [
      { id: 'rag', t: 'brainSync', icon: 'Brain' },
    ]},
  ],
};

// ─────────────── V1 Sidebar (240px) ───────────────
export function SidebarV1() {
  const { role, screen, setScreen, lang, t } = useKapsul();
  const k = KAPSUL_THEME.v1;
  const nav = KAPSUL_NAV[role];

  const accountLabel = role === 'student' ? t.studentAccount
    : role === 'professor' ? t.professorAccount : t.adminAccount;
  const planLabel = role === 'student' ? t.freePlan
    : role === 'professor' ? t.educationPlan : null;
  const accountInitial = role === 'student' ? 'É' : role === 'professor' ? 'P' : 'A';

  return (
    <aside style={{
      width: 240, background: k.sidebarBg, borderRight: `1px solid ${k.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      fontFamily: k.fontUI, color: k.text,
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icons.K size={28} v="v1" />
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.2 }}>Kapsul</div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
        {nav.map((section, idx) => (
          <div key={idx} style={{ marginTop: idx === 0 ? 12 : 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: k.textFaint,
              padding: '0 12px 8px',
            }}>{t[section.label]}</div>
            {section.items.map(item => {
              const Icon = Icons[item.icon];
              const active = screen === item.id;
              return (
                <button key={item.id} onClick={() => setScreen(item.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', background: active ? k.sidebarActive : 'transparent',
                    border: 'none', borderRadius: 6, cursor: 'pointer',
                    color: active ? k.primary : k.text,
                    fontSize: 14, fontWeight: active ? 600 : 500,
                    fontFamily: 'inherit', textAlign: 'left', marginBottom: 2,
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => !active && (e.currentTarget.style.background = '#F1F5F9')}
                  onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
                >
                  {Icon && <Icon size={17} sw={1.7} />}
                  <span style={{ flex: 1, lineHeight: 1.2 }}>
                    {item.label || t[item.t]}
                    {item.sub && <span style={{ display: 'block', fontSize: 11, fontWeight: 400, color: k.textFaint, marginTop: 1 }}>{t[item.sub]}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: 12, borderTop: `1px solid ${k.border}` }}>
        {role === 'admin' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
            fontSize: 12, color: k.textMuted, marginBottom: 8,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: k.success }}/>
            {t.systemStatus}
          </div>
        )}
        <button onClick={() => setScreen('settings')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', background: 'transparent', border: 'none',
            borderRadius: 6, cursor: 'pointer', color: k.text, fontSize: 14,
            fontFamily: 'inherit', textAlign: 'left', marginBottom: 8,
          }}
        >
          <Icons.Settings size={17} sw={1.7}/>{t.settings}
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: k.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 600, fontSize: 13,
          }}>{accountInitial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{accountLabel}</div>
            {planLabel && <div style={{ fontSize: 11, color: k.textFaint, marginTop: 2 }}>{planLabel}</div>}
          </div>
        </div>
      </div>
    </aside>
  );
};

// ─────────────── V2 Left Rail (collapsible 64 → 280) ───────────────
export function SidebarV2() {
  const { role, screen, setScreen, lang, setLang, t } = useKapsul();
  const k = KAPSUL_THEME.v2;
  const nav = KAPSUL_NAV[role];
  const [hover, setHover] = useState(false);

  const accountInitial = role === 'student' ? 'É' : role === 'professor' ? 'P' : 'A';
  const accountLabel = role === 'student' ? t.studentAccount
    : role === 'professor' ? t.professorAccount : t.adminAccount;

  return (
    <aside
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: hover ? 260 : 64, transition: 'width 0.22s cubic-bezier(.2,.7,.3,1)',
        background: k.sidebarBg, borderRight: `1px solid ${k.border}`,
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        fontFamily: k.fontUI, color: k.text, overflow: 'hidden',
        position: 'relative', zIndex: 5,
      }}
    >
      {/* K monogram */}
      <div style={{ padding: '16px 12px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icons.K size={40} v="v2" />
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 600,
          letterSpacing: '0.18em', color: k.text, opacity: hover ? 1 : 0,
          transition: 'opacity 0.18s', whiteSpace: 'nowrap',
        }}>KAPSUL</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {nav.map((section, idx) => (
          <div key={idx} style={{ marginBottom: 18 }}>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 500,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: k.textFaint,
              padding: '8px 12px 6px', opacity: hover ? 1 : 0, transition: 'opacity 0.18s',
              whiteSpace: 'nowrap',
            }}>{t[section.label]}</div>
            {section.items.map(item => {
              const Icon = Icons[item.icon];
              const active = screen === item.id;
              return (
                <button key={item.id} onClick={() => setScreen(item.id)}
                  title={!hover ? (item.label || t[item.t]) : undefined}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '10px 12px',
                    background: active ? k.sidebarActive : 'transparent',
                    border: 'none', borderRadius: 4, cursor: 'pointer',
                    color: active ? k.primary : k.textMuted,
                    fontSize: 14, fontWeight: active ? 600 : 500,
                    fontFamily: 'inherit', textAlign: 'left', marginBottom: 2,
                    position: 'relative', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => !active && (e.currentTarget.style.color = k.text)}
                  onMouseLeave={e => !active && (e.currentTarget.style.color = k.textMuted)}
                >
                  {active && <span style={{
                    position: 'absolute', left: 0, top: 6, bottom: 6, width: 3,
                    background: k.primary, borderRadius: '0 2px 2px 0',
                  }}/>}
                  {Icon && <Icon size={18} sw={1.6}/>}
                  <span style={{ opacity: hover ? 1 : 0, transition: 'opacity 0.18s' }}>
                    {item.label || t[item.t]}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer: lang + settings + avatar */}
      <div style={{ padding: '8px 8px 14px', borderTop: `1px solid ${k.border}` }}>
        <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14,
            padding: '10px 12px', background: 'transparent', border: 'none',
            borderRadius: 4, cursor: 'pointer', color: k.textMuted,
            fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 500,
            letterSpacing: '0.1em', textAlign: 'left',
          }}
        >
          <Icons.Globe size={18} sw={1.6}/>
          <span style={{ opacity: hover ? 1 : 0, transition: 'opacity 0.18s' }}>
            {lang.toUpperCase()} · {lang === 'fr' ? 'EN →' : 'FR →'}
          </span>
        </button>
        <button onClick={() => setScreen('settings')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14,
            padding: '10px 12px', background: 'transparent', border: 'none',
            borderRadius: 4, cursor: 'pointer', color: k.textMuted,
            fontSize: 14, fontFamily: 'inherit', textAlign: 'left', marginBottom: 4,
          }}
        >
          <Icons.Settings size={18} sw={1.6}/>
          <span style={{ opacity: hover ? 1 : 0, transition: 'opacity 0.18s' }}>{t.settings}</span>
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '6px 8px',
          marginTop: 6, borderTop: `1px solid ${k.border}`, paddingTop: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 600, fontSize: 14, flexShrink: 0,
          }}>{accountInitial}</div>
          <div style={{ minWidth: 0, opacity: hover ? 1 : 0, transition: 'opacity 0.18s', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{accountLabel}</div>
            <div style={{ fontSize: 10, color: k.textFaint, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.08em' }}>
              {role === 'admin' ? '● ONLINE' : role.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

// ─────────────── V1 Header ───────────────
export function HeaderV1({ title, subtitle, right }) {
  const { lang, setLang, t } = useKapsul();
  const k = KAPSUL_THEME.v1;
  return (
    <header style={{
      height: 56, borderBottom: `1px solid ${k.border}`, background: k.surface,
      padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16,
      flexShrink: 0, fontFamily: k.fontUI, color: k.text, position: 'sticky', top: 0, zIndex: 4,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: k.textMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right}
      <div style={{
        display: 'flex', alignItems: 'center', background: '#F1F5F9',
        borderRadius: 6, padding: 2, fontSize: 12, fontWeight: 600,
      }}>
        {['fr', 'en'].map(l => (
          <button key={l} onClick={() => setLang(l)}
            style={{
              padding: '4px 10px', background: lang === l ? '#fff' : 'transparent',
              color: lang === l ? k.primary : k.textMuted, border: 'none',
              borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
              boxShadow: lang === l ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
            }}
          >{l.toUpperCase()}</button>
        ))}
      </div>
      <button style={{
        width: 36, height: 36, borderRadius: 6, border: `1px solid ${k.border}`,
        background: '#fff', cursor: 'pointer', color: k.text,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Icons.Bell size={17} sw={1.7}/></button>
    </header>
  );
};

// ─────────────── Student Dashboard screen ───────────────
export function StudentDashboardScreen() {
  const { version, setScreen } = useKapsul();
  const k = KAPSUL_THEME[version];
  const isV2 = version === 'v2';

  const sessionId =
    sessionStorage.getItem('kapsul_library_session') ||
    sessionStorage.getItem('kapsul_chat_session') ||
    '';

  return (
    <StudentDashboard
      sessionId={sessionId}
      onStartChat={() => setScreen('chat')}
      k={k}
      isV2={isV2}
    />
  );
}
