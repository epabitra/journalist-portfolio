/**
 * Professional Footer Component
 * Modern footer with branding, skills, links, and contact info
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '@/services/api';
import { ROUTES } from '@/config/constants';

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadFooterData();
    
    // Handle scroll to show/hide scroll-to-top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadFooterData = async () => {
    try {
      const [socialData, profileData, categoriesData] = await Promise.all([
        publicAPI.getSocialLinks().catch(() => null),
        publicAPI.getProfile().catch(() => null),
        publicAPI.getCategories().catch(() => null),
      ]);

      if (socialData?.success) {
        setSocialLinks(socialData.data || []);
      }
      if (profileData?.success) {
        setProfile(profileData.data);
      }
      if (categoriesData?.success) {
        setCategories(categoriesData.data || []);
      }
    } catch (error) {
      console.error('Error loading footer data:', error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSocialIcon = (platform) => {
    const icons = {
      Twitter: '🐦',
      LinkedIn: '💼',
      Facebook: '📘',
      Instagram: '📷',
      YouTube: '📺',
      Email: '✉️',
    };
    return icons[platform] || '🔗';
  };

  const getSocialIconClass = (platform) => {
    const platformLower = platform?.toLowerCase() || '';
    if (platformLower.includes('facebook')) return 'fab fa-facebook-f';
    if (platformLower.includes('twitter')) return 'fab fa-twitter';
    if (platformLower.includes('linkedin')) return 'fab fa-linkedin-in';
    if (platformLower.includes('instagram')) return 'fab fa-instagram';
    return 'fas fa-link';
  };

  const footerLinks = [
    { path: ROUTES.HOME, label: 'Home' },
    { path: ROUTES.PORTFOLIO, label: 'Projects' },
    { path: ROUTES.ABOUT, label: 'About Me' },
    { path: ROUTES.BLOG, label: 'Blog' },
    { path: ROUTES.CONTACT, label: 'Contact Me' },
  ];

  const displayName = profile?.name || 'Journalist';
  const displayBio = profile?.short_bio || profile?.bio || 'Professional journalism portfolio showcasing investigative reporting, feature stories, and multimedia content.';
  const displayEmail = profile?.email || '';
  const displayLocation = profile?.location || '';
  const displayPhone = profile?.phone || '';

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            {/* Column 1: Branding */}
            <div className="footer-section footer-brand">
              <h3 className="footer-brand-title">{displayName.toUpperCase()}</h3>
              <p className="footer-brand-description">{displayBio}</p>
              {socialLinks.length > 0 && (
                <div className="footer-social-icons">
                  {socialLinks
                    .filter(link => link.is_active !== false)
                    .slice(0, 4)
                    .map((link) => (
                      <a
                        key={link.id || link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-social-icon"
                        aria-label={link.platform}
                      >
                        <span className="social-icon-emoji">{getSocialIcon(link.platform)}</span>
                      </a>
                    ))}
                </div>
              )}
            </div>

            {/* Column 2: Categories/Skills */}
            <div className="footer-section">
              <h3 className="footer-section-title">My Expertise</h3>
              <ul className="footer-list">
                {categories.length > 0 ? (
                  categories
                    .filter(cat => cat.is_active !== false)
                    .slice(0, 5)
                    .map((category) => (
                      <li key={category.id || category.slug}>
                        <Link to={`${ROUTES.BLOG}?category=${encodeURIComponent(category.name || category.slug)}`}>
                          <span className="footer-list-arrow">→</span>
                          {category.name}
                        </Link>
                      </li>
                    ))
                ) : (
                  <>
                    <li><span className="footer-list-arrow">→</span>Investigation</li>
                    <li><span className="footer-list-arrow">→</span>Human Rights</li>
                    <li><span className="footer-list-arrow">→</span>Environment</li>
                    <li><span className="footer-list-arrow">→</span>Politics</li>
                    <li><span className="footer-list-arrow">→</span>Technology</li>
                  </>
                )}
              </ul>
            </div>

            {/* Column 3: Quick Links */}
            <div className="footer-section">
              <h3 className="footer-section-title">Quick Links</h3>
              <ul className="footer-list">
                {footerLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>
                      <span className="footer-list-arrow">→</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Address/Contact */}
            <div className="footer-section">
              <h3 className="footer-section-title">Address</h3>
              <div className="footer-contact">
                {displayLocation && (
                  <div className="footer-contact-item">
                    <span className="footer-contact-label">Location:</span>
                    <span className="footer-contact-value">{displayLocation}</span>
                  </div>
                )}
                {displayPhone && (
                  <div className="footer-contact-item">
                    <span className="footer-contact-icon">📞</span>
                    <span className="footer-contact-value">{displayPhone}</span>
                  </div>
                )}
                {displayEmail && (
                  <div className="footer-contact-item">
                    <span className="footer-contact-icon">✉️</span>
                    <a href={`mailto:${displayEmail}`} className="footer-contact-value footer-contact-link">
                      {displayEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>
              &copy; {currentYear} {displayName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button 
        className={`scroll-to-top ${showScrollTop ? 'show' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <span className="scroll-to-top-icon">↑</span>
      </button>
    </>
  );
};

export default Footer;
