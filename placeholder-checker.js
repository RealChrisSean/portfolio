/**
 * Placeholder Data Checker & Auto-Updater
 *
 * This script checks content.js for placeholder data and automatically
 * fetches real data from YouTube API when placeholders are detected.
 *
 * Usage: Run this before deploying or periodically to ensure all content has real data
 */

// Placeholder patterns to detect
const PLACEHOLDER_PATTERNS = {
    titles: [
        'Quick tip',
        'Developer Interview',
        'Video Tutorial',
        'Tech Talk'
    ],
    descriptions: [
        'Insightful conversation with industry experts.',
        'Learn essential coding concepts.',
        'Quick tip on',
        'Short-form content on'
    ],
    dates: [
        'Recent'
    ]
};

/**
 * Check if a content item has placeholder data
 */
function hasPlaceholderData(item) {
    // Check title
    const hasPlaceholderTitle = PLACEHOLDER_PATTERNS.titles.some(pattern =>
        item.title && item.title.includes(pattern)
    );

    // Check description
    const hasPlaceholderDescription = PLACEHOLDER_PATTERNS.descriptions.some(pattern =>
        item.description && item.description.includes(pattern)
    );

    // Check date
    const hasPlaceholderDate = PLACEHOLDER_PATTERNS.dates.includes(item.date);

    return hasPlaceholderTitle || hasPlaceholderDescription || hasPlaceholderDate;
}

/**
 * Fetch real data from YouTube API
 */
async function fetchYouTubeData(videoId, apiKey) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const video = data.items[0].snippet;
            const stats = data.items[0].statistics;

            // Format date
            const publishDate = new Date(video.publishedAt);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const formattedDate = `${months[publishDate.getMonth()]} ${publishDate.getDate()}, ${publishDate.getFullYear()}`;

            // Truncate description
            let description = video.description;
            if (description.length > 150) {
                description = description.substring(0, 147) + '...';
            }

            // Format view count
            const viewCount = parseInt(stats.viewCount);
            let formattedViews;
            if (viewCount >= 1000000) {
                formattedViews = (viewCount / 1000000).toFixed(1) + 'M';
            } else if (viewCount >= 1000) {
                formattedViews = (viewCount / 1000).toFixed(1) + 'K';
            } else {
                formattedViews = viewCount.toString();
            }

            return {
                title: video.title,
                description: description,
                date: formattedDate,
                viewCount: formattedViews
            };
        }

        return null;
    } catch (error) {
        console.error(`Error fetching video ${videoId}:`, error);
        return null;
    }
}

/**
 * Check all content arrays for placeholders
 */
async function checkAndUpdateContent(contentData, apiKey) {
    const updates = {
        videos: [],
        shorts: [],
        interviews: [],
        talks: []
    };

    // Check videos
    if (contentData.videos) {
        for (let i = 0; i < contentData.videos.length; i++) {
            const video = contentData.videos[i];
            if (hasPlaceholderData(video) && video.youtubeId) {
                console.log(`Found placeholder in videos[${i}]: ${video.title}`);
                const realData = await fetchYouTubeData(video.youtubeId, apiKey);
                if (realData) {
                    updates.videos.push({ index: i, data: realData, videoId: video.youtubeId });
                }
            }
        }
    }

    // Check shorts
    if (contentData.shorts) {
        for (let i = 0; i < contentData.shorts.length; i++) {
            const short = contentData.shorts[i];
            if (hasPlaceholderData(short) && short.youtubeId) {
                console.log(`Found placeholder in shorts[${i}]: ${short.title}`);
                const realData = await fetchYouTubeData(short.youtubeId, apiKey);
                if (realData) {
                    updates.shorts.push({ index: i, data: realData, videoId: short.youtubeId });
                }
            }
        }
    }

    // Check interviews
    if (contentData.interviews) {
        for (let i = 0; i < contentData.interviews.length; i++) {
            const interview = contentData.interviews[i];
            if (hasPlaceholderData(interview) && interview.youtubeId) {
                console.log(`Found placeholder in interviews[${i}]: ${interview.title}`);
                const realData = await fetchYouTubeData(interview.youtubeId, apiKey);
                if (realData) {
                    updates.interviews.push({ index: i, data: realData, videoId: interview.youtubeId });
                }
            }
        }
    }

    return updates;
}

/**
 * Main function to run the checker
 * This would be called when the page loads or periodically
 */
async function initPlaceholderChecker() {
    // Check if we have the API key (from config.js)
    if (typeof CONFIG === 'undefined' || !CONFIG.YOUTUBE_API_KEY) {
        console.warn('YouTube API key not found. Skipping placeholder check.');
        return;
    }

    // Check if contentData exists
    if (typeof contentData === 'undefined') {
        console.warn('contentData not found. Skipping placeholder check.');
        return;
    }

    console.log('Checking for placeholder data...');
    const updates = await checkAndUpdateContent(contentData, CONFIG.YOUTUBE_API_KEY);

    // Log what was found
    const totalPlaceholders =
        updates.videos.length +
        updates.shorts.length +
        updates.interviews.length;

    if (totalPlaceholders > 0) {
        console.log(`Found ${totalPlaceholders} items with placeholder data:`);
        console.log(`- Videos: ${updates.videos.length}`);
        console.log(`- Shorts: ${updates.shorts.length}`);
        console.log(`- Interviews: ${updates.interviews.length}`);

        // Apply updates to contentData
        updates.videos.forEach(update => {
            Object.assign(contentData.videos[update.index], update.data);
        });
        updates.shorts.forEach(update => {
            Object.assign(contentData.shorts[update.index], update.data);
        });
        updates.interviews.forEach(update => {
            Object.assign(contentData.interviews[update.index], update.data);
        });

        console.log('Placeholder data has been updated with real YouTube data!');

        // Save to localStorage so we don't fetch again
        try {
            localStorage.setItem('contentData', JSON.stringify(contentData));
            localStorage.setItem('contentDataLastUpdated', new Date().toISOString());
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    } else {
        console.log('No placeholder data found. All content looks good!');
    }

    return updates;
}

// Auto-run on page load (only in browser environment)
if (typeof window !== 'undefined') {
    // Check if we should run (only run once per day to avoid API quota issues)
    const lastCheck = localStorage.getItem('contentDataLastUpdated');
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (!lastCheck || new Date(lastCheck) < oneDayAgo) {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initPlaceholderChecker);
        } else {
            initPlaceholderChecker();
        }
    }
}
