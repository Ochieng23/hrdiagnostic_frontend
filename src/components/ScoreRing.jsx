export function ScoreRing({ score, color, size = 64 }) {
  const strokeWidth = size * 0.09;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = score !== null ? Math.max(0, Math.min(100, score)) : 0;
  const offset = circumference - (pct / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;
  const fontSize = size * 0.24;

  return (
    <svg width={size} height={size} style={{ display: 'block', flexShrink: 0 }}>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#1E1E24"
        strokeWidth={strokeWidth}
      />
      {score !== null && (
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      )}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill={score !== null ? color : '#5A5A6E'}
        fontFamily="'JetBrains Mono', 'Courier New', monospace"
        fontWeight="600"
        fontSize={fontSize}
      >
        {score !== null ? score : '–'}
      </text>
    </svg>
  );
}
