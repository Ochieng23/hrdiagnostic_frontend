'use client';

import { AREAS, T } from '@/lib/data';
import { ProgressBar } from '@/components/ProgressBar';
import { ScoreRing } from '@/components/ScoreRing';

export function OverviewView({
  answers,
  orgName,
  setOrgName,
  setView,
  setArea,
  areaScores,
  completedAreas,
  completedDeps,
  overallMat,
  matMeta,
  canResults,
}) {
  const totalQs = AREAS.reduce((acc, a) => acc + a.questions.length, 0);
  const answered = Object.keys(answers).filter(k => !k.startsWith('dep')).length;
  const depAnswered = Object.keys(answers).filter(k => k.startsWith('dep')).length;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '0 0 60px' }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${T.border}`,
        padding: '0 32px',
        height: 62,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: T.bg,
        boxShadow: `0 1px 0 ${T.border}`,
      }}>
        {/* Left: back link + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a
            href="/"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 13, color: T.muted, textDecoration: 'none',
              letterSpacing: '0.04em', transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = T.text}
            onMouseLeave={e => e.currentTarget.style.color = T.muted}
          >
            ← Dashboard
          </a>
          <div style={{ width: 1, height: 20, background: T.border }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: '#fff', fontWeight: 700,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              flexShrink: 0,
            }}>HR</div>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: T.text }}>
              {orgName || 'HR AI Diagnostic'}
            </div>
          </div>
        </div>

        {/* Right: org name input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            className="org-in"
            placeholder="Organisation name"
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
          />
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        {/* Overall maturity banner */}
        {overallMat !== null && matMeta && (
          <div style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: '24px 28px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}>
            <ScoreRing score={overallMat} color={matMeta.color} size={72} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, letterSpacing: '0.08em', marginBottom: 4 }}>
                OVERALL MATURITY
              </div>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: matMeta.color, marginBottom: 4 }}>
                {matMeta.tag}
              </div>
              <div style={{ fontSize: 16, color: T.muted }}>
                Estimated HR overhead reduction potential: <span style={{ color: T.text }}>{matMeta.reduction}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, letterSpacing: '0.07em', marginBottom: 6 }}>
                PROGRESS
              </div>
              <div style={{ fontSize: 26, fontWeight: 600, color: T.text }}>
                {completedAreas.length}<span style={{ fontSize: 16, color: T.muted }}>/8</span>
              </div>
              <div style={{ fontSize: 15, color: T.muted }}>areas complete</div>
            </div>
          </div>
        )}

        {/* Area cards grid */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, letterSpacing: '0.08em', marginBottom: 16 }}>
            DIAGNOSTIC AREAS — SELECT TO ASSESS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {AREAS.map(area => {
              const sc = areaScores.find(a => a.id === area.id);
              const done = completedAreas.includes(area.id);
              const qs = area.questions.length;
              const ans = area.questions.filter(q => answers[q.id] !== undefined).length;

              return (
                <div
                  key={area.id}
                  className="card"
                  style={{ borderColor: done ? area.color + '55' : T.border }}
                  onClick={() => { setArea(area.id); setView('area'); }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: area.color, letterSpacing: '0.07em', marginBottom: 3 }}>
                        {area.num}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 500, color: T.text, lineHeight: 1.3 }}>
                        {area.label}
                      </div>
                    </div>
                    {done && sc?.maturityScore !== null ? (
                      <ScoreRing score={sc.maturityScore} color={area.color} size={40} />
                    ) : (
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        border: `1px solid ${T.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, color: T.muted,
                        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      }}>
                        {ans > 0 ? `${ans}/${qs}` : '–'}
                      </div>
                    )}
                  </div>
                  <ProgressBar
                    value={(ans / qs) * 100}
                    color={done ? area.color : T.borderHi}
                    height={3}
                  />
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 16, color: T.muted }}>{area.effortSaving}</span>
                    {done && (
                      <span style={{ fontSize: 15, color: area.color, fontFamily: "'JetBrains Mono', 'Courier New', monospace", letterSpacing: '0.06em' }}>
                        DONE
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dependency questions card */}
        <div
          className="card"
          style={{
            marginBottom: 20,
            borderColor: completedDeps ? T.purple + '55' : T.border,
            cursor: 'pointer',
          }}
          onClick={() => setView('dependency')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.purple, letterSpacing: '0.08em', marginBottom: 4 }}>
                DEPENDENCY MAPPING
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: T.text }}>
                Business Impact Questions
              </div>
              <div style={{ fontSize: 15, color: T.muted, marginTop: 4 }}>
                4 questions to identify your highest-impact HR fix
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: completedDeps ? T.purple : T.muted }}>
                {depAnswered}/4
              </div>
              {completedDeps && (
                <div style={{ fontSize: 15, color: T.purple, fontFamily: "'JetBrains Mono', 'Courier New', monospace", letterSpacing: '0.06em' }}>
                  DONE
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <ProgressBar value={(depAnswered / 4) * 100} color={T.purple} height={3} />
          </div>
        </div>

        {/* Progress summary + CTA */}
        <div style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, letterSpacing: '0.07em' }}>QUESTIONS</div>
              <div style={{ fontSize: 26, fontWeight: 600, color: T.text }}>{answered + depAnswered}/{totalQs + 4}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 15, color: T.muted, letterSpacing: '0.07em' }}>AREAS DONE</div>
              <div style={{ fontSize: 26, fontWeight: 600, color: T.text }}>{completedAreas.length}/8</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {canResults ? (
              <button
                className="ph-btn"
                style={{ background: T.green, borderColor: T.green, color: '#000' }}
                onClick={() => setView('results')}
              >
                VIEW RESULTS
              </button>
            ) : (
              <div style={{ fontSize: 15, color: T.muted, fontStyle: 'italic' }}>
                Complete 4+ areas + dependency questions to unlock results
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
