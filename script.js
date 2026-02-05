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
      e.preventDefault();
      const targetId = this.getAttribute('href');
      
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

// Contact Form
const contactForm = () => {
  const form = document.getElementById('contactForm');
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  window.location.protocol === 'file:';

  const API_URL = isLocal 
    ? 'http://localhost:3000/api/contact'
    : 'https://backend-portfolio-ivory-one.vercel.app/api/contact';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      subject: document.getElementById('subject').value.trim(),
      message: document.getElementById('message').value.trim(),
    };

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert('Please fill in all fields.');
      return;
    }

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message || 'Message sent successfully!');
        form.reset();
      } else {
        throw new Error(data.message || 'Failed to send message.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Failed to send. Email me at bijayadhikari107@gmail.com');
    } finally {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
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
  navSlide();
  scrollFunctions();
  contactForm();
  themeToggle();
  initScrollAnimations();
  initProjectSliders();
});
