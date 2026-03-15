import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import DiaryPage from './pages/DiaryPage';
import NewEntryPage from './pages/NewEntryPage';
import AuthPage from './pages/AuthPage';
import { ToastProvider } from './hooks/useToast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import './styles/global.css';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
}

function AppShell() {
  const { user } = useAuth();
  return (
    <div className="app-shell">
      {user && <Sidebar />}
      <div className={user ? 'main-area' : ''} style={{ flex: 1 }}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/diary" element={
            <ProtectedRoute><DiaryPage /></ProtectedRoute>
          } />
          <Route path="/new" element={
            <ProtectedRoute><NewEntryPage /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}