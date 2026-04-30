'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    const supabase = createClient();

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      router.push('/');
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      setSuccess('Account created! Check your email to confirm, then log in.');
      setMode('login');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🍳</div>
        <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: 28, letterSpacing: 4, textShadow: '4px 4px 0px #000' }}>
          <span style={{ color: 'var(--cream)' }}>MEAL</span>
          <span style={{ color: 'var(--orange)' }}>MASH</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-vt)', fontSize: 20, color: 'var(--text-muted)', marginTop: 8 }}>
          Your Pixel-Powered Recipe Companion
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2px solid var(--orange)',
        boxShadow: '8px 8px 0px #000',
        padding: '36px 32px',
        width: '100%',
        maxWidth: 400,
      }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', marginBottom: 28, border: '2px solid var(--border-muted)' }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1,
              fontFamily: 'var(--font-pixel)',
              fontSize: 9,
              padding: '10px 0',
              background: mode === m ? 'var(--orange)' : 'transparent',
              color: mode === m ? '#fff' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
            }}>
              {m === 'login' ? 'LOGIN' : 'SIGN UP'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              EMAIL
            </label>
            <input
              className="pixel-input"
              type="email"
              placeholder="chef@kitchen.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              PASSWORD
            </label>
            <input
              className="pixel-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        {error && (
          <div style={{ fontFamily: 'var(--font-vt)', fontSize: 16, color: 'var(--red)', marginBottom: 16, padding: '8px 12px', border: '1px solid var(--red)' }}>
            ⚠ {error}
          </div>
        )}
        {success && (
          <div style={{ fontFamily: 'var(--font-vt)', fontSize: 16, color: '#5c5', marginBottom: 16, padding: '8px 12px', border: '1px solid #5c5' }}>
            ✓ {success}
          </div>
        )}

        <button
          className="pixel-btn"
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', fontSize: 11, padding: 14 }}
        >
          {loading ? 'LOADING...' : mode === 'login' ? 'PRESS START' : 'CREATE ACCOUNT'}
        </button>
      </div>
    </div>
  );
}