// Shared primitives for the Kapsul student kit
const { useState, useEffect, useRef } = React;

const KMark = ({ size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.3,
    background: 'linear-gradient(90deg,#2563eb 0%,#06b6d4 50%,#f97316 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 900, fontSize: size * 0.55, letterSpacing: '-0.02em',
    boxShadow: '0 4px 12px rgba(37,99,235,0.25)', flexShrink: 0,
  }}>K</div>
);

const Wordmark = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <KMark size={36} />
    <span style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.03em', color: '#0f172a' }}>Kapsul</span>
  </div>
);

const Icon = ({ name, size = 18, color, strokeWidth = 2 }) => {
  const ref = React.useRef(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !window.lucide) return;
    el.innerHTML = `<i data-lucide="${name}"></i>`;
    window.lucide.createIcons({
      attrs: {
        width: String(size), height: String(size),
        stroke: color || 'currentColor',
        'stroke-width': String(strokeWidth),
        fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      },
    });
  }, [name, size, color, strokeWidth]);
  return (
    <span ref={ref} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, flexShrink: 0, color: color || 'currentColor',
    }} />
  );
};

const Pill = ({ children, tone = 'slate', dot = false }) => {
  const tones = {
    slate:  { bg: '#f1f5f9', fg: '#334155', dot: '#94a3b8' },
    blue:   { bg: '#eff6ff', fg: '#2563eb', dot: '#3b82f6' },
    green:  { bg: '#ecfdf5', fg: '#059669', dot: '#10b981' },
    orange: { bg: '#fff7ed', fg: '#ea580c', dot: '#f97316' },
    red:    { bg: '#fef2f2', fg: '#dc2626', dot: '#ef4444' },
    purple: { bg: '#faf5ff', fg: '#9333ea', dot: '#a855f7' },
  };
  const t = tones[tone] || tones.slate;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: t.bg, color: t.fg, padding: '4px 10px',
      borderRadius: 9999, fontSize: 11, fontWeight: 700,
      letterSpacing: '0.04em',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot }} />}
      {children}
    </span>
  );
};

const Button = ({ children, variant = 'primary', size = 'md', icon, onClick, style = {} }) => {
  const sizes = {
    sm: { pad: '6px 12px', fs: 13, br: 8 },
    md: { pad: '10px 18px', fs: 14, br: 12 },
    lg: { pad: '12px 22px', fs: 15, br: 12 },
  };
  const variants = {
    primary: { bg: '#2563eb', fg: '#fff', bd: 'transparent', sh: '0 8px 16px -4px rgba(37,99,235,0.3)' },
    secondary: { bg: '#fff', fg: '#334155', bd: '#e2e8f0', sh: 'none' },
    ghost: { bg: 'transparent', fg: '#475569', bd: 'transparent', sh: 'none' },
    danger: { bg: '#fef2f2', fg: '#dc2626', bd: 'transparent', sh: 'none' },
    accent: { bg: '#f97316', fg: '#fff', bd: 'transparent', sh: '0 4px 12px -2px rgba(249,115,22,0.3)' },
  };
  const s = sizes[size]; const v = variants[variant];
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: v.bg, color: v.fg, border: `1px solid ${v.bd}`,
      padding: s.pad, borderRadius: s.br, fontSize: s.fs, fontWeight: 600,
      fontFamily: 'inherit', cursor: 'pointer', boxShadow: v.sh,
      transition: 'all 200ms ease', ...style,
    }}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
};

const Card = ({ children, style = {} }) => (
  <div style={{
    background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16,
    padding: 24, boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
    ...style,
  }}>{children}</div>
);

const IconBtn = ({ icon, onClick, title, active = false }) => (
  <button onClick={onClick} title={title} style={{
    width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: active ? '#eff6ff' : 'transparent', color: active ? '#2563eb' : '#64748b',
    border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 200ms',
  }}>
    <Icon name={icon} size={18} />
  </button>
);

window.KMark = KMark; window.Wordmark = Wordmark; window.Icon = Icon;
window.Pill = Pill; window.Button = Button; window.Card = Card; window.IconBtn = IconBtn;
