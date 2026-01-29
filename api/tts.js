const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Cache directory - /tmp on Vercel, local folder in dev
const CACHE_DIR = process.env.VERCEL ? '/tmp/tts-cache' : path.join(__dirname, '../.tts-cache');

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

        // ElevenLabs has a ~5000 char limit - truncate if needed
        const MAX_CHARS = 4500;
        let processedText = text;
        if (text.length > MAX_CHARS) {
            // Truncate at sentence boundary
            processedText = text.substring(0, MAX_CHARS);
            const lastPeriod = processedText.lastIndexOf('.');
            if (lastPeriod > MAX_CHARS * 0.8) {
                processedText = processedText.substring(0, lastPeriod + 1);
            }
            processedText += ' Article truncated for audio.';
        }

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'ElevenLabs API key not configured' });
        }

        // Check cache first
        ensureCacheDir();
        const cacheKey = getCacheKey(processedText, voice, stability, similarity);
        const cachePath = path.join(CACHE_DIR, `${cacheKey}.mp3`);

        if (fs.existsSync(cachePath)) {
            // Return cached audio
            const audioBuffer = fs.readFileSync(cachePath);
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('X-Cache', 'HIT');
            return res.send(audioBuffer);
        }

        // Call ElevenLabs API
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text: processedText,
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
            console.error('ElevenLabs API error:', errorText);
            return res.status(response.status).json({
                error: 'TTS generation failed',
                details: errorText
            });
        }

        // Get audio buffer
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);

        // Cache the audio
        fs.writeFileSync(cachePath, audioBuffer);

        // Return audio
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('X-Cache', 'MISS');
        return res.send(audioBuffer);

    } catch (error) {
        console.error('TTS error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
