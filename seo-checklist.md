# SEO Checklist for New Pages

Run `node generate-sitemap.js` after adding any new page.

## Required Elements for Every Page

```html
<!-- In <head> section -->

<!-- 1. Title -->
<title>Page Title | Chris Dabatos</title>

<!-- 2. Meta Description (150-160 chars) -->
<meta name="description" content="Your compelling description here.">

<!-- 3. Open Graph -->
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Your description here.">
<meta property="og:image" content="https://realchrissean.com/imgs/chrisdabatos.jpg">
<meta property="og:url" content="https://realchrissean.com/your-page/">
<meta property="og:type" content="website">

<!-- 4. Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@RealChrisSean">
<meta name="twitter:title" content="Page Title">
<meta name="twitter:description" content="Your description here.">
<meta name="twitter:image" content="https://realchrissean.com/imgs/chrisdabatos.jpg">

<!-- 5. Robots & Canonical (REQUIRED) -->
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://realchrissean.com/your-page/">

<!-- 6. Structured Data - Choose appropriate type -->
```

## Structured Data Templates

### For Blog Posts
```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Your Blog Title",
    "description": "Your description",
    "image": "https://realchrissean.com/imgs/chrisdabatos.jpg",
    "author": {
        "@type": "Person",
        "name": "Chris Dabatos",
        "url": "https://realchrissean.com"
    },
    "publisher": {
        "@type": "Person",
        "name": "Chris Dabatos"
    },
    "datePublished": "YYYY-MM-DD",
    "dateModified": "YYYY-MM-DD",
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://realchrissean.com/blog/your-post/"
    }
}
</script>
```

### For Project/App Pages
```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Project Name",
    "description": "Project description",
    "applicationCategory": "Productivity",
    "operatingSystem": "Web",
    "author": {
        "@type": "Person",
        "name": "Chris Dabatos",
        "url": "https://realchrissean.com"
    },
    "url": "https://your-demo-url.com"
}
</script>
```

## After Adding New Page

1. Add all required meta tags above
2. Run: `node generate-sitemap.js`
3. Commit and push
