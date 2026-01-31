#!/usr/bin/env node

/**
 * Simple blog template builder
 * Replaces {{partial-name}} with contents from partials/partial-name.html
 * Also builds the blog listing page with {{blog-cards}} from content.js
 *
 * Usage: node scripts/build-blogs.js [blog-slug]
 * Example: node scripts/build-blogs.js speak-it
 * Run without args to build all blogs
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(process.cwd(), 'blog');
const PARTIALS_DIR = path.join(process.cwd(), 'partials');
const CONTENT_JS = path.join(process.cwd(), 'content.js');

// Cache for loaded partials
const partialsCache = {};

function loadPartial(name) {
    if (partialsCache[name]) return partialsCache[name];

    const partialPath = path.join(PARTIALS_DIR, `${name}.html`);
    if (!fs.existsSync(partialPath)) {
        console.warn(`  Warning: Partial "${name}" not found at ${partialPath}`);
        return `<!-- partial "${name}" not found -->`;
    }

    partialsCache[name] = fs.readFileSync(partialPath, 'utf8');
    return partialsCache[name];
}

function getBlogsFromContent() {
    const contentJs = fs.readFileSync(CONTENT_JS, 'utf8');

    // Extract the blogs array using regex
    const blogsMatch = contentJs.match(/blogs:\s*\[([\s\S]*?)\n    \]/);
    if (!blogsMatch) {
        console.warn('  Warning: Could not find blogs array in content.js');
        return [];
    }

    // Parse the blogs array
    const blogsStr = blogsMatch[1];
    const blogs = [];

    // Match each blog object
    const blogRegex = /\{\s*title:\s*['"](.+?)['"],\s*description:\s*['"](.+?)['"],\s*date:\s*['"](.+?)['"],\s*link:\s*['"](.+?)['"](?:,\s*customThumbnail:\s*['"](.+?)['"])?\s*\}/g;

    let match;
    while ((match = blogRegex.exec(blogsStr)) !== null) {
        blogs.push({
            title: match[1].replace(/\\'/g, "'"),
            description: match[2].replace(/\\'/g, "'"),
            date: match[3],
            link: match[4],
            customThumbnail: match[5] || '/imgs/chrisdabatos.webp'
        });
    }

    // Sort by date (newest first)
    blogs.sort((a, b) => {
        const months = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
        };

        function parseDate(dateString) {
            const parts = dateString.toLowerCase().split(/[\s,]+/).filter(p => p);
            if (parts.length === 3) {
                const month = months[parts[0].substring(0, 3)];
                const day = parseInt(parts[1]);
                const year = parseInt(parts[2]);
                return new Date(year, month, day);
            } else if (parts.length === 2) {
                const month = months[parts[0].substring(0, 3)];
                const year = parseInt(parts[1]);
                return new Date(year, month, 1);
            }
            return new Date(0);
        }

        return parseDate(b.date) - parseDate(a.date);
    });

    return blogs;
}

function generateBlogCardsHtml(blogs) {
    return blogs.map(blog => `
            <a href="${blog.link}" class="blog-card">
                <img src="${blog.customThumbnail}" alt="${blog.title}" class="blog-thumbnail" loading="lazy">
                <div class="blog-content">
                    <div class="blog-date">
                        <i class="far fa-calendar"></i> ${blog.date}
                    </div>
                    <h3>${blog.title}</h3>
                    <p>${blog.description}</p>
                    <span class="read-more">
                        Read Article <i class="fas fa-arrow-right"></i>
                    </span>
                </div>
            </a>`).join('\n');
}

function processTemplate(content) {
    // Replace {{blog-cards}} with generated blog cards
    if (content.includes('{{blog-cards}}')) {
        const blogs = getBlogsFromContent();
        const blogCardsHtml = generateBlogCardsHtml(blogs);
        content = content.replace('{{blog-cards}}', blogCardsHtml);
        console.log(`  Injected ${blogs.length} blog cards`);
    }

    // Replace {{partial-name}} with partial content
    return content.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (match, partialName) => {
        return loadPartial(partialName);
    });
}

function buildBlog(slug) {
    const srcPath = path.join(BLOG_DIR, slug, 'src', 'index.html');
    const outPath = path.join(BLOG_DIR, slug, 'index.html');

    if (!fs.existsSync(srcPath)) {
        // No src file, skip (blog hasn't been converted to template yet)
        return false;
    }

    console.log(`Building: ${slug}`);

    const source = fs.readFileSync(srcPath, 'utf8');
    const output = processTemplate(source);

    fs.writeFileSync(outPath, output);
    console.log(`  -> ${outPath}`);
    return true;
}

function buildBlogListing() {
    const srcPath = path.join(BLOG_DIR, 'src', 'index.html');
    const outPath = path.join(BLOG_DIR, 'index.html');

    if (!fs.existsSync(srcPath)) {
        console.log('No blog listing template found at blog/src/index.html');
        return false;
    }

    console.log('Building: blog listing page');

    const source = fs.readFileSync(srcPath, 'utf8');
    const output = processTemplate(source);

    fs.writeFileSync(outPath, output);
    console.log(`  -> ${outPath}`);
    return true;
}

function getAllBlogSlugs() {
    return fs.readdirSync(BLOG_DIR)
        .filter(f => {
            const blogPath = path.join(BLOG_DIR, f);
            // Skip 'src' directory (that's for the listing page template)
            return f !== 'src' && fs.statSync(blogPath).isDirectory();
        });
}

function main() {
    const targetSlug = process.argv[2];

    if (targetSlug) {
        if (targetSlug === 'listing') {
            buildBlogListing();
        } else {
            const built = buildBlog(targetSlug);
            if (!built) {
                console.log(`No src/index.html found for "${targetSlug}". Skipping.`);
            }
        }
    } else {
        console.log('Building all blogs...\n');
        const slugs = getAllBlogSlugs();
        let built = 0;

        // Build individual blog posts
        for (const slug of slugs) {
            if (buildBlog(slug)) built++;
        }

        // Build blog listing page
        if (buildBlogListing()) built++;

        console.log(`\nBuilt ${built} page(s).`);
    }
}

main();
