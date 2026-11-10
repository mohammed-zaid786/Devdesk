import React, { useState, useEffect } from 'react';
import { AlertCircle, ShieldAlert, Bell, User, LogOut } from 'lucide-react';
import API from '../api';

export default function Dashboard() {
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalIssues, setTotalIssues] = useState(0);
  const [openIssues, setOpenIssues] = useState(0);
  const [inProgressIssues, setInProgressIssues] = useState(0);
  const [resolvedIssues, setResolvedIssues] = useState(0);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: 'User', email: '', role: '', avatar: '' });
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userEmailKey = storedUser.email ? `_` + storedUser.email.replace(/[^a-zA-Z0-9]/g, '_') : '';
        
        const customName = localStorage.getItem(`custom_profile_name${userEmailKey}`) || storedUser.name || 'User';
        const customRole = localStorage.getItem(`custom_profile_role${userEmailKey}`) || storedUser.role || 'Member';
        const customAvatar = localStorage.getItem(`custom_profile_avatar${userEmailKey}`) || storedUser.avatar || '';

        setCurrentUser({
          name: customName,
          email: storedUser.email || 'user@example.com',
          role: customRole,
          avatar: customAvatar
        });

        const isAdminRole = customRole.toLowerCase() === 'admin' || customRole.toLowerCase() === 'administrator';
        setIsAdmin(isAdminRole);

        const [projectsRes, issuesRes] = await Promise.all([
          API.get('/projects'),
          API.get('/issues')
        ]);

        const projectsData = projectsRes.data;
        let projects = Array.isArray(projectsData) 
          ? projectsData 
          : (projectsData.projects || []);

        let issues = Array.isArray(issuesRes.data) ? issuesRes.data : [];

        // Flexible and robust filtering for non-admin members
        if (!isAdminRole) {
          issues = issues.filter(i => {
            const assignedToVal = String(i.assigned_to || '').toLowerCase();
            const assignedNameVal = String(i.assigned_to_name || '').toLowerCase();
            const userNameVal = String(customName || '').toLowerCase();
            const userEmailVal = String(storedUser.email || '').toLowerCase();
            const userIdVal = String(storedUser.id || '');

            const matchId = userIdVal && assignedToVal === userIdVal;
            const matchEmail = userEmailVal && assignedToVal.includes(userEmailVal);
            const matchName = userNameVal && (assignedNameVal === userNameVal || assignedToVal === userNameVal);
            const fallbackMatch = assignedToVal.includes(userNameVal) || assignedNameVal.includes(userNameVal);

            return matchId || matchEmail || matchName || fallbackMatch;
          });

          // Smart Project Matching using ID, Project ID, or Project Title/Name
          const assignedProjectIds = issues.map(i => String(i.project_id || i.projectId || i.project || ''));
          const assignedProjectNames = issues.map(i => String(i.project_title || i.project_name || i.project || '').toLowerCase());

          projects = projects.filter(p => {
            const pId = String(p.id);
            const pTitle = String(p.title || p.name || '').toLowerCase();
            return assignedProjectIds.includes(pId) || assignedProjectNames.includes(pTitle);
          });
        }

        // Smart fallback: Agar backend se projects array khali aa rahi hai, toh issues ke andar se unique projects nikal lo
        if (projects.length === 0 && issues.length > 0) {
          const uniqueProjNames = [...new Set(issues.map(i => i.project_title || i.project_name || i.project).filter(Boolean))];
          projects = uniqueProjNames.map((name, index) => ({ id: index + 1, title: name }));
        }

        setTotalProjects(projects.length);
        setTotalIssues(issues.length);
        
        setOpenIssues(issues.filter(i => (i.status || '').toLowerCase() === 'open').length);
        setInProgressIssues(issues.filter(i => (i.status || '').toLowerCase() === 'in progress').length);
        setResolvedIssues(issues.filter(i => (i.status || '').toLowerCase() === 'resolved' || (i.status || '').toLowerCase() === 'closed').length);
        
        setRecentIssues(issues.slice(-5).reverse());
      } catch (error) {
        console.error('Error fetching dashboard data from server:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const getPriorityBadge = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'high': return { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' };
      case 'medium': return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
      case 'low': return { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' };
      default: return { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 20px', position: 'relative' }}>
      {/* Dashboard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#0f172a', margin: 0, fontSize: '24px' }}>Dashboard</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '13px' }}>Overview of your projects and issues from database</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAdmin && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8', fontSize: '13px', fontWeight: '600' }}>
              <ShieldAlert size={16} /> Admin Mode Active
            </div>
          )}

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', position: 'relative' }}
              title="Notifications"
            >
              <Bell size={18} color="#475569" />
              {recentIssues.length > 0 && (
                <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>
              )}
            </button>

            {showNotifications && (
              <div style={{ position: 'absolute', right: 0, marginTop: '8px', width: '300px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 50, padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Recent Activity & Tasks</h4>
                  <span style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>{recentIssues.length} New</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                  {recentIssues.length === 0 ? (
                    <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', margin: '10px 0' }}>No recent activity found.</p>
                  ) : (
                    recentIssues.map(issue => (
                      <div key={issue.id} style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '500', color: '#0f172a' }}>{issue.title}</p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>Status: {issue.status}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Logo */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
              style={{ background: currentUser.avatar ? 'transparent' : '#2563eb', border: '2px solid #2563eb', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ffffff', fontWeight: '600', fontSize: '14px', overflow: 'hidden', padding: 0 }}
              title="User Profile"
            >
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User size={18} />
              )}
            </button>

            {showProfileMenu && (
              <div style={{ position: 'absolute', right: 0, marginTop: '8px', width: '220px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 50, padding: '14px' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 6px auto', border: '2px solid #2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', color: '#2563eb', fontSize: '16px', fontWeight: 'bold' }}>
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      currentUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{currentUser.name}</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>{currentUser.email}</p>
                  <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '10px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '9999px', textTransform: 'capitalize', fontWeight: '500' }}>
                    Role: {currentUser.role}
                  </span>
                </div>

                <button 
                  onClick={handleLogout}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '11px', fontWeight: '600' }}>Total Projects</p>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '22px' }}>{loading ? '...' : totalProjects}</h2>
        </div>
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '11px', fontWeight: '600' }}>Total Issues</p>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '22px' }}>{loading ? '...' : totalIssues}</h2>
        </div>
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '11px', fontWeight: '600' }}>Open Issues</p>
          <h2 style={{ margin: 0, color: '#f97316', fontSize: '22px' }}>{loading ? '...' : openIssues}</h2>
        </div>
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '11px', fontWeight: '600' }}>In Progress</p>
          <h2 style={{ margin: 0, color: '#9333ea', fontSize: '22px' }}>{loading ? '...' : inProgressIssues}</h2>
        </div>
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '11px', fontWeight: '600' }}>Resolved</p>
          <h2 style={{ margin: 0, color: '#16a34a', fontSize: '22px' }}>{loading ? '...' : resolvedIssues}</h2>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '14px' }}>Task Completion Progress</h3>
        <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '9999px', height: '10px', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${totalIssues ? (resolvedIssues / totalIssues) * 100 : 0}%`, background: '#16a34a' }} title="Resolved"></div>
          <div style={{ width: `${totalIssues ? (inProgressIssues / totalIssues) * 100 : 0}%`, background: '#9333ea' }} title="In Progress"></div>
          <div style={{ width: `${totalIssues ? (openIssues / totalIssues) * 100 : 0}%`, background: '#f97316' }} title="Open"></div>
        </div>
      </div>

      {/* Recent Issues */}
      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 14px 0', color: '#0f172a', fontSize: '15px' }}>Recent Issues</h3>
        {loading ? (
          <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '15px 0' }}>Loading...</p>
        ) : recentIssues.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '15px 0' }}>No issues found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentIssues.map(issue => {
              const priorityStyle = getPriorityBadge(issue.priority);
              return (
                <div key={issue.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertCircle size={16} color={(issue.status || '').toLowerCase() === 'resolved' ? '#16a34a' : '#e11d48'} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{issue.title}</span>
                        <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '9999px', background: priorityStyle.bg, color: priorityStyle.color, border: `1px solid ${priorityStyle.border}` }}>
                          {issue.priority || 'Medium'}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                        Project: <span style={{ color: '#2563eb', fontWeight: '500' }}>{issue.project_title || issue.project_name || issue.project || 'General'}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'right' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                        Assignee: <span style={{ fontWeight: '600', color: '#0f172a' }}>{issue.assigned_to_name || (issue.assigned_to ? `#${issue.assigned_to}` : 'Unassigned')}</span>
                      </p>
                      <p style={{ fontSize: '10px', color: '#94a3b8', margin: '1px 0 0 0' }}>
                        {issue.due_date ? `Due: ${issue.due_date.split('T')[0]}` : 'No due date'}
                      </p>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', background: '#e2e8f0', color: '#334155' }}>
                      {issue.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}