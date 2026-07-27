/**
 * XPREZ - Official Newsletter of ACGCET
 * Main JavaScript File
 * Version: 1.0.0
 *
 * Modules:
 *  1. Navbar (sticky, mobile toggle, active state)
 *  2. Back-to-Top Button
 *  3. Scroll Reveal Animations
 *  4. Filter Pills (Articles & Gallery)
 *  5. Search (client-side, ready for backend hook)
 *  6. Lightbox (Gallery)
 *  7. Contact Form Handler
 *  8. Smooth Scrolling
 *  9. Utility Helpers
 * 10. Initialization
 */

/* ============================================================
   UTILITY HELPERS
   ============================================================ */

/**
 * DOM selector shorthand
 * @param {string} selector
 * @param {Element} [ctx=document]
 */
const $ = (selector, ctx = document) => ctx.querySelector(selector);
const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

/**
 * Debounce utility
 */
function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Get current page name from URL
 */
function getCurrentPage() {
  const path = window.location.pathname;
  const file = path.split('/').pop() || 'index.html';
  return file;
}


/* ============================================================
   MODULE 1: NAVBAR
   ============================================================ */
const NavbarModule = (() => {

  const navbar = $('.navbar');
  const toggle = $('.navbar__toggle');
  const mobileMenu = $('.navbar__mobile');

  /**
   * Apply scroll effect to navbar
   */
  function handleScroll() {
    if (!navbar) return;
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  /**
   * Toggle mobile menu open/closed
   */
  function toggleMobile() {
    const isOpen = toggle.classList.contains('open');
    toggle.classList.toggle('open');
    mobileMenu.classList.toggle('open');

    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? '' : 'hidden';

    // Accessibility
    toggle.setAttribute('aria-expanded', !isOpen);
    mobileMenu.setAttribute('aria-hidden', isOpen);
  }

  /**
   * Close mobile menu
   */
  function closeMobile() {
    toggle?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    document.body.style.overflow = '';
    toggle?.setAttribute('aria-expanded', 'false');
    mobileMenu?.setAttribute('aria-hidden', 'true');
  }

  /**
   * Set active navigation link based on current page
   */
  function setActiveLinks() {
    const page = getCurrentPage();
    const allLinks = $$('.nav-link');

    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.remove('active');

      if (
        (page === 'index.html' || page === '') && (href === 'index.html' || href === './') ||
        page !== 'index.html' && href && href.includes(page)
      ) {
        link.classList.add('active');
      }
    });
  }

  function init() {
    if (!navbar) return;

    // Scroll handler
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Mobile toggle
    toggle?.addEventListener('click', toggleMobile);

    // Close mobile menu when a link is clicked
    $$('.navbar__mobile .nav-link').forEach(link => {
      link.addEventListener('click', closeMobile);
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (
        mobileMenu?.classList.contains('open') &&
        !navbar.contains(e.target)
      ) {
        closeMobile();
      }
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobile();
    });

    // Set active state
    setActiveLinks();
  }

  return { init };
})();


/* ============================================================
   MODULE 2: BACK TO TOP
   ============================================================ */
const BackToTopModule = (() => {

  const btn = $('.back-to-top');

  function handleScroll() {
    if (!btn) return;
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function init() {
    if (!btn) return;
    window.addEventListener('scroll', handleScroll, { passive: true });
    btn.addEventListener('click', scrollToTop);
    handleScroll();
  }

  return { init };
})();


/* ============================================================
   MODULE 3: SCROLL REVEAL ANIMATIONS
   ============================================================ */
const RevealModule = (() => {

  const THRESHOLD = 0.12;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, {
    threshold: THRESHOLD,
    rootMargin: '0px 0px -40px 0px'
  });

  function init() {
    const targets = $$('.reveal, .reveal-left, .reveal-right, .stagger-children');
    targets.forEach(el => observer.observe(el));
  }

  return { init };
})();


/* ============================================================
   MODULE 4: FILTER PILLS
   ============================================================ */
const FilterModule = (() => {

  /**
   * Initialize category filter pills
   * @param {string} pillsSelector - CSS selector for pill elements
   * @param {string} itemsSelector - CSS selector for filterable items
   * @param {string} dataAttr - data attribute to match against pill value
   */
  function initFilter(pillsSelector, itemsSelector, dataAttr = 'data-category') {
    const pills = $$(pillsSelector);
    const items = $$(itemsSelector);

    if (!pills.length || !items.length) return;

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        // Update active pill
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filter = pill.dataset.filter;

        items.forEach(item => {
          if (filter === 'all' || item.getAttribute(dataAttr) === filter) {
            item.style.display = '';
            // Re-trigger reveal animation if needed
            setTimeout(() => item.classList.add('visible'), 50);
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  function init() {
    // Articles page category filter
    initFilter('.filter-pill[data-filter]', '.article-card', 'data-category');

    // Gallery page category filter
    initFilter('.gallery-filter .filter-pill[data-filter]', '.gallery-full-item', 'data-category');
  }

  return { init };
})();


/* ============================================================
   MODULE 5: SEARCH
   ============================================================ */
const SearchModule = (() => {

  /**
   * Client-side search implementation.
   * Future: Replace with API call to backend search endpoint.
   * Backend hook: POST /api/search?q={query}&page={page}
   */
  function initArticleSearch() {
    const searchInput = $('#articleSearch');
    const articleCards = $$('.article-card');

    if (!searchInput) return;

    const handleSearch = debounce((e) => {
      const query = e.target.value.toLowerCase().trim();

      articleCards.forEach(card => {
        const title = card.querySelector('.article-card__title')?.textContent.toLowerCase() || '';
        const excerpt = card.querySelector('.article-card__excerpt')?.textContent.toLowerCase() || '';
        const category = card.querySelector('.article-card__category')?.textContent.toLowerCase() || '';
        const author = card.querySelector('.author-info__name')?.textContent.toLowerCase() || '';

        const matches = !query ||
          title.includes(query) ||
          excerpt.includes(query) ||
          category.includes(query) ||
          author.includes(query);

        card.style.display = matches ? '' : 'none';
      });
    }, 250);

    searchInput.addEventListener('input', handleSearch);
  }

  function init() {
    initArticleSearch();
  }

  return { init };
})();


/* ============================================================
   MODULE 6: LIGHTBOX
   ============================================================ */
const LightboxModule = (() => {

  let lightbox;
  let lightboxImg;
  let lightboxClose;

  function open(src, alt = '') {
    if (!lightbox) return;

    if (lightboxImg) {
      lightboxImg.src = src;
      lightboxImg.alt = alt;
    }

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox?.classList.remove('open');
    document.body.style.overflow = '';

    // Clear src after transition to avoid flash
    setTimeout(() => {
      if (lightboxImg) lightboxImg.src = '';
    }, 300);
  }

  function init() {
    lightbox = $('#lightbox');
    lightboxImg = $('#lightboxImg');
    lightboxClose = $('#lightboxClose');

    if (!lightbox) return;

    // Close on button click
    lightboxClose?.addEventListener('click', close);

    // Close on backdrop click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // Attach to gallery items
    $$('.gallery-full-item, .gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const src = item.dataset.src || '';
        const alt = item.dataset.alt || 'Gallery Image';

        if (src) {
          open(src, alt);
        } else {
          // Placeholder behavior - show a placeholder message
          // Future: Real image src will come from data-src attribute
          console.info('Lightbox: No image src provided for this item (placeholder state)');
        }
      });
    });
  }

  return { init, open, close };
})();


/* ============================================================
   MODULE 7: CONTACT FORM HANDLER
   ============================================================ */
const ContactFormModule = (() => {

  /**
   * Basic client-side validation
   */
  function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.required;

    if (required && !value) return false;
    if (type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;

    return true;
  }

  function showFieldError(field, message) {
    field.style.borderColor = 'var(--color-accent)';
    let hint = field.parentNode.querySelector('.form-error');
    if (!hint) {
      hint = document.createElement('span');
      hint.className = 'form-error';
      hint.style.cssText = 'font-size:0.75rem;color:var(--color-accent);margin-top:4px;display:block;';
      field.parentNode.appendChild(hint);
    }
    hint.textContent = message;
  }

  function clearFieldError(field) {
    field.style.borderColor = '';
    const hint = field.parentNode.querySelector('.form-error');
    if (hint) hint.remove();
  }

  function showSuccess(form) {
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
      background: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
      padding: 1rem 1.25rem;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    `;
    successMsg.innerHTML = '✓ &nbsp; Your message has been sent! We\'ll get back to you soon.';
    form.appendChild(successMsg);

    setTimeout(() => successMsg.remove(), 6000);
  }

  function init() {
    const form = $('#contactForm');
    if (!form) return;

    // Live validation
    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('blur', () => {
        if (!validateField(field)) {
          let msg = 'This field is required.';
          if (field.type === 'email') msg = 'Please enter a valid email address.';
          showFieldError(field, msg);
        } else {
          clearFieldError(field);
        }
      });

      field.addEventListener('input', () => clearFieldError(field));
    });

    // Form submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (!validateField(field)) {
          let msg = 'This field is required.';
          if (field.type === 'email') msg = 'Please enter a valid email address.';
          showFieldError(field, msg);
          valid = false;
        }
      });

      if (!valid) return;

      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      // Future: Replace with actual API call
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(Object.fromEntries(new FormData(form)))
      // });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      showSuccess(form);
    });
  }

  return { init };
})();


/* ============================================================
   MODULE 8: SMOOTH SCROLLING (for hash links)
   ============================================================ */
const SmoothScrollModule = (() => {

  function init() {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.getElementById(link.getAttribute('href').slice(1));
        if (!target) return;

        e.preventDefault();
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  return { init };
})();


/* ============================================================
   MODULE 9: READING TIME ESTIMATOR
   ============================================================ */
const ReadingTimeModule = (() => {

  const WORDS_PER_MINUTE = 200;

  function calculate() {
    const content = $('.article-content');
    const display = $('.reading-time-value');

    if (!content || !display) return;

    const wordCount = content.innerText.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

    display.textContent = `${minutes} min read`;
  }

  return { init: calculate };
})();


/* ============================================================
   MODULE 10: SOCIAL SHARE
   ============================================================ */
const SocialShareModule = (() => {

  const shareHandlers = {
    twitter: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,

    facebook: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,

    linkedin: (url, title) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,

    whatsapp: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
  };

  function init() {
    $$('.social-share__btn[data-platform]').forEach(btn => {
      btn.addEventListener('click', () => {
        const platform = btn.dataset.platform;
        const url = window.location.href;
        const title = document.title;

        const shareUrl = shareHandlers[platform]?.(url, title);
        if (shareUrl) {
          window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
        }
      });
    });
  }

  return { init };
})();


/* ============================================================
   MODULE 11: HEADER ACTIVE NAV HIGHLIGHT ON SCROLL
   (for single-page anchor scrolling if needed)
   ============================================================ */
const ScrollSpyModule = (() => {

  function init() {
    const sections = $$('section[id]');
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          $$('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(s => observer.observe(s));
  }

  return { init };
})();


/* ============================================================
   APP INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // Core modules - always run
  NavbarModule.init();
  BackToTopModule.init();
  RevealModule.init();
  SmoothScrollModule.init();

  // Page-specific modules
  const page = getCurrentPage();

  if (page === 'articles.html') {
    FilterModule.init();
    SearchModule.init();
  }

  if (page === 'gallery.html') {
    FilterModule.init();
    LightboxModule.init();
  }

  if (page === 'contact.html') {
    ContactFormModule.init();
  }

  if (page === 'article-template.html') {
    ReadingTimeModule.init();
    SocialShareModule.init();
  }

  // Log init (development only - remove in production)
  console.info(`%cXPREZ Website%c v1.0.0 — initialized on ${page}`,
    'color:#d4a843;font-weight:bold;font-size:14px;',
    'color:#aaa;font-size:12px;'
  );
});


/* ============================================================
   FUTURE EXPANSION HOOKS
   ============================================================

   The following namespaces are reserved for future modules:

   window.XPREZ = {
     auth: {}, // Student login, admin dashboard
     cms: {},  // CMS integration hooks
     api: {
       baseUrl: '/api/v1',
       search: (query) => fetch(`/api/v1/search?q=${query}`),
       articles: (page, category) => fetch(`/api/v1/articles?page=${page}&cat=${category}`),
       contact: (data) => fetch('/api/v1/contact', { method: 'POST', body: JSON.stringify(data) }),
     },
     analytics: {}, // Analytics dashboard
     notifications: {}, // Push notifications
     darkMode: {}, // Dark mode toggle
   };

   ============================================================ */
