const { query, queryOne } = require('./_lib/db');

// Time range helpers
function getTimeRangeSQL(range) {
    const ranges = {
        'live': 'DATE_SUB(NOW(), INTERVAL 5 MINUTE)',
        '1h': 'DATE_SUB(NOW(), INTERVAL 1 HOUR)',
        '12h': 'DATE_SUB(NOW(), INTERVAL 12 HOUR)',
        '24h': 'DATE_SUB(NOW(), INTERVAL 24 HOUR)',
        '7d': 'DATE_SUB(NOW(), INTERVAL 7 DAY)',
        '14d': 'DATE_SUB(NOW(), INTERVAL 14 DAY)',
        '30d': 'DATE_SUB(NOW(), INTERVAL 30 DAY)',
        '60d': 'DATE_SUB(NOW(), INTERVAL 60 DAY)',
        '90d': 'DATE_SUB(NOW(), INTERVAL 90 DAY)',
        '1y': 'DATE_SUB(NOW(), INTERVAL 1 YEAR)',
        'all': '1970-01-01'
    };
    return ranges[range] || ranges['24h'];
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const range = req.query.range || '24h';
        const timeSQL = getTimeRangeSQL(range);

        // Get all stats in parallel
        const [
            liveVisitors,
            totalStats,
            topPages,
            topReferrers,
            devices,
            browsers,
            operatingSystems,
            countries,
            topClicks,
            visitorChart,
            recentVisitors
        ] = await Promise.all([
            // Live visitors (active in last 5 minutes)
            queryOne(`
                SELECT COUNT(DISTINCT visitor_id) as count
                FROM active_visitors
                WHERE last_seen > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
            `),

            // Total stats for time range
            queryOne(`
                SELECT
                    COUNT(*) as total_pageviews,
                    COUNT(DISTINCT visitor_id) as unique_visitors,
                    COUNT(DISTINCT session_id) as total_sessions
                FROM page_views
                WHERE created_at > ${timeSQL}
            `),

            // Top pages
            query(`
                SELECT page_url, page_title, COUNT(*) as views, COUNT(DISTINCT visitor_id) as unique_views
                FROM page_views
                WHERE created_at > ${timeSQL}
                GROUP BY page_url, page_title
                ORDER BY views DESC
                LIMIT 10
            `),

            // Top referrers
            query(`
                SELECT
                    COALESCE(referrer_domain, 'Direct') as source,
                    COUNT(*) as visits,
                    COUNT(DISTINCT visitor_id) as unique_visitors
                FROM page_views
                WHERE created_at > ${timeSQL}
                GROUP BY referrer_domain
                ORDER BY visits DESC
                LIMIT 10
            `),

            // Device breakdown
            query(`
                SELECT device_type, COUNT(DISTINCT visitor_id) as count
                FROM page_views
                WHERE created_at > ${timeSQL}
                GROUP BY device_type
                ORDER BY count DESC
            `),

            // Browser breakdown
            query(`
                SELECT browser, COUNT(DISTINCT visitor_id) as count
                FROM page_views
                WHERE created_at > ${timeSQL}
                GROUP BY browser
                ORDER BY count DESC
                LIMIT 10
            `),

            // OS breakdown
            query(`
                SELECT os, COUNT(DISTINCT visitor_id) as count
                FROM page_views
                WHERE created_at > ${timeSQL}
                GROUP BY os
                ORDER BY count DESC
                LIMIT 10
            `),

            // Countries
            query(`
                SELECT COALESCE(country, 'Unknown') as country, COUNT(DISTINCT visitor_id) as count
                FROM page_views
                WHERE created_at > ${timeSQL}
                GROUP BY country
                ORDER BY count DESC
                LIMIT 20
            `),

            // Top clicked elements
            query(`
                SELECT
                    element_tag,
                    element_text,
                    element_href,
                    page_url,
                    COUNT(*) as clicks
                FROM click_events
                WHERE created_at > ${timeSQL}
                GROUP BY element_tag, element_text, element_href, page_url
                ORDER BY clicks DESC
                LIMIT 20
            `),

            // Visitor chart data (hourly for 24h/12h, daily for longer)
            range === '24h' || range === '12h' || range === '1h' || range === 'live'
                ? query(`
                    SELECT
                        DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as time_bucket,
                        COUNT(*) as pageviews,
                        COUNT(DISTINCT visitor_id) as visitors
                    FROM page_views
                    WHERE created_at > ${timeSQL}
                    GROUP BY time_bucket
                    ORDER BY time_bucket ASC
                `)
                : query(`
                    SELECT
                        DATE(created_at) as time_bucket,
                        COUNT(*) as pageviews,
                        COUNT(DISTINCT visitor_id) as visitors
                    FROM page_views
                    WHERE created_at > ${timeSQL}
                    GROUP BY time_bucket
                    ORDER BY time_bucket ASC
                `),

            // Recent visitors
            query(`
                SELECT
                    pv.visitor_id,
                    pv.page_url,
                    pv.page_title,
                    pv.referrer_domain,
                    pv.country,
                    pv.city,
                    pv.device_type,
                    pv.browser,
                    pv.os,
                    pv.created_at
                FROM page_views pv
                WHERE pv.created_at > ${timeSQL}
                ORDER BY pv.created_at DESC
                LIMIT 50
            `)
        ]);

        // Session stats
        const sessionStats = await queryOne(`
            SELECT
                AVG(duration_seconds) as avg_duration,
                SUM(CASE WHEN is_bounce = TRUE THEN 1 ELSE 0 END) / COUNT(*) * 100 as bounce_rate
            FROM sessions
            WHERE started_at > ${timeSQL}
        `);

        // UTM campaign breakdown
        const utmCampaigns = await query(`
            SELECT
                utm_source,
                utm_medium,
                utm_campaign,
                COUNT(*) as visits,
                COUNT(DISTINCT visitor_id) as unique_visitors
            FROM page_views
            WHERE created_at > ${timeSQL}
                AND (utm_source IS NOT NULL OR utm_medium IS NOT NULL OR utm_campaign IS NOT NULL)
            GROUP BY utm_source, utm_medium, utm_campaign
            ORDER BY visits DESC
            LIMIT 20
        `);

        return res.status(200).json({
            success: true,
            range,
            data: {
                live_visitors: liveVisitors?.count || 0,
                total_pageviews: totalStats?.total_pageviews || 0,
                unique_visitors: totalStats?.unique_visitors || 0,
                total_sessions: totalStats?.total_sessions || 0,
                avg_session_duration: Math.round(sessionStats?.avg_duration || 0),
                bounce_rate: Math.round(sessionStats?.bounce_rate || 0),
                top_pages: topPages,
                top_referrers: topReferrers,
                devices: devices,
                browsers: browsers,
                operating_systems: operatingSystems,
                countries: countries,
                top_clicks: topClicks,
                visitor_chart: visitorChart,
                recent_visitors: recentVisitors,
                utm_campaigns: utmCampaigns
            }
        });

    } catch (error) {
        console.error('Dashboard data error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
