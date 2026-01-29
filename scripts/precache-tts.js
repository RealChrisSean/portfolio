#!/usr/bin/env node

/**
 * Pre-generate TTS audio for blog posts
 * Run: node scripts/precache-tts.js
 *
 * Requires ELEVENLABS_API_KEY in environment
 */

const fs = require('fs');
const path = require('path');

const VOICE_ID = 'kdvGwzzf2ihYtjbv5OWc';
const CHUNK_SIZE = 4000;

// Blog posts to pre-cache
const BLOGS = [
    {
        slug: 'speak-it',
        htmlPath: 'blog/speak-it/index.html',
        outputPath: 'audio/speak-it.mp3'
    },
    {
        slug: 'ai-journal-system',
        htmlPath: 'blog/ai-journal-system/index.html',
        outputPath: 'audio/ai-journal-system.mp3'
    }
];

function extractTextFromHTML(html) {
    // Get article content
    const articleMatch = html.match(/<article class="container">([\s\S]*?)<\/article>/);
    if (!articleMatch) {
        throw new Error('Could not find article content');
    }

    let content = articleMatch[1];

    // Remove elements we don't want to read (same as frontend)
    const removePatterns = [
        /<header class="post-header">[\s\S]*?<\/header>/gi,
        /<pre[\s\S]*?<\/pre>/gi,
        /<code[\s\S]*?<\/code>/gi,
        /<div class="toc">[\s\S]*?<\/div>/gi,
        /<div class="author-section">[\s\S]*?<\/div>/gi,
        /<div class="footer">[\s\S]*?<\/div>/gi,
        /<div class="demo-box">[\s\S]*?<\/div>/gi,
        /<div class="architecture-diagram">[\s\S]*?<\/div>/gi,
        /<div class="callout">[\s\S]*?<\/div>/gi,
        /<table[\s\S]*?<\/table>/gi,
        /<button[\s\S]*?<\/button>/gi,
        /<nav[\s\S]*?<\/nav>/gi,
        /<div class="scroll-indicator">[\s\S]*?<\/div>/gi,
        /<div class="audio-progress[\s\S]*?<\/div>/gi,
    ];

    for (const pattern of removePatterns) {
        content = content.replace(pattern, '');
    }

    // Strip remaining HTML tags
    content = content.replace(/<[^>]*>/g, ' ');

    // Clean up whitespace
    content = content
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();

    return content;
}

function splitIntoChunks(text, maxLength) {
    const chunks = [];
    let remaining = text;

    while (remaining.length > 0) {
        if (remaining.length <= maxLength) {
            chunks.push(remaining);
            break;
        }

        let chunk = remaining.substring(0, maxLength);
        let breakPoint = chunk.lastIndexOf('. ');

        if (breakPoint === -1 || breakPoint < maxLength * 0.5) {
            breakPoint = chunk.lastIndexOf('? ');
        }
        if (breakPoint === -1 || breakPoint < maxLength * 0.5) {
            breakPoint = chunk.lastIndexOf('! ');
        }
        if (breakPoint === -1 || breakPoint < maxLength * 0.5) {
            breakPoint = chunk.lastIndexOf(', ');
        }
        if (breakPoint === -1 || breakPoint < maxLength * 0.5) {
            breakPoint = maxLength;
        } else {
            breakPoint += 1;
        }

        chunks.push(remaining.substring(0, breakPoint).trim());
        remaining = remaining.substring(breakPoint).trim();
    }

    return chunks;
}

async function generateAudio(text, apiKey) {
    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

async function processBlog(blog, apiKey) {
    console.log(`\nProcessing: ${blog.slug}`);

    // Read HTML
    const htmlPath = path.join(process.cwd(), blog.htmlPath);
    const html = fs.readFileSync(htmlPath, 'utf8');

    // Extract text
    const text = extractTextFromHTML(html);
    console.log(`  Extracted ${text.length} characters`);

    // Split into chunks
    const chunks = splitIntoChunks(text, CHUNK_SIZE);
    console.log(`  Split into ${chunks.length} chunks`);

    // Generate audio for each chunk
    const audioBuffers = [];
    for (let i = 0; i < chunks.length; i++) {
        console.log(`  Generating chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)...`);
        const audio = await generateAudio(chunks[i], apiKey);
        audioBuffers.push(audio);

        // Small delay to avoid rate limiting
        if (i < chunks.length - 1) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    // Combine and save
    const combinedAudio = Buffer.concat(audioBuffers);
    const outputPath = path.join(process.cwd(), blog.outputPath);
    fs.writeFileSync(outputPath, combinedAudio);
    console.log(`  Saved: ${blog.outputPath} (${(combinedAudio.length / 1024 / 1024).toFixed(2)} MB)`);
}

async function main() {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
        console.error('Error: ELEVENLABS_API_KEY environment variable is required');
        console.error('Run: ELEVENLABS_API_KEY=your_key node scripts/precache-tts.js');
        process.exit(1);
    }

    console.log('Pre-caching TTS audio for blogs...');

    for (const blog of BLOGS) {
        try {
            await processBlog(blog, apiKey);
        } catch (error) {
            console.error(`  Error processing ${blog.slug}:`, error.message);
        }
    }

    console.log('\nDone! Commit the audio files to include them in your deployment.');
}

main();
