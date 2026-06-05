import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Reports from './pages/Reports';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    if (token) {
      setCurrentPage('dashboard');
    }
  }, [token]);

  const handleLogin = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setToken('');
    setUser({});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('login');
  };

  if (!token) {
    return (
      <div className="auth-container">
        {currentPage === 'login' ? (
          <Login onLogin={handleLogin} onSwitchToRegister={() => setCurrentPage('register')} />
        ) : (
          <Register onRegister={handleLogin} onSwitchToLogin={() => setCurrentPage('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>📊 VLM ERP System</h1>
        </div>
        <div className="navbar-menu">
          <button
            className={currentPage === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentPage('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={currentPage === 'inventory' ? 'active' : ''}
            onClick={() => setCurrentPage('inventory')}
          >
            Inventory
          </button>
          <button
            className={currentPage === 'sales' ? 'active' : ''}
            onClick={() => setCurrentPage('sales')}
          >
            Sales
          </button>
          <button
            className={currentPage === 'reports' ? 'active' : ''}
            onClick={() => setCurrentPage('reports')}
          >
            Reports
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="main-content">
        {currentPage === 'dashboard' && <Dashboard token={token} user={user} />}
        {currentPage === 'inventory' && <Inventory token={token} />}
        {currentPage === 'sales' && <Sales token={token} />}
        {currentPage === 'reports' && <Reports token={token} />}
      </div>
    </div>
  );
}

export default App;
