import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import { Layout } from '../components/Layout';
import type { RegisterInput } from '../contexts/ApiContext';
import './Pages.css';

export function RegisterPage() {
  const api = useApi();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterInput>({
    fName: '',
    lName: '',
    email: '',
    address: '',
    tel: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.register(form);
      navigate('/');
    } catch {
      // toaster handled in ApiContext
    }
  };

  return (
    <Layout>
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join BookStore today</p>
          <form onSubmit={handleSubmit} className="auth-form">
          <label>
            First name
            <input
              name="fName"
              type="text"
              value={form.fName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Last name
            <input
              name="lName"
              type="text"
              value={form.lName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Address
            <input
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Phone
            <input
              name="tel"
              type="tel"
              value={form.tel}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Password (min 6 chars)
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary auth-btn" disabled={api.status === 'loading'}>
            {api.status === 'loading' ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
        </div>
      </div>
    </Layout>
  );
}
