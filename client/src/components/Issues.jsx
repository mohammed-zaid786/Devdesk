import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, CheckCircle, Trash2 } from 'lucide-react';
import API from '../api';

// Issues management component connected with backend API and PostgreSQL database
export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIssues();
    fetchProjects();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await API.get('/issues');
      setIssues(response.data);
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError('Failed to load issues from server.');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await API.get('/projects');
      const projectData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.projects || []);
      setProjects(projectData);
    } catch (err) {
      console.error('Error fetching projects for dropdown:', err);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');

    try {
      await API.post('/issues', {
        title,
        project_id: projectId || null,
        priority,
        due_date: dueDate || new Date().toISOString().split('T')[0],
        status: 'Open'
      });

      setTitle('');
      setProjectId('');
      setPriority('Medium');
      setDueDate('');
      setShowModal(false);
      setLoading(false);
      
      fetchIssues();
    } catch (err) {
      console.error('Error creating issue:', err);
      setError(err.response?.data?.error || 'Failed to create issue.');
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'Open' ? 'Resolved' : 'Open';
      
      await API.patch(`/issues/${id}`, { status: nextStatus });

      setIssues(issues.map(issue => {
        if (issue.id === id) {
          return { ...issue, status: nextStatus };
        }
        return issue;
      }));
    } catch (err) {
      console.error('Error updating issue status:', err);
      setError('Failed to update issue status.');
    }
  };

  const handleDeleteIssue = async (id) => {
    if (window.confirm("Kya aap sach mein is issue ko delete karna chahte hain?")) {
      try {
        await API.delete(`/issues/${id}`);
        setIssues(issues.filter(issue => issue.id !== id));
      } catch (err) {
        console.error('Error deleting issue:', err);
        setError('Failed to delete issue from database.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#0f172a', margin: 0, fontSize: '26px' }}>Issues</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Track and manage all database project issues.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={18} /> New Issue
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

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
                  No issues found in database. Create a new issue to track bugs or tasks!
                </td>
              </tr>
            ) : (
              issues.map((issue) => {
                const p = (issue.priority || '').toLowerCase();
                return (
                  <tr key={issue.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#0f172a' }}>
                    <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertCircle size={18} style={{ flexShrink: 0 }} color={issue.status === 'Resolved' ? '#16a34a' : '#e11d48'} /> 
                      <span>{issue.title}</span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#475569' }}>
                      {issue.project_title || issue.project_name || issue.project || 'General'}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        background: issue.status === 'Resolved' ? '#dcfce7' : '#eff6ff', 
                        color: issue.status === 'Resolved' ? '#166534' : '#1d4ed8', 
                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' 
                      }}>
                        {issue.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        background: p === 'high' ? '#fee2e2' : p === 'medium' ? '#fef3c7' : '#dcfce7', 
                        color: p === 'high' ? '#991b1b' : p === 'medium' ? '#92400e' : '#166534', 
                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' 
                      }}>
                        {issue.priority || 'Medium'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#475569' }}>
                      {issue.due_date ? issue.due_date.split('T')[0] : (issue.dueDate || 'N/A')}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                          onClick={() => toggleStatus(issue.id, issue.status)}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <CheckCircle size={14} color={issue.status === 'Resolved' ? '#16a34a' : '#64748b'} />
                          {issue.status === 'Resolved' ? 'Reopen' : 'Resolve'}
                        </button>
                        <button 
                          onClick={() => handleDeleteIssue(issue.id)}
                          style={{ background: '#fee2e2', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={14} color="#991b1b" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Select Project</label>
                <select 
                  value={projectId} 
                  onChange={(e) => setProjectId(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', background: '#fff', color: '#0f172a' }}
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.title || proj.name}
                    </option>
                  ))}
                </select>
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
                  disabled={loading}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}