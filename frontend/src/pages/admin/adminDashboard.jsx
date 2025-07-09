import React from 'react';
import NavigationBar from '../../components/navigationBar';

const AdminDashboard = () => {
  return (
    <div>
      <NavigationBar role="admin" />
      <div style={{ padding: '2rem' }}>
        <h2>Admin Dashboard</h2>
        <p>Welcome, admin! Manage users, artists, and site settings here.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
