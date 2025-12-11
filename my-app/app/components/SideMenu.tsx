import Link from 'next/link';

export default function SideMenu() {
  return (
    <aside className="side-menu">
      <h3>Quick Links</h3>
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/waswannwo">Was Wann Wo</Link></li>
        <li><Link href="/calendar">Calendar</Link></li>
        <li><Link href="/downloads">Downloads</Link></li>
        <li><a href="#about">About Us</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </aside>
  );
}
