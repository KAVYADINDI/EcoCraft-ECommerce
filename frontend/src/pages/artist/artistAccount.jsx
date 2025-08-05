import React, { useEffect, useState } from 'react';
import NavigationBar from '../../components/navigationBar';
import api from '../../api';

const ArtistAccount = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('id');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        if (err.response?.status !== 200) {
          alert('Failed to fetch user details.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  const personalInfo = user.personalInfo || {};
  const address = personalInfo.address || {};

  const isArtist = user.role === 'artist';

  return (
    <div>
      <NavigationBar role={user.role} />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh', background: '#f5f5f5', padding: '2rem 0' }}>
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '2.5rem 2rem', maxWidth: 500, width: '100%' }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '1.6rem', marginBottom: '1.5rem', color: '#256029' }}>Account Details</h2>
          <div style={{ margin: '1rem 0' }}>
            <div style={{ marginBottom: '0.8rem' }}>
              <strong style={{ minWidth: 80 }}>First Name:</strong> <span>{personalInfo.firstName || '-'}</span>
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <strong style={{ minWidth: 80 }}>Last Name:</strong> <span>{personalInfo.lastName || '-'}</span>
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <strong style={{ minWidth: 80 }}>Email:</strong> <span>{user.email}</span>
            </div>
          </div>
          <div style={{ margin: '1.5rem 0' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#256029' }}>Personal Info</h3>
            <div style={{ marginBottom: '0.8rem' }}>
              <strong style={{ minWidth: 80 }}>Address:</strong>
              <br />
              Street: <span>{address.street || '-'}</span>
              <br />
              City: <span>{address.city || '-'}</span>
              <br />
              State: <span>{address.state || '-'}</span>
              <br />
              Country: <span>{address.country || '-'}</span>
              <br />
              Zip Code: <span>{address.zipCode || '-'}</span>
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <strong style={{ minWidth: 80 }}>Mobile:</strong> <span>{personalInfo.mobile || '-'}</span>
            </div>
          </div>
          {isArtist && (
            <div style={{ margin: '1.5rem 0', background: '#f9f9f9', borderRadius: 8, padding: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#256029' }}>Artist Info</h3>
              <div style={{ marginBottom: '0.8rem' }}>
                <strong style={{ minWidth: 110 }}>Origin Story:</strong> <span>{user.originStory || '-'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistAccount;