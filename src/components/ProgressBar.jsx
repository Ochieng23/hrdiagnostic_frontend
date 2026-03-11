export function ProgressBar({ value, color, height = 4 }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      style={{
        width: '100%',
        height,
        background: '#1E1E24',
        borderRadius: height,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: '100%',
          background: color,
          borderRadius: height,
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}
