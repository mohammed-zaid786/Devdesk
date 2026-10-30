import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Shield, Camera } from 'lucide-react';

// Profile management component for updating user account details and avatar
export default function Profile() {
  const [profileData, setProfileData] = useState({
    name: 'User',
    email: 'user@example.com',
    role: 'Member',
    avatar: null
  });
  
  const fileInputRef = useRef(null);

  // Load user profile details from localStorage when the component mounts
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setProfileData({
        name: savedUser.name || 'User',
        email: savedUser.email || 'user@example.com',
        role: savedUser.role || 'Member',
        avatar: savedUser.avatar || null
      });
    }
  }, []);

  // Handle avatar image selection and update localStorage
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileData((prev) => {
        const updated = { ...prev, avatar: imageUrl };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Handle text input and select dropdown changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Save updated profile information back to localStorage
  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('user', JSON.stringify(profileData));
    alert('Profile updated successfully!');
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#0f172a', margin: 0, fontSize: '26px' }}>Profile</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Manage your account information</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        {/* Avatar Upload Card */}
        <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'center', height: 'fit-content' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 16px auto' }}>
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
          <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '13px' }}>{profileData.email}</p>

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
            style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Camera size={16} /> Change Photo
          </button>
        </div>

        {/* Personal Information Form */}
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
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', alignSelf: 'flex-start', marginTop: '10px' }}
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}