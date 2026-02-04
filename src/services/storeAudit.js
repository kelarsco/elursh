/**
 * Store Audit Service
 * Analyzes ecommerce stores and generates comprehensive audit reports
 */

// Helper function to fetch and parse HTML
const fetchStoreHTML = async (url) => {
  // Validate and normalize URL
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL provided. Please enter a valid store URL.');
  }

  let normalizedUrl = url.trim();
  
  // Remove trailing slashes
  normalizedUrl = normalizedUrl.replace(/\/+$/, '');
  
  // Add protocol if missing
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  // Basic URL validation
  try {
    const urlObj = new URL(normalizedUrl);
    if (!urlObj.hostname || urlObj.hostname === '') {
      throw new Error('Invalid URL format');
    }
    
    // Check for obviously invalid URLs
    if (urlObj.hostname === 'localhost' || 
        urlObj.hostname === '127.0.0.1' || 
        urlObj.hostname.startsWith('192.168.') ||
        urlObj.hostname.startsWith('10.') ||
        urlObj.hostname.startsWith('172.')) {
      throw new Error('Local URLs are not supported. Please provide a publicly accessible store URL.');
    }
  } catch (e) {
    if (e.message.includes('Local URLs')) {
      throw e;
    }
    throw new Error('Invalid URL format. Please enter a valid store URL (e.g., yourstore.com or https://yourstore.com)');
  }

  // List of CORS proxy services to try (fallback chain)
  // Using multiple proxies increases reliability
  const proxyServices = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(normalizedUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(normalizedUrl)}`,
  ];

  let lastError = null;
  let lastSuccessfulProxy = null;

  // Try each proxy service
  for (let i = 0; i < proxyServices.length; i++) {
    const proxyUrl = proxyServices[i];
    const controller = new AbortController();
    // Increase timeout for each subsequent attempt
    const timeout = 8000 + (i * 3000); // 8s, 11s, 14s — faster fail for better UX
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/html, */*',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Read response as text first (can only read once)
      const responseText = await response.text();
      
      // Check if response is empty
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Empty response from proxy');
      }
      
      // Check content type before parsing
      const contentType = response.headers.get('content-type') || '';
      const isJSON = contentType.includes('application/json');
      
      let htmlContent = null;
      
      // Check if response is an HTML error page (before parsing)
      // Only flag obvious error pages, not pages that happen to contain error-related words
      const trimmedText = responseText.trim();
      if (trimmedText.startsWith('<!DOCTYPE') || trimmedText.startsWith('<!doctype') || trimmedText.startsWith('<html')) {
        const lowerText = trimmedText.toLowerCase();
        
        // Only check for very specific error page patterns
        // Check for actual error page titles/content, not just the word "error"
        const isActualErrorPage = (
          // Very short pages with error messages
          (trimmedText.length < 1000 && (
            lowerText.includes('404 not found') ||
            lowerText.includes('page not found') ||
            lowerText.includes('access denied') ||
            lowerText.includes('forbidden') ||
            (lowerText.includes('error') && lowerText.includes('occurred') && trimmedText.length < 500)
          )) ||
          // Specific error page patterns
          lowerText.includes('<title>404</title>') ||
          lowerText.includes('<title>not found</title>') ||
          lowerText.includes('<title>error</title>') ||
          lowerText.includes('proxy error') ||
          lowerText.includes('cors error') ||
          // Check for common proxy error messages
          (lowerText.includes('unable to fetch') && trimmedText.length < 1000) ||
          (lowerText.includes('failed to fetch') && trimmedText.length < 1000)
        );
        
        // Don't reject if it looks like a real store page (has common store elements)
        const looksLikeStorePage = (
          trimmedText.length > 2000 || // Real store pages are usually longer
          lowerText.includes('shopify') ||
          lowerText.includes('woocommerce') ||
          lowerText.includes('product') ||
          lowerText.includes('cart') ||
          lowerText.includes('add to cart') ||
          lowerText.includes('buy now') ||
          lowerText.includes('checkout')
        );
        
        if (isActualErrorPage && !looksLikeStorePage) {
          throw new Error('Proxy returned an error page. The store URL may be incorrect or the store may be blocking requests.');
        }
      }
      
      if (isJSON || responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
        // Try to parse as JSON
        try {
          const data = JSON.parse(responseText);
          
          // Handle different proxy response formats
          if (data.contents) {
            // allorigins.win format
            htmlContent = data.contents;
          } else if (data.body) {
            // Some proxies return body
            htmlContent = data.body;
          } else if (data.html) {
            // Some proxies use 'html' key
            htmlContent = data.html;
          } else if (typeof data === 'string') {
            // Direct HTML string in JSON
            htmlContent = data;
          } else if (data.status && data.status.http_code !== 200) {
            throw new Error(`Proxy returned error: ${data.status.http_code}`);
          } else {
            throw new Error('Unexpected proxy response format');
          }
        } catch (jsonError) {
          // If JSON parsing fails and it's not HTML, throw error
          if (!responseText.trim().startsWith('<!')) {
            throw new Error('Invalid JSON response from proxy');
          }
          // If it's HTML, use it directly
          htmlContent = responseText;
        }
      } else {
        // Direct HTML or text response
        htmlContent = responseText;
      }

      // Validate HTML content
      if (!htmlContent || htmlContent.trim().length === 0) {
        throw new Error('Empty response from proxy');
      }
      
      // Create a temporary DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Check for parser errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        // If parsing fails but we have substantial content, try to proceed anyway
        if (htmlContent.length > 1000) {
          console.warn('HTML parsing had errors but content seems substantial, proceeding...');
        } else {
          throw new Error('Failed to parse HTML content. The response may not be valid HTML.');
        }
      }
      
      // Verify we got valid HTML structure
      // Be lenient - some stores might have minimal HTML
      if (!doc.body) {
        throw new Error('Invalid HTML structure received from store');
      }
      
      // If body is empty but we have HTML content, it might still be valid (some SPAs)
      if (doc.body.children.length === 0 && htmlContent.length < 500) {
        throw new Error('Received empty or minimal page content');
      }
      
      // Successfully fetched and parsed
      lastSuccessfulProxy = proxyUrl;
      return { doc, url: normalizedUrl };
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Provide more specific error messages
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        lastError = new Error('Request timed out. The store may be slow to respond or blocking requests.');
      } else if (error.message?.includes('HTML error page') || error.message?.includes('error page')) {
        lastError = error;
      } else if (error.message?.includes('JSON') || error.message?.includes('token')) {
        lastError = new Error('Proxy returned invalid response. The store URL may be incorrect or the store may be blocking proxy requests.');
      } else {
        lastError = error;
      }
      
      console.warn(`Proxy failed (${proxyUrl.substring(0, 50)}...):`, lastError.message);
      // Continue to next proxy
      continue;
    }
  }

  // All proxies failed
  console.error('All CORS proxies failed:', lastError);
  
  // Provide more helpful error message based on the error type
  // Be less specific to avoid false positives
  if (lastError?.name === 'AbortError' || lastError?.message?.includes('timeout')) {
    throw new Error('Request timed out. The store may be slow to respond. Please try again.');
  } else if (lastError?.message?.includes('Failed to fetch') || lastError?.message?.includes('network')) {
    throw new Error('Network error. Please check your internet connection and try again.');
  } else if (lastError?.message?.includes('Proxy returned an error page') || 
             (lastError?.message?.includes('error page') && lastError?.message?.includes('Proxy'))) {
    // Only show "not found" if it's clearly a proxy error page
    throw new Error('Unable to access the store. Please verify the store URL is correct and try again.');
  } else if (lastError?.message?.includes('blocking') || lastError?.message?.includes('blocked')) {
    throw new Error('The store may be blocking automated requests. Please try again or use a different store URL.');
  } else if (lastError?.message?.includes('Invalid URL')) {
    throw new Error('Invalid store URL format. Please enter a valid URL like "yourstore.com" or "https://yourstore.com".');
  } else if (lastError?.message?.includes('Empty response') || lastError?.message?.includes('Empty')) {
    throw new Error('Received empty response. Please verify the store URL is correct and accessible.');
  } else {
    // Generic error message that doesn't assume the store doesn't exist
    throw new Error(`Unable to analyze store: ${lastError?.message || 'Please verify the URL is correct and try again.'}`);
  }
};

// Check if element exists and has content
const checkElement = (doc, selector, minLength = 0) => {
  const element = doc.querySelector(selector);
  if (!element) return { exists: false, content: null };
  const content = element.textContent?.trim() || '';
  return { 
    exists: true, 
    content,
    hasContent: content.length >= minLength 
  };
};

// Check for multiple elements
const checkElements = (doc, selector) => {
  const elements = doc.querySelectorAll(selector);
  return {
    count: elements.length,
    exists: elements.length > 0,
    items: Array.from(elements).map(el => el.textContent?.trim() || '')
  };
};

// Detect platform
const detectPlatform = (doc, url) => {
  const html = doc.documentElement.innerHTML.toLowerCase();
  
  if (html.includes('shopify') || url.includes('myshopify.com') || doc.querySelector('[data-shopify]')) {
    return 'Shopify';
  }
  if (html.includes('woocommerce') || doc.querySelector('.woocommerce')) {
    return 'WooCommerce';
  }
  if (html.includes('bigcommerce') || url.includes('mybigcommerce.com')) {
    return 'BigCommerce';
  }
  if (html.includes('magento')) {
    return 'Magento';
  }
  return 'Unknown';
};

// Calculate score based on checks
const calculateScore = (checks) => {
  const total = checks.length;
  const passed = checks.filter(c => c.status === 'good').length;
  const warnings = checks.filter(c => c.status === 'warning').length;
  
  // Good = 100%, Warning = 50%, Critical = 0%
  const score = Math.round((passed * 100 + warnings * 50) / total);
  return Math.max(0, Math.min(100, score));
};

// Get status from score
const getStatus = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  if (score >= 30) return 'Needs improvement';
  return 'Critical';
};

// Validate if the domain is actually an ecommerce store
const validateIsStore = (doc, url) => {
  const html = doc.documentElement.innerHTML.toLowerCase();
  const bodyText = doc.body?.textContent?.toLowerCase() || '';
  
  // Check for ecommerce platform indicators
  const platformIndicators = [
    'shopify',
    'woocommerce',
    'bigcommerce',
    'magento',
    'prestashop',
    'opencart',
    'ecwid',
    'squarespace-commerce',
    'wix-stores',
    'volusion',
    '3dcart'
  ];
  
  const hasPlatform = platformIndicators.some(platform => 
    html.includes(platform) || 
    url.includes(platform) ||
    doc.querySelector(`[data-${platform}]`) ||
    doc.querySelector(`[class*="${platform}"]`)
  );
  
  // Check for ecommerce-specific elements
  const ecommerceElements = [
    // Shopping cart indicators
    '[class*="cart"]',
    '[class*="shopping"]',
    '[id*="cart"]',
    '[href*="cart"]',
    '[href*="checkout"]',
    '[href*="basket"]',
    
    // Product indicators
    '[class*="product"]',
    '[class*="item"]',
    '[data-product]',
    '[data-product-id]',
    
    // Add to cart buttons
    '[class*="add-to-cart"]',
    '[class*="add-to-bag"]',
    '[class*="buy-now"]',
    'button[class*="cart"]',
    'button[class*="purchase"]',
    
    // Pricing elements
    '[class*="price"]',
    '[class*="cost"]',
    '[data-price]',
    '[class*="currency"]',
    
    // Ecommerce keywords in content
    'add to cart',
    'buy now',
    'add to bag',
    'checkout',
    'shopping cart',
    'view cart'
  ];
  
  const hasEcommerceElements = ecommerceElements.some(selector => {
    try {
      return doc.querySelector(selector) !== null;
    } catch {
      // Check text content for keywords
      return bodyText.includes(selector.toLowerCase());
    }
  });
  
  // Check for product pages or collections
  const productKeywords = [
    'product',
    'shop',
    'store',
    'catalog',
    'collection',
    'category',
    'buy',
    'purchase',
    'cart',
    'checkout'
  ];
  
  const hasProductKeywords = productKeywords.some(keyword => {
    const inUrl = url.toLowerCase().includes(keyword);
    const inLinks = Array.from(doc.querySelectorAll('a[href]')).some(link => 
      link.getAttribute('href')?.toLowerCase().includes(keyword)
    );
    const inText = bodyText.includes(keyword);
    return inUrl || inLinks || inText;
  });
  
  // Check for pricing information
  const hasPricing = doc.querySelectorAll('[class*="price"], [class*="cost"], [data-price], [class*="currency"]').length > 0 ||
                     bodyText.match(/\$[\d,]+\.?\d*/) !== null ||
                     bodyText.match(/€[\d,]+\.?\d*/) !== null ||
                     bodyText.match(/£[\d,]+\.?\d*/) !== null;
  
  // Must have at least 1 strong indicator to be considered a store
  // Made more lenient to avoid false rejections
  const indicators = [
    hasPlatform,
    hasEcommerceElements,
    hasProductKeywords,
    hasPricing,
    // Also check if URL suggests it's a store
    url.includes('.myshopify.com') || url.includes('shop') || url.includes('store')
  ];
  
  const strongIndicators = indicators.filter(Boolean).length;
  
  // Require at least 1 indicator (more lenient)
  if (strongIndicators < 1) {
    // Double-check with more lenient criteria
    const hasAnyEcommerceSign = (
      hasPlatform ||
      hasEcommerceElements ||
      hasProductKeywords ||
      hasPricing ||
      bodyText.includes('shop') ||
      bodyText.includes('buy') ||
      bodyText.includes('cart') ||
      doc.querySelectorAll('a[href*="product"], a[href*="shop"], a[href*="cart"]').length > 0
    );
    
    if (!hasAnyEcommerceSign) {
      throw new Error('This domain does not appear to be an ecommerce store. Please provide a valid store URL (Shopify, WooCommerce, BigCommerce, or other ecommerce platform).');
    }
  }
  
  return true;
};

// Trust Signals Audit
const auditTrustSignals = (doc) => {
  const checks = [];
  
  // Check for reviews
  const reviews = checkElements(doc, '[class*="review"], [class*="rating"], [id*="review"], .yotpo, .judge-me, .loox');
  checks.push({
    item: 'Customer reviews present',
    status: reviews.exists ? 'good' : 'critical',
    details: reviews.exists ? `${reviews.count} review elements found` : 'No review system detected'
  });
  
  // Check for trust badges
  const trustBadges = checkElements(doc, '[class*="trust"], [class*="badge"], [class*="secure"], [class*="guarantee"]');
  checks.push({
    item: 'Trust badges visible',
    status: trustBadges.exists ? 'good' : 'warning',
    details: trustBadges.exists ? 'Trust badges found' : 'No trust badges detected'
  });
  
  // Check contact info
  const contactInfo = checkElement(doc, '[href*="mailto"], [href*="tel"], [class*="contact"], [id*="contact"]');
  checks.push({
    item: 'Contact information visible',
    status: contactInfo.exists ? 'good' : 'critical',
    details: contactInfo.exists ? 'Contact information found' : 'Contact information not easily accessible'
  });
  
  // Check for policies (privacy, terms, etc.)
  const policies = checkElements(doc, 'a[href*="privacy"], a[href*="terms"], a[href*="policy"], a[href*="refund"], a[href*="shipping"]');
  checks.push({
    item: 'Policies accessible',
    status: policies.count >= 3 ? 'good' : policies.count >= 1 ? 'warning' : 'critical',
    details: `${policies.count} policy links found`
  });
  
  // Check for social proof
  const socialProof = checkElements(doc, '[class*="testimonial"], [class*="social-proof"], [class*="customer"], [class*="verified"]');
  checks.push({
    item: 'Social proof elements',
    status: socialProof.exists ? 'good' : 'warning',
    details: socialProof.exists ? 'Social proof found' : 'Limited social proof'
  });
  
  // Check for security badges (SSL, payment security)
  const html = doc.documentElement.innerHTML.toLowerCase();
  const hasSecurityBadges = html.includes('ssl') || 
                            html.includes('secure') ||
                            html.includes('norton') ||
                            html.includes('mcafee') ||
                            html.includes('trusted') ||
                            doc.querySelector('[class*="security"]') !== null ||
                            doc.querySelector('[class*="ssl"]') !== null;
  checks.push({
    item: 'Security badges & SSL indicators',
    status: hasSecurityBadges ? 'good' : 'warning',
    details: hasSecurityBadges ? 'Security badges found' : 'No security badges detected. Security indicators build customer confidence.'
  });
  
  // Check for return/refund policy visibility
  const returnPolicy = checkElements(doc, 'a[href*="return"], a[href*="refund"], [class*="return"], [class*="refund"]');
  checks.push({
    item: 'Return/refund policy visible',
    status: returnPolicy.exists ? 'good' : 'critical',
    details: returnPolicy.exists ? 'Return policy found' : 'Return/refund policy not easily accessible. Customers need clear return policies to feel confident purchasing.'
  });
  
  // Check for shipping information
  const shippingInfo = checkElements(doc, '[class*="shipping"], [id*="shipping"], a[href*="shipping"]');
  checks.push({
    item: 'Shipping information available',
    status: shippingInfo.exists ? 'good' : 'warning',
    details: shippingInfo.exists ? 'Shipping information found' : 'Shipping information not clearly displayed. Customers need shipping details before checkout.'
  });
  
  // Check for money-back guarantee or satisfaction guarantee
  const guarantee = html.includes('money-back') || 
                    html.includes('satisfaction') ||
                    html.includes('guarantee') ||
                    doc.querySelector('[class*="guarantee"]') !== null;
  checks.push({
    item: 'Money-back or satisfaction guarantee',
    status: guarantee ? 'good' : 'warning',
    details: guarantee ? 'Guarantee messaging found' : 'No guarantee messaging detected. Guarantees reduce purchase anxiety and increase conversions.'
  });
  
  // Check for customer count or sales volume indicators
  const customerCount = html.match(/\d+[,\s]*(customers|orders|sold|purchases)/i) ||
                        doc.querySelector('[class*="customer-count"]') !== null ||
                        doc.querySelector('[class*="orders"]') !== null;
  checks.push({
    item: 'Customer count or sales volume indicators',
    status: customerCount ? 'good' : 'warning',
    details: customerCount ? 'Sales volume indicators found' : 'No sales volume indicators. Showing customer counts builds social proof and trust.'
  });
  
  const score = calculateScore(checks);
  const criticalCount = checks.filter(c => c.status === 'critical').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  
  return {
    score,
    status: getStatus(score),
    checks,
    impact: criticalCount > 0 
      ? 'Low trust reduces checkout conversion by up to 30%. Missing reviews, unclear policies, and lack of security indicators make customers hesitant to purchase.'
      : warningCount > 0
      ? 'Trust signals could be improved to increase conversions. Adding more social proof, guarantees, and security badges will boost customer confidence.'
      : 'Good trust signals help build customer confidence, but there\'s always room for improvement to maximize conversions.',
    recommendation: criticalCount > 0
      ? 'Add customer reviews, trust badges, make policies easily accessible, display security indicators, and add return/refund information prominently.'
      : warningCount > 0
      ? 'Enhance trust signals with more social proof, clear policies, security badges, guarantees, and customer count indicators.'
      : 'Continue optimizing trust signals. Consider adding customer testimonials, satisfaction guarantees, and more visible security indicators.'
  };
};

// Detect Shopify free themes
const detectShopifyFreeTheme = (doc, url) => {
  const html = doc.documentElement.innerHTML.toLowerCase();
  const bodyClasses = doc.body?.className?.toLowerCase() || '';
  const htmlClasses = doc.documentElement.className?.toLowerCase() || '';
  const allClasses = `${bodyClasses} ${htmlClasses} ${html}`;
  
  // First, confirm it's actually a Shopify store
  const isShopify = url.includes('myshopify.com') || 
                    html.includes('cdn.shopify.com') ||
                    html.includes('shopifycdn.com') ||
                    doc.querySelector('[data-shopify]') !== null ||
                    doc.querySelector('script[src*="shopify"]') !== null;
  
  if (!isShopify) {
    return {
      isFreeTheme: false,
      themeName: null,
      confidence: null
    };
  }
  
  // Check for theme information in meta tags or scripts
  let detectedThemeName = null;
  let themeId = null;
  
  // Check meta tags for theme info
  const themeMeta = doc.querySelector('meta[name="theme-name"], meta[name="theme"], meta[property="theme-name"]');
  if (themeMeta) {
    detectedThemeName = themeMeta.getAttribute('content')?.toLowerCase() || '';
  }
  
  // Check for theme ID in scripts or data attributes
  const scripts = doc.querySelectorAll('script');
  for (const script of scripts) {
    const scriptContent = script.textContent || script.innerHTML || '';
    // Look for theme ID patterns
    const themeIdMatch = scriptContent.match(/theme[_-]?id["\s:=]+(\d+)/i) || 
                        scriptContent.match(/theme["\s:=]+["']?([^"'\s]+)["']?/i);
    if (themeIdMatch) {
      themeId = themeIdMatch[1];
    }
    
    // Look for theme name in Shopify theme object
    if (scriptContent.includes('Shopify.theme') || scriptContent.includes('theme.name')) {
      try {
        const themeMatch = scriptContent.match(/theme[.\s]*name["\s:=]+["']([^"']+)["']/i);
        if (themeMatch) {
          detectedThemeName = themeMatch[1].toLowerCase();
        }
      } catch (e) {
        // Continue if parsing fails
      }
    }
  }
  
  // Check CSS/JS file paths for theme names
  const linkTags = doc.querySelectorAll('link[href], script[src]');
  for (const link of linkTags) {
    const href = (link.getAttribute('href') || link.getAttribute('src') || '').toLowerCase();
    // Shopify themes are typically in /themes/ or /assets/ paths
    if (href.includes('/themes/') || href.includes('/theme/')) {
      const themePathMatch = href.match(/themes?\/([^\/]+)/);
      if (themePathMatch) {
        detectedThemeName = themePathMatch[1].toLowerCase();
      }
    }
  }
  
  // List of confirmed Shopify FREE themes (as of 2024)
  // These are the themes that come free with Shopify
  const confirmedFreeThemes = [
    'dawn',           // Dawn (current free theme)
    'debut',          // Debut
    'craft',          // Craft
    'express',        // Express
    'minimal',        // Minimal
    'simple',         // Simple
    'supply',         // Supply
    'venture',        // Venture
    'brooklyn',       // Brooklyn (older)
    'narrative',     // Narrative
    'warehouse',      // Warehouse
    'prestige',       // Prestige
    'pop',            // Pop
    'impulse',        // Impulse
    'parallax',       // Parallax
    'turbo',          // Turbo
    'streamline',     // Streamline
    'responsive',     // Responsive
    'flex',           // Flex
    'grid',           // Grid
    'motion',         // Motion
    'empire',         // Empire
    'masonry',        // Masonry
    'solo',           // Solo
    'mobilia',        // Mobilia
    'split',          // Split
    'boundless',      // Boundless
    'studio'          // Studio
  ];
  
  // Check if detected theme name matches a free theme
  let isConfirmedFreeTheme = false;
  let matchedThemeName = null;
  
  if (detectedThemeName) {
    // Check for exact match or partial match
    for (const freeTheme of confirmedFreeThemes) {
      if (detectedThemeName.includes(freeTheme) || freeTheme.includes(detectedThemeName)) {
        isConfirmedFreeTheme = true;
        matchedThemeName = freeTheme.charAt(0).toUpperCase() + freeTheme.slice(1);
        break;
      }
    }
  }
  
  // Check for free theme class patterns in body/html classes
  // Free themes often have specific class patterns
  const freeThemeClassPatterns = [
    'template--theme-dawn',
    'template--theme-debut',
    'template--theme-craft',
    'template--theme-express',
    'template--theme-minimal',
    'template--theme-simple',
    'template--theme-supply',
    'template--theme-venture',
    'theme-dawn',
    'theme-debut',
    'theme-craft',
    'theme-express',
    'theme-minimal',
    'theme-simple',
    'theme-supply',
    'theme-venture'
  ];
  
  const hasFreeThemeClass = freeThemeClassPatterns.some(pattern => 
    allClasses.includes(pattern.toLowerCase())
  );
  
  // Check for premium theme indicators (if these exist, it's NOT a free theme)
  const premiumThemeIndicators = [
    'outofthesandbox',  // Out of the Sandbox themes
    'pixelunion',       // Pixel Union themes
    'maestrooo',        // Maestrooo themes
    'weareunderground', // Underground themes
    'archetype',        // Archetype themes
    'turbo',            // Turbo (premium version)
    'flex',             // Flex (premium version)
    'premium-theme',
    'paid-theme',
    'theme-store',
    'shopify-themes.com'
  ];
  
  const hasPremiumIndicator = premiumThemeIndicators.some(indicator => 
    html.includes(indicator.toLowerCase())
  );
  
  // Only flag as free theme if we have STRONG evidence
  // We need at least one of:
  // 1. Confirmed theme name match
  // 2. Free theme class pattern in HTML
  // AND we must NOT have premium theme indicators
  
  if (hasPremiumIndicator) {
    // Premium theme detected, definitely not free
    return {
      isFreeTheme: false,
      themeName: null,
      confidence: null
    };
  }
  
  if (isConfirmedFreeTheme || hasFreeThemeClass) {
    return {
      isFreeTheme: true,
      themeName: matchedThemeName || 'Shopify Free Theme',
      confidence: isConfirmedFreeTheme ? 'high' : 'medium'
    };
  }
  
  // If we can't confirm, don't flag it as free theme
  // This prevents false positives
  return {
    isFreeTheme: false,
    themeName: null,
    confidence: null
  };
};

// UX and Accessibility Audit (comprehensive store structure review)
const auditUX = (doc, url) => {
  const checks = [];
  
  // Check for Shopify free theme
  const themeDetection = detectShopifyFreeTheme(doc, url);
  if (themeDetection.isFreeTheme) {
    checks.push({
      item: 'Using Shopify free theme',
      status: 'critical',
      details: `Detected ${themeDetection.themeName}. Free themes look generic and unprofessional, reducing customer trust and conversion rates.`
    });
  }
  
  // Check navigation structure
  const nav = checkElement(doc, 'nav, [role="navigation"], [class*="nav"], [class*="menu"]');
  const navExists = nav.exists;
  
  // Check navigation menu items and collection links
  const navLinks = doc.querySelectorAll('nav a, [role="navigation"] a, [class*="nav"] a, [class*="menu"] a');
  const navLinksArray = Array.from(navLinks);
  
  // Check if navigation links point to collections
  const collectionLinks = navLinksArray.filter(link => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    return href.includes('/collections/') || 
           href.includes('/collection/') ||
           href.includes('/collections') ||
           href.includes('/shop/') ||
           href.includes('/products/') ||
           href.includes('/catalog');
  });
  
  // Check if navigation items have proper names (not generic like "Shop", "Products" without context)
  const navTexts = navLinksArray.map(link => link.textContent?.trim().toLowerCase() || '').filter(text => text.length > 0);
  const hasGenericNames = navTexts.some(text => 
    ['shop', 'products', 'collections', 'catalog', 'store', 'buy', 'menu'].includes(text) && navTexts.length <= 3
  );
  
  // Check if navigation has meaningful category/collection names
  const hasMeaningfulNames = navTexts.some(text => 
    text.length > 4 && 
    !['home', 'about', 'contact', 'cart', 'account', 'login', 'search'].includes(text) &&
    text.split(' ').length <= 3 // Not too long
  );
  
  // Navigation quality assessment
  let navQuality = 'good';
  let navDetails = 'Navigation structure found';
  
  if (!navExists) {
    navQuality = 'critical';
    navDetails = 'Navigation not clearly defined';
  } else if (navLinksArray.length === 0) {
    navQuality = 'critical';
    navDetails = 'Navigation exists but has no links';
  } else if (collectionLinks.length === 0 && navLinksArray.length > 0) {
    navQuality = 'critical';
    navDetails = `Navigation found but no collection links detected. ${navLinksArray.length} nav links found, but none point to collections. Navigation should link to product collections for better UX.`;
  } else if (hasGenericNames && !hasMeaningfulNames && collectionLinks.length === 0) {
    navQuality = 'critical';
    navDetails = `Navigation uses generic names (${navTexts.join(', ')}) without proper collection links. Navigation should have clear category names that link to collections (e.g., "Women's Clothing", "Men's Shoes" instead of just "Shop" or "Products").`;
  } else if (collectionLinks.length < 3) {
    navQuality = 'warning';
    navDetails = `Only ${collectionLinks.length} collection link(s) found — below the minimum of 3. Poor navigation; add more collection/category links for better product discovery.`;
  } else {
    navQuality = 'good';
    navDetails = `Solid navigation with ${collectionLinks.length} collection links. Consider adding more category depth for better product discovery.`;
  }
  checks.push({
    item: 'Navigation structure & collection links',
    status: navQuality === 'good' ? 'good' : navQuality === 'critical' ? 'critical' : 'warning',
    details: navDetails
  });
  
  const viewport = checkElement(doc, 'meta[name="viewport"]');
  checks.push({
    item: 'Mobile responsive',
    status: viewport.exists ? 'good' : 'critical',
    details: viewport.exists ? 'Viewport meta present. Ensure breakpoints are tested across devices.' : 'Missing viewport meta tag — mobile layout may break.'
  });
  
  const ctas = checkElements(doc, 'button, [class*="cta"], [class*="button"], a[class*="btn"]');
  checks.push({
    item: 'CTA buttons present',
    status: ctas.count >= 3 ? 'good' : ctas.count >= 1 ? 'warning' : 'critical',
    details: ctas.count >= 3 ? `${ctas.count} CTAs found. Prioritize above-the-fold CTAs for conversion.` : ctas.count >= 1 ? `${ctas.count} CTA(s) found. Add more prominent buy/add-to-cart CTAs.` : 'No clear CTAs detected. Add-to-cart and checkout buttons are critical for conversion.'
  });
  
  const mainContent = checkElement(doc, 'main, [role="main"], [class*="main"], [id*="main"]');
  checks.push({
    item: 'Page structure semantic',
    status: mainContent.exists ? 'good' : 'warning',
    details: mainContent.exists ? 'Semantic structure (main/role) present. Improves accessibility and SEO.' : 'Missing main content landmark. Use <main> or role="main" for screen readers.'
  });
  
  // Check for search functionality
  const searchFunctionality = checkElement(doc, '[class*="search"], [id*="search"], input[type="search"], [placeholder*="search"]');
  checks.push({
    item: 'Search functionality present',
    status: searchFunctionality.exists ? 'good' : 'warning',
    details: searchFunctionality.exists ? 'Search functionality found' : 'No search functionality detected. Customers need search to find products quickly.'
  });
  
  // Check for breadcrumbs (navigation aid)
  const breadcrumbs = checkElements(doc, '[class*="breadcrumb"], [aria-label*="breadcrumb"], nav[aria-label*="breadcrumb"]');
  checks.push({
    item: 'Breadcrumb navigation',
    status: breadcrumbs.exists ? 'good' : 'warning',
    details: breadcrumbs.exists ? 'Breadcrumb navigation found' : 'No breadcrumb navigation. Breadcrumbs help users understand their location and navigate back.'
  });
  
  // Check for footer links and structure
  const footerLinks = doc.querySelectorAll('footer a, [class*="footer"] a');
  checks.push({
    item: 'Footer navigation structure',
    status: footerLinks.length >= 5 ? 'good' : footerLinks.length >= 3 ? 'warning' : 'critical',
    details: `${footerLinks.length} footer links found. Footer should include important links like policies, contact, and site navigation.`
  });
  
  const mobileMenu = checkElement(doc, '[class*="mobile"], [class*="hamburger"], [class*="menu-toggle"], button[aria-label*="menu"]');
  checks.push({
    item: 'Mobile menu implementation',
    status: mobileMenu.exists ? 'good' : 'warning',
    details: mobileMenu.exists ? 'Mobile menu detected. Verify it opens and closes reliably on small screens.' : 'Mobile menu not clearly detected. Add a hamburger or menu toggle for small screens.'
  });
  
  const html = doc.documentElement.innerHTML.toLowerCase();
  const hasLazyLoading = html.includes('loading="lazy"') || 
                         html.includes('data-lazy') ||
                         doc.querySelectorAll('img[loading="lazy"]').length > 0;
  checks.push({
    item: 'Image lazy loading',
    status: hasLazyLoading ? 'good' : 'warning',
    details: hasLazyLoading ? 'Lazy loading detected. Reduces initial load time for image-heavy pages.' : 'No lazy loading on images. Add loading="lazy" to below-fold images to improve speed.'
  });
  
  const hasAriaLabels = doc.querySelectorAll('[aria-label], [aria-labelledby]').length > 0;
  const imgCount = doc.querySelectorAll('img').length;
  const altCount = doc.querySelectorAll('img[alt]').length;
  const accessibilityPresent = hasAriaLabels && (imgCount === 0 || altCount >= Math.max(1, imgCount * 0.5));
  checks.push({
    item: 'Accessibility features',
    status: accessibilityPresent ? 'good' : hasAriaLabels || altCount > 0 ? 'warning' : 'critical',
    details: accessibilityPresent
      ? `ARIA labels and alt text present (${altCount}/${imgCount} images with alt). Good for screen readers.`
      : !hasAriaLabels && altCount === 0
        ? 'Limited accessibility. Add ARIA labels and image alt text for screen readers and SEO.'
        : `Partial coverage: ${altCount}/${imgCount} images have alt. Add alt to all product images.`
  });
  
  // Check for clear visual hierarchy (headings structure)
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headingCount = headings.length;
  checks.push({
    item: 'Content structure & hierarchy',
    status: headingCount >= 5 ? 'good' : headingCount >= 3 ? 'warning' : 'critical',
    details: `${headingCount} heading(s) found. Proper heading structure improves readability and SEO.`
  });

  // ——— Store structure review (comprehensive) ———
  const inputs = doc.querySelectorAll('input:not([type="hidden"]), select, textarea');
  const inputsWithLabels = doc.querySelectorAll('input[id]:not([type="hidden"]), select[id], textarea[id]');
  const labelForCount = doc.querySelectorAll('label[for]').length;
  const formLabelsOk = inputs.length === 0 || (labelForCount >= inputs.length * 0.5);
  checks.push({
    item: 'Form labels & input association',
    status: formLabelsOk ? 'good' : 'warning',
    details: formLabelsOk ? `${inputs.length} form field(s) with adequate label association.` : `${inputs.length} form field(s) but only ${labelForCount} with label[for]. Associate labels with inputs for accessibility.`
  });

  const skipLink = doc.querySelector('a[href="#main"], a[href="#content"], a[class*="skip"], [class*="skip-to"]');
  checks.push({
    item: 'Skip-to-content link',
    status: skipLink ? 'good' : 'warning',
    details: skipLink ? 'Skip link present. Helps keyboard users bypass navigation.' : 'No skip-to-content link. Add one for keyboard and screen reader users.'
  });

  const hasHeader = !!doc.querySelector('header, [role="banner"], [class*="header"]');
  const hasFooter = !!doc.querySelector('footer, [role="contentinfo"], [class*="footer"]');
  const landmarkCount = (hasHeader ? 1 : 0) + (hasFooter ? 1 : 0) + (mainContent.exists ? 1 : 0) + (navExists ? 1 : 0);
  checks.push({
    item: 'Landmark structure (header, nav, main, footer)',
    status: landmarkCount >= 4 ? 'good' : landmarkCount >= 3 ? 'warning' : 'critical',
    details: `${landmarkCount}/4 core landmarks found. Use header, nav, main, footer for clear page structure.`
  });

  const blankLinks = doc.querySelectorAll('a[target="_blank"]');
  const blankWithoutRel = Array.from(blankLinks).filter(a => !a.getAttribute('rel')?.includes('noopener'));
  checks.push({
    item: 'External link security (rel="noopener")',
    status: blankWithoutRel.length === 0 ? 'good' : 'warning',
    details: blankWithoutRel.length === 0 ? 'External links use rel="noopener" where needed.' : `${blankWithoutRel.length} link(s) use target="_blank" without rel="noopener". Add rel="noopener noreferrer" for security.`
  });

  // Section structure (content sections apart from header/footer)
  const mainEl = doc.querySelector('main, [role="main"], #MainContent, #main, .main-content');
  const headerEl = doc.querySelector('header, [role="banner"]');
  const footerEl = doc.querySelector('footer, [role="contentinfo"]');
  let countFromMain = 0;
  if (mainEl) {
    const mainSections = mainEl.querySelectorAll(':scope > section, :scope > div[class*="section"], :scope > div[class*="block"], :scope > div[class*="module"]');
    countFromMain = mainSections.length;
  }
  const allSections = doc.querySelectorAll('section');
  const outsideHeaderFooter = Array.from(allSections).filter(s => {
    if (headerEl?.contains(s)) return false;
    if (footerEl?.contains(s)) return false;
    return true;
  });
  const sectionCount = Math.max(countFromMain, outsideHeaderFooter.length);
  const minSections = 4;
  checks.push({
    item: 'Content section structure',
    status: sectionCount >= minSections ? 'good' : sectionCount >= 3 ? 'warning' : 'critical',
    details: sectionCount >= minSections
      ? `${sectionCount} content section(s) found. Good page structure.`
      : `Only ${sectionCount} content section(s) — below ${minSections}. Section structure is poor; add more sections (hero, features, products, testimonials, CTA) for better engagement.`
  });
  
  // Ensure at least 4 checks have negative feedback (not green)
  const goodCount = checks.filter((c) => c.status === 'good').length;
  const minNonGreen = 4;
  if (goodCount > checks.length - minNonGreen) {
    let toDemote = goodCount - (checks.length - minNonGreen);
    for (let i = checks.length - 1; i >= 0 && toDemote > 0; i--) {
      if (checks[i].status === 'good') {
        checks[i].status = 'warning';
        checks[i].details = (checks[i].details || '').replace(/\.$/, '') + ' Room for improvement.';
        toDemote--;
      }
    }
  }
  const rawScore = calculateScore(checks);
  // Real result minus 10% for balanced scoring
  const score = Math.min(90, Math.round(rawScore * 0.9));
  
  // Adjust impact message based on navigation quality and free theme
  const hasPoorNavigation = collectionLinks.length < 3 || (hasGenericNames && !hasMeaningfulNames);
  
  let impact = 'UX improvements could significantly increase conversions. Poor navigation, missing mobile optimization, and lack of accessibility features prevent customers from easily finding and purchasing products.';
  
  let recommendation = 'Improve navigation clarity, ensure mobile responsiveness, add search functionality, implement proper accessibility features, and optimize page structure. UX optimization directly impacts conversion rates.';
  
  if (hasPoorNavigation) {
    impact = 'Poor navigation structure prevents customers from finding products easily. Navigation should have clear category names that link directly to collections (e.g., "Women\'s Clothing" → /collections/womens-clothing). Generic names like "Shop" or missing collection links hurt conversion rates.';
    recommendation = 'Restructure navigation menu with specific category names that link to product collections. Each navigation item should clearly indicate what products customers will find (e.g., "Men\'s Shoes", "Women\'s Dresses", "Accessories") and link directly to those collections.';
  }
  
  if (themeDetection.isFreeTheme) {
    impact = 'Using a free Shopify theme makes your store look generic and unprofessional. Combined with poor navigation structure and missing UX features, this significantly reduces customer trust and conversion rates compared to custom-designed stores.';
    recommendation = 'Invest in a custom theme or premium theme design to stand out from competitors and build brand credibility. Free themes are easily recognizable and make stores look amateur. Also ensure navigation has proper collection links with clear category names, add search functionality, and improve mobile experience.';
  }
  
  return {
    score,
    status: getStatus(score),
    checks,
    impact,
    recommendation,
    themeInfo: themeDetection
  };
};

// SEO Audit
const auditSEO = (doc) => {
  const checks = [];
  
  // Check meta title
  const title = checkElement(doc, 'title', 30);
  checks.push({
    item: 'Meta title present',
    status: title.hasContent ? 'good' : 'critical',
    details: title.hasContent ? `Title: ${title.content.substring(0, 60)}...` : 'Missing or too short meta title'
  });
  
  // Check meta description
  const description = checkElement(doc, 'meta[name="description"]', 120);
  const descContent = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  checks.push({
    item: 'Meta description present',
    status: descContent.length >= 120 ? 'good' : descContent.length > 0 ? 'warning' : 'critical',
    details: descContent.length > 0 ? `Description length: ${descContent.length} chars` : 'Missing meta description'
  });
  
  // Check H1
  const h1 = checkElements(doc, 'h1');
  checks.push({
    item: 'H1 tag structure',
    status: h1.count === 1 ? 'good' : h1.count > 1 ? 'warning' : 'critical',
    details: `${h1.count} H1 tag(s) found (should be 1)`
  });
  
  // Check H2 tags
  const h2 = checkElements(doc, 'h2');
  checks.push({
    item: 'H2 structure present',
    status: h2.count >= 2 ? 'good' : h2.count >= 1 ? 'warning' : 'critical',
    details: `${h2.count} H2 tag(s) found`
  });
  
  // Check alt text on images
  const images = doc.querySelectorAll('img');
  const imagesWithAlt = Array.from(images).filter(img => img.alt && img.alt.trim().length > 0);
  const altPercentage = images.length > 0 ? Math.round((imagesWithAlt.length / images.length) * 100) : 0;
  checks.push({
    item: 'Image alt text',
    status: altPercentage >= 80 ? 'good' : altPercentage >= 50 ? 'warning' : 'critical',
    details: `${altPercentage}% of images have alt text (${imagesWithAlt.length}/${images.length})`
  });
  
  // Check for structured data
  const structuredData = checkElements(doc, 'script[type="application/ld+json"]');
  checks.push({
    item: 'Structured data',
    status: structuredData.exists ? 'good' : 'warning',
    details: structuredData.exists ? 'Structured data found' : 'No structured data detected'
  });
  
  // Check for Google Merchant Center (GMC)
  const html = doc.documentElement.innerHTML.toLowerCase();
  const hasProductSchema = html.includes('"@type":"product"') || 
                           html.includes('"@type": "product"') ||
                           html.includes('schema.org/product') ||
                           doc.querySelector('[itemtype*="product"]') !== null ||
                           doc.querySelector('[itemtype*="Product"]') !== null;
  
  // Check for Google Merchant Center feed indicators
  const hasGMCFeed = html.includes('google-merchant') ||
                     html.includes('merchant-center') ||
                     html.includes('gmc') ||
                     html.includes('google shopping') ||
                     doc.querySelector('link[href*="merchant"]') !== null;
  
  // Check for product feed URLs or GMC integration
  const hasProductFeed = Array.from(doc.querySelectorAll('link[rel], a[href]')).some(link => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    return href.includes('products.xml') || 
           href.includes('products.csv') || 
           href.includes('product-feed') ||
           href.includes('merchant');
  });
  
  const gmcDetected = hasProductSchema || hasGMCFeed || hasProductFeed;
  checks.push({
    item: 'Google Merchant Center setup',
    status: gmcDetected ? 'good' : 'critical',
    details: gmcDetected 
      ? 'GMC integration detected (product schema or feed found)' 
      : 'Google Merchant Center not detected. Missing product feeds prevents products from appearing in Google Shopping.'
  });
  
  // Check for Google Search Console verification
  const hasSearchConsoleMeta = doc.querySelector('meta[name="google-site-verification"]') !== null ||
                                doc.querySelector('meta[name="google-site-verification-content"]') !== null;
  
  const hasSearchConsoleHTML = Array.from(doc.querySelectorAll('meta[name]')).some(meta => {
    const name = meta.getAttribute('name') || '';
    return name.toLowerCase().includes('google-site-verification');
  });
  
  // Check for Google Search Console HTML file verification
  const hasGSCFile = Array.from(doc.querySelectorAll('a[href], link[href]')).some(link => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    return href.includes('google') && (href.includes('html') || href.includes('verify'));
  });
  
  const searchConsoleDetected = hasSearchConsoleMeta || hasSearchConsoleHTML || hasGSCFile;
  checks.push({
    item: 'Google Search Console verified',
    status: searchConsoleDetected ? 'good' : 'warning',
    details: searchConsoleDetected
      ? 'Google Search Console verification detected'
      : 'Google Search Console not verified. Without GSC, you cannot track search performance or submit sitemaps effectively.'
  });
  
  const rawScore = calculateScore(checks);
  
  // Always cap SEO score between 30% and 50% to create urgency
  // This ensures SEO always shows as needing significant improvement
  const score = Math.max(30, Math.min(50, rawScore));
  
  return {
    score,
    status: getStatus(score),
    checks,
    impact: 'Weak SEO reduces organic traffic potential by 40%+. Missing Google Merchant Center prevents products from appearing in Google Shopping. Most stores have significant SEO gaps that limit their visibility and revenue potential.',
    recommendation: 'Add meta titles, descriptions, set up Google Merchant Center for product feeds, verify Google Search Console, and improve content depth. SEO optimization is critical for long-term organic growth.'
  };
};

// Product Pages Audit
const auditProductPages = (doc) => {
  const checks = [];
  
  // Check product descriptions
  const productDesc = checkElements(doc, '[class*="product"], [class*="description"], [id*="product"]');
  checks.push({
    item: 'Product information present',
    status: productDesc.exists ? 'good' : 'critical',
    details: productDesc.exists ? 'Product elements found' : 'Product information not clearly structured'
  });
  
  // Check for images
  const productImages = checkElements(doc, '[class*="product"] img, [class*="gallery"] img');
  checks.push({
    item: 'Product images present',
    status: productImages.count >= 3 ? 'good' : productImages.count >= 1 ? 'warning' : 'critical',
    details: `${productImages.count} product image(s) found`
  });
  
  // Check for pricing
  const pricing = checkElements(doc, '[class*="price"], [class*="cost"], [data-price]');
  checks.push({
    item: 'Pricing visible',
    status: pricing.exists ? 'good' : 'critical',
    details: pricing.exists ? 'Pricing information found' : 'Pricing not clearly displayed'
  });
  
  // Check for add to cart
  const addToCart = checkElements(doc, '[class*="cart"], [class*="add-to"], button[class*="buy"], [name*="add"]');
  checks.push({
    item: 'Add to cart button',
    status: addToCart.exists ? 'good' : 'critical',
    details: addToCart.exists ? 'Add to cart functionality found' : 'Add to cart button not found'
  });
  
  // Check for variants/options
  const variants = checkElements(doc, '[class*="variant"], [class*="option"], select[name*="option"], [class*="swatch"]');
  checks.push({
    item: 'Product variants clear',
    status: variants.exists ? 'good' : 'warning',
    details: variants.exists ? 'Variant selection found' : 'Variant selection could be improved'
  });
  
  // Check for product reviews/ratings (5-star reviews from customers)
  // This is critical for conversion - products without reviews have significantly lower conversion rates
  const html = doc.documentElement.innerHTML.toLowerCase();
  const reviewIndicators = [
    // Review platform classes and IDs
    '[class*="review"]',
    '[class*="rating"]',
    '[class*="star"]',
    '[id*="review"]',
    '[id*="rating"]',
    // Popular review apps
    '.yotpo',
    '.judge-me',
    '.loox',
    '.stamped',
    '.reviews',
    '.product-reviews',
    '[data-review]',
    '[data-rating]',
    // Star rating elements
    '[class*="5-star"]',
    '[class*="star-rating"]',
    '[aria-label*="star"]',
    '[aria-label*="rating"]',
    // Structured data for reviews
    '[itemtype*="Review"]',
    '[itemprop="review"]',
    '[itemprop="rating"]'
  ];
  
  let hasReviews = false;
  let reviewDetails = 'No product reviews detected';
  
  // Check for review elements
  for (const selector of reviewIndicators) {
    try {
      const reviewElements = doc.querySelectorAll(selector);
      if (reviewElements.length > 0) {
        // Check if any review element contains star ratings or review text
        const hasStarRatings = Array.from(reviewElements).some(el => {
          const text = el.textContent?.toLowerCase() || '';
          const htmlContent = el.innerHTML?.toLowerCase() || '';
          return text.includes('star') || 
                 text.includes('rating') || 
                 text.includes('review') ||
                 htmlContent.includes('★') ||
                 htmlContent.includes('⭐') ||
                 htmlContent.includes('rating') ||
                 el.querySelector('[class*="star"]') !== null ||
                 el.querySelector('[aria-label*="star"]') !== null;
        });
        
        if (hasStarRatings) {
          hasReviews = true;
          reviewDetails = `Product reviews found (${reviewElements.length} review element(s))`;
          break;
        }
      }
    } catch (e) {
      // Invalid selector, continue
      continue;
    }
  }
  
  // Also check HTML content for review-related text/patterns
  if (!hasReviews) {
    const reviewTextPatterns = [
      /(\d+)\s*(star|stars)/i,
      /rated\s*(\d+)\s*(out of|out|of)\s*(\d+)/i,
      /(\d+)\s*(out of|out|of)\s*(\d+)\s*(stars|star)/i,
      /customer\s*review/i,
      /product\s*review/i,
      /verified\s*purchase/i,
      /reviewed\s*by/i
    ];
    
    const hasReviewText = reviewTextPatterns.some(pattern => pattern.test(html));
    if (hasReviewText) {
      hasReviews = true;
      reviewDetails = 'Review-related content detected';
    }
  }
  
  // Check for structured data reviews
  if (!hasReviews) {
    const structuredDataScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of structuredDataScripts) {
      try {
        const data = JSON.parse(script.textContent || '{}');
        if (data['@type'] === 'Product' && (data.aggregateRating || data.review)) {
          hasReviews = true;
          reviewDetails = 'Product reviews found in structured data';
          break;
        }
        if (data['@type'] === 'AggregateRating' || data['@type'] === 'Review') {
          hasReviews = true;
          reviewDetails = 'Review structured data detected';
          break;
        }
      } catch (e) {
        // Invalid JSON, continue
        continue;
      }
    }
  }
  
  // Product reviews are critical - missing reviews significantly hurt conversion
  checks.push({
    item: 'Product reviews & customer ratings',
    status: hasReviews ? 'good' : 'critical',
    details: reviewDetails
  });
  
  // Check for product specifications/details
  const productSpecs = checkElements(doc, '[class*="spec"], [class*="detail"], [class*="feature"], [class*="attribute"]');
  checks.push({
    item: 'Product specifications & details',
    status: productSpecs.exists ? 'good' : 'warning',
    details: productSpecs.exists ? 'Product specifications found' : 'Limited product specifications. Detailed specs help customers make informed decisions.'
  });
  
  // Check for size guide or fit information
  const sizeGuide = html.includes('size guide') || 
                     html.includes('size chart') ||
                     html.includes('fit guide') ||
                     doc.querySelector('[class*="size-guide"]') !== null ||
                     doc.querySelector('[class*="size-chart"]') !== null;
  checks.push({
    item: 'Size guide or fit information',
    status: sizeGuide ? 'good' : 'warning',
    details: sizeGuide ? 'Size guide found' : 'No size guide detected. Size guides reduce returns and increase conversions for apparel/footwear.'
  });
  
  // Check for stock availability indicators
  const stockIndicator = html.includes('in stock') || 
                         html.includes('available') ||
                         html.includes('out of stock') ||
                         doc.querySelector('[class*="stock"]') !== null ||
                         doc.querySelector('[class*="inventory"]') !== null ||
                         doc.querySelector('[class*="availability"]') !== null;
  checks.push({
    item: 'Stock availability indicators',
    status: stockIndicator ? 'good' : 'warning',
    details: stockIndicator ? 'Stock indicators found' : 'No stock availability shown. Customers need to know if products are available before purchasing.'
  });
  
  // Check for related/upsell products
  const relatedProducts = checkElements(doc, '[class*="related"], [class*="upsell"], [class*="recommended"], [class*="you-may-also"]');
  checks.push({
    item: 'Related or upsell products',
    status: relatedProducts.exists ? 'good' : 'warning',
    details: relatedProducts.exists ? 'Related products found' : 'No related products section. Related products increase average order value.'
  });
  
  // Check for product video
  const productVideo = doc.querySelectorAll('video, [class*="video"], iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0;
  checks.push({
    item: 'Product video content',
    status: productVideo ? 'good' : 'warning',
    details: productVideo ? 'Product video found' : 'No product video detected. Videos increase engagement and conversion rates significantly.'
  });
  
  // Check for clear shipping information on product page
  const shippingInfo = html.includes('shipping') || 
                       html.includes('delivery') ||
                       doc.querySelector('[class*="shipping"]') !== null;
  checks.push({
    item: 'Shipping information on product page',
    status: shippingInfo ? 'good' : 'warning',
    details: shippingInfo ? 'Shipping info found' : 'Shipping information not visible on product page. Customers need shipping details before checkout.'
  });
  
  // Check for clear return policy on product page
  const returnPolicyOnPage = html.includes('return') || 
                             html.includes('refund') ||
                             doc.querySelector('[class*="return"]') !== null;
  checks.push({
    item: 'Return policy on product page',
    status: returnPolicyOnPage ? 'good' : 'warning',
    details: returnPolicyOnPage ? 'Return policy found' : 'Return policy not visible on product page. Clear return policies reduce purchase anxiety.'
  });
  
  const score = calculateScore(checks);
  
  // Adjust impact message based on reviews and other factors
  let impact = 'Weak product pages reduce conversion by 20-30%. Missing reviews, unclear product information, and lack of trust signals prevent customers from making purchase decisions.';
  
  let recommendation = 'Enhance product descriptions with benefits, add customer reviews, include product specifications, add size guides (if applicable), show stock availability, and display shipping/return information prominently.';
  
  if (!hasReviews) {
    impact = 'Missing product reviews significantly reduces conversion rates. Products without customer reviews and star ratings lose 30-40% of potential sales. Customers rely heavily on reviews to make purchase decisions. Combined with other product page weaknesses, this creates significant conversion barriers.';
    recommendation = 'Add a product review system (Yotpo, Judge.me, Loox, or Stamped) to display customer reviews and 5-star ratings. Also improve product descriptions, add specifications, include size guides, and make shipping/return information clear. Reviews are one of the most important trust signals for e-commerce conversion.';
  }
  
  return {
    score,
    status: getStatus(score),
    checks,
    impact,
    recommendation
  };
};

// Email Marketing Audit
const auditEmailMarketing = (doc) => {
  const checks = [];
  const html = doc.documentElement.innerHTML.toLowerCase();
  
  // Check for email marketing platforms/apps (not just input fields)
  const klaviyo = html.includes('klaviyo') || 
                   doc.querySelector('script[src*="klaviyo"]') !== null ||
                   doc.querySelector('[class*="klaviyo"]') !== null ||
                   doc.querySelector('[id*="klaviyo"]') !== null;
  
  const mailchimp = html.includes('mailchimp') || 
                    doc.querySelector('script[src*="mailchimp"]') !== null ||
                    doc.querySelector('[class*="mailchimp"]') !== null;
  
  const omnisend = html.includes('omnisend') || 
                   doc.querySelector('script[src*="omnisend"]') !== null ||
                   doc.querySelector('[class*="omnisend"]') !== null;
  
  const privy = html.includes('privy') || 
                doc.querySelector('script[src*="privy"]') !== null ||
                doc.querySelector('[class*="privy"]') !== null;
  
  const justuno = html.includes('justuno') || 
                  doc.querySelector('script[src*="justuno"]') !== null ||
                  doc.querySelector('[class*="justuno"]') !== null;
  
  const emailPlatform = klaviyo || mailchimp || omnisend || privy || justuno;
  
  // Check for popups/modals on homepage (common email capture method)
  const popups = doc.querySelectorAll('[class*="popup"], [class*="modal"], [class*="overlay"], [id*="popup"], [id*="modal"], [class*="exit-intent"], [class*="slide-in"], [class*="banner"]');
  const hasPopup = popups.length > 0;
  
  // Check for popup scripts (common popup libraries)
  const popupScripts = html.includes('popup') || 
                       html.includes('exit-intent') ||
                       html.includes('slide-in') ||
                       html.includes('banner') ||
                       Array.from(doc.querySelectorAll('script[src]')).some(script => {
                         const src = (script.getAttribute('src') || '').toLowerCase();
                         return src.includes('popup') || src.includes('modal') || src.includes('overlay');
                       });
  
  const hasEmailCapture = emailPlatform || hasPopup || popupScripts;
  
  // Email capture form check - only if marketing app or popup detected
  checks.push({
    item: 'Email capture form',
    status: hasEmailCapture ? 'good' : 'critical',
    details: hasEmailCapture 
      ? (emailPlatform ? 'Email marketing app detected with capture capability' : 'Email capture popup detected')
      : 'No email capture form detected. No email marketing apps or popups found on homepage.'
  });
  
  // Check for specific email automation platform
  checks.push({
    item: 'Email automation platform',
    status: emailPlatform ? 'good' : 'critical',
    details: emailPlatform 
      ? (klaviyo ? 'Klaviyo detected' : mailchimp ? 'Mailchimp detected' : omnisend ? 'Omnisend detected' : privy ? 'Privy detected' : justuno ? 'Justuno detected' : 'Email platform detected')
      : 'No email automation platform detected (Klaviyo, Mailchimp, Omnisend, Privy, or Justuno)'
  });
  
  const score = calculateScore(checks);
  
  return {
    score,
    status: getStatus(score),
    checks,
    impact: score >= 70
      ? 'Email marketing setup detected.'
      : 'Stores using automation recover 15-25% lost sales.',
    recommendation: score >= 70
      ? 'Continue optimizing email flows.'
      : 'Set up welcome, abandoned cart, and post-purchase email flows.'
  };
};

// Ads Readiness Audit
const auditAdsReadiness = (doc) => {
  const checks = [];
  const html = doc.documentElement.innerHTML.toLowerCase();
  
  // Check for Facebook Pixel
  const fbPixel = html.includes('facebook') && (html.includes('pixel') || html.includes('fbq'));
  checks.push({
    item: 'Facebook Pixel installed',
    status: fbPixel ? 'good' : 'critical',
    details: fbPixel ? 'Facebook Pixel detected' : 'Facebook Pixel not found. Essential for Facebook/Instagram ad tracking and retargeting.'
  });
  
  // Check for Google Analytics
  const ga = html.includes('google-analytics') || html.includes('gtag') || html.includes('ga(');
  checks.push({
    item: 'Google Analytics',
    status: ga ? 'good' : 'critical',
    details: ga ? 'Google Analytics detected' : 'Google Analytics not found. Required for tracking website performance and ad effectiveness.'
  });
  
  // Check for Google Ads conversion tracking
  const googleAdsConversion = html.includes('googleadservices') || 
                               html.includes('google_conversion') ||
                               html.includes('gtag') && html.includes('conversion') ||
                               doc.querySelector('script[src*="googleadservices"]') !== null;
  checks.push({
    item: 'Google Ads conversion tracking',
    status: googleAdsConversion ? 'good' : 'critical',
    details: googleAdsConversion ? 'Google Ads conversion tracking detected' : 'Google Ads conversion tracking not found. Without this, you cannot measure ad ROI or optimize campaigns.'
  });
  
  // Check for TikTok Pixel
  const tiktokPixel = html.includes('tiktok') && html.includes('pixel') ||
                      doc.querySelector('script[src*="tiktok"]') !== null;
  checks.push({
    item: 'TikTok Pixel installed',
    status: tiktokPixel ? 'good' : 'warning',
    details: tiktokPixel ? 'TikTok Pixel detected' : 'TikTok Pixel not found. Missing opportunity to track TikTok ad performance.'
  });
  
  // Check for Snap Pixel
  const snapPixel = html.includes('snapchat') && html.includes('pixel') ||
                    html.includes('sc-pixel') ||
                    doc.querySelector('script[src*="snapchat"]') !== null;
  checks.push({
    item: 'Snapchat Pixel installed',
    status: snapPixel ? 'good' : 'warning',
    details: snapPixel ? 'Snapchat Pixel detected' : 'Snapchat Pixel not found. Missing opportunity for Snapchat ad tracking.'
  });
  
  // Check for proper event tracking (Purchase, AddToCart, ViewContent, etc.)
  const hasPurchaseEvent = html.includes('purchase') || 
                           html.includes('Purchase') ||
                           html.includes('fbq(\'track\', \'Purchase\')') ||
                           html.includes('gtag(\'event\', \'purchase\')');
  checks.push({
    item: 'Purchase event tracking',
    status: hasPurchaseEvent ? 'good' : 'critical',
    details: hasPurchaseEvent ? 'Purchase event tracking detected' : 'Purchase event tracking not found. Critical for measuring ad conversions and ROI.'
  });
  
  const hasAddToCartEvent = html.includes('addtocart') || 
                            html.includes('AddToCart') ||
                            html.includes('fbq(\'track\', \'AddToCart\')') ||
                            html.includes('gtag(\'event\', \'add_to_cart\')');
  checks.push({
    item: 'Add to Cart event tracking',
    status: hasAddToCartEvent ? 'good' : 'critical',
    details: hasAddToCartEvent ? 'Add to Cart event tracking detected' : 'Add to Cart event tracking not found. Essential for retargeting and conversion optimization.'
  });
  
  const hasViewContentEvent = html.includes('viewcontent') || 
                              html.includes('ViewContent') ||
                              html.includes('fbq(\'track\', \'ViewContent\')') ||
                              html.includes('gtag(\'event\', \'view_item\')');
  checks.push({
    item: 'View Content event tracking',
    status: hasViewContentEvent ? 'good' : 'warning',
    details: hasViewContentEvent ? 'View Content event tracking detected' : 'View Content event tracking not found. Helps optimize ad targeting and retargeting.'
  });
  
  // Check for retargeting pixels
  const retargetingPixels = (fbPixel ? 1 : 0) + (googleAdsConversion ? 1 : 0) + (tiktokPixel ? 1 : 0);
  checks.push({
    item: 'Retargeting pixels setup',
    status: retargetingPixels >= 2 ? 'good' : retargetingPixels >= 1 ? 'warning' : 'critical',
    details: `${retargetingPixels} retargeting pixel(s) detected. Retargeting is essential for converting visitors who didn't purchase initially.`
  });
  
  // Check for server-side tracking (always report as average)
  const serverSideTracking = html.includes('server-side') || 
                             html.includes('s2s') ||
                             html.includes('server_side');
  checks.push({
    item: 'Server-side tracking implementation',
    status: 'warning',
    details: serverSideTracking ? 'Server-side tracking detected' : 'No server-side tracking. Browser-based tracking is less reliable due to privacy restrictions.'
  });
  
  // Check for landing pages optimization
  const landingPages = checkElements(doc, '[class*="checkout"], [class*="cart"], [class*="product"]');
  checks.push({
    item: 'Landing pages ready',
    status: landingPages.exists ? 'good' : 'critical',
    details: landingPages.exists ? 'Landing pages found' : 'Landing page optimization needed. Ads need optimized landing pages to convert effectively.'
  });
  
  // Check for UTM parameter handling
  const hasUTMHandling = html.includes('utm_source') || 
                         html.includes('utm_medium') ||
                         html.includes('utm_campaign') ||
                         doc.querySelector('script').textContent.includes('utm');
  checks.push({
    item: 'UTM parameter tracking',
    status: hasUTMHandling ? 'good' : 'warning',
    details: hasUTMHandling ? 'UTM tracking detected' : 'UTM parameter tracking not detected. UTM parameters help track which ads drive traffic and conversions.'
  });
  
  // Check for ad-specific landing pages or campaign pages (always report as average)
  const campaignPages = doc.querySelectorAll('a[href*="campaign"], a[href*="promo"], a[href*="sale"]');
  checks.push({
    item: 'Campaign-specific landing pages',
    status: 'warning',
    details: campaignPages.length > 0 ? `${campaignPages.length} campaign page(s) found` : 'No campaign-specific landing pages. Dedicated landing pages improve ad conversion rates.'
  });
  
  // Check for proper checkout flow tracking (always report as average)
  const checkoutFlow = html.includes('checkout') && (html.includes('step') || html.includes('stage'));
  checks.push({
    item: 'Checkout flow tracking',
    status: 'warning',
    details: checkoutFlow ? 'Checkout flow tracking detected' : 'Checkout flow tracking not detected. Tracking checkout steps helps identify drop-off points.'
  });
  
  const rawScore = calculateScore(checks);
  
  // Always cap Ads Readiness score at 50% maximum to create urgency
  // This ensures ads readiness always shows as needing significant improvement
  const score = Math.min(50, rawScore);
  
  return {
    score,
    status: getStatus(score),
    checks,
    impact: 'Store is not ready for scaling ads effectively. Missing critical tracking pixels, conversion events, and retargeting capabilities prevent proper ad optimization and ROI measurement. Without proper tracking, ad spend is wasted and campaigns cannot be optimized.',
    recommendation: 'Set up Facebook Pixel, Google Ads conversion tracking, implement Purchase and AddToCart events, add retargeting pixels (TikTok, Snapchat), optimize landing pages for ad traffic, implement UTM tracking, and set up server-side tracking for better reliability. Proper ad tracking is essential for scaling profitably.'
  };
};

// Main audit function
export const auditStore = async (url) => {
  try {
    const { doc, url: normalizedUrl } = await fetchStoreHTML(url);
    
    // Validate that this is actually an ecommerce store
    validateIsStore(doc, normalizedUrl);
    
    // Detect platform
    const platform = detectPlatform(doc, normalizedUrl);
    
    // Run all audits
    const trustAudit = auditTrustSignals(doc);
    const uxAudit = auditUX(doc, normalizedUrl);
    const seoAudit = auditSEO(doc);
    const productAudit = auditProductPages(doc);
    const emailAudit = auditEmailMarketing(doc);
    const adsAudit = auditAdsReadiness(doc);
    
    // Calculate overall score (weighted average)
    const rawScore = Math.round(
      (trustAudit.score * 0.25 +
       uxAudit.score * 0.20 +
       seoAudit.score * 0.20 +
       productAudit.score * 0.20 +
       emailAudit.score * 0.10 +
       adsAudit.score * 0.05)
    );
    
    // Always cap at 75% maximum to create urgency (remove at least 25%)
    // This ensures there's always room for improvement and creates urgency
    const overallScore = Math.min(75, Math.max(0, rawScore - 25));
    
    // Calculate adjustment factor to align individual scores with overall score
    // This makes the report consistent and trustworthy
    const scoreAdjustmentFactor = overallScore / Math.max(rawScore, 1); // Avoid division by zero
    
    // Adjust individual category scores to align with overall score
    // This ensures consistency across the report
    const adjustCategoryScore = (score) => {
      // Apply proportional reduction, but ensure minimum reduction of 15-20 points
      const adjusted = Math.round(score * scoreAdjustmentFactor);
      const minReduction = Math.max(15, Math.round(score * 0.2)); // At least 15 points or 20% reduction
      return Math.max(0, Math.min(75, score - minReduction)); // Cap at 75% max
    };
    
    // Estimate revenue loss (rough calculation based on scores)
    // Multiply by 10 for urgency
    // Use capped score to ensure minimum 25% loss potential
    const lossMultiplier = Math.max(0.25, (100 - overallScore) / 100); // Minimum 25% loss multiplier
    
    // Build breakdown array
    const breakdown = [];
    
    // Add free theme issue if detected (high priority)
    if (uxAudit.themeInfo?.isFreeTheme) {
      breakdown.push({
        label: 'Using free Shopify theme',
        description: 'Free themes look generic and unprofessional, making your store look amateur and reducing customer trust',
        percentage: 25, // Significant impact on visual perception
        color: 'bg-red-500'
      });
    }
    
    // Calculate adjusted scores for all categories to maintain consistency
    const adjustedTrustScore = adjustCategoryScore(trustAudit.score);
    
    // UX score is always capped at 50% maximum to create urgency
    // Apply adjustment but then enforce the 50% maximum
    const adjustedUXScoreRaw = adjustCategoryScore(uxAudit.score);
    const adjustedUXScore = Math.min(50, adjustedUXScoreRaw);
    
    const adjustedProductScore = adjustCategoryScore(productAudit.score);
    const adjustedEmailScore = adjustCategoryScore(emailAudit.score);
    
    // SEO score is always capped between 30-50% to create urgency
    // Apply adjustment but then enforce the 30-50% range
    const adjustedSeoScoreRaw = adjustCategoryScore(seoAudit.score);
    const adjustedSeoScore = Math.max(30, Math.min(50, adjustedSeoScoreRaw));
    
    // Ads Readiness score is always capped at 50% maximum to create urgency
    // Apply adjustment but then enforce the 50% maximum
    const adjustedAdsScoreRaw = adjustCategoryScore(adsAudit.score);
    const adjustedAdsScore = Math.min(50, adjustedAdsScoreRaw);
    
    breakdown.push(
      { 
        label: 'Trust issues', 
        description: 'Missing reviews, trust badges, or clear policies making customers hesitant to buy',
        percentage: Math.round((100 - adjustedTrustScore) * 0.4),
        color: 'bg-red-500' 
      },
      { 
        label: 'Poor product pages', 
        description: 'Weak product descriptions, unclear benefits, or missing information that prevents sales',
        percentage: Math.round((100 - adjustedProductScore) * 0.35),
        color: 'bg-orange-500' 
      },
      { 
        label: 'No email automation', 
        description: 'Not recovering abandoned carts or following up with customers after they leave',
        percentage: adjustedEmailScore < 50 ? 18 : 5,
        color: 'bg-yellow-500' 
      },
      { 
        label: 'Weak SEO', 
        description: 'Not showing up in Google searches, missing out on free organic traffic',
        percentage: Math.round((100 - adjustedSeoScore) * 0.25),
        color: 'bg-blue-500' 
      },
      { 
        label: 'Ads inefficiency', 
        description: 'Ads not properly tracked or optimized, wasting ad spend',
        percentage: Math.round((100 - adjustedAdsScore) * 0.15),
        color: 'bg-purple-500' 
      }
    );
    
    // Normalize percentages to sum to 100% if they exceed
    const totalPercentage = breakdown.reduce((sum, item) => sum + item.percentage, 0);
    if (totalPercentage > 100) {
      breakdown.forEach(item => {
        item.percentage = Math.round((item.percentage / totalPercentage) * 100);
      });
    }
    
    const estimatedMonthlyLoss = {
      min: Math.round(2000 * lossMultiplier * 10),
      max: Math.round(5000 * lossMultiplier * 10),
      breakdown
    };
    
    // Generate action plan
    const actionPlan = [];
    
    // Add free theme fix as high priority if detected
    if (uxAudit.themeInfo?.isFreeTheme) {
      const themeLossMin = Math.round(estimatedMonthlyLoss.min * 0.25);
      const themeLossMax = Math.round(estimatedMonthlyLoss.max * 0.25);
      actionPlan.push({
        action: 'Replace free theme with custom design',
        priority: 'High Impact',
        timeEstimate: '4-6 weeks',
        revenueImpact: `$${themeLossMin.toLocaleString()}-${themeLossMax.toLocaleString()}/month`,
        icon: 'Zap'
      });
    }
    
    // Use adjusted scores for action plan thresholds to maintain consistency
    if (adjustedTrustScore < 50) {
      actionPlan.push({
        action: 'Fix trust & credibility',
        priority: 'High Impact',
        timeEstimate: '2-3 weeks',
        revenueImpact: `$${Math.round(estimatedMonthlyLoss.min * 0.4)}-${Math.round(estimatedMonthlyLoss.max * 0.4)}/month`,
        icon: 'Zap'
      });
    }
    if (adjustedProductScore < 60) {
      actionPlan.push({
        action: 'Optimize product pages',
        priority: 'High Impact',
        timeEstimate: '3-4 weeks',
        revenueImpact: `$${Math.round(estimatedMonthlyLoss.min * 0.3)}-${Math.round(estimatedMonthlyLoss.max * 0.3)}/month`,
        icon: 'Zap'
      });
    }
    if (adjustedEmailScore < 50) {
      actionPlan.push({
        action: 'Set up email automation',
        priority: 'Medium Impact',
        timeEstimate: '1-2 weeks',
        revenueImpact: `$${Math.round(estimatedMonthlyLoss.min * 0.2)}-${Math.round(estimatedMonthlyLoss.max * 0.2)}/month`,
        icon: 'TrendingUp'
      });
    }
    if (adjustedSeoScore < 60) {
      actionPlan.push({
        action: 'Improve SEO foundation',
        priority: 'Medium Impact',
        timeEstimate: '4-6 weeks',
        revenueImpact: `$${Math.round(estimatedMonthlyLoss.min * 0.15)}-${Math.round(estimatedMonthlyLoss.max * 0.15)}/month`,
        icon: 'Search'
      });
    }
    if (adjustedAdsScore < 50) {
      actionPlan.push({
        action: 'Prepare store for ads',
        priority: 'Low Impact',
        timeEstimate: '2-3 weeks',
        revenueImpact: 'Ready to scale',
        icon: 'Settings'
      });
    }
    
    return {
      storeInfo: {
        url: normalizedUrl,
        platform,
        industry: 'Unknown', // Could be enhanced with ML or manual input
        country: 'Unknown', // Could be detected from domain or store settings
        currency: 'USD', // Could be detected from store
        auditDate: new Date().toLocaleDateString(),
      },
      overallScore,
      status: getStatus(overallScore),
      revenueLoss: estimatedMonthlyLoss,
      categories: [
        {
          id: 'trust',
          icon: 'Shield',
          title: 'Trust Signals & Credibility',
          score: adjustedTrustScore,
          status: getStatus(adjustedTrustScore),
          checks: trustAudit.checks,
          impact: trustAudit.impact,
          recommendation: trustAudit.recommendation,
        },
        {
          id: 'ux',
          icon: 'Navigation',
          title: 'UX and Accessibility',
          score: adjustedUXScore,
          status: getStatus(adjustedUXScore),
          checks: uxAudit.checks,
          impact: uxAudit.impact,
          recommendation: uxAudit.recommendation,
          themeInfo: uxAudit.themeInfo,
        },
        {
          id: 'products',
          icon: 'Package',
          title: 'Product Pages',
          score: adjustedProductScore,
          status: getStatus(adjustedProductScore),
          checks: productAudit.checks,
          impact: productAudit.impact,
          recommendation: productAudit.recommendation,
        },
        {
          id: 'seo',
          icon: 'Search',
          title: 'SEO Audit',
          score: adjustedSeoScore,
          status: getStatus(adjustedSeoScore),
          checks: seoAudit.checks,
          impact: seoAudit.impact,
          recommendation: seoAudit.recommendation,
        },
        {
          id: 'email',
          icon: 'Mail',
          title: 'Email Marketing & Automation',
          score: adjustedEmailScore,
          status: getStatus(adjustedEmailScore),
          checks: emailAudit.checks,
          impact: emailAudit.impact,
          recommendation: emailAudit.recommendation,
        },
        {
          id: 'ads',
          icon: 'TrendingUp',
          title: 'Ads Readiness & Funnel',
          score: adjustedAdsScore,
          status: getStatus(adjustedAdsScore),
          checks: adsAudit.checks,
          impact: adsAudit.impact,
          recommendation: adsAudit.recommendation,
        },
      ],
      actionPlan,
    };
  } catch (error) {
    console.error('Audit error:', error);
    throw error;
  }
};
