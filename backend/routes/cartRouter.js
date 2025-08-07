import express from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Add product to cart
router.post(
  '/',
  [
    body('productID').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    body('customerID').notEmpty().withMessage('Customer ID is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productID, customerID } = req.body;
    const quantity = Number(req.body.quantity);
    const price = Number(req.body.price);

    console.log('POST /cart called with:', { productID, quantity, customerID, price });

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(customerID)) {
      return res.status(400).json({ message: 'Invalid customerID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(productID)) {
      return res.status(400).json({ message: 'Invalid productID format' });
    }

    const customerObjectId = new mongoose.Types.ObjectId(customerID);
    const productObjectId = new mongoose.Types.ObjectId(productID);

    try {
      let existingCart = await Cart.findOne({ customerID: customerObjectId });
      console.log('Existing cart:', existingCart);

      if (existingCart) {
        const existingItem = existingCart.items.find(item => item.productID.toString() === productID);
        if (existingItem) {
          existingItem.quantity += quantity;
          existingItem.price = price; // update price if needed
        } else {
          existingCart.items.push({ productID: productObjectId, quantity, price });
        }
        // Update totalAmount
        existingCart.totalAmount = existingCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        await existingCart.save();
      } else {
        const newCart = new Cart({
          customerID: customerObjectId,
          items: [{ productID: productObjectId, quantity, price }],
          totalAmount: price * quantity
        });
        await newCart.save();
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
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid userId format' });
  }

  try {
    const cart = await Cart.findOne({ customerID: new mongoose.Types.ObjectId(userId) }).populate('items.productID');
    res.status(200).json(cart ? cart.items : []);
  } catch (err) {
    console.error('GET /cart error:', err.message);
    res.status(500).json({ message: 'Failed to fetch cart items.', error: err.message });
  }
});

// Update cart item quantity
router.patch('/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const { quantity, userId } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be a positive integer' });
  }
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Valid userId is required' });
  }

  try {
    const cart = await Cart.findOne({ customerID: new mongoose.Types.ObjectId(userId) });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const cartItem = cart.items.id(itemId);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    cartItem.quantity = quantity;
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();
    res.status(200).json({ message: 'Cart item updated successfully', cart });
  } catch (err) {
    console.error('PATCH /cart/:itemId error:', err.message);
    res.status(500).json({ message: 'Failed to update cart item.', error: err.message });
  }
});

// Delete cart item
router.delete('/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const { userId } = req.body;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Valid userId is required' });
  }

  try {
    const cart = await Cart.findOne({ customerID: new mongoose.Types.ObjectId(userId) });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    cart.items.splice(itemIndex, 1);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();
    res.status(200).json({ message: 'Cart item deleted successfully', cart });
  } catch (err) {
    console.error('DELETE /cart/:itemId error:', err.message);
    res.status(500).json({ message: 'Failed to delete cart item.', error: err.message });
  }
});

// Clear cart for a user on signout
router.delete('/clear/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid userId format' });
  }
  try {
    const cart = await Cart.findOne({ customerID: new mongoose.Types.ObjectId(userId) });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('DELETE /cart/clear/:userId error:', err.message);
    res.status(500).json({ message: 'Failed to clear cart', error: err.message });
  }
});

export default router;