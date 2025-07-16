const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart'); // Assuming a Cart model exists
const Product = require('../models/Product'); // Assuming a Product model exists

// Add item to cart
router.post('/', async (req, res) => {
  const { productID, quantity, buyerID } = req.body;

  if (!productID || !quantity || !buyerID) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const product = await Product.findById(productID);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

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
    res.status(200).json({ message: 'Item added to cart successfully', cart });
  } catch (err) {
    console.error('Error adding item to cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
