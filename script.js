// Mobile Navigation
    const navSlide = () => {
      const burger = document.querySelector('.burger');
      const nav = document.querySelector('.nav-links');
      const navLinks = document.querySelectorAll('.nav-links li');
      
      burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');
        
        // Animate Links
        navLinks.forEach((link, index) => {
          if (link.style.animation) {
            link.style.animation = '';
          } else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
          }
        });
        
        // Burger Animation
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
      
      // Smooth scroll for anchor links
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          e.preventDefault();
          
          const targetId = this.getAttribute('href');
          if (targetId === '#') {
            // Scroll to top when href is "#"
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
            return;
          }
          
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            window.scrollTo({
              top: targetElement.offsetTop - 80,
              behavior: 'smooth'
            });
            
            // Close mobile menu if open
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

      // Add click event for backToTop button as well
      backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    };

    // Contact Form
    const contactForm = () => {
      const form = document.getElementById('contactForm');
      
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Here you would normally send the form data to a server
        alert('Thank you for your message! I will get back to you soon.');
        form.reset();
      });
    };

    // Theme Toggle
    const themeToggle = () => {
      const themeSwitch = document.getElementById('theme-toggle');
      const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Check for saved theme preference or use browser preference
      const currentTheme = localStorage.getItem('theme') || 
                          (prefersDarkScheme.matches ? 'dark' : 'light');
      
      // Set initial theme
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

    // GSAP Animations
    const initGSAPAnimations = () => {
      // Hero Section Animation
      gsap.to('.hero-content', {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.5
      });
      
      // About Section Animation
      gsap.registerPlugin(ScrollTrigger);
      
      gsap.to('.about-text', {
        scrollTrigger: {
          trigger: '.about-text',
          start: 'top 80%'
        },
        opacity: 1,
        x: 0,
        duration: 0.8
      });
      
      gsap.to('.about-image', {
        scrollTrigger: {
          trigger: '.about-image',
          start: 'top 80%'
        },
        opacity: 1,
        x: 0,
        duration: 0.8
      });
      
      // Skills Cards Animation
      gsap.utils.toArray('.skill-card').forEach((card, i) => {
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%'
          },
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: i * 0.2
        });
      });
      
      // Projects Cards Animation
      gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%'
          },
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: i * 0.2
        });
      });
      
      // Contact Section Animation
      gsap.to('.contact-info', {
        scrollTrigger: {
          trigger: '.contact-info',
          start: 'top 80%'
        },
        opacity: 1,
        x: 0,
        duration: 0.8
      });
      
      gsap.to('.contact-form', {
        scrollTrigger: {
          trigger: '.contact-form',
          start: 'top 80%'
        },
        opacity: 1,
        x: 0,
        duration: 0.8
      });
    };

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      navSlide();
      scrollFunctions();
      contactForm();
      themeToggle();
      initGSAPAnimations();
    });