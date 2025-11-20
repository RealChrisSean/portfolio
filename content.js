// Portfolio Content Data
// Easy to edit - just add new items to the arrays below!

const portfolioContent = {
    // ===================
    // VIDEOS
    // ===================
    // Just add: title, description, date, and youtubeId
    // Thumbnail URLs are auto-generated!
    // Optional: Add customThumbnail to override the auto-generated thumbnail
    videos: [
        {
            title: 'Build a Semantic Q&A App in Minutes',
            description: 'Learn how to quickly build intelligent Q&A applications using semantic search and AI.',
            date: 'Jun 19, 2024',
            youtubeId: 'LT-BtP84mdQ'
        },
        {
            title: 'How to deploy a TiDB Cluster using TiUP',
            description: 'Step-by-step guide to deploying your TiDB cluster with TiUP deployment tool.',
            date: 'May 2024',
            youtubeId: 'nyJm5udXpVQ'
        },
        {
            title: 'Migrate your Data from Planetscale to TiDB',
            description: 'Complete walkthrough for migrating your database from Planetscale to TiDB Cloud.',
            date: 'Apr 2024',
            youtubeId: 'c1qEuQ8876g'
        },
        {
            title: 'Build Your First Cluster with TiDB',
            description: 'Get started with TiDB by building your first database cluster from scratch.',
            date: 'Mar 2024',
            youtubeId: '3jfxsGZExRw'
        },
        {
            title: 'Introduction to TiDB Cloud',
            description: 'Your first look at TiDB Cloud - a fully-managed database-as-a-service for modern applications.',
            date: 'Feb 2024',
            youtubeId: 'YU6jdrRc2cc'
        },
        {
            title: 'Introduction to TiDB OSS',
            description: 'Getting started with TiDB Open Source - exploring the distributed SQL database architecture.',
            date: 'Jan 2024',
            youtubeId: 'MQmn8GzZMRY'
        }
    ],

    // ===================
    // TALKS
    // ===================
    // Required: title, description, date, conference
    // For talks WITH recordings: add youtubeId and set hasRecording: true
    // For talks WITHOUT recordings: add customThumbnail, externalLink, and set hasRecording: false
    // Optional: customThumbnail (overrides auto-generated YouTube thumbnail)
    talks: [
        {
            title: 'Demystifying Data Replication with PostgreSQL',
            description: 'Conference talk at Percona Live exploring PostgreSQL replication strategies and best practices.',
            date: 'Jun 26, 2024',
            conference: 'Percona Live',
            youtubeId: 'vlzuyVwZUao',
            hasRecording: true
        },
        {
            title: 'SF Awesome AI Dev Tools',
            description: 'Showcasing the latest AI development tools and frameworks at San Francisco meetup.',
            date: 'Jun 2024',
            conference: 'SF Meetup',
            hasRecording: false,
            externalLink: 'https://luma.com/y2mjhnfw',
            customThumbnail: 'https://placehold.co/1920x1080/0f172a/10b981?text=SF+AI+Dev+Tools'
        },
        {
            title: 'From Vectors to Agentic Memory: Architecting for Supercharged AI Development',
            description: 'Deep dive into AI architecture patterns and memory systems for modern AI applications.',
            date: 'Jun 2024',
            conference: 'SF Meetup',
            hasRecording: false,
            externalLink: 'https://luma.com/pquy8jlb',
            customThumbnail: 'https://placehold.co/1920x1080/0f172a/10b981?text=Agentic+Memory'
        },
        {
            title: 'Open Source ELT For Everyone – Level Up With Custom Connectors',
            description: 'Conference talk at Big Data LDN covering open-source ELT pipelines and building custom data connectors.',
            date: 'Oct 18, 2022',
            conference: 'Big Data LDN',
            youtubeId: 'Jn9N1kljCZw',
            hasRecording: true
        }
    ],

    // ===================
    // BLOGS
    // ===================
    // Add blogs here when you publish them
    // Required: title, description, date, link
    // Optional: customThumbnail (if not provided, uses default placeholder)
    // Example:
    /*
    {
        title: 'Your Blog Title',
        description: 'Brief description of your blog post.',
        date: 'Dec 2024',
        link: 'https://your-blog-url.com',
        customThumbnail: 'https://your-thumbnail-url.jpg' // Optional
    }
    */
    blogs: []
};

// ===================
// HELPER FUNCTIONS
// ===================

// Auto-generate YouTube thumbnail URL from video ID
function getYouTubeThumbnail(videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// Auto-generate YouTube video URL from video ID
function getYouTubeUrl(videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
}

// Convert content to format expected by the HTML pages
function getAllContent() {
    const content = [];

    // Add videos
    portfolioContent.videos.forEach(video => {
        content.push({
            type: 'video',
            title: video.title,
            description: video.description,
            date: video.date,
            icon: 'fab fa-youtube',
            thumbnail: video.customThumbnail || getYouTubeThumbnail(video.youtubeId),
            link: getYouTubeUrl(video.youtubeId)
        });
    });

    // Add talks
    portfolioContent.talks.forEach(talk => {
        content.push({
            type: 'talk',
            title: talk.title,
            description: talk.description,
            date: talk.date,
            icon: 'fas fa-microphone-alt',
            thumbnail: talk.youtubeId ? getYouTubeThumbnail(talk.youtubeId) : talk.customThumbnail,
            link: talk.youtubeId ? getYouTubeUrl(talk.youtubeId) : talk.externalLink,
            hasRecording: talk.hasRecording,
            conference: talk.conference
        });
    });

    // Add blogs
    portfolioContent.blogs.forEach(blog => {
        content.push({
            type: 'blog',
            title: blog.title,
            description: blog.description,
            date: blog.date,
            icon: 'fas fa-book-open',
            thumbnail: blog.customThumbnail || 'https://placehold.co/1920x1080/ffffff/0ea5e9?text=Blog+Post',
            link: blog.link
        });
    });

    return content;
}

// Get latest 3 items for homepage
function getLatestContent(count = 3) {
    const all = getAllContent();

    // Sort by date (newest first) - same parseDate logic
    all.sort((a, b) => {
        const months = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
        };

        function parseDate(dateString) {
            const parts = dateString.toLowerCase().split(/[\s,]+/).filter(p => p);
            if (parts.length === 3) {
                const month = months[parts[0]];
                const day = parseInt(parts[1]);
                const year = parseInt(parts[2]);
                return new Date(year, month, day);
            } else if (parts.length === 2) {
                const month = months[parts[0]];
                const year = parseInt(parts[1]);
                return new Date(year, month, 1);
            }
            return new Date(0);
        }

        return parseDate(b.date) - parseDate(a.date);
    });

    return all.slice(0, count);
}
