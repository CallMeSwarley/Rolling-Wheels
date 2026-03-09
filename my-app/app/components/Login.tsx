'use client';

import { useState, FormEvent } from 'react';
import data from '@/data/data.json';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (username === data.credentials.username && password === data.credentials.password) {
      onLogin();
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>CMS Login</h2>
        <p style={{ textAlign: 'center', color: '#718096', marginBottom: '1.5rem' }}>
          Access the content management system
        </p>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary">
          Login
        </button>
        {error && <div className="error-message">{error}</div>}
        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#718096' }}>
          <p>Demo credentials:</p>
          <p>Username: admin | Password: rolling2024</p>
        </div>
      </form>
    </div>
  );
}
