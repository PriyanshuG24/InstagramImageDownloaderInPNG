const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sharp = require('sharp');

const app = express();
const port = process.env.PORT || 5000;

// Custom axios instance with default config
const axiosInstance = axios.create({
    timeout: 15000,
    maxRedirects: 5,
    validateStatus: status => status < 500, // Don't reject if status < 500
});
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

        console.log('Attempting to download image from:', imageUrl);

        // First try to get headers to check content type
        const headResponse = await axiosInstance.head(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.instagram.com/',
                'sec-fetch-dest': 'image',
                'sec-fetch-mode': 'no-cors',
                'sec-fetch-site': 'cross-site',
                'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            }
        });

        console.log('Head response headers:', headResponse.headers);

        // Download the image
        const response = await axiosInstance({
            url: imageUrl,
            method: 'GET',
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.instagram.com/',
                'sec-fetch-dest': 'image',
                'sec-fetch-mode': 'no-cors',
                'sec-fetch-site': 'cross-site',
                'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            }
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
        console.error('Error details:', {
            message: error.message,
            status: error.response?.status,
            headers: error.response?.headers,
            data: error.response?.data
        });

        let errorMessage = 'Failed to download image';
        let statusCode = 500;

        if (error.response) {
            statusCode = error.response.status;
            errorMessage = `Server responded with status ${error.response.status}`;
            if (error.response.headers['content-type']) {
                errorMessage += `. Content-Type: ${error.response.headers['content-type']}`;
            }
        } else if (error.request) {
            errorMessage = 'No response received from image server';
        } else {
            errorMessage = error.message;
        }

        res.status(statusCode).json({
            error: errorMessage,
            details: {
                message: error.message,
                status: error.response?.status,
                contentType: error.response?.headers?.['content-type']
            }
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
