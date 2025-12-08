import React from 'react';
import { Link } from 'react-router-dom';

function SideMenu() {
  return (
    <aside className="side-menu">
      <h3>Quick Links</h3>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/calendar">Opening Hours</Link></li>
        <li><Link to="/downloads">Downloads</Link></li>
        <li><a href="#about">About Us</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </aside>
  );
}

export default SideMenu;
