// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all functionality
    initializeHeader();
    initializeSmoothScrolling();
    initializeContactForm();
    initializeAnimations();
    updateCurrentYear();
});

// Header scroll effect
function initializeHeader() {
    const header = document.getElementById('header');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Smooth scrolling for navigation links
function initializeSmoothScrolling() {
    // Navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed header

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Hero arrow click
    const heroArrow = document.querySelector('.hero-arrow');
    if (heroArrow) {
        heroArrow.addEventListener('click', function () {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                const offsetTop = aboutSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// Contact form handling
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');

            // Basic validation
            if (!name || !email || !message) {
                showToast('Por favor, preencha todos os campos!', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showToast('Por favor, insira um email válido!', 'error');
                return;
            }

            // Simulate form submission
            submitContactForm(name, email, message);
        });
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Simulate contact form submission
function submitContactForm(name, email, message) {
    // Show loading state (you could add a loading spinner here)
    const submitButton = document.querySelector('#contact-form button[type="submit"]');
    const originalText = submitButton.innerHTML;

    submitButton.innerHTML = `
        <svg class="btn-icon animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        Enviando...
    `;
    submitButton.disabled = true;

    // Simulate API call delay
    setTimeout(() => {
        // Reset form
        document.getElementById('contact-form').reset();

        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;

        // Show success message
        showToast('Mensagem enviada!', 'success');

        // In a real application, you would send the data to your server here
        console.log('Contact form submitted:', { name, email, message });
    }, 1500);
}

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastContent = toast.querySelector('.toast-content');

    // Update toast content based on type
    if (type === 'success') {
        toastContent.innerHTML = `
            <div class="toast-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
            </div>
            <div>
                <h4>Mensagem enviada!</h4>
                <p>Obrigado pelo contato. Responderei em breve!</p>
            </div>
        `;
    } else if (type === 'error') {
        toastContent.innerHTML = `
            <div class="toast-icon" style="color: var(--color-destructive);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            </div>
            <div>
                <h4>Erro!</h4>
                <p>${message}</p>
            </div>
        `;
    }

    // Show toast
    toast.classList.add('show');

    // Hide toast after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Initialize animations and effects
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.specialty-card, .skill-category, .project-card');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Parallax effect for hero particles
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const particles = document.querySelectorAll('.particle');

        particles.forEach((particle, index) => {
            const speed = 0.5 + (index * 0.1);
            particle.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Update current year in footer
function updateCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Download CV functionality
document.addEventListener('DOMContentLoaded', function () {
    const downloadButton = document.getElementById('download-cv');

    if (downloadButton) {
        downloadButton.addEventListener('click', function (e) {
            e.preventDefault();

            // You can replace this with actual CV download logic
            showToast('CV será baixado em breve!', 'success');

            // Example: Create a download link for your CV
            // const link = document.createElement('a');
            // link.href = 'path/to/your/cv.pdf';
            // link.download = 'CV-FullStack-Developer.pdf';
            // link.click();
        });
    }
});

// Mobile menu toggle (if you want to add mobile menu later)
function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');

    if (navMenu && navToggle) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// Keyboard accessibility
document.addEventListener('keydown', function (e) {
    // Close toast with Escape key
    if (e.key === 'Escape') {
        const toast = document.getElementById('toast');
        if (toast && toast.classList.contains('show')) {
            toast.classList.remove('show');
        }
    }
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll-heavy functions
window.addEventListener('scroll', debounce(() => {
    // Any scroll-intensive operations can go here
}, 10));

// Preload important images
function preloadImages() {
    // Add any important images you want to preload
    const imageUrls = [
        // 'path/to/your/image1.jpg',
        // 'path/to/your/image2.jpg'
    ];

    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Initialize preloading
document.addEventListener('DOMContentLoaded', preloadImages);
