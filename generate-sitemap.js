/**
 * Sitemap Generator
 *
 * Run this script after adding new content to automatically update:
 * - sitemap.xml
 *
 * Usage: node generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://chrisdabatos.com';
const TODAY = new Date().toISOString().split('T')[0];

// Static pages (always included)
const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/all-content.html', priority: '0.8', changefreq: 'weekly' },
    { url: '/projects.html', priority: '0.9', changefreq: 'weekly' },
];

// Scan for project README pages
function findProjectPages() {
    const pages = [];
    const dirs = fs.readdirSync(__dirname, { withFileTypes: true });

    for (const dir of dirs) {
        if (dir.isDirectory() && !dir.name.startsWith('.') && !dir.name.startsWith('node_modules')) {
            const indexPath = path.join(__dirname, dir.name, 'index.html');
            if (fs.existsSync(indexPath)) {
                // Check if it's a project page (has meta description)
                const content = fs.readFileSync(indexPath, 'utf-8');
                if (content.includes('<meta name="description"') || content.includes('<meta property="og:description"')) {
                    pages.push({
                        url: `/${dir.name}/`,
                        priority: '0.9',
                        changefreq: 'monthly'
                    });
                }
            }
        }
    }

    // Check for blog posts
    const blogDir = path.join(__dirname, 'blog');
    if (fs.existsSync(blogDir)) {
        const blogPosts = fs.readdirSync(blogDir, { withFileTypes: true });
        for (const post of blogPosts) {
            if (post.isDirectory()) {
                const postIndex = path.join(blogDir, post.name, 'index.html');
                if (fs.existsSync(postIndex)) {
                    pages.push({
                        url: `/blog/${post.name}/`,
                        priority: '0.9',
                        changefreq: 'monthly'
                    });
                }
            }
        }
    }

    return pages;
}

// Generate sitemap XML
function generateSitemap() {
    const projectPages = findProjectPages();
    const allPages = [...staticPages, ...projectPages];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const page of allPages) {
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}${page.url}</loc>\n`;
        xml += `    <lastmod>${TODAY}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += '  </url>\n';
    }

    xml += '</urlset>\n';

    return xml;
}

// Write sitemap
const sitemap = generateSitemap();
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);

console.log('✓ sitemap.xml updated');
console.log('\nPages included:');
const projectPages = findProjectPages();
[...staticPages, ...projectPages].forEach(p => console.log(`  ${p.url}`));
