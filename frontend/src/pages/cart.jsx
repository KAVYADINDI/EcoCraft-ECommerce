import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/navigationBar';
import api from '../api';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      const userId = localStorage.getItem('userId');
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

  return (
    <div>
      <NavigationBar role="user" />
      <div style={{ padding: '2rem' }}>
        <h2 style={{ fontWeight: 'bold', fontSize: '1.8rem', marginBottom: '1rem' }}>Your Cart</h2>
        {cartItems.length === 0 ? (
          <p style={{ fontSize: '1.2rem', color: '#555' }}>No items in cart yet.</p>
        ) : (
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;