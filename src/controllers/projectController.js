import React, { useState, useEffect } from 'react';
import { Folder, Plus, MoreVertical } from 'lucide-react';
import API from '../api';

// Projects management component connected with backend API and PostgreSQL database
export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [owner, setOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch projects from backend API on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await API.get('/projects');
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects from server.');
    }
  };

  // Handle creation of a new project via backend API
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await API.post('/projects', { 
        title: projectName, 
        owner_name: owner || 'Current User' 
      });

      // Update state with the newly created project from database
      setProjects([...projects, response.data.project || response.data]);
      setProjectName('');
      setOwner('');
      setShowModal(false);
      setLoading(false);
      
      // Refresh list from backend to ensure sync
      fetchProjects();
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.error || 'Failed to create project.');
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header and Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#0f172a', margin: 0, fontSize: '26px' }}>Projects</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Manage your projects from database.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Projects Table Container */}
      <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', background: '#f8fafc' }}>
              <th style={{ padding: '16px 24px' }}>Project Name</th>
              <th style={{ padding: '16px 24px' }}>Owner</th>
              <th style={{ padding: '16px 24px' }}>Total Issues</th>
              <th style={{ padding: '16px 24px' }}>Status</th>
              <th style={{ padding: '16px 24px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  No projects found in database. Create your first project!
                </td>
              </tr>
            ) : (
              projects.map((proj) => (
                <tr key={proj.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#0f172a' }}>
                  <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Folder size={18} color="#2563eb" /> {proj.title || proj.name}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#475569' }}>{proj.owner_name || proj.owner || 'Admin'}</td>
                  <td style={{ padding: '16px 24px', color: '#475569', fontWeight: '600' }}>{proj.total_issues || proj.totalIssues || 0}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                      {proj.status || 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#64748b' }}>
                    <MoreVertical size={18} style={{ cursor: 'pointer' }} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog for Creating New Project */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>Create New Project</h3>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Project Name</label>
                <input 
                  type="text" 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)} 
                  required 
                  placeholder="Enter project name"