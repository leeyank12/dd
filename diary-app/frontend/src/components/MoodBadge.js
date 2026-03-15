import { MOOD_CONFIG } from '../utils/constants';

export default function MoodBadge({ mood, size = 'md' }) {
  const config = MOOD_CONFIG[mood];
  if (!config) return null;

  return (
    <span
      className="mood-badge"
      style={{
        color: config.color,
        background: config.bg,
        borderColor: config.border,
        fontSize: size === 'sm' ? '11px' : size === 'lg' ? '14px' : '12px',
        padding: size === 'sm' ? '2px 8px' : size === 'lg' ? '5px 14px' : '3px 10px',
      }}
    >
      {config.emoji} {config.label}
    </span>
  );
}
