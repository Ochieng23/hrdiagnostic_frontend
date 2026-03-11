'use client';

import { T } from '@/lib/data';
import { ScoreRing } from '@/components/ScoreRing';
import { ProgressBar } from '@/components/ProgressBar';

function ragColor(score) {
  if (score === null) return T.muted;
  if (score < 33) return T.red;
  if (score < 66) return T.amber;
  return T.green;
}

function priorityLabel(rank) {
  if (rank === 0) return 'CRITICAL';
  if (rank === 1) return 'HIGH';
  if (rank === 2) return 'MEDIUM';
  return 'LOWER';
}

function priorityColor(rank) {
  if (rank === 0) return T.red;
  if (rank === 1) return T.amber;
  if (rank === 2) return T.blue;
  return T.muted;
}

export function ResultsView({
  orgName,
  matrix,
  completedAreas,
  overallMat,
  matMeta,
  systemicId,
  topDep,
  onBack,
  onViewSolutions,
}) {
  const scoredMatrix   = matrix.filter(r => completedAreas.includes(r.id));
  const unscoredMatrix = matrix.filter(r => !completedAreas.includes(r.id));

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
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: T.text }}>
          Priority Matrix{orgName ? ` — ${orgName}` : ''}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            className="ph-btn"
            style={{ background: T.green, borderColor: T.green, color: '#000' }}
            onClick={onViewSolutions}
          >
            VIEW AI SOLUTIONS →
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        {/* Summary row */}
        {overallMat !== null && matMeta && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12, marginBottom: 32,
          }}>
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: '16px 18px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, letterSpacing: '0.07em', marginBottom: 8 }}>
                OVERALL MATURITY
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ScoreRing score={overallMat} color={matMeta.color} size={48} />
                <div>
                  <div style={{ fontSize: 15, color: matMeta.color, fontWeight: 500 }}>{matMeta.tag}</div>
                  <div style={{ fontSize: 16, color: T.muted }}>Level {matMeta.level} of 5</div>
                </div>
              </div>
            </div>

            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: '16px 18px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, letterSpacing: '0.07em', marginBottom: 8 }}>
                OVERHEAD REDUCTION
              </div>
              <div style={{ fontSize: 28, fontWeight: 600, color: T.text }}>{matMeta.reduction}</div>
              <div style={{ fontSize: 16, color: T.muted, marginTop: 2 }}>estimated potential</div>
            </div>

            {systemicId && (
              <div style={{ background: T.surface, border: `1px solid ${T.red}44`, borderRadius: 8, padding: '16px 18px' }}>
                <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.red, letterSpacing: '0.07em', marginBottom: 8 }}>
                  TOP PRIORITY AREA
                </div>
                <div style={{ fontSize: 16, color: T.text, fontWeight: 500 }}>
                  {matrix.find(r => r.id === systemicId)?.label}
                </div>
                <div style={{ fontSize: 16, color: T.muted, marginTop: 2 }}>highest impact fix</div>
              </div>
            )}

            {topDep && (
              <div style={{ background: T.surface, border: `1px solid ${T.purple}44`, borderRadius: 8, padding: '16px 18px' }}>
                <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.purple, letterSpacing: '0.07em', marginBottom: 8 }}>
                  BUSINESS PAIN SIGNAL
                </div>
                <div style={{ fontSize: 16, color: T.text, fontWeight: 500 }}>
                  {matrix.find(r => r.id === topDep)?.label}
                </div>
                <div style={{ fontSize: 16, color: T.muted, marginTop: 2 }}>most selected by managers</div>
              </div>
            )}
          </div>
        )}

        {/* Priority matrix table */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, letterSpacing: '0.08em', marginBottom: 16 }}>
            ASSESSED AREAS — RANKED BY PRIORITY INDEX
          </div>
          {scoredMatrix.map((row, rank) => {
            const matColor = ragColor(row.maturityScore);
            const bColor   = ragColor(row.bottleneckScore);
            const pLabel   = priorityLabel(rank);
            const pColor   = priorityColor(rank);

            return (
              <div
                key={row.id}
                style={{
                  background: T.surface,
                  border: `1px solid ${rank === 0 ? T.red + '55' : T.border}`,
                  borderRadius: 8,
                  padding: '16px 20px',
                  marginBottom: 8,
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr 80px 80px 80px 80px',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: rank < 3 ? pColor : T.muted, fontWeight: 600 }}>
                  #{rank + 1}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 15, color: T.text, fontWeight: 500 }}>{row.label}</span>
                    <span className="tag" style={{ background: pColor + '22', color: pColor }}>{pLabel}</span>
                    {row.depVotes > 0 && (
                      <span className="tag" style={{ background: T.purple + '22', color: T.purple }}>
                        {row.depVotes}× MGMT PAIN
                      </span>
                    )}
                  </div>
                  <div style={{ paddingLeft: 16 }}>
                    <ProgressBar value={row.maturityScore ?? 0} color={matColor} height={3} />
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, marginBottom: 3 }}>MATURITY</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: matColor }}>
                    {row.maturityScore !== null ? row.maturityScore : '–'}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, marginBottom: 3 }}>BOTTLENECK</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: bColor }}>
                    {row.bottleneckSeverity !== null ? row.bottleneckSeverity : '–'}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, marginBottom: 3 }}>PRIORITY</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: pColor }}>{row.rawPriority}</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, marginBottom: 3 }}>SAVING</div>
                  <div style={{ fontSize: 15, color: row.color }}>{row.effortSaving}</div>
                </div>
              </div>
            );
          })}

          {unscoredMatrix.length > 0 && (
            <>
              <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, letterSpacing: '0.08em', margin: '20px 0 12px' }}>
                NOT YET ASSESSED
              </div>
              {unscoredMatrix.map(row => (
                <div
                  key={row.id}
                  style={{
                    background: T.surface, border: `1px solid ${T.border}`,
                    borderRadius: 8, padding: '12px 20px', marginBottom: 6,
                    display: 'flex', alignItems: 'center', gap: 10, opacity: 0.5,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color }} />
                  <span style={{ fontSize: 15, color: T.muted }}>{row.label}</span>
                  <span style={{ fontSize: 16, color: T.muted, marginLeft: 'auto' }}>–</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            className="ph-btn"
            style={{ background: T.green, borderColor: T.green, color: '#000', fontSize: 15, padding: '13px 28px' }}
            onClick={onViewSolutions}
          >
            VIEW YOUR AI SOLUTIONS ROADMAP →
          </button>
        </div>
      </div>
    </div>
  );
}
