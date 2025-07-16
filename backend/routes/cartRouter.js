import express from 'express';
import Cart from '../models/Cart.js'; // Updated Cart model
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Add product to cart
router.post(
  '/',
  [
    body('productID').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    body('buyerID').notEmpty().withMessage('Buyer ID is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productID, quantity, buyerID } = req.body;

    try {
      let cart = await Cart.findOne({ buyerID });
      if (!cart) {
        cart = new Cart({ buyerID, items: [] });
      }

      const existingItem = cart.items.find(item => item.productID.toString() === productID);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productID, quantity });
      }

      await cart.save();
      res.status(200).json({ message: 'Product added to cart successfully.', cart });
    } catch (err) {
      console.error('POST /cart error:', err.message);
      res.status(500).json({ message: 'Failed to add product to cart.', error: err.message });
    }
  }
);

// Get cart items by user ID
router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    let cart = await Cart.findOne({ buyerID: userId }).populate('items.productID');
    if (!cart) {
      // Create a new cart if it does not exist
      cart = new Cart({ buyerID: userId, items: [] });
      await cart.save();
    }
    res.status(200).json(cart);
  } catch (err) {
    console.error('GET /cart error:', err.message);
    res.status(500).json({ message: 'Failed to fetch cart.', error: err.message });
  }
});

// Update cart item quantity
router.patch('/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be a positive integer' });
  }

  try {
    const cart = await Cart.findOne({ 'items._id': itemId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    const item = cart.items.id(itemId);
    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ message: 'Cart item updated successfully.', cart });
  } catch (err) {
    console.error('PATCH /cart/:itemId error:', err.message);
    res.status(500).json({ message: 'Failed to update cart item.', error: err.message });
  }
});

// Delete cart item
router.delete('/:itemId', async (req, res) => {
  const { itemId } = req.params;

  try {
    const cart = await Cart.findOne({ 'items._id': itemId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    // Use Mongoose's `pull` method to remove the item from the array
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    res.status(200).json({ message: 'Cart item deleted successfully.', cart });
  } catch (err) {
    console.error('DELETE /cart/:itemId error:', err.message);
    res.status(500).json({ message: 'Failed to delete cart item.', error: err.message });
  }
});

export default router;
