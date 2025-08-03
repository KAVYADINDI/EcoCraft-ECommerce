import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import { authenticateJWT, isAdmin } from '../middleware/auth.js';


const router = express.Router();

// GET /api/orders/ - Fetch all orders (admin only)
router.get('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('items.productID'); // optional: populate products
    res.json(orders);
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
});

// Place a new order
router.post('/', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.personalInfo || !user.personalInfo.address || !user.personalInfo.mobile) {
      return res.status(400).json({ message: 'User address and mobile are required' });
    }

    const cart = await Cart.findOne({ customerID: userId });
    if (!cart || !cart.items.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    console.log('Placing order with items:', cart.items);

    // Load product details to get commissionRate
    const productIds = cart.items.map(item => item.productID);
    const products = await Product.find({ _id: { $in: productIds } });

    // Build items array with calculated commission and payout
    const itemsWithCommission = cart.items.map(item => {
      const product = products.find(p => p._id.toString() === item.productID.toString());
      const commissionRate = product?.commissionRate ?? 0;
      const price = item.price;
      const quantity = item.quantity;
      const commissionAmount = price * quantity * (commissionRate / 100);
      const artistPayout = price * quantity - commissionAmount;

      return {
        productID: new mongoose.Types.ObjectId(item.productID),
        quantity,
        priceAtPurchase: price,
        commissionAmount,
        artistPayout
      };
    });

    const order = await Order.create({
      customerID: userId,
      items: itemsWithCommission,
      totalAmountWhilePlacingOrder: cart.totalAmount
    });

    // Clear the cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error('POST /orders error:', err.message);
    res.status(500).json({ message: 'Failed to place order', error: err.message });
  }
});

router.get('/customer/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  try {
    const orders = await Order.find({ customerID: userId }).sort({ createdAt: -1 }).populate('items.productID');
    res.status(200).json(orders);
  } catch (err) {
    console.error('GET /orders/customer/:userId error:', err.message);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

// Get orders received by an artist
router.get('/artist/:artistId', async (req, res) => {
  const { artistId } = req.params;
  try {
    // Find orders where any item's product.artist matches artistId
    const orders = await Order.find({
      'items.productID': { $exists: true }
    })
    .populate({
      path: 'items.productID',
      match: { artistID: artistId },
      select: 'title artistID'
    })
    .sort({ createdAt: -1 });

    // Filter orders to only those with at least one item for this artist
    const filtered = orders.filter(order =>
      order.items.some(item => item.productID && item.productID.artistID == artistId)
    );
    console.log(`[ARTIST ORDERS] artistId: ${artistId}`);
    console.log(`[ARTIST ORDERS] Orders fetched:`, filtered.map(o => ({
      orderId: o._id,
      customerId: o.customerID,
      shippingStatus: o.shippingStatus,
      items: o.items.map(i => ({
        productTitle: i.productID?.title,
        quantity: i.quantity
      }))
    })));
    res.status(200).json(filtered);
  } catch (err) {
    console.error('GET /orders/artist error:', err.message);
    res.status(500).json({ message: 'Failed to fetch artist orders', error: err.message });
  }
});

// Mark order as shipped
router.patch('/:orderId/ship', async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);
    console.log('Marking order as shipped:', order);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.shippingStatus !== 'pending') {
      return res.status(400).json({ message: 'Order status is not pending. It is ' + order.shippingStatus });
    }
    order.shippingStatus = 'shipped';
    await order.save();
    res.status(200).json({ message: 'Order marked as shipped', order });
  } catch (err) {
    console.error('PATCH /orders/:orderId/ship error:', err.message);
    res.status(500).json({ message: 'Failed to update order status', error: err.message });
  }
});

// Mark order as cancelled
router.patch('/:orderId/cancel', async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.shippingStatus !== 'pending') {
      return res.status(400).json({ message: 'Order cannot be cancelled. Status is ' + order.shippingStatus });
    }
    order.shippingStatus = 'cancelled';
    await order.save();
    res.status(200).json({ message: 'Order marked as cancelled', order });
  } catch (err) {
    console.error('PATCH /orders/:orderId/cancel error:', err.message);
    res.status(500).json({ message: 'Failed to cancel order', error: err.message });
  }
});

// Get order statistics for an artist with optional date range
router.get('/artist/:artistId/stats', async (req, res) => {
  const { artistId } = req.params;
  const { from, to } = req.query; // ISO date strings

  try {
    // Build date filter if provided
    const dateFilter = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from);
      if (to) dateFilter.createdAt.$lte = new Date(to);
    }

    // Find all orders in the date range and populate with artist-specific products
    const orders = await Order.find({
      'items.productID': { $exists: true },
      ...dateFilter
    })
      .populate({
        path: 'items.productID',
        match: { artistID: artistId }, // Only populate products by the specific artist
        select: 'title artistID price' // Select only the necessary fields
      });

    let totalOrders = 0;
    let totalOrderValue = 0;
    let cancellations = 0;
    let shipped = 0;
    let pending = 0;
    let totalPayout = 0; // New variable to track the total payout for shipped orders
    const productSales = {}; // { productTitle: totalQuantity }

    // Loop through each order to gather statistics
    for (const order of orders) {
      // Filter for items in the current order that belong to the artist
      const artistItems = order.items.filter(item =>
        item.productID && String(item.productID.artistID) === artistId
      );

      // If the order contains no items from this artist, skip to the next order
      if (artistItems.length === 0) continue;

      // Increment total orders and categorize by shipping status
      totalOrders += 1;
      if (order.shippingStatus === 'cancelled') {
        cancellations += 1;
      } else if (order.shippingStatus === 'shipped') {
        shipped += 1;
        // If the order is shipped, calculate the payout by summing artistPayout from items
        const orderPayout = artistItems.reduce((sum, item) => sum + item.artistPayout, 0);
        totalPayout += orderPayout;
        //  // Calculate the total value of all items in this order belonging to the artist
        // const orderTotal = artistItems.reduce((sum, item) =>
        //   sum + item.priceAtPurchase * item.quantity, 0);
        // totalOrderValue += orderTotal;
      } else if (order.shippingStatus === 'pending') {
        pending += 1;
      }
      
      // Calculate the total value of all items in this order belonging to the artist
      const orderTotal = artistItems.reduce((sum, item) =>
        sum + item.priceAtPurchase * item.quantity, 0);

      totalOrderValue += orderTotal;

      // Count product sales for top products
      for (const item of artistItems) {
        const title = item.productID.title;
        productSales[title] = (productSales[title] || 0) + item.quantity;
      }
    }

    // Convert productSales object to a sorted array for top products
    const topProducts = Object.entries(productSales)
      .map(([title, quantity]) => ({ title, quantity }))
      .sort((a, b) => b.quantity - a.quantity);

    res.json({
      totalOrders,
      totalOrderValue,
      totalPayout, // Updated to return the new totalPayout variable
      cancellations,
      shipped,
      pending,
      topProducts
    });

  } catch (err) {
    console.error('GET /artist/:artistId/stats error:', err);
    res.status(500).json({ message: 'Failed to fetch artist stats', error: err.message });
  }
});

export default router;
