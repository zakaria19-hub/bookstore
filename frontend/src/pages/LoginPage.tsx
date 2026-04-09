import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import { Layout } from '../components/Layout';
import './Pages.css';

export function LoginPage() {
  const api = useApi();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.login(email, password);
      navigate('/');
    } catch {
      // toaster handled in ApiContext
    }
  };

  return (
    <Layout>
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
          <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary auth-btn" disabled={api.status === 'loading'}>
            {api.status === 'loading' ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
        </div>
      </div>
    </Layout>
  );
}
