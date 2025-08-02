import express from 'express';
import Product from '../models/Product.js';
import upload from '../middleware/cloudinaryUpload.js';
import User from '../models/User.js';

const router = express.Router();

// Add new product with image upload
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const imageUrls = req.files ? req.files.map(file => file.path) : [];
    const tags = req.body.tags
      ? req.body.tags.split(',').map(tag => tag.trim().toLowerCase())
      : [];
    const materials = req.body.materials
      ? req.body.materials.split(',').map(material => material.trim().toLowerCase())
      : [];

    // Fetch artist's commission rate from DB
    const artist = await User.findById(req.body.artistID);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found.' });
    }
    const commissionRate = artist.commissionRate || 0;
    const listingPrice = Number((req.body.price / (1 - commissionRate / 100)).toFixed(2));

    const product = await Product.create({ ...req.body, tags, materials, images: imageUrls, listingPrice });
    res.status(201).json(product);
  } catch (err) {
    console.error('POST /api/products error:', err.message, err.stack, err);
    res.status(400).json({ message: err.message });
  }
});

// Update product with image upload
router.put('/:id', upload.array('images', 5), async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    }
    if (updateData.tags) {
      updateData.tags = Array.isArray(updateData.tags)
        ? updateData.tags.map(tag => tag.trim().toLowerCase())
        : updateData.tags.split(',').map(tag => tag.trim().toLowerCase()); // Ensure tags are stored as a list
    }
    if (updateData.materials) {
      updateData.materials = Array.isArray(updateData.materials)
        ? updateData.materials.map(material => material.trim().toLowerCase())
        : updateData.materials.split(',').map(material => material.trim().toLowerCase()); // Ensure materials are stored as a list
    }


    // Fetch artist's commission rate
    const artist = await User.findById(updateData.artistID);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found.' });
    }

    const commissionRate = artist.commissionRate || 0;
    console.log('Commission rate for artistID', updateData.artistID, ':', commissionRate);
    // updateData.listingPrice = updateData.price / (1 - commissionRate / 100);
    updateData.listingPrice = Number((updateData.price / (1 - commissionRate / 100)).toFixed(2));
    console.log('Calculated listing price:', updateData.listingPrice);


    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product updated successfully.', product: updated });
  } catch (err) {
    console.error('PUT /api/products/:id error:', err.message, err.stack, err);
    // If error is not a string, send stringified version
    let msg = err && err.message ? err.message : (typeof err === 'string' ? err : JSON.stringify(err));
    res.status(400).json({ message: msg });
  }
});

// Get all products for an artist
router.get('/', async (req, res) => {
  const { artistID } = req.query;
  try {
    const products = await Product.find(artistID ? { artistID } : {});
    res.json(products);
  } catch (err) {
    console.error('GET /api/products error:', err.message, err.stack, err);
    res.status(400).json({ message: err.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    console.error('GET /api/products/:id error:', err.message, err.stack, err);
    res.status(404).json({ message: 'Product not found' });
  }
});

export default router;
