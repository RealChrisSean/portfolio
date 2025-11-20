# Portfolio Site

Simple one-page portfolio with glassmorphism cards. No frameworks, just vanilla HTML/CSS/JS.

## Quick Start

1. Update your info in the hero section (name, location, typing text)
2. Replace the `#` social links with your actual URLs
3. Add your content to the cards (blogs, videos, talks)
4. Deploy it

## Customizing Content

### Social Links
Find these around line 234 and replace with your links:
```html
<a href="https://twitter.com/yourusername">
<a href="https://github.com/yourusername">
<a href="https://linkedin.com/in/yourusername">
<a href="https://youtube.com/@yourchannel">
```

### Content Cards
Each card follows this structure:
```html
<article class="card reveal">
    <div>
        <span class="card-tag">Video Tutorial</span>
        <h3 class="card-title">Your Title</h3>
        <p class="card-desc">Description here.</p>
    </div>
    <a href="YOUR_LINK" class="card-link">
        <i class="fab fa-youtube"></i> &nbsp; Watch Video
    </a>
</article>
```

### Speaking Timeline
For recorded talks:
```html
<div class="talk-card reveal">
    <div class="date-badge">
        <span class="month">OCT</span>
        <span class="year">2024</span>
    </div>
    <div class="talk-content">
        <h3>Talk Title</h3>
        <div class="talk-meta">
            <span><i class="fas fa-map-marker-alt"></i> Conference Name</span>
            <span style="color: #10b981;">
                <span class="status-dot status-recorded"></span> Recording Available
            </span>
        </div>
        <a href="VIDEO_LINK">View Recording &rarr;</a>
    </div>
</div>
```

For in-person only, swap the recording status with:
```html
<span><span class="status-dot status-offline"></span> In-Person Only</span>
```

### Colors
Want different colors? Edit the CSS variables at the top:
```css
:root {
    --accent-primary: #38bdf8;   /* Cyan */
    --accent-vegas: #d946ef;      /* Magenta */
}
```

## Deploying

**GitHub Pages** (easiest):
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/portfolio.git
git push -u origin main
```
Then enable GitHub Pages in your repo settings.

**Vercel/Netlify**: Just connect your repo and it'll auto-deploy.
