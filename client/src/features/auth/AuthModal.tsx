import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { apiRequest } from '../../api/client';
import { User } from '../../types';
import { FolderKanban, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { setAuth } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiRequest<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'demo@example.com', password: 'password123' }),
      });
      setAuth(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Failed to login with demo account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister
        ? { email, password, name, bio: bio || undefined }
        : { email, password };

      const res = await apiRequest<{ token: string; user: User }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setAuth(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content"
        style={{
          maxWidth: '380px',
          padding: '24px 28px',
          border: '1px solid var(--border-default)',
        }}
      >
        {/* Brand Header */}
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-xs)',
              background: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '12px',
            }}
          >
            <FolderKanban size={15} />
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {isRegister ? 'Create your NexusPM account' : 'Sign in to NexusPM'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.785rem', marginTop: '3px' }}>
            {isRegister ? 'Set up your workspace and start planning sprints' : 'Collaborative project management for agile engineering'}
          </p>
        </div>

        {/* Demo Fast Track Button */}
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '8px 12px',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            <span>Continue as Demo User</span>
            <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '14px 0',
            color: 'var(--text-dim)',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span>or with email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {error && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              fontSize: '0.785rem',
              marginBottom: '14px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '6px', padding: '8px' }}
            disabled={isLoading || !email || !password}
          >
            {isLoading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
                style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}
              >
                Sign in
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
                style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}
              >
                Create one
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
