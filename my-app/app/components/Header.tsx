'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="header-content">
        <h1>Rolling Wheels</h1>
        <nav>
          <Link href="/" className={pathname === '/' ? 'active' : ''}>
            Home
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
