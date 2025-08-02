import React, { useEffect, useState } from 'react';
import NavigationBar from '../../components/navigationBar';
import api from '../../api';


const UserAccount = () => {
  const [user, setUser] = useState(null);
  const [editField, setEditField] = useState(null); // 'address' | 'mobile' | 'userID' | 'email'
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('id');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        console.log('Fetched user:', res.data);
        console.log('Commission Rate:', res.data.commissionRate);
        setUser(res.data);
      } catch (err) {
        // Only alert if the fetch itself fails, not for missing address/mobile
        if (err.response?.status !== 200) {
          alert('Failed to fetch user details.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleEdit = (field) => {
    setEditField(field);
    if (field === 'address' || field === 'mobile') {
      setEditValue(user.personalInfo?.[field] || '');
    } else if (field === 'originStory') {
      setEditValue(user.originStory || '');
    } else {
      setEditValue(user[field] || '');
    }
  };
  const handleCancel = () => {
    setEditField(null);
    setEditValue('');
  };
  const handleChange = (e) => setEditValue(e.target.value);
  const handleSave = async () => {
    if (!editValue || editValue.trim() === '') {
      alert('Please enter a value before saving.');
      return;
    }
    try {
      let patchData = {};
      if (editField === 'address' || editField === 'mobile') {
        const updated = { ...user.personalInfo, [editField]: editValue };
        patchData.personalInfo = updated;
      } else if (editField === 'originStory') {
        patchData.originStory = editValue;
      } else {
        patchData[editField] = editValue;
      }
      await api.patch(`/users/${userId}`, patchData);
      if (editField === 'address' || editField === 'mobile') {
        setUser({ ...user, personalInfo: { ...user.personalInfo, [editField]: editValue } });
      } else if (editField === 'originStory') {
        setUser({ ...user, originStory: editValue });
      } else {
        setUser({ ...user, [editField]: editValue });
      }
      setEditField(null);
      setEditValue('');
      alert('Info updated!');
    } catch (err) {
      alert('Failed to update info.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  const isArtist = user.role === 'artist';

  return (
    <div>
      <NavigationBar role={user.role} />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh', background: '#f5f5f5', padding: '2rem 0' }}>
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '2.5rem 2rem', maxWidth: 500, width: '100%' }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '1.6rem', marginBottom: '1.5rem', color: '#256029' }}>Account Details</h2>
          <div style={{ margin: '1rem 0' }}>
            {/* User ID (Name) Field */}
            <div style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center' }}>
              <strong style={{ minWidth: 80 }}>Name:</strong>
              {editField === 'userID' ? (
                <>
                  <input name="userID" value={editValue} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', marginRight: 8 }} />
                  <button onClick={handleSave} style={{ background: '#256029', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 1.1rem', fontWeight: 'bold', cursor: 'pointer', marginRight: 6 }}>Save</button>
                  <button onClick={handleCancel} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '0.4rem 1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1 }}>{user.userID}</span>
                  <button onClick={() => handleEdit('userID')} style={{ background: '#256029', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 1.1rem', fontWeight: 'bold', cursor: 'pointer', marginLeft: 8 }}>Edit</button>
                </>
              )}
            </div>
            {/* Email Field */}
            <div style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center' }}>
              <strong style={{ minWidth: 80 }}>Email:</strong>
              {editField === 'email' ? (
                <>
                  <input name="email" value={editValue} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', marginRight: 8 }} />
                  <button onClick={handleSave} style={{ background: '#256029', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 1.1rem', fontWeight: 'bold', cursor: 'pointer', marginRight: 6 }}>Save</button>
                  <button onClick={handleCancel} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '0.4rem 1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1 }}>{user.email}</span>
                  <button onClick={() => handleEdit('email')} style={{ background: '#256029', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 1.1rem', fontWeight: 'bold', cursor: 'pointer', marginLeft: 8 }}>Edit</button>
                </>
              )}
            </div>
          </div>
          <div style={{ margin: '1.5rem 0' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#256029' }}>Personal Info</h3>
            {/* Address Field */}
            <div style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center' }}>
              <strong style={{ minWidth: 80 }}>Address:</strong>
              {editField === 'address' ? (
                <>
                  <input name="address" value={editValue} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', marginRight: 8 }} />
                  <button onClick={handleSave} style={{ background: '#256029', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 1.1rem', fontWeight: 'bold', cursor: 'pointer', marginRight: 6 }}>Save</button>
                  <button onClick={handleCancel} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '0.4rem 1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1 }}>{user.personalInfo?.address || '-'}</span>
                  <button onClick={() => handleEdit('address')} style={{ background: '#256029', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 1.1rem', fontWeight: 'bold', cursor: 'pointer', marginLeft: 8 }}>Edit</button>
                </>
              )}
            </div>
            {/* Mobile Field */}
            <div style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center' }}>
              <strong style={{ minWidth: 80 }}>Mobile:</strong>
              {editField === 'mobile' ? (
                <>
                  <input name="mobile" value={editValue} onChange={handleChange} placeholder="+1 2345678901" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', marginRight: 8 }} />
                  <button onClick={handleSave} style={{ background: '#256029', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 1.1rem', fontWeight: 'bold', cursor: 'pointer', marginRight: 6 }}>Save</button>
                  <button onClick={handleCancel} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '0.4rem 1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1 }}>{user.personalInfo?.mobile || '-'}</span>
                  <button onClick={() => handleEdit('mobile')} style={{ background: '#256029', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 1.1rem', fontWeight: 'bold', cursor: 'pointer', marginLeft: 8 }}>Edit</button>
                </>
              )}
            </div>
          </div>
          {isArtist && (
            <div style={{ margin: '1.5rem 0', background: '#f9f9f9', borderRadius: 8, padding: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#256029' }}>Artist Info</h3>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.8rem' }}>
                <strong style={{ minWidth: 110 }}>Origin Story:</strong>
                {editField === 'originStory' ? (
                  <>
                    <input name="originStory" value={editValue} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', marginRight: 8 }} />
                    <button onClick={handleSave} style={{ background: '#256029', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 1.1rem', fontWeight: 'bold', cursor: 'pointer', marginRight: 6 }}>Save</button>
                    <button onClick={handleCancel} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '0.4rem 1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1 }}>{user.originStory || '-'}</span>
                    <button onClick={() => handleEdit('originStory')} style={{ background: '#256029', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 1.1rem', fontWeight: 'bold', cursor: 'pointer', marginLeft: 8 }}>Edit</button>
                  </>
                )}
              </div>
              <div><strong>Commission Rate:</strong> {user.commissionRate}%</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
