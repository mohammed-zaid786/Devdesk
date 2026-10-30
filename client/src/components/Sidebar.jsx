import React from 'react';
import { LayoutDashboard, FolderKanban, CheckSquare, ListTodo, User, LogOut } from 'lucide-react';

// Sidebar component for navigation matching DevDesk dashboard layout
export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'issues', label: 'Issues', icon: CheckSquare },
    { id: 'tasks', label: 'My Tasks', icon: ListTodo },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div style={{ width: '260px', background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0, fontFamily: 'Segoe UI, sans-serif' }}>
      {/* App Branding Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#60a5fa' }}>DevDesk 🚀</h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Issue Tracker</p>
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                background: isActive ? '#2563eb' : 'transparent',
                color: isActive ? '#fff' : '#94a3b8',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                textAlign: 'left'
              }}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Logout Button Footer */}
      <div style={{ padding: '20px', borderTop: '1px solid #1e293b' }}>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '10px 16px',
            background: 'transparent',
            color: '#f87171',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}