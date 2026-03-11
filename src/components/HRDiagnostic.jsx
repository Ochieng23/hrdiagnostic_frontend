'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AREAS, DEPENDENCY_QS, T } from '@/lib/data';
import {
  calcAreaScores,
  calcDepVotes,
  buildMatrix,
  getMaturity,
  calcOverallMaturity,
  calcCompletedAreaIds,
} from '@/lib/scoring';
import { OverviewView } from './views/OverviewView';
import { AreaView } from './views/AreaView';
import { DependencyView } from './views/DependencyView';
import { ResultsView } from './views/ResultsView';
import { SolutionsView } from './views/SolutionsView';

export function HRDiagnostic({ session, onUpdate, onFinalize }) {
  const [answers, setAnswers] = useState(() => session.answers || {});
  const [orgName, setOrgNameState] = useState(session.orgName || '');
  const [view, setView] = useState('overview');
  const [activeArea, setActiveArea] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [saveError, setSaveError] = useState(null);

  // Only re-sync on new session (not every server update)
  useEffect(() => {
    setAnswers(session.answers || {});
    setOrgNameState(session.orgName || '');
  }, [session.shareId]);

  // Debounce ref to avoid stale closures
  const pendingUpdate = useRef(null);
  const debounceTimer = useRef(null);

  const scheduleUpdate = useCallback(
    (newAnswers, newOrgName) => {
      pendingUpdate.current = { answers: newAnswers, orgName: newOrgName };
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        const update = pendingUpdate.current;
        if (!update) return;
        pendingUpdate.current = null;
        try {
          await onUpdate({ answers: update.answers, orgName: update.orgName });
          setSaveError(null);
        } catch (err) {
          setSaveError(err instanceof Error ? err.message : 'Save failed');
        }
      }, 500);
    },
    [onUpdate]
  );

  const handleAnswer = useCallback(
    (qId, value) => {
      setAnswers(prev => {
        const next = { ...prev, [qId]: value };
        scheduleUpdate(next, orgName);
        return next;
      });
    },
    [orgName, scheduleUpdate]
  );

  const handleDepAnswer = useCallback(
    (qId, value) => {
      setAnswers(prev => {
        const next = { ...prev, [qId]: value };
        scheduleUpdate(next, orgName);
        return next;
      });
    },
    [orgName, scheduleUpdate]
  );

  const setOrgName = useCallback(
    (v) => {
      setOrgNameState(v);
      scheduleUpdate(answers, v);
    },
    [answers, scheduleUpdate]
  );

  // Derived state — computed locally for instant UI
  const areaScores    = calcAreaScores(answers, AREAS);
  const depVotes      = calcDepVotes(answers, AREAS, DEPENDENCY_QS);
  const matrix        = buildMatrix(areaScores, depVotes, AREAS);
  const overallMat    = calcOverallMaturity(areaScores);
  const completedAreas = calcCompletedAreaIds(answers, AREAS);
  const completedDeps  = DEPENDENCY_QS.every(q => answers[q.id] !== undefined);
  const matMeta        = overallMat !== null ? getMaturity(overallMat) : null;
  const canResults     = completedAreas.length >= 4 && completedDeps;

  const systemicId = matrix.length > 0 ? matrix[0].id : null;

  const topDep = (() => {
    const sorted = Object.entries(depVotes).sort(([, a], [, b]) => b - a);
    return sorted.length > 0 && sorted[0][1] > 0 ? sorted[0][0] : null;
  })();

  const handleGoToResults = useCallback(async () => {
    setView('results');
    if (session.status !== 'completed' && canResults) {
      try { await onFinalize(); } catch { /* non-blocking */ }
    }
  }, [session.status, canResults, onFinalize]);

  const activeAreaData = activeArea ? AREAS.find(a => a.id === activeArea) ?? null : null;

  const setAreaAndView = useCallback((id) => {
    setActiveArea(id);
    setView('area');
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  if (view === 'area' && activeAreaData) {
    return (
      <>
        <AreaView
          area={activeAreaData}
          answers={answers}
          onAnswer={handleAnswer}
          onBack={() => setView('overview')}
        />
        {saveError && <SaveErrorToast message={saveError} onDismiss={() => setSaveError(null)} />}
      </>
    );
  }

  if (view === 'dependency') {
    return (
      <>
        <DependencyView
          answers={answers}
          onAnswer={handleDepAnswer}
          onBack={() => setView('overview')}
          onProceed={() => setView('overview')}
          completedDeps={completedDeps}
        />
        {saveError && <SaveErrorToast message={saveError} onDismiss={() => setSaveError(null)} />}
      </>
    );
  }

  if (view === 'results') {
    return (
      <>
        <ResultsView
          orgName={orgName}
          matrix={matrix}
          completedAreas={completedAreas}
          overallMat={overallMat}
          matMeta={matMeta}
          systemicId={systemicId}
          topDep={topDep}
          onBack={() => setView('overview')}
          onViewSolutions={() => setView('solutions')}
        />
        {saveError && <SaveErrorToast message={saveError} onDismiss={() => setSaveError(null)} />}
      </>
    );
  }

  if (view === 'solutions') {
    return (
      <>
        <SolutionsView
          orgName={orgName}
          matrix={matrix}
          systemicId={systemicId}
          expanded={expanded}
          setExpanded={setExpanded}
          onBack={() => setView('results')}
        />
        {saveError && <SaveErrorToast message={saveError} onDismiss={() => setSaveError(null)} />}
      </>
    );
  }

  // Default: overview
  return (
    <>
      <OverviewView
        session={session}
        answers={answers}
        orgName={orgName}
        setOrgName={setOrgName}
        setView={(v) => {
          if (v === 'results') {
            handleGoToResults();
          } else {
            setView(v);
          }
        }}
        setArea={setAreaAndView}
        areaScores={areaScores}
        matrix={matrix}
        depVotes={depVotes}
        completedAreas={completedAreas}
        completedDeps={completedDeps}
        overallMat={overallMat}
        matMeta={matMeta}
        canResults={canResults}
      />
      {saveError && <SaveErrorToast message={saveError} onDismiss={() => setSaveError(null)} />}
    </>
  );
}

function SaveErrorToast({ message, onDismiss }) {
  return (
    <div
      style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
        background: T.surface, border: `1px solid ${T.red}66`,
        borderRadius: 8, padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        maxWidth: 340, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.red, flexShrink: 0 }} />
      <div style={{ fontSize: 16, color: T.muted, flex: 1 }}>
        <span style={{ color: T.red }}>Save failed: </span>{message}
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: 'none', border: 'none', color: T.muted, cursor: 'pointer',
          fontSize: 16, padding: 0, flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
