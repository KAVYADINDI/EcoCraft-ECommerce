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

  // Fix: Batch status update in a single effect after orders are loaded
  useEffect(() => {
    if (!loading && orders.length > 0) {
      orders.forEach(order => {
        const itemCount = order.items?.length || 0;
        const shippedCount = order.items?.filter(item => item.shippingStatus === 'shipped').length || 0;
        const cancelledCount = order.items?.filter(item => item.shippingStatus === 'cancelled').length || 0;
        let computedStatus = 'pending';
        if (itemCount > 0 && shippedCount + cancelledCount === itemCount) {
          computedStatus = 'completed';
        }
        if (order.orderStatus !== computedStatus) {
          api.patch(`/orders/${order._id}/status`, { orderStatus: computedStatus })
            .then(() => {
              setOrders(orders => orders.map(o => o._id === order._id ? { ...o, orderStatus: computedStatus } : o));
            })
            .catch(() => {});
        }
      });
    }
  }, [orders, loading]);

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
                  <div><b>Order ID:</b> {order._id}</div>
                  <div><b>Date:</b> {new Date(order.createdAt).toLocaleDateString()}</div>
                  <div><b>Status:</b> {order.orderStatus}</div>
                  <div><b>Total:</b> ${order.totalAmountWhilePlacingOrder?.toFixed(2) ?? '-'}</div>
                  <div>
                    <b>Items:</b>
                    <ul style={{ marginLeft: 16 }}>
                      {order.items?.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '0.5rem' }}>
                          <b>{item.productID.title}</b> x <b>{item.quantity}</b> (<b>${item.priceAtPurchase?.toFixed(2) ?? '-'}</b>)<br />
                          <b>Shipment Status:</b> {item.shippingStatus}
                          {item.shippingStatus === 'shipped' && (
                            <span>
                              <br />
                              <b>Tracking Number:</b> {item.trackingNumber || 'N/A'}
                              <br /><b>Shipped Date:</b> {item.shippedDate ? new Date(item.shippedDate).toLocaleDateString() : 'N/A'}
                              <br />Item is shipped and should arrive in 5-7 business days.
                            </span>
                          )}
                          {/* Only show cancel button if not shipped or cancelled */}
                          {item.shippingStatus !== 'shipped' && item.shippingStatus !== 'cancelled' && (
                            <button
                              style={{
                                marginLeft: '1rem',
                                background: '#d32f2f',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.3rem 1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                              onClick={async () => {
                                if (!window.confirm('Are you sure you want to cancel this item?')) return;
                                try {
                                  const res = await api.patch(`/orders/${order._id}/items/${item._id}/cancel`);
                                  if (res.status === 200) {
                                    alert('Item cancelled successfully!');
                                    setOrders(orders =>
                                      orders.map(o =>
                                        o._id === order._id
                                          ? {
                                              ...o,
                                              items: o.items.map((it, iidx) =>
                                                iidx === idx ? { ...it, shippingStatus: 'cancelled' } : it
                                              )
                                            }
                                          : o
                                      )
                                    );
                                  } else {
                                    alert('Failed to cancel item.');
                                  }
                                } catch (err) {
                                  alert('Failed to cancel item.');
                                }
                              }}
                            >
                              Cancel Item
                            </button>
                          )}
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
