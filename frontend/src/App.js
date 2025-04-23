import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import axios from 'axios';

function App() {
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [open, setOpen] = useState(false);

  const handleDownload = async () => {
    if (!url) {
      setMessage({ text: 'Please enter a URL', type: 'error' });
      setOpen(true);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/download', 
        { imageUrl: url }, 
        { responseType: 'blob' }
      );

      // Create a URL for the blob returned from the server
      const blobUrl = window.URL.createObjectURL(response.data);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `instagram_image_${Date.now()}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setMessage({ text: 'Image downloaded successfully!', type: 'success' });
      setUrl('');
    } catch (error) {
      console.error('Download error:', error);
      setMessage({ text: 'Error downloading image', type: 'error' });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Instagram Image Downloader
          </Typography>
          <Typography variant="body1" align="center" gutterBottom sx={{ mb: 4 }}>
            Enter a direct image URL from Instagram to download it as PNG
          </Typography>

          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Enter Image URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="https://instagram.fl.../t51.2885-15/..."
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleDownload}
              sx={{ mt: 3, mb: 2 }}
              startIcon={<CloudDownloadIcon />}
            >
              Download as PNG
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={message.type} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
