import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/navigationBar';
import api from '../api';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCartItems = async () => {
      const userId = localStorage.getItem('id');
      if (!userId) {
        console.error('User ID not found in localStorage');
        return;
      }

      try {
        const res = await api.get(`/cart?userId=${userId}`);
        setCartItems(res.data);
      } catch (err) {
        console.error('Failed to fetch cart items:', err);
      }
    };
    fetchCartItems();
  }, []);

  useEffect(() => {
    // Recalculate subtotal whenever cartItems change
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalAmount(subtotal);
  }, [cartItems]);

  const updateQuantity = async (itemId, newQuantity) => {
    const userId = localStorage.getItem('id');
    try {
      await api.patch(`/cart/${itemId}`, { quantity: newQuantity, userId });
      setCartItems(prevItems =>
        prevItems.map(item =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const deleteItem = async (itemId) => {
    const userId = localStorage.getItem('id');
    try {
      await api.delete(`/cart/${itemId}`, { data: { userId } });
      setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
    } catch (err) {
      console.error('Failed to delete item:', err);
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
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map(item => (
                <div key={item._id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={item.productID.images[0]} alt={item.productID.title} style={{ width: '320px', height: '320px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div>
                      <h4 style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{item.productID.title}</h4>
                      <p style={{ fontSize: '1rem', margin: '0.5rem 0' }}><strong>Category:</strong> {item.productID.category}</p>
                      <p style={{ fontSize: '1rem', margin: '0.5rem 0' }}><strong>Price:</strong> ${item.productID.price}</p>
                      <p style={{ fontSize: '1rem', margin: '0.5rem 0' }}><strong>Dimensions:</strong> {item.productID.dimensions}</p>
                      <p style={{ fontSize: '1rem', margin: '0.5rem 0' }}><strong>Care Instructions:</strong> {item.productID.careInstructions}</p>
                      <p style={{ fontSize: '1rem', margin: '0.5rem 0' }}><strong>Certified:</strong> {item.productID.certified ? 'Yes' : 'No'}</p>
                      <p style={{ fontSize: '1rem', margin: '0.5rem 0' }}><strong>Return Policy:</strong> {item.productID.returnPolicy}</p>
                      <p style={{ fontSize: '1rem', margin: '0.5rem 0' }}><strong>Tags:</strong> {item.productID.tags.join(', ')}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      style={{ padding: '0.5rem', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      style={{ padding: '0.5rem', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      +
                    </button>
                    {item.quantity === 1 && (
                      <button
                        onClick={() => deleteItem(item._id)}
                        style={{ padding: '0.5rem', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '0.5rem' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Cart summary */}
            <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f5f5f5', maxWidth: '400px', marginLeft: 'auto' }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>Order Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Subtotal:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Tax (9%):</span>
                <span>${(totalAmount * 0.09).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Shipping Fee:</span>
                <span>$10.00</span>
              </div>
              <hr style={{ margin: '1rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
                <span>Total:</span>
                <span>${(totalAmount + totalAmount * 0.09 + 10).toFixed(2)}</span>
              </div>
              <button
                style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', backgroundColor: 'green', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                onClick={async () => {
                  const userId = localStorage.getItem('id');
                  if (!userId) {
                    alert('User not logged in.');
                    return;
                  }
                  try {
                    // Fetch user info
                    const userRes = await api.get(`/users/${userId}`);
                    const info = userRes.data.personalInfo || {};
                    if (!info.address || !info.mobile) {
                      alert('Please update your address and mobile number before placing an order.');
                      window.location.href = '/customer/userAccount';
                      return;
                    }
                    // Place order
                    const orderRes = await api.post('/orders', { userId });
                    if (orderRes.status === 201) {
                      alert('Order placed successfully!');
                      setCartItems([]);
                      navigate('/customer/customerOrders');
                    } else {
                      alert('Failed to place order.');
                    }
                  } catch (err) {
                    if (err.response && err.response.data && err.response.data.message) {
                      alert('Order failed: ' + err.response.data.message);
                    } else {
                      alert('Order failed.');
                    }
                  }
                }}
              >
                Place Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;