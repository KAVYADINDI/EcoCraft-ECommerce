import express from 'express';
import CartItem from '../models/CartItem.js';
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
    console.log('POST /cart called with:', { productID, quantity, buyerID });

    try {
      const existingCartItem = await CartItem.findOne({ buyerID, productID });
      if (existingCartItem) {
        existingCartItem.quantity += quantity;
        await existingCartItem.save();
      } else {
        await CartItem.create({ buyerID, productID, quantity });
      }
      res.status(200).json({ message: 'Product added to cart successfully.' });
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
    const cartItems = await CartItem.find({ buyerID: userId }).populate('productID');
    res.status(200).json(cartItems);
  } catch (err) {
    console.error('GET /cart error:', err.message);
    res.status(500).json({ message: 'Failed to fetch cart items.', error: err.message });
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
    const cartItem = await CartItem.findById(itemId);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ message: 'Cart item updated successfully', cartItem });
  } catch (err) {
    console.error('PATCH /cart/:itemId error:', err.message);
    res.status(500).json({ message: 'Failed to update cart item.', error: err.message });
  }
});

export default router;
