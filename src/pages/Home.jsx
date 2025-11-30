/**
 * Professional Home Page with Realistic Content
 * Hero section, featured posts, stats, and professional sections
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { publicAPI } from '@/services/api';
import { formatDate } from '@/utils/dateFormatter';
import { ROUTES } from '@/config/constants';
import Loading from '@/components/Loading';
import { ENV } from '@/config/env';
import { mockProfile, mockPosts, mockSocialLinks, mockStats, mockAwards, mockPublications } from '@/utils/mockData';

const Home = () => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
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

      const [profileData, postsData, socialData] = await Promise.all([
        publicAPI.getProfile().catch(() => null),
        publicAPI.listPosts({ limit: 6, featured: 'true', status: 'published' }).catch(() => null),
        publicAPI.getSocialLinks().catch(() => null),
      ]);

      // Use API data if available, otherwise use mock data
      if (profileData?.success && profileData.data) {
        setProfile(profileData.data);
      } else {
        setProfile(mockProfile);
        setUseMockData(true);
      }

      if (postsData?.success && postsData.data?.length > 0) {
        setPosts(postsData.data);
      } else {
        setPosts(mockPosts.slice(0, 6));
        setUseMockData(true);
      }

      if (socialData?.success && socialData.data?.length > 0) {
        setSocialLinks(socialData.data);
      } else {
        setSocialLinks(mockSocialLinks);
        setUseMockData(true);
      }
    } catch (err) {
      console.error('Error loading home data:', err);
      // Use mock data on error
      setProfile(mockProfile);
      setPosts(mockPosts.slice(0, 6));
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
  const displayPosts = posts.length > 0 ? posts : mockPosts.slice(0, 6);
  const displaySocialLinks = socialLinks.length > 0 ? socialLinks : mockSocialLinks;

  return (
    <>
      <Helmet>
        <title>{displayProfile.name} - {ENV.SITE_NAME}</title>
        <meta name="description" content={displayProfile.short_bio || displayProfile.bio || 'Professional journalist portfolio'} />
        {displayProfile.profile_image_url && <meta property="og:image" content={displayProfile.profile_image_url} />}
      </Helmet>

      <div className="home-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            {displayProfile.profile_image_url && (
              <div className="hero-image-wrapper">
                <img
                  src={displayProfile.profile_image_url}
                  alt={displayProfile.name || 'Profile'}
                  className="hero-image"
                />
              </div>
            )}
            <div className="hero-text">
              <h1>{displayProfile.name}</h1>
              <p className="headline">{displayProfile.title || displayProfile.headline}</p>
              <p className="bio">
                {displayProfile.short_bio || displayProfile.bio}
              </p>
              
              {displaySocialLinks.length > 0 && (
                <div className="hero-social-links">
                  {displaySocialLinks
                    .filter(link => link.is_active !== false)
                    .slice(0, 5)
                    .map((link) => (
                      <a
                        key={link.id || link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hero-social-link"
                        aria-label={link.platform}
                      >
                        {link.icon && <span style={{ marginRight: '4px' }}>{link.icon}</span>}
                        {link.platform}
                      </a>
                    ))}
                </div>
              )}

              <div className="hero-actions">
                <Link to={ROUTES.ABOUT} className="btn btn-primary btn-lg">
                  Learn More
                </Link>
                <Link 
                  to={ROUTES.BLOG} 
                  className="btn btn-outline btn-lg" 
                  style={{ 
                    color: 'white', 
                    borderColor: 'white',
                    background: 'transparent'
                  }}
                >
                  Read Stories
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-8)',
              textAlign: 'center'
            }}>
              <div className="stat-card">
                <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 'var(--font-bold)', color: 'var(--primary-600)', marginBottom: 'var(--space-2)' }}>
                  {mockStats.totalStories}+
                </div>
                <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>Published Stories</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 'var(--font-bold)', color: 'var(--primary-600)', marginBottom: 'var(--space-2)' }}>
                  {mockStats.countriesCovered}+
                </div>
                <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>Countries Covered</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 'var(--font-bold)', color: 'var(--primary-600)', marginBottom: 'var(--space-2)' }}>
                  {mockStats.awards}+
                </div>
                <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>Awards & Recognition</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 'var(--font-bold)', color: 'var(--primary-600)', marginBottom: 'var(--space-2)' }}>
                  {mockStats.yearsExperience}+
                </div>
                <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>Years Experience</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Posts Section */}
        {displayPosts.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-header text-center" style={{ marginBottom: 'var(--space-12)' }}>
                <h2>Latest Stories</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>
                  Explore my recent investigative work and feature stories
                </p>
              </div>

              <div className="posts-grid">
                {displayPosts.map((post) => (
                  <article key={post.id} className="post-card">
                    {post.cover_image_url && (
                      <div className="post-image">
                        <Link to={`${ROUTES.BLOG}/${post.slug}`}>
                          <img src={post.cover_image_url} alt={post.title} loading="lazy" />
                        </Link>
                      </div>
                    )}
                    <div className="post-content mt-4">
                      <div className="post-meta">
                        <time dateTime={post.published_at}>
                          {formatDate(post.published_at)}
                        </time>
                        {post.category && (
                          <span className="post-category">{post.category}</span>
                        )}
                      </div>
                      <h3>
                        <Link to={`${ROUTES.BLOG}/${post.slug}`}>{post.title}</Link>
                      </h3>
                      {post.subtitle && (
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)', fontStyle: 'italic' }}>
                          {post.subtitle}
                        </p>
                      )}
                      {post.excerpt && (
                        <p className="post-excerpt">{post.excerpt}</p>
                      )}
                      {post.read_time_minutes && (
                        <div className="post-meta mt-4" style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
                          <span className="read-time">{post.read_time_minutes} min read</span>
                          {post.view_count && (
                            <span style={{ marginLeft: 'var(--space-3)' }}>👁️ {post.view_count.toLocaleString()} views</span>
                          )}
                        </div>
                      )}
                      <Link to={`${ROUTES.BLOG}/${post.slug}`} className="read-more">
                        Read More →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="text-center" style={{ marginTop: 'var(--space-12)' }}>
                <Link to={ROUTES.BLOG} className="btn btn-primary btn-lg">
                  View All Posts
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Awards Section */}
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="section-header text-center" style={{ marginBottom: 'var(--space-12)' }}>
              <h2>Awards & Recognition</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-4)' }}>
                Recognized for excellence in investigative journalism
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)'
            }}>
              {mockAwards.slice(0, 4).map((award, index) => (
                <div key={index} className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                  <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>🏆</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
                    {award.award}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                    {award.organization}
                  </div>
                  <div style={{ color: 'var(--primary-600)', fontWeight: 'var(--font-semibold)' }}>
                    {award.year}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Publications Section */}
        <section className="section">
          <div className="container">
            <div className="section-header text-center" style={{ marginBottom: 'var(--space-12)' }}>
              <h2>Featured Publications</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-4)' }}>
                My work has been featured in leading publications worldwide
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-6)',
              alignItems: 'center'
            }}>
              {mockPublications.map((pub, index) => (
                <div key={index} className="card" style={{ 
                  textAlign: 'center', 
                  padding: 'var(--space-6)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-3)' }}>{pub.logo}</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                    {pub.name}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                    {pub.articles} articles
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="section" style={{ background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)', color: 'white' }}>
          <div className="container text-center">
            <h2 style={{ color: 'white', marginBottom: 'var(--space-4)' }}>Let's Work Together</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto var(--space-8)', fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.9)' }}>
              Have a story idea, want to collaborate, or need media consultation? Get in touch and let's discuss how we can work together.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to={ROUTES.CONTACT} className="btn btn-primary btn-lg" style={{ background: 'white', color: 'var(--primary-600)' }}>
                Get In Touch
              </Link>
              <Link 
                to={ROUTES.PORTFOLIO} 
                className="btn btn-outline btn-lg" 
                style={{ 
                  color: 'white', 
                  borderColor: 'white',
                  background: 'transparent'
                }}
              >
                View Portfolio
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
