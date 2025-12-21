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
  const siteUrl = ENV.SITE_URL || 'https://www.sugyansagar.com';
  // Ensure URL doesn't have double slashes
  const pathname = location.pathname === '/' ? '' : location.pathname;
  const currentUrl = canonicalUrl || `${siteUrl}${pathname}`;
  const fullTitle = title ? `${title} | ${ENV.SITE_NAME}` : `${ENV.SITE_NAME} - Sugyan Sagar`;
  
  // Default description with name
  const defaultDescription = description || `Sugyan Sagar - Award-winning investigative journalist specializing in human rights, environmental issues, and political reporting.`;
  
  // Default keywords including name variations
  const defaultKeywords = keywords || 'Sugyan Sagar, Sugyansagar, journalist, investigative reporter, journalism, news, articles, stories, human rights, environment, politics';
  
  // Default image - ensure absolute URL
  let ogImage = image || `${siteUrl}/og-image.jpg`;
  // If image is provided but not absolute, make it absolute
  if (image && image.trim()) {
    if (!image.startsWith('http://') && !image.startsWith('https://')) {
      ogImage = image.startsWith('/') ? `${siteUrl}${image}` : `${siteUrl}/${image}`;
    } else {
      ogImage = image;
    }
  }
  
  // Remove trailing slash if present in image URL (but preserve query params and fragments)
  ogImage = ogImage.replace(/([^\/])\/$/, '$1');
  
  // Ensure image URL uses https:// for better compatibility with social media crawlers
  if (ogImage && ogImage.startsWith('http://')) {
    ogImage = ogImage.replace('http://', 'https://');
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={defaultDescription} />
      <meta name="keywords" content={defaultKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={currentUrl} />
      <link rel="alternate" hreflang="en" href={currentUrl} />
      <link rel="alternate" hreflang="x-default" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title || fullTitle} />
      <meta property="og:description" content={defaultDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || fullTitle} />
      <meta property="og:site_name" content={ENV.SITE_NAME || 'Sugyan Sagar'} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@sugyansagar" />
      <meta name="twitter:creator" content="@sugyansagar" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title || fullTitle} />
      <meta name="twitter:description" content={defaultDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:src" content={ogImage} />
      <meta name="twitter:image:alt" content={title || fullTitle} />

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
      
      {/* Additional SEO Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Sugyan Sagar" />
    </Helmet>
  );
};

export default EnhancedHelmet;


