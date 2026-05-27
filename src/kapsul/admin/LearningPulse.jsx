import { useState, useEffect, useRef } from 'react';
import { fetchKPIs, fetchHeatmap, fetchTopDocuments } from './analytics-api.js';

const GRADIENT_BAR = 'linear-gradient(90deg, #2563EB 0%, #06B6D4 50%, #F97316 100%)';

const KPI_CARDS = [
  {
    key: 'adoption_rate',
    label: "Taux d'Adoption Global",
    format: (v) => `${v}%`,
    color: '#2563EB',
    icon: '📈',
    trend: '+5% cette semaine',
    desc: 'Sessions avec plus de 2 échanges',
  },
  {
    key: 'total_messages',
    label: 'Messages Totaux',
    format: (v) => v.toLocaleString('fr-FR'),
    color: '#06B6D4',
    icon: '💬',
    trend: 'Toutes sessions confondues',
    desc: 'Étudiants + bibliothèque partagée',
  },
  {
    key: 'tokens_saved',
    label: 'Tokens Économisés',
    format: (v) =>
      v >= 1000000
        ? `${(v / 1000000).toFixed(1)}M`
        : v >= 1000
          ? `${(v / 1000).toFixed(0)}K`
          : String(v),
    color: '#10B981',
    icon: '⚡',
    trend: 'vs approche full-document',
    desc: 'Grâce au RAG (97K tokens/réponse)',
  },
  {
    key: 'indexed_documents',
    label: 'Documents Indexés',
    format: (v) => String(v),
    color: '#F59E0B',
    icon: '📚',
    trend: 'Dans la bibliothèque partagée',
    desc: 'Prêts pour le chat étudiant',
  },
];

const DAY_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const RANK_COLORS = ['#2563EB', '#06B6D4', '#10B981', '#64748B', '#94A3B8'];

function heatColor(intensity) {
  if (intensity === 0) return '#F8FAFC';
  if (intensity < 0.2) return '#DBEAFE';
  if (intensity < 0.4) return '#93C5FD';
  if (intensity < 0.6) return '#3B82F6';
  if (intensity < 0.8) return '#1D4ED8';
  return '#1E3A8A';
}

function heatTextColor(intensity) {
  return intensity > 0.5 ? '#FFFFFF' : '#64748B';
}

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const to = Number(target) || 0;
    const from = prevTarget.current;
    prevTarget.current = to;
    if (to === from && value === to) return undefined;

    const start = performance.now();
    let frame;

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      setValue(Math.round(from + (to - from) * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function truncate(str, max = 30) {
  if (!str) return '';
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

function DashboardHeader({ refreshing, onRefresh }) {
  return (
    <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: 0 }}>
      <div style={{ height: 4, background: GRADIENT_BAR }} />
      <div
        style={{
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Learning Pulse
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 999,
                background: '#F0FDF4',
                color: '#16A34A',
                border: '1px solid #BBF7D0',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              🔒 Privacy Firewall Actif
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
            Tableau de bord analytique institutionnel
          </p>
          <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>
            Données issues de sessions réelles · Hébergé en France · Zéro donnée transmise aux
            LLMs publics
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid #E2E8F0',
            background: '#F8FAFC',
            color: '#64748B',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'inherit',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              animation: refreshing ? 'kapsul-spin 0.8s linear infinite' : 'none',
            }}
          >
            ↺
          </span>
          Actualiser
        </button>
      </div>
    </div>
  );
}

function KPICard({ card, kpis }) {
  const raw = kpis?.[card.key] ?? 0;
  const animated = useCountUp(raw);

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderLeft: `3px solid ${card.color}`,
        borderRadius: 8,
        padding: '18px 20px',
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 6,
            }}
          >
            {card.label}
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>
            {card.format(animated)}
          </div>
        </div>
        <span style={{ fontSize: 22 }}>{card.icon}</span>
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: '#64748B' }}>{card.desc}</div>
      <div style={{ marginTop: 4, fontSize: 11, color: card.color, fontWeight: 600 }}>
        {card.trend}
      </div>
    </div>
  );
}

function Heatmap({ data, setTooltip }) {
  const matrix = data?.matrix?.length ? data.matrix : Array.from({ length: 7 }, () => Array(13).fill(0));
  const days = data?.days?.length ? data.days : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const hours = data?.hours?.length ? data.hours : Array.from({ length: 13 }, (_, i) => `${i + 8}h`);
  const maxValue = data?.max_value || 1;

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 8,
        padding: '20px 24px',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Connexions Temporelles</div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
          Activité des étudiants par heure et jour de la semaine
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `44px repeat(${hours.length}, 28px)`,
            gap: 4,
            marginBottom: 4,
          }}
        >
          <div />
          {hours.map((h) => (
            <div
              key={h}
              style={{
                fontSize: 10,
                color: '#94A3B8',
                textAlign: 'center',
                fontWeight: 500,
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {matrix.map((row, dayIdx) => (
          <div
            key={days[dayIdx]}
            style={{
              display: 'grid',
              gridTemplateColumns: `44px repeat(${hours.length}, 28px)`,
              gap: 4,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 500,
              }}
            >
              {days[dayIdx]}
            </div>
            {row.map((value, colIdx) => {
              const intensity = maxValue > 0 ? value / maxValue : 0;
              const hourLabel = hours[colIdx] || `${colIdx + 8}h`;
              const dayLabel = DAY_FULL[dayIdx] || days[dayIdx];
              return (
                <div
                  key={`${dayIdx}-${colIdx}`}
                  role="gridcell"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    background: heatColor(intensity),
                    color: heatTextColor(intensity),
                    fontSize: 9,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'default',
                    border: value === 0 ? '1px solid #E2E8F0' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    setTooltip({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      text: `${dayLabel} ${hourLabel} — ${value} message${value !== 1 ? 's' : ''}`,
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltip((t) => ({
                      ...t,
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                    }));
                  }}
                  onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, text: '' })}
                >
                  {value > 0 && intensity > 0.35 ? value : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 14,
          fontSize: 11,
          color: '#94A3B8',
        }}
      >
        <span>Faible</span>
        {[0, 0.15, 0.35, 0.55, 0.75, 1].map((v, i) => (
          <div
            key={i}
            style={{
              width: 20,
              height: 12,
              borderRadius: 2,
              background: heatColor(v),
              border: v === 0 ? '1px solid #E2E8F0' : 'none',
            }}
          />
        ))}
        <span>Élevé</span>
      </div>
    </div>
  );
}

function TopDocuments({ data }) {
  const docs = data?.documents || [];
  const maxSessions = Math.max(...docs.map((d) => d.session_count || 0), 1);

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 8,
        padding: '20px 24px',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
          Documents les Plus Consultés
        </div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
          Classement par nombre de sessions étudiantes
        </div>
      </div>

      {docs.length === 0 ? (
        <div
          style={{
            fontSize: 13,
            color: '#64748B',
            lineHeight: 1.6,
            padding: '24px 0',
            textAlign: 'center',
          }}
        >
          Aucun document encore consulté.
          <br />
          Importez des documents dans la bibliothèque pour commencer.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {docs.map((doc) => {
            const barWidth = ((doc.session_count || 0) / maxSessions) * 100;
            const rankColor = RANK_COLORS[(doc.rank || 1) - 1] || RANK_COLORS[4];
            return (
              <div key={doc.id}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: rankColor,
                      width: 28,
                      flexShrink: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    #{doc.rank}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {doc.subject ? (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: '#EFF6FF',
                            color: '#2563EB',
                            border: '1px solid #BFDBFE',
                            flexShrink: 0,
                          }}
                        >
                          {doc.subject}
                        </span>
                      ) : null}
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#0F172A',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={doc.name}
                      >
                        {truncate(doc.name, 30)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                        {doc.session_count || 0} session{(doc.session_count || 0) !== 1 ? 's' : ''}
                      </span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>
                        {doc.chunk_count || 0} chunks
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: '#F1F5F9',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${barWidth}%`,
                          height: '100%',
                          background: rankColor,
                          borderRadius: 3,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PrivacyBanner({ kpis }) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)',
        border: '1px solid #BBF7D0',
        borderRadius: 8,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>🔒</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>
            Privacy Firewall — {kpis?.blocked_requests || 0} requête(s) bloquée(s)
          </div>
          <div style={{ fontSize: 11, color: '#047857', marginTop: 2 }}>
            Questions hors-sujet interceptées avant d&apos;atteindre le LLM · Zéro donnée
            personnelle transmise à des services tiers
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          padding: '6px 14px',
          borderRadius: 999,
          background: '#DCFCE7',
          color: '#16A34A',
          border: '1px solid #86EFAC',
          flexShrink: 0,
        }}
      >
        ✓ Conforme RGPD &amp; AI Act
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        background: '#F8FAFC',
        fontFamily: '"DM Sans", system-ui, sans-serif',
      }}
    >
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes kapsul-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .lp-skeleton {
          background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 4px;
        }
      `}</style>
      <div style={{ height: 4, background: GRADIENT_BAR }} />
      <div style={{ padding: '20px 32px' }}>
        <div className="lp-skeleton" style={{ height: 28, width: 200, marginBottom: 8 }} />
        <div className="lp-skeleton" style={{ height: 14, width: 320 }} />
      </div>
      <div style={{ padding: '24px 32px 0', display: 'flex', gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="lp-skeleton"
            style={{ flex: 1, height: 120, borderRadius: 8 }}
          />
        ))}
      </div>
      <div style={{ padding: '24px 32px 0', display: 'flex', gap: 20 }}>
        <div className="lp-skeleton" style={{ flex: '0 0 60%', height: 340, borderRadius: 8 }} />
        <div
          className="lp-skeleton"
          style={{ flex: '0 0 calc(40% - 20px)', height: 340, borderRadius: 8 }}
        />
      </div>
      <div style={{ padding: '24px 32px' }}>
        <div className="lp-skeleton" style={{ height: 72, borderRadius: 8 }} />
      </div>
    </div>
  );
}

export function LearningPulse({ k, isV2 }) {
  void k;
  void isV2;

  const [kpis, setKpis] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [topDocs, setTopDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });

  async function loadAll(showSkeleton = true) {
    if (showSkeleton) setLoading(true);
    const [kpiData, heatData, docData] = await Promise.all([
      fetchKPIs(),
      fetchHeatmap(),
      fetchTopDocuments(),
    ]);
    setKpis(
      kpiData || {
        adoption_rate: 0,
        total_sessions: 0,
        total_messages: 0,
        tokens_saved: 0,
        blocked_requests: 0,
        indexed_documents: 0,
      },
    );
    setHeatmap(heatData || { matrix: [], max_value: 1, days: [], hours: [] });
    setTopDocs(docData || { documents: [] });
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadAll(false);
    setRefreshing(false);
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        background: '#F8FAFC',
        fontFamily: '"DM Sans", system-ui, sans-serif',
      }}
    >
      <style>{`
        @keyframes kapsul-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <DashboardHeader refreshing={refreshing} onRefresh={handleRefresh} />

      <div style={{ padding: '24px 32px 0', display: 'flex', gap: 16 }}>
        {KPI_CARDS.map((card) => (
          <KPICard key={card.key} card={card} kpis={kpis} />
        ))}
      </div>

      <div
        style={{
          padding: '24px 32px 0',
          display: 'flex',
          gap: 20,
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: '0 0 60%', minWidth: 0 }}>
          <Heatmap data={heatmap} setTooltip={setTooltip} />
        </div>
        <div style={{ flex: '0 0 calc(40% - 20px)', minWidth: 0 }}>
          <TopDocuments data={topDocs} />
        </div>
      </div>

      <div style={{ padding: '24px 32px 32px' }}>
        <PrivacyBanner kpis={kpis} />
      </div>

      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 12,
            top: tooltip.y - 36,
            background: '#0F172A',
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 500,
            padding: '4px 10px',
            borderRadius: 5,
            pointerEvents: 'none',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
