import React from 'react';
import NavigationBar from '../../components/navigationBar';

const ArtistDashboard = () => {
  return (
    <div>
      <NavigationBar role="artist" />
      <div style={{ padding: '2rem' }}>
        <h2>Artist Dashboard</h2>
        <p>Welcome, artist! Manage your products and view your stats here.</p>
      </div>
    </div>
  );
};

export default ArtistDashboard;
