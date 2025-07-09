import React from 'react';
import NavigationBar from '../../components/navigationBar';

const CustomerDashboard = () => {
  return (
    <div>
      <NavigationBar role="user" />
      <div style={{ padding: '2rem' }}>
        <h2>Customer Dashboard</h2>
        <p>Welcome! Browse your orders, wishlist, and more here.</p>
      </div>
    </div>
  );
};

export default CustomerDashboard;
