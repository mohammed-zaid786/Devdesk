import React, { useState, useEffect } from 'react';
import { CheckSquare } from 'lucide-react';

// Tasks management component to track issues assigned to the user
export default function Tasks() {
  const [tasks, setTasks] = useState([]);

  // Helper function to load tasks from localStorage based on current user email
  const loadTasks = () => {
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    const userEmail = currentUser.email || 'default_user';
    const storageKey = `devdesk_issues_${userEmail}`;

    const savedIssues = JSON.parse(localStorage.getItem(storageKey)) || [];
    setTasks(savedIssues);
  };

  // Load tasks on mount and setup storage event listener for live synchronization across tabs
  useEffect(() => {
    loadTasks();

    // Listen to storage events so tasks refresh immediately when updated elsewhere
    window.addEventListener('storage', loadTasks);
    return () => {
      window.removeEventListener('storage', loadTasks);
    };
  }, []);

  // Fetch data on every component mount or focus to ensure state freshness
  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#0f172a', margin: 0, fontSize: '26px' }}>My Tasks</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Issues assigned to you.</p>
      </div>

      {/* Tasks Table Container */}
      <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', background: '#f8fafc' }}>
              <th style={{ padding: '16px 24px' }}>Title</th>
              <th style={{ padding: '16px 24px' }}>Project</th>
              <th style={{ padding: '16px 24px' }}>Status</th>
              <th style={{ padding: '16px 24px' }}>Priority</th>
              <th style={{ padding: '16px 24px' }}>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  No tasks assigned to you right now.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#0f172a' }}>
                  <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckSquare size={18} color="#2563eb" /> {task.title}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#475569' }}>{task.project}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      background: task.status === 'Resolved' ? '#dcfce7' : '#fef3c7', 
                      color: task.status === 'Resolved' ? '#166534' : '#92400e', 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' 
                    }}>
                      {task.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#475569' }}>{task.priority}</td>
                  <td style={{ padding: '16px 24px', color: '#64748b' }}>{task.dueDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}