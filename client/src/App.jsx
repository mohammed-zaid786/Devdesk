import { useState, useEffect } from 'react';
import API from './api';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Issues from './components/Issues';
import Tasks from './components/Tasks';
import Profile from './components/Profile';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIssues = async () => {
    try {
      const response = await API.get('/issues/1');
      const data = response.data;
      if (Array.isArray(data)) {
        setIssues(data);
      } else if (data && Array.isArray(data.issues)) {
        setIssues(data.issues);
      } else {
        setIssues([]);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchIssues();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setLoading(true);
    fetchIssues();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIssues([]);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <div style={{ marginLeft: '260px', flex: 1, padding: '40px', boxSizing: 'border-box' }}>
        {activeTab === 'dashboard' && <Dashboard issues={issues} loading={loading} />}
        {activeTab === 'projects' && <Projects />}
        {activeTab === 'issues' && <Issues />}
        {activeTab === 'tasks' && <Tasks />}
        {activeTab === 'profile' && <Profile />}
      </div>
    </div>
  );
}