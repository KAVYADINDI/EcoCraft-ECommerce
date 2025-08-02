import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Multer storage configuration for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecocraft-products',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

export default upload;
