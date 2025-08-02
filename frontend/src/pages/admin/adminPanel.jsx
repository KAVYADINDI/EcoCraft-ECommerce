import React, { useState, useEffect } from 'react';
import api from '../../api';
import NavigationBar from '../../components/navigationBar';

const statusOptions = ['all', 'request_received', 'waiting_for_documents', 'received_documents', 'approved', 'rejected'];
// const statusOrder = ['request_received', 'waiting_for_documents', 'received_documents','approved', 'rejected'];

const AdminPanel = () => {

  const [artists, setArtists] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [commissionRate, setCommissionRate] = useState({});

  useEffect(() => {
    fetchArtists();
    // eslint-disable-next-line
  }, []);

  const fetchArtists = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users/artists');
      setArtists(res.data);
    } catch (err) {
      setError('Failed to fetch artists.');
    }
    setLoading(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/users/artist/${id}/status`, { status: newStatus });
      setArtists(artists =>
        artists.map(artist =>
          artist._id === id ? { ...artist, status: newStatus } : artist
        )
      );
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const handleCommissionRateChange = (id, value) => {
    console.log(`Commission rate for ${id} changed to ${value}`);
    setCommissionRate(prev => ({ ...prev, [id]: value }));
  };

  const updateCommissionRate = async (id) => {
    try {
      console.log(`Updating commission rate for ${id} to ${commissionRate[id]}`);
      const rate = commissionRate[id];
      if (!rate) {
        alert('Please enter a commission rate before submitting.');
        return;
      }
      await api.patch('/users/update-commission-rate', { id: id, commissionRate: rate });
      console.log(`Commission rate for ${id} updated to ${rate}`);
      alert('Commission rate updated successfully.');
    } catch (err) {
      alert('Failed to update commission rate.');
    }
  };

  const filteredArtists =
    filter === 'all' ? artists : artists.filter(artist => artist.status === filter);

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
      <NavigationBar role="admin" />
      <div style={{ display: 'flex', padding: '2rem' }}>
        {/* Left: Status Filter Cards */}
        <div style={{ minWidth: 200, marginRight: 32 }}>
          {statusOptions.map(status => (
            <div
              key={status}
              onClick={() => setFilter(status)}
              style={{
                background: filter === status ? 'green' : '#fff',
                color: filter === status ? '#fff' : '#2d3748',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                padding: '1rem',  
                marginBottom: 16,
                cursor: 'pointer',
                fontWeight: 600,
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s',
              }}
            >
              {status === 'all'
                ? 'All'
                : status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
          ))}
        </div>

        {/* Right: Artist List */}
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 24 }}>Artist Requests</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : filteredArtists.length === 0 ? (
            <p>No artists found for this status.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredArtists.map(artist => (
                <div
                  key={artist._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#fff',
                    borderRadius: 10,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    padding: '1rem 1.5rem',
                  }}
                >
                  <div>
                    <strong>{artist.userID || artist.email}</strong>
                    <span style={{
                      marginLeft: 16,
                      padding: '2px 10px',
                      borderRadius: 8,
                      background:
                        artist.status === 'approved'
                          ? '#c6f6d5' // Original green for approved
                          : artist.status === 'request_received'
                          ? '#fefcbf' // Original yellow for request_received
                          : artist.status === 'waiting_for_documents'
                          ? '#bee3f8' // Original blue for waiting_for_documents
                          : '#fed7d7',
                      color:
                        artist.status === 'approved'
                          ? '#22543d' // Original dark green for approved
                          : artist.status === 'request_received'
                          ? '#744210' // Original brown for request_received
                          : artist.status === 'waiting_for_documents'
                          ? '#2b6cb0' // Original dark blue for waiting_for_documents
                          : '#742a2a',
                      fontWeight: 500,
                      fontSize: 13,
                    }}>
                      {artist.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  {/* Status Toggle/Update Button */}
                  {artist.status !== 'rejected' && (
                    <>
                      {artist.status === 'request_received' && (
                        <button
                          onClick={() => handleStatusChange(artist._id, 'waiting_for_documents')}
                          style={{
                            background: '#3182ce',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 18px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: 14,
                            marginLeft: 24,
                            transition: 'background 0.2s',
                          }}
                        >
                          Request Docs
                        </button>
                      )}
                      {artist.status === 'waiting_for_documents' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(artist._id, 'received_documents')}
                            style={{
                              background: '#3182ce',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '6px 18px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: 14,
                              marginLeft: 24,
                              transition: 'background 0.2s',
                            }}
                          >
                            Mark as Received
                          </button>
                        </>
                      )}
                      {artist.status === 'received_documents' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(artist._id, 'approved')}
                            style={{
                              background: '#15803d',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '6px 18px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: 14,
                              marginLeft: 24,
                              transition: 'background 0.2s',
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(artist._id, 'rejected')}
                            style={{
                              background: '#e53e3e',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '6px 18px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: 14,
                              marginLeft: 12,
                              transition: 'background 0.2s',
                            }}
                          >
                            Reject
                          </button>
                           <input
                            type="number"
                            placeholder="Commission Rate (%)"
                            value={commissionRate[artist._id] || ''}
                            onChange={(e) => handleCommissionRateChange(artist._id, e.target.value)}
                            style={{
                              marginLeft: 12,
                              padding: '6px 12px',
                              borderRadius: 8,
                              border: '1px solid #e2e8f0',
                              fontSize: 14,
                            }}
                          />
                          <button
                            onClick={() => updateCommissionRate(artist._id)}
                            style={{
                              background: 'green',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '6px 18px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: 14,
                              marginLeft: 12,
                              transition: 'background 0.2s',
                            }}
                          >
                            Submit Rate
                          </button>
                        </>
                      )}
                      {artist.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(artist._id, 'rejected')}
                          style={{
                            background: '#e53e3e',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 18px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: 14,
                            marginLeft: 24,
                            transition: 'background 0.2s',
                          }}
                        >
                          Reject
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
