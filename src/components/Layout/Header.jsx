/**
 * Professional Header Component
 * Modern navigation with responsive mobile menu
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import ThemeToggle from '@/components/ThemeToggle';

const Header = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    if (path === ROUTES.HOME) {
      return location.pathname === path || location.pathname === '/' || location.pathname === '/journalist-portfolio' || location.pathname === '/journalist-portfolio/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: ROUTES.HOME, label: 'Home' },
    { path: ROUTES.ABOUT, label: 'About' },
    { path: ROUTES.BLOG, label: 'Blog' },
    { path: ROUTES.NEWS, label: 'News & Updates' },
    { path: ROUTES.PORTFOLIO, label: 'Portfolio' },
    { path: ROUTES.CONTACT, label: 'Contact' },
  ];

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to={ROUTES.HOME} className="navbar-brand">
            <span className="brand-icon">📰</span>
            <span className="brand-text">Sugyan Sagar</span>
          </Link>
          
          <ul className={`navbar-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={isActive(item.path) ? 'active' : ''}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <ThemeToggle />
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
