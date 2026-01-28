const { query } = require('./_lib/db');
const { v4: uuidv4 } = require('uuid');

// Parse user agent for device/browser/OS info
function parseUserAgent(ua) {
    const result = {
        device_type: 'desktop',
        browser: 'Unknown',
        browser_version: '',
        os: 'Unknown',
        os_version: '',
        is_bot: false
    };

    if (!ua) return result;

    // Bot detection
    const botPatterns = /bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck/i;
    if (botPatterns.test(ua)) {
        result.is_bot = true;
    }

    // Device type
    if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
        result.device_type = /ipad|tablet/i.test(ua) ? 'tablet' : 'mobile';
    }

    // Browser detection
    if (/edg/i.test(ua)) {
        result.browser = 'Edge';
        const match = ua.match(/edg\/(\d+)/i);
        if (match) result.browser_version = match[1];
    } else if (/chrome/i.test(ua) && !/chromium/i.test(ua)) {
        result.browser = 'Chrome';
        const match = ua.match(/chrome\/(\d+)/i);
        if (match) result.browser_version = match[1];
    } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
        result.browser = 'Safari';
        const match = ua.match(/version\/(\d+)/i);
        if (match) result.browser_version = match[1];
    } else if (/firefox/i.test(ua)) {
        result.browser = 'Firefox';
        const match = ua.match(/firefox\/(\d+)/i);
        if (match) result.browser_version = match[1];
    }

    // OS detection
    if (/windows/i.test(ua)) {
        result.os = 'Windows';
        if (/windows nt 10/i.test(ua)) result.os_version = '10';
        else if (/windows nt 11/i.test(ua)) result.os_version = '11';
    } else if (/macintosh|mac os x/i.test(ua)) {
        result.os = 'macOS';
        const match = ua.match(/mac os x (\d+[._]\d+)/i);
        if (match) result.os_version = match[1].replace('_', '.');
    } else if (/linux/i.test(ua)) {
        result.os = 'Linux';
    } else if (/android/i.test(ua)) {
        result.os = 'Android';
        const match = ua.match(/android (\d+)/i);
        if (match) result.os_version = match[1];
    } else if (/iphone|ipad|ipod/i.test(ua)) {
        result.os = 'iOS';
        const match = ua.match(/os (\d+)/i);
        if (match) result.os_version = match[1];
    }

    return result;
}

// Extract domain from URL
function getDomain(url) {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        return parsed.hostname;
    } catch {
        return null;
    }
}

// Simple hash for IP (privacy)
function hashIP(ip) {
    if (!ip) return null;
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
        const char = ip.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

// Get country from IP using Vercel's geo headers
function getGeoFromHeaders(headers) {
    return {
        country: headers['x-vercel-ip-country'] || null,
        city: headers['x-vercel-ip-city'] || null,
        region: headers['x-vercel-ip-country-region'] || null
    };
}

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { type, data } = req.body;
        const ua = req.headers['user-agent'] || '';
        const uaInfo = parseUserAgent(ua);
        const geo = getGeoFromHeaders(req.headers);
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection?.remoteAddress;
        const ipHash = hashIP(ip);

        // Skip bots
        if (uaInfo.is_bot) {
            return res.status(200).json({ success: true, skipped: 'bot' });
        }

        if (type === 'pageview') {
            const id = uuidv4();
            const {
                session_id,
                visitor_id,
                page_url,
                page_title,
                referrer,
                utm_source,
                utm_medium,
                utm_campaign,
                utm_term,
                utm_content,
                screen_width,
                screen_height,
                viewport_width,
                viewport_height
            } = data;

            const referrerDomain = getDomain(referrer);

            await query(`
                INSERT INTO page_views (
                    id, session_id, visitor_id, page_url, page_title, referrer, referrer_domain,
                    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
                    device_type, browser, browser_version, os, os_version,
                    screen_width, screen_height, viewport_width, viewport_height,
                    country, city, region, ip_hash, user_agent, is_bot
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                id, session_id, visitor_id, page_url, page_title, referrer, referrerDomain,
                utm_source, utm_medium, utm_campaign, utm_term, utm_content,
                uaInfo.device_type, uaInfo.browser, uaInfo.browser_version, uaInfo.os, uaInfo.os_version,
                screen_width, screen_height, viewport_width, viewport_height,
                geo.country, geo.city, geo.region, ipHash, ua, uaInfo.is_bot
            ]);

            // Update or create session
            const existingSession = await query(
                'SELECT id FROM sessions WHERE id = ?',
                [session_id]
            );

            if (existingSession.length === 0) {
                await query(`
                    INSERT INTO sessions (
                        id, visitor_id, entry_page, exit_page, referrer, referrer_domain,
                        utm_source, utm_medium, utm_campaign, device_type, browser, os,
                        country, city, page_views, is_bounce
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, TRUE)
                `, [
                    session_id, visitor_id, page_url, page_url, referrer, referrerDomain,
                    utm_source, utm_medium, utm_campaign, uaInfo.device_type, uaInfo.browser,
                    uaInfo.os, geo.country, geo.city
                ]);
            } else {
                await query(`
                    UPDATE sessions
                    SET exit_page = ?, page_views = page_views + 1, is_bounce = FALSE, ended_at = NOW()
                    WHERE id = ?
                `, [page_url, session_id]);
            }

            // Update active visitors
            await query(`
                INSERT INTO active_visitors (visitor_id, session_id, page_url, last_seen)
                VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE session_id = ?, page_url = ?, last_seen = NOW()
            `, [visitor_id, session_id, page_url, session_id, page_url]);

        } else if (type === 'click') {
            const id = uuidv4();
            const {
                session_id,
                visitor_id,
                page_url,
                element_tag,
                element_id,
                element_class,
                element_text,
                element_href,
                click_x,
                click_y
            } = data;

            await query(`
                INSERT INTO click_events (
                    id, session_id, visitor_id, page_url, element_tag, element_id,
                    element_class, element_text, element_href, click_x, click_y
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                id, session_id, visitor_id, page_url, element_tag, element_id,
                element_class, element_text?.substring(0, 255), element_href, click_x, click_y
            ]);

        } else if (type === 'heartbeat') {
            const { visitor_id, session_id, duration } = data;

            // Update session duration
            await query(`
                UPDATE sessions SET duration_seconds = ?, ended_at = NOW() WHERE id = ?
            `, [duration, session_id]);

            // Update active visitors
            await query(`
                INSERT INTO active_visitors (visitor_id, session_id, last_seen)
                VALUES (?, ?, NOW())
                ON DUPLICATE KEY UPDATE last_seen = NOW()
            `, [visitor_id, session_id]);

        } else if (type === 'leave') {
            const { visitor_id, session_id, duration } = data;

            // Final session update
            await query(`
                UPDATE sessions SET duration_seconds = ?, ended_at = NOW() WHERE id = ?
            `, [duration, session_id]);

            // Remove from active visitors
            await query('DELETE FROM active_visitors WHERE visitor_id = ?', [visitor_id]);
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Tracking error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
