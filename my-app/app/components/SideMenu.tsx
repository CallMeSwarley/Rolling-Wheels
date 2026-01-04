'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SideMenu() {
  const pathname = usePathname();

  return (
    <aside className="side-menu">
      <h3>Quick Links</h3>
      <ul>
        <li><Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link></li>
        <li><Link href="/waswannwo" className={pathname === '/waswannwo/' ? 'active' : ''}>Was Wann Wo</Link></li>
        <li><Link href="/calendar" className={pathname === '/calendar/' ? 'active' : ''}>Kalender</Link></li>
        <li><Link href="/workshops" className={pathname === '/workshops/' ? 'active' : ''}>Workshops</Link></li>
        <li><Link href="/history" className={pathname === '/history/' ? 'active' : ''}>Historie</Link></li>
        <li><Link href="/downloads" className={pathname === '/downloads/' ? 'active' : ''}>Downloads</Link></li>
        <li><Link href="/ansprechpartner" className={pathname === '/ansprechpartner/' ? 'active' : ''}>Ansprechpartner</Link></li>
        <li><a href="#about">Über uns</a></li>
        <li><a href="#contact">Kontakt</a></li>
        <li><Link href="/datenschutz" className={pathname === '/datenschutz/' ? 'active' : ''}>Datenschutz</Link></li>
      </ul>
    </aside>
  );
}
