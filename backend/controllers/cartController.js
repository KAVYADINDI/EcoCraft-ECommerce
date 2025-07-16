import CartItem from '../models/CartItem.js';
import Cart from '../models/Cart.js';

export const addProductToCart = async (req, res) => {
  const { productID, quantity, buyerID } = req.body;

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
    console.error('Error adding product to cart:', err.message);
    res.status(500).json({ message: 'Failed to add product to cart.', error: err.message });
  }
};

export const getCartItemsByUserId = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const cartItems = await CartItem.find({ buyerID: userId }).populate('productID');
    res.status(200).json(cartItems);
  } catch (err) {
    console.error('Error fetching cart items:', err.message);
    res.status(500).json({ message: 'Failed to fetch cart items.', error: err.message });
  }
};

export const updateCartItemQuantity = async (req, res) => {
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
    console.error('Error updating cart item:', err.message);
    res.status(500).json({ message: 'Failed to update cart item.', error: err.message });
  }
};

export const getCartDetailsForUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ buyerID: userId }).populate('items.productID', 'title price');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }
    res.json({ items: cart.items });
  } catch (err) {
    console.error('Error fetching cart details:', err);
    res.status(500).json({ message: 'Failed to fetch cart details.' });
  }
};
