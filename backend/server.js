const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const sharp = require('sharp');
const app = express();

app.use(cors()); // Enable all CORS requests
app.use(express.json()); // Parse JSON bodies

// Endpoint for downloading and converting image
app.post('/download', async (req, res) => {
  const { imageUrl } = req.body;

  try {
    // Fetch the image from the provided URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res.status(400).json({ error: 'Failed to fetch image from URL' });
    }

    // Convert the image to PNG using Sharp
    const buffer = await response.buffer();
    const pngBuffer = await sharp(buffer).png().toBuffer();

    // Send the PNG image back as a downloadable file
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename=image.png'
    });
    res.send(pngBuffer);
  } catch (error) {
    console.error('Error downloading or converting image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
