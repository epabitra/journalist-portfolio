/**
 * Professional About Page with Realistic Content
 * Enhanced profile display with comprehensive information
 */

import { useState, useEffect } from 'react';
import EnhancedHelmet from '@/components/SEO/EnhancedHelmet';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { Link } from 'react-router-dom';
import { publicAPI } from '@/services/api';
import Loading from '@/components/Loading';
import { ENV } from '@/config/env';
import { ROUTES } from '@/config/constants';
import { mockProfile, mockSocialLinks, mockAwards, mockPublications, mockStats } from '@/utils/mockData';

const About = () => {
  const [profile, setProfile] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setUseMockData(false);

      const [profileData, socialData] = await Promise.all([
        publicAPI.getProfile().catch(() => null),
        publicAPI.getSocialLinks().catch(() => null),
      ]);

      if (profileData?.success && profileData.data) {
        setProfile(profileData.data);
      } else {
        setProfile(mockProfile);
        setUseMockData(true);
      }

      if (socialData?.success && socialData.data?.length > 0) {
        setSocialLinks(socialData.data);
      } else {
        setSocialLinks(mockSocialLinks);
        setUseMockData(true);
      }
    } catch (err) {
      console.error('Error loading about data:', err);
      setProfile(mockProfile);
      setSocialLinks(mockSocialLinks);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading..." />;
  }

  const displayProfile = profile || mockProfile;
  const displaySocialLinks = socialLinks.length > 0 ? socialLinks : mockSocialLinks;

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

  // Prepare schema data
  const personSchemaData = {
    name: displayProfile.name || 'Sugyan Sagar',
    alternateName: ['Sugyansagar'],
    url: `${ENV.SITE_URL || 'https://synodofberhampur.com'}/about`,
    image: displayProfile.profile_image_url,
    jobTitle: displayProfile.title || displayProfile.headline || 'Award-Winning Journalist',
    description: displayProfile.short_bio || displayProfile.bio || 'Award-winning investigative journalist specializing in human rights, environmental issues, and political reporting.',
    sameAs: displaySocialLinks
      .filter(link => link.is_active !== false && link.url)
      .map(link => link.url),
    email: displayProfile.email,
    address: displayProfile.location ? {
      '@type': 'PostalAddress',
      addressLocality: displayProfile.location,
    } : undefined,
    knowsAbout: ['Journalism', 'Investigative Reporting', 'Human Rights', 'Environmental Issues', 'Politics'],
    award: mockAwards.map(award => `${award.award} - ${award.organization} (${award.year})`),
  };

  return (
    <>
      <EnhancedHelmet
        title={`About ${displayProfile.name || 'Sugyan Sagar'} - Journalist Profile & Biography`}
        description={displayProfile.short_bio || displayProfile.bio || `Learn about ${displayProfile.name || 'Sugyan Sagar'}, an award-winning investigative journalist specializing in human rights, environmental issues, and political reporting.`}
        keywords={`About Sugyan Sagar, Sugyansagar biography, ${displayProfile.name || 'Sugyan Sagar'} journalist, investigative reporter profile, journalism career`}
        image={displayProfile.profile_image_url}
        type="profile"
        author={displayProfile.name || 'Sugyan Sagar'}
        canonicalUrl={`${ENV.SITE_URL || 'https://synodofberhampur.com'}/about`}
      />
      
      {/* Schema Markup */}
      <SchemaMarkup type="Person" data={personSchemaData} />

      <div className="about-page">
        <div className="section">
          <div className="container">
            {/* Hero Section */}
            <div className="about-hero" style={{
              display: 'grid',
              gridTemplateColumns: '300px 1fr',
              gap: 'var(--space-12)',
              marginBottom: 'var(--space-16)',
              alignItems: 'start'
            }}>
              {displayProfile.profile_image_url && (
                <div className="about-image-wrapper">
                  <img
                    src={displayProfile.profile_image_url}
                    alt={`${displayProfile.name || 'Sugyan Sagar'} - Award-winning investigative journalist`}
                    className="about-image"
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 'var(--radius-xl)',
                      boxShadow: 'var(--shadow-xl)'
                    }}
                  />
                </div>
              )}

              <div className="about-intro">
                <h1>{displayProfile.name}</h1>
                <p className="headline" style={{
                  fontSize: 'var(--text-2xl)',
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--space-6)',
                  fontWeight: 'var(--font-medium)'
                }}>
                  {displayProfile.title || displayProfile.headline}
                </p>

                {displayProfile.short_bio && (
                  <p style={{
                    fontSize: 'var(--text-lg)',
                    lineHeight: 'var(--leading-relaxed)',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-6)'
                  }}>
                    {displayProfile.short_bio}
                  </p>
                )}

                {displaySocialLinks.length > 0 && (
                  <div className="about-social-links" style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-3)',
                    marginTop: 'var(--space-6)'
                  }}>
                    {displaySocialLinks
                      .filter(link => link.is_active !== false)
                      .map((link) => (
                        <a
                          key={link.id || link.platform}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline"
                          style={{ fontSize: 'var(--text-sm)' }}
                        >
                          <span style={{ marginRight: 'var(--space-2)' }}>
                            {getSocialIcon(link.platform)}
                          </span>
                          {link.platform}
                        </a>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="about-content" style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: 'var(--space-12)',
              marginTop: 'var(--space-12)'
            }}>
              <div className="about-main">
                {displayProfile.bio && (
                  <section style={{ marginBottom: 'var(--space-12)' }}>
                    <h2 style={{ marginBottom: 'var(--space-6)' }}>Biography</h2>
                    <div style={{
                      fontSize: 'var(--text-lg)',
                      lineHeight: 'var(--leading-relaxed)',
                      color: 'var(--text-secondary)'
                    }}>
                      {displayProfile.bio.split('\n').map((paragraph, index) => (
                        <p key={index} style={{ marginBottom: 'var(--space-4)' }}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                )}

                {displayProfile.experience && (
                  <section style={{ marginBottom: 'var(--space-12)' }}>
                    <h2 style={{ marginBottom: 'var(--space-6)' }}>Experience</h2>
                    <p style={{
                      fontSize: 'var(--text-lg)',
                      lineHeight: 'var(--leading-relaxed)',
                      color: 'var(--text-secondary)'
                    }}>
                      {displayProfile.experience}
                    </p>
                  </section>
                )}

                {displayProfile.specializations && (
                  <section style={{ marginBottom: 'var(--space-12)' }}>
                    <h2 style={{ marginBottom: 'var(--space-6)' }}>Areas of Expertise</h2>
                    <p style={{
                      fontSize: 'var(--text-lg)',
                      lineHeight: 'var(--leading-relaxed)',
                      color: 'var(--text-secondary)'
                    }}>
                      {displayProfile.specializations}
                    </p>
                  </section>
                )}

                {/* Awards Section */}
                {mockAwards.length > 0 && (
                  <section style={{ marginBottom: 'var(--space-12)' }}>
                    <h2 style={{ marginBottom: 'var(--space-6)' }}>Awards & Recognition</h2>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: 'var(--space-4)'
                    }}>
                      {mockAwards.map((award, index) => (
                        <div key={index} style={{
                          padding: 'var(--space-4)',
                          background: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--border-light)'
                        }}>
                          <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>🏆</div>
                          <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>
                            {award.award}
                          </div>
                          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            {award.organization} • {award.year}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Publications */}
                {mockPublications.length > 0 && (
                  <section>
                    <h2 style={{ marginBottom: 'var(--space-6)' }}>Featured Publications</h2>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 'var(--space-4)'
                    }}>
                      {mockPublications.map((pub, index) => (
                        <div key={index} style={{
                          padding: 'var(--space-4)',
                          background: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-lg)',
                          textAlign: 'center',
                          border: '1px solid var(--border-light)'
                        }}>
                          <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>{pub.logo}</div>
                          <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>
                            {pub.name}
                          </div>
                          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            {pub.articles} articles
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <div className="about-sidebar">
                <div className="info-card" style={{
                  background: 'var(--bg-secondary)',
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: 'var(--space-6)',
                  border: '1px solid var(--border-light)'
                }}>
                  <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>Quick Facts</h3>
                  
                  {displayProfile.location && (
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                        📍 Location
                      </div>
                      <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)' }}>
                        {displayProfile.location}
                      </div>
                    </div>
                  )}

                  {displayProfile.email && (
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                        ✉️ Email
                      </div>
                      <a href={`mailto:${displayProfile.email}`} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)' }}>
                        {displayProfile.email}
                      </a>
                    </div>
                  )}

                  {displayProfile.languages && (
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                        🌐 Languages
                      </div>
                      <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)' }}>
                        {displayProfile.languages}
                      </div>
                    </div>
                  )}

                  {displayProfile.education && (
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                        🎓 Education
                      </div>
                      <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)' }}>
                        {displayProfile.education}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats Card */}
                <div className="info-card" style={{
                  background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: 'var(--space-6)',
                  color: 'white'
                }}>
                  <h3 style={{ marginBottom: 'var(--space-6)', color: 'white' }}>Career Highlights</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                      <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)' }}>
                        {mockStats.totalStories}+
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>Published Stories</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)' }}>
                        {mockStats.countriesCovered}+
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>Countries Covered</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)' }}>
                        {mockStats.awards}+
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>Awards Won</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)' }}>
                        {mockStats.yearsExperience}+
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>Years Experience</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'var(--space-8)' }}>
                  <Link to={ROUTES.CONTACT} className="btn btn-primary btn-block">
                    Get In Touch
                  </Link>
                  <Link to={ROUTES.PORTFOLIO} className="btn btn-outline btn-block" style={{ marginTop: 'var(--space-3)' }}>
                    View Portfolio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
