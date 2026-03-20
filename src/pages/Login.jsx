import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(password)) {
      navigate('/admin');
    } else {
      setError('Incorrect secret key. Please try again.');
    }
  };

  return (
    <div className="login-layout">
      <div className="login-card glass-panel animate-fade-in-up">
        <div className="login-header">
          <Lock size={32} className="lock-icon" />
          <h1>Admin Access</h1>
          <p>This area is restricted to the administrator.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="password">Secret Key</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn-primary login-btn">Unlock Dashboard</button>
        </form>
        
        <button className="btn-secondary back-btn" onClick={() => navigate('/')}>
          Return to Store
        </button>
      </div>
    </div>
  );
}
