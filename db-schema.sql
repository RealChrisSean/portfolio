-- Analytics Database Schema for TiDB

-- Page Views - every page hit
CREATE TABLE IF NOT EXISTS page_views (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    visitor_id VARCHAR(36) NOT NULL,
    page_url VARCHAR(500) NOT NULL,
    page_title VARCHAR(255),
    referrer VARCHAR(500),
    referrer_domain VARCHAR(255),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    device_type VARCHAR(20),
    browser VARCHAR(50),
    browser_version VARCHAR(20),
    os VARCHAR(50),
    os_version VARCHAR(20),
    screen_width INT,
    screen_height INT,
    viewport_width INT,
    viewport_height INT,
    country VARCHAR(100),
    city VARCHAR(100),
    region VARCHAR(100),
    ip_hash VARCHAR(64),
    user_agent TEXT,
    is_bot BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session (session_id),
    INDEX idx_visitor (visitor_id),
    INDEX idx_created (created_at),
    INDEX idx_page_url (page_url(100)),
    INDEX idx_referrer_domain (referrer_domain)
);

-- Click Events - what users click
CREATE TABLE IF NOT EXISTS click_events (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    visitor_id VARCHAR(36) NOT NULL,
    page_url VARCHAR(500) NOT NULL,
    element_tag VARCHAR(50),
    element_id VARCHAR(100),
    element_class VARCHAR(255),
    element_text VARCHAR(255),
    element_href VARCHAR(500),
    click_x INT,
    click_y INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session (session_id),
    INDEX idx_created (created_at),
    INDEX idx_page_url (page_url(100))
);

-- Sessions - visitor sessions with duration
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(36) PRIMARY KEY,
    visitor_id VARCHAR(36) NOT NULL,
    entry_page VARCHAR(500),
    exit_page VARCHAR(500),
    referrer VARCHAR(500),
    referrer_domain VARCHAR(255),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    page_views INT DEFAULT 1,
    duration_seconds INT DEFAULT 0,
    is_bounce BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_visitor (visitor_id),
    INDEX idx_started (started_at),
    INDEX idx_ended (ended_at),
    INDEX idx_referrer_domain (referrer_domain)
);

-- Daily Stats - aggregated daily metrics for fast queries
CREATE TABLE IF NOT EXISTS daily_stats (
    date DATE PRIMARY KEY,
    total_visitors INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    total_page_views INT DEFAULT 0,
    total_clicks INT DEFAULT 0,
    avg_session_duration INT DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    top_pages JSON,
    top_referrers JSON,
    devices JSON,
    browsers JSON,
    countries JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date)
);

-- Real-time active visitors (cleaned up periodically)
CREATE TABLE IF NOT EXISTS active_visitors (
    visitor_id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    page_url VARCHAR(500),
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_last_seen (last_seen)
);

-- Email notification log
CREATE TABLE IF NOT EXISTS email_notifications (
    id VARCHAR(36) PRIMARY KEY,
    notification_type VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data JSON,
    INDEX idx_type_date (notification_type, sent_at)
);
