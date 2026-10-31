import React, { useState } from 'react';
import API from '../api';

// Authentication component for handling user login and registration in DevDesk
export default function Login({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form submission for both user registration and authentication
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isSignup) {
        // Send registration request to the backend auth endpoint
        await API.post('/auth/register', { name, email, password });
        setSuccessMsg('Registration successful! Please sign in now.');
        setIsSignup(false);
        setLoading(false);
      } else {
        // Send login request to authenticate credentials
        const response = await API.post('/auth/login', { email, password });
        
        // Save the received authentication token in localStorage
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }

        // Cache user details to display proper information across profile pages
        const loggedInUser = {
          name: response.data.name || name || email.split('@')[0],
          email: email,
          role: response.data.role || (email.includes('admin') ? 'Administrator' : 'Member')
        };
        localStorage.setItem('user', JSON.stringify(loggedInUser));

        setLoading(false);
        onLoginSuccess();
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
      <div style={{ background: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        
        {/* Header section with brand logo and subtitle */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '24px' }}>DevDesk 🚀</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            {isSignup ? 'Create your DevDesk account' : 'Sign in to your DevDesk account'}
          </p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Success notification banner */}
        {successMsg && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
            {successMsg}
          </div>
        )}

        {/* Authentication form container */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isSignup && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                autoComplete="off"
                placeholder="Enter your name"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              autoComplete="off"
              placeholder="you@example.com"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              autoComplete="new-password"
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}
          >
            {loading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        {/* Toggle between Sign In and Sign Up views */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            type="button" 
            onClick={() => { setIsSignup(!isSignup); setError(''); setSuccessMsg(''); }}
            style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
          >
            {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Create account"}
          </button>
        </div>

      </div>
    </div>
  );
}