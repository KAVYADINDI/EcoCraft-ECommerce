import React, { useEffect, useState } from 'react';
import api from '../../api';
import NavigationBar from '../../components/navigationBar';

const ArtistOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const artistId = localStorage.getItem('id');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get(`/orders/artist/${artistId}`);
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch artist orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [artistId]);

  const acceptItemOrder = async (orderId, itemId) => {
    // Find the order and item to check status
    const order = orders.find(o => o._id === orderId);
    const item = order?.items.find(i => i._id === itemId);
    if (item?.shippingStatus === 'cancelled') {
      alert('This item has been cancelled and cannot be accepted.');
      return;
    }
    if (!window.confirm('Accept this order item?')) return;
    try {
      const res = await api.patch(`/orders/${orderId}/items/${itemId}/accept`);
      if (res.status === 200) {
        const updated = await api.get(`/orders/artist/${artistId}`);
        setOrders(updated.data);
        alert('Order item accepted.');
      } else {
        alert('Failed to accept item.');
      }
    } catch (err) {
      console.error('Error accepting item:', err);
      alert('Failed to accept item.');
    }
  };

  const markItemAsShipped = async (orderId, itemId, trackingNumber, shippedDate) => {
    // Find the order and item to check status
    const order = orders.find(o => o._id === orderId);
    const item = order?.items.find(i => i._id === itemId);
    if (item?.shippingStatus === 'cancelled') {
      alert('This item has been cancelled and cannot be marked as shipped.');
      return;
    }
    if (!window.confirm('Mark this item as shipped?')) return;
    try {
      const res = await api.patch(`/orders/${orderId}/items/${itemId}/ship`, { trackingNumber, shippedDate });
      if (res.status === 200) {
        const updated = await api.get(`/orders/artist/${artistId}`);
        setOrders(updated.data);
        alert('Item marked as shipped.');
      } else {
        alert('Failed to update item status.');
      }
    } catch (err) {
      console.error('Error updating item status:', err);
      alert('Failed to update item status.');
    }
  };

  const updateTrackingNumber = async (orderId, itemId, trackingNumber) => {
    if (!trackingNumber) return;
    try {
      const res = await api.patch(`/orders/${orderId}/items/${itemId}/tracking`, { trackingNumber });
      if (res.status === 200) {
        const updated = await api.get(`/orders/artist/${artistId}`);
        setOrders(updated.data);
        alert('Tracking number updated.');
      } else {
        alert('Failed to update tracking number.');
      }
    } catch (err) {
      console.error('Error updating tracking number:', err);
      alert('Failed to update tracking number.');
    }
  };

  return (
    <div>
      <NavigationBar role="artist" />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh', background: '#f5f5f5', padding: '2rem 0' }}>
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '2.5rem 2rem', maxWidth: 600, width: '100%' }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '1.6rem', marginBottom: '1.5rem', color: '#256029' }}>Orders Received</h2>
          {loading ? (
            <div>Loading...</div>
          ) : orders.length === 0 ? (
            <div>No orders found.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {orders.map(order => {
                // Filter items belonging to current artist
                const artistItems = order.items.filter(item =>
                  item.productID && String(item.productID.artistID) === artistId
                );
                if (artistItems.length === 0) return null;

                return (
                  <li key={order._id} style={{ marginBottom: '1.2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                    <div><strong>Order ID:</strong> {order._id}</div>
                    <div><strong>Customer ID:</strong> {order.customerID}</div>
                    <div>
                      <strong>Your Items:</strong>
                      <ul style={{ marginLeft: 16 }}>
                        {artistItems.map((item, idx) => (
                          <li key={item._id || idx}>
                            {item.productID ? `${item.productID.title} x ${item.quantity} ($${item.priceAtPurchase?.toFixed(2) ?? '-'})` : null}
                            <div>
                              <strong>Item Shipping Status:</strong> {item.shippingStatus || order.shippingStatus}
                              {item.shippingStatus === 'pending' && (
                                <button
                                  style={{ marginLeft: '1rem', background: '#256029', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                                  onClick={() => acceptItemOrder(order._id, item._id)}
                                >
                                  Accept Order
                                </button>
                              )}
                              {item.shippingStatus === 'orderAccepted' && (
                                <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                                  <label>
                                    <input
                                      type="text"
                                      placeholder="Enter tracking number"
                                      id={`tracking-${order._id}-${item._id}`}
                                      style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '8px' }}
                                    />
                                    <button
                                      type="button"
                                      style={{ background: 'green', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 10px', fontWeight: 'bold', cursor: 'pointer' }}
                                      onClick={() => {
                                        const trackingNumber = document.getElementById(`tracking-${order._id}-${item._id}`).value;
                                        if (!trackingNumber) {
                                          alert('Please enter a tracking number.');
                                          return;
                                        }
                                        const shippedDate = new Date().toISOString();
                                        markItemAsShipped(order._id, item._id, trackingNumber, shippedDate);
                                      }}
                                    >
                                      Mark as Shipped
                                    </button>
                                  </label>
                                </div>
                              )}
                              {item.shippingStatus === 'shipped' && (
                                <div style={{ marginLeft: '1rem', color: 'black', marginTop: '0.5rem' }}>
                                  <strong>Shipped Date:</strong> {item.shippedDate ? new Date(item.shippedDate).toLocaleString() : ''}
                                  <br />
                                  <strong>Tracking Number:</strong> {item.trackingNumber || ''}
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistOrders;
