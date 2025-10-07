import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { upload, uploadDocument } from '../config/upload.js';

const router = Router();

// Upload image endpoint
router.post('/upload', requireAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    res.json({ 
      imageUrl: req.file.path,
      publicId: req.file.filename 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
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
