import React, { useState, useEffect, useRef } from 'react';
import { Folder, Plus, MoreVertical, Edit2, Trash2, CheckCircle } from 'lucide-react';
import API from '../api';

// Projects management component connected with backend API and PostgreSQL database
export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  
  const [projectName, setProjectName] = useState('');
  const [owner, setOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dropdown menu state for actions
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch projects from backend API on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await API.get('/projects');
      const projectData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.projects || []);
      setProjects(projectData);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects from server.');
    }
  };

  // Open modal for Creating new project
  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditProjectId(null);
    setProjectName('');
    setOwner('');
    setShowModal(true);
  };

  // Open modal for Editing existing project
  const handleOpenEditModal = (proj) => {
    setIsEditing(true);
    setEditProjectId(proj.id);
    setProjectName(proj.title || proj.name || '');
    setOwner(proj.owner_name || proj.owner || '');
    setShowModal(false);
    setActiveMenuId(null);
  };

  // Handle Create or Update project via backend API
  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        // Update Project API call
        await API.put(`/projects/${editProjectId}`, {
          title: projectName,
          owner_name: owner || 'Admin'
        });
      } else {
        // Create Project API call
        await API.post('/projects', { 
          title: projectName, 
          owner_name: owner || 'Current User' 
        });
      }

      setProjectName('');
      setOwner('');
      setShowModal(false);
      setIsEditing(false);
      setEditProjectId(null);
      setLoading(false);
      
      // Refresh list from backend
      fetchProjects();
    } catch (err) {
      console.error('Error saving project:', err);
      setError(err.response?.data?.error || 'Failed to save project.');
      setLoading(false);
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async (id) => {
    if (!window.confirm('Kya aap sach mein is project ko delete karna chahte hain?')) return;

    try {
      await API.delete(`/projects/${id}`);
      setActiveMenuId(null);
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project.');
    }
  };

  // Handle Status Toggle (Active / Completed)
  const handleToggleStatus = async (proj) => {
    const newStatus = proj.status === 'Completed' ? 'Active' : 'Completed';
    try {
      await API.put(`/projects/${proj.id}`, {
        title: proj.title || proj.name,
        status: newStatus
      });
      setActiveMenuId(null);
      fetchProjects();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status.');
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
          onClick={handleOpenCreateModal}
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
      <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'visible' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', background: '#f8fafc' }}>
              <th style={{ padding: '16px 24px' }}>Project Name</th>
              <th style={{ padding: '16px 24px' }}>Owner</th>
              <th style={{ padding: '16px 24px' }}>Total Issues</th>
              <th style={{ padding: '16px 24px' }}>Status</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Action</th>
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
                    <span 
                      onClick={() => handleToggleStatus(proj)}
                      title="Click to toggle status"
                      style={{ 
                        background: proj.status === 'Completed' ? '#e0f2fe' : '#dcfce7', 
                        color: proj.status === 'Completed' ? '#0369a1' : '#166534', 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '500', 
                        cursor: 'pointer',
                        display: 'inline-block'
                      }}
                    >
                      {proj.status || 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right', position: 'relative' }}>
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === proj.id ? null : proj.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <MoreVertical size={18} color="#64748b" />
                    </button>

                    {/* Action Dropdown Menu */}
                    {activeMenuId === proj.id && (
                      <div 
                        ref={menuRef}
                        style={{ 
                          position: 'absolute', 
                          right: '24px', 
                          top: '45px', 
                          background: '#fff', 
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)', 
                          borderRadius: '8px', 
                          border: '1px solid #e2e8f0', 
                          zIndex: 50, 
                          width: '140px',
                          textAlign: 'left',
                          overflow: 'hidden'
                        }}
                      >
                        <button 
                          onClick={() => handleOpenEditModal(proj)}
                          style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(proj)}
                          style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                        >
                          <CheckCircle size={14} /> Toggle Status
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(proj.id)}
                          style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#dc2626', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} /> Delete
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

      {/* Modal Dialog for Creating/Editing Project */}
      {(showModal || isEditing) && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>{isEditing ? 'Edit Project' : 'Create New Project'}</h3>
            <form onSubmit={handleSubmitProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Project Name</label>
                <input 
                  type="text" 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)} 
                  required 
                  placeholder="Enter project name"
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Owner Name</label>
                <input 
                  type="text" 
                  value={owner} 
                  onChange={(e) => setOwner(e.target.value)} 
                  placeholder="Enter owner name"
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setIsEditing(false); }}
                  style={{ background: '#f1f5f9', color: '#334155', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}