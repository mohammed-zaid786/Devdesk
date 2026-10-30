import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalIssues, setTotalIssues] = useState(0);
  const [openIssues, setOpenIssues] = useState(0);
  const [resolvedIssues, setResolvedIssues] = useState(0);
  const [recentIssues, setRecentIssues] = useState([]);

  // Fetch project and issue statistics from localStorage on component mount
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    const userEmail = currentUser.email || 'default_user';

    const projects = JSON.parse(localStorage.getItem(`devdesk_projects_${userEmail}`)) || [];
    const issues = JSON.parse(localStorage.getItem(`devdesk_issues_${userEmail}`)) || [];

    setTotalProjects(projects.length);
    setTotalIssues(issues.length);
    setOpenIssues(issues.filter(i => i.status === 'Open').length);
    setResolvedIssues(issues.filter(i => i.status === 'Resolved').length);
    setRecentIssues(issues.slice(-5).reverse());
  }, []);

  return (
    <div>
      {/* Dashboard Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#0f172a', margin: 0, fontSize: '26px' }}>Dashboard</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Overview of your projects and issues</p>
      </div>

      {/* Metrics Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Total Projects</p>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '28px' }}>{totalProjects}</h2>
        </div>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Total Issues</p>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '28px' }}>{totalIssues}</h2>
        </div>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Open Issues</p>
          <h2 style={{ margin: 0, color: '#2563eb', fontSize: '28px' }}>{openIssues}</h2>
        </div>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Resolved Issues</p>
          <h2 style={{ margin: 0, color: '#16a34a', fontSize: '28px' }}>{resolvedIssues}</h2>
        </div>
      </div>

      {/* Recent Issues Section */}
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '16px' }}>Recent Issues</h3>
        {recentIssues.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0, padding: '20px 0', textAlign: 'center' }}>
            No issues found.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentIssues.map(issue => (
              <div key={issue.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertCircle size={18} color={issue.status === 'Resolved' ? '#16a34a' : '#e11d48'} />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{issue.title}</span>
                </div>
                <span style={{ fontSize: '12px', color: '#64748b', background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px' }}>{issue.project}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}