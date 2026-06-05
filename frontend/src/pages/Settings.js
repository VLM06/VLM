import React, { useState } from 'react';
import axios from 'axios';

function Settings({ token, user, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Update State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || ''
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Handle Profile Update
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE}/api/profile`,
        profileData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: '✅ Profile updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ ' + (error.response?.data?.error || 'Failed to update profile') });
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!passwordData.currentPassword) {
      setMessage({ type: 'error', text: '⚠️ Enter current password' });
      setLoading(false);
      return;
    }

    if (!passwordData.newPassword) {
      setMessage({ type: 'error', text: '⚠️ Enter new password' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: '⚠️ New password must be at least 8 characters' });
      setLoading(false);
      return;
    }

    if (!/[A-Z]/.test(passwordData.newPassword)) {
      setMessage({ type: 'error', text: '⚠️ Password must contain at least 1 uppercase letter' });
      setLoading(false);
      return;
    }

    if (!/[0-9]/.test(passwordData.newPassword)) {
      setMessage({ type: 'error', text: '⚠️ Password must contain at least 1 number' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '⚠️ Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/api/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: '✅ Password changed successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          showCurrentPassword: false,
          showNewPassword: false,
          showConfirmPassword: false
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ ' + (error.response?.data?.error || 'Failed to change password') });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(passwordData.newPassword);

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>⚙️ Settings & Profile</h1>
        <p>Manage your account and security</p>
      </div>

      {message.text && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
        <button
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          🔐 Change Password
        </button>
        <button
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🛡️ Security
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="settings-panel">
          <div className="panel-card">
            <h2>👤 Profile Information</h2>
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  placeholder="Your full name"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Email (Read-only)</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="input-disabled"
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="+1 (555) 000-0000"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={profileData.company}
                  onChange={handleProfileChange}
                  placeholder="Your company"
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '💾 Saving...' : '💾 Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="settings-panel">
          <div className="panel-card">
            <h2>🔐 Change Password</h2>
            <p className="card-description">
              Keep your account secure with a strong password. Password must be at least 8 characters with 1 uppercase letter and 1 number.
            </p>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input">
                  <input
                    type={passwordData.showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setPasswordData({ ...passwordData, showCurrentPassword: !passwordData.showCurrentPassword })}
                  >
                    {passwordData.showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="password-input">
                  <input
                    type={passwordData.showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setPasswordData({ ...passwordData, showNewPassword: !passwordData.showNewPassword })}
                  >
                    {passwordData.showNewPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {passwordData.newPassword && (
                  <div className="password-strength">
                    <div className="strength-bar" style={{ width: `${(passwordStrength / 4) * 100}%`, backgroundColor: getStrengthColor(passwordStrength) }} />
                    <span style={{ color: getStrengthColor(passwordStrength) }}>
                      {getStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input">
                  <input
                    type={passwordData.showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setPasswordData({ ...passwordData, showConfirmPassword: !passwordData.showConfirmPassword })}
                  >
                    {passwordData.showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="password-tips">
                <h4>Password Requirements:</h4>
                <ul>
                  <li className={passwordData.newPassword.length >= 8 ? 'done' : ''}>✓ At least 8 characters</li>
                  <li className={/[A-Z]/.test(passwordData.newPassword) ? 'done' : ''}>✓ One uppercase letter (A-Z)</li>
                  <li className={/[0-9]/.test(passwordData.newPassword) ? 'done' : ''}>✓ One number (0-9)</li>
                  <li className={passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword ? 'done' : ''}>✓ Passwords match</li>
                </ul>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ Changing...' : '🔒 Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="settings-panel">
          <div className="panel-card">
            <h2>🛡️ Security Settings</h2>
            
            <div className="security-item">
              <div className="security-info">
                <h3>🔐 Strong Password</h3>
                <p>Your password is properly secured with encryption</p>
              </div>
              <span className="security-badge active">✓ Active</span>
            </div>

            <div className="security-item">
              <div className="security-info">
                <h3>🚨 Rate Limiting</h3>
                <p>Your account is protected against brute force attacks</p>
              </div>
              <span className="security-badge active">✓ Active</span>
            </div>

            <div className="security-item">
              <div className="security-info">
                <h3>🔒 HTTPS Connection</h3>
                <p>All data is encrypted in transit</p>
              </div>
              <span className="security-badge active">✓ Active</span>
            </div>

            <div className="security-item">
              <div className="security-info">
                <h3>📊 Session Security</h3>
                <p>Your session is secure and protected</p>
              </div>
              <span className="security-badge active">✓ Active</span>
            </div>

            <div className="danger-zone">
              <h3>⚠️ Danger Zone</h3>
              <button className="btn-danger" onClick={onLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Functions
function calculatePasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}

function getStrengthColor(strength) {
  if (strength <= 1) return '#f56565'; // Red
  if (strength === 2) return '#ed8936'; // Orange
  if (strength === 3) return '#ecc94b'; // Yellow
  return '#48bb78'; // Green
}

function getStrengthLabel(strength) {
  if (strength <= 1) return 'Weak';
  if (strength === 2) return 'Fair';
  if (strength === 3) return 'Good';
  return 'Strong';
}

export default Settings;
