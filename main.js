document.addEventListener('DOMContentLoaded', () => {
    // --- Digital Pulse Animation Injection ---
    const pulseContainer = document.createElement('div');
    pulseContainer.className = 'digital-pulse-container';
    pulseContainer.innerHTML = `
        <div class="pulse-ring"></div>
        <div class="pulse-ring"></div>
    `;
    document.body.appendChild(pulseContainer);

    // Remove after animation completes
    setTimeout(() => {
        pulseContainer.remove();
    }, 2500); // 2.5s to ensure full fade out

    // Scroll Header Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Change icon
            if (navLinks.classList.contains('active')) {
                menuToggle.textContent = '✕';
            } else {
                menuToggle.textContent = '☰';
            }
        });
    }

    // Mobile Dropdown Toggle
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });
    // Counter Animation
    const counters = document.querySelectorAll('.counter');

    const runCounter = (counter) => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const step = 20; // update every 20ms
        // Calculate increment per step
        const increment = target / (duration / step);

        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.innerText = target;
                clearInterval(timer);
            } else {
                // If target has decimal, show 1 decimal place, else 0
                // Check if target is float by modulo 1
                if (target % 1 !== 0) {
                    counter.innerText = current.toFixed(1);
                } else {
                    counter.innerText = Math.ceil(current);
                }
            }
        }, step);
    };

    if (counters.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runCounter(entry.target);
                    observer.unobserve(entry.target); // Stop observing once triggered
                }
            });
        }, {
            threshold: 0.1
        });

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    // --- Dashboard Specific Logic ---
    const sidebarLinks = document.querySelectorAll('.sidebar-menu .nav-item');
    const dashboardSections = document.querySelectorAll('.dashboard-section');

    if (sidebarLinks.length > 0 && dashboardSections.length > 0) {
        // Intersection Observer for Active Section Highlighting (Scroll Spy)
        const observerOptions = {
            root: null,
            rootMargin: '-10% 0px -70% 0px', // Trigger when section is near the top
            threshold: 0
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');

                    // Update Sidebar Active State
                    sidebarLinks.forEach(link => {
                        link.classList.remove('active');
                        // Reset background/style for admin dashboard
                        link.style.background = '';

                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                            // Re-apply special style for admin overview if needed
                            if (id === 'overview' && document.querySelector('.admin-sidebar')) {
                                link.style.background = 'rgba(236, 72, 153, 0.1)';
                            }
                        }
                    });

                    // Trigger Counters for the visible section
                    entry.target.querySelectorAll('.counter').forEach(c => runCounter(c));
                }
            });
        }, observerOptions);

        dashboardSections.forEach(section => {
            sectionObserver.observe(section);
        });

        // Close sidebar on mobile after clicking a link
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 900) {
                    const sidebar = document.querySelector('.sidebar');
                    if (sidebar) sidebar.classList.remove('active');
                }
            });
        });
    }

    // Set Active Navigation Link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinksList = document.querySelectorAll('.nav-links a');

    navLinksList.forEach(link => {
        const href = link.getAttribute('href');
        // Check if current filename matches href or if it's index.html for root
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');

            // If it's a sub-menu item, also highlight parent dropdown link
            const dropdown = link.closest('.dropdown');
            if (dropdown) {
                const parentLink = dropdown.querySelector('a');
                if (parentLink) parentLink.classList.add('active');
            }
        }
    });
    // --- Scroll Reveal Animation Logic ---
    const revealObserverOptions = {
        threshold: 0.15, // Trigger when 15% is visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before bottom
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, revealObserverOptions);

    // Select elements to animate
    const revealUpElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, .btn, li, form input, form textarea, form label');
    const revealBoxElements = document.querySelectorAll('.glass-card, .service-card, .pricing-card, .process-step, .faq-item, .stat-item, .chart-container');
    const revealZoomElements = document.querySelectorAll('img'); // Images just zoom

    revealUpElements.forEach(el => {
        if (!el.closest('.reveal-box') && !el.classList.contains('reveal-up')) {
            el.classList.add('reveal-up');
            revealObserver.observe(el);
        }
    });

    revealBoxElements.forEach(el => {
        el.classList.add('reveal-box');
        revealObserver.observe(el);
    });

    revealZoomElements.forEach(el => {
        // Don't animate images if they are inside a box that is already animating
        if (!el.closest('.reveal-box')) {
            el.classList.add('reveal-zoom');
            revealObserver.observe(el);
        }
    });

    // --- Table Row Stagger Animation ---
    const tables = document.querySelectorAll('.data-table');
    if (tables.length > 0) {
        const tableObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const rows = entry.target.querySelectorAll('tbody tr');
                    rows.forEach((row, index) => {
                        setTimeout(() => {
                            row.classList.add('reveal-active');
                        }, index * 100); // 100ms stagger delay
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        tables.forEach(table => {
            tableObserver.observe(table);
        });
    }
});

// Update Randomizer Logic directly in index.html (moved here for consistency if needed, but likely in index.html script block. Waiting to check index.html script block).
