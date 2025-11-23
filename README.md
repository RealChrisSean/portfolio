# Portfolio Site

Portfolio site with some glassmorphism cards and Vegas neon colors. No frameworks - just HTML, CSS, and JS.

## What's What

```
├── index.html           # Landing page
├── all-content.html     # Everything I've made, with filters
├── content.js           # All my videos, talks, blogs
└── app.js              # Empty right now
```

## Adding Content

Edit `content.js` - that's it.

### Videos

```javascript
videos: [
    {
        title: 'Your Video Title',
        description: 'What it's about',
        date: 'Jun 19, 2024',
        youtubeId: 'YOUR_VIDEO_ID'  // just the ID
    }
]
```

YouTube thumbnails load automatically. If you want a custom one, add `customThumbnail: 'your-image.jpg'`

### Talks

**With recording:**
```javascript
{
    title: 'Talk Title',
    description: 'What you talked about',
    date: 'Jun 26, 2024',
    conference: 'Conference Name',
    youtubeId: 'YOUR_VIDEO_ID',
    hasRecording: true
}
```

**No recording:**
```javascript
{
    title: 'Talk Title',
    description: 'What you talked about',
    date: 'Jun 2024',
    conference: 'Conference Name',
    hasRecording: false,
    externalLink: 'https://event-link.com',
    customThumbnail: 'https://your-image.jpg'
}
```

### Blogs

```javascript
blogs: [
    {
        title: 'Post Title',
        description: 'What it's about',
        date: 'Dec 2024',
        link: 'https://your-blog.com',
        customThumbnail: 'https://image.jpg'  // optional
    }
]
```

## Changing Your Info

### Homepage (`index.html`)

**Name/location** (line ~218):
```html
<p class="hero-subtitle reveal">Your City, State</p>
<h1 class="reveal">Hi, I'm <span class="highlight">Your Name</span>.</h1>
```

**Typing animation** (line ~222):
```javascript
const phrases = [
    "your first phrase",
    "your second phrase",
    "your third phrase"
];
```

**Social links** (line ~234):
```html
<a href="https://twitter.com/yourusername">
<a href="https://github.com/yourusername">
<a href="https://linkedin.com/in/yourusername">
<a href="https://youtube.com/@yourchannel">
```

**Email** (line ~355):
```html
<a href="mailto:your.email@example.com" class="hero-btn">Get in Touch</a>
```

### Content Page (`all-content.html`)

Update header around line 198:
```html
<h1>All <span class="highlight">Content</span></h1>
<p>Your description here.</p>
```

### Colors

Same variables in both files:

```css
:root {
    --accent-primary: #0ea5e9;   /* cyan */
    --accent-vegas: #c026d3;      /* magenta */
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

Then Settings → Pages → Deploy from main.

**Vercel/Netlify:** Connect repo, deploy.

## How It Works

- `content.js` has all your stuff
- Homepage shows 3 most recent items
- All content page shows everything with filters
- YouTube thumbnails auto-load
- Infinite scroll as you go down
- `app.js` is empty
- Works on mobile/tablet/desktop
- No build process
