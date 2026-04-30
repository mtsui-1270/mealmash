'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const NAV_LINKS = [
  { label: 'HOME', href: '/' },
  { label: 'PANTRY', href: '/pantry' },
  { label: 'COOK', href: '/cook' },
  { label: 'RECIPE', href: '/recipes' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav style={{
      background: 'var(--bg-card)',
      borderBottom: '2px solid var(--orange)',
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 0px #000',
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>🍳</span>
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, letterSpacing: 1 }}>
          <span style={{ color: 'var(--cream)' }}>MEAL</span>
          <span style={{ color: 'var(--orange)' }}>MASH</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {NAV_LINKS.map(link => {
          const active = pathname === link.href ||
            (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link key={link.href} href={link.href} style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 8,
              padding: '6px 10px',
              textDecoration: 'none',
              color: active ? '#fff' : 'var(--text-muted)',
              background: active ? 'var(--orange)' : 'transparent',
              border: active ? '2px solid var(--orange)' : '2px solid transparent',
              boxShadow: active ? '2px 2px 0px #000' : 'none',
              transition: 'all 0.1s',
            }}>
              {link.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="pixel-btn pixel-btn-outline"
          style={{ fontSize: 7, padding: '6px 10px', marginLeft: 8 }}
        >
          LOGOUT
        </button>
      </div>
    </nav>
  );
}