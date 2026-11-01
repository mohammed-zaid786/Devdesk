import React, { useState, useEffect } from 'react';
import { CheckSquare } from 'lucide-react';
import API from '../api';

// Tasks management component connected with backend API and PostgreSQL database
export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [assigneeInput, setAssigneeInput] = useState('');

  // Fetch all issues from backend API on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await API.get('/issues');
      const issuesData = Array.isArray(response.data) ? response.data : [];
      setTasks(issuesData);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks from server.');
    } finally {
      setLoading(false);
    }
  };

  // Handle saving the assignee name
  const handleSaveAssignee = async (id) => {
    try {
      await API.patch(`/issues/${id}`, { assigned_to: assigneeInput.trim() });
      
      // Update state locally
      setTasks(tasks.map(task => {
        if (task.id === id) {
          return { ...task, assigned_to: assigneeInput.trim() };
        }
        return task;
      }));
      setEditingTaskId(null);
      setAssigneeInput('');
    } catch (err) {
      console.error('Error updating assignee:', err);
      setError('Failed to update assignee.');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#0f172a', margin: 0, fontSize: '26px' }}>My Tasks</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Issues assigned to you from database.</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Tasks Table Container */}
      <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
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
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  No tasks found in database.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#0f172a' }}>
                  <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckSquare size={18} color="#2563eb" /> {task.title}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#475569' }}>
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
                  <td style={{ padding: '16px 24px', color: '#475569' }}>
                    {editingTaskId === task.id ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          value={assigneeInput} 
                          onChange={(e) => setAssigneeInput(e.target.value)} 
                          placeholder="Enter name"
                          style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px', width: '110px' }}
                        />
                        <button 
                          onClick={() => handleSaveAssignee(task.id)}
                          style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingTaskId(null)}
                          style={{ background: '#64748b', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{task.assigned_to || 'Unassigned'}</span>
                        <button 
                          onClick={() => {
                            setEditingTaskId(task.id);
                            setAssigneeInput(task.assigned_to || '');
                          }}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#334155' }}
                        >
                          {task.assigned_to ? 'Edit' : 'Assign'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}