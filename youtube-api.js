async function fetchYouTubeVideo(videoId) {
    const API_KEY = CONFIG.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const video = data.items[0].snippet;
            const stats = data.items[0].statistics;
            return {
                title: video.title,
                description: video.description,
                publishedAt: video.publishedAt,
                thumbnail: video.thumbnails.maxres?.url || video.thumbnails.high?.url || video.thumbnails.default?.url,
                channelTitle: video.channelTitle,
                viewCount: stats.viewCount,
                likeCount: stats.likeCount,
                commentCount: stats.commentCount
            };
        } else {
            console.error(`No video found for ID: ${videoId}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching video ${videoId}:`, error);
        return null;
    }
}

async function fetchMultipleYouTubeVideos(videoIds) {
    const promises = videoIds.map(id => fetchYouTubeVideo(id));
    return Promise.all(promises);
}

function formatYouTubeDate(isoDate) {
    const date = new Date(isoDate);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
}

function truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatViewCount(count) {
    const num = parseInt(count);
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}
