(function() {
    'use strict';

    // Initialize application
    function init() {
        setupMobileNavigation();
        setupClientSlider();
        setupProjectSlider();
        setupServicesSlider();
        setupHeroMobileSlider();
        setupNavigation();
        setupNewsletterForm();
        setupAccessibility();
    }

    // Mobile Navigation
    function setupMobileNavigation() {
        const navToggle = document.getElementById('navToggle');
        const mobileMenu = document.getElementById('mobileMenu');

        if (!navToggle || !mobileMenu) return;

        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('nav__toggle--active');
            mobileMenu.classList.toggle('nav__mobile-menu--active');

            // Prevent body scroll when menu is open
            document.body.style.overflow =
                mobileMenu.classList.contains('nav__mobile-menu--active') ? 'hidden' : '';
        });

        // Close menu when clicking links
        mobileMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav__mobile-link') ||
                e.target.classList.contains('nav__mobile-cta')) {
                navToggle.classList.remove('nav__toggle--active');
                mobileMenu.classList.remove('nav__mobile-menu--active');
                document.body.style.overflow = '';
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('nav__mobile-menu--active')) {
                navToggle.classList.remove('nav__toggle--active');
                mobileMenu.classList.remove('nav__mobile-menu--active');
                document.body.style.overflow = '';
            }
        });
    }

    // Client slider auto-scroll
    function setupClientSlider() {
        const track = document.getElementById('clientsTrack');
        if (!track) return;

        // Duplicate logos for seamless loop
        const logos = track.children;
        const logoArray = Array.from(logos);
        logoArray.forEach(logo => {
            const clone = logo.cloneNode(true);
            track.appendChild(clone);
        });

        // Pause animation on hover
        track.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });

        track.addEventListener('mouseleave', () => {
            track.style.animationPlayState = 'running';
        });
    }

    // Project slider with drag functionality
    function setupProjectSlider() {
        const slider = document.getElementById('projectsSlider');
        const track = document.getElementById('projectsTrack');
        const prevBtn = document.getElementById('projectsPrev');
        const nextBtn = document.getElementById('projectsNext');
        const dots = document.getElementById('projectsDots');
        const projects = document.querySelectorAll('.project-card');

        if (!slider || !track) return;

        let currentIndex = 0;
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let autoTimer = null;

        // Recalculate position on window resize
        window.addEventListener('resize', () => {
            setSliderPosition();
            restartAutoplay();
        });

        // Touch/Mouse events for dragging
        slider.addEventListener('mousedown', dragStart);
        slider.addEventListener('touchstart', dragStart, {
            passive: true
        });
        slider.addEventListener('mouseup', dragEnd);
        slider.addEventListener('touchend', dragEnd);
        slider.addEventListener('mousemove', dragAction);
        slider.addEventListener('touchmove', dragAction, {
            passive: true
        });
        slider.addEventListener('mouseleave', dragEnd);

        // Prevent default drag behavior
        slider.addEventListener('dragstart', (e) => e.preventDefault());

        function dragStart(e) {
            isDragging = true;
            startPos = getPositionX(e);
            slider.style.cursor = 'grabbing';
            // pause autoplay while user interacts
            stopAutoplay();
        }

        function dragAction(e) {
            if (!isDragging) return;

            const currentPosition = getPositionX(e);
            currentTranslate = prevTranslate + currentPosition - startPos;

            track.style.transform = `translateX(${currentTranslate}px)`;
        }

        function dragEnd() {
            if (!isDragging) return;
            isDragging = false;
            slider.style.cursor = 'grab';

            const movedBy = currentTranslate - prevTranslate;
            const step = getStepWidth();
            const threshold = step / 3;
            const maxIndex = getMaxIndex();

            if (movedBy < -threshold && currentIndex < maxIndex) {
                currentIndex++;
            } else if (movedBy > threshold && currentIndex > 0) {
                currentIndex--;
            }

            setSliderPosition();
            startAutoplay();
        }

        function getPositionX(e) {
            return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        }

        function getStepWidth() {
            // distance between first two project cards to include gap
            if (projects.length > 1) {
                const a = projects[0].offsetLeft;
                const b = projects[1].offsetLeft;
                const diff = Math.abs(b - a);
                if (diff > 0) return diff;
            }
            return projects[0].offsetWidth;
        }

        function getMaxIndex() {
            // One card per move on mobile; fallback to total-1
            return Math.max(0, projects.length - 1);
        }

        function setSliderPosition() {
            const step = getStepWidth();
            currentTranslate = -(currentIndex * step);
            prevTranslate = currentTranslate;
            track.style.transform = `translateX(${currentTranslate}px)`;
            updateControls();
        }

        function updateControls() {
            // Update dots
            if (dots) {
                document.querySelectorAll('.projects__dot').forEach((dot, index) => {
                    dot.classList.toggle('projects__dot--active', index === currentIndex);
                });
            }

            // Update buttons
            if (prevBtn) prevBtn.disabled = currentIndex === 0;
            if (nextBtn) nextBtn.disabled = currentIndex === getMaxIndex();
        }

        // Button controls
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    setSliderPosition();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentIndex < getMaxIndex()) {
                    currentIndex++;
                    setSliderPosition();
                }
            });
        }

        // Dot controls
        if (dots) {
            dots.addEventListener('click', (e) => {
                if (e.target.classList.contains('projects__dot')) {
                    currentIndex = parseInt(e.target.dataset.index);
                    setSliderPosition();
                }
            });
        }

        // Tab functionality
        const tabs = document.querySelectorAll('.projects__tab');
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('projects__tab--active'));
                // Add active class to clicked tab
                tab.classList.add('projects__tab--active');

                // Filter projects based on category
                const category = tab.dataset.category;
                filterProjects(category);
            });

            tab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    tab.click();
                }
            });

            // Make tabs focusable
            tab.setAttribute('tabindex', '0');
            tab.setAttribute('role', 'button');
        });

        function filterProjects(category) {
            projects.forEach(project => {
                const projectCategories = project.dataset.category.split(' ');
                if (projectCategories.includes(category)) {
                    project.style.display = 'flex';
                } else {
                    project.style.display = 'none';
                }
            });

            // Reset to first slide after filtering
            currentIndex = 0;
            setSliderPosition();
        }

        function startAutoplay() {
            if (autoTimer) return;
            if (window.innerWidth > 1024) return;
            autoTimer = setInterval(() => {
                const maxIndex = getMaxIndex();
                currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
                setSliderPosition();
            }, 3000);
        }

        function stopAutoplay() {
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
            }
        }

        function restartAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        // Initialize
        updateControls();
        setSliderPosition();
        startAutoplay();
    }

    // Services slider functionality (drag/swipe only, no visible controls)
    function setupServicesSlider() {
        const slider = document.getElementById('servicesSlider');
        const track = document.getElementById('servicesTrack');
        const slides = document.querySelectorAll('.services__slide');

        if (!slider || !track) return;

        let currentIndex = 0;
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let slidesPerView = 4; // Default for desktop
        let autoTimer = null;

        // Calculate slides per view based on screen size
        function updateSlidesPerView() {
            if (window.innerWidth <= 480) {
                slidesPerView = 1;
            } else if (window.innerWidth <= 768) {
                slidesPerView = 2;
            } else {
                slidesPerView = 4;
            }
        }

        // Recalculate position on window resize
        window.addEventListener('resize', () => {
            updateSlidesPerView();
            setSliderPosition();
            restartAutoplay();
        });

        // Touch/Mouse events for dragging
        slider.addEventListener('mousedown', dragStart);
        slider.addEventListener('touchstart', dragStart);
        slider.addEventListener('mouseup', dragEnd);
        slider.addEventListener('touchend', dragEnd);
        slider.addEventListener('mousemove', dragAction);
        slider.addEventListener('touchmove', dragAction);
        slider.addEventListener('mouseleave', dragEnd);

        // Prevent default drag behavior
        slider.addEventListener('dragstart', (e) => e.preventDefault());

        function dragStart(e) {
            isDragging = true;
            startPos = getPositionX(e);
            slider.style.cursor = 'grabbing';
        }

        function dragAction(e) {
            if (!isDragging) return;

            const currentPosition = getPositionX(e);
            currentTranslate = prevTranslate + currentPosition - startPos;

            track.style.transform = `translateX(${currentTranslate}px)`;
        }

        function dragEnd() {
            if (!isDragging) return;
            isDragging = false;
            slider.style.cursor = 'grab';

            const movedBy = currentTranslate - prevTranslate;
            const step = getStepWidth();
            const threshold = step / 3;
            const maxIndex = getMaxIndex();

            if (movedBy < -threshold && currentIndex < maxIndex) {
                currentIndex++;
            } else if (movedBy > threshold && currentIndex > 0) {
                currentIndex--;
            }

            setSliderPosition();
            // resume autoplay after interaction on mobile
            startAutoplay();
        }

        function getPositionX(e) {
            return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        }

        // compute one-card step width (including gap) using left offsets
        function getStepWidth() {
            if (slides.length > 1) {
                const a = slides[0].offsetLeft;
                const b = slides[1].offsetLeft;
                const diff = Math.abs(b - a);
                if (diff > 0) return diff;
            }
            return slides[0].offsetWidth;
        }

        function getMaxIndex() {
            return Math.max(0, slides.length - slidesPerView);
        }

        function setSliderPosition() {
            updateSlidesPerView();
            const step = getStepWidth();
            currentTranslate = -(currentIndex * step);
            prevTranslate = currentTranslate;
            track.style.transform = `translateX(${currentTranslate}px)`;
        }

        function startAutoplay() {
            if (autoTimer) return;
            if (window.innerWidth > 768) return;
            autoTimer = setInterval(() => {
                const maxIndex = getMaxIndex();
                currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
                setSliderPosition();
            }, 3000);
        }

        function stopAutoplay() {
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
            }
        }

        function restartAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        // Initialize
        updateSlidesPerView();
        setSliderPosition();
        startAutoplay();
    }

    // Hero mobile slider (drag/swipe, only active on <=1024px)
    function setupHeroMobileSlider() {
        const slider = document.getElementById('heroMobileSlider');
        const track = document.getElementById('heroMobileTrack');
        if (!slider || !track) return;

        // Only enable on tablets/mobiles
        const isMobile = () => window.innerWidth <= 1024;
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let maxTranslate = 0;
        let slideIndex = 0;
        let autoTimer = null;

        const updateBounds = () => {
            const totalWidth = track.scrollWidth;
            const visibleWidth = slider.clientWidth;
            maxTranslate = Math.max(0, totalWidth - visibleWidth);
            // Clamp current position
            const clamped = Math.max(-maxTranslate, Math.min(0, currentTranslate));
            currentTranslate = clamped;
            prevTranslate = clamped;
            track.style.transform = `translateX(${clamped}px)`;
        };

        const getX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

        const start = (e) => {
            if (!isMobile()) return;
            isDragging = true;
            startPos = getX(e);
            slider.style.cursor = 'grabbing';
        };

        const move = (e) => {
            if (!isDragging || !isMobile()) return;
            const dx = getX(e) - startPos;
            currentTranslate = prevTranslate + dx;
            // Limit within bounds
            currentTranslate = Math.max(-maxTranslate, Math.min(0, currentTranslate));
            track.style.transform = `translateX(${currentTranslate}px)`;
        };

        const end = () => {
            if (!isDragging) return;
            isDragging = false;
            slider.style.cursor = 'grab';
            prevTranslate = currentTranslate;
            // Snap to nearest slide (approx based on 85% width + gap 12px)
            const step = Math.round(slider.clientWidth * 0.85 + 12);
            slideIndex = Math.min(Math.ceil(maxTranslate / step), Math.max(0, Math.round(Math.abs(currentTranslate) / step)));
            const target = -slideIndex * step;
            currentTranslate = Math.max(-maxTranslate, Math.min(0, target));
            prevTranslate = currentTranslate;
            track.style.transform = `translateX(${currentTranslate}px)`;
        };

        // Events
        slider.addEventListener('mousedown', start);
        slider.addEventListener('touchstart', start, {
            passive: true
        });
        window.addEventListener('mousemove', move);
        window.addEventListener('touchmove', move, {
            passive: true
        });
        window.addEventListener('mouseup', end);
        window.addEventListener('touchend', end);
        window.addEventListener('resize', () => {
            updateBounds();
            restartAutoplay();
        });

        // Init
        updateBounds();
        startAutoplay();

        function startAutoplay() {
            if (autoTimer) return;
            if (!isMobile()) return;
            const step = Math.round(slider.clientWidth * 0.85 + 12);
            autoTimer = setInterval(() => {
                const maxSteps = Math.max(0, Math.ceil(maxTranslate / step));
                slideIndex = slideIndex >= maxSteps ? 0 : slideIndex + 1;
                currentTranslate = -slideIndex * step;
                currentTranslate = Math.max(-maxTranslate, Math.min(0, currentTranslate));
                prevTranslate = currentTranslate;
                track.style.transform = `translateX(${currentTranslate}px)`;
            }, 3000);
        }

        function stopAutoplay() {
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
            }
        }

        function restartAutoplay() {
            stopAutoplay();
            startAutoplay();
        }
    }

    // Navigation functionality
    function setupNavigation() {
        const nav = document.querySelector('.nav');
        const navLinks = document.querySelectorAll('.nav__link, .nav__cta, .nav__mobile-link, .nav__mobile-cta');

        // Smooth scroll for anchor links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        // Change nav appearance on scroll
        let lastScrollY = 0;
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 100) {
                nav.style.background = 'rgba(255, 255, 255, 0.95)';
                nav.style.backdropFilter = 'blur(12px)';
            } else {
                nav.style.background = 'rgba(255, 255, 255, 0.88)';
                nav.style.backdropFilter = 'blur(9px)';
            }

            lastScrollY = currentScrollY;
        }, {
            passive: true
        });
    }

    // Newsletter form
    function setupNewsletterForm() {
        const form = document.getElementById('newsletterForm');
        if (!form) return;

        form.addEventListener('click', (e) => {
            if (e.target.classList.contains('footer__submit')) {
                e.preventDefault();
                const email = form.querySelector('input[type="email"]').value;

                // Simulate form submission
                if (email) {
                    const submitBtn = e.target;
                    const originalText = submitBtn.textContent;

                    submitBtn.textContent = 'Submitting...';
                    submitBtn.disabled = true;

                    setTimeout(() => {
                        submitBtn.textContent = 'Subscribed!';
                        setTimeout(() => {
                            submitBtn.textContent = originalText;
                            submitBtn.disabled = false;
                            form.querySelector('input').value = '';
                        }, 2000);
                    }, 1000);
                }
            }
        });
    }

    // Accessibility enhancements
    function setupAccessibility() {
        // Add skip link
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        // skipLink.textContent = 'Skip to main content';
        skipLink.className = 'visually-hidden';
        skipLink.style.position = 'absolute';
        skipLink.style.top = '10px';
        skipLink.style.left = '10px';
        skipLink.style.zIndex = '9999';
        skipLink.addEventListener('focus', () => {
            skipLink.classList.remove('visually-hidden');
        });
        skipLink.addEventListener('blur', () => {
            skipLink.classList.add('visually-hidden');
        });
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add main landmark
        const main = document.querySelector('main');
        if (main) {
            main.id = 'main';
        }

        // Enhance floating cards with ARIA labels
        const floatingCards = document.querySelectorAll('.floating-card');
        floatingCards.forEach(card => {
            card.setAttribute('role', 'img');
            card.setAttribute('aria-label', 'Decorative statistics card');
        });

        // Add loading states for images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.setAttribute('loading', 'lazy');
            img.setAttribute('decoding', 'async');
        });
    }

    // Performance optimization
    function setupPerformance() {
        // Lazy load non-critical sections
        if ('IntersectionObserver' in window) {
            const sections = document.querySelectorAll('.section');
            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.contentVisibility = 'auto';
                    }
                });
            }, {
                rootMargin: '50px'
            });

            sections.forEach(section => {
                section.style.contentVisibility = 'auto';
                sectionObserver.observe(section);
            });
        }

        // Preload critical resources
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.href = 'data:font/woff2;base64,'; // Placeholder for font preload
        preloadLink.as = 'font';
        preloadLink.type = 'font/woff2';
        preloadLink.crossOrigin = 'anonymous';
        // document.head.appendChild(preloadLink);
    }

    // Error handling
    window.addEventListener('error', (e) => {
        console.error('Application error:', e.error);
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Setup performance optimizations
    setupPerformance();

})();