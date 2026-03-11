'use client';

import { AI_SOLUTIONS, T } from '@/lib/data';

function impactColor(impact) {
  if (impact === 'Very High') return T.red;
  if (impact === 'High')      return T.amber;
  if (impact === 'Medium')    return T.blue;
  return T.muted;
}

function complexityColor(c) {
  if (c === 'Low')    return T.green;
  if (c === 'Medium') return T.amber;
  if (c === 'High')   return T.red;
  return T.muted;
}

function SolutionCard({ solution, areaColor, expanded, onToggle }) {
  return (
    <div className="sol-card" style={{ borderColor: expanded ? areaColor + '55' : T.border }}>
      <div className="sol-header" onClick={onToggle}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span className="tag" style={{ background: areaColor + '22', color: areaColor, textTransform: 'uppercase' }}>
              {solution.tag}
            </span>
            <span className="tag" style={{ background: impactColor(solution.impact) + '22', color: impactColor(solution.impact) }}>
              {solution.impact} IMPACT
            </span>
            <span className="tag" style={{ background: complexityColor(solution.complexity) + '22', color: complexityColor(solution.complexity) }}>
              {solution.complexity} COMPLEXITY
            </span>
          </div>
          <div style={{ fontSize: 16, color: T.text, fontWeight: 500, lineHeight: 1.4 }}>
            {solution.title}
          </div>
          <div style={{ fontSize: 15, color: T.muted, marginTop: 4 }}>
            {solution.saving} &nbsp;·&nbsp; {solution.timeToValue}
          </div>
        </div>
        <div style={{
          color: T.muted, fontSize: 16, flexShrink: 0,
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>
          ▾
        </div>
      </div>

      {expanded && (
        <div className="sol-body" style={{ paddingTop: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, letterSpacing: '0.08em', marginBottom: 6 }}>
                WHAT IT DOES
              </div>
              <div style={{ fontSize: 16, color: T.text, lineHeight: 1.65 }}>
                {solution.what}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, letterSpacing: '0.08em', marginBottom: 6 }}>
                REPLACES
              </div>
              <div style={{ fontSize: 16, color: T.muted, lineHeight: 1.65 }}>
                {solution.replaces}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ background: T.faint, borderRadius: 6, padding: '12px 14px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.green, letterSpacing: '0.08em', marginBottom: 4 }}>
                EFFORT SAVING
              </div>
              <div style={{ fontSize: 16, color: T.text }}>{solution.saving}</div>
            </div>
            <div style={{ background: T.faint, borderRadius: 6, padding: '12px 14px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.blue, letterSpacing: '0.08em', marginBottom: 4 }}>
                ROI STORY
              </div>
              <div style={{ fontSize: 16, color: T.text }}>{solution.roi}</div>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, letterSpacing: '0.08em', marginBottom: 8 }}>
              PLATFORMS & TOOLS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {solution.tools.map((tool, i) => (
                <span key={i} className="chip" style={{ borderColor: T.border, color: T.muted }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SolutionsView({ orgName, matrix, systemicId, expanded, setExpanded, onBack }) {
  const areasWithSolutions = matrix.filter(row => AI_SOLUTIONS[row.id]?.length > 0);

  const toggle = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
          ← Results
        </button>
        <div style={{ width: 1, height: 20, background: T.border }} />
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: T.text }}>
          AI Solutions Roadmap{orgName ? ` — ${orgName}` : ''}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        {/* Intro */}
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 10, padding: '20px 24px', marginBottom: 28,
        }}>
          <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, letterSpacing: '0.08em', marginBottom: 8 }}>
            YOUR PERSONALISED AI ROADMAP
          </div>
          <div style={{ fontSize: 15, color: T.muted, lineHeight: 1.65 }}>
            Areas are ordered by priority index — highest impact, most urgent fixes first.
            Each solution is mapped to your diagnostic scores, so the top areas reflect where
            AI investment will deliver the fastest return for your organisation.
          </div>
        </div>

        {areasWithSolutions.map((row, areaRank) => {
          const solutions = AI_SOLUTIONS[row.id] || [];
          const isTop = row.id === systemicId || areaRank === 0;

          return (
            <div key={row.id} style={{ marginBottom: 32 }}>
              {/* Area header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <div style={{
                  background: row.color + '18', border: `1px solid ${row.color}44`,
                  borderRadius: 6, padding: '5px 12px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color }} />
                  <span style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: row.color, letterSpacing: '0.07em' }}>
                    #{areaRank + 1}
                  </span>
                  <span style={{ fontSize: 15, color: row.color, fontWeight: 500 }}>{row.label}</span>
                </div>
                {isTop && (
                  <span className="tag" style={{ background: T.red + '22', color: T.red }}>
                    TOP PRIORITY
                  </span>
                )}
                <span style={{ fontSize: 15, color: T.muted }}>
                  {row.maturityScore !== null ? `Maturity: ${row.maturityScore}` : 'Not yet scored'}
                  {row.bottleneckSeverity !== null ? ` · Severity: ${row.bottleneckSeverity}` : ''}
                </span>
              </div>

              {/* Solution cards */}
              {solutions.map((sol, si) => {
                const key = `${row.id}-${si}`;
                return (
                  <SolutionCard
                    key={key}
                    solution={sol}
                    areaColor={row.color}
                    expanded={!!expanded[key]}
                    onToggle={() => toggle(key)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
