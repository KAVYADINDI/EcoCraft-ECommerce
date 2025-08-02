import React, { useEffect, useState } from 'react';
import api from '../../api';
import NavigationBar from '../../components/navigationBar';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('id');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Assuming backend endpoint: /orders/customer/:userId
        const res = await api.get(`/orders/customer/${userId}`);
        setOrders(res.data);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

  return (
    <div>
      <NavigationBar role="customer" />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh', background: '#f5f5f5', padding: '2rem 0' }}>
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '2.5rem 2rem', maxWidth: 600, width: '100%' }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '1.6rem', marginBottom: '1.5rem', color: '#256029' }}>Order History</h2>
          {loading ? (
            <div>Loading...</div>
          ) : orders.length === 0 ? (
            <div>No orders found.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {orders.map(order => (
                <li key={order._id} style={{ marginBottom: '1.2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                  <div><strong>Order ID:</strong> {order._id}</div>
                  <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
                  <div><strong>Status:</strong> {order.shippingStatus}</div>
                  <div><strong>Total:</strong> ${order.totalAmountWhilePlacingOrder?.toFixed(2) ?? '-'} </div>
                  <div>
                    <strong>Items:</strong>
                    <ul style={{ marginLeft: 16 }}>
                      {order.items?.map((item, idx) => (
                        <li key={idx}>
                          {item.productID.title} x {item.quantity} (${item.priceAtPurchase?.toFixed(2) ?? '-'})
                        </li>
                      ))}
                    </ul>
                  </div>
                  {order.shippingStatus === 'pending' && (
                    <button
                      style={{ marginTop: '1rem', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1.2rem', fontWeight: 'bold', cursor: 'pointer' }}
                      onClick={async () => {
                        if (!window.confirm('Are you sure you want to cancel this order?')) return;
                        try {
                          const res = await api.patch(`/orders/${order._id}/cancel`);
                          if (res.status === 200) {
                            alert('Order cancelled successfully!');
                            setOrders(orders => orders.map(o => o._id === order._id ? { ...o, shippingStatus: 'cancelled' } : o));
                          } else {
                            alert('Failed to cancel order.');
                          }
                        } catch (err) {
                          alert('Failed to cancel order.');
                        }
                      }}
                    >
                      Cancel Order
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerOrders;
