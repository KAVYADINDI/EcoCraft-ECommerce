import React, { useEffect, useState } from 'react';
import api from '../../api';
import NavigationBar from '../../components/navigationBar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ArtistDashboard = () => {
  const artistId = localStorage.getItem('id');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [artistId]);

  const fetchStats = async () => {
    try {
      const res = await api.get(`/orders/artist/${artistId}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavigationBar role="artist" />
      <div style={{ maxWidth: 800, margin: '2rem auto', background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginBottom: '1rem' }}><strong>Artist Dashboard</strong></h1>
        {/* Date filter removed */}

        {loading ? (
          <div>Loading...</div>
        ) : stats ? (
          <>
            <p><strong>Total Orders:</strong> {stats.totalOrders}</p>
            <p><strong>Total Order Value:</strong> ${stats.totalOrderValue.toFixed(2)}</p>
            <p><strong>Income:</strong> ${stats.totalPayout.toFixed(2)}</p>
            <p><strong>Shipped:</strong> {stats.shipped} | <strong>Pending:</strong> {stats.pending} | <strong>Cancelled:</strong> {stats.cancellations}</p>

            <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}><strong>Top Selling Products</strong></h2>


            {stats.topProducts.length === 0 ? (
              <p>No product sales in selected period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" interval={0} angle={0} textAnchor="middle" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </>
        ) : (
          <div>No stats available.</div>
        )}
      </div>
    </div>
  );
};

export default ArtistDashboard;
