/**
 * Schema Markup Component
 * Adds JSON-LD structured data for better SEO
 */

const SchemaMarkup = ({ type, data }) => {
  if (!data) return null;

  const getSchema = () => {
    switch (type) {
      case 'Person':
        return {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: data.name || 'Sugyan Sagar',
          alternateName: data.alternateName || ['Sugyansagar', 'S. Sagar'],
          url: data.url || 'https://synodofberhampur.com',
          image: data.image,
          jobTitle: data.jobTitle || 'Award-Winning Journalist',
          worksFor: data.worksFor || {
            '@type': 'Organization',
            name: 'Freelance Journalist',
          },
          sameAs: data.sameAs || [],
          description: data.description || 'Award-winning investigative journalist specializing in human rights, environmental issues, and political reporting.',
          knowsAbout: data.knowsAbout || ['Journalism', 'Investigative Reporting', 'Human Rights', 'Environmental Issues', 'Politics'],
          award: data.award || [],
          email: data.email,
          address: data.address,
        };

      case 'WebSite':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: data.name || 'Sugyan Sagar',
          alternateName: data.alternateName || 'Sugyansagar',
          url: data.url || 'https://synodofberhampur.com',
          description: data.description || 'Official website of award-winning journalist Sugyan Sagar',
          author: {
            '@type': 'Person',
            name: 'Sugyan Sagar',
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://synodofberhampur.com/blog?search={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        };

      case 'Article':
      case 'NewsArticle':
        return {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: data.headline,
          description: data.description,
          image: data.image,
          author: {
            '@type': 'Person',
            name: data.authorName || 'Sugyan Sagar',
            url: data.authorUrl || 'https://synodofberhampur.com/about',
          },
          publisher: {
            '@type': 'Person',
            name: 'Sugyan Sagar',
            logo: {
              '@type': 'ImageObject',
              url: data.publisherLogo || 'https://synodofberhampur.com/logo.jpg',
            },
          },
          datePublished: data.datePublished,
          dateModified: data.dateModified || data.datePublished,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': data.url,
          },
          articleSection: data.articleSection,
          keywords: data.keywords,
        };

      case 'BreadcrumbList':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        };

      default:
        return null;
    }
  };

  const schema = getSchema();
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default SchemaMarkup;

