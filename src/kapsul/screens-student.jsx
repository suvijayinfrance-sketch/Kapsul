import { useState } from 'react';
import { KapsulIcons as Ic } from './icons.jsx';
import { KAPSUL_THEME, useKapsul } from './shell.jsx';
import { Badge } from './screens-auth.jsx';

const iconBtn = (k) => ({
  width: 36, height: 36, borderRadius: 6, border: `1px solid ${k.border}`,
  background: 'transparent', color: k.textMuted, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
});

const panelCard = (k, isV2) => ({
  background: isV2 ? k.surface : '#FFFFFF',
  border: isV2 ? `1px solid ${k.border}` : '1px solid #E5E7EB',
  borderRadius: isV2 ? k.radius.card : 16,
  boxShadow: isV2 ? 'none' : '0 4px 14px rgba(15, 23, 42, 0.06)',
  overflow: 'hidden',
});

export function ChatInput({ v, placeholder, onSend }) {
  const k = KAPSUL_THEME[v];
  const isV2 = v === 'v2';
  const [text, setText] = useState('');
  const { t } = useKapsul();

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setText('');
  };

  return (
    <div style={{
      padding: isV2 ? '12px 20px 20px' : '16px 24px 24px',
      borderTop: isV2 ? `1px solid ${k.border}` : 'none',
      background: isV2 ? k.bg : 'transparent',
      flexShrink: 0,
    }}>
      <div style={{
        maxWidth: isV2 ? 'none' : 720, margin: '0 auto', width: '100%',
        ...panelCard(k, isV2),
        boxShadow: isV2 ? 'none' : '0 4px 24px rgba(15,23,42,0.08)',
      }}>
        {isV2 && (
          <div style={{ display: 'flex', gap: 8, padding: '10px 14px 0', borderBottom: `1px solid ${k.border}` }}>
            <Badge v={v} tone="primary" mono>{t.generative}</Badge>
            <Badge v={v} tone="default" mono>{t.ragInfo}</Badge>
            <Badge v={v} tone="cyan" mono>{t.smart}</Badge>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: isV2 ? '12px 14px' : '10px 12px' }}>
          <button type="button" style={iconBtn(k)} aria-label="Attach"><Ic.Plus size={18} sw={1.7} /></button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={placeholder || t.chatPlaceholder}
            rows={1}
            style={{
              flex: 1, resize: 'none', border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'inherit', fontSize: 14, color: k.text, lineHeight: 1.45, minHeight: 24,
            }}
          />
          <button type="button" style={iconBtn(k)} aria-label="Voice"><Ic.Mic size={18} sw={1.7} /></button>
          <button type="button" onClick={send} style={{
            width: 40, height: 40, borderRadius: isV2 ? 4 : 8, border: 'none',
            background: k.primary, color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Ic.Send size={17} sw={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditorPanel({ v, editorTab, setEditorTab }) {
  const k = KAPSUL_THEME[v];
  const isV2 = v === 'v2';
  const { t } = useKapsul();
  const tabs = [
    { id: 'kapsul', label: t.kapsulEditor },
    { id: 'word', label: t.msWord },
    { id: 'notion', label: t.notion },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{
        display: 'flex', gap: isV2 ? 0 : 4, padding: isV2 ? 0 : '12px 16px 0',
        borderBottom: `1px solid ${k.border}`, flexShrink: 0, alignItems: 'center',
      }}>
        {tabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setEditorTab(tab.id)}
            style={{
              padding: isV2 ? '14px 18px' : '8px 14px', background: 'transparent', border: 'none',
              borderBottom: `2px solid ${editorTab === tab.id ? k.primary : 'transparent'}`,
              color: editorTab === tab.id ? k.text : k.textMuted,
              fontFamily: 'inherit', fontSize: 13, fontWeight: editorTab === tab.id ? 600 : 500,
              cursor: 'pointer', marginBottom: -1,
            }}
          >{tab.label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button type="button" style={{
          margin: isV2 ? '10px 16px' : '8px 0', padding: '6px 14px',
          background: k.primary, color: '#fff', border: 'none', borderRadius: isV2 ? 4 : 6,
          fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>{t.save}</button>
      </div>
      <EditorBody k={k} isV2={isV2} t={t} />
    </div>
  );
}

function EditorBody({ k, isV2, t }) {
  return (
    <div style={{
      flex: 1, padding: 24, overflowY: 'auto',
      fontFamily: k.fontUI, color: k.textMuted, fontSize: 14, lineHeight: 1.6,
    }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${k.border}` }}>
        {[Ic.Bold, Ic.Italic, Ic.List].map((Icon, i) => (
          <button key={i} type="button" style={{ ...iconBtn(k), width: 32, height: 32 }}>
            <Icon size={15} sw={1.6} />
          </button>
        ))}
        <span style={{ marginLeft: 8, fontSize: 12, color: k.textFaint, alignSelf: 'center' }}>{t.normalText}</span>
      </div>
      <p style={{ margin: 0, color: k.textFaint }}>{t.editorPlaceholder}</p>
    </div>
  );
}

export function HubScreen() {
  const { version, t, lang, setScreen } = useKapsul();
  const k = KAPSUL_THEME[version];
  const isV2 = version === 'v2';
  const dateStr = new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div data-screen-label="02 Hub" style={{
      flex: 1, background: k.bg, color: k.text, fontFamily: k.fontUI, overflowY: 'auto', minWidth: 0,
    }}>
      <div style={{ padding: isV2 ? '36px 40px 48px' : '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ marginBottom: 28 }}>
          {isV2 ? (
            <>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.16em',
                color: k.textMuted, textTransform: 'uppercase', marginBottom: 8,
              }}>{t.helloSubV2} {dateStr}</div>
              <h1 style={{
                margin: 0, fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic',
                fontSize: 36, fontWeight: 500, letterSpacing: -0.5,
              }}>{t.hello}</h1>
            </>
          ) : (
            <>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: -0.4 }}>{t.hello}</h1>
              <p style={{ margin: '6px 0 0', fontSize: 15, color: k.textMuted }}>{t.helloSub}</p>
            </>
          )}
        </header>

        <div style={{
          display: 'grid', gridTemplateColumns: isV2 ? '1fr 1fr' : '1.2fr 1fr',
          gap: isV2 ? 16 : 20, marginBottom: 24,
        }}>
          <HubCard k={k} isV2={isV2} title={t.recentActivity} src={t.recentSrc}>
            <ActivityRow k={k} time={t.twoHrsAgo} title={t.activity1Title} sub={t.activity1Sub} border />
            <ActivityRow k={k} time={t.yesterday} title={t.activity2Title} sub={t.activity2Sub} />
          </HubCard>
          <HubCard k={k} isV2={isV2} title={t.todoLabel}>
            <TodoRow k={k} label={t.todo1} src={t.todo1Src} />
            <TodoRow k={k} label={t.todo2} src={t.todo2Src} />
            <TodoRow k={k} label={t.todo3} src={t.todo3Src} last />
          </HubCard>
        </div>

        <HubCard k={k} isV2={isV2} title={t.agenda} src={t.agendaSrc} style={{ marginBottom: 24 }}>
          <AgendaRow k={k} day={t.today} title={t.event1} loc={t.event1Loc} />
          <AgendaRow k={k} day={t.tomorrow} title={t.event2} loc={t.event2Loc} />
          <AgendaRow k={k} day={t.tomorrow} title={t.event3} loc={t.event3Loc} last />
        </HubCard>

        <div style={{
          ...panelCard(k, isV2), padding: isV2 ? 28 : 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
          background: isV2
            ? 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(6,182,212,0.08) 100%)'
            : k.primarySoft,
          border: isV2 ? `1px solid ${k.border}` : '1px solid #BFDBFE',
        }}>
          <div>
            <div style={{ fontSize: isV2 ? 20 : 18, fontWeight: 600, color: k.text }}>{t.readyStudy}</div>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: k.textMuted }}>Kapsul AI · Dual-Mode</p>
          </div>
          <button type="button" onClick={() => setScreen('chat')} style={{
            padding: '12px 22px', background: k.primary, color: '#fff', border: 'none',
            borderRadius: isV2 ? 4 : 8, fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
          }}>
            {t.launchAi} <Ic.Arrow size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function HubCard({ k, isV2, title, src, style, children }) {
  return (
    <div style={{ ...panelCard(k, isV2), ...style }}>
      <div style={{
        padding: '14px 18px', borderBottom: `1px solid ${k.border}`,
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12,
      }}>
        <span style={{
          fontSize: isV2 ? 11 : 14, fontWeight: isV2 ? 500 : 600,
          letterSpacing: isV2 ? '0.12em' : 0, textTransform: isV2 ? 'uppercase' : 'none',
          color: isV2 ? k.textMuted : k.text,
          fontFamily: isV2 ? '"JetBrains Mono", monospace' : 'inherit',
        }}>{title}</span>
        {src && <span style={{ fontSize: 12, color: k.textFaint }}>{src}</span>}
      </div>
      <div style={{ padding: '8px 0' }}>{children}</div>
    </div>
  );
}

function ActivityRow({ k, time, title, sub, border }) {
  return (
    <div style={{
      padding: '12px 18px',
      borderBottom: border ? `1px solid ${k.border}` : 'none',
    }}>
      <div style={{ fontSize: 11, color: k.textFaint, marginBottom: 4 }}>{time}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: k.text }}>{title}</div>
      <div style={{ fontSize: 13, color: k.textMuted, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function TodoRow({ k, label, src, last }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px',
      borderBottom: last ? 'none' : `1px solid ${k.border}`, cursor: 'pointer',
    }}>
      <input type="checkbox" style={{ width: 16, height: 16, accentColor: k.primary }} />
      <span style={{ flex: 1, fontSize: 14, color: k.text }}>{label}</span>
      <span style={{ fontSize: 11, color: k.textFaint }}>{src}</span>
    </label>
  );
}

function AgendaRow({ k, day, title, loc, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px',
      borderBottom: last ? 'none' : `1px solid ${k.border}`,
    }}>
      <div style={{ width: 72, fontSize: 11, fontWeight: 600, color: k.textMuted, textTransform: 'uppercase' }}>{day}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: k.text }}>{title}</div>
        <div style={{ fontSize: 12, color: k.textFaint, marginTop: 2 }}>{loc}</div>
      </div>
      <Ic.Calendar size={16} style={{ color: k.textFaint }} />
    </div>
  );
}

export { ChatMvp as ChatScreen } from './chat-mvp/ChatMvp.jsx';
