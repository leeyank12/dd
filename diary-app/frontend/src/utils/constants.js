export const MOODS = ['Happy', 'Sad', 'Excited', 'Stressed', 'Neutral'];

export const MOOD_CONFIG = {
  Happy: {
    emoji: '😊',
    color: '#22c55e',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    label: 'Happy',
  },
  Sad: {
    emoji: '😢',
    color: '#3b82f6',
    bg: '#eff6ff',
    border: '#bfdbfe',
    label: 'Sad',
  },
  Excited: {
    emoji: '🤩',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    label: 'Excited',
  },
  Stressed: {
    emoji: '😰',
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    label: 'Stressed',
  },
  Neutral: {
    emoji: '😐',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    label: 'Neutral',
  },
};

export const CHART_COLORS = {
  Happy: '#22c55e',
  Sad: '#3b82f6',
  Excited: '#f59e0b',
  Stressed: '#ef4444',
  Neutral: '#8b5cf6',
};

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatShortDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};
