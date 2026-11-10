import { useState, useEffect } from 'react';
import { AlertCircle, Plus, Trash2, Search, Filter, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import API from '../api';

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmailKey = storedUser.email ? `_` + storedUser.email.replace(/[^a-zA-Z0-9]/g, '_') : '';
    const customRole = localStorage.getItem(`custom_profile_role${userEmailKey}`) || storedUser.role || 'Member';
    const adminCheck = customRole.toLowerCase() === 'admin' || customRole.toLowerCase() === 'administrator';
    setIsAdmin(adminCheck);

    const fetchAllData = async () => {
      // 1. Fetch Issues safely
      try {
        const resIssues = await API.get('/issues');
        let allIssues = Array.isArray(resIssues.data) ? resIssues.data : [];

        // Agar user member hai, toh sirf unke assigned issues filter karo
        if (!adminCheck) {
          const customName = localStorage.getItem(`custom_profile_name${userEmailKey}`) || storedUser.name || 'User';
          allIssues = allIssues.filter(i => {
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
        }

        setIssues(allIssues);
      } catch (err) {
        console.error('Error fetching issues:', err);
        setError('Failed to load issues from server.');
      }

      // 2. Fetch Projects safely
      try {
        const resProjects = await API.get('/projects');
        const projectData = Array.isArray(resProjects.data) ? resProjects.data : (resProjects.data.projects || []);
        setProjects(projectData);
      } catch (err) {
        console.error('Error fetching projects for dropdown:', err);
      }
    };

    fetchAllData();
  }, []);

  const getAssigneeName = (assignedToValue, assignedToNameFromDB) => {
    if (assignedToNameFromDB) return assignedToNameFromDB;
    if (!assignedToValue) return 'Unassigned';
    return assignedToValue;
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const reloadIssues = async () => {
    try {
      const resIssues = await API.get('/issues');
      let allIssues = Array.isArray(resIssues.data) ? resIssues.data : [];

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmailKey = storedUser.email ? `_` + storedUser.email.replace(/[^a-zA-Z0-9]/g, '_') : '';
      const customRole = localStorage.getItem(`custom_profile_role${userEmailKey}`) || storedUser.role || 'Member';
      const adminCheck = customRole.toLowerCase() === 'admin' || customRole.toLowerCase() === 'administrator';

      if (!adminCheck) {
        const customName = localStorage.getItem(`custom_profile_name${userEmailKey}`) || storedUser.name || 'User';
        allIssues = allIssues.filter(i => {
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
      }
      setIssues(allIssues);
    } catch (err) {
      console.error('Error reloading issues:', err);
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
        description,
        project_id: projectId || null,
        assigned_to: assignedTo || null,
        priority,
        due_date: dueDate || new Date().toISOString().split('T')[0],
        status: 'Open'
      });

      setTitle('');
      setDescription('');
      setProjectId('');
      setAssignedTo('');
      setPriority('Medium');
      setDueDate('');
      setShowModal(false);
      setLoading(false);
      
      showToast('Issue created successfully!');
      await reloadIssues();
    } catch (err) {
      console.error('Error creating issue:', err);
      setError(err.response?.data?.error || 'Failed to create issue.');
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/issues/${id}`, { status: newStatus }).catch(() => API.put(`/issues/${id}`, { status: newStatus }));
      setIssues(issues.map(issue => issue.id === id ? { ...issue, status: newStatus } : issue));
      showToast(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating issue status:', err);
      setError('Failed to update issue status.');
    }
  };

  const handlePriorityChange = async (id, newPriority) => {
    try {
      await API.patch(`/issues/${id}`, { priority: newPriority }).catch(() => API.put(`/issues/${id}`, { priority: newPriority }));
      setIssues(issues.map(issue => issue.id === id ? { ...issue, priority: newPriority } : issue));
      showToast(`Priority updated to ${newPriority}`);
    } catch (err) {
      console.error('Error updating priority:', err);
      setError('Failed to update issue priority.');
    }
  };

  const handleDeleteIssue = async (id) => {
    if (window.confirm("Kya aap sach mein is issue ko delete karna chahte hain?")) {
      try {
        await API.delete(`/issues/${id}`);
        setIssues(issues.filter(issue => issue.id !== id));
        showToast('Issue deleted successfully!');
      } catch (err) {
        console.error('Error deleting issue:', err);
        setError('Failed to delete issue from database.');
      }
    }
  };

  const filteredIssues = issues.filter(issue => {
    const titleMatch = (issue.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (issue.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const projMatch = (issue.project_title || issue.project_name || issue.project || '').toLowerCase().includes(searchQuery.toLowerCase());
    const assigneeNameStr = getAssigneeName(issue.assigned_to, issue.assigned_to_name).toLowerCase();
    const assigneeMatch = assigneeNameStr.includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || descMatch || projMatch || assigneeMatch;

    const matchesStatus = statusFilter === 'All' || (issue.status || '').toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'All' || (issue.priority || '').toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIssues = filteredIssues.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 20px', position: 'relative' }}>
      
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#10b981', color: '#fff', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
          <Check size={18} /> {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#0f172a', margin: 0, fontSize: '24px' }}>Issues</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '13px' }}>Track and manage all database project issues.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}
        >
          <Plus size={18} /> New Issue
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', background: '#fff', padding: '12px 16px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', background: '#f8fafc' }}>
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search issues by title, project, assignee, or description..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', color: '#0f172a' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', background: '#f8fafc' }}>
          <Filter size={16} color="#64748b" />
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a', cursor: 'pointer' }}
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', background: '#f8fafc' }}>
          <select 
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a', cursor: 'pointer' }}
          >
            <option value="All">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Issues Table Container */}
      <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', overflow: 'visible', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', background: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 20px' }}>Title</th>
              <th style={{ padding: '14px 20px' }}>Project</th>
              <th style={{ padding: '14px 20px' }}>Assignee</th>
              <th style={{ padding: '14px 20px' }}>Status</th>
              <th style={{ padding: '14px 20px' }}>Priority</th>
              <th style={{ padding: '14px 20px' }}>Due Date</th>
              <th style={{ padding: '14px 20px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedIssues.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  No matching issues found.
                </td>
              </tr>
            ) : (
              paginatedIssues.map((issue) => {
                const p = (issue.priority || '').toLowerCase();
                const assigneeName = getAssigneeName(issue.assigned_to, issue.assigned_to_name);
                const st = (issue.status || 'Open').toLowerCase();
                return (
                  <tr key={issue.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#0f172a' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} color={issue.status === 'Resolved' ? '#16a34a' : '#e11d48'} /> 
                        <span>{issue.title}</span>
                      </div>
                      {issue.description && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{issue.description}</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#475569', fontSize: '12px' }}>
                      {issue.project_title || issue.project_name || issue.project || 'General'}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#475569', fontSize: '12px', fontWeight: '500' }}>
                      {assigneeName}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <select
                        value={issue.status || 'Open'}
                        onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                        style={{
                          background: st === 'resolved' ? '#dcfce7' : st === 'in progress' ? '#fef3c7' : '#eff6ff',
                          color: st === 'resolved' ? '#166534' : st === 'in progress' ? '#92400e' : '#1d4ed8',
                          border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer'
                        }}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <select
                        value={issue.priority || 'Medium'}
                        onChange={(e) => handlePriorityChange(issue.id, e.target.value)}
                        style={{
                          background: p === 'high' ? '#fee2e2' : p === 'medium' ? '#fef3c7' : '#dcfce7',
                          color: p === 'high' ? '#991b1b' : p === 'medium' ? '#92400e' : '#166534',
                          border: 'none', padding: '3px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer'
                        }}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#475569', fontSize: '12px' }}>
                      {issue.due_date ? issue.due_date.split('T')[0] : (issue.dueDate || 'N/A')}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button 
                          onClick={() => handleDeleteIssue(issue.id)}
                          style={{ background: '#fee2e2', border: '1px solid #fecaca', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={13} color="#991b1b" />
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

        {filteredIssues.length > itemsPerPage && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredIssues.length)} of {filteredIssues.length} issues
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#94a3b8' : '#334155', display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#94a3b8' : '#334155', display: 'flex', alignItems: 'center' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '420px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '18px' }}>Create New Issue</h3>
            <form onSubmit={handleCreateIssue} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Issue Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  placeholder="Enter issue title"
                  style={{ width: '100%', padding: '8px 10px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Enter issue description"
                  rows="3"
                  style={{ width: '100%', padding: '8px 10px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Select Project</label>
                <select 
                  value={projectId} 
                  onChange={(e) => setProjectId(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Assignee Name</label>
                <input 
                  type="text" 
                  value={assignedTo} 
                  onChange={(e) => setAssignedTo(e.target.value)} 
                  placeholder="Enter assignee name (e.g. Yash Verma)"
                  style={{ width: '100%', padding: '8px 10px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Priority</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ background: '#f1f5f9', color: '#334155', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  {loading ? 'Creating...' : 'Create Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}