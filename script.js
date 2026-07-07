// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all functionality
    initializeHeader();
    initializeSmoothScrolling();
    initializeContactForm();
    initializeAnimations();
    updateCurrentYear();
    initializeMobileMenu();
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

// Contact form: builds a mailto link so it works on static hosting (no backend)
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const errorElement = document.getElementById('form-error');
    const fields = {
        name: document.getElementById('form-name'),
        email: document.getElementById('form-email'),
        message: document.getElementById('form-message')
    };

    function setError(message, invalidFields) {
        Object.values(fields).forEach(field => field.classList.remove('invalid'));
        if (message) {
            errorElement.textContent = message;
            errorElement.hidden = false;
            invalidFields.forEach(field => field.classList.add('invalid'));
            invalidFields[0].focus();
        } else {
            errorElement.hidden = true;
        }
    }

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = fields.name.value.trim();
        const email = fields.email.value.trim();
        const message = fields.message.value.trim();

        const empty = [fields.name, fields.email, fields.message].filter(field => !field.value.trim());
        if (empty.length > 0) {
            setError('Preencha todos os campos para enviar a mensagem.', empty);
            return;
        }

        if (!isValidEmail(email)) {
            setError('Insira um endereço de email válido.', [fields.email]);
            return;
        }

        setError(null, []);

        const subject = encodeURIComponent(`Contato pelo portfólio — ${name}`);
        const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
        window.location.href = `mailto:gustavohenrique8282@hotmail.com?subject=${subject}&body=${body}`;

        showToast('Abrindo seu aplicativo de email...', 'success');
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
                <h4>Sucesso!</h4>
                <p>${message}</p>
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
}

// Update current year in footer
function updateCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Initialize mobile menu
function initializeMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');

    if (navMenu && navToggle) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');

            const isOpen = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', String(isOpen));
            navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');

            // Add show class after a small delay for animation
            if (isOpen) {
                setTimeout(() => {
                    navMenu.classList.add('show');
                }, 10);
            } else {
                navMenu.classList.remove('show');
            }
        });

        function closeMenu() {
            navMenu.classList.remove('active', 'show');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Abrir menu');
        }

        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link, .nav-button');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                closeMenu();
            }
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
