import { useState, useEffect } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────

const MASTERY_COLORS = {
  high:   { bg: '#F3F0FF', text: '#6D28D9', label: 'Maîtrisé',       dot: '#7C3AED' },
  mid:    { bg: '#EFF6FF', text: '#1D4ED8', label: 'En consolidation', dot: '#2563EB' },
  low:    { bg: '#F8FAFC', text: '#64748B', label: 'À découvrir',      dot: '#CBD5E1' },
};

function getMasteryLevel(score) {
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'mid';
  return 'low';
}

function getMasteryColor(score) {
  return MASTERY_COLORS[getMasteryLevel(score)];
}

function getPriorityLevel(score) {
  if (score >= 5)  return { label: 'Priorité Haute',   emoji: '🔥', color: '#F97316', bg: '#FFF7ED' };
  if (score >= 2)  return { label: 'Priorité Moyenne', emoji: '⏳', color: '#F59E0B', bg: '#FFFBEB' };
  return                   { label: 'À consolider',    emoji: '📌', color: '#2563EB', bg: '#EFF6FF' };
}

// ── API helpers ───────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_BASE ?? '';

async function fetchDashboard(sessionId) {
  try {
    const res = await fetch(`${BASE}/api/student/dashboard/${sessionId}`);
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchBriefing(sessionId) {
  try {
    const res = await fetch(`${BASE}/api/student/morning-briefing/${sessionId}`, {
      method: 'POST',
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// ── Main component ────────────────────────────────────────────────────────────

export function StudentDashboard({ sessionId, onStartChat, k, isV2 }) {
  const [activeTab,  setActiveTab]  = useState('focus');
  const [data,       setData]       = useState(null);
  const [briefing,   setBriefing]   = useState('');
  const [loading,    setLoading]    = useState(true);
  const [loadBrief,  setLoadBrief]  = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    Promise.all([
      fetchDashboard(sessionId),
      fetchBriefing(sessionId),
    ]).then(([dash, brief]) => {
      if (dash)  setData(dash);
      if (brief) setBriefing(brief.briefing || '');
      setLoading(false);
      setLoadBrief(false);
    });
  }, [sessionId]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      background: '#F8FAFC',
      fontFamily: '"DM Sans", system-ui, sans-serif',
    }}>
      <DashboardHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        messageCount={data?.message_count || 0}
      />

      {activeTab === 'focus'
        ? <FocusTab
            data={data}
            briefing={briefing}
            loadBrief={loadBrief}
            onStartChat={onStartChat}
          />
        : <EspaceDeVolTab data={data} />
      }
    </div>
  );
}

// ── Header with tabs ──────────────────────────────────────────────────────────

function DashboardHeader({ activeTab, onTabChange, messageCount }) {
  const tabs = [
    { id: 'focus', label: 'Focus du Jour',    icon: '🎯' },
    { id: 'vol',   label: 'Mon Espace de Vol', icon: '📊' },
  ];

  return (
    <div style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      padding: '0',
    }}>
      <div style={{
        height: 4,
        background: 'linear-gradient(90deg, #2563EB, #06B6D4, #F97316)',
      }} />

      <div style={{ padding: '16px 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Mon Tableau de Bord
          </h1>
          {messageCount > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px',
              borderRadius: 999, background: '#EFF6FF', color: '#2563EB',
              border: '1px solid #BFDBFE',
            }}>
              {messageCount} échanges
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #F1F5F9' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              style={{
                padding: '8px 20px',
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                color: activeTab === tab.id ? '#2563EB' : '#64748B',
                borderBottom: activeTab === tab.id
                  ? '2px solid #2563EB'
                  : '2px solid transparent',
                marginBottom: -2,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'color 0.15s',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── TAB 1: Focus du Jour ──────────────────────────────────────────────────────

function FocusTab({ data, briefing, loadBrief, onStartChat }) {
  const hasData = data?.has_data;
  const topConcepts = data?.top_concepts || [];
  const weekDays = data?.week_days || [];
  const sessionsDone = data?.sessions_done || 0;

  return (
    <div style={{ padding: '24px 28px', maxWidth: 860, margin: '0 auto' }}>

      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderLeft: '3px solid #2563EB',
        borderRadius: 12,
        padding: '18px 20px',
        marginBottom: 20,
        boxShadow: '0 4px 14px rgba(15,23,42,0.06)',
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: '#94A3B8',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          marginBottom: 8,
        }}>
          ☀ Briefing du matin
        </div>
        {loadBrief ? (
          <div style={{
            height: 16, background: '#F1F5F9', borderRadius: 4,
            animation: 'shimmer 1.4s ease infinite',
            backgroundSize: '200% 100%',
          }} />
        ) : (
          <p style={{
            fontSize: 15, color: '#0F172A', lineHeight: 1.6,
            margin: 0, fontWeight: 500,
          }}>
            {briefing || "Bonjour ! Commencez votre session d'aujourd'hui. 🎯"}
          </p>
        )}
        <button
          type="button"
          onClick={onStartChat}
          style={{
            marginTop: 14,
            padding: '10px 20px',
            background: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Lancer le focus du jour →
        </button>
      </div>

      <div style={{
        fontSize: 13, fontWeight: 700, color: '#0F172A',
        marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        🎯 Ton Radar de Révision
        <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400 }}>
          Généré par l'IA · Priorité calculée automatiquement
        </span>
      </div>

      {!hasData ? (
        <EmptyState onStartChat={onStartChat} />
      ) : topConcepts.length === 0 ? (
        <div style={{
          background: '#F0FDF4', border: '1px solid #BBF7D0',
          borderRadius: 12, padding: '18px 20px',
          fontSize: 14, color: '#065F46', fontWeight: 500,
        }}>
          ✨ Aucun concept prioritaire détecté. Continue comme ça !
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {topConcepts.map((concept, i) => (
            <OpportunityCard
              key={i}
              concept={concept}
              rank={i + 1}
              onStartChat={onStartChat}
            />
          ))}
        </div>
      )}

      <WeeklyMomentum weekDays={weekDays} sessionsDone={sessionsDone} />
    </div>
  );
}

// ── Opportunity Card ──────────────────────────────────────────────────────────

function OpportunityCard({ concept, rank, onStartChat }) {
  const priority = getPriorityLevel(concept.priority_score);
  const avgMastery = (
    (concept.memorisation || 0) +
    (concept.comprehension || 0) +
    (concept.application || 0)
  ) / 3;
  const masteryColor = getMasteryColor(avgMastery);

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      padding: '16px 18px',
      boxShadow: '0 4px 14px rgba(15,23,42,0.06)',
      animation: 'kapsul-fadeup 0.25s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 999, background: priority.bg, color: priority.color,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            marginBottom: 6,
          }}>
            {priority.emoji} {priority.label}
          </span>

          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>
            {concept.concept}
          </div>
          <div style={{ fontSize: 12, color: '#64748B' }}>
            {concept.course} · {concept.error_frequency || 0} correction(s) de l'IA
          </div>
        </div>

        <span style={{
          fontSize: 11, fontWeight: 600, padding: '4px 10px',
          borderRadius: 999, background: masteryColor.bg, color: masteryColor.text,
          border: `1px solid ${masteryColor.dot}30`,
          flexShrink: 0, marginLeft: 12,
        }}>
          {masteryColor.label}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {[
          { label: 'Mémorisation', value: concept.memorisation || 0, color: '#7C3AED' },
          { label: 'Compréhension', value: concept.comprehension || 0, color: '#2563EB' },
          { label: 'Application',   value: concept.application   || 0, color: '#22C55E' },
        ].map(dim => (
          <div key={dim.label} style={{ flex: 1 }}>
            <div style={{
              fontSize: 9, fontWeight: 600, color: '#94A3B8',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              marginBottom: 3,
            }}>
              {dim.label}
            </div>
            <div style={{
              height: 4, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.round(dim.value * 100)}%`,
                background: dim.color,
                borderRadius: 2,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>
              {Math.round(dim.value * 100)}%
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <button type="button" onClick={onStartChat} style={{
          fontSize: 11, fontWeight: 600, padding: '5px 12px',
          borderRadius: 6, border: '1px solid #E2E8F0',
          background: '#F8FAFC', color: '#374151',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Comprendre cette notion
        </button>
        <button type="button" onClick={onStartChat} style={{
          fontSize: 11, fontWeight: 600, padding: '5px 12px',
          borderRadius: 6, border: 'none',
          background: '#22C55E', color: '#FFFFFF',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Refaire un test rapide
        </button>
      </div>
    </div>
  );
}

// ── Weekly Momentum ───────────────────────────────────────────────────────────

function WeeklyMomentum({ weekDays, sessionsDone }) {
  const maxCount = Math.max(...weekDays.map(d => d.count), 1);

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      padding: '16px 18px',
      boxShadow: '0 4px 14px rgba(15,23,42,0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 14,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
          📈 Ton Élan de la Semaine
        </div>
        <span style={{
          fontSize: 12, color: '#64748B', fontWeight: 500,
        }}>
          {sessionsDone}/7 jours actifs
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 }}>
        {weekDays.map((day, i) => {
          const height = day.count > 0 ? Math.max(8, (day.count / maxCount) * 52) : 4;
          const isToday = i === weekDays.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: '100%',
                height: height,
                background: isToday ? '#2563EB' : day.count > 0 ? '#BFDBFE' : '#F1F5F9',
                borderRadius: 4,
                transition: 'height 0.4s ease',
              }} />
              <span style={{ fontSize: 9, color: isToday ? '#2563EB' : '#94A3B8', fontWeight: isToday ? 700 : 400 }}>
                {day.day}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#64748B' }}>Objectif de régularité</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#2563EB' }}>
            {Math.round((sessionsDone / 5) * 100)}%
          </span>
        </div>
        <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3 }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, Math.round((sessionsDone / 5) * 100))}%`,
            background: 'linear-gradient(90deg, #2563EB, #06B6D4)',
            borderRadius: 3,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>
    </div>
  );
}

// ── TAB 2: Mon Espace de Vol ──────────────────────────────────────────────────

function EspaceDeVolTab({ data }) {
  const courses = data?.courses || [];

  if (!data?.has_data) {
    return (
      <div style={{ padding: '40px 28px', textAlign: 'center', color: '#94A3B8' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#64748B' }}>
          Aucune donnée de maîtrise disponible
        </div>
        <div style={{ fontSize: 13, marginTop: 6 }}>
          Commencez à chatter pour voir votre progression ici.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 860, margin: '0 auto' }}>
      <div style={{
        fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 14,
      }}>
        Maîtrise par cours
      </div>

      {courses.length === 0 ? (
        <div style={{ fontSize: 13, color: '#94A3B8' }}>
          Aucun cours enregistré pour l'instant.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {courses.map((course, i) => (
            <CourseCard key={i} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Course Card ───────────────────────────────────────────────────────────────

function CourseCard({ course }) {
  const masteryColor = getMasteryColor(course.avg_mastery);

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      padding: '16px 18px',
      boxShadow: '0 4px 14px rgba(15,23,42,0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 12,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
            {course.name}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
            {course.concept_count} notion(s) suivie(s)
          </div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '4px 10px',
          borderRadius: 999, background: masteryColor.bg, color: masteryColor.text,
        }}>
          {masteryColor.label}
        </span>
      </div>

      {[
        { label: 'Mémorisation', value: course.memorisation, color: '#7C3AED' },
        { label: 'Compréhension', value: course.comprehension, color: '#2563EB' },
        { label: 'Application',   value: course.application,   color: '#22C55E' },
      ].map(dim => (
        <div key={dim.label} style={{ marginBottom: 8 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginBottom: 3,
          }}>
            <span style={{ fontSize: 11, color: '#64748B' }}>{dim.label}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: dim.color }}>
              {Math.round(dim.value * 100)}%
            </span>
          </div>
          <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3 }}>
            <div style={{
              height: '100%',
              width: `${Math.round(dim.value * 100)}%`,
              background: dim.color,
              borderRadius: 3,
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onStartChat }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      padding: '28px 20px',
      textAlign: 'center',
      boxShadow: '0 4px 14px rgba(15,23,42,0.06)',
      marginBottom: 20,
    }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🎓</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
        Ton radar de révision se construit au fil de tes sessions
      </div>
      <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
        Commence à chatter avec Kapsul sur tes cours pour voir apparaître
        tes concepts prioritaires ici.
      </div>
      <button type="button" onClick={onStartChat} style={{
        padding: '10px 24px',
        background: '#2563EB',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}>
        Commencer une session →
      </button>
    </div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div style={{ padding: '24px 28px', maxWidth: 860, margin: '0 auto' }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .sk {
          background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 6px;
        }
      `}</style>
      {[120, 100, 100].map((h, i) => (
        <div key={i} className="sk" style={{ height: h, marginBottom: 16 }} />
      ))}
    </div>
  );
}
