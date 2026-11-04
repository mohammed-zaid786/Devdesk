import React, { useState, useEffect } from 'react';
import { AlertCircle, Folder, CheckCircle, Clock, Bell, Search, ArrowRight, X, LogOut } from 'lucide-react';
import API from '../api';

export default function Dashboard() {
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalIssues, setTotalIssues] = useState(0);
  const [openIssues, setOpenIssues] = useState(0);
  const [resolvedIssues, setResolvedIssues] = useState(0);
  const [projectsList, setProjectsList] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = storedUser.name || 'Zaid';
  const userEmail = storedUser.email || 'zaid@example.com';
  const userRole = storedUser.role || 'Administrator';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsRes, issuesRes] = await Promise.all([
          API.get('/projects'),
          API.get('/issues')
        ]);

        const projectsData = projectsRes.data;
        const projects = Array.isArray(projectsData) ? projectsData : (projectsData.projects || []);
        const issues = Array.isArray(issuesRes.data) ? issuesRes.data : [];

        setTotalProjects(projects.length);
        setTotalIssues(issues.length);
        setProjectsList(projects.slice(-4).reverse());
        
        setOpenIssues(issues.filter(i => (i.status || '').toLowerCase() === 'open').length);
        setResolvedIssues(issues.filter(i => (i.status || '').toLowerCase() === 'resolved').length);
        setRecentIssues(issues.slice(-5).reverse());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Search filter for both issues and projects
  const filteredIssues = recentIssues.filter(issue => 
    (issue.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projectsList.filter(proj => 
    (proj.title || proj.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div style={{ width: '100%', padding: '24px', boxSizing: 'border-box', position: 'relative' }}>
      
      {/* Top Search & Profile Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
        
        <div style={{ position: 'relative', width: '400px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues & projects..." 
            style={{ 
              width: '100%', padding: '10px 14px 10px 38px', background: '#ffffff', 
              border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', 
              color: '#0f172a', boxSizing: 'border-box', outline: 'none' 
            }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: 'relative', background: '#ffffff', padding: '8px', borderRadius: '50%', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Notifications"
          >
            <Bell size={16} color="#475569" />
            <span style={{ position: 'absolute', top: '2px', right: '2px', width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%' }}></span>
          </div>

          <div 
            onClick={() => setShowProfileModal(true)}
            style={{ width: '36px', height: '36px', background: '#2563eb', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
            title="View Profile"
          >
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Notifications Dropdown Popup */}
      {showNotifications && (
        <div style={{ position: 'absolute', right: '70px', top: '70px', width: '300px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '16px', zIndex: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>Notifications</h4>
            <X size={14} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowNotifications(false)} />
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0' }}>• PostgreSQL database synced successfully.</p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0' }}>• You have {openIssues} open issues requiring attention.</p>
        </div>
      )}

      {/* User Profile Modal Popup with Logout Button */}
      {showProfileModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', width: '320px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>User Profile</h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowProfileModal(false)} />
            </div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ width: '60px', height: '60px', background: '#2563eb', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', margin: '0 auto 10px auto' }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <h4 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>{userName}</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{userEmail}</p>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#334155', marginBottom: '16px' }}>
              <div style={{ marginBottom: '6px' }}><strong>Role:</strong> {userRole}</div>
              <div><strong>System Status:</strong> Active & Connected</div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleLogout}
                style={{ flex: 1, background: '#fee2e2', color: '#991b1b', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <LogOut size={16} /> Logout
              </button>
              <button 
                onClick={() => setShowProfileModal(false)}
                style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', 
        padding: '24px 30px', 
        borderRadius: '12px', 
        marginBottom: '20px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '700' }}>
            Welcome Back, {userName}! 👋
          </h1>
          <p style={{ margin: 0, fontSize: '13px', opacity: '0.9' }}>
            PostgreSQL database is connected. Here is your real-time system overview.
          </p>
        </div>
        <div style={{ fontSize: '40px' }}>🚀</div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px', width: '100%', boxSizing: 'border-box' }}>
        {[
          { title: 'Total Projects', count: totalProjects, icon: <Folder size={18} color="#2563eb" />, bg: '#eff6ff', color: '#2563eb' },
          { title: 'Total Issues', count: totalIssues, icon: <AlertCircle size={18} color="#dc2626" />, bg: '#fee2e2', color: '#dc2626' },
          { title: 'Open Issues', count: openIssues, icon: <Clock size={18} color="#d97706" />, bg: '#fef3c7', color: '#d97706' },
          { title: 'Resolved', count: resolvedIssues, icon: <CheckCircle size={18} color="#16a34a" />, bg: '#dcfce7', color: '#16a34a' }
        ].map((item, idx) => (
          <div key={idx} style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>{item.title}</span>
              <div style={{ background: item.bg, padding: '6px', borderRadius: '8px', display: 'flex' }}>{item.icon}</div>
            </div>
            <h2 style={{ margin: '0 0 2px 0', color: '#0f172a', fontSize: '26px', fontWeight: '700' }}>{loading ? '...' : item.count}</h2>
            <span style={{ fontSize: '11px', color: item.color, fontWeight: '600' }}>Live sync</span>
          </div>
        ))}
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Recent Issues */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>Recent Issues</h3>
            <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}>View All →</span>
          </div>

          {loading ? (
            <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', margin: '15px 0' }}>Loading...</p>
          ) : filteredIssues.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', margin: '15px 0' }}>No matching issues found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredIssues.map(issue => {
                const isResolved = (issue.status || '').toLowerCase() === 'resolved';
                return (
                  <div key={issue.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0 }} color={isResolved ? '#16a34a' : '#e11d48'} />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{issue.title}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '12px', background: isResolved ? '#dcfce7' : '#fee2e2', color: isResolved ? '#166534' : '#991b1b' }}>
                      {issue.status || 'Open'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Projects with Search Filter */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>Active Projects</h3>
            <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}>View All →</span>
          </div>

          {loading ? (
            <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', margin: '15px 0' }}>Loading...</p>
          ) : filteredProjects.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', margin: '15px 0' }}>No matching projects found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredProjects.map(proj => (
                <div key={proj.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '6px', color: '#2563eb', display: 'flex' }}>
                      <Folder size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{proj.title || proj.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>PostgreSQL Connected</div>
                    </div>
                  </div>
                  <ArrowRight size={14} color="#94a3b8" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}