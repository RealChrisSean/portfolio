const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Cache directory - /tmp on Vercel, local folder in dev
const CACHE_DIR = process.env.VERCEL ? '/tmp/tts-cache' : path.join(__dirname, '../.tts-cache');
const CHUNK_SIZE = 4000; // Safe limit per chunk

// Ensure cache directory exists
function ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
}

// Generate cache key from params
function getCacheKey(text, voice, stability, similarity) {
    return crypto
        .createHash('md5')
        .update(`${text}|${voice}|${stability}|${similarity}`)
        .digest('hex');
}

// Split text into chunks at sentence boundaries
function splitIntoChunks(text, maxLength) {
    const chunks = [];
    let remaining = text;

    while (remaining.length > 0) {
        if (remaining.length <= maxLength) {
            chunks.push(remaining);
            break;
        }

        // Find a good break point (end of sentence)
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
            breakPoint += 1; // Include the punctuation
        }

        chunks.push(remaining.substring(0, breakPoint).trim());
        remaining = remaining.substring(breakPoint).trim();
    }

    return chunks;
}

// Generate audio for a single chunk
async function generateChunkAudio(text, voice, stability, similarity, apiKey) {
    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`,
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
                    stability,
                    similarity_boost: similarity,
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

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            text,
            voice = 'kdvGwzzf2ihYtjbv5OWc',
            stability = 0.5,
            similarity = 0.75
        } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'ElevenLabs API key not configured' });
        }

        // Check cache first (using full text for cache key)
        ensureCacheDir();
        const cacheKey = getCacheKey(text, voice, stability, similarity);
        const cachePath = path.join(CACHE_DIR, `${cacheKey}.mp3`);

        if (fs.existsSync(cachePath)) {
            const audioBuffer = fs.readFileSync(cachePath);
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('X-Cache', 'HIT');
            return res.send(audioBuffer);
        }

        // Split text into chunks
        const chunks = splitIntoChunks(text, CHUNK_SIZE);
        console.log(`Processing ${chunks.length} chunks for TTS`);

        // Generate audio for each chunk
        const audioBuffers = [];
        for (let i = 0; i < chunks.length; i++) {
            console.log(`Generating chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);
            const chunkAudio = await generateChunkAudio(
                chunks[i],
                voice,
                stability,
                similarity,
                apiKey
            );
            audioBuffers.push(chunkAudio);
        }

        // Concatenate all audio buffers
        const combinedAudio = Buffer.concat(audioBuffers);

        // Cache the combined audio
        fs.writeFileSync(cachePath, combinedAudio);

        // Return audio
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('X-Cache', 'MISS');
        return res.send(combinedAudio);

    } catch (error) {
        console.error('TTS error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
