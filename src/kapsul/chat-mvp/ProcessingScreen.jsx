import { DocumentCard } from './DocumentCard.jsx';

const UPLOAD_STEPS = [
  { id: 'extract', label: 'Extracting text from documents', labelFr: 'Extraction du texte', icon: '📄', color: '#F59E0B' },
  { id: 'synthesize', label: 'Building Master Reference with AI', labelFr: 'Génération de la Référence Maître', icon: '🧠', color: '#F59E0B' },
  { id: 'chunk', label: 'Splitting into RAG chunks', labelFr: 'Découpage en fragments RAG', icon: '✂', color: '#3B82F6' },
  { id: 'embed', label: 'Indexing chunks for semantic search', labelFr: 'Indexation sémantique', icon: '🔍', color: '#3B82F6' },
  { id: 'sync', label: 'Saving to cloud storage', labelFr: 'Sauvegarde dans le cloud', icon: '☁', color: '#06B6D4' },
  { id: 'done', label: 'Ready — session saved to Supabase', labelFr: 'Prêt — session sauvegardée', icon: '✓', color: '#10B981' },
];

const STEP_ORDER = UPLOAD_STEPS.map((s) => s.id);

function getStepStatus(stepId, currentStep) {
  const cur = STEP_ORDER.indexOf(currentStep);
  const idx = STEP_ORDER.indexOf(stepId);
  if (cur < 0 || idx < 0) return 'pending';
  if (idx < cur) return 'done';
  if (idx === cur) return 'active';
  return 'pending';
}

export function ProcessingScreen({
  k, lang, isV2 = false, appending = false, currentStep = 'extract',
  docStates = {}, fileList = [],
}) {
  const fr = lang === 'fr';

  const activeStep = UPLOAD_STEPS.find((s) => s.id === currentStep) || UPLOAD_STEPS[0];
  const activeLabel = fr ? activeStep.labelFr : activeStep.label;

  const docEntries = fileList.length > 0
    ? fileList.map((f) => ({
      name: f.name || f,
      state: docStates[f.name] || docStates[f] || 'extracting',
    }))
    : Object.entries(docStates).map(([name, state]) => ({ name, state }));

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 40, background: k.bg, color: k.text, fontFamily: k.fontUI,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="kapsul-mvp-pulse-orb" style={{ margin: '0 auto' }} />

        <h2 style={{
          margin: '28px 0 8px', fontSize: 20, fontWeight: 600, textAlign: 'center',
          fontFamily: isV2 ? '"Space Grotesk", sans-serif' : 'inherit',
        }}>
          {appending
            ? (fr ? 'Ajout de nouveaux fichiers...' : 'Adding new files...')
            : (fr ? 'Analyse de vos documents' : 'Analyzing your documents')}
        </h2>
        <p style={{
          margin: '0 0 28px', fontSize: 14, color: activeStep.color,
          textAlign: 'center', fontWeight: 500, minHeight: 20,
        }}>
          {activeLabel}...
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {UPLOAD_STEPS.map((step) => {
            const status = getStepStatus(step.id, currentStep);
            const label = fr ? step.labelFr : step.label;
            const isDone = status === 'done';
            const isActive = status === 'active';
            const dotColor = isDone ? '#10B981' : isActive ? step.color : k.textFaint;

            return (
              <div key={step.id}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  opacity: status === 'pending' ? 0.35 : 1,
                  transition: 'opacity 0.3s',
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: isDone || isActive ? dotColor : 'transparent',
                    border: `2px solid ${isDone || isActive ? dotColor : k.border}`,
                    animation: isDone ? 'kapsul-step-done 0.35s ease forwards' : 'none',
                    boxShadow: isActive ? `0 0 10px ${step.color}50` : 'none',
                  }} />
                  <span style={{
                    flex: 1, fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                    color: isDone ? '#10B981' : isActive ? k.text : k.textMuted,
                  }}>
                    {isDone && <span style={{ marginRight: 6 }}>✓</span>}
                    {label}
                  </span>
                  <span style={{ fontSize: 14, opacity: isActive ? 1 : 0 }}>{step.icon}</span>
                </div>
                {isActive && (
                  <div style={{
                    marginTop: 6, marginLeft: 22, height: 2, borderRadius: 1,
                    background: isV2 ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${step.color}40, ${step.color})`,
                      borderRadius: 1,
                      animation: 'kapsul-slide 1.5s ease-in-out infinite',
                      width: '40%',
                    }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {docEntries.length > 0 && (
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {docEntries.map(({ name, state }) => (
              <DocumentCard
                key={name}
                filename={name}
                state={state}
                compact
                isV2={isV2}
              />
            ))}
          </div>
        )}

        <p style={{
          marginTop: 28, fontSize: 11.5, color: k.textMuted, textAlign: 'center', lineHeight: 1.5,
        }}>
          {fr
            ? 'Votre session restera disponible même après avoir fermé le navigateur.'
            : 'Your session will be available even after closing the browser.'}
        </p>
      </div>
    </div>
  );
}
