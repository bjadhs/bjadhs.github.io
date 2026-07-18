// Mobile Navigation
const navSlide = () => {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links li');

  burger.addEventListener('click', () => {
    nav.classList.toggle('nav-active');
    navLinks.forEach((link, index) => {
      if (link.style.animation) {
        link.style.animation = '';
      } else {
        link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
      }
    });
    burger.classList.toggle('toggle');
  });
};

// Scroll behavior (sticky header + back-to-top)
const scrollFunctions = () => {
  const header = document.querySelector('.site-header');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
      backToTop.classList.add('show');
    } else {
      header.classList.remove('scrolled');
      backToTop.classList.remove('show');
    }
  });

  backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

// Theme
const themeToggle = () => {
  const themeSwitch = document.getElementById('theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');

  if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeSwitch.checked = true;
  }

  themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  });
};

// Format an ISO date to a readable label
const formatDate = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Render the blog card grid
const renderBlogList = () => {
  const grid = document.getElementById('blogGrid');
  const posts = typeof blogPosts !== 'undefined' ? blogPosts : [];

  if (!posts.length) {
    grid.innerHTML = `
      <div class="blog-empty">
        <h2>No posts yet</h2>
        <p>Check back soon — writing is on the way.</p>
      </div>`;
    return;
  }

  // Newest first
  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

  grid.innerHTML = sorted
    .map((post, index) => {
      const href = `./post.html?id=${encodeURIComponent(post.id)}`;
      return `
        <a href="${href}" class="blog-card animate-fade-in-up delay-${Math.min(index + 1, 5)}" style="opacity:1">
          <div class="blog-card-cover">
            <i class="fas ${post.icon || 'fa-pen-nib'}"></i>
            <span class="blog-card-category">${post.category || 'Article'}</span>
          </div>
          <div class="blog-card-body">
            <div class="blog-card-meta">
              <span><i class="fas fa-calendar-day"></i> ${formatDate(post.date)}</span>
              <span><i class="fas fa-clock"></i> ${post.readingTime || ''}</span>
            </div>
            <h2 class="blog-card-title">${post.title}</h2>
            <p class="blog-card-excerpt">${post.excerpt || ''}</p>
            <span class="blog-card-readmore">Read article <i class="fas fa-arrow-right"></i></span>
          </div>
        </a>`;
    })
    .join('');
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  navSlide();
  scrollFunctions();
  themeToggle();
  renderBlogList();

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
