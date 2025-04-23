const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

// Get user's Downloads folder path
const downloadsDir = path.join(process.env.USERPROFILE, 'Downloads');

app.use(cors());
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

        // Generate a unique filename
        const filename = `image_${Date.now()}.png`;
        const filepath = path.join(downloadsDir, filename);

        // Convert and save the image as PNG
        await sharp(response.data)
            .png()
            .toFile(filepath);

        res.json({
            success: true,
            message: 'Image downloaded successfully',
            filename
        });
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
