/**
 * Enhanced Helmet Component
 * Provides comprehensive SEO meta tags
 */

import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { ENV } from '@/config/env';

const EnhancedHelmet = ({
  title,
  description,
  keywords,
  image,
  type = 'website',
  author = 'Sugyan Sagar',
  publishedTime,
  modifiedTime,
  canonicalUrl,
  noindex = false,
}) => {
  const location = useLocation();
  const siteUrl = ENV.SITE_URL || 'https://synodofberhampur.com';
  const currentUrl = canonicalUrl || `${siteUrl}${location.pathname}`;
  const fullTitle = title ? `${title} | ${ENV.SITE_NAME}` : `${ENV.SITE_NAME} - Sugyan Sagar`;
  
  // Default description with name
  const defaultDescription = description || `Sugyan Sagar - Award-winning investigative journalist specializing in human rights, environmental issues, and political reporting.`;
  
  // Default keywords including name variations
  const defaultKeywords = keywords || 'Sugyan Sagar, Sugyansagar, journalist, investigative reporter, journalism, news, articles, stories, human rights, environment, politics';
  
  // Default image - ensure absolute URL
  let ogImage = image || `${siteUrl}/og-image.jpg`;
  // If image is provided but not absolute, make it absolute
  if (image && !image.startsWith('http://') && !image.startsWith('https://')) {
    ogImage = image.startsWith('/') ? `${siteUrl}${image}` : `${siteUrl}/${image}`;
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={defaultDescription} />
      <meta name="keywords" content={defaultKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={defaultDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={ENV.SITE_NAME || 'Sugyan Sagar'} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={defaultDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content="@sugyansagar" />

      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
    </Helmet>
  );
};

export default EnhancedHelmet;


