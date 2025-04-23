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

        // Download the image
        const response = await axios({
            url: imageUrl,
            responseType: 'arraybuffer'
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
        res.status(500).json({
            error: 'Failed to download image',
            message: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
