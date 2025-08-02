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
        // Backend endpoint: /orders/artist/:artistId
        const res = await api.get(`/orders/artist/${artistId}`);
        setOrders(res.data);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [artistId]);

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
              {orders.map(order => (
                <li key={order._id} style={{ marginBottom: '1.2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                  <div><strong>Order ID:</strong> {order._id}</div>
                  <div><strong>Customer ID:</strong> {order.customerID}</div>
                  <div>
                    <strong>Items:</strong>
                    <ul style={{ marginLeft: 16 }}>
                      {order.items?.map((item, idx) => (
                        <li key={idx}>
                         {item.productID ? `${item.productID.title} x ${item.quantity} ($${item.priceAtPurchase?.toFixed(2) ?? '-'})` : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div><strong>Shipping Status:</strong> {order.shippingStatus}</div>
                  {order.shippingStatus === 'pending' && (
                    <>
                      <button
                        style={{ marginTop: '1rem', background: 'green',  color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1.2rem', fontWeight: 'bold', cursor: 'pointer', marginRight: '0.7rem' }}
                        onClick={async () => {
                            if (!window.confirm('Are you sure you want to mark this order as shipped?')) return;
                            try {
                                const res = await api.patch(`/orders/${order._id}/ship`);
                                if (res.status === 200) {
                                  setOrders(orders.map(o => o._id === order._id ? { ...o, shippingStatus: 'Shipped' } : o));
                                  alert('Updated shipment');
                                } else {
                                  alert('Failed to update order status.');
                                }
                            } catch (err) {
                                console.error('Error updating order status:', err);
                                alert('Failed to update order status.');
                            }
                        }}
                      >
                        Shipped
                      </button>
                    </>
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

export default ArtistOrders;
