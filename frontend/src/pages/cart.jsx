import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/navigationBar';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate(); // Add navigation hook

  useEffect(() => {
    const fetchCartItems = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found in localStorage');
        return;
      }

      try {
        const res = await api.get(`/cart?userId=${userId}`);
        const items = res.data.items || []; // Ensure `items` is an array
        setCartItems(items); // Set the validated array to state
      } catch (err) {
        console.error('Failed to fetch cart items:', err);
        setCartItems([]); // Reset state on error
      }
    };
    fetchCartItems();
  }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await api.patch(`/cart/${itemId}`, { quantity: newQuantity });
      setCartItems(prevItems =>
        prevItems.map(item =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const deleteCartItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
    } catch (err) {
      console.error('Failed to delete cart item:', err);
    }
  };

  const TAX_RATE = 0.1; // 10% tax rate

  const calculateTotalCost = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.productID.listingPrice * item.quantity, 0);
    const tax = subtotal * TAX_RATE;
    return { subtotal, tax, total: subtotal + tax };
  };

  const createOrder = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User ID not found. Please log in.');
      return;
    }

    try {
      const { subtotal, tax, total } = calculateTotalCost();
      const orderData = {
        userId,
        items: cartItems.map(item => ({
          productID: item.productID._id,
          quantity: item.quantity,
          priceAtPurchase: item.productID.listingPrice,
        })),
        subtotal,
        tax,
        total,
      };

      await api.post('/orders', orderData); // Call the backend to create the order
      alert('Order created successfully!');
      setCartItems([]); // Clear the cart after order creation
      navigate('/customer/orders'); // Navigate to CustomerOrders page
    } catch (err) {
      console.error('Failed to create order:', err);
      alert('Failed to create order. Please try again.');
    }
  };

  return (
    <div>
      <NavigationBar role="user" />
      <div style={{ padding: '2rem' }}>
        <h2 style={{ fontWeight: 'bold', fontSize: '1.8rem', marginBottom: '1rem' }}>Your Cart</h2>
        {cartItems.length === 0 ? (
          <p style={{ fontSize: '1.2rem', color: '#555' }}>No items in cart yet.</p>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map(item => (
                <div key={item._id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={item.productID.images[0]} alt={item.productID.title} style={{ width: '320px', height: '320px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div>
                      <h4 style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{item.productID.title}</h4>
                      <p style={{ fontSize: '1rem', margin: '0.5rem 0' }}><strong>Price:</strong> ${item.productID.listingPrice}</p>
                      <p style={{ fontSize: '1rem', margin: '0.5rem 0' }}><strong>Quantity:</strong> {item.quantity}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1} style={{ padding: '0.5rem', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={{ padding: '0.5rem', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                    <button onClick={() => deleteCartItem(item._id)} style={{ padding: '0.5rem', backgroundColor: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1rem' }}>Order Summary</h3>
              {(() => {
                const { subtotal, tax, total } = calculateTotalCost();
                return (
                  <>
                    <p style={{ fontSize: '1rem', margin: '0.5rem 0' }}><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
                    <p style={{ fontSize: '1rem', margin: '0.5rem 0' }}><strong>Tax (10%):</strong> ${tax.toFixed(2)}</p>
                    <p style={{ fontSize: '1.2rem', margin: '0.5rem 0', fontWeight: 'bold' }}><strong>Total:</strong> ${total.toFixed(2)}</p>
                    <button
                      onClick={createOrder}
                      style={{ marginTop: '1rem', padding: '0.8rem', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
                    >
                      Place Order
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;