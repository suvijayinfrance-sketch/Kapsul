import { useEffect, useState } from 'react';
import '../chat-mvp/chat-mvp.css';

export function ProcessingScreen({ k, lang, appending = false }) {
  const fr = lang === 'fr';
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const timers = [0, 800, 1600, 2400].map((ms, i) =>
      setTimeout(() => setVisible(i + 1), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = fr
    ? ['Extraction du texte', 'Traitement par Mistral', 'Structuration en Markdown', 'Finalisation...']
    : ['Text extraction', 'Mistral processing', 'Markdown structuring', 'Finalizing...'];

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 40, background: k.bg, color: k.text, fontFamily: k.fontUI,
    }}>
      <div className="kapsul-mvp-pulse-orb" />
      <h2 style={{ margin: '32px 0 8px', fontSize: 20, fontWeight: 600, textAlign: 'center' }}>
        {appending
          ? (fr ? 'Ajout de nouveaux fichiers...' : 'Adding new files...')
          : (fr ? 'Mistral analyse vos documents...' : 'Mistral is analyzing your documents...')}
      </h2>
      <p style={{ margin: 0, fontSize: 14, color: k.textMuted, textAlign: 'center' }}>
        {appending
          ? (fr ? 'Mise à jour de la référence maître' : 'Updating your master reference')
          : (fr ? 'Génération de la référence maître en cours' : 'Generating your master reference')}
      </p>
      <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 280 }}>
        {steps.map((label, i) => (
          <div
            key={label}
            className={visible > i ? 'kapsul-mvp-step-in' : ''}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, fontSize: 14,
              color: visible > i ? k.text : k.textFaint,
              opacity: visible > i ? 1 : 0.3,
            }}
          >
            <span style={{ width: 20, textAlign: 'center' }}>
              {visible > i + 1 || (i === 3 && visible >= 4) ? '✓' : visible > i ? '⟳' : '○'}
            </span>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
