#!/usr/bin/env node

/**
 * Simple blog template builder
 * Replaces {{partial-name}} with contents from partials/partial-name.html
 *
 * Usage: node scripts/build-blogs.js [blog-slug]
 * Example: node scripts/build-blogs.js speak-it
 * Run without args to build all blogs
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(process.cwd(), 'blog');
const PARTIALS_DIR = path.join(process.cwd(), 'partials');

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

function processTemplate(content) {
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

function getAllBlogSlugs() {
    return fs.readdirSync(BLOG_DIR)
        .filter(f => {
            const blogPath = path.join(BLOG_DIR, f);
            return fs.statSync(blogPath).isDirectory();
        });
}

function main() {
    const targetSlug = process.argv[2];

    if (targetSlug) {
        const built = buildBlog(targetSlug);
        if (!built) {
            console.log(`No src/index.html found for "${targetSlug}". Skipping.`);
        }
    } else {
        console.log('Building all blogs...\n');
        const slugs = getAllBlogSlugs();
        let built = 0;

        for (const slug of slugs) {
            if (buildBlog(slug)) built++;
        }

        console.log(`\nBuilt ${built} blog(s).`);
    }
}

main();
