import React from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from '../components/navigationBar';
import ProductCard from '../components/productCard';

const Home = () => {
  const featuredProducts = [
    { id: 1, name: 'Wireless Headphones', price: '$99.99', image: '/assets/headphones.jpg' },
    { id: 2, name: 'Smartwatch', price: '$149.99', image: '/assets/smartwatch.jpg' },
  ];

  const bestSellers = [
    { id: 3, name: 'Bluetooth Speaker', price: '$59.99', image: '/assets/speaker.jpg' },
    { id: 4, name: 'Fitness Tracker', price: '$89.99', image: '/assets/fitnesstracker.jpg' },
  ];

  return (
    <div
      className="bg-gray-50 min-h-screen"
      style={{
        fontFamily: 'Segoe UI, Arial, sans-serif',
        fontSize: '1.08rem',
        fontWeight: 400,
        letterSpacing: '0.01em',
        backgroundColor: '#f9fafb', // matches bg-gray-50
        minHeight: '100vh',
      }}
    >
      <NavigationBar />

      <div className="container mx-auto px-4 py-8">
        {/* Featured Products */}
        <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Best Sellers */}
        <h2 className="text-2xl font-semibold mt-12 mb-4">Best Sellers</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Sign In Button 
        <div className="mt-12 flex justify-center">
          <Link to="/login">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Sign In
            </button>
          </Link>
        </div> */}
      </div>
    </div>
  );
};

export default Home;
