import { KapsulIcons as Icons2 } from './icons.jsx';
import { KAPSUL_THEME, useKapsul } from './shell.jsx';
import { LandingScreen } from './LandingScreen.jsx';

// ═══════════════════════════════════════════════════════════
// Shared primitives
// ═══════════════════════════════════════════════════════════
export function Badge({ children, tone = 'default', mono, v }) {
  const k = KAPSUL_THEME[v];
  const tones = v === 'v1' ? {
    default: { bg: '#F1F5F9', color: k.text, border: 'transparent' },
    primary: { bg: '#EFF6FF', color: k.primary, border: 'transparent' },
    success: { bg: '#DCFCE7', color: '#15803D', border: 'transparent' },
    warning: { bg: '#FFEDD5', color: '#C2410C', border: 'transparent' },
    cyan: { bg: '#CFFAFE', color: '#0E7490', border: 'transparent' },
  } : {
    default: { bg: 'rgba(136,136,170,0.1)', color: k.textMuted, border: 'rgba(136,136,170,0.3)' },
    primary: { bg: 'rgba(124,58,237,0.12)', color: '#A78BFA', border: 'rgba(167,139,250,0.4)' },
    success: { bg: 'rgba(16,185,129,0.1)', color: '#34D399', border: 'rgba(52,211,153,0.4)' },
    warning: { bg: 'rgba(245,158,11,0.1)', color: '#FBBF24', border: 'rgba(251,191,36,0.4)' },
    cyan: { bg: 'rgba(6,182,212,0.1)', color: '#22D3EE', border: 'rgba(34,211,238,0.4)' },
  };
  const t = tones[tone] || tones.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: v === 'v2' ? '3px 8px' : '4px 10px',
      borderRadius: v === 'v2' ? 4 : 999,
      fontSize: v === 'v2' ? 10 : 11, fontWeight: 500,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      fontFamily: (mono || v === 'v2') ? '"JetBrains Mono", monospace' : 'inherit',
      background: t.bg, color: t.color,
      border: `1px solid ${t.border}`,
    }}>{children}</span>
  );
};

export function Toggle({ on, onChange, v }) {
  const k = KAPSUL_THEME[v];
  const onColor = v === 'v1' ? '#16A34A' : k.primary;
  const offColor = v === 'v1' ? '#CBD5E1' : '#3A3A4F';
  const W = v === 'v2' ? 44 : 40, H = v === 'v2' ? 24 : 22;
  return (
    <button onClick={() => onChange(!on)}
      style={{
        width: W, height: H, borderRadius: 999, border: 'none',
        background: on ? onColor : offColor, position: 'relative',
        cursor: 'pointer', transition: 'background 0.15s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: on ? W - H + 2 : 2,
        width: H - 4, height: H - 4, borderRadius: '50%',
        background: '#fff', transition: 'left 0.18s cubic-bezier(.2,.7,.3,1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}/>
    </button>
  );
};

// ═══════════════════════════════════════════════════════════
// AUTH (V1 + V2 in one component, branched by version)
// ═══════════════════════════════════════════════════════════
export function AuthScreen() {
  const { version } = useKapsul();
  if (version === 'v1') return <LandingScreen />;
  return <AuthScreenV2 />;
}

function AuthScreenV2() {
  const { lang, setLang, t, role, setRole, setScreen } = useKapsul();
  const k = KAPSUL_THEME.v2;
  const isV2 = true;

  const roleTitle = { student: t.studentSpace, professor: t.professorSpace, admin: t.adminSpace }[role];
  const roleDesc = { student: t.studentDesc, professor: t.professorDesc, admin: t.adminDesc }[role];

  const enterApp = () => {
    setScreen(role === 'student' ? 'hub' : role === 'professor' ? 'studio' : 'pulse');
  };

  return (
    <div data-screen-label="01 Auth" style={{
      width: '100%', height: '100%', display: 'flex',
      background: k.bg, color: k.text, fontFamily: k.fontUI,
      overflow: 'hidden',
    }}>
      {/* LEFT: Hero */}
      <div style={{
        flex: 1, position: 'relative',
        background: isV2
          ? '#0A0A0F'
          : 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)',
        padding: isV2 ? '48px 64px' : '40px 56px',
        display: 'flex', flexDirection: 'column', color: '#fff',
        overflow: 'hidden',
      }}>
        {/* Decorative gradient blob V2 */}
        {isV2 && (
          <div aria-hidden style={{
            position: 'absolute', top: '20%', right: '-20%', width: 600, height: 600,
            borderRadius: '50%', filter: 'blur(120px)', opacity: 0.3,
            background: 'radial-gradient(circle, #7C3AED 0%, transparent 60%)',
            pointerEvents: 'none',
          }}/>
        )}
        {isV2 && (
          <div aria-hidden style={{
            position: 'absolute', bottom: '10%', left: '-10%', width: 500, height: 500,
            borderRadius: '50%', filter: 'blur(120px)', opacity: 0.25,
            background: 'radial-gradient(circle, #06B6D4 0%, transparent 60%)',
            pointerEvents: 'none',
          }}/>
        )}

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2 }}>
          <Icons2.K size={44} v="v2" />
          <div style={{
            fontSize: isV2 ? 14 : 22, fontWeight: isV2 ? 600 : 700,
            letterSpacing: isV2 ? '0.22em' : -0.3,
            fontFamily: isV2 ? '"JetBrains Mono", monospace' : 'inherit',
          }}>{isV2 ? 'KAPSUL' : 'Kapsul'}</div>
        </div>

        {/* Hero */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          maxWidth: 580, position: 'relative', zIndex: 2,
        }}>
          <h1 style={{
            fontFamily: isV2 ? '"Playfair Display", Georgia, serif' : 'inherit',
            fontStyle: isV2 ? 'italic' : 'normal',
            fontSize: isV2 ? 64 : 52, fontWeight: isV2 ? 500 : 700,
            lineHeight: 1.05, letterSpacing: -1, margin: 0, marginBottom: 24,
            textWrap: 'balance',
          }}>{isV2 ? t.heroV2 : t.heroV1}</h1>
          <p style={{
            fontSize: isV2 ? 18 : 17, color: isV2 ? '#8888AA' : '#CBD5E1',
            lineHeight: 1.5, margin: 0, maxWidth: 480,
          }}>{isV2 ? t.heroSubV2 : t.heroSubV1}</p>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          {isV2 ? (
            <>
              <span style={badgeV2(k)}>SECNUMCLOUD</span>
              <span style={badgeV2(k)}>RGPD</span>
              <span style={badgeV2(k)}>{lang === 'fr' ? '99.9% DISPO' : '99.9% SLA'}</span>
            </>
          ) : (
            <>
              <span style={badgeV1Dark()}><Icons2.ShieldCheck size={13}/> SecNumCloud</span>
              <span style={badgeV1Dark()}><Icons2.Lock size={13}/> RGPD/GDPR</span>
              <span style={badgeV1Dark()}>✓ {t.sla}</span>
            </>
          )}
        </div>

        {/* V2: integration marquee */}
        {isV2 && (
          <div style={{
            position: 'absolute', bottom: 24, left: 0, right: 0,
            display: 'flex', gap: 32, padding: '0 64px',
            fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
            color: '#5C5C7A', letterSpacing: '0.1em', whiteSpace: 'nowrap',
            opacity: 0.6,
          }}>
            {['MICROSOFT', 'GOOGLE', 'MOODLE', 'NOTION', 'CANVA', 'BLACKBOARD', 'ZOOM'].map(n =>
              <span key={n}>{n}</span>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Auth card */}
      <div style={{
        width: isV2 ? '50%' : 540,
        background: isV2 ? k.bg : '#F8FAFC',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 32, position: 'relative',
      }}>
        {/* Lang toggle (top right) */}
        <div style={{ position: 'absolute', top: 24, right: 32 }}>
          <LangToggle v="v2" lang={lang} setLang={setLang} />
        </div>

        <div style={{
          width: '100%', maxWidth: 440,
          background: isV2 ? k.surface : '#fff',
          borderRadius: isV2 ? 8 : 12,
          padding: isV2 ? 36 : 32,
          border: isV2 ? `1px solid ${k.border}` : '1px solid transparent',
          boxShadow: isV2 ? 'none' : '0 20px 50px -12px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.06)',
        }}>
          {/* Role tabs */}
          {isV2 ? (
            <div style={{ display: 'flex', gap: 24, marginBottom: 28, borderBottom: `1px solid ${k.border}` }}>
              {['student', 'professor', 'admin'].map(r => (
                <button key={r} onClick={() => setRole(r)}
                  style={{
                    padding: '10px 0', background: 'transparent', border: 'none',
                    borderBottom: `2px solid ${role === r ? k.primary : 'transparent'}`,
                    color: role === r ? k.text : k.textMuted,
                    fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                    cursor: 'pointer', marginBottom: -1,
                  }}
                >{t[r]}</button>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'flex', background: '#F1F5F9', borderRadius: 999,
              padding: 4, marginBottom: 24,
            }}>
              {['student', 'professor', 'admin'].map(r => (
                <button key={r} onClick={() => setRole(r)}
                  style={{
                    flex: 1, padding: '8px 12px',
                    background: role === r ? '#fff' : 'transparent',
                    color: role === r ? k.primary : k.textMuted,
                    border: 'none', borderRadius: 999,
                    fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: role === r ? '0 1px 3px rgba(15,23,42,.08)' : 'none',
                  }}
                >{t[r]}</button>
              ))}
            </div>
          )}

          <h2 style={{
            margin: 0, marginBottom: 6,
            fontSize: isV2 ? 26 : 22, fontWeight: isV2 ? 600 : 700,
            color: k.text, letterSpacing: -0.4,
            fontFamily: isV2 ? '"Space Grotesk", sans-serif' : 'inherit',
          }}>{roleTitle}</h2>
          <p style={{
            margin: 0, marginBottom: 24, fontSize: 14, color: k.textMuted,
          }}>{roleDesc}</p>

          {/* MS SSO */}
          <button onClick={enterApp} style={{
            width: '100%', height: 48, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10,
            background: isV2 ? k.surfaceAlt : '#fff',
            color: k.text, border: `1px solid ${k.border}`,
            borderRadius: isV2 ? 4 : 8,
            fontFamily: 'inherit', fontSize: 15, fontWeight: 500,
            cursor: 'pointer', marginBottom: 16,
          }}>
            <MicrosoftLogo />
            {isV2 ? t.msSsoV2 : t.msSso}
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0',
            color: k.textFaint, fontSize: 12,
          }}>
            <div style={{ flex: 1, height: 1, background: k.border }}/>
            {t.or}
            <div style={{ flex: 1, height: 1, background: k.border }}/>
          </div>

          <input type="email" placeholder={t.email}
            style={{
              width: '100%', height: 44, padding: '0 14px',
              background: isV2 ? k.bg : '#fff',
              border: `1px solid ${k.border}`, borderRadius: isV2 ? 4 : 6,
              fontFamily: 'inherit', fontSize: 14, color: k.text, marginBottom: 10,
              outline: 'none',
            }}
          />
          <input type="password" placeholder={t.password}
            style={{
              width: '100%', height: 44, padding: '0 14px',
              background: isV2 ? k.bg : '#fff',
              border: `1px solid ${k.border}`, borderRadius: isV2 ? 4 : 6,
              fontFamily: 'inherit', fontSize: 14, color: k.text, marginBottom: 16,
              outline: 'none',
            }}
          />

          <button onClick={enterApp} style={{
            width: '100%', height: 48, background: k.primary, color: '#fff',
            border: 'none', borderRadius: isV2 ? 4 : 8,
            fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {isV2 ? t.access : t.signIn}
            {isV2 && <Icons2.Arrow size={16}/>}
          </button>

          {!isV2 && (
            <div style={{
              padding: '12px 14px', background: '#EFF6FF', borderRadius: 6,
              fontSize: 12, color: '#1E40AF', lineHeight: 1.5,
            }}>{t.authNote}</div>
          )}

          <div style={{ marginTop: 18, fontSize: 13, color: k.textMuted }}>
            {isV2 ? <>{t.problemPrefix}<a style={{ color: k.primary, textDecoration: 'underline' }}>{t.supportShort}</a></>
              : <a style={{ color: k.primary, textDecoration: 'none' }}>{t.supportLink}</a>}
          </div>
        </div>
      </div>
    </div>
  );
};

const LangToggle = ({ v, lang, setLang }) => {
  const k = KAPSUL_THEME[v];
  if (v === 'v2') {
    return (
      <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
        style={{
          background: 'transparent', border: `1px solid ${k.border}`,
          color: k.textMuted, padding: '6px 10px', borderRadius: 4,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
          fontWeight: 500, letterSpacing: '0.1em', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >🌐 {lang.toUpperCase()}</button>
    );
  }
  return (
    <div style={{
      display: 'flex', background: '#F1F5F9', borderRadius: 6,
      padding: 2, fontSize: 12, fontWeight: 600,
    }}>
      {['fr', 'en'].map(l => (
        <button key={l} onClick={() => setLang(l)}
          style={{
            padding: '4px 10px',
            background: lang === l ? '#fff' : 'transparent',
            color: lang === l ? k.primary : k.textMuted,
            border: 'none', borderRadius: 4, cursor: 'pointer',
            fontFamily: 'inherit', fontWeight: 600,
          }}
        >{l.toUpperCase()}</button>
      ))}
    </div>
  );
};
export { LangToggle };

const MicrosoftLogo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <rect x="0" y="0" width="7" height="7" fill="#F35325"/>
    <rect x="9" y="0" width="7" height="7" fill="#81BC06"/>
    <rect x="0" y="9" width="7" height="7" fill="#05A6F0"/>
    <rect x="9" y="9" width="7" height="7" fill="#FFBA08"/>
  </svg>
);


const badgeV1Dark = () => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 12px', borderRadius: 999,
  background: 'rgba(255,255,255,0.08)', color: '#fff',
  fontSize: 12, fontWeight: 500, border: '1px solid rgba(255,255,255,0.12)',
});
const badgeV2 = (k) => ({
  display: 'inline-flex', alignItems: 'center',
  padding: '6px 10px', borderRadius: 4,
  background: '#1A1A24', color: '#8888AA',
  fontSize: 11, fontWeight: 500, letterSpacing: '0.12em',
  fontFamily: '"JetBrains Mono", monospace',
  border: '1px solid #2A2A3A',
});
