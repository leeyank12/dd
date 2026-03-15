import { useState } from 'react';
import { MOODS, MOOD_CONFIG } from '../utils/constants';

const today = () => new Date().toISOString().slice(0, 10);

export default function EntryForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    date: initial.date ? initial.date.slice(0, 10) : today(),
    mood: initial.mood || '',
  });

  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.mood) e.mood = 'Please select a mood';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          className="form-input"
          type="text"
          placeholder="What's on your mind?"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          maxLength={200}
        />
        {errors.title && (
          <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.title}</span>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Date</label>
        <input
          className="form-input"
          type="date"
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
          max={today()}
          style={{ maxWidth: 200 }}
        />
        {errors.date && (
          <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.date}</span>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">How are you feeling?</label>
        <div className="mood-picker">
          {MOODS.map((mood) => {
            const cfg = MOOD_CONFIG[mood];
            return (
              <button
                key={mood}
                type="button"
                className={`mood-option${form.mood === mood ? ' selected' : ''}`}
                onClick={() => set('mood', mood)}
                style={
                  form.mood === mood
                    ? { borderColor: cfg.color, background: cfg.bg }
                    : {}
                }
              >
                <span className="mood-option-emoji">{cfg.emoji}</span>
                <span className="mood-option-label">{cfg.label}</span>
              </button>
            );
          })}
        </div>
        {errors.mood && (
          <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.mood}</span>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Your thoughts</label>
        <textarea
          className="form-textarea"
          placeholder="Write freely — this is your space..."
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
        {errors.description && (
          <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.description}</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initial._id ? 'Update Entry' : 'Save Entry'}
        </button>
      </div>
    </form>
  );
}
