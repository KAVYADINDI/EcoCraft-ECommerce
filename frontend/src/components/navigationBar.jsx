// Unified NavigationBar for all roles (home, user, artist, admin)
import React, { useState, useEffect, useRef } from 'react';
import { FaBars, FaUserCircle, FaShoppingCart, FaStore, FaEnvelopeOpenText } from 'react-icons/fa';
import leafLogo from '/leaf.svg';
import { useNavigate } from 'react-router-dom';
import api from '../api';  

const categories = [
  'All Categories',
  'Wall Art',
  'Home Decor',
  'Wearable Art',
  'Stationery',
  'Utility Crafts'
];

const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

const NavigationBar = ({ role = 'user', onCategorySelect }) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const [userName, setUserName] = useState(''); 
  const [cartCount, setCartCount] = useState(0);

  let roleFromStorage = role;

  const userId = localStorage.getItem('userId');  
  useEffect(() => {
  if (userId) {
    // Fetch user details using userId
    const fetchUserName = async () => {
      try {
        const res = await api.get(`/users/${userId}`); 
        setUserName(res.data.email || ''); 
      } catch (err) {
        console.error('Failed to fetch user details:', err);
        setUserName(''); // Reset userName on error
      }
    };
    fetchUserName();
  } else {
    setUserName(''); 
  }
}, [userId]);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const res = await api.get(`/cart?userId=${userId}`); // Use query parameter to fetch cart items
        const items = res.data.items || []; // Ensure `items` is an array
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0); // Calculate total quantity
        setCartCount(totalQuantity); // Set the total quantity as the cart count
      } catch (err) {
        console.error('Failed to fetch cart count:', err);
        setCartCount(0); // Reset cart count on error
      }
    };

    if (userId) {
      fetchCartCount(); // Fetch cart count initially
    }
  }, [userId]);

  // Save session data on login (simulate user data fetch)
  useEffect(() => {
    resetSessionTimeout();
    window.addEventListener('mousemove', resetSessionTimeout);
    window.addEventListener('keydown', resetSessionTimeout);
    window.addEventListener('click', resetSessionTimeout);
    // Sign out on window/tab close or reload
    window.addEventListener('beforeunload', handleSignOutOnUnload);
    // Sign out on connection lost
    window.addEventListener('offline', handleSignOutOnOffline);
    return () => {
      clearTimeout(timeoutRef.current);
      window.removeEventListener('mousemove', resetSessionTimeout);
      window.removeEventListener('keydown', resetSessionTimeout);
      window.removeEventListener('click', resetSessionTimeout);
      window.removeEventListener('beforeunload', handleSignOutOnUnload);
      window.removeEventListener('offline', handleSignOutOnOffline);
    };
    // eslint-disable-next-line
  }, []);

  // Sign out on window/tab close or reload
  const handleSignOutOnUnload = (e) => {
    // Only remove token if explicitly signed out
    if (localStorage.getItem('explicitSignOut')) {
      localStorage.removeItem('token');
    }
  };

  const handleSignOutOnOffline = () => {
    alert('Connection lost. Please check your internet.');
  };

  const resetSessionTimeout = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      handleSignOut(true);
    }, SESSION_TIMEOUT);
  };

  const handleSignOut = (auto = false) => {
    localStorage.removeItem('token'); // Correctly remove the token
    if (auto) {
      alert('You have been signed out due to inactivity.'); // Correctly display the alert
    }
    window.location.href = '/login'; // Redirect to the login page
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setDropdownOpen(false);
    if (onCategorySelect) {
      onCategorySelect(cat); // Pass selected category to parent component
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic or navigation here
  };

  const handleShopClick = () => {
    if (role === 'artist') {
      navigate('/artist/studio');
    } else {
      navigate('/shop');
    }
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <span
        onClick={() => navigate('/')}
        className="text-green-700 cursor-pointer flex items-center gap-2"
        title="Home (Go to Home)"
        style={{
          fontFamily: 'Georgia, Times, serif',
          fontWeight: 700,
          fontSize: '2.2rem',
          letterSpacing: '0.02em',
        }}
      >
        <img src={leafLogo} alt="Leaf Logo" style={{ width: 32, height: 32, display: 'inline-block', verticalAlign: 'middle' }} />
        EcoCraft
      </span>
      <button
        onClick={() => setDropdownOpen(dropdownOpen === 'category' ? false : 'category')}
        className="flex items-center text-green-700 font-semibold text-lg bg-none border-none cursor-pointer gap-2"
        title="Categories (Browse Categories)"
        style={{ background: 'none', border: 'none' }}
      >
        <FaBars size={22} />
        <span>{selectedCategory === 'All Categories' ? 'Categories' : selectedCategory}</span>
      </button>
      {dropdownOpen === 'category' && (
        <ul className="absolute bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] z-50 list-none p-0" style={{ left: '180px', top: '72px' }}>
          {categories.map((cat) => (
            <li
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-5 py-3 cursor-pointer ${selectedCategory === cat ? 'bg-gray-100 font-semibold' : ''} text-green-700`}
              style={{ fontFamily: 'inherit', fontSize: '1.08rem' }}
            >
              {cat}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSearch} className="flex flex-1 justify-center mx-8" style={{ maxWidth: 600 }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none"
          style={{ fontSize: '1.08rem', fontFamily: 'inherit' }}
        />
        <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded-r-lg hover:bg-green-800" title="Search">
          Search
        </button>
      </form>
      <div className="flex items-center space-x-6">
        {/* Account Icon and Dropdown */}
        <button
          onClick={() => setDropdownOpen(dropdownOpen === 'account' ? false : 'account')}
          className="bg-none border-none cursor-pointer"
          aria-label="Account"
          title={userName ? `Account: logged in as ${userName}` : 'Account (View account options)'}
          style={{ background: 'none', border: 'none' }}
        >
          <FaUserCircle size={30} color="green" />
        </button>
        {/* Cart for user only */}
        {role === 'user' && (
          <div className="relative">
            <button
              onClick={() => navigate('/cart')}
              className="bg-none border-none cursor-pointer"
              aria-label="Cart"
              title="Cart (View Cart)"
              style={{ background: 'none', border: 'none' }}
            >
              <FaShoppingCart size={28} color="green" />
            </button>
            {cartCount > 0 && (
              <span
                className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                style={{ transform: 'translate(50%, -50%)' }}
              >
                {cartCount}
              </span>
            )}
          </div>
        )}
        {/* Shop icon for artist with dropdown */}
        {role === 'artist' && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(dropdownOpen === 'shop' ? false : 'shop')}
              className="bg-none border-none cursor-pointer"
              aria-label="Artist Shop"
              title="Artist Shop (Orders & Products)"
              style={{ background: 'none', border: 'none' }}
            >
              <FaStore size={28} color="green" />
            </button>
            {dropdownOpen === 'shop' && (
              <ul className="absolute right-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] z-50 list-none p-0" style={{ fontFamily: 'inherit', fontSize: '1.08rem', top: '72px' }}>
                <li className="px-5 py-3 cursor-pointer text-green-700" onClick={() => { setDropdownOpen(false); navigate('/artist/orders'); }}>Orders</li>
                <li className="px-5 py-3 cursor-pointer text-green-700" onClick={() => { setDropdownOpen(false); navigate('/artist/studio'); }}>Products</li>
              </ul>
            )}
          </div>
        )}
        {/* Admin Panel */}
        {role === 'admin' && (
          <button
            onClick={() => navigate('/admin/adminPanel')}
            className="bg-none border-none cursor-pointer"
            aria-label="Admin Panel"
            title="Admin Panel (Go to Admin Panel)"
            style={{ background: 'none', border: 'none' }}
          >
            <FaEnvelopeOpenText size={28} color="green" />
          </button>
        )}
      </div>
      {dropdownOpen === 'account' && (
        <ul className="absolute right-8 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] z-50 list-none p-0" style={{ fontFamily: 'inherit', fontSize: '1.08rem', top: '72px' }}>
          {role === 'user' && <>
            <li className="px-5 py-3 cursor-pointer text-green-700" onClick={() => { setDropdownOpen(false); navigate('/customer/favourites'); }}>Favourites</li>
            <li className="px-5 py-3 cursor-pointer text-green-700" onClick={() => { setDropdownOpen(false); navigate('/customer/orders'); }}>Orders</li>
          </>}
          <li className="px-5 py-3 cursor-pointer text-green-700" onClick={() => { setDropdownOpen(false); navigate(role === 'artist' ? '/artist/account' : '/customer/userAccount'); }}>Account</li>
          <li className="px-5 py-3 cursor-pointer text-red-600" onClick={() => { setDropdownOpen(false); handleSignOut(false); }}>Sign Out</li>
        </ul>
      )}
    </nav>
  );
};

export default NavigationBar;