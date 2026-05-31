import { useKapsul, KAPSUL_THEME } from './shell.jsx';
import { KapsulIcons as Icons } from './icons.jsx';
import './landing.css';

function LangToggle({ lang, setLang }) {
  const k = KAPSUL_THEME.v1;
  return (
    <div style={{
      display: 'flex', background: '#F1F5F9', borderRadius: 6,
      padding: 2, fontSize: 12, fontWeight: 600,
    }}>
      {['fr', 'en'].map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
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
}

const GRADIENT = 'linear-gradient(90deg, #2563eb 0%, #06b6d4 50%, #f97316 100%)';

function KMark({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: GRADIENT,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 900, fontSize: size * 0.55,
      letterSpacing: '-0.02em',
      boxShadow: '0 4px 16px rgba(37,99,235,0.18)',
      flexShrink: 0,
    }}>K</div>
  );
}

function Plexus() {
  const nodes = [
    [60, 40], [120, 30], [80, 90], [40, 140], [100, 150],
    [160, 90], [150, 160], [200, 50], [210, 140], [260, 110],
  ];
  const edges = [
    [0, 1], [0, 2], [1, 2], [1, 5], [2, 3], [2, 4], [3, 4], [4, 6],
    [5, 6], [5, 7], [5, 9], [6, 8], [7, 9], [8, 9], [1, 7], [2, 5],
  ];
  return (
    <svg viewBox="0 0 300 200" className="kp-plexus" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="kp-edge" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]} y1={nodes[a][1]}
          x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="url(#kp-edge)" strokeWidth="1.2" strokeOpacity="0.55"
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n[0]} cy={n[1]}
          r={i % 3 === 0 ? 5 : 3.5}
          fill={i === 0 ? '#2563eb' : i === nodes.length - 1 ? '#f97316' : '#0891b2'}
          className="kp-node"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 23 23">
      <rect x="1" y="1" width="10" height="10" fill="#f25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
      <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
      <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
    </svg>
  );
}

const FEATURE_ICONS = {
  sparkles: Icons.Sparkle,
  database: Icons.Database,
  'shield-check': Icons.ShieldCheck,
};

export function LandingScreen() {
  const { lang, setLang, t, role, setRole, setScreen } = useKapsul();

  const enterApp = () => {
    setScreen(role === 'student' ? 'hub' : role === 'professor' ? 'studio' : 'pulse');
  };

  const navItems = [t.landingNavPlatform, t.landingNavSecurity, t.landingNavPricing, t.landingNavInstitutions];
  const trustItems = [t.landingTrust1, t.landingTrust2, t.landingTrust3, t.landingTrust4];
  const universities = lang === 'fr'
    ? ['Sciences Po', 'Sorbonne Université', 'HEC Paris', 'EPF', 'Université Lyon 1', 'INSA']
    : ['Sciences Po', 'Sorbonne University', 'HEC Paris', 'EPF', 'University of Lyon 1', 'INSA'];
  const features = [
    { i: 'sparkles', t: t.landingFeature1Title, d: t.landingFeature1Desc, c: '#2563eb', bg: '#eff6ff', bd: '#dbeafe' },
    { i: 'database', t: t.landingFeature2Title, d: t.landingFeature2Desc, c: '#0891b2', bg: '#ecfeff', bd: '#a5f3fc' },
    { i: 'shield-check', t: t.landingFeature3Title, d: t.landingFeature3Desc, c: '#ea580c', bg: '#fff7ed', bd: '#fed7aa' },
  ];

  return (
    <div
      data-screen-label="01 Landing + Login"
      className="kp-landing"
      style={{
        position: 'relative',
        color: '#0f172a',
        background: 'linear-gradient(160deg, #FFF1E0 0%, #FAF7F2 40%, #EEF4FE 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Soft architectural blooms */}
      <div className="kp-bloom1" aria-hidden style={{
        position: 'absolute', top: '-10%', left: '-5%', width: 640, height: 640,
        background: 'radial-gradient(circle, #FED7AA 0%, rgba(254,215,170,0) 65%)',
        pointerEvents: 'none',
      }} />
      <div className="kp-bloom2" aria-hidden style={{
        position: 'absolute', top: '30%', right: '-8%', width: 560, height: 560,
        background: 'radial-gradient(circle, #BFDBFE 0%, rgba(191,219,254,0) 65%)',
        pointerEvents: 'none',
      }} />
      <div className="kp-bloom3" aria-hidden style={{
        position: 'absolute', bottom: '-15%', left: '30%', width: 520, height: 520,
        background: 'radial-gradient(circle, #A5F3FC 0%, rgba(165,243,252,0) 65%)',
        pointerEvents: 'none',
      }} />

      {/* Faint dotted graph paper */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(15,23,42,.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        maskImage: 'linear-gradient(to bottom, #000 0%, transparent 70%)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <header style={{
        position: 'relative', zIndex: 3, padding: '24px 40px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <KMark size={36} />
          <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.03em', color: '#0f172a' }}>Kapsul</span>
        </div>
        <div style={{ flex: 1 }} />
        <nav style={{
          display: 'flex', gap: 28, fontSize: 14,
          color: 'rgba(15,23,42,.7)', fontWeight: 500,
        }}>
          {navItems.map((item) => <span key={item}>{item}</span>)}
        </nav>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LangToggle lang={lang} setLang={setLang} />
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,.7)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(15,23,42,.08)', padding: '6px 12px',
            borderRadius: 9999, fontSize: 12, fontWeight: 600, color: '#334155',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            SecNumCloud
          </span>
        </div>
      </header>

      {/* Hero */}
      <main style={{ position: 'relative', zIndex: 3, maxWidth: 1280, margin: '40px auto 0', padding: '0 40px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.15fr 1fr',
          gap: 60, alignItems: 'center',
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,.7)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(15,23,42,.06)', padding: '6px 14px',
              borderRadius: 9999, fontSize: 12, fontWeight: 600, marginBottom: 24, color: '#475569',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4' }} />
              {t.landingEyebrow}
            </div>

            <h1 style={{
              margin: '0 0 22px', fontWeight: 800, fontSize: 72,
              lineHeight: 1.02, letterSpacing: '-0.03em', color: '#0f172a',
            }}>
              {t.landingHero1}
              <br />
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <span style={{
                  background: GRADIENT,
                  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                }}>{t.landingHeroHighlight}</span>
                <svg width="100%" height="14" viewBox="0 0 300 14" preserveAspectRatio="none"
                  style={{ position: 'absolute', left: 0, bottom: -6, height: 14 }}>
                  <path d="M2,10 Q80,2 150,7 T298,5" stroke="url(#kp-u)" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="kp-u" x1="0" x2="1">
                      <stop offset="0" stopColor="#2563eb" />
                      <stop offset="0.5" stopColor="#06b6d4" />
                      <stop offset="1" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <br />
              {t.landingHero2}
            </h1>

            <p style={{
              margin: '0 0 32px', fontSize: 18, color: 'rgba(15,23,42,.7)',
              lineHeight: 1.6, maxWidth: 540,
            }}>{t.landingSub}</p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
              <button type="button" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#0f172a', color: '#fff', border: 'none',
                padding: '14px 22px', borderRadius: 14, fontWeight: 600, fontSize: 15,
                cursor: 'pointer', boxShadow: '0 8px 20px -4px rgba(15,23,42,.25)',
              }}>
                {t.landingDemo}
                <Icons.Arrow size={16} />
              </button>
              <button type="button" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,.8)', color: '#0f172a',
                border: '1px solid rgba(15,23,42,.08)', padding: '14px 22px',
                borderRadius: 14, fontWeight: 600, fontSize: 15, cursor: 'pointer',
                backdropFilter: 'blur(12px)',
              }}>
                <Icons.Play size={14} />
                {t.landingVideo}
              </button>
            </div>

            <div style={{
              display: 'flex', gap: 24, fontSize: 13,
              color: 'rgba(15,23,42,.55)', flexWrap: 'wrap',
            }}>
              {trustItems.map((b) => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.Check size={14} style={{ color: '#10b981' }} />
                  {b}
                </div>
              ))}
            </div>
          </div>

          {/* Visual collage: plexus card + login card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', top: -18, left: -18, right: 18, bottom: 18,
              background: 'linear-gradient(135deg, rgba(37,99,235,.06), rgba(249,115,22,.06))',
              border: '1px solid rgba(15,23,42,.06)', borderRadius: 28,
              backdropFilter: 'blur(8px)', padding: 24, zIndex: 1,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: '#475569',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                {t.landingMatrix}
              </div>
              <Plexus />
            </div>

            <div style={{
              position: 'relative', zIndex: 2,
              background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(15,23,42,.06)', borderRadius: 24, padding: 30,
              boxShadow: '0 30px 60px -20px rgba(15,23,42,.18)',
              marginTop: 90, marginLeft: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                <KMark size={32} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{t.landingWelcome}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{t.landingWelcomeSub}</div>
                </div>
              </div>

              <div style={{
                display: 'flex', background: '#f1f5f9', borderRadius: 12,
                padding: 3, marginBottom: 18,
              }}>
                {['student', 'professor', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      flex: 1,
                      background: role === r ? '#fff' : 'transparent',
                      color: role === r ? '#0f172a' : '#64748b',
                      border: 'none', padding: '8px 0', borderRadius: 9,
                      fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      boxShadow: role === r ? '0 1px 2px rgba(15,23,42,.04)' : 'none',
                    }}
                  >{t[r]}</button>
                ))}
              </div>

              <button
                type="button"
                onClick={enterApp}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 10, background: '#0f172a', color: '#fff', border: 'none',
                  padding: '14px', borderRadius: 12, fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', marginBottom: 10,
                }}
              >
                <MicrosoftLogo />
                {t.landingMsEntra}
              </button>

              <button
                type="button"
                onClick={enterApp}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 10, background: 'transparent', color: '#334155',
                  border: '1px solid #e2e8f0', padding: '12px', borderRadius: 12,
                  fontWeight: 500, fontSize: 13, cursor: 'pointer',
                }}
              >
                <Icons.Key size={14} />
                {t.landingSaml}
              </button>

              <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#94a3b8' }}>
                {t.landingCharterPrefix}{' '}
                <span style={{ color: '#2563eb' }}>{t.landingCharterLink}</span>
                {t.landingCharterSuffix}
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div style={{
          marginTop: 80, padding: '24px 0',
          borderTop: '1px solid rgba(15,23,42,.06)',
          borderBottom: '1px solid rgba(15,23,42,.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 24,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: '#94a3b8',
          }}>{t.landingDeployed}</span>
          {universities.map((u) => (
            <span key={u} style={{
              fontSize: 15, fontWeight: 600, color: 'rgba(15,23,42,.45)', letterSpacing: '-0.01em',
            }}>{u}</span>
          ))}
        </div>

        {/* Feature cards */}
        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {features.map(({ i, t: title, d, c, bg, bd }) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={title} style={{
                padding: 24, borderRadius: 20,
                background: 'rgba(255,255,255,.78)',
                border: '1px solid rgba(15,23,42,.06)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 1px 2px rgba(15,23,42,.03)',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, background: bg,
                  border: `1px solid ${bd}`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: 14,
                }}>
                  <Icon size={20} style={{ color: c }} />
                </div>
                <div style={{
                  fontWeight: 700, fontSize: 16, marginBottom: 6,
                  color: '#0f172a', letterSpacing: '-0.01em',
                }}>{title}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>{d}</div>
              </div>
            );
          })}
        </div>

        <div style={{ height: 60 }} />
      </main>
    </div>
  );
}
