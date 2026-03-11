'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { MATURITY } from '@/lib/data';

const MONO  = "'JetBrains Mono', 'Courier New', monospace";
const SERIF = "'DM Serif Display', Georgia, serif";
const SANS  = "'Inter', 'Segoe UI', sans-serif";

// ── Helpers ────────────────────────────────────────────────────────────────

function getMaturityMeta(score) {
  if (score === null || score === undefined) return null;
  if (score < 20) return MATURITY[0];
  if (score < 40) return MATURITY[1];
  if (score < 60) return MATURITY[2];
  if (score < 80) return MATURITY[3];
  return MATURITY[4];
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ── Spinner ────────────────────────────────────────────────────────────────

function Spinner({ size = 24, color = '#7C3AED' }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid #E2E8F0',
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

// ── Maturity badge ─────────────────────────────────────────────────────────

function MaturityBadge({ score }) {
  const meta = getMaturityMeta(score);
  if (!meta) return <span style={{ fontSize: 16, color: '#94A3B8', fontFamily: MONO }}>—</span>;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: meta.color + '14', border: `1px solid ${meta.color}44`,
      borderRadius: 20, padding: '3px 10px',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
      <span style={{ fontSize: 15, fontWeight: 600, color: meta.color, fontFamily: MONO, letterSpacing: '0.04em' }}>
        L{meta.level} · {meta.tag}
      </span>
    </span>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const done = status === 'completed';
  return (
    <span style={{
      display: 'inline-block', fontSize: 16, fontFamily: MONO, fontWeight: 600,
      letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 4,
      background: done ? '#05966914' : '#D9770614',
      color:      done ? '#059669'   : '#D97706',
      border:    `1px solid ${done ? '#05966944' : '#D9770644'}`,
    }}>
      {done ? 'COMPLETE' : 'IN PROGRESS'}
    </span>
  );
}

// ── Progress mini-bar ──────────────────────────────────────────────────────

function MiniBar({ value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${Math.min(100, value)}%`,
          background: color, borderRadius: 4, transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 16, color: '#64748B', flexShrink: 0, minWidth: 28 }}>
        {Math.round(value)}%
      </span>
    </div>
  );
}

// ── Delete confirmation modal ──────────────────────────────────────────────

function DeleteModal({ session, onConfirm, onCancel, loading }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: 12, padding: '28px 32px',
        maxWidth: 420, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.14)', border: '1px solid #E2E8F0',
      }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>Delete diagnostic?</div>
        <div style={{ fontSize: 15, color: '#64748B', lineHeight: 1.6, marginBottom: 24 }}>
          This will permanently delete the diagnostic for{' '}
          <strong style={{ color: '#0F172A' }}>{session.orgName || 'Unnamed organisation'}</strong>.
          This cannot be undone.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="ph-btn" onClick={onCancel} disabled={loading}
            style={{ background: '#F8FAFC', borderColor: '#E2E8F0', color: '#64748B' }}>
            CANCEL
          </button>
          <button className="ph-btn" onClick={onConfirm} disabled={loading}
            style={{ background: '#DC2626', borderColor: '#DC2626', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            {loading && <Spinner size={13} color="#fff" />}
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New diagnostic modal ───────────────────────────────────────────────────

function NewDiagnosticModal({ onConfirm, onCancel, loading }) {
  const [orgName, setOrgName] = useState('');
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: 12, padding: '28px 32px',
        maxWidth: 440, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.14)', border: '1px solid #E2E8F0',
      }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>New Diagnostic</div>
        <div style={{ fontSize: 15, color: '#64748B', marginBottom: 20 }}>
          Enter the organisation name to begin a new assessment.
        </div>
        <input
          autoFocus
          className="org-in"
          placeholder="Organisation name (optional)"
          value={orgName}
          onChange={e => setOrgName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && onConfirm(orgName)}
          style={{ width: '100%', marginBottom: 20 }}
        />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="ph-btn" onClick={onCancel} disabled={loading}
            style={{ background: '#F8FAFC', borderColor: '#E2E8F0', color: '#64748B' }}>
            CANCEL
          </button>
          <button className="ph-btn" onClick={() => onConfirm(orgName)} disabled={loading}
            style={{ background: '#7C3AED', borderColor: '#7C3AED', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            {loading && <Spinner size={13} color="#fff" />}
            START DIAGNOSTIC →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Session row ────────────────────────────────────────────────────────────

function SessionRow({ session, onOpen, onDelete }) {
  const [hover, setHover] = useState(false);
  const areasComplete = session.completedAreaIds?.length ?? 0;
  const progressPct   = (areasComplete / 8) * 100;
  const meta          = getMaturityMeta(session.overallMaturity);

  return (
    <div
      onClick={() => onOpen(session.shareId)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 130px 160px 130px 110px',
        alignItems: 'center',
        gap: 16, padding: '14px 20px',
        borderBottom: '1px solid #F1F5F9',
        background: hover ? '#F8FAFC' : '#FFFFFF',
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
    >
      {/* Name + meta */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 3 }}>
          {session.orgName || <span style={{ color: '#94A3B8', fontStyle: 'italic', fontWeight: 400 }}>Unnamed organisation</span>}
        </div>
        <div style={{ fontSize: 15, color: '#94A3B8', fontFamily: MONO }}>
          Created {formatDate(session.createdAt)}
          {session.updatedAt !== session.createdAt && ` · Updated ${formatTime(session.updatedAt)}`}
          {'  '}
          <span style={{ color: '#CBD5E1' }}>#{session.shareId}</span>
        </div>
      </div>

      {/* Status */}
      <div><StatusBadge status={session.status} /></div>

      {/* Maturity */}
      <div><MaturityBadge score={session.overallMaturity} /></div>

      {/* Progress bar */}
      <div>
        <MiniBar value={progressPct} color={meta?.color ?? '#CBD5E1'} />
        <div style={{ fontSize: 16, color: '#94A3B8', fontFamily: MONO, marginTop: 4 }}>
          {areasComplete} of 8 areas
        </div>
      </div>

      {/* Actions */}
      <div
        style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="ph-btn"
          onClick={() => onOpen(session.shareId)}
          style={{ background: '#F1F5F9', borderColor: '#E2E8F0', color: '#0F172A', padding: '6px 12px', fontSize: 16 }}
        >
          {session.status === 'completed' ? 'VIEW' : 'RESUME'}
        </button>
        <button
          className="ph-btn"
          onClick={() => onDelete(session)}
          style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626', padding: '6px 10px', fontSize: 16 }}
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [sessions, setSessions]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [creating, setCreating]       = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const [filter, setFilter]           = useState('all');

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.listSessions({ limit: 100 });
      setSessions(res?.data ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const handleCreate = useCallback(async (orgName) => {
    try {
      setCreating(true);
      const session = await api.createSession(orgName);
      router.push(`/diagnostic/${session.shareId}`);
    } catch (err) {
      setError(err.message || 'Failed to create session');
      setCreating(false);
      setShowNewModal(false);
    }
  }, [router]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.deleteSession(deleteTarget.shareId);
      setSessions(prev => prev.filter(s => s.shareId !== deleteTarget.shareId));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const filteredSessions = sessions.filter(s =>
    filter === 'all' ? true : s.status === filter
  );

  const completedCount  = sessions.filter(s => s.status === 'completed').length;
  const inProgressCount = sessions.filter(s => s.status === 'in-progress').length;

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', fontFamily: SANS }}>

      {/* ── Sticky nav ──────────────────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid #E2E8F0', padding: '0 32px', height: 62,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#FFFFFF', position: 'sticky', top: 0, zIndex: 10,
        boxShadow: '0 1px 0 #E2E8F0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, color: '#fff', fontWeight: 700, fontFamily: MONO,
            flexShrink: 0,
          }}>HR</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>HR AI Diagnostic</div>
            <div style={{ fontSize: 15, color: '#94A3B8', fontFamily: MONO, letterSpacing: '0.07em' }}>MATURITY ASSESSMENT PLATFORM</div>
          </div>
        </div>
        <button
          className="ph-btn"
          onClick={() => setShowNewModal(true)}
          style={{ background: '#7C3AED', borderColor: '#7C3AED', color: '#fff' }}
        >
          + NEW DIAGNOSTIC
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 24px 80px' }}>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ fontFamily: MONO, fontSize: 16, color: '#94A3B8', letterSpacing: '0.11em', marginBottom: 14 }}>
            DIAGNOSTIC DASHBOARD
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 46, color: '#0F172A', lineHeight: 1.1, marginBottom: 10 }}>
            HR AI Readiness &amp;<br />
            <span style={{ color: '#7C3AED', fontStyle: 'italic' }}>Bottleneck Diagnostics</span>
          </div>
          <div style={{ fontSize: 15, color: '#64748B', lineHeight: 1.75, maxWidth: 540 }}>
            Run a structured diagnostic across 8 HR functions. Identify maturity gaps, operational
            bottlenecks, and the specific AI interventions that will deliver the greatest ROI — ranked by priority.
          </div>
        </div>

        {/* ── Stats strip ─────────────────────────────────────────────────── */}
        {!loading && sessions.length > 0 && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Diagnostics', value: sessions.length,   color: '#7C3AED' },
              { label: 'Completed',         value: completedCount,    color: '#059669' },
              { label: 'In Progress',       value: inProgressCount,   color: '#D97706' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: '1 1 140px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: 10, padding: '16px 20px',
              }}>
                <div style={{ fontFamily: MONO, fontSize: 15, color: '#94A3B8', letterSpacing: '0.08em', marginBottom: 6 }}>
                  {s.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 46, fontWeight: 700, color: s.color, fontFamily: MONO, lineHeight: 1 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Diagnostics list ─────────────────────────────────────────────── */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
          overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          marginBottom: 48,
        }}>
          {/* List header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 16, color: '#64748B', letterSpacing: '0.08em', fontWeight: 600 }}>
              PREVIOUS DIAGNOSTICS {!loading && `· ${filteredSessions.length} shown`}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { key: 'all',         label: 'All'         },
                { key: 'completed',   label: 'Completed'   },
                { key: 'in-progress', label: 'In Progress' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: '5px 12px', border: '1px solid', borderRadius: 6,
                    cursor: 'pointer', fontSize: 15, fontFamily: MONO, fontWeight: 600,
                    letterSpacing: '0.06em', transition: 'all 0.12s',
                    background:   filter === f.key ? '#7C3AED' : '#F8FAFC',
                    borderColor:  filter === f.key ? '#7C3AED' : '#E2E8F0',
                    color:        filter === f.key ? '#FFFFFF' : '#64748B',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Column header row */}
          {!loading && filteredSessions.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 130px 160px 130px 110px',
              gap: 16, padding: '10px 20px',
              background: '#F8FAFC', borderBottom: '1px solid #E2E8F0',
            }}>
              {['Organisation', 'Status', 'Maturity', 'Progress', ''].map((h, i) => (
                <div key={i} style={{ fontFamily: MONO, fontSize: 15, color: '#94A3B8', letterSpacing: '0.07em' }}>{h}</div>
              ))}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '52px 20px' }}>
              <Spinner size={20} />
              <span style={{ fontFamily: MONO, fontSize: 15, color: '#94A3B8', letterSpacing: '0.06em' }}>LOADING SESSIONS…</span>
            </div>
          ) : error ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, color: '#DC2626', marginBottom: 14 }}>{error}</div>
              <button className="ph-btn" onClick={loadSessions}
                style={{ background: '#F8FAFC', borderColor: '#E2E8F0', color: '#0F172A' }}>
                RETRY
              </button>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div style={{ padding: '64px 20px', textAlign: 'center' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: '#F1F5F9', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px', fontSize: 28,
              }}>
                {sessions.length === 0 ? '📋' : '🔍'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>
                {sessions.length === 0 ? 'No diagnostics yet' : 'No matches for this filter'}
              </div>
              <div style={{ fontSize: 15, color: '#64748B', marginBottom: 22 }}>
                {sessions.length === 0
                  ? 'Run your first diagnostic to identify HR bottlenecks and AI opportunities.'
                  : 'Try selecting a different filter above.'}
              </div>
              {sessions.length === 0 && (
                <button className="ph-btn" onClick={() => setShowNewModal(true)}
                  style={{ background: '#7C3AED', borderColor: '#7C3AED', color: '#fff' }}>
                  START FIRST DIAGNOSTIC →
                </button>
              )}
            </div>
          ) : (
            filteredSessions.map(session => (
              <SessionRow
                key={session.shareId}
                session={session}
                onOpen={shareId => router.push(`/diagnostic/${shareId}`)}
                onDelete={setDeleteTarget}
              />
            ))
          )}
        </div>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <div>
          <div style={{ fontFamily: MONO, fontSize: 15, color: '#94A3B8', letterSpacing: '0.09em', marginBottom: 20 }}>
            HOW IT WORKS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {[
              { num: '01', label: 'Area Assessments',  color: '#2563EB', desc: 'Score maturity and bottleneck severity across 8 HR functions — from Talent Acquisition to People Analytics.' },
              { num: '02', label: 'Dependency Mapping', color: '#D97706', desc: '4 questions identify the systemic bottleneck — the HR failure that cascades into others and creates the most business drag.' },
              { num: '03', label: 'Priority Matrix',    color: '#DC2626', desc: 'A ranked output showing urgency × maturity × business impact. Know exactly where to act first.' },
              { num: '04', label: 'AI Solutions',       color: '#7C3AED', desc: 'Prescribed AI interventions mapped to your diagnostic findings — each with ROI rationale, effort saving, and indicative tooling.' },
            ].map((step, i) => (
              <div key={i} style={{
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: 10, padding: '20px 18px',
              }}>
                <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: step.color, marginBottom: 10 }}>
                  {step.num}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>{step.label}</div>
                <div style={{ fontSize: 16, color: '#64748B', lineHeight: 1.65 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showNewModal && (
        <NewDiagnosticModal
          onConfirm={handleCreate}
          onCancel={() => setShowNewModal(false)}
          loading={creating}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          session={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
