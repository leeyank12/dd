import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/diary', label: 'My Diary', icon: '📖' },
  { to: '/new', label: 'New Entry', icon: '✏️' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Dear Diary</h1>
        <span>Mood Tracker & Notes</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p style={{ marginBottom: 8, fontWeight: 500, color: '#1a1916' }}>
          👤 {user?.name}
        </p>
        <p style={{ marginBottom: 10, fontSize: 11 }}>{user?.email}</p>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}
          style={{ width: '100%', justifyContent: 'center' }}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}