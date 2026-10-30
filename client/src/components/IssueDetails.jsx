import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Send } from 'lucide-react';

// Issue Details page component following the DevDesk design guidelines
export default function IssueDetails({ onBack }) {
  const [comments, setComments] = useState([
    { id: 1, author: 'Aman', text: 'Looking into this error now.', time: '1 hour ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  // Handle adding a new comment to the issue thread
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([...comments, { id: comments.length + 1, author: 'Zaid', text: newComment, time: 'Just now' }]);
    setNewComment('');
  };

  return (
    <div>
      {/* Back button to return to the issues list */}
      <button 
        onClick={onBack}
        style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', padding: 0, fontSize: '14px' }}
      >
        <ArrowLeft size={16} /> Back to Issues
      </button>

      {/* Main issue header card containing status, title, and action buttons */}
      <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>Open</span>
              <span style={{ color: '#dc2626', fontWeight: '600', fontSize: '12px' }}>High Priority</span>
            </div>
            <h1 style={{ color: '#0f172a', margin: 0, fontSize: '24px' }}>Login page not working</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Edit size={14} /> Edit
            </button>
            <button style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        {/* Issue metadata information grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '16px', fontSize: '13px' }}>
          <div>
            <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Project</span>
            <strong style={{ color: '#0f172a' }}>DevDesk</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Assignee</span>
            <strong style={{ color: '#0f172a' }}>Zaid</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Created</span>
            <strong style={{ color: '#0f172a' }}>2 hours ago</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Updated</span>
            <strong style={{ color: '#0f172a' }}>2 hours ago</strong>
          </div>
        </div>
      </div>

      {/* Description and activity comments section */}
      <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '16px' }}>Description</h3>
        <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: '30px' }}>
          The login page is not working properly. Getting 500 error when trying to login with valid credentials. Please investigate database authentication middleware.
        </p>

        <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>Activity & Comments</h3>
        
        {/* Render list of user comments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          {comments.map((c) => (
            <div key={c.id} style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ color: '#0f172a', fontSize: '13px' }}>{c.author}</strong>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>{c.time}</span>
              </div>
              <p style={{ margin: 0, color: '#475569', fontSize: '13px' }}>{c.text}</p>
            </div>
          ))}
        </div>

        {/* Input form to submit a new comment */}
        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Add a comment..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', fontSize: '14px' }}
          />
          <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={16} /> Post
          </button>
        </form>
      </div>
    </div>
  );
}