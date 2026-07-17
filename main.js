document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const searchBar = document.getElementById('search-bar');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card');
    const themeToggle = document.getElementById('theme-toggle');
    const liveClockEl = document.getElementById('live-clock');
    const countrySelect = document.getElementById('country-select');
    const welcomeMessage = document.getElementById('welcome-message');
    const sessionCountEl = document.getElementById('session-count');

    // --- Extra Feature Elements ---
    const clearSearchBtn = document.getElementById('clear-search');
    const backToTopBtn = document.getElementById('back-to-top');

    // ==========================================
    // 1. THEME TOGGLE ENGINE
    // ==========================================
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '☀️';
        }
    });

    // ==========================================
    // 2. TIMEZONE-AWARE LIVE CLOCK ENGINE
    // ==========================================
    const timezoneMap = {
        'Global': undefined,
        'India': 'Asia/Kolkata',
        'United States': 'America/New_York',
        'United Kingdom': 'Europe/London',
        'Germany': 'Europe/Berlin',
        'Singapore': 'Asia/Singapore'
    };

    function updateClock() {
        const now = new Date();
        const selectedCountry = countrySelect.value;
        const targetTimezone = timezoneMap[selectedCountry];

        const options = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };

        if (targetTimezone) {
            options.timeZone = targetTimezone;
        }

        liveClockEl.textContent = '🕒 ' + now.toLocaleTimeString('en-US', options);
    }

    let clockInterval = setInterval(updateClock, 1000);

    countrySelect.addEventListener('change', (e) => {
        localStorage.setItem('user_country', e.target.value);
        updateClock();
    });

    // ==========================================
    // 3. VISITOR NAME & FRESH SESSION ENGINE
    // ==========================================
    let isFreshSession = sessionStorage.getItem('session_active') === null;

    if (isFreshSession) {
        sessionStorage.setItem('session_active', 'true');

        let totalSessions = parseInt(localStorage.getItem('total_sessions') || '0', 10);
        totalSessions += 1;
        localStorage.setItem('total_sessions', totalSessions);

        let visitorName = localStorage.getItem('visitor_name');
        if (!visitorName) {
            visitorName = prompt("Welcome to Srikanth's Playground! What is your name?");
            if (!visitorName || visitorName.trim() === "") {
                visitorName = "Guest Engineer";
            }
            localStorage.setItem('visitor_name', visitorName.trim());
        }
    }

    const savedName = localStorage.getItem('visitor_name') || 'Guest Engineer';
    const savedSessions = localStorage.getItem('total_sessions') || '1';
    const savedCountry = localStorage.getItem('user_country') || 'Global';

    welcomeMessage.innerHTML = `Welcome back, <strong>${savedName}</strong>! 💻`;
    sessionCountEl.textContent = savedSessions;
    countrySelect.value = savedCountry;

    updateClock();

    // ==========================================
    // 4. UNIFIED SEARCH & FILTER
    // ==========================================
    function filterCards() {
        const searchText = searchBar.value.toLowerCase();

        // Show or hide the inline clear button based on input length
        if (searchText.length > 0) {
            if (clearSearchBtn) clearSearchBtn.style.display = 'block';
        } else {
            if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        }

        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';

        cards.forEach(card => {
            const cardCategory = card.dataset.category;
            const cardTitle = card.querySelector('h3').textContent.toLowerCase();
            const cardDesc = card.querySelector('p').textContent.toLowerCase();

            const matchesSearch = cardTitle.includes(searchText) || cardDesc.includes(searchText);
            const matchesFilter = activeFilter === 'all' || cardCategory === activeFilter;

            if (matchesSearch && matchesFilter) {
                card.style.display = 'block';
                // Trigger internal highlighting function if active
                if (typeof highlightMatchingText === 'function') {
                    highlightMatchingText(card, searchText);
                }
            } else {
                card.style.display = 'none';
            }
        });

        // Trigger empty state counter adjustments if active
        if (typeof updateCounterBadge === 'function') {
            updateCounterBadge();
        }
    }

    searchBar.addEventListener('input', filterCards);

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterCards();
        });
    });

    // ==========================================
    // 5. EXTRA FEATURES LOGIC (Clear & Scroll)
    // ==========================================
    // Clear Search Input Action
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchBar.value = '';
            clearSearchBtn.style.display = 'none';
            searchBar.focus();
            filterCards(); // Reset UI layout view
        });
    }

    // Monitor page scroll coordinates to show/hide "Back to Top"
    window.addEventListener('scroll', () => {
        if (backToTopBtn) {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        }
    });

    // Handle smooth scroll animation back to top
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==========================================
    // 🆕 6. GLOBAL HOTKEY ENGINE (Focus & Escape)
    // ==========================================
    document.addEventListener('keydown', (e) => {
        // Pressing '/' focuses the search bar instantly unless typing in an input
        if (e.key === '/' && document.activeElement !== searchBar) {
            e.preventDefault();
            searchBar.focus();
            searchBar.select();
        }
        // Pressing 'Escape' clears focus and resets the search parameter state
        if (e.key === 'Escape' && document.activeElement === searchBar) {
            searchBar.value = '';
            searchBar.blur();
            filterCards();
        }
    });

    // ==========================================
    // 🆕 7. AUTOMATIC VISUAL MATCH HIGHLIGHTER
    // ==========================================
    function highlightMatchingText(card, term) {
        const titleEl = card.querySelector('h3');
        const descEl = card.querySelector('p');

        if (!card.dataset.originalTitle) card.dataset.originalTitle = titleEl.innerHTML;
        if (!card.dataset.originalDesc) card.dataset.originalDesc = descEl.innerHTML;

        if (!term.trim()) {
            titleEl.innerHTML = card.dataset.originalTitle;
            descEl.innerHTML = card.dataset.originalDesc;
            return;
        }

        const regex = new RegExp(`(${term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');

        // Wrap matching strings inside your structural style definitions
        titleEl.innerHTML = card.dataset.originalTitle.replace(regex, `<mark style="background: rgba(254, 240, 138, 0.6); color: #000; border-radius: 2px; padding: 0 2px;">$1</mark>`);
        descEl.innerHTML = card.dataset.originalDesc.replace(regex, `<mark style="background: rgba(254, 240, 138, 0.6); color: #000; border-radius: 2px; padding: 0 2px;">$1</mark>`);
    }

    // ==========================================
    // 🆕 8. METRIC BADGE COUNTER TELEMETRY
    // ==========================================
    function updateCounterBadge() {
        let activeCount = 0;
        cards.forEach(card => {
            if (card.style.display !== 'none') activeCount++;
        });

        let counterBadge = document.getElementById('active-card-counter');
        if (!counterBadge) {
            const metricsContainer = document.querySelector('.repo-metrics-bar') || document.querySelector('.action-bar');
            if (metricsContainer) {
                const wrapper = document.createElement('div');
                wrapper.className = 'metric-item active-pill';
                wrapper.innerHTML = `Showing: <span id="active-card-counter">${activeCount}</span>`;
                metricsContainer.appendChild(wrapper);
                counterBadge = document.getElementById('active-card-counter');
            }
        }

        if (counterBadge) {
            counterBadge.textContent = `${activeCount} / ${cards.length}`;
        }
    }

    // ==========================================
    // 🆕 9. DYNAMIC HOVER HOOK FOR FLOATING LOVE SYMBOLS
    // ==========================================
    let lastHeartSpawn = 0;
    const spawnThrottleMs = 150; // Controls rate limit density of heart objects

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const currentTime = Date.now();
            if (currentTime - lastHeartSpawn < spawnThrottleMs) return;
            lastHeartSpawn = currentTime;

            // Compute precision placement coordinate bounds within the card canvas
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Create structural visual heart node
            const heart = document.createElement('span');
            heart.className = 'floating-heart';
            heart.innerHTML = '❤️';
            heart.style.left = `${x}px`;
            heart.style.top = `${y}px`;

            // Give each particle a slight random variance for a natural feel
            const randomScale = 0.7 + Math.random() * 0.6;
            heart.style.transform = `translate(-50%, -50%) scale(${randomScale})`;

            card.appendChild(heart);

            // Clean up DOM tree footprint after the animation finishes running
            setTimeout(() => {
                heart.remove();
            }, 1200);
        });
    });

    // Initial load setup for appended configurations
    updateCounterBadge();
});