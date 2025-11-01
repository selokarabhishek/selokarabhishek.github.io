// ==================== THEME TOGGLE ====================
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Check for saved theme preference or default to dark mode
const currentTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', currentTheme);

// Update icon based on current theme
function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if (html.getAttribute('data-theme') === 'light') {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

// Initialize icon
updateThemeIcon();

// Toggle theme
themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();

    // Add rotation animation on click
    themeToggle.style.transform = 'rotate(360deg) scale(1.1)';
    setTimeout(() => {
        themeToggle.style.transform = '';
    }, 300);
});

// ==================== NAVIGATION ====================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Sticky navbar on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// ==================== TYPING ANIMATION ====================
const typedTextSpan = document.querySelector('.typed-text');
const cursorSpan = document.querySelector('.cursor');

const textArray = [
    'Data Scientist',
    'Problem Solver'
];

const typingDelay = 100;
const erasingDelay = 50;
const newTextDelay = 2000;
let textArrayIndex = 0;
let charIndex = 0;

function type() {
    if (charIndex < textArray[textArrayIndex].length) {
        typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
        charIndex++;
        setTimeout(type, typingDelay);
    } else {
        setTimeout(erase, newTextDelay);
    }
}

function erase() {
    if (charIndex > 0) {
        typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, erasingDelay);
    } else {
        textArrayIndex++;
        if (textArrayIndex >= textArray.length) textArrayIndex = 0;
        setTimeout(type, typingDelay + 1100);
    }
}

// Start typing animation when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(type, newTextDelay + 250);
});

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== SCROLL ANIMATIONS ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections and cards
const elementsToAnimate = document.querySelectorAll(
    '.about-card, .skill-category, .project-card, .stat, .contact-item'
);

elementsToAnimate.forEach(el => observer.observe(el));

// ==================== CONTACT FORM ====================
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    // Here you would typically send the form data to a backend
    // For now, we'll just show a success message
    alert(`Thanks for reaching out, ${formData.name}! I'll get back to you soon.`);

    // Reset form
    contactForm.reset();

    // In a real implementation, you might use:
    // - EmailJS for client-side email sending
    // - A backend API endpoint
    // - A form handling service like Formspree
});

// ==================== SCROLL TO TOP ====================
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

// Show scroll-to-top button when scrolled down
let scrollTopBtn = null;

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        if (!scrollTopBtn) {
            scrollTopBtn = document.createElement('button');
            scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            scrollTopBtn.className = 'scroll-to-top';
            scrollTopBtn.onclick = scrollToTop;
            document.body.appendChild(scrollTopBtn);

            // Add styles for the button
            const style = document.createElement('style');
            style.innerHTML = `
                .scroll-to-top {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-size: 1.25rem;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease;
                    z-index: 999;
                    animation: fadeInUp 0.3s ease;
                }

                .scroll-to-top:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        scrollTopBtn.style.display = 'block';
    } else {
        if (scrollTopBtn) {
            scrollTopBtn.style.display = 'none';
        }
    }
});

// ==================== PARTICLES EFFECT ====================
const createParticle = () => {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(99, 102, 241, 0.6);
        border-radius: 50%;
        pointer-events: none;
        animation: particleFloat 3s ease-in-out infinite;
    `;

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes particleFloat {
            0%, 100% {
                transform: translateY(0) translateX(0);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100px) translateX(${Math.random() * 100 - 50}px);
                opacity: 0;
            }
        }
    `;
    if (!document.querySelector('style[data-particle-style]')) {
        style.setAttribute('data-particle-style', 'true');
        document.head.appendChild(style);
    }

    return particle;
};

// Add some interactive particles on mouse move in hero section
const hero = document.querySelector('.hero');
let particleTimeout;

hero.addEventListener('mousemove', (e) => {
    clearTimeout(particleTimeout);
    particleTimeout = setTimeout(() => {
        if (Math.random() > 0.8) {
            const particle = createParticle();
            particle.style.left = e.clientX + 'px';
            particle.style.top = e.clientY + 'px';
            hero.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 3000);
        }
    }, 50);
});

// ==================== PRELOADER ====================
window.addEventListener('load', () => {
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = `
        <div class="loader">
            <div class="spinner"></div>
        </div>
    `;

    const style = document.createElement('style');
    style.innerHTML = `
        .preloader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #020617;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            transition: opacity 0.5s ease;
        }

        .preloader.fade-out {
            opacity: 0;
            pointer-events: none;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(99, 102, 241, 0.1);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Remove preloader after page loads
    setTimeout(() => {
        if (document.querySelector('.preloader')) {
            document.querySelector('.preloader').classList.add('fade-out');
            setTimeout(() => {
                document.querySelector('.preloader')?.remove();
            }, 500);
        }
    }, 1000);
});

// ==================== COUNTER ANIMATION ====================
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + (element.textContent.includes('+') ? '+' : '%');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + (element.textContent.includes('+') ? '+' : '%');
        }
    }, 16);
};

// Animate stats when they come into view
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statValue = entry.target.querySelector('h4');
            const value = parseInt(statValue.textContent);
            animateCounter(statValue, value);
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(stat => {
    statObserver.observe(stat);
});

// ==================== PROJECT LINKS ====================
// Update project links to point to actual GitHub repos if available
document.querySelectorAll('.project-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Project link will be added soon! Check out my GitHub for more projects.');
        // In the future, update these links to point to actual project pages
    });
});

console.log('%c👋 Welcome to my portfolio!', 'color: #6366f1; font-size: 20px; font-weight: bold;');
console.log('%c🚀 Built with passion by Abhishek Selokar', 'color: #8b5cf6; font-size: 14px;');
console.log('%c✨ Crafted by Claude - The Legendary AI Assistant', 'color: #ec4899; font-size: 12px;');
