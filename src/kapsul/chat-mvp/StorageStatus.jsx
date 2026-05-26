/**
 * StorageStatus — collapsible panel showing Supabase persistence state
 */
import { useEffect, useRef } from 'react';
import { DocumentCard } from './DocumentCard.jsx';

export function StorageStatus({
  sessionId, documents, totalChunks, totalMessages,
  lastSaved, isOpen, onClose, k, isV2,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortId = sessionId ? `${sessionId.slice(0, 8)}...` : '—';
  const savedTime = lastSaved ? new Date(lastSaved).toLocaleTimeString() : '—';

  const panelBg = isV2 ? '#13131F' : '#FFFFFF';
  const borderSubtle = isV2 ? 'rgba(255,255,255,0.1)' : '#E2E8F0';
  const borderLight = isV2 ? 'rgba(255,255,255,0.07)' : '#F1F5F9';
  const textMain = isV2 ? '#E5E7EB' : '#0F172A';
  const textMuted = isV2 ? '#6B7280' : '#94A3B8';

  return (
    <div ref={panelRef} style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: 8,
      width: 320,
      zIndex: 200,
      background: panelBg,
      border: `1px solid ${borderSubtle}`,
      borderRadius: 10,
      boxShadow: isV2 ? '0 20px 60px rgba(0,0,0,0.6)' : '0 8px 30px rgba(0,0,0,0.12)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 14px',
        borderBottom: `1px solid ${borderLight}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: textMain }}>
            ☁ Cloud Storage
          </div>
          <div style={{ fontSize: 10, color: textMuted, marginTop: 1 }}>
            Session {shortId} · Supabase
          </div>
        </div>
        <button type="button" onClick={onClose} style={{
          background: 'none', border: 'none', color: textMuted,
          cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 4,
        }}>✕</button>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 1, background: isV2 ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
        borderBottom: `1px solid ${borderLight}`,
      }}>
        {[
          { label: 'Documents', value: documents?.length || 0, color: '#A78BFA' },
          { label: 'RAG Chunks', value: totalChunks || 0, color: '#06B6D4' },
          { label: 'Messages', value: totalMessages || 0, color: '#10B981' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            padding: '10px 12px', textAlign: 'center', background: panelBg,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 10, color: textMuted, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 12px' }}>
        <div style={{
          fontSize: 10, fontWeight: 600, color: textMuted,
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
        }}>
          Stored Documents
        </div>
        {documents && documents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {documents.map((doc, i) => (
              <DocumentCard
                key={doc.filename || i}
                filename={doc.filename || doc}
                state={doc.state || 'ready'}
                chunkCount={doc.chunkCount || 0}
                compact
                isV2={isV2}
              />
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 11.5, color: textMuted, textAlign: 'center', padding: '12px 0' }}>
            No documents stored yet
          </div>
        )}
      </div>

      <div style={{
        padding: '8px 14px',
        borderTop: `1px solid ${borderLight}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 10, color: textMuted }}>
          Last synced: {savedTime}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 8px',
          borderRadius: 999, background: 'rgba(16,185,129,0.15)',
          color: '#10B981',
        }}>
          ✓ All saved
        </span>
      </div>
    </div>
  );
}
