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
      const response = await axios.post('https://instagramimagedownloaderinpng-1.onrender.com/download', 
        { imageUrl: url },
        { responseType: 'blob' }
      );

      // Create a URL for the blob
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      
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
      setMessage({ 
        text: error.response?.data?.message || 'Error downloading image', 
        type: 'error' 
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Instagram Image Downloader
          </Typography>
          
          <Typography variant="body1" gutterBottom align="center" sx={{ mb: 4 }}>
            Enter an Instagram post URL or direct image URL to download
          </Typography>

          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="https://instagram.com/p/..."
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleDownload}
              sx={{ mt: 3, mb: 2 }}
              startIcon={<CloudDownloadIcon />}
            >
              Download Image
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
