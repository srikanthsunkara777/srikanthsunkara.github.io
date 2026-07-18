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

    // --- About Me Modal Elements ---
    const openModalBtn = document.getElementById('about-me-trigger');
    const closeModalX = document.getElementById('modal-close-x');
    const closeModalBtn = document.getElementById('modal-close-btn');
    const modalOverlay = document.getElementById('about-modal');
    const modalCard = modalOverlay ? modalOverlay.querySelector('.modal-card') : null;

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
    // 3.5 PROGRESS HISTORY & AUTHOR PROFILE IMAGE
    // ==========================================
    const historyBadge = document.getElementById('reader-history-badge');

    // 📊 Read Progress Telemetry Scanning Engine
    function updateReaderHistoryMetrics() {
        if (!historyBadge) return;

        let totalReadSections = 0;

        // Scan for keys marked as read inside deep guide pages
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('_topic_') && localStorage.getItem(key) === 'completed') {
                totalReadSections++;
            }
        }

        if (totalReadSections > 0) {
            historyBadge.innerHTML = `📘 You read <strong>${totalReadSections}</strong> topic${totalReadSections > 1 ? 's' : ''} previously. Welcome back!`;
        } else {
            historyBadge.innerHTML = `🎯 No topics completed yet. Select a guide below to get started!`;
        }
    }

    // Initialize reader metrics badge on initial dashboard landing execution
    updateReaderHistoryMetrics();

    // 🖼️ Srikanth Sunkara (Author) Profile Image Layer
    const authorImg = document.getElementById('profile-avatar');
    const authorInput = document.getElementById('avatar-file-input');

    // Load custom uploaded base64 data if it exists, otherwise fall back to raw image file
    const savedAuthorAvatar = localStorage.getItem('author_profile_avatar');
    if (savedAuthorAvatar && authorImg) {
        authorImg.src = savedAuthorAvatar;
    }

    if (authorImg && authorInput) {
        authorInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 1500000) {
                alert("Please upload a smaller image file (under 1.5MB) to keep modal loading fast.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Data = event.target.result;
                localStorage.setItem('author_profile_avatar', base64Data);
                authorImg.src = base64Data;
            };
            reader.readAsDataURL(file);
        });
    }

    // ==========================================
    // 4. UNIFIED SEARCH & FILTER
    // ==========================================
    function filterCards() {
        const searchText = searchBar.value.toLowerCase();

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
                if (typeof highlightMatchingText === 'function') {
                    highlightMatchingText(card, searchText);
                }
            } else {
                card.style.display = 'none';
            }
        });

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
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchBar.value = '';
            clearSearchBtn.style.display = 'none';
            searchBar.focus();
            filterCards();
        });
    }

    window.addEventListener('scroll', () => {
        if (backToTopBtn) {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==========================================
    // 5.5 ABOUT ME INTERACTIVE MODAL ENGINE
    // ==========================================
    const openModal = (e) => {
        if (e) e.preventDefault();
        if (modalOverlay) {
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            if (modalCard) {
                modalCard.style.maxHeight = '85vh';
                modalCard.style.overflowY = 'auto';
            }

            updateReaderHistoryMetrics();
        }
    };

    const closeModal = () => {
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeModalX) closeModalX.addEventListener('click', closeModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // ==========================================
    // 6. GLOBAL HOTKEY ENGINE (Focus & Escape)
    // ==========================================
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchBar) {
            if (!modalOverlay || !modalOverlay.classList.contains('active')) {
                e.preventDefault();
                searchBar.focus();
                searchBar.select();
            }
        }
        if (e.key === 'Escape') {
            if (modalOverlay && modalOverlay.classList.contains('active')) {
                closeModal();
            }
            else if (document.activeElement === searchBar) {
                searchBar.value = '';
                searchBar.blur();
                filterCards();
            }
        }
    });

    // ==========================================
    // 7. AUTOMATIC VISUAL MATCH HIGHLIGHTER
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

        titleEl.innerHTML = card.dataset.originalTitle.replace(regex, `<mark style="background: rgba(254, 240, 138, 0.6); color: #000; border-radius: 2px; padding: 0 2px;">$1</mark>`);
        descEl.innerHTML = card.dataset.originalDesc.replace(regex, `<mark style="background: rgba(254, 240, 138, 0.6); color: #000; border-radius: 2px; padding: 0 2px;">$1</mark>`);
    }

    // ==========================================
    // 8. INLINE SELECTION SEARCH MAGNIFIER ENGINE
    // ==========================================
    let magnifierBubble = null;
    const mainWorkspace = document.querySelector('.container');

    if (mainWorkspace) {
        mainWorkspace.addEventListener('mouseup', () => {
            removeMagnifierBubble();

            const selection = window.getSelection();
            const selectedText = selection.toString().trim();

            if (selectedText.length > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                magnifierBubble = document.createElement('button');
                magnifierBubble.innerHTML = '🔍 Search Google';
                magnifierBubble.setAttribute('aria-label', `Search Google for ${selectedText}`);

                Object.assign(magnifierBubble.style, {
                    position: 'fixed',
                    top: `${rect.top - 42}px`,
                    left: `${rect.left + (rect.width / 2) - 65}px`,
                    zIndex: '2000',
                    background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)',
                    transition: 'transform 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                });

                magnifierBubble.addEventListener('mouseenter', () => magnifierBubble.style.transform = 'scale(1.05)');
                magnifierBubble.addEventListener('mouseleave', () => magnifierBubble.style.transform = 'scale(1)');

                magnifierBubble.addEventListener('mousedown', (clickEvent) => {
                    clickEvent.preventDefault();
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedText)}`, '_blank', 'noopener,noreferrer');
                    removeMagnifierBubble();
                });

                document.body.appendChild(magnifierBubble);
            }
        });
    }

    document.addEventListener('mousedown', (e) => {
        if (magnifierBubble && !magnifierBubble.contains(e.target)) {
            removeMagnifierBubble();
        }
    });

    function removeMagnifierBubble() {
        if (magnifierBubble) {
            magnifierBubble.remove();
            magnifierBubble = null;
        }
    }

    // ==========================================
    // 9. METRIC BADGE COUNTER TELEMETRY
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
    // 10. DYNAMIC HOVER HOOK FOR FLOATING LOVE SYMBOLS
    // ==========================================
    let lastHeartSpawn = 0;
    const spawnThrottleMs = 150;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const currentTime = Date.now();
            if (currentTime - lastHeartSpawn < spawnThrottleMs) return;
            lastHeartSpawn = currentTime;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const heart = document.createElement('span');
            heart.className = 'floating-heart';
            heart.innerHTML = '❤️';
            heart.style.left = `${x}px`;
            heart.style.top = `${y}px`;

            const randomScale = 0.7 + Math.random() * 0.6;
            heart.style.transform = `translate(-50%, -50%) scale(${randomScale})`;

            card.appendChild(heart);

            setTimeout(() => {
                heart.remove();
            }, 1200);
        });
    });

    updateCounterBadge();
});