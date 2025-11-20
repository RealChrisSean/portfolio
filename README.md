
# Portfolio Site

Simple portfolio site with glassmorphism cards and Vegas-inspired neon accents. No frameworks, just vanilla HTML/CSS/JS.

## Project Structure

```
├── index.html           # Main landing page
├── all-content.html     # Full content archive with filtering
├── content.js           # All your content data (videos, talks, blogs)
└── app.js              # Currently empty
```

## Adding New Content

Everything lives in `content.js` - just edit that file to add videos, talks, or blogs.

### Adding Videos

```javascript
videos: [
    {
        title: 'Your Video Title',
        description: 'What the video is about.',
        date: 'Jun 19, 2024',
        youtubeId: 'YOUR_VIDEO_ID'  // Just the ID, not the full URL
    }
]
```

Thumbnails are auto-generated from YouTube. If you don't like the default thumbnail Add `customThumbnail: 'your-image-url.jpg'`

### Adding Talks

**With recording:**
```javascript
{
    title: 'Talk Title',
    description: 'What you talked about.',
    date: 'Jun 26, 2024',
    conference: 'Conference Name',
    youtubeId: 'YOUR_VIDEO_ID',
    hasRecording: true
}
```

**Without recording:**
```javascript
{
    title: 'Talk Title',
    description: 'What you talked about.',
    date: 'Jun 2024',
    conference: 'Conference Name',
    hasRecording: false,
    externalLink: 'https://link-to-event.com',
    customThumbnail: 'https://your-image.jpg'
}
```

### Adding Blogs

```javascript
blogs: [
    {
        title: 'Blog Post Title',
        description: 'What it's about.',
        date: 'Dec 2024',
        link: 'https://your-blog-url.com',
        customThumbnail: 'https://optional-image.jpg'  // Optional
    }
]
```

## Customizing Personal Info

### Homepage (`index.html`)

**Your name and location:**
Around line 218:
```html
<p class="hero-subtitle reveal">Your City, State</p>
<h1 class="reveal">Hi, I'm <span class="highlight">Your Name</span>.</h1>
```

**Typing animation text:**
Around line 222, edit the phrases:
```javascript
const phrases = [
    "your first phrase",
    "your second phrase",
    "your third phrase"
];
```

**Social links:**
Around line 234:
```html
<a href="https://twitter.com/yourusername">
<a href="https://github.com/yourusername">
<a href="https://linkedin.com/in/yourusername">
<a href="https://youtube.com/@yourchannel">
```

**Email:**
Around line 355:
```html
<a href="mailto:your.email@example.com" class="hero-btn">Get in Touch</a>
```

### Content Page (`all-content.html`)

Update the page header around line 198:
```html
<h1>All <span class="highlight">Content</span></h1>
<p>Your description here.</p>
```

### Colors

Both files use the same color scheme. Edit the CSS variables at the top:

```css
:root {
    --accent-primary: #0ea5e9;   /* Cyan */
    --accent-vegas: #c026d3;      /* Magenta */
}
```

## Deploying

**GitHub Pages:**
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/portfolio.git
git push -u origin main
```

Then go to Settings → Pages → Deploy from main branch.

**Vercel/Netlify:** Just connect your repo and deploy.

## How It Works

- `content.js` manages all your videos/talks/blogs
- Homepage shows the 3 most recent items
- All content page shows everything with filters
- YouTube thumbnails are auto-fetched
- Infinite scroll loads more content as you scroll

## Notes

- `app.js` is currently empty - feel free to use it if you need custom JS
- Images are lazy-loaded for performance
- Works on mobile, tablet, desktop
- No build process needed

That's it. Just edit `content.js` for new content and push.
