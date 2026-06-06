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

// Scroll
const scrollFunctions = () => {
  const header = document.querySelector('header');
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

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (this.hasAttribute('download') || !targetId.startsWith('#')) return;
      e.preventDefault();
      if (targetId === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({ top: targetElement.offsetTop - 80, behavior: 'smooth' });
      }
    });
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

// Parse ?id= from URL
const getProjectId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
};

// Build project detail HTML
const renderProject = () => {
  const container = document.getElementById('projectContent');
  const projectId = getProjectId();

  if (!projectId) {
    container.innerHTML = `
      <div class="detail-not-found">
        <h2>Project Not Found</h2>
        <p>No project ID was specified. Please go back to the projects list.</p>
        <a href="./index.html#projects" class="btn">Back to Projects</a>
      </div>`;
    return;
  }

  try {
    const projects = typeof projectsData !== 'undefined' ? projectsData : [];
    const project = projects.find(p => p.id === projectId);

    if (!project) {
      container.innerHTML = `
        <div class="detail-not-found">
          <h2>Project Not Found</h2>
          <p>The project "${projectId}" could not be found.</p>
          <a href="./index.html#projects" class="btn">Back to Projects</a>
        </div>`;
      return;
    }

    // Build tags
    const tagsHtml = project.techStack
      .map(tag => `<span class="tag">${tag}</span>`)
      .join('');

    // Build description paragraphs (split on double newline)
    const descriptionParagraphs = project.fullDescription
      .split('\n\n')
      .filter(p => p.trim())
      .map(p => `<p>${p.replace(/\n/g, ' ')}</p>`)
      .join('');

    // Build gallery images (skip first as hero)
    const galleryImages = project.images.slice(1);
    const galleryHtml = galleryImages.length
      ? `<div class="detail-gallery">
           ${galleryImages.map(img => `<img src="${img}" alt="${project.title} screenshot" loading="lazy">`).join('')}
         </div>`
      : '';

    // Build action buttons
    const viewBtn = project.projectUrl
      ? `<a href="${project.projectUrl}" target="_blank" rel="noopener noreferrer" class="btn"><i class="fas fa-external-link-alt"></i> View Live Site</a>`
      : '';
    const githubBtn = project.githubUrl
      ? `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline"><i class="fab fa-github"></i> View Code</a>`
      : '';

    container.innerHTML = `
      <div class="detail-hero-image">
        <img src="${project.images[0]}" alt="${project.title}">
      </div>

      <div class="detail-content">
        <h1>${project.title}</h1>
        <div class="project-tags detail-tags">
          ${tagsHtml}
        </div>
        <div class="detail-description">
          ${descriptionParagraphs}
        </div>
      </div>

      ${galleryHtml}

      <div class="detail-actions">
        ${viewBtn}
        ${githubBtn}
        <a href="./index.html#projects" class="btn btn-outline">Back to Projects</a>
      </div>
    `;

    // Page title
    document.title = `${project.title} | Bijaya Adhikari`;

    // Animate in
    requestAnimationFrame(() => {
      container.classList.add('animate-fade-in-up');
    });

  } catch (error) {
    console.error('Error loading project:', error);
    container.innerHTML = `
      <div class="detail-not-found">
        <h2>Something Went Wrong</h2>
        <p>Could not load project data. Please try again later.</p>
        <a href="./index.html#projects" class="btn">Back to Projects</a>
      </div>`;
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  navSlide();
  scrollFunctions();
  themeToggle();
  renderProject();

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
