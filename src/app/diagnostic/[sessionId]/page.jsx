'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { T } from '@/lib/data';
import { HRDiagnostic } from '@/components/HRDiagnostic';

export default function DiagnosticPage() {
  const params = useParams();
  const sessionId = params?.sessionId;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    async function load() {
      try {
        const s = await api.getSession(sessionId);
        if (!cancelled) {
          setSession(s);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load session');
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [sessionId]);

  const handleUpdate = useCallback(
    async (patch) => {
      if (!sessionId) return;
      try {
        const updated = await api.updateSession(sessionId, patch);
        setSession(updated);
      } catch (err) {
        throw err;
      }
    },
    [sessionId]
  );

  const handleFinalize = useCallback(async () => {
    if (!sessionId) return;
    try {
      const updated = await api.finalizeSession(sessionId);
      setSession(updated);
    } catch {
      // swallow — session is already computed locally
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: T.bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20,
      }}>
        <div style={{
          width: 36, height: 36, border: `2px solid ${T.border}`,
          borderTopColor: T.blue, borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{ color: T.muted, fontFamily: "'Roboto Mono', 'Courier New', monospace", fontSize: 15, letterSpacing: '0.07em' }}>
          LOADING SESSION
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div style={{
        minHeight: '100vh', background: T.bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ color: T.red, fontFamily: "'Roboto Mono', 'Courier New', monospace", fontSize: 16 }}>
          ERROR
        </div>
        <div style={{ color: T.text, fontSize: 16 }}>{error || 'Session not found'}</div>
        <button
          onClick={() => window.location.href = '/'}
          className="ph-btn"
          style={{ background: T.faint, borderColor: T.border, color: T.text }}
        >
          START NEW SESSION
        </button>
      </div>
    );
  }

  return (
    <HRDiagnostic
      session={session}
      onUpdate={handleUpdate}
      onFinalize={handleFinalize}
    />
  );
}
