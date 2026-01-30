#!/usr/bin/env node

/**
 * Pre-generate TTS audio for blog posts with word-level timestamps
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
        audioPath: 'audio/speak-it.mp3',
        timestampsPath: 'audio/speak-it-timestamps.json'
    },
    {
        slug: 'ai-journal-system',
        htmlPath: 'blog/ai-journal-system/index.html',
        audioPath: 'audio/ai-journal-system.mp3',
        timestampsPath: 'audio/ai-journal-system-timestamps.json'
    },
    {
        slug: 'college-picker',
        htmlPath: 'blog/college-picker/index.html',
        audioPath: 'audio/college-picker.mp3',
        timestampsPath: 'audio/college-picker-timestamps.json'
    }
];

function removeNestedElement(html, startPattern) {
    // Remove elements including nested tags of the same type
    let result = html;
    let match;
    const regex = new RegExp(startPattern, 'gi');

    while ((match = regex.exec(result)) !== null) {
        const startIndex = match.index;
        let depth = 1;
        let i = startIndex + match[0].length;
        const tagMatch = match[0].match(/<(\w+)/);
        if (!tagMatch) continue;
        const tagName = tagMatch[1];
        const openTag = new RegExp(`<${tagName}[\\s>]`, 'gi');
        const closeTag = new RegExp(`</${tagName}>`, 'gi');

        while (depth > 0 && i < result.length) {
            const remaining = result.substring(i);
            const nextOpen = remaining.search(openTag);
            const nextClose = remaining.search(closeTag);

            if (nextClose === -1) break;

            if (nextOpen !== -1 && nextOpen < nextClose) {
                depth++;
                i += nextOpen + 1;
            } else {
                depth--;
                if (depth === 0) {
                    i += nextClose + tagName.length + 3;
                } else {
                    i += nextClose + 1;
                }
            }
        }

        result = result.substring(0, startIndex) + ' ' + result.substring(i);
        regex.lastIndex = startIndex;
    }

    return result;
}

function extractTextFromHTML(html) {
    const articleMatch = html.match(/<article class="container">([\s\S]*?)<\/article>/);
    if (!articleMatch) {
        throw new Error('Could not find article content');
    }

    let content = articleMatch[1];

    // Remove nested elements properly
    content = removeNestedElement(content, '<header class="post-header"');
    content = removeNestedElement(content, '<div class="toc"');
    content = removeNestedElement(content, '<div class="author-section"');
    content = removeNestedElement(content, '<div class="footer"');
    content = removeNestedElement(content, '<div class="demo-box"');
    content = removeNestedElement(content, '<div class="architecture-diagram"');
    content = removeNestedElement(content, '<div class="callout"');
    content = removeNestedElement(content, '<div class="scroll-indicator"');
    content = removeNestedElement(content, '<div class="audio-progress"');
    content = removeNestedElement(content, '<pre');
    content = removeNestedElement(content, '<code');
    content = removeNestedElement(content, '<table');
    content = removeNestedElement(content, '<button');
    content = removeNestedElement(content, '<nav');

    // Remove any remaining inline code tags (backup for inline <code>)
    content = content.replace(/<code[^>]*>[\s\S]*?<\/code>/gi, ' ');

    // Strip remaining HTML tags
    content = content.replace(/<[^>]*>/g, ' ');

    // Clean up entities and whitespace
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

async function generateAudioWithTimestamps(text, apiKey) {
    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`,
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

    const data = await response.json();

    // Decode base64 audio
    const audioBuffer = Buffer.from(data.audio_base64, 'base64');

    // Extract word timings from alignment data
    const alignment = data.alignment || {};
    const words = [];

    if (alignment.characters && alignment.character_start_times_seconds) {
        // Build words from characters
        let currentWord = '';
        let wordStart = null;
        let wordEnd = null;

        for (let i = 0; i < alignment.characters.length; i++) {
            const char = alignment.characters[i];
            const startTime = alignment.character_start_times_seconds[i];
            const endTime = alignment.character_end_times_seconds[i];

            if (char === ' ' || i === alignment.characters.length - 1) {
                if (char !== ' ') {
                    currentWord += char;
                    wordEnd = endTime;
                }
                if (currentWord.trim()) {
                    words.push({
                        word: currentWord.trim(),
                        start: wordStart,
                        end: wordEnd
                    });
                }
                currentWord = '';
                wordStart = null;
            } else {
                if (wordStart === null) {
                    wordStart = startTime;
                }
                currentWord += char;
                wordEnd = endTime;
            }
        }
    }

    return { audioBuffer, words };
}

async function processBlog(blog, apiKey) {
    console.log(`\nProcessing: ${blog.slug}`);

    const htmlPath = path.join(process.cwd(), blog.htmlPath);
    const html = fs.readFileSync(htmlPath, 'utf8');

    const text = extractTextFromHTML(html);
    console.log(`  Extracted ${text.length} characters`);

    const chunks = splitIntoChunks(text, CHUNK_SIZE);
    console.log(`  Split into ${chunks.length} chunks`);

    const audioBuffers = [];
    const allWords = [];
    let timeOffset = 0;

    for (let i = 0; i < chunks.length; i++) {
        console.log(`  Generating chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)...`);

        const { audioBuffer, words } = await generateAudioWithTimestamps(chunks[i], apiKey);
        audioBuffers.push(audioBuffer);

        // Adjust word timings with offset and add to all words
        const chunkDuration = words.length > 0 ? words[words.length - 1].end : 0;

        words.forEach(w => {
            allWords.push({
                word: w.word,
                start: w.start + timeOffset,
                end: w.end + timeOffset
            });
        });

        timeOffset += chunkDuration + 0.1; // Small gap between chunks

        if (i < chunks.length - 1) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    // Save audio
    const combinedAudio = Buffer.concat(audioBuffers);
    const audioPath = path.join(process.cwd(), blog.audioPath);
    fs.writeFileSync(audioPath, combinedAudio);
    console.log(`  Saved audio: ${blog.audioPath} (${(combinedAudio.length / 1024 / 1024).toFixed(2)} MB)`);

    // Save timestamps
    const timestampsPath = path.join(process.cwd(), blog.timestampsPath);
    fs.writeFileSync(timestampsPath, JSON.stringify({ words: allWords }, null, 2));
    console.log(`  Saved timestamps: ${blog.timestampsPath} (${allWords.length} words)`);
}

async function main() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const targetSlug = process.argv[2]; // Optional: specific blog slug

    if (!apiKey) {
        console.error('Error: ELEVENLABS_API_KEY environment variable is required');
        console.error('Run: ELEVENLABS_API_KEY=your_key node scripts/precache-tts.js [blog-slug]');
        console.error('Example: ELEVENLABS_API_KEY=your_key node scripts/precache-tts.js college-picker');
        process.exit(1);
    }

    const blogsToProcess = targetSlug
        ? BLOGS.filter(b => b.slug === targetSlug)
        : BLOGS;

    if (targetSlug && blogsToProcess.length === 0) {
        console.error(`Error: No blog found with slug "${targetSlug}"`);
        console.error('Available slugs:', BLOGS.map(b => b.slug).join(', '));
        process.exit(1);
    }

    console.log(targetSlug
        ? `Pre-caching TTS for: ${targetSlug}`
        : 'Pre-caching TTS audio with timestamps for all blogs...');

    for (const blog of blogsToProcess) {
        try {
            await processBlog(blog, apiKey);
        } catch (error) {
            console.error(`  Error processing ${blog.slug}:`, error.message);
        }
    }

    console.log('\nDone! Commit the audio and timestamp files.');
}

main();
