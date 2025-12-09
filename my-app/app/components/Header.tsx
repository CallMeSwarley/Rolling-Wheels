'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="header-content">
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
            <Image src="/logo.png" alt="Rolling Wheels Logo" width={75} height={100} style={{ borderRadius: '4px' }} />
            <h1>Rolling Wheels</h1>
          </div>
        </Link>
        <nav>
          <Link href="/" className={pathname === '/' ? 'active' : ''}>
            Home
          </Link>
          <Link href="/waswannwo" className={pathname === '/waswannwo' ? 'active' : ''}>
            Was Wann Wo
          </Link>
          <Link href="/calendar" className={pathname === '/calendar' ? 'active' : ''}>
            Calendar
          </Link>
          <Link href="/downloads" className={pathname === '/downloads' ? 'active' : ''}>
            Downloads
          </Link>
          <Link href="/cms" className={pathname === '/cms' ? 'active' : ''}>
            CMS
          </Link>
        </nav>
      </div>
    </header>
  );
}
