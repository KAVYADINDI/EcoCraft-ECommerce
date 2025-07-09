import React from 'react';
import NavigationBar from '../../components/navigationBar';

const UserAccount = () => {
  return (
    <div>
      <NavigationBar role="user" />
      <div style={{ padding: '2rem' }}>
        <h2>Account</h2>
        <p>View and edit your account details here.</p>
      </div>
    </div>
  );
};

export default UserAccount;
