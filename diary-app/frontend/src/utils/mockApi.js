// Mock data store — mirrors the real MongoDB/Express API exactly.
// Replace calls here with real API calls when backend is running.

const STORAGE_KEY = 'diary_notes_entries';
const MOODS = ['Happy', 'Sad', 'Excited', 'Stressed', 'Neutral'];

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const seed = () => {
  const now = new Date();
  const entries = [];
  const moodSamples = ['Happy', 'Excited', 'Neutral', 'Sad', 'Stressed', 'Happy', 'Happy', 'Neutral'];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (Math.random() > 0.35) {
      const mood = moodSamples[Math.floor(Math.random() * moodSamples.length)];
      entries.push({
        _id: generateId(),
        title: getSampleTitle(mood, i),
        description: getSampleDesc(mood),
        date: d.toISOString(),
        mood,
        createdAt: d.toISOString(),
        updatedAt: d.toISOString(),
      });
    }
  }
  return entries;
};

function getSampleTitle(mood, i) {
  const titles = {
    Happy: ['A wonderful day!', 'Feeling grateful today', 'Good vibes only', 'Sunshine and smiles'],
    Excited: ['Big news arrived!', 'Can\'t contain my excitement', 'New adventure begins'],
    Neutral: ['Just another Tuesday', 'Ordinary day reflections', 'Mid-week check-in'],
    Sad: ['Tough day...', 'Feeling low today', 'Need some rest'],
    Stressed: ['Too much on my plate', 'Deadline pressure', 'Need to breathe'],
  };
  const arr = titles[mood] || ['Daily entry'];
  return arr[i % arr.length];
}

function getSampleDesc(mood) {
  const descs = {
    Happy: 'Had a great time today. Everything seemed to fall into place and I felt at peace with the world. Grateful for the little moments.',
    Excited: 'Something amazing happened! I feel energized and ready to take on whatever comes next. The future looks bright.',
    Neutral: 'Not much to report. Got through the day, completed tasks, had some quiet time. Balanced and steady.',
    Sad: 'It was a difficult day emotionally. Tried to stay present and remind myself that this too shall pass. Tomorrow is another day.',
    Stressed: 'Feeling overwhelmed with responsibilities. Made a list to try and stay organized. Need to practice some self-care tonight.',
  };
  return descs[mood] || 'Reflections on the day.';
}

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    const seeded = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return seed();
  }
};

const save = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

// ── CRUD ────────────────────────────────────────────────────────────────────

export const getDiaryEntries = ({ mood, search, page = 1, limit = 20 } = {}) => {
  let entries = load().sort((a, b) => new Date(b.date) - new Date(a.date));
  if (mood) entries = entries.filter((e) => e.mood === mood);
  if (search) {
    const q = search.toLowerCase();
    entries = entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
  }
  const total = entries.length;
  const start = (page - 1) * limit;
  return Promise.resolve({
    entries: entries.slice(start, start + limit),
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};

export const getDiaryEntry = (id) => {
  const entry = load().find((e) => e._id === id);
  return entry
    ? Promise.resolve(entry)
    : Promise.reject(new Error('Entry not found'));
};

export const createDiaryEntry = (data) => {
  const entries = load();
  const now = new Date().toISOString();
  const entry = {
    _id: generateId(),
    ...data,
    date: data.date || now,
    createdAt: now,
    updatedAt: now,
  };
  entries.unshift(entry);
  save(entries);
  return Promise.resolve(entry);
};

export const updateDiaryEntry = (id, data) => {
  const entries = load();
  const idx = entries.findIndex((e) => e._id === id);
  if (idx === -1) return Promise.reject(new Error('Entry not found'));
  entries[idx] = { ...entries[idx], ...data, updatedAt: new Date().toISOString() };
  save(entries);
  return Promise.resolve(entries[idx]);
};

export const deleteDiaryEntry = (id) => {
  const entries = load().filter((e) => e._id !== id);
  save(entries);
  return Promise.resolve({ message: 'Entry deleted', id });
};

// ── Analytics ───────────────────────────────────────────────────────────────

export const getDashboardData = () => {
  const entries = load();
  const total = entries.length;

  // Mood distribution
  const moodCounts = {};
  entries.forEach((e) => {
    moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });
  const moodDistribution = Object.entries(moodCounts)
    .map(([mood, count]) => ({
      mood,
      count,
      percentage: total ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Most common mood
  const mostCommonMood = moodDistribution[0]?.mood || null;

  // Weekly trend (last 7 days)
  const now = new Date();
  const weeklyMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    weeklyMap[key] = { date: key, Happy: 0, Sad: 0, Excited: 0, Stressed: 0, Neutral: 0 };
  }
  entries.forEach((e) => {
    const key = e.date.slice(0, 10);
    if (weeklyMap[key]) weeklyMap[key][e.mood] = (weeklyMap[key][e.mood] || 0) + 1;
  });
  const weeklyTrend = Object.values(weeklyMap);

  return Promise.resolve({ totalEntries: total, moodDistribution, mostCommonMood, weeklyTrend });
};

export const getMoodTrend = (days = 30) => {
  const entries = load();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const map = {};
  entries
    .filter((e) => new Date(e.date) >= since)
    .forEach((e) => {
      const key = e.date.slice(0, 10);
      if (!map[key]) map[key] = { date: key, Happy: 0, Sad: 0, Excited: 0, Stressed: 0, Neutral: 0 };
      map[key][e.mood] = (map[key][e.mood] || 0) + 1;
    });
  return Promise.resolve(Object.values(map).sort((a, b) => a.date.localeCompare(b.date)));
};

export { MOODS };
