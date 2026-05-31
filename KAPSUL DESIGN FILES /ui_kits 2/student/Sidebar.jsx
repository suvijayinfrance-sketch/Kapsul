// Sidebar — 3 sections: APPRENDRE · PRODUIRE · ORGANISER
const Sidebar = ({ active, onNav }) => {
  const sections = [
    { label: 'Apprendre', items: [
      { id: 'hub',  icon: 'layout-dashboard', label: 'Hub' },
      { id: 'chat', icon: 'sparkles',         label: 'Chat IA' },
    ]},
    { label: 'Produire', items: [
      { id: 'pptx',  icon: 'presentation', label: 'PowerPoint', dot: '#ea580c' },
      { id: 'word',  icon: 'file-text',    label: 'Word',       dot: '#1e40af' },
      { id: 'excel', icon: 'sheet',        label: 'Excel',      dot: '#16a34a' },
    ]},
    { label: 'Organiser', items: [
      { id: 'agenda', icon: 'calendar',          label: 'Agenda' },
      { id: 'collab', icon: 'layout-panel-left', label: 'Espace collaboratif' },
    ]},
  ];

  return (
    <aside style={{
      width: 232, height: '100%',
      background: '#F1F5F9',
      borderRight: '1px solid #E5E7EB',
      display: 'flex', flexDirection: 'column',
      padding: '0 0 16px', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #E5E7EB' }}>
        <KMark size={34} />
        <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.03em', color: '#111827' }}>Kapsul</span>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 10px' }}>
        {sections.map((sec, si) => (
          <div key={si} style={{ marginBottom: 6 }}>
            <div style={{
              padding: '10px 8px 4px', fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.10em', color: '#9CA3AF',
            }}>{sec.label}</div>
            {sec.items.map(it => {
              const isActive = active === it.id;
              return (
                <div key={it.id} onClick={() => onNav(it.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                  background: isActive ? '#E0F2FE' : 'transparent',
                  color: isActive ? '#1D4ED8' : '#4B5563',
                  fontWeight: isActive ? 600 : 500, fontSize: 14,
                  marginBottom: 2,
                  borderLeft: isActive ? '3px solid #2563EB' : '3px solid transparent',
                  transition: 'all 150ms',
                }}>
                  {it.dot ? (
                    <span style={{
                      width: 18, height: 18, borderRadius: 5, background: it.dot,
                      color: '#fff', fontSize: 9, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>{it.label[0]}</span>
                  ) : (
                    <Icon name={it.icon} size={16} color={isActive ? '#1D4ED8' : '#9CA3AF'} />
                  )}
                  <span style={{ flex: 1, lineHeight: 1 }}>{it.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Mastery strip */}
      <div style={{ padding: '0 10px 10px' }}>
        <div style={{
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '10px 12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Maîtrise</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB' }}>68%</span>
          </div>
          <div style={{ fontSize: 12, color: '#374151', fontWeight: 500, marginBottom: 6 }}>Charge cognitive</div>
          <div style={{ height: 4, borderRadius: 2, background: '#F3F4F6', overflow: 'hidden' }}>
            <div style={{ width: '68%', height: '100%', background: 'linear-gradient(90deg,#06B6D4,#2563EB)', borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 11, color: '#06B6D4', marginTop: 6 }}>4 flashcards ce soir · 21:00</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '0 10px', borderTop: '1px solid #E5E7EB', paddingTop: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
          borderRadius: 8, cursor: 'pointer', color: '#4B5563', fontSize: 13, fontWeight: 500,
        }}>
          <Icon name="settings" size={15} color="#9CA3AF" />
          Paramètres
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#CBD5E1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>CD</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>Camille Durand</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>L3 Sciences cognitives</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

window.Sidebar = Sidebar;
