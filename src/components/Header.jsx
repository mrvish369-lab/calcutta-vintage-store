import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import './Header.css';

export default function Header() {
  return (
    <header className="site-header glass-panel">
      <div className="header-container">
        <Link to="/" className="brand-logo">
          <BookOpen className="logo-icon" size={28} />
          <span>Calcutta Archives</span>
        </Link>
        <nav className="main-nav">
          <Link to="/" className="nav-link">Collection</Link>
        </nav>
      </div>
    </header>
  );
}
