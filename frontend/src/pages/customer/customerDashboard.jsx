import React, { useState, useEffect } from 'react';
import NavigationBar from '../../components/navigationBar';
import api from '../../api';

const CustomerDashboard = () => {
  const [popupStyle, setPopupStyle] = useState({});
  const [popupDirection, setPopupDirection] = useState('right');
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [popupProduct, setPopupProduct] = useState(null);
  const [artistMap, setArtistMap] = useState({});
  // const [cartState, setCartState] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
        // Fetch artist userIDs for all products
        const artistIDs = Array.from(new Set(res.data.map(p => p.artistID)));
        const artistMapTemp = {};
        await Promise.all(artistIDs.map(async (id) => {
          if (id) {
            try {
              const userRes = await api.get(`/users/${id}`);
              artistMapTemp[id] = userRes.data.userID;
            } catch (err) {
              artistMapTemp[id] = id; // fallback to _id
            }
          }
        }));
        setArtistMap(artistMapTemp);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, []);

  // const filteredProducts = selectedCategory === 'All Categories'
  //   ? products
  //   : products.filter(product => product.category === selectedCategory);

  const filteredProducts = products
  .filter(product => product.listProduct === true)
  .filter(product => selectedCategory === 'All Categories' || product.category === selectedCategory);

  const userID = localStorage.getItem('id');
  console.log('CustomerDashboard: Retrieved userID from localStorage:', userID);

  const addToCart = (productID) => {
    console.log('CustomerDashboard: Adding to cart with data:', { productID, quantity: 1, buyerID: userID });
    api.post('/cart', { productID, quantity: 1, customerID: userID, price: filteredProducts.find(p => p._id === productID).price })
      .then(() => alert('Product added to cart successfully!'))
      .catch(err => alert('Failed to add product to cart.'));
  };

  return (
    <div>
      <NavigationBar role="user" onCategorySelect={setSelectedCategory} />
      <div style={{ padding: '2rem' }}>
          <div>
          <h3 style={{ fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1rem', marginTop: '1rem' }}>Featured Products</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {filteredProducts.map(product => {
              const cardRef = React.createRef();
              return (
                <div key={product._id} ref={cardRef} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', position: 'relative' }}>
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                      onMouseEnter={e => {
                        setPopupProduct(product);
                        // Check if card is near right edge and bottom edge
                        const rect = cardRef.current.getBoundingClientRect();
                        let direction = 'right';
                        if (window.innerWidth - rect.right < 370) {
                          direction = 'left';
                        }
                        let topOffset = 0;
                        if (window.innerHeight - rect.top < 350) {
                          topOffset = window.innerHeight - rect.top - 350;
                        }
                        setPopupDirection(direction);
                        setPopupStyle({
                          position: 'absolute',
                          top: topOffset,
                          left: direction === 'right' ? '105%' : undefined,
                          right: direction === 'left' ? '105%' : undefined,
                          zIndex: 10,
                          background: '#fff',
                          border: '1px solid #256029',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          padding: '1rem',
                          minWidth: '260px',
                          maxWidth: '350px',
                          fontSize: '0.95rem'
                        });
                      }}
                      onMouseLeave={() => setPopupProduct(null)}
                    />
                  )}
                  <h4>{product.title}</h4>
                  <p><strong>Price:</strong> ${product.price}</p>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
                    <button
                      onClick={() => addToCart(product._id)}
                      style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Add to Cart
                    </button>
                  </div>
                  {popupProduct && popupProduct._id === product._id && (
                    <div
                      style={popupStyle}
                      onMouseLeave={() => setPopupProduct(null)}
                    >
                      <h4 style={{ color: '#256029', marginBottom: '0.5rem', fontWeight: 'bold' }}>{product.title}</h4>
                      <p><strong>Artist ID:</strong> {artistMap[product.artistID] ?? product.artistID}</p>
                      <p><strong>Description:</strong> {product.description}</p>
                      <p><strong>Category:</strong> {product.category}</p>
                      <p><strong>Materials:</strong> {product.materials?.join(', ')}</p>
                      <p><strong>Dimensions:</strong> {product.dimensions}</p>
                      <p><strong>Care Instructions:</strong> {product.careInstructions}</p>
                      <p><strong>Certified:</strong> {product.certified ? 'Yes' : 'No'}</p>
                      <p><strong>Return Policy:</strong> {product.returnPolicy}</p>
                      <p><strong>Tags:</strong> {product.tags?.join(', ')}</p>
                      <p><strong>Available Quantity:</strong> {product.quantityAvailable}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
