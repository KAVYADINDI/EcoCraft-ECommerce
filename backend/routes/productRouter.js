import express from 'express';
import Product from '../models/Product.js';
import upload from '../middleware/cloudinaryUpload.js';
import { updateCommissionRate } from '../controllers/adminController.js';
import { authenticateJWT, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Add new product with image upload
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    console.log('Full req.body:', req.body);
    console.log('copyrightText:', req.body.copyrightText);
    console.log('copyrightNotice:', req.body.copyrightNotice);

    const imageUrls = req.files ? req.files.map(file => file.path) : [];
    const tags = req.body.tags
      ? req.body.tags.split(',').map(tag => tag.trim().toLowerCase())
      : [];
    const materials = req.body.materials
      ? req.body.materials.split(',').map(material => material.trim().toLowerCase())
      : [];

    const {
      title,
      description,
      price,
      dimensions,
      careInstructions,
      certified,
      copyrightText,
      copyrightNotice, // log this too
      quantityAvailable,
      category,
      artistID,
      listProduct
    } = req.body;

  
    const product = new Product({
      title,
      description,
      price,
      materials,
      dimensions,
      careInstructions,
      certified,
      copyrightText,
      tags,
      quantityAvailable,
      category,
      images: imageUrls,
      artistID,
      listProduct
    });

    await product.save();
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
        : updateData.tags.split(',').map(tag => tag.trim().toLowerCase());
    }
    if (updateData.materials) {
      updateData.materials = Array.isArray(updateData.materials)
        ? updateData.materials.map(material => material.trim().toLowerCase())
        : updateData.materials.split(',').map(material => material.trim().toLowerCase());
    }

    console.log('PUT req.body:', req.body);
    console.log('PUT copyrightText:', req.body.copyrightText);
    console.log('PUT copyrightNotice:', req.body.copyrightNotice);

    // Explicitly set certified and copyrightText fields
    const updateFields = {
      title: updateData.title,
      description: updateData.description,
      price: updateData.price,
      materials: updateData.materials,
      dimensions: updateData.dimensions,
      careInstructions: updateData.careInstructions,
      certified: updateData.certified,
      copyrightText: updateData.copyrightText,
      tags: updateData.tags,
      quantityAvailable: updateData.quantityAvailable,
      category: updateData.category,
      images: updateData.images,
      artistID: updateData.artistID,
      listProducts: updateData.listProducts
    };

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product updated successfully.', product: updatedProduct });
  } catch (err) {
    console.error('PUT /api/products/:id error:', err.message, err.stack, err);
    let msg = err && err.message ? err.message : (typeof err === 'string' ? err : JSON.stringify(err));
    res.status(400).json({ message: msg });
  }
});

router.get('/', async (req, res) => {
  const { artistID, listProduct } = req.query;
  const filter = {};
  if (artistID) filter.artistID = artistID;
  if (listProduct !== undefined) filter.listProduct = listProduct === 'true';
  try {
    const products = await Product.find(filter);
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

// Update commission rate for product (admin only)
router.patch('/:id/commission', authenticateJWT, isAdmin, updateCommissionRate);

export default router;
