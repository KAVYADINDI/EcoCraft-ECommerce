import React, { useState, useEffect } from 'react';
import NavigationBar from '../../components/navigationBar';
import api from '../../api';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found in localStorage');
        return;
      }

      try {
        const res = await api.get(`/api/orders?userId=${userId}`); // Ensure the correct API endpoint
        setOrders(res.data.orders || []); // Ensure `orders` is an array
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <NavigationBar role="user" />
      <div style={{ padding: '2rem' }}>
        <h2 style={{ fontWeight: 'bold', fontSize: '1.8rem', marginBottom: '1rem' }}>Order History</h2>
        {orders.length === 0 ? (
          <p style={{ fontSize: '1.2rem', color: '#555' }}>No orders yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <div key={order._id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Order ID: {order._id}</h4>
                <p style={{ fontSize: '1rem', margin: '0.5rem 0' }}><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p style={{ fontSize: '1rem', margin: '0.5rem 0' }}><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
                <p style={{ fontSize: '1rem', margin: '0.5rem 0' }}><strong>Status:</strong> {order.shippingStatus}</p>
                <div>
                  <h5 style={{ fontWeight: 'bold', fontSize: '1rem', marginTop: '1rem' }}>Items:</h5>
                  <ul>
                    {order.items.map(item => (
                      <li key={item.productID}>
                        {item.quantity} x {item.productID.title} @ ${item.priceAtPurchase.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
