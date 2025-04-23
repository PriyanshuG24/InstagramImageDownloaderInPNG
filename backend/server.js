const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sharp = require('sharp');

const app = express();
const port = process.env.PORT || 5000;
// Configure CORS with specific origin
app.use(cors({
    origin: ['https://instagram-image-downloader-in-png.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Simple GET route to check server status
app.get('/', (req, res) => {
    res.json({
        status: 'Server is running',
        message: 'Welcome to Instagram Image Downloader API',
        endpoints: {
            root: 'GET /',
            download: 'POST /download'
        }
    });
});

app.post('/download', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        // Download the image with proper headers
        const response = await axios({
            url: imageUrl,
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.instagram.com/',
                'Connection': 'keep-alive'
            },
            maxRedirects: 5,
            timeout: 10000
        });

        // Convert the image to PNG
        const pngBuffer = await sharp(response.data)
            .png()
            .toBuffer();

        // Set headers for file download
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename=image_${Date.now()}.png`);
        
        // Send the PNG buffer directly to the client
        res.send(pngBuffer);
    } catch (error) {
        console.error('Error downloading image:', error);
        let errorMessage = 'Failed to download image';
        let statusCode = 500;

        if (error.response) {
            // The request was made and the server responded with a status code
            statusCode = error.response.status;
            errorMessage = `Server responded with status ${error.response.status}: ${error.message}`;
        } else if (error.request) {
            // The request was made but no response was received
            errorMessage = 'No response received from image server';
        } else {
            // Something happened in setting up the request
            errorMessage = error.message;
        }

        res.status(statusCode).json({
            error: errorMessage,
            details: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
