// Kapsul Professor Kit — primitives
const { useState, useEffect, useRef } = React;

const ICON_PATHS = {
  'home': 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  'compass': 'M12 22a10 10 0 100-20 10 10 0 000 20zM16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z',
  'graduation-cap': 'M22 10v6M2 10l10-5 10 5-10 5-10-5zM6 12v5c3 3 9 3 12 0v-5',
  'file-text': 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'trending-up': 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
  'bell': 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  'activity': 'M22 12h-4l-3 9L9 3l-3 9H2',
  'layers': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  'book-open': 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',
  'edit': 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  'check': 'M20 6L9 17l-5-5',
  'plus': 'M12 5v14M5 12h14',
  'send': 'M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z',
  'download': 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  'zap': 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  'lightbulb': 'M9 18h6M10 22h4M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 00-7-7z',
  'target': 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16a4 4 0 100-8 4 4 0 000 8zM12 13a1 1 0 100-2 1 1 0 000 2z',
  'flag': 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
  'alert-triangle': 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  'users': 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  'user-check': 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM16 11l2 2 4-4',
  'clipboard-check': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  'repeat': 'M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3',
  'calendar': 'M3 4h18v16H3zM16 2v4M8 2v4M3 10h18',
  'clock': 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  'chevron-right': 'M9 18l6-6-6-6',
  'sliders': 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  'bar-chart-2': 'M18 20V10M12 20V4M6 20v-6',
  'eye': 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z',
  'message-square': 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  'settings': 'M12 15a3 3 0 100-6 3 3 0 000 6z',
  'arrow-up': 'M12 19V5M5 12l7-7 7 7',
  'trending-down': 'M23 18l-9.5-9.5-5 5L1 6M17 18h6v-6',
  'dumbbell': 'M14.4 14.4L9.6 9.6M18 6l-2-2a1 1 0 00-1.41 0L3.17 15.41a1 1 0 000 1.41l2 2a1 1 0 001.41 0L18 7.41A1 1 0 0018 6zM6 20l-2-2M18 8l2 2',
  'lock': 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4',
  'x': 'M18 6L6 18M6 6l12 12',
  'external-link': 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3',
};

const PIcon = ({ name, size = 16, color = 'currentColor', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    <path d={ICON_PATHS[name] || ''} />
  </svg>
);

const PCard = ({ children, style = {}, padding = 20 }) => (
  <div style={{
    background: '#fff', border: '1px solid #E5E7EB',
    borderRadius: 16, padding,
    boxShadow: '0 2px 8px rgba(15,23,42,.05)',
    ...style,
  }}>{children}</div>
);

const PBadge = ({ children, color = '#2563EB', bg = '#EFF6FF', border = '#BFDBFE', dot = false }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
    color, background: bg, border: `1px solid ${border}`, whiteSpace: 'nowrap',
  }}>
    {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />}
    {children}
  </span>
);

const PPrimary = ({ children, onClick, icon, small = false }) => (
  <button onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: '#1D4ED8', color: '#fff', border: 'none',
    padding: small ? '7px 12px' : '10px 18px',
    borderRadius: small ? 9 : 11,
    fontWeight: 600, fontSize: small ? 12 : 13,
    fontFamily: 'inherit', cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(29,78,216,.25)',
    transition: 'background 150ms',
  }}
    onMouseEnter={e => e.currentTarget.style.background = '#1e40af'}
    onMouseLeave={e => e.currentTarget.style.background = '#1D4ED8'}>
    {icon && <PIcon name={icon} size={small ? 13 : 15} color="#fff" />}
    {children}
  </button>
);

const PGhost = ({ children, onClick, icon, small = false }) => (
  <button onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: '#fff', color: '#374151', border: '1px solid #E5E7EB',
    padding: small ? '6px 11px' : '9px 16px',
    borderRadius: small ? 9 : 11,
    fontWeight: 500, fontSize: small ? 12 : 13,
    fontFamily: 'inherit', cursor: 'pointer', transition: 'all 150ms',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = '#1D4ED8'; e.currentTarget.style.color = '#1D4ED8'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; }}>
    {icon && <PIcon name={icon} size={small ? 13 : 15} color="currentColor" />}
    {children}
  </button>
);

const PSectionHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
    <div>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{subtitle}</div>}
    </div>
    {action}
  </div>
);

const PTabs = ({ tabs, active, onTab }) => (
  <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginBottom: 20 }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onTab(t.id)} style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '11px 18px', border: 'none', background: 'transparent',
        fontFamily: 'inherit', fontWeight: active === t.id ? 700 : 500,
        fontSize: 13.5, cursor: 'pointer',
        color: active === t.id ? '#1D4ED8' : '#6B7280',
        borderBottom: active === t.id ? '2px solid #2563EB' : '2px solid transparent',
        transition: 'all 150ms', whiteSpace: 'nowrap',
      }}>
        <PIcon name={t.icon} size={14} color={active === t.id ? '#2563EB' : '#9CA3AF'} />
        {t.label}
      </button>
    ))}
  </div>
);

const AGENT_COLORS_P = {
  'Explication': '#2563EB', 'Socratique': '#7C3AED',
  'Entraînement': '#F97316', 'Vérification': '#16A34A', 'Révision': '#6D28D9',
};

const PProgressBar = ({ value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    <div style={{ flex: 1, height: 5, background: '#F1F5F9', borderRadius: 3 }}>
      <div style={{ width: `${value}%`, height: '100%', background: value >= 70 ? '#16A34A' : value >= 50 ? '#F97316' : '#DC2626', borderRadius: 3 }} />
    </div>
    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', minWidth: 30 }}>{value}%</span>
  </div>
);

Object.assign(window, {
  PIcon, PCard, PBadge, PPrimary, PGhost, PSectionHeader, PTabs,
  AGENT_COLORS_P, PProgressBar,
  useState, useEffect, useRef,
});
