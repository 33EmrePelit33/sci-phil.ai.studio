/**
 * Science & Philosophy - Blogger Canonical & Redirect Manager
 * Handles SEO canonical url injection and seamless 301-style client redirection 
 * from Blogger posts to the main AI Studio / Grok platform.
 */

(function () {
  'use strict';

  // Target portal base domain
  const TARGET_DOMAIN = 'https://sci-phil.ai.studio'; // veya 'https://science-philosophy.grok.me'
  
  // Do not redirect if user explicitly adds ?noredirect=true or preview mode is active
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('noredirect') === 'true' || urlParams.get('m') === '1') {
    return;
  }

  /**
   * Extracts clean article slug from Blogger URL structure
   * Example: https://emrepelit7337.blogspot.com/2026/10/quantum-entropy-article.html
   * Returns: "quantum-entropy-article"
   */
  function extractSlugFromPath(pathname) {
    const match = pathname.match(/\/(\d{4})\/(\d{2})\/([^\/]+)\.html$/);
    if (match && match[3]) {
      return match[3];
    }
    return null;
  }

  /**
   * Injects dynamic canonical tag into document head
   */
  function setCanonicalTag(targetUrl) {
    let canonicalLink = document.querySelector("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.getElementsByTagName('head')[0].appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', targetUrl);
  }

  function initCanonicalRedirect() {
    const currentHost = window.location.hostname;
    const currentPath = window.location.pathname;

    // Only process when loaded on Blogger domain
    if (currentHost.includes('blogspot.com')) {
      const slug = extractSlugFromPath(currentPath);

      if (slug) {
        const destinationUrl = `${TARGET_DOMAIN}/article/${slug}`;
        
        // 1. Update canonical link for search engine crawlers
        setCanonicalTag(destinationUrl);

        // 2. Perform smooth JS redirect for standard users
        // Delay slightly if user agent is an automated crawler to allow canonical indexing
        const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
        if (!isBot) {
          window.location.replace(destinationUrl);
        }
      } else if (currentPath === '/' || currentPath === '') {
        // Redirect homepage traffic to main portal
        setCanonicalTag(TARGET_DOMAIN);
        window.location.replace(TARGET_DOMAIN);
      }
    }
  }

  // Execute on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCanonicalRedirect);
  } else {
    initCanonicalRedirect();
  }
})();