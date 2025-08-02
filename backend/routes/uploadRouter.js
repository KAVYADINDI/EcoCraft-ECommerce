import express from 'express';
import upload from '../middleware/cloudinaryUpload.js';
import multer from 'multer';

const router = express.Router();

router.post('/upload', (req, res, next) => {
    console.log('--- Inside /api/upload route ---');
    // This is where Multer middleware 'upload.single('image')' will process the request
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error('Multer error:', err.message);
            return res.status(500).json({ message: 'File upload error', error: err.message });
        } else if (err) {
            // An unknown error occurred.
            console.error('Unknown upload error:', err.message);
            return res.status(500).json({ message: 'An unknown error occurred during upload', error: err.message });
        }
        // If no error, continue to the next middleware (your original route handler)
        next();
    });
}, (req, res) => { // This is your original route handler function
    console.log('--- After Multer processing ---');
    console.log('req.file:', req.file); // THIS IS CRUCIAL TO CHECK
    console.log('req.body:', req.body); // Check if any other form fields are coming

    if (!req.file) {
        console.error('Error: req.file is undefined, returning "No file uploaded."');
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    res.status(200).json({
        message: 'Upload successful',
        imageUrl: req.file.path, // Cloudinary URL
        publicId: req.file.filename, // Cloudinary public ID
    });
    console.log('Upload response sent.');
});

export default router;