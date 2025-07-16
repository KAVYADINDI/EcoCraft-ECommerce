import React, { useState, useEffect } from 'react';
import NavigationBar from '../../components/navigationBar';
import api from '../../api';

const CustomerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [cartState, setCartState] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products'); // Correct endpoint
        const productsWithListingPrice = res.data.map(product => ({
          ...product,
          price: product.listingPrice || product.price, // Use listingPrice if available
        }));
        setProducts(productsWithListingPrice);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts =
    selectedCategory === 'All Categories'
      ? products
      : products.filter(product => product.category === selectedCategory);

  const userID = localStorage.getItem('userId') || 'defaultUserId'; // Fallback if userId is not found
  console.log('CustomerDashboard: Retrieved userID from localStorage:', userID);

  const addToCart = (productID) => {
    if (!userID) {
      alert('User ID not found. Please log in.');
      return;
    }
    console.log('CustomerDashboard: Adding to cart with data:', { productID, quantity: 1, buyerID: userID });
    api.post('/cart', { productID, quantity: 1, buyerID: userID }) // Ensure correct endpoint
      .then(() => alert('Product added to cart successfully!'))
      .catch(err => {
        console.error('Failed to add product to cart:', err);
        alert('Failed to add product to cart.');
      });
  };

  return (
    <div>
      <NavigationBar role="user" onCategorySelect={setSelectedCategory} />
      <div style={{ padding: '2rem' }}>
        <div>
          <h3 style={{ fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1rem', marginTop: '1rem' }}>Featured Products</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {filteredProducts.map(product => (
              <div key={product._id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                {product.images && product.images.length > 0 && (
                  <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                )}
                <h4>{product.title}</h4>
                <p><strong>Price:</strong> ${product.listingPrice}</p>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
                  <button
                    onClick={() => addToCart(product._id)}
                    style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1rem', marginTop: '1rem'}}>Bestsellers</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {filteredProducts
              .filter(product => product.averageRating >= 4)
              .map(product => (
                <div key={product._id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                  {product.images && product.images.length > 0 && (
                    <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                  )}
                  <h4>{product.title}</h4>
                  <p><strong>Price:</strong> ${product.listingPrice}</p>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
                    <button
                      onClick={() => addToCart(product._id)}
                      style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;