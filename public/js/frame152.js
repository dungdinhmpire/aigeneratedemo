(function() {
    'use strict';

    // Initialize the working process interactions
    function initWorkingProcess() {
        const processSteps = document.querySelectorAll('.process-step');
        const processImage = document.querySelector('.process-image');

        // Step descriptions for each process step
        const stepDescriptions = {
            1: "We begin by understanding your unique challenges and goals to tailor our solution to your specific needs.",
            2: "We create a comprehensive roadmap that aligns with your business objectives and technical requirements.",
            3: "Our expert team brings your vision to life using cutting-edge technologies and best practices.",
            4: "We carefully deploy and integrate your solution into your existing infrastructure.",
            5: "We fine-tune performance and ensure everything runs smoothly and efficiently.",
            6: "We provide continuous support and maintenance to keep your solution running at peak performance."
        };

        // Image descriptions for visual feedback
        const imageDescriptions = {
            1: "Discovery Process Visualization",
            2: "Strategic Planning Diagram",
            3: "Design & Development Workflow",
            4: "Implementation Architecture",
            5: "Optimization Metrics",
            6: "Support & Maintenance Dashboard"
        };

        // Add click handlers for interactive behavior
        processSteps.forEach((step, index) => {
            const stepNumber = index + 1;

            step.addEventListener('click', () => {
                // Remove active state from all steps
                processSteps.forEach(s => {
                    s.classList.remove('process-step--active');
                    const number = s.querySelector('.process-step__number');
                    const numberText = s.querySelector('.process-step__number-text');
                    number.classList.add('process-step__number--inactive');
                });

                // Add active state to clicked step
                step.classList.add('process-step--active');
                const activeNumber = step.querySelector('.process-step__number');
                activeNumber.classList.remove('process-step__number--inactive');

                // Update description if it doesn't exist
                const descContainer = step.querySelector('.process-step__content');
                let description = descContainer.querySelector('.process-step__description');

                if (!description) {
                    description = document.createElement('p');
                    description.className = 'process-step__description';
                    descContainer.appendChild(description);
                }

                description.textContent = stepDescriptions[stepNumber];

                // Update image description
                processImage.innerHTML = `<span>${
                    imageDescriptions[stepNumber]
                }</span>`;

                // Announce change for screen readers
                announceStepChange(stepNumber);
            });

            // Add keyboard support
            step.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    step.click();
                }
            });

            // Make steps focusable
            step.setAttribute('tabindex', '0');
            step.setAttribute('role', 'button');
            step.setAttribute('aria-label', `Step ${stepNumber}: ${
                step.querySelector('.process-step__title').textContent
            }`);
        });

        // Auto-advance demo (optional)
        let currentStep = 0;
        const autoAdvance = () => {
            if (document.visibilityState === 'visible') {
                currentStep = (currentStep + 1) % processSteps.length;
                processSteps[currentStep].click();
            }
        };

        // Start auto-advance after 3 seconds, then every 5 seconds
        const autoAdvanceTimer = setTimeout(() => {
            autoAdvance();
            setInterval(autoAdvance, 5000);
        }, 3000);

        // Pause auto-advance when user interacts
        processSteps.forEach(step => {
            step.addEventListener('click', () => {
                clearTimeout(autoAdvanceTimer);
            });
        });
    }

    // Accessibility helper for announcing step changes
    function announceStepChange(stepNumber) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';

        const stepTitle = document.querySelector('.process-step--active .process-step__title').textContent;
        announcement.textContent = `Now viewing step ${stepNumber}: ${stepTitle}`;

        document.body.appendChild(announcement);

        // Remove after announcement
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 1000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWorkingProcess);
    } else {
        initWorkingProcess();
    }

    function setupIndustriesSlider() {
        const slider = document.getElementById('industriesSlider');
        const prevBtn = document.getElementById('industriesPrev');
        const nextBtn = document.getElementById('industriesNext');
        if (!slider || !prevBtn || !nextBtn) return;

        // Amount to scroll per click = width of one card + gap
        const getStep = () => {
            const cards = slider.querySelectorAll('.industry-card');
            if (cards.length > 1) {
                const a = cards[0].offsetLeft;
                const b = cards[1].offsetLeft;
                const diff = Math.abs(b - a);
                if (diff > 0) return diff;
            }
            const first = slider.querySelector('.industry-card');
            return first ? first.offsetWidth : 300;
        };

        const scrollByStep = (dir) => {
            const step = getStep();
            slider.scrollBy({
                left: dir * step,
                behavior: 'smooth'
            });
            updateButtons();
        };

        function updateButtons() {
            // disable prev if at start, next if at end
            const atStart = slider.scrollLeft <= 0;
            const maxScroll = slider.scrollWidth - slider.clientWidth - 2;
            const atEnd = slider.scrollLeft >= maxScroll;
            prevBtn.disabled = atStart;
            nextBtn.disabled = atEnd;
        }

        prevBtn.addEventListener('click', () => scrollByStep(-1));
        nextBtn.addEventListener('click', () => scrollByStep(1));

        // Drag/Swipe support
        let isDown = false;
        let startX = 0;
        let startLeft = 0;

        const start = (e) => {
            isDown = true;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            startLeft = slider.scrollLeft;
            slider.style.cursor = 'grabbing';
        };
        const move = (e) => {
            if (!isDown) return;
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            const dx = startX - x;
            slider.scrollLeft = startLeft + dx;
        };
        const end = () => {
            if (!isDown) return;
            isDown = false;
            slider.style.cursor = 'grab';
            updateButtons();
        };

        slider.addEventListener('mousedown', start);
        slider.addEventListener('touchstart', start, {
            passive: true
        });
        window.addEventListener('mousemove', move, {
            passive: true
        });
        window.addEventListener('touchmove', move, {
            passive: true
        });
        window.addEventListener('mouseup', end);
        window.addEventListener('touchend', end);
        slider.addEventListener('scroll', updateButtons, {
            passive: true
        });
        window.addEventListener('resize', updateButtons);

        // Prevent default image drag in slider
        slider.addEventListener('dragstart', (e) => e.preventDefault());

        // Initialize button state
        updateButtons();
    }

})();