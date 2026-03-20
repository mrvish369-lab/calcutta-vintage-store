import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArchiveSeal, CalcuttaTram } from './HeritageIcons';
import { ShieldCheck, BookOpen, Menu, X } from 'lucide-react';
import './Header.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`ios-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="ios-header-content">
        <Link to="/" className="ios-logo">
          <ArchiveSeal size={48} className="logo-seal" />
          <div className="logo-text">
            <span className="logo-top">IMPERIAL</span>
            <span className="logo-bottom">CALCUTTA</span>
          </div>
        </Link>

        <nav className="ios-desktop-nav">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Archive Vault</Link>
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Curator Access</Link>
        </nav>

        <div className="ios-header-actions">
          <Link to="/admin" className="btn-ios-vault">
            <ShieldCheck size={18} />
            <span>Portal</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
