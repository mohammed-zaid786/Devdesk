import React, { useState, useEffect, useRef } from 'react';
import { Folder, Plus, MoreVertical, Edit2, Trash2, CheckCircle, Search, Filter, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import API from '../api';

// Projects management component connected with backend API and PostgreSQL database
export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  
  // Form input states including new professional fields
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Role and User state check
  const [isAdmin, setIsAdmin] = useState(false);

  // New UI/UX State enhancements (Search, Filter, Pagination, Toast)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [toastMessage, setToastMessage] = useState('');

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

  // Fetch projects and verify admin role on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmailKey = storedUser.email ? `_` + storedUser.email.replace(/[^a-zA-Z0-9]/g, '_') : '';
    const customRole = localStorage.getItem(`custom_profile_role${userEmailKey}`) || storedUser.role || 'Member';
    
    const adminCheck = customRole.toLowerCase() === 'admin' || customRole.toLowerCase() === 'administrator';
    setIsAdmin(adminCheck);

    fetchProjects(adminCheck);
  }, []);

  const fetchProjects = async (adminCheck) => {
    try {
      const [projectsRes, issuesRes] = await Promise.all([
        API.get('/projects'),
        API.get('/issues')
      ]);

      const projectData = Array.isArray(projectsRes.data) 
        ? projectsRes.data 
        : (projectsRes.data.projects || []);

      let fetchedProjects = projectData;
      let issues = Array.isArray(issuesRes.data) ? issuesRes.data : [];

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmailKey = storedUser.email ? `_` + storedUser.email.replace(/[^a-zA-Z0-9]/g, '_') : '';
      const customName = localStorage.getItem(`custom_profile_name${userEmailKey}`) || storedUser.name || 'User';

      // Agar user Admin nahi hai, toh pehle issues ko Yash Verma ke liye filter karein
      if (!adminCheck) {
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

        // Ab unhi filtered issues ke base par projects map karenge with exact counts, priority, deadline, and status
        const assignedProjectNames = [...new Set(issues.map(i => i.project_title || i.project_name || i.project).filter(Boolean))];

        if (assignedProjectNames.length > 0) {
          fetchedProjects = assignedProjectNames.map((name, idx) => {
            const projectIssues = issues.filter(i => (i.project_title || i.project_name || i.project) === name);
            const firstIssue = projectIssues[0] || {};

            const allResolved = projectIssues.length > 0 && projectIssues.every(i => {
              const st = (i.status || '').toLowerCase();
              return st === 'resolved' || st === 'closed';
            });

            return {
              id: idx + 1,
              title: name,
              description: `Project containing ${projectIssues.length} assigned task(s)`,
              status: allResolved ? 'Completed' : 'Active',
              priority: firstIssue.priority || 'Medium',
              deadline: firstIssue.due_date || firstIssue.deadline || null,
              total_issues: projectIssues.length
            };
          });
        } else {
          fetchedProjects = [];
        }
      }

      setProjects(fetchedProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects from server.');
    }
  };

  // Trigger Toast Notification helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Open modal for Creating new project
  const handleOpenCreateModal = () => {
    if (!isAdmin) return;
    setIsEditing(false);
    setEditProjectId(null);
    setProjectName('');
    setDescription('');
    setPriority('Medium');
    setDeadline('');
    setShowModal(true);
  };

  // Open modal for Editing existing project
  const handleOpenEditModal = (proj) => {
    if (!isAdmin) return;
    setIsEditing(true);
    setEditProjectId(proj.id);
    setProjectName(proj.title || proj.name || '');
    setDescription(proj.description || '');
    setPriority(proj.priority || 'Medium');
    setDeadline(proj.deadline ? proj.deadline.split('T')[0] : '');
    setShowModal(true);
    setActiveMenuId(null);
  };

  // Handle Create or Update project via backend API
  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!isAdmin || !projectName.trim()) return;

    setLoading(true);
    setError('');

    try {
      const projectPayload = {
        title: projectName,
        description,
        priority,
        deadline: deadline || null
      };

      if (isEditing) {
        await API.put(`/projects/${editProjectId}`, projectPayload);
        showToast('Project updated successfully!');
      } else {
        await API.post('/projects', projectPayload);
        showToast('Project created successfully!');
      }

      setProjectName('');
      setDescription('');
      setPriority('Medium');
      setDeadline('');
      setShowModal(false);
      setIsEditing(false);
      setEditProjectId(null);
      setLoading(false);
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmailKey = storedUser.email ? `_` + storedUser.email.replace(/[^a-zA-Z0-9]/g, '_') : '';
      const customRole = localStorage.getItem(`custom_profile_role${userEmailKey}`) || storedUser.role || 'Member';
      const adminCheck = customRole.toLowerCase() === 'admin' || customRole.toLowerCase() === 'administrator';
      fetchProjects(adminCheck);
    } catch (err) {
      console.error('Error saving project:', err);
      setError(err.response?.data?.error || 'Failed to save project.');
      setLoading(false);
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm('Kya aap sach mein is project ko delete karna chahte hain?')) return;

    try {
      await API.delete(`/projects/${id}`);
      setActiveMenuId(null);
      showToast('Project deleted successfully!');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmailKey = storedUser.email ? `_` + storedUser.email.replace(/[^a-zA-Z0-9]/g, '_') : '';
      const customRole = localStorage.getItem(`custom_profile_role${userEmailKey}`) || storedUser.role || 'Member';
      const adminCheck = customRole.toLowerCase() === 'admin' || customRole.toLowerCase() === 'administrator';
      fetchProjects(adminCheck);
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project.');
    }
  };

  // Handle Status Toggle (Active / Completed)
  const handleToggleStatus = async (proj) => {
    if (!isAdmin) return;
    const newStatus = proj.status === 'Completed' ? 'Active' : 'Completed';
    try {
      await API.put(`/projects/${proj.id}`, {
        title: proj.title || proj.name,
        status: newStatus
      });
      setActiveMenuId(null);
      showToast(`Project status changed to ${newStatus}`);
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmailKey = storedUser.email ? `_` + storedUser.email.replace(/[^a-zA-Z0-9]/g, '_') : '';
      const customRole = localStorage.getItem(`custom_profile_role${userEmailKey}`) || storedUser.role || 'Member';
      const adminCheck = customRole.toLowerCase() === 'admin' || customRole.toLowerCase() === 'administrator';
      fetchProjects(adminCheck);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status.');
    }
  };

  // Filter projects based on search query and status filter
  const filteredProjects = projects.filter(proj => {
    const titleMatch = (proj.title || proj.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (proj.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || descMatch;

    const projStatus = proj.status || 'Active';
    const matchesStatus = statusFilter === 'All' || projStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 20px', position: 'relative' }}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#10b981', color: '#fff', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
          <Check size={18} /> {toastMessage}
        </div>
      )}

      {/* Page Header and Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#0f172a', margin: 0, fontSize: '24px' }}>Projects</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '13px' }}>Manage your projects from database.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={handleOpenCreateModal}
            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}
          >
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', background: '#fff', padding: '12px 16px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', background: '#f8fafc' }}>
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search projects by name or description..." 
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
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Projects Table Container */}
      <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', overflow: 'visible', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', background: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 20px' }}>Project Name</th>
              <th style={{ padding: '14px 20px' }}>Priority</th>
              <th style={{ padding: '14px 20px' }}>Deadline</th>
              <th style={{ padding: '14px 20px' }}>Total Issues</th>
              <th style={{ padding: '14px 20px' }}>Status</th>
              {isAdmin && <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedProjects.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  No matching projects found.
                </td>
              </tr>
            ) : (
              paginatedProjects.map((proj) => (
                <tr key={proj.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#0f172a' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                      <Folder size={16} color="#2563eb" /> {proj.title || proj.name}
                    </div>
                    {proj.description && (
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{proj.description}</div>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ 
                      background: proj.priority === 'Critical' ? '#fee2e2' : proj.priority === 'High' ? '#ffedd5' : '#f1f5f9',
                      color: proj.priority === 'Critical' ? '#991b1b' : proj.priority === 'High' ? '#c2410c' : '#475569',
                      padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600'
                    }}>
                      {proj.priority || 'Medium'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#475569', fontSize: '12px' }}>
                    {proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'No Deadline'}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#475569', fontWeight: '600' }}>{proj.total_issues || proj.totalIssues || 0}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span 
                      onClick={() => isAdmin && handleToggleStatus(proj)}
                      title={isAdmin ? "Click to toggle status" : ""}
                      style={{ 
                        background: proj.status === 'Completed' ? '#e0f2fe' : '#dcfce7', 
                        color: proj.status === 'Completed' ? '#0369a1' : '#166534', 
                        padding: '3px 8px', 
                        borderRadius: '12px', 
                        fontSize: '11px', 
                        fontWeight: '500', 
                        cursor: isAdmin ? 'pointer' : 'default',
                        display: 'inline-block'
                      }}
                    >
                      {proj.status || 'Active'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '14px 20px', textAlign: 'right', position: 'relative' }}>
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === proj.id ? null : proj.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                      >
                        <MoreVertical size={16} color="#64748b" />
                      </button>

                      {/* Action Dropdown Menu */}
                      {activeMenuId === proj.id && (
                        <div 
                          ref={menuRef}
                          style={{ 
                            position: 'absolute', 
                            right: '20px', 
                            top: '40px', 
                            background: '#fff', 
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                            borderRadius: '8px', 
                            border: '1px solid #e2e8f0', 
                            zIndex: 50, 
                            width: '130px',
                            textAlign: 'left',
                            overflow: 'hidden'
                          }}
                        >
                          <button 
                            onClick={() => handleOpenEditModal(proj)}
                            style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(proj)}
                            style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                          >
                            <CheckCircle size={13} /> Status
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(proj.id)}
                            style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#dc2626', cursor: 'pointer' }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {filteredProjects.length > itemsPerPage && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProjects.length)} of {filteredProjects.length} projects
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

      {/* Modal Dialog for Creating/Editing Project (Admin Only) */}
      {isAdmin && showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '420px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '18px' }}>{isEditing ? 'Edit Project' : 'Create New Project'}</h3>
            <form onSubmit={handleSubmitProject} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Project Name</label>
                <input 
                  type="text" 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)} 
                  required 
                  placeholder="Enter project name"
                  style={{ width: '100%', padding: '8px 10px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Enter project overview or description"
                  rows="3"
                  style={{ width: '100%', padding: '8px 10px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Deadline</label>
                  <input 
                    type="date" 
                    value={deadline} 
                    onChange={(e) => setDeadline(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setIsEditing(false); }}
                  style={{ background: '#f1f5f9', color: '#334155', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}