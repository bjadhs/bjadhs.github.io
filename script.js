// Toast Notification System
const Toast = {
  container: null,
  
  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },
  
  show(message, type = 'info', duration = 5000) {
    if (!this.container) this.init();
    
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close">&times;</button>
    `;
    
    this.container.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.dismiss(toast));
    
    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }
    
    return toast;
  },
  
  dismiss(toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  },
  
  success(message, duration) {
    return this.show(message, 'success', duration);
  },
  
  error(message, duration) {
    return this.show(message, 'error', duration);
  },
  
  info(message, duration) {
    return this.show(message, 'info', duration);
  }
};

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

// Scroll Functions
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
      
      // Skip if it's a download link or external URL
      if (this.hasAttribute('download') || !targetId.startsWith('#')) {
        return;
      }
      
      e.preventDefault();
      
      if (targetId === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });

        const nav = document.querySelector('.nav-links');
        const burger = document.querySelector('.burger');
        if (nav.classList.contains('nav-active')) {
          nav.classList.remove('nav-active');
          burger.classList.remove('toggle');
          document.querySelectorAll('.nav-links li').forEach(link => {
            link.style.animation = '';
          });
        }
      }
    });
  });

  backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

// Contact Form with Validation and Toast Notifications
const contactForm = () => {
  const form = document.getElementById('contactForm');
  if (!form) return;
  
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  window.location.protocol === 'file:';

  const API_BASE_URL = isLocal 
    ? 'http://localhost:3008'
    : 'https://backend-portfolio-ivory-one.vercel.app';
  
  const API_URL = `${API_BASE_URL}/api/contact`;
  
  // Update resume download link
  const resumeLink = document.querySelector('a[download]');
  if (resumeLink) {
    resumeLink.href = `${API_BASE_URL}/api/resume`;
  }

  // Real-time validation
  const validateField = (input) => {
    const value = input.value.trim();
    const fieldName = input.id;
    let isValid = true;
    let errorMessage = '';

    // Remove existing error state
    input.classList.remove('error');
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();

    switch (fieldName) {
      case 'name':
        if (value.length < 2) {
          isValid = false;
          errorMessage = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          isValid = false;
          errorMessage = 'Name can only contain letters, spaces, hyphens and apostrophes';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address';
        }
        break;
      case 'subject':
        if (value.length < 3) {
          isValid = false;
          errorMessage = 'Subject must be at least 3 characters';
        }
        break;
      case 'message':
        if (value.length < 10) {
          isValid = false;
          errorMessage = 'Message must be at least 10 characters';
        }
        break;
    }

    if (!isValid) {
      input.classList.add('error');
      const errorEl = document.createElement('span');
      errorEl.className = 'error-message show';
      errorEl.textContent = errorMessage;
      input.parentElement.appendChild(errorEl);
    }

    return isValid;
  };

  // Add blur validation to all inputs
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        validateField(input);
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    const inputs = form.querySelectorAll('input, textarea');
    let allValid = true;
    inputs.forEach(input => {
      if (!validateField(input)) allValid = false;
    });

    if (!allValid) {
      Toast.error('Please fix the errors in the form', 5000);
      return;
    }

    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      subject: document.getElementById('subject').value.trim(),
      message: document.getElementById('message').value.trim(),
    };

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn-loading-text">Sending...</span>';
    submitBtn.classList.add('btn-loading');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Toast.success(data.message || 'Message sent successfully!', 5000);
        form.reset();
        // Clear any error states
        inputs.forEach(input => input.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => el.remove());
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          // Show field-specific errors
          data.errors.forEach(err => {
            const input = document.getElementById(err.field);
            if (input) {
              input.classList.add('error');
              const errorEl = document.createElement('span');
              errorEl.className = 'error-message show';
              errorEl.textContent = err.message;
              input.parentElement.appendChild(errorEl);
            }
          });
          throw new Error('Please fix the validation errors');
        }
        throw new Error(data.message || 'Failed to send message.');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.message.includes('Failed to fetch')) {
        Toast.error('Network error. Please check your connection and try again.', 5000);
      } else if (error.message.includes('rate limit') || error.message.includes('Too many')) {
        Toast.error('Too many attempts. Please try again later.', 5000);
      } else {
        Toast.error(error.message || 'Failed to send. Please try again.', 5000);
      }
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      submitBtn.classList.remove('btn-loading');
    }
  });
};

// Theme Toggle
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

// Scroll Animations
const initScrollAnimations = () => {
  setTimeout(() => {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) heroContent.classList.add('animate-fade-in-up');
  }, 300);

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('about-text-top')) {
          entry.target.classList.add('animate-fade-in-up');
        } else if (entry.target.classList.contains('about-text-bottom')) {
          setTimeout(() => entry.target.classList.add('animate-fade-in-up'), 200);
        } else if (entry.target.classList.contains('about-image')) {
          entry.target.classList.add('animate-fade-in');
        } else if (entry.target.classList.contains('project-card')) {
          const cards = document.querySelectorAll('.project-card');
          const cardIndex = Array.from(cards).indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('animate-fade-in-up'), cardIndex * 150);
        } else if (entry.target.classList.contains('contact-info')) {
          entry.target.classList.add('animate-fade-in-left');
        } else if (entry.target.classList.contains('contact-form')) {
          entry.target.classList.add('animate-fade-in-right');
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const elementsToObserve = [
    '.about-text-top', '.about-text-bottom', '.about-image',
    '.project-card', '.contact-info', '.contact-form'
  ];

  elementsToObserve.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => observer.observe(el));
  });
};

// Project Image Slider
const initProjectSliders = () => {
  const sliders = document.querySelectorAll('.slider-wrapper');

  sliders.forEach(slider => {
    const images = slider.querySelectorAll('img');
    if (images.length <= 1) return;

    let currentIndex = 0;
    setInterval(() => {
      images[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % images.length;
      images[currentIndex].classList.add('active');
    }, 3000);
  });
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  navSlide();
  scrollFunctions();
  contactForm();
  themeToggle();
  initScrollAnimations();
  initProjectSliders();
});
