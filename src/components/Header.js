import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-content">
        <h1>Rolling Wheels</h1>
        <nav>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Home
          </Link>
          <Link to="/calendar" className={location.pathname === '/calendar' ? 'active' : ''}>
            Calendar
          </Link>
          <Link to="/downloads" className={location.pathname === '/downloads' ? 'active' : ''}>
            Downloads
          </Link>
          <Link to="/cms" className={location.pathname === '/cms' ? 'active' : ''}>
            CMS
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
