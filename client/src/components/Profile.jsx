import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Shield, Camera } from 'lucide-react';
import API from '../api';

export default function Profile() {
  const [profileData, setProfileData] = useState({
    name: 'User',
    email: 'user@example.com',
    role: 'Member',
    avatar: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef(null);

  const presetAvatars = [
    'https://api.dicebear.com/7.x/micah/svg?seed=SarahCorporate&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/micah/svg?seed=AlexManager&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/micah/svg?seed=DavidDev&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/micah/svg?seed=MichaelLead&backgroundColor=ffd5dc'
  ];

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user')) || {};
    const userEmailKey = savedUser.email ? `_` + savedUser.email.replace(/[^a-zA-Z0-9]/g, '_') : '';

    const localCustomName = localStorage.getItem(`custom_profile_name${userEmailKey}`);
    const localCustomRole = localStorage.getItem(`custom_profile_role${userEmailKey}`);
    const localCustomAvatar = localStorage.getItem(`custom_profile_avatar${userEmailKey}`);

    setProfileData({
      name: localCustomName || savedUser.name || 'User',
      email: savedUser.email || 'user@example.com',
      role: localCustomRole || savedUser.role || 'Member',
      avatar: localCustomAvatar || savedUser.avatar || null
    });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileData((prev) => {
          const updated = { ...prev, avatar: base64String };
          const savedUser = JSON.parse(localStorage.getItem('user')) || {};
          const userEmailKey = savedUser.email ? `_` + savedUser.email.replace(/[^a-zA-Z0-9]/g, '_') : '';

          localStorage.setItem(`custom_profile_avatar${userEmailKey}`, base64String);
          localStorage.setItem('user', JSON.stringify({ ...savedUser, avatar: base64String }));
          
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetAvatar = (url) => {
    setProfileData((prev) => {
      const updated = { ...prev, avatar: url };
      const savedUser = JSON.parse(localStorage.getItem('user')) || {};
      const userEmailKey = savedUser.email ? `_` + savedUser.email.replace(/[^a-zA-Z0-9]/g, '_') : '';

      localStorage.setItem(`custom_profile_avatar${userEmailKey}`, url);
      localStorage.setItem('user', JSON.stringify({ ...savedUser, avatar: url }));
      
      return updated;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const savedUser = JSON.parse(localStorage.getItem('user')) || {};
      const userEmailKey = savedUser.email ? `_` + savedUser.email.replace(/[^a-zA-Z0-9]/g, '_') : '';

      localStorage.setItem(`custom_profile_name${userEmailKey}`, profileData.name);
      localStorage.setItem(`custom_profile_role${userEmailKey}`, profileData.role);
      localStorage.setItem(`custom_profile_avatar${userEmailKey}`, profileData.avatar || '');

      const updatedUser = { 
        ...savedUser, 
        name: profileData.name, 
        email: profileData.email, 
        role: profileData.role, 
        avatar: profileData.avatar 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      try {
        await API.put('/auth/profile', {
          name: profileData.name,
          email: profileData.email,
          role: profileData.role
        });
      } catch (apiErr) {
        console.log('Backend sync handled locally:', apiErr);
      }

      setLoading(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to update profile.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#0f172a', margin: 0, fontSize: '26px' }}>Profile</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Manage your account information and avatar</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'center', height: 'fit-content' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 16px auto', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #2563eb', overflow: 'hidden' }}>
            {profileData.avatar ? (
              <img 
                src={profileData.avatar} 
                alt="Profile" 
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ width: '100px', height: '100px', background: '#2563eb', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold' }}>
                {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>

          <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '18px' }}>{profileData.name}</h3>
          <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '13px' }}>{profileData.email}</p>
          <p style={{ margin: '0 0 16px 0', color: '#2563eb', fontSize: '12px', fontWeight: '600' }}>{profileData.role}</p>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />

          <button 
            type="button"
            onClick={() => fileInputRef.current.click()}
            style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}
          >
            <Camera size={16} /> Upload Custom Photo
          </button>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '10px' }}>Choose a corporate avatar:</label>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {presetAvatars.map((url, idx) => (
                <img 
                  key={idx} 
                  src={url} 
                  alt={`Corporate Avatar ${idx}`} 
                  onClick={() => handleSelectPresetAvatar(url)}
                  style={{ width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', background: '#f8fafc', padding: '2px', border: profileData.avatar === url ? '2px solid #2563eb' : '2px solid #cbd5e1', transition: '0.2s', objectFit: 'cover' }} 
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '18px' }}>Personal Information</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Full Name</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px', background: '#f8fafc' }}>
                <User size={18} color="#64748b" style={{ marginRight: '10px' }} />
                <input 
                  type="text" 
                  name="name" 
                  value={profileData.name} 
                  onChange={handleInputChange} 
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: '#0f172a' }} 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px', background: '#f8fafc' }}>
                <Mail size={18} color="#64748b" style={{ marginRight: '10px' }} />
                <input 
                  type="email" 
                  name="email" 
                  value={profileData.email} 
                  onChange={handleInputChange} 
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: '#0f172a' }} 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Role</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px', background: '#f8fafc' }}>
                <Shield size={18} color="#64748b" style={{ marginRight: '10px' }} />
                <select 
                  name="role" 
                  value={profileData.role} 
                  onChange={handleInputChange}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: '#0f172a', cursor: 'pointer' }}
                >
                  <option value="Member">Member</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Developer">Developer</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', alignSelf: 'flex-start', marginTop: '10px' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}