'use client';

import { T } from '@/lib/data';
import { ProgressBar } from '@/components/ProgressBar';

export function AreaView({ area, answers, onAnswer, onBack }) {
  const maturityQs = area.questions.filter(q => q.type === 'maturity');
  const bottleneckQ = area.questions.find(q => q.type === 'bottleneck');
  const answered = area.questions.filter(q => answers[q.id] !== undefined).length;
  const total = area.questions.length;
  const pct = (answered / total) * 100;

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
          <span style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: area.color, letterSpacing: '0.07em' }}>
            AREA {area.num}
          </span>
          <span style={{ fontSize: 16, color: T.text, marginLeft: 10 }}>{area.label}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 16, color: T.muted }}>
            {answered}/{total}
          </span>
          <div style={{ width: 80 }}>
            <ProgressBar value={pct} color={area.color} height={4} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px' }}>
        {/* Area intro */}
        <div style={{ marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: area.color + '18', border: `1px solid ${area.color}44`,
            borderRadius: 6, padding: '6px 12px', marginBottom: 16,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: area.color }} />
            <span style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 16, color: area.color, letterSpacing: '0.07em' }}>
              {area.label.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: 15, color: T.muted, marginTop: 4 }}>
            AI effort saving potential: <span style={{ color: area.color }}>{area.effortSaving}</span>
          </div>
        </div>

        {/* Maturity questions */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, letterSpacing: '0.08em', marginBottom: 20 }}>
            MATURITY QUESTIONS
          </div>
          {maturityQs.map((q, qi) => {
            const selected = answers[q.id];
            return (
              <div key={q.id} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 15, color: T.text, marginBottom: 12, lineHeight: 1.55, fontWeight: 500 }}>
                  <span style={{ color: T.muted, marginRight: 8, fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 16 }}>
                    {qi + 1}.
                  </span>
                  {q.text}
                </div>
                <div>
                  {q.options.map(opt => {
                    const isSelected = selected === opt.value;
                    return (
                      <button
                        key={opt.value}
                        className="opt"
                        onClick={() => onAnswer(q.id, opt.value)}
                        style={{
                          borderColor: isSelected ? area.color : T.border,
                          color: isSelected ? T.text : T.muted,
                          background: isSelected ? area.color + '14' : 'transparent',
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottleneck question */}
        {bottleneckQ && (
          <div style={{
            background: T.faint, border: `1px solid ${T.amber}33`,
            borderRadius: 10, padding: '20px 20px',
          }}>
            <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.amber, letterSpacing: '0.08em', marginBottom: 12 }}>
              BOTTLENECK INDICATOR
            </div>
            <div style={{ fontSize: 15, color: T.text, marginBottom: 14, lineHeight: 1.55, fontWeight: 500 }}>
              {bottleneckQ.text}
            </div>
            <div>
              {bottleneckQ.options.map(opt => {
                const isSelected = answers[bottleneckQ.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    className="opt"
                    onClick={() => onAnswer(bottleneckQ.id, opt.value)}
                    style={{
                      borderColor: isSelected ? T.amber : T.border,
                      color: isSelected ? T.text : T.muted,
                      background: isSelected ? T.amber + '14' : 'transparent',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Done button */}
        {answered === total && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <button
              className="ph-btn"
              style={{ background: area.color, borderColor: area.color, color: '#fff' }}
              onClick={onBack}
            >
              AREA COMPLETE — BACK TO OVERVIEW
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
