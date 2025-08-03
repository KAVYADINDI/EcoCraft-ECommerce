import React, { useState, useEffect } from 'react';
import NavigationBar from '../../components/navigationBar';
import api from '../../api';

const AdminDashboard = () => {
  const [view, setView] = useState(''); // 'new' | 'listed'
  const [products, setProducts] = useState([]);
  const [commissionRates, setCommissionRates] = useState({});
  const [loading, setLoading] = useState(false);
  const [artistMap, setArtistMap] = useState({});
  const [productCount, setProductCount] = useState(0);

   // Stats state
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalArtists: 0,
    totalOrders: 0,
    shipped: 0,
    cancelled: 0,
    pending: 0
  });

// Fetch product count + stats on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          api.get('/users'),   // assuming this returns all users
          api.get('/orders')   // assuming this returns all orders
        ]);

        // calculate total
        const users = usersRes.data;
        const totalCustomers = users.filter(u => u.role === 'customer').length;
        const totalArtists = users.filter(u => u.role === 'artist').length;

        const orders = ordersRes.data;
        const totalOrders = orders.length;
        const shipped = orders.filter(o => o.shippingStatus === 'shipped').length;
        const cancelled = orders.filter(o => o.shippingStatus === 'cancelled').length;
        const pending = orders.filter(o => o.shippingStatus === 'pending').length;

        setStats({ totalCustomers, totalArtists, totalOrders, shipped, cancelled, pending });
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };
    fetchInitialData();
  }, []);




  // Fetch count of products awaiting listing on mount
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await api.get('/products?listProduct=false');
        setProductCount(res.data.length);
      } catch (err) {
        console.error('Error fetching product count:', err);
      }
    };
    fetchCount();
  }, []);

  // Fetch products by listProduct flag
  const fetchProducts = async (listProductValue) => {
    setLoading(true);
    try {
      const res = await api.get(`/products?listProduct=${listProductValue}`);
      setProducts(res.data);
      if (!listProductValue) setProductCount(res.data.length); // update count only for unlisted
      await fetchArtists(res.data);
    } catch (err) {
      console.error('Error fetching products or artists:', err);
      alert('Failed to fetch products or artist info');
    }
    setLoading(false);
  };

  // Fetch artist userIDs for given products
  const fetchArtists = async (products) => {
    const ids = [...new Set(products.map(p => p.artistID))];
    const map = {};
    await Promise.all(ids.map(async (id) => {
      try {
        const res = await api.get(`/users/${id}`);
        map[id] = res.data.userID;
      } catch {
        map[id] = id;
      }
    }));
    setArtistMap(map);
  };

  const handleCommissionChange = (productId, value) => {
    setCommissionRates({ ...commissionRates, [productId]: value });
  };

  const handleSubmitRate = async (productId) => {
    try {
      await api.patch(`/products/${productId}/commission`, { commissionRate: commissionRates[productId] });
      alert('Commission rate updated!');
      fetchProducts(false); // refresh unlisted products
    } catch (err) {
      console.error('Failed to update commission rate:', err);
      alert('Failed to update commission rate');
    }
  };

  return (
    <div>
      <NavigationBar role="admin" />
      <div style={{ padding: '2rem' }}>
        <button
          style={buttonStyle}
          onClick={() => { setView('new'); fetchProducts(false); }}
        >
          Products Awaiting Listing ({productCount})
        </button>
        <button
          style={buttonStyle}
          onClick={() => { setView('listed'); fetchProducts(true); }}
        >
          Listed Products
        </button>

        {view && (
          <div style={{ marginTop: '2rem' }}>
            {loading ? (
              <div>Loading...</div>
            ) : products.length === 0 ? (
              <div></div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {products.map(product => (
                  <li key={product._id} style={productItemStyle}>
                    <strong>{product.title}</strong> by Artist: {artistMap[product.artistID] ?? product.artistID}
                    <div><strong>Description:</strong> {product.description}</div>
                    <div><strong>Price:</strong> ${product.price}</div>
                    <div><strong>Category:</strong> {product.category}</div>
                    <div><strong>Materials:</strong> {product.materials?.join(', ')}</div>
                    <div><strong>Dimensions:</strong> {product.dimensions}</div>
                    <div><strong>Care Instructions:</strong> {product.careInstructions}</div>
                    <div><strong>Certified:</strong> {product.certified ? 'Yes' : 'No'}</div>
                    <div><strong>Return Policy:</strong> {product.returnPolicy}</div>
                    <div><strong>Tags:</strong> {product.tags?.join(', ')}</div>
                    <div><strong>Available Quantity:</strong> {product.quantityAvailable}</div>
                    <div><strong>Commission Rate:</strong> {product.commissionRate || "N/A"}</div>
                    {view === 'new' && (
                      <>
                        <input
                          type="number"
                          placeholder="Commission Rate (%)"
                          value={commissionRates[product._id] || ''}
                          onChange={e => handleCommissionChange(product._id, e.target.value)}
                          style={inputStyle}
                        />
                        <button
                          onClick={() => handleSubmitRate(product._id)}
                          style={submitButtonStyle}
                        >
                          Submit Rate
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div style={{ padding: '2rem' }}>
      <p><strong>Total Customers:</strong> {stats.totalCustomers}</p>
      <p><strong>Total Artists:</strong> {stats.totalArtists}</p>
      <p><strong>Total Orders:</strong> {stats.totalOrders}</p>
      <p><strong>Orders Status:</strong> Shipped: {stats.shipped} | Cancelled: {stats.cancelled} | Pending: {stats.pending}</p>
      </div>
    </div>
  );
};

// Styles
const buttonStyle = {
  margin: '1rem 0',
  padding: '0.5rem 1.2rem',
  background: '#256029',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginRight: '1rem'
};

const productItemStyle = {
  marginBottom: '1.5rem',
  borderBottom: '1px solid #eee',
  paddingBottom: '1rem'
};

const inputStyle = {
  marginTop: 8,
  marginRight: 8,
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  fontSize: 14
};

const submitButtonStyle = {
  background: 'green',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '6px 18px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14
};

export default AdminDashboard;