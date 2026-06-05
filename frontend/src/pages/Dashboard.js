import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ token, user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h2>📊 Dashboard</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Welcome, <strong>{user.name}</strong>! Here's your business overview.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="number">{stats?.totalUsers || 0}</div>
          <p style={{ color: '#999', marginTop: '10px' }}>Registered users</p>
        </div>

        <div className="stat-card">
          <h3>Total Products</h3>
          <div className="number">{stats?.totalProducts || 0}</div>
          <p style={{ color: '#999', marginTop: '10px' }}>In inventory</p>
        </div>

        <div className="stat-card">
          <h3>Total Sales</h3>
          <div className="number">${(stats?.totalSalesAmount || 0).toFixed(2)}</div>
          <p style={{ color: '#999', marginTop: '10px' }}>Revenue generated</p>
        </div>

        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="number">{stats?.totalOrders || 0}</div>
          <p style={{ color: '#999', marginTop: '10px' }}>Orders placed</p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px' }}>
        <h3>Quick Information</h3>
        <p><strong>Current Month:</strong> {stats?.recentStats?.thisMonth}</p>
        <p><strong>Your Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p style={{ marginTop: '15px', color: '#666' }}>
          Navigate using the menu above to manage inventory, create sales orders, and view reports.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
