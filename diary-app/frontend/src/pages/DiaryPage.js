import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getDiaryEntries,
  deleteDiaryEntry,
} from '../utils/mockApi';
import { updateDiaryEntry } from '../utils/mockApi';
import { MOODS, MOOD_CONFIG, formatDate } from '../utils/constants';
import MoodBadge from '../components/MoodBadge';
import EntryForm from '../components/EntryForm';
import { useToast } from '../hooks/useToast';

export default function DiaryPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDiaryEntries({ mood: moodFilter, search });
      setEntries(data.entries);
    } catch {
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, [moodFilter, search]);

  useEffect(() => {
    const t = setTimeout(fetchEntries, 250);
    return () => clearTimeout(t);
  }, [fetchEntries]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this entry?')) return;
    try {
      await deleteDiaryEntry(id);
      setEntries((prev) => prev.filter((e) => e._id !== id));
      if (selectedEntry?._id === id) setSelectedEntry(null);
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  const handleEdit = (entry, e) => {
    e.stopPropagation();
    setEditingEntry(entry);
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      const updated = await updateDiaryEntry(editingEntry._id, data);
      setEntries((prev) =>
        prev.map((e) => (e._id === updated._id ? updated : e))
      );
      setEditingEntry(null);
      if (selectedEntry?._id === updated._id) setSelectedEntry(updated);
      toast.success('Entry updated!');
    } catch {
      toast.error('Failed to update entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Diary</h1>
          <p className="page-subtitle">{entries.length} entries found</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/new')}>
          ✏️ New Entry
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className={`filter-chip${moodFilter === '' ? ' active' : ''}`}
          onClick={() => setMoodFilter('')}
        >
          All
        </button>
        {MOODS.map((m) => (
          <button
            key={m}
            className={`filter-chip${moodFilter === m ? ' active' : ''}`}
            onClick={() => setMoodFilter(moodFilter === m ? '' : m)}
          >
            {MOOD_CONFIG[m].emoji} {m}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" /> Loading entries...
        </div>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📔</div>
          <h3>No entries found</h3>
          <p>
            {search || moodFilter
              ? 'Try adjusting your filters'
              : 'Start writing your first diary entry!'}
          </p>
          {!search && !moodFilter && (
            <button
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => navigate('/new')}
            >
              Write first entry
            </button>
          )}
        </div>
      ) : (
        <div className="entry-grid">
          {entries.map((entry) => (
            <div
              key={entry._id}
              className="entry-card"
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="entry-card-header">
                <h3 className="entry-title">{entry.title}</h3>
              </div>
              <p className="entry-date">{formatDate(entry.date)}</p>
              <p className="entry-desc">{entry.description}</p>
              <div className="entry-footer">
                <MoodBadge mood={entry.mood} size="sm" />
                <div className="entry-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => handleEdit(entry, e)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => handleDelete(entry._id, e)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="modal-overlay" onClick={() => setSelectedEntry(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="card-title">Entry Detail</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedEntry(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="detail-date">{formatDate(selectedEntry.date)}</p>
              <h2 className="detail-title">{selectedEntry.title}</h2>
              <MoodBadge mood={selectedEntry.mood} size="lg" />
              <p className="detail-body" style={{ marginTop: 16 }}>
                {selectedEntry.description}
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setEditingEntry(selectedEntry);
                  setSelectedEntry(null);
                }}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={(e) => {
                  handleDelete(selectedEntry._id, e);
                  setSelectedEntry(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingEntry && (
        <div className="modal-overlay" onClick={() => setEditingEntry(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Entry</h2>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setEditingEntry(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <EntryForm
                initial={editingEntry}
                onSubmit={handleUpdate}
                onCancel={() => setEditingEntry(null)}
                loading={saving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
