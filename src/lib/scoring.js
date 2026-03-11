import { MATURITY, AREAS, DEPENDENCY_QS } from './data';

export function calcAreaScores(answers, areas) {
  return areas.map(area => {
    const maturityQs = area.questions.filter(q => q.type === 'maturity');
    const bottleneckQ = area.questions.find(q => q.type === 'bottleneck');

    let mTotal = 0;
    let mMax = 0;
    maturityQs.forEach(q => {
      if (answers[q.id] !== undefined) {
        mTotal += Number(answers[q.id]);
        mMax += 4;
      }
    });

    const maturityScore = mMax > 0 ? Math.round((mTotal / mMax) * 100) : null;

    const bVal = bottleneckQ ? answers[bottleneckQ.id] : undefined;
    const bottleneckScore = bVal !== undefined ? Math.round((Number(bVal) / 4) * 100) : null;
    const bottleneckSeverity = bottleneckScore !== null ? 100 - bottleneckScore : null;

    const priorityIndex =
      maturityScore !== null && bottleneckSeverity !== null
        ? Math.round(bottleneckSeverity * (1 - maturityScore / 100) * area.impactWeight)
        : null;

    return { id: area.id, maturityScore, bottleneckScore, bottleneckSeverity, priorityIndex };
  });
}

export function calcDepVotes(answers, areas, dependencyQs) {
  const v = {};
  areas.forEach(a => { v[a.id] = 0; });
  dependencyQs.forEach(q => {
    const a = answers[q.id];
    if (a) v[a] = (v[a] || 0) + 1;
  });
  return v;
}

export function buildMatrix(areaScores, depVotes, areas) {
  return areas
    .map(area => {
      const sc = areaScores.find(a => a.id === area.id);
      const depBoost = (depVotes[area.id] || 0) * 15;
      return {
        ...area,
        maturityScore: sc?.maturityScore ?? null,
        bottleneckScore: sc?.bottleneckScore ?? null,
        bottleneckSeverity: sc?.bottleneckSeverity ?? null,
        priorityIndex: sc?.priorityIndex ?? null,
        depVotes: depVotes[area.id] || 0,
        rawPriority: (sc?.priorityIndex ?? 0) + depBoost,
      };
    })
    .sort((a, b) => b.rawPriority - a.rawPriority);
}

export function getMaturity(s) {
  if (s < 20) return MATURITY[0];
  if (s < 40) return MATURITY[1];
  if (s < 60) return MATURITY[2];
  if (s < 80) return MATURITY[3];
  return MATURITY[4];
}

export function calcOverallMaturity(areaScores) {
  const scored = areaScores.filter(a => a.maturityScore !== null);
  if (scored.length === 0) return null;
  const sum = scored.reduce((acc, a) => acc + a.maturityScore, 0);
  return Math.round(sum / scored.length);
}

export function calcCompletedAreaIds(answers, areas) {
  return areas
    .filter(area => area.questions.every(q => answers[q.id] !== undefined))
    .map(area => area.id);
}

export function computeAll(answers) {
  const areaScores = calcAreaScores(answers, AREAS);
  const depVotes   = calcDepVotes(answers, AREAS, DEPENDENCY_QS);
  const matrix     = buildMatrix(areaScores, depVotes, AREAS);
  const overallMaturity = calcOverallMaturity(areaScores);
  const completedAreaIds = calcCompletedAreaIds(answers, AREAS);
  return { areaScores, depVotes, matrix, overallMaturity, completedAreaIds };
}
