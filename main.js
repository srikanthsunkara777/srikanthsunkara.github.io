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
            } else {
                card.style.display = 'none';
            }
        });
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
});