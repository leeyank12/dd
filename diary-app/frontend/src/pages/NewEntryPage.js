import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDiaryEntry } from '../utils/mockApi';
import EntryForm from '../components/EntryForm';
import { useToast } from '../hooks/useToast';

export default function NewEntryPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await createDiaryEntry(data);
      toast.success('Entry saved!');
      navigate('/diary');
    } catch {
      toast.error('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Entry</h1>
          <p className="page-subtitle">What's on your mind today?</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <EntryForm
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
