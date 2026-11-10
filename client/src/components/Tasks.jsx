import  { useState, useEffect } from 'react';
import { CheckSquare, Search, Filter, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import API from '../api';

// Tasks management component connected with backend API and PostgreSQL database
export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Search, Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmailKey = storedUser.email ? `_` + storedUser.email.replace(/[^a-zA-Z0-9]/g, '_') : '';
    const customRole = localStorage.getItem(`custom_profile_role${userEmailKey}`) || storedUser.role || 'Member';
    const adminCheck = customRole.toLowerCase() === 'admin' || customRole.toLowerCase() === 'administrator';
    setIsAdmin(adminCheck);

    fetchTasks(adminCheck, storedUser, userEmailKey);
  }, []);

  const fetchTasks = async (adminCheck, storedUser, userEmailKey) => {
    try {
      const response = await API.get('/issues');
      let allIssues = Array.isArray(response.data) ? response.data : [];

      const customName = localStorage.getItem(`custom_profile_name${userEmailKey}`) || storedUser.name || 'User';

      // Agar user admin nahi hai, toh sirf unke assigned tasks filter karo
      if (!adminCheck) {
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

      setTasks(allIssues);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks from server.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get assignee name safely from issue data
  const getAssigneeName = (assignedToValue, assignedToNameFromDB) => {
    if (assignedToNameFromDB) return assignedToNameFromDB;
    if (!assignedToValue) return 'Unassigned';
    return assignedToValue;
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Filter tasks based on search and status
  const filteredTasks = tasks.filter(task => {
    const titleMatch = (task.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const projMatch = (task.project_title || task.project_name || task.project || '').toLowerCase().includes(searchQuery.toLowerCase());
    const assigneeNameStr = getAssigneeName(task.assigned_to, task.assigned_to_name).toLowerCase();
    const assigneeMatch = assigneeNameStr.includes(searchQuery.toLowerCase());
    
    const matchesSearch = titleMatch || descMatch || projMatch || assigneeMatch;
    const matchesStatus = statusFilter === 'All' || (task.status || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 20px', position: 'relative' }}>
      
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#10b981', color: '#fff', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
          <Check size={18} /> {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#0f172a', margin: 0, fontSize: '26px' }}>My Tasks</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Issues assigned to you from database.</p>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', background: '#fff', padding: '12px 16px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', background: '#f8fafc' }}>
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search tasks by title, project, or description..." 
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
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Tasks Table Container */}
      <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', background: '#f8fafc' }}>
              <th style={{ padding: '16px 24px' }}>Title</th>
              <th style={{ padding: '16px 24px' }}>Project</th>
              <th style={{ padding: '16px 24px' }}>Status</th>
              <th style={{ padding: '16px 24px' }}>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  Loading tasks...
                </td>
              </tr>
            ) : paginatedTasks.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  No tasks assigned to you.
                </td>
              </tr>
            ) : (
              paginatedTasks.map((task) => {
                const assigneeName = getAssigneeName(task.assigned_to, task.assigned_to_name);
                return (
                  <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#0f172a' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                        <CheckSquare size={18} color="#2563eb" /> {task.title}
                      </div>
                      {task.description && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{task.description}</div>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: '13px' }}>
                      {task.project_title || task.project_name || task.project || 'General'}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        background: (task.status || '').toLowerCase() === 'resolved' ? '#dcfce7' : '#fef3c7', 
                        color: (task.status || '').toLowerCase() === 'resolved' ? '#166534' : '#92400e', 
                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' 
                      }}>
                        {task.status || 'Open'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: '13px', fontWeight: '500' }}>
                      {assigneeName}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {filteredTasks.length > itemsPerPage && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTasks.length)} of {filteredTasks.length} tasks
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
    </div>
  );
}