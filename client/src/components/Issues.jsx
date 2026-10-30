import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, CheckCircle } from 'lucide-react';

// Issues management component for tracking tasks and bugs
export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  // Retrieve current user data from localStorage to isolate storage per user
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const userEmail = currentUser.email || 'default_user';
  const storageKey = `devdesk_issues_${userEmail}`;

  // Load saved issues from localStorage on component mount
  useEffect(() => {
    const savedIssues = JSON.parse(localStorage.getItem(storageKey)) || [];
    setIssues(savedIssues);
  }, [storageKey]);

  // Helper function to update state and persist issues to localStorage
  const saveAndSyncIssues = (newIssues) => {
    setIssues(newIssues);
    localStorage.setItem(storageKey, JSON.stringify(newIssues));
  };

  // Handle creation of a new issue
  const handleCreateIssue = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newIssue = {
      id: Date.now(),
      title,
      project: project || 'General',
      status: 'Open',
      priority,
      assignee: currentUser.name || 'Current User',
      dueDate: dueDate || new Date().toLocaleDateString()
    };

    const updated = [...issues, newIssue];
    saveAndSyncIssues(updated);
    setTitle('');
    setProject('');
    setPriority('Medium');
    setDueDate('');
    setShowModal(false);
  };

  // Toggle issue status between 'Open' and 'Resolved'
  const toggleStatus = (id) => {
    const updated = issues.map(issue => {
      if (issue.id === id) {
        const nextStatus = issue.status === 'Open' ? 'Resolved' : 'Open';
        return { ...issue, status: nextStatus };
      }
      return issue;
    });
    saveAndSyncIssues(updated);
  };

  return (
    <div>
      {/* Page Header and Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#0f172a', margin: 0, fontSize: '26px' }}>Issues</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Track and manage all project issues.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={18} /> New Issue
        </button>
      </div>

      {/* Issues Table Container */}
      <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', background: '#f8fafc' }}>
              <th style={{ padding: '16px 24px' }}>Title</th>
              <th style={{ padding: '16px 24px' }}>Project</th>
              <th style={{ padding: '16px 24px' }}>Status</th>
              <th style={{ padding: '16px 24px' }}>Priority</th>
              <th style={{ padding: '16px 24px' }}>Due Date</th>
              <th style={{ padding: '16px 24px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  No issues found. Create a new issue to track bugs or tasks!
                </td>
              </tr>
            ) : (
              issues.map((issue) => (
                <tr key={issue.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#0f172a' }}>
                  <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertCircle size={18} color={issue.status === 'Resolved' ? '#16a34a' : '#e11d48'} /> {issue.title}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#475569' }}>{issue.project}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      background: issue.status === 'Resolved' ? '#dcfce7' : '#eff6ff', 
                      color: issue.status === 'Resolved' ? '#166534' : '#1d4ed8', 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' 
                    }}>
                      {issue.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#475569' }}>{issue.priority}</td>
                  <td style={{ padding: '16px 24px', color: '#475569' }}>{issue.dueDate}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <button 
                      onClick={() => toggleStatus(issue.id)}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <CheckCircle size={14} color={issue.status === 'Resolved' ? '#16a34a' : '#64748b'} />
                      {issue.status === 'Resolved' ? 'Reopen' : 'Resolve'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog for Creating New Issue */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>Create New Issue</h3>
            <form onSubmit={handleCreateIssue} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Issue Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  placeholder="Enter issue description"
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Project Name</label>
                <input 
                  type="text" 
                  value={project} 
                  onChange={(e) => setProject(e.target.value)} 
                  placeholder="Enter project name"
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Priority</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', background: '#fff', color: '#0f172a' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Due Date</label>
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', color: '#0f172a' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ background: '#f1f5f9', color: '#334155', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}