import express from 'express';
import Order from '../models/Order.js'; // Import the Order model

const router = express.Router();

// Fetch orders for a specific user
router.get('/', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const orders = await Order.find({ buyerID: userId }).populate('items.productID'); // Populate product details
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user.' });
    }
    res.status(200).json({ orders });
  } catch (err) {
    console.error('GET /orders error:', err.message);
    res.status(500).json({ message: 'Failed to fetch orders.', error: err.message });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  const { userId, items, subtotal, tax, total } = req.body;

  if (!userId || !items || items.length === 0) {
    return res.status(400).json({ message: 'Invalid order data.' });
  }

  try {
    const newOrder = new Order({
      buyerID: userId,
      items,
      subtotal,
      tax,
      totalAmount: total,
      shippingStatus: 'pending',
      orderDate: new Date(),
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: 'Order created successfully.', order: savedOrder });
  } catch (err) {
    console.error('POST /orders error:', err.message);
    res.status(500).json({ message: 'Failed to create order.', error: err.message });
  }
});

export default router;
