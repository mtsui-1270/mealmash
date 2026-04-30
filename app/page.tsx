'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/layout/Navbar';

const FEATURES = [
  {
    id: 'A',
    label: 'MY PANTRY',
    sub: 'Track Your Ingredients',
    icon: '🧊',
    href: '/pantry',
    color: 'var(--bg-card2)',
  },
  {
    id: 'B',
    label: 'COOK THIS!',
    sub: 'API Recipe Generator',
    icon: '🍳',
    href: '/cook',
    color: 'var(--bg-card2)',
  },
  {
    id: 'C',
    label: 'RECIPE BOOK',
    sub: 'Keep Track of Your Favorite Recipes',
    icon: '📖',
    href: '/recipes',
    color: 'var(--bg-card2)',
  },
];

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login');
    });
  }, [router]);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 24px',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 'clamp(24px, 6vw, 52px)',
          letterSpacing: 4,
          marginBottom: 60,
          textShadow: '4px 4px 0px #000',
        }}>
          <span style={{ color: 'var(--cream)' }}>MEAL</span>
          <span style={{ color: 'var(--orange)' }}>MASH</span>
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          width: '100%',
          maxWidth: 780,
          marginBottom: 40,
        }}>
          {FEATURES.map((f) => (
            <Link key={f.id} href={f.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: f.color,
                  border: '2px solid var(--orange)',
                  boxShadow: '6px 6px 0px #000',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '8px 8px 0px #000';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '6px 6px 0px #000';
                }}
              >
                <span style={{ fontSize: 28 }}>{f.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#fff', marginBottom: 6 }}>
                    {f.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-vt)', fontSize: 16, color: 'rgba(255,255,255,0.75)' }}>
                    {f.sub}
                  </div>
                </div>
                <span style={{
                  position: 'absolute', top: 8, right: 10,
                  fontFamily: 'var(--font-pixel)', fontSize: 8,
                  color: 'rgba(255,255,255,0.4)',
                }}>
                  ({f.id})
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 8,
          color: 'var(--text-muted)',
          animation: 'blink 3.5s infinite',
        }}>
          Press Any Button To Start
        </p>
      </main>
    </div>
  );
}