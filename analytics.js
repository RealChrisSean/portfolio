/**
 * Portfolio Analytics Tracking Script
 * Tracks page views, clicks, sessions, and user behavior
 */
(function() {
    'use strict';

    const TRACK_ENDPOINT = '/api/track';
    const HEARTBEAT_INTERVAL = 30000; // 30 seconds
    const STORAGE_KEY = 'portfolio_analytics';

    // Generate unique IDs
    function generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Get or create visitor ID (persists across sessions)
    function getVisitorId() {
        let data = getStorageData();
        if (!data.visitor_id) {
            data.visitor_id = generateId();
            setStorageData(data);
        }
        return data.visitor_id;
    }

    // Get or create session ID (new session after 30 min inactivity)
    function getSessionId() {
        let data = getStorageData();
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;

        if (!data.session_id || !data.last_activity || (now - data.last_activity) > thirtyMinutes) {
            data.session_id = generateId();
            data.session_start = now;
        }
        data.last_activity = now;
        setStorageData(data);
        return data.session_id;
    }

    // Storage helpers
    function getStorageData() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    }

    function setStorageData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            // Storage not available
        }
    }

    // Get session duration in seconds
    function getSessionDuration() {
        const data = getStorageData();
        if (!data.session_start) return 0;
        return Math.round((Date.now() - data.session_start) / 1000);
    }

    // Parse UTM parameters from URL
    function getUTMParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            utm_source: params.get('utm_source'),
            utm_medium: params.get('utm_medium'),
            utm_campaign: params.get('utm_campaign'),
            utm_term: params.get('utm_term'),
            utm_content: params.get('utm_content')
        };
    }

    // Get referrer (filter out same domain)
    function getReferrer() {
        const referrer = document.referrer;
        if (!referrer) return null;
        try {
            const refDomain = new URL(referrer).hostname;
            const currentDomain = window.location.hostname;
            if (refDomain === currentDomain) return null;
            return referrer;
        } catch (e) {
            return referrer;
        }
    }

    // Send tracking data
    function track(type, data) {
        const payload = {
            type,
            data: {
                visitor_id: getVisitorId(),
                session_id: getSessionId(),
                ...data
            }
        };

        // Use sendBeacon for reliability, especially on page unload
        if (navigator.sendBeacon) {
            navigator.sendBeacon(TRACK_ENDPOINT, JSON.stringify(payload));
        } else {
            fetch(TRACK_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(() => {});
        }
    }

    // Track page view
    function trackPageView() {
        const utmParams = getUTMParams();
        track('pageview', {
            page_url: window.location.href,
            page_title: document.title,
            referrer: getReferrer(),
            ...utmParams,
            screen_width: window.screen.width,
            screen_height: window.screen.height,
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight
        });
    }

    // Track click events
    function trackClick(event) {
        const target = event.target.closest('a, button, [onclick], [data-track]');
        if (!target) return;

        const elementText = (target.textContent || target.innerText || '').trim().substring(0, 100);

        track('click', {
            page_url: window.location.href,
            element_tag: target.tagName.toLowerCase(),
            element_id: target.id || null,
            element_class: target.className || null,
            element_text: elementText || null,
            element_href: target.href || target.getAttribute('data-href') || null,
            click_x: event.clientX,
            click_y: event.clientY
        });
    }

    // Send heartbeat to track session duration
    function sendHeartbeat() {
        track('heartbeat', {
            duration: getSessionDuration()
        });
    }

    // Track when user leaves
    function trackLeave() {
        track('leave', {
            duration: getSessionDuration()
        });
    }

    // Initialize tracking
    function init() {
        // Don't track in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('[Analytics] Disabled in development');
            return;
        }

        // Track initial page view
        trackPageView();

        // Track clicks
        document.addEventListener('click', trackClick, { passive: true });

        // Send heartbeats
        setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

        // Track when user leaves
        window.addEventListener('beforeunload', trackLeave);
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') {
                trackLeave();
            }
        });

        // Track SPA navigation (if applicable)
        let lastUrl = window.location.href;
        const observer = new MutationObserver(function() {
            if (window.location.href !== lastUrl) {
                lastUrl = window.location.href;
                trackPageView();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        console.log('[Analytics] Initialized');
    }

    // Start tracking when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
