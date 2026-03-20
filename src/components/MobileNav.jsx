import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, ShieldCheck, BookOpen, User } from 'lucide-react';
import './MobileNav.css';

export default function MobileNav() {
  const location = useLocation();
  
  // Don't show on reader page to maximize space if needed, 
  // but iOS apps usually keep it. User wants "mobile screen friendly".
  // Let's keep it for easy navigation.
  
  return (
    <nav className="mobile-nav glass-panel">
      <div className="mobile-nav-content">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={24} />
          <span>Library</span>
        </NavLink>
        
        <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShieldCheck size={24} />
          <span>Admin</span>
        </NavLink>
        
        <NavLink to="/login" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={24} />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
