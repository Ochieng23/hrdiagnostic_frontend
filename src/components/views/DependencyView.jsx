'use client';

import { DEPENDENCY_QS, AREAS, T } from '@/lib/data';

export function DependencyView({ answers, onAnswer, onBack, onProceed, completedDeps }) {
  const depAnswered = DEPENDENCY_QS.filter(q => answers[q.id] !== undefined).length;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '0 0 80px' }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${T.border}`,
        padding: '0 32px', height: 62,
        display: 'flex', alignItems: 'center', gap: 16,
        position: 'sticky', top: 0, zIndex: 10,
        background: T.bg, boxShadow: `0 1px 0 ${T.border}`,
      }}>
        <a href="/" style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 13,
          color: T.muted, textDecoration: 'none', letterSpacing: '0.04em',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>← Dashboard</a>
        <div style={{ width: 1, height: 20, background: T.border }} />
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: T.muted, cursor: 'pointer',
            fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 13, letterSpacing: '0.04em',
            display: 'flex', alignItems: 'center', gap: 6, padding: 0,
          }}
        >
          ← Overview
        </button>
        <div style={{ width: 1, height: 20, background: T.border }} />
        <div>
          <span style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.purple, letterSpacing: '0.07em' }}>
            DEPENDENCY MAPPING
          </span>
          <span style={{ fontSize: 16, color: T.text, marginLeft: 10 }}>Business Impact Assessment</span>
        </div>
        <div style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 16, color: T.muted }}>
          {depAnswered}/4
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px' }}>
        <div style={{ marginBottom: 30 }}>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: T.text, marginBottom: 8 }}>
            Business Impact Questions
          </div>
          <div style={{ fontSize: 16, color: T.muted, lineHeight: 1.6 }}>
            These four questions help us weight your diagnostic against real business pain — not just process maturity.
            Your answers determine which HR areas will deliver the greatest ROI from AI investment.
          </div>
        </div>

        {DEPENDENCY_QS.map((q, qi) => {
          const selected = answers[q.id];
          return (
            <div key={q.id} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 15, color: T.text, marginBottom: 14, lineHeight: 1.55, fontWeight: 500 }}>
                <span style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, marginRight: 8, letterSpacing: '0.07em' }}>
                  Q{qi + 1}
                </span>
                {q.text}
              </div>
              <div>
                {q.options.map(opt => {
                  const area = AREAS.find(a => a.id === opt.area);
                  const isSelected = selected === opt.area;
                  return (
                    <button
                      key={opt.area}
                      className="opt"
                      onClick={() => onAnswer(q.id, opt.area)}
                      style={{
                        borderColor: isSelected ? T.purple : T.border,
                        color: isSelected ? T.text : T.muted,
                        background: isSelected ? T.purple + '14' : 'transparent',
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                      }}
                    >
                      <span style={{ flex: 1 }}>{opt.label}</span>
                      {area && (
                        <span style={{
                          fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 16,
                          color: isSelected ? area.color : T.muted,
                          letterSpacing: '0.07em', flexShrink: 0, marginTop: 2,
                        }}>
                          {area.label.toUpperCase()}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {completedDeps && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <button
              className="ph-btn"
              style={{ background: T.purple, borderColor: T.purple, color: '#fff' }}
              onClick={onProceed}
            >
              MAPPING COMPLETE — CONTINUE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
