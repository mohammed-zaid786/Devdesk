import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Shield } from 'lucide-react';
import API from '../api';

// Authentication component for handling user login and registration in DevDesk
export default function Login({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member'); // Default role member
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
        // Send registration request with role to the backend auth endpoint
        await API.post('/auth/register', { name, email, password, role });
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

        // Extract user details securely from backend response
        const userData = response.data.user || {};
        const userName = userData.name || email.split('@')[0];
        const userEmail = userData.email || email;
        const userRole = userData.role || 'member';
        const userId = userData.id || '';

        const loggedInUser = {
          id: userId,
          name: userName,
          email: userEmail,
          role: userRole,
          avatar: userData.avatar || ''
        };

        // Save active user session
        localStorage.setItem('user', JSON.stringify(loggedInUser));

        // Initialize user-specific profile keys if not already present
        const userEmailKey = `_` + userEmail.replace(/[^a-zA-Z0-9]/g, '_');
        if (!localStorage.getItem(`custom_profile_name${userEmailKey}`)) {
          localStorage.setItem(`custom_profile_name${userEmailKey}`, userName);
          localStorage.setItem(`custom_profile_role${userEmailKey}`, userRole);
          if (userData.avatar) {
            localStorage.setItem(`custom_profile_avatar${userEmailKey}`, userData.avatar);
          }
        }

        setLoading(false);
        onLoginSuccess();
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || err.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f1f5f9', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ 
        display: 'flex', 
        background: '#ffffff', 
        borderRadius: '20px', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
        width: '100%', 
        maxWidth: '900px', 
        overflow: 'hidden',
        minHeight: '560px'
      }}>
        
        {/* Left Side - Branding & Illustration panel */}
        <div style={{ 
          flex: 1, 
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
          padding: '40px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          borderRight: '1px solid #e2e8f0',
          position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}>
              <span style={{ fontSize: '26px' }}>🚀</span>
              <h1 style={{ color: '#0f172a', margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>DevDesk</h1>
            </div>
            
            <h2 style={{ color: '#1e293b', fontSize: '24px', lineHeight: '1.3', fontWeight: '700', marginBottom: '12px' }}>
              {isSignup ? 'Join DevDesk to manage & track issues.' : 'Sign in to your DevDesk account'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
              Manage your projects, track issues, assign tasks, and boost team productivity seamlessly.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ 
              background: '#ffffff', 
              padding: '24px', 
              borderRadius: '16px', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
              display: 'inline-block',
              width: '80%'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>💻⚡</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>Issue Tracker System</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>PostgreSQL • Node.js • React</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            ©️ 2026 DevDesk Inc. All rights reserved.
          </div>
        </div>

        {/* Right Side - Form Container */}
        <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#ffffff' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ 
              width: '48px', height: '48px', background: '#eff6ff', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto',
              color: '#2563eb'
            }}>
              <User size={22} />
            </div>
            <h2 style={{ color: '#0f172a', margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700' }}>
              {isSignup ? 'Create Account' : 'Welcome Back!'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              {isSignup ? 'Fill in the details to get started' : 'Enter your email and password to continue'}
            </p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', textAlign: 'center', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isSignup && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px', textAlign: 'left' }}>Full Name</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    autoComplete="off"
                    placeholder="Enter your name"
                    style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0f172a', background: '#ffffff', textAlign: 'left' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px', textAlign: 'left' }}>Email Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  autoComplete="off"
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0f172a', background: '#ffffff', textAlign: 'left' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px', textAlign: 'left' }}>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  autoComplete="new-password"
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '10px 38px 10px 38px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0f172a', background: '#ffffff', textAlign: 'left' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#94a3b8' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px', textAlign: 'left' }}>Select Role</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Shield size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0f172a', background: '#ffffff', textAlign: 'left' }}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            )}

            {!isSignup && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                  <div 
                    onClick={() => setRememberMe(!rememberMe)}
                    style={{ 
                      width: '16px', 
                      height: '16px', 
                      borderRadius: '50%', 
                      border: '2px solid #2563eb', 
                      backgroundColor: '#ffffff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {rememberMe && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }} />}
                  </div>
                  Remember me
                </label>
                <span style={{ color: '#2563eb', fontWeight: '500', cursor: 'pointer' }}>Forgot password?</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{ background: '#2d3546', color: '#fff', border: 'none', padding: '11px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '6px', transition: 'background 0.2s' }}
            >
              {loading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={() => { setIsSignup(!isSignup); setError(''); setSuccessMsg(''); }}
              style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '13px', cursor: 'pointer', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Create account"} <ArrowRight size={14} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}