# Chris Dabatos - Developer Advocate Portfolio

An enterprise-grade professional portfolio featuring a "Neon-Glass Minimalist" theme with interactive elements, animations, and full responsiveness.

## Features

### Design Elements
- **Dark Mode with Glassmorphism**: Frosted glass cards with backdrop blur effects
- **Vegas-Inspired Neon Accents**: Subtle cyan and magenta gradients inspired by Las Vegas
- **Responsive Grid Layout**: Automatically adapts from mobile to desktop
- **Modern Typography**: Clean sans-serif with monospace accents

### Interactive Features
1. **Typing Effect**: Animated introduction in the hero section
2. **Scroll Reveal Animations**: Elements fade and slide in as you scroll
3. **3D Tilt Effect**: Cards tilt toward your mouse cursor on hover
4. **Smooth Scrolling**: Navigation links smoothly scroll to sections

### Content Sections
- **Hero Section**: Introduction with animated typing effect and social links
- **Latest Creations**: Showcase for blogs, videos, and live streams
- **Public Speaking**: Timeline layout with recorded and in-person talks
- **Footer**: Contact CTA and copyright information

## Customization Guide

### 1. Personal Information

Update your details in the hero section (around line 218):

```html
<p class="hero-subtitle reveal">Las Vegas, NV</p>
<h1 class="reveal">Hi, I'm <span class="highlight">Chris Dabatos</span>.</h1>
```

### 2. Social Media Links

Replace `#` with your actual social media URLs (around line 234):

```html
<a href="https://twitter.com/yourusername" style="color: var(--text-muted); transition: color 0.3s;"><i class="fab fa-twitter"></i></a>
<a href="https://github.com/yourusername" style="color: var(--text-muted); transition: color 0.3s;"><i class="fab fa-github"></i></a>
<a href="https://linkedin.com/in/yourusername" style="color: var(--text-muted); transition: color 0.3s;"><i class="fab fa-linkedin"></i></a>
<a href="https://youtube.com/@yourchannel" style="color: var(--text-muted); transition: color 0.3s;"><i class="fab fa-youtube"></i></a>
```

### 3. Content Cards

Update your blog posts, videos, and streams in the "Latest Creations" section (around line 245):

```html
<article class="card reveal">
    <div>
        <span class="card-tag" style="color: var(--accent-vegas);">Video Tutorial</span>
        <h3 class="card-title">Your Video Title</h3>
        <p class="card-desc">Your video description here.</p>
    </div>
    <a href="https://youtube.com/watch?v=YOUR_VIDEO_ID" class="card-link">
        <i class="fab fa-youtube"></i> &nbsp; Watch Video
    </a>
</article>
```

Card tag options:
- `Video Tutorial` - Use `var(--accent-vegas)` color
- `Technical Blog` - Use `var(--accent-primary)` color
- `Live Stream` - Use `var(--accent-vegas)` color

### 4. Speaking Engagements

Add or modify talks in the "Public Speaking" section (around line 285):

For recorded talks:
```html
<div class="talk-card reveal">
    <div class="date-badge">
        <span class="month">OCT</span>
        <span class="year">2024</span>
    </div>
    <div class="talk-content">
        <h3>Your Talk Title</h3>
        <div class="talk-meta">
            <span><i class="fas fa-map-marker-alt"></i> Conference Name</span>
            <span style="color: #10b981; font-weight: 600;">
                <span class="status-dot status-recorded"></span> Recording Available
            </span>
        </div>
        <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-muted);">
            Brief description of your talk.
        </p>
        <a href="YOUR_VIDEO_LINK" style="margin-top: 0.5rem; display: inline-block; font-size: 0.85rem; color: var(--accent-primary);">View Recording &rarr;</a>
    </div>
</div>
```

For in-person only talks:
```html
<div class="talk-card reveal">
    <div class="date-badge">
        <span class="month">SEP</span>
        <span class="year">2024</span>
    </div>
    <div class="talk-content">
        <h3>Your Talk Title</h3>
        <div class="talk-meta">
            <span><i class="fas fa-map-marker-alt"></i> Conference Name</span>
            <span><span class="status-dot status-offline"></span> In-Person Only</span>
        </div>
        <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-muted);">
            Brief description of your talk.
        </p>
    </div>
</div>
```

For upcoming talks (add neon border):
```html
<div class="talk-card reveal" style="border-left: 4px solid var(--accent-vegas);">
    ...
</div>
```

### 5. Contact Email

Update your email in the footer (around line 355):

```html
<a href="mailto:your.email@example.com" class="hero-btn" style="background: var(--text-main); color: var(--bg-color);">Get in Touch</a>
```

### 6. Color Customization

Modify the CSS variables in the `:root` section (around line 8) to change the color scheme:

```css
:root {
    --bg-color: #0f172a;           /* Background color */
    --card-bg: rgba(30, 41, 59, 0.7); /* Card background */
    --text-main: #f8fafc;          /* Main text color */
    --text-muted: #94a3b8;         /* Muted text color */
    --accent-primary: #38bdf8;      /* Cyan accent */
    --accent-secondary: #818cf8;    /* Indigo accent */
    --accent-vegas: #d946ef;        /* Neon magenta accent */
}
```

## Deployment Options

### Option 1: GitHub Pages (Free)

1. Create a new repository on GitHub
2. Push your portfolio files:
   ```bash
   git init
   git add index.html README.md
   git commit -m "Initial portfolio commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/portfolio.git
   git push -u origin main
   ```
3. Go to repository Settings > Pages
4. Select "main" branch as source
5. Your site will be live at `https://yourusername.github.io/portfolio/`

### Option 2: Vercel (Free)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your portfolio directory
3. Follow the prompts
4. Your site will be deployed with a custom URL

### Option 3: Netlify (Free)

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run `netlify deploy` in your portfolio directory
3. Follow the prompts
4. Run `netlify deploy --prod` for production

### Option 4: Simple File Hosting

Upload `index.html` to any web hosting service that supports static HTML files.

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

- The portfolio uses Font Awesome from CDN for icons
- Uses Intersection Observer API for scroll animations (modern browsers only)
- All animations use CSS transforms for optimal performance
- No external JavaScript libraries required

## Accessibility Notes

- All interactive elements have proper focus states
- Color contrast ratios meet WCAG AA standards
- Semantic HTML5 elements used throughout
- Keyboard navigation supported

## License

Free to use and modify for your own portfolio. Attribution appreciated but not required.

## Credits

Design Concept: Neon-Glass Minimalist theme
Created for: Chris Dabatos
Location: Las Vegas, NV
