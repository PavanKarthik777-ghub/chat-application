import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { upload, uploadDocument } from '../config/upload.js';

const router = Router();

// Test endpoint to check if requests reach the backend
router.get('/test', (req, res) => {
  console.log('Test endpoint hit!');
  res.json({ message: 'Backend is reachable', timestamp: new Date().toISOString() });
});

// Upload image endpoint
router.post('/upload', (req, res) => {
  console.log('Upload endpoint hit!', { 
    method: req.method, 
    url: req.url, 
    headers: req.headers,
    body: req.body 
  });
  
  // Check authentication first
  requireAuth(req, res, (err) => {
    if (err) {
      console.log('Auth error:', err);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    console.log('Auth passed, proceeding with upload...');
    
    upload.single('image')(req, res, (err) => {
      if (err) {
        console.log('Multer error:', err);
        return res.status(500).json({ message: 'Upload failed', error: err.message });
      }
      
      try {
        console.log('Image upload request received:', {
          hasFile: !!req.file,
          fileName: req.file?.originalname,
          fileSize: req.file?.size,
          mimeType: req.file?.mimetype
        });

        if (!req.file) {
          console.log('No file provided in image upload');
          return res.status(400).json({ message: 'No image file provided' });
        }
        
        const response = {
          imageUrl: req.file.path,
          publicId: req.file.filename 
        };

        console.log('Image upload successful:', response);
        res.json(response);
      } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ message: 'Image upload failed', error: error.message });
      }
    });
  });
});

// Upload document endpoint
router.post('/document', requireAuth, uploadDocument.single('document'), (req, res) => {
  try {
    console.log('Document upload request received:', {
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      mimeType: req.file?.mimetype
    });

    if (!req.file) {
      console.log('No file provided in document upload');
      return res.status(400).json({ message: 'No document file provided' });
    }
    
    const response = {
      fileUrl: req.file.path, // Cloudinary URL
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.originalname.split('.').pop().toLowerCase(),
      mimeType: req.file.mimetype,
      // Add download URL with filename parameter
      downloadUrl: `${req.file.path}?filename=${encodeURIComponent(req.file.originalname)}`
    };

    console.log('Document upload successful:', response);
    res.json(response);
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Document upload failed', error: error.message });
  }
});

export default router;
