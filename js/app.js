// ========================================
// CV Portfolio - Advanced Animations & Effects
// ========================================

(function () {
    'use strict';

    // ========================================
    // 1. PAGE LOADER
    // ========================================
    function initPageLoader() {
        const loader = document.querySelector('.page-loader');
        if (!loader) return;

        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.classList.remove('loading');
                document.body.classList.add('loaded');
            }, 500);
        });
    }

    // ========================================
    // 2. PAGE TRANSITIONS - Disabled
    // ========================================
    function initPageTransitions() {
        // Disabled for cleaner navigation
    }

    // ========================================
    // 3. CUSTOM CURSOR
    // ========================================
    function initCursor() {
        const cursorGlow = document.getElementById('cursorGlow');
        const cursorDot = document.getElementById('cursorDot');

        if (!cursorGlow || !cursorDot) return;

        let mouseX = 0;
        let mouseY = 0;
        let glowX = 0;
        let glowY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });

        function animateCursor() {
            const speed = 0.08;
            glowX += (mouseX - glowX) * speed;
            glowY += (mouseY - glowY) * speed;

            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover effect on interactive elements
        const interactiveElements = document.querySelectorAll(
            'a, button, .link-card, .skill-card, .project-card, .contact-card, .social-link, [data-tooltip]'
        );

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hover');
            });
        });
    }

    // ========================================
    // 4. PARALLAX EFFECT (Mouse + Scroll)
    // ========================================
    function initParallax() {
        const parallaxOrbs = document.querySelectorAll('[data-parallax]');
        const parallaxContent = document.querySelectorAll('[data-parallax-content]');
        const heroSection = document.getElementById('heroSection');

        if (parallaxOrbs.length === 0 && parallaxContent.length === 0) return;

        // Mouse Parallax for Orbs
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;

            parallaxOrbs.forEach((el) => {
                const speed = parseFloat(el.dataset.parallax) * 50;
                const xOffset = x * speed;
                const yOffset = y * speed;
                el.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            });
        });

        // Scroll Parallax
        let ticking = false;

        function updateScrollParallax() {
            const scrollY = window.scrollY;

            // Parallax for background orbs (move slower than scroll)
            parallaxOrbs.forEach((el) => {
                const speed = parseFloat(el.dataset.parallax);
                const yOffset = scrollY * speed;
                const currentTransform = el.style.transform || '';
                const translateMatch = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                const currentX = translateMatch ? translateMatch[1] : '0px';
                el.style.transform = `translate(${currentX}, ${yOffset}px)`;
            });

            // Parallax for hero content (subtle upward movement)
            parallaxContent.forEach((el) => {
                const speed = parseFloat(el.dataset.parallaxContent) || 0.1;
                const yOffset = scrollY * speed * -1; // Move up slightly
                const opacity = Math.max(0, 1 - (scrollY / 600)); // Fade out
                el.style.transform = `translateY(${yOffset}px)`;
                el.style.opacity = opacity;
            });

            // Hero section depth effect
            if (heroSection) {
                const scale = Math.max(0.9, 1 - (scrollY / 3000));
                heroSection.style.transform = `scale(${scale})`;
            }

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollParallax);
                ticking = true;
            }
        });
    }

    // ========================================
    // 5. NAVIGATION
    // ========================================
    function initNavigation() {
        const navbar = document.getElementById('navbar');
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        // Scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar?.classList.add('scrolled');
            } else {
                navbar?.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        navToggle?.addEventListener('click', () => {
            navMenu?.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu?.classList.remove('active');
                navToggle?.classList.remove('active');
            });
        });

        setActiveNavLink();
        initLiquidMorphingIndicator();
    }

    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop().replace('.html', '') || 'index';

        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            const linkPage = href.split('/').pop().replace('.html', '') || 'index';

            if (linkPage === pageName || (pageName === 'index' && linkPage === 'index')) {
                link.classList.add('active');
            }
        });
    }

    // ========================================
    // LIQUID MORPHING INDICATOR
    // ========================================
    function initLiquidMorphingIndicator() {
        const navMenu = document.getElementById('navMenu');
        if (!navMenu) return;

        // Create indicator element
        const indicator = document.createElement('div');
        indicator.className = 'nav-indicator';
        navMenu.appendChild(indicator);

        const navLinks = navMenu.querySelectorAll('.nav-link');
        let currentTarget = null;
        let isHovering = false;

        // Position indicator on target
        function moveIndicator(target, animate = true) {
            if (!target) {
                indicator.classList.remove('active');
                return;
            }

            // Use requestAnimationFrame for accurate positioning
            requestAnimationFrame(() => {
                const menuRect = navMenu.getBoundingClientRect();
                const targetRect = target.getBoundingClientRect();

                // Validate that rects are valid
                if (targetRect.width === 0 || menuRect.width === 0) {
                    return;
                }

                // Add morphing class for squish effect
                if (animate && currentTarget && currentTarget !== target) {
                    indicator.classList.add('morphing');
                    setTimeout(() => indicator.classList.remove('morphing'), 150);
                }

                indicator.style.left = (targetRect.left - menuRect.left) + 'px';
                indicator.style.top = (targetRect.top - menuRect.top) + 'px';
                indicator.style.width = targetRect.width + 'px';
                indicator.style.height = targetRect.height + 'px';
                indicator.classList.add('active');

                currentTarget = target;
            });
        }

        // Find active link
        function getActiveLink() {
            return navMenu.querySelector('.nav-link.active');
        }

        // Initialize on active link - with multiple delays for reliability
        const activeLink = getActiveLink();
        if (activeLink) {
            // Immediate attempt
            moveIndicator(activeLink, false);
            // After fonts load
            setTimeout(() => moveIndicator(activeLink, false), 100);
            // After full page load
            window.addEventListener('load', () => {
                setTimeout(() => moveIndicator(activeLink, false), 50);
            });
        }

        // Hover events
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                isHovering = true;
                moveIndicator(link, true);
            });

            link.addEventListener('mouseleave', () => {
                isHovering = false;
                // Return to active link after delay
                setTimeout(() => {
                    if (!isHovering) {
                        const active = getActiveLink();
                        if (active) {
                            moveIndicator(active, true);
                        } else {
                            indicator.classList.remove('active');
                        }
                    }
                }, 100);
            });
        });

        // Recalculate on resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const target = isHovering ? currentTarget : getActiveLink();
                if (target) {
                    moveIndicator(target, false);
                }
            }, 100);
        });

        // Recalculate when language changes (text width changes)
        window.addEventListener('languageChanged', () => {
            const target = isHovering ? currentTarget : getActiveLink();
            if (target) {
                moveIndicator(target, false);
            }
        });
    }

    // ========================================
    // TYPING EFFECT
    // ========================================
    function initTypingEffect() {
        const typingElement = document.getElementById('typingText');
        if (!typingElement) return;

        const roles = [
            'AI Engineer',
            'IoT Developer',
            'Network Engineer',
            'Full Stack Developer',
            'Problem Solver'
        ];

        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        function type() {
            const currentRole = roles[roleIndex];

            if (isDeleting) {
                typingElement.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                typingElement.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 100;
            }

            if (!isDeleting && charIndex === currentRole.length) {
                isDeleting = true;
                typingSpeed = 2000; // Pause at end
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typingSpeed = 500; // Pause before next word
            }

            setTimeout(type, typingSpeed);
        }

        // Start typing after a delay
        setTimeout(type, 1000);
    }

    // ========================================
    // ENHANCED SCROLL REVEAL
    // ========================================
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.skill-card, .project-card, .timeline-content, .contact-card, .cert-card, .detail-card');

        const revealOnScroll = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, index * 100);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => {
            el.classList.add('scroll-reveal');
            revealOnScroll.observe(el);
        });
    }

    // ========================================
    // 6. SCROLL PROGRESS
    // ========================================
    function initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            progressBar.style.width = progress + '%';
        });
    }

    // ========================================
    // 7. SCROLL ANIMATIONS
    // ========================================
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll(
            '.link-card, .skill-card, .project-card, .education-card, .contact-card, .timeline-content, .cert-card'
        ).forEach(el => {
            el.classList.add('animate-on-scroll');
            el.setAttribute('data-animate', '');
            observer.observe(el);
        });
    }

    // ========================================
    // 8. RIPPLE EFFECT
    // ========================================
    function initRippleEffect() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', function (e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                ripple.style.cssText = `
                    position: absolute;
                    width: 100px;
                    height: 100px;
                    top: ${y}px;
                    left: ${x}px;
                `;

                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // ========================================
    // 9. CARD TILT EFFECT
    // ========================================
    function initCardTilt() {
        const cards = document.querySelectorAll('.link-card, .skill-card, .project-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    // ========================================
    // 10. MAGNETIC BUTTONS
    // ========================================
    function initMagneticButtons() {
        const buttons = document.querySelectorAll('.btn, .nav-cta, .social-link');

        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    // ========================================
    // 11. COUNTER ANIMATION
    // ========================================
    function initCounterAnimation() {
        const counters = document.querySelectorAll('.stat-number, .summary-number, .stat-value');

        const animateCounter = (el) => {
            const text = el.textContent;
            const target = parseInt(text);
            if (isNaN(target)) return;

            let current = 0;
            const increment = target / 40;
            const suffix = text.includes('+') ? '+' : '';

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.textContent = target + suffix;
                    clearInterval(timer);
                } else {
                    el.textContent = Math.floor(current) + suffix;
                }
            }, 25);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    // ========================================
    // 12. SMOOTH SCROLL
    // ========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // ========================================
    // 13. TOOLTIP INITIALIZATION
    // ========================================
    function initTooltips() {
        // Tooltips are CSS-only, but we can add dynamic ones here if needed
        document.querySelectorAll('.social-link').forEach((link, index) => {
            const labels = ['LinkedIn', 'GitHub', 'Email'];
            if (labels[index]) {
                link.setAttribute('data-tooltip', labels[index]);
            }
        });
    }

    // ========================================
    // 14. EASTER EGG
    // ========================================
    let konamiCode = [];
    const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.keyCode);
        konamiCode = konamiCode.slice(-10);

        if (konamiCode.join(',') === konamiSequence.join(',')) {
            document.body.style.animation = 'hueRotate 2s linear';
            setTimeout(() => document.body.style.animation = '', 2000);
        }
    });

    const konamiStyle = document.createElement('style');
    konamiStyle.textContent = `
        @keyframes hueRotate {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(konamiStyle);

    // ========================================
    // 15. THEME TOGGLE
    // ========================================
    function initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const sunIcon = document.querySelector('.theme-icon-sun');
        const moonIcon = document.querySelector('.theme-icon-moon');

        // Check saved theme or system preference
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';

                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeIcon(newTheme);
            });
        }

        function updateThemeIcon(theme) {
            if (!sunIcon || !moonIcon) return;

            if (theme === 'light') {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        }
    }

    // ========================================
    // 16. FLOATING PARTICLES
    // ========================================
    function initParticles() {
        const container = document.createElement('div');
        container.className = 'particles-container';
        document.body.appendChild(container);

        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Random position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';

            container.appendChild(particle);
        }
    }

    // ========================================
    // 17. ENHANCED SCROLL PROGRESS
    // ========================================
    function initEnhancedScrollProgress() {
        const progressBar = document.querySelector('.scroll-progress');
        if (!progressBar) return;

        // Add gradient to scroll progress
        progressBar.style.background = 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)';
    }

    // ========================================
    // INITIALIZE ALL
    // ========================================
    document.addEventListener('DOMContentLoaded', () => {
        initPageLoader();
        initPageTransitions();
        initNavigation();
        initSmoothScroll();
        initCursor();
        initParallax();
        initScrollProgress();
        initScrollAnimations();
        initCardTilt();
        initMagneticButtons();
        initRippleEffect();
        initCounterAnimation();
        initTooltips();
        initTheme();
        initParticles();
        initTypingEffect();
        initScrollReveal();

        // Enhanced scroll progress after creation
        setTimeout(initEnhancedScrollProgress, 100);

        // Initialize language toggle
        if (typeof initLanguage === 'function') {
            initLanguage();
        }

        // Mark as loaded
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);

        // Console message with updated colors
        console.log(`
%c✨ Welcome to my portfolio!
%cBuilt with passion by Nguyen Anh Vu
%c📧 anhvu.nguyen1107@gmail.com
        `,
            'color: #6366f1; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #a855f7;',
            'color: #94a3b8; font-size: 13px;',
            'color: #a855f7; font-size: 12px;'
        );
    });
})();
