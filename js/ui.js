/**
 * Portfolio — functional UI (no animation library).
 * Loads on every page view; must work even if the animation layer fails.
 */

function initializeHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                e.preventDefault();
                window.scrollTo({ top: targetSection.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });

    const heroArrow = document.querySelector('.hero-arrow');
    if (heroArrow) {
        heroArrow.addEventListener('click', function () {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                window.scrollTo({ top: aboutSection.offsetTop - 80, behavior: 'smooth' });
            }
        });
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
}

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
        Object.values(fields).forEach(field => field && field.classList.remove('invalid'));
        if (message && errorElement) {
            errorElement.textContent = message;
            errorElement.hidden = false;
            invalidFields.forEach(field => field && field.classList.add('invalid'));
            if (invalidFields[0]) invalidFields[0].focus();
        } else if (errorElement) {
            errorElement.hidden = true;
        }
    }

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = fields.name ? fields.name.value.trim() : '';
        const email = fields.email ? fields.email.value.trim() : '';
        const message = fields.message ? fields.message.value.trim() : '';

        const empty = [fields.name, fields.email, fields.message].filter(f => f && !f.value.trim());
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

export function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const toastContent = toast.querySelector('.toast-content');

    if (type === 'success') {
        toastContent.innerHTML = `
            <div class="toast-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
            </div>
            <div><h4>Sucesso!</h4><p>${message}</p></div>`;
    } else if (type === 'error') {
        toastContent.innerHTML = `
            <div class="toast-icon" style="color: var(--color-destructive);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            </div>
            <div><h4>Erro!</h4><p>${message}</p></div>`;
    }

    toast.classList.add('show'); // CSS transition on .toast handles the slide-in/out
    setTimeout(() => toast.classList.remove('show'), 4000);
}

function updateCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) yearElement.textContent = new Date().getFullYear();
}

function initializeMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    if (!navMenu || !navToggle) return;

    navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        const isOpen = navMenu.classList.contains('active');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
        if (isOpen) {
            setTimeout(() => navMenu.classList.add('show'), 10);
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

    navMenu.querySelectorAll('.nav-link, .nav-button').forEach(link =>
        link.addEventListener('click', closeMenu));
    document.addEventListener('click', function (e) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) closeMenu();
    });
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const toast = document.getElementById('toast');
        if (toast && toast.classList.contains('show')) toast.classList.remove('show');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    initializeHeader();
    initializeSmoothScrolling();
    initializeContactForm();
    updateCurrentYear();
    initializeMobileMenu();
});
