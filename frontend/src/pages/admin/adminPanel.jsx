import React from 'react';
import NavigationBar from '../../components/navigationBar';

const AdminPanel = () => {
  return (
    <div>
      <NavigationBar role="admin" />
      <div style={{ padding: '2rem' }}>
        <h2>Admin Panel</h2>
        <p>Review artist requests and manage approvals here.</p>
      </div>
    </div>
  );
};

export default AdminPanel;
