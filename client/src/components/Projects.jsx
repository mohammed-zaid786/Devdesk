import React, { useState, useEffect } from 'react';
import { Folder, Plus, MoreVertical } from 'lucide-react';

// Projects management component for tracking organization projects and associated issues
export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [owner, setOwner] = useState('');

  // Extract current logged-in user details to isolate storage per user
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const userEmail = currentUser.email || 'default_user';
  const storageKey = `devdesk_projects_${userEmail}`;

  // Load projects and count associated issues from localStorage on mount
  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem(storageKey)) || [];
    const savedIssues = JSON.parse(localStorage.getItem(`devdesk_issues_${userEmail}`)) || [];

    const updatedProjects = savedProjects.map(proj => {
      const count = savedIssues.filter(issue => 
        issue.project.toLowerCase().trim() === proj.name.toLowerCase().trim()
      ).length;
      return { ...proj, totalIssues: count };
    });

    setProjects(updatedProjects);
  }, [storageKey, userEmail]);

  // Handle creation of a new project
  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const newProject = {
      id: Date.now(),
      name: projectName,
      owner: owner || currentUser.name || 'Current User',
      totalIssues: 0,
      status: 'Active'
    };

    const updated = [...projects, newProject];
    setProjects(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setProjectName('');
    setOwner('');
    setShowModal(false);
  };

  return (
    <div>
      {/* Page Header and Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#0f172a', margin: 0, fontSize: '26px' }}>Projects</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Manage your projects.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={18} /> New Project
        </button>
      </div>

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
                  No projects found. Create your first project!
                </td>
              </tr>
            ) : (
              projects.map((proj) => (
                <tr key={proj.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#0f172a' }}>
                  <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Folder size={18} color="#2563eb" /> {proj.name}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#475569' }}>{proj.owner}</td>
                  <td style={{ padding: '16px 24px', color: '#475569', fontWeight: '600' }}>{proj.totalIssues}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                      {proj.status}
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