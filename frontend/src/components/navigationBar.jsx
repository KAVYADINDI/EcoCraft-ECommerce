import React, { useState, useEffect, useRef } from 'react';
import { FaBars, FaUserCircle, FaShoppingCart, FaStore, FaEnvelopeOpenText } from 'react-icons/fa';
import leafLogo from '/leaf.svg';
import { useNavigate, useLocation } from 'react-router-dom';

const categories = [
  'All Categories',
  'Wall Art',
  'Home Decor',
  'Wearable Art',
  'Stationery',
  'Utility Crafts'
];

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const NavigationBar = ({ onCategorySelect }) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [storedRole, setStoredRole] = useState(localStorage.getItem('role')); // synced role
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);

  // Keep storedRole updated when route changes (e.g. after login)
  useEffect(() => {
    setStoredRole(localStorage.getItem('role'));
  }, [location.pathname]);

  // Keep storedRole updated when localStorage changes
  useEffect(() => {
    const interval = setInterval(() => {
      const currentRole = localStorage.getItem('role');
      if (currentRole !== storedRole) setStoredRole(currentRole);
    }, 500);
    return () => clearInterval(interval);
  }, [storedRole]);

  // Session timeout handling
  useEffect(() => {
    resetSessionTimeout();
    window.addEventListener('mousemove', resetSessionTimeout);
    window.addEventListener('keydown', resetSessionTimeout);
    window.addEventListener('click', resetSessionTimeout);
    window.addEventListener('beforeunload', handleSignOutOnUnload);
    window.addEventListener('offline', handleSignOutOnOffline);

    return () => {
      clearTimeout(timeoutRef.current);
      window.removeEventListener('mousemove', resetSessionTimeout);
      window.removeEventListener('keydown', resetSessionTimeout);
      window.removeEventListener('click', resetSessionTimeout);
      window.removeEventListener('beforeunload', handleSignOutOnUnload);
      window.removeEventListener('offline', handleSignOutOnOffline);
    };
  }, []);

  const resetSessionTimeout = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      handleSignOut(true);
    }, SESSION_TIMEOUT);
  };

  const handleSignOutOnUnload = () => {
    if (localStorage.getItem('explicitSignOut')) {
      localStorage.removeItem('token');
    }
  };

  const handleSignOutOnOffline = () => {
    alert('Connection lost. Please check your internet.');
  };

  const handleSignOut = (auto = false) => {
    localStorage.clear();
    if (auto) alert('You have been signed out due to inactivity.');
    navigate('/login');
  };

  const handleLogoClick = () => {
    if (storedRole === 'customer') navigate('/customer/dashboard');
    else if (storedRole === 'artist') navigate('/artist/dashboard');
    else if (storedRole === 'admin') navigate('/admin/dashboard');
    else navigate('/login');
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setDropdownOpen(false);
    if (onCategorySelect) onCategorySelect(cat);
    navigate('/customer/dashboard');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement your search logic here if needed
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center relative">
      {/* EcoCraft logo */}
      <span
        onClick={handleLogoClick}
        className="text-green-700 cursor-pointer flex items-center gap-2"
        title="Home"
        style={{
          fontFamily: 'Georgia, Times, serif',
          fontWeight: 700,
          fontSize: '2.2rem',
          letterSpacing: '0.02em',
        }}
      >
        <img src={leafLogo} alt="Leaf Logo" style={{ width: 32, height: 32 }} />
        EcoCraft
      </span>

      {/* CUSTOMER: always show categories & search */}
      {storedRole === 'customer' && (
        <>
          {/* Categories */}
          <button
            onClick={() => setDropdownOpen(dropdownOpen === 'category' ? false : 'category')}
            className="flex items-center text-green-700 font-semibold text-lg bg-none border-none cursor-pointer gap-2"
            title="Categories"
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

          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-1 justify-center mx-8" style={{ maxWidth: 600 }}>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none"
              style={{ fontSize: '1.08rem' }}
            />
            <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded-r-lg hover:bg-green-800">
              Search
            </button>
          </form>
        </>
      )}

      {/* Right icons */}
      <div className="flex items-center space-x-6">
        {/* Account */}
        <button
          onClick={() => setDropdownOpen(dropdownOpen === 'account' ? false : 'account')}
          className="bg-none border-none cursor-pointer"
          aria-label="Account"
          title="Account options"
          style={{ background: 'none', border: 'none' }}
        >
          <FaUserCircle size={30} color="green" />
        </button>

        {/* Customer: cart */}
        {storedRole === 'customer' && (
          <button
            onClick={() => navigate('/cart')}
            className="bg-none border-none cursor-pointer"
            title="Cart"
            style={{ background: 'none', border: 'none' }}
          >
            <FaShoppingCart size={28} color="green" />
          </button>
        )}

        {/* Artist: shop */}
        {storedRole === 'artist' && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(dropdownOpen === 'shop' ? false : 'shop')}
              className="bg-none border-none cursor-pointer"
              title="Artist Shop"
              style={{ background: 'none', border: 'none' }}
            >
              <FaStore size={28} color="green" />
            </button>
            {dropdownOpen === 'shop' && (
              <ul className="absolute right-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] z-50 list-none p-0" style={{ top: '72px', fontSize: '1.08rem' }}>
                <li className="px-5 py-3 cursor-pointer text-green-700" onClick={() => { setDropdownOpen(false); navigate('/artist/orders'); }}>Orders</li>
                <li className="px-5 py-3 cursor-pointer text-green-700" onClick={() => { setDropdownOpen(false); navigate('/artist/studio'); }}>Products</li>
              </ul>
            )}
          </div>
        )}

        {/* Admin: mail icon */}
        {storedRole === 'admin' && (
          <button
            onClick={() => navigate('/admin/adminPanel')}
            className="bg-none border-none cursor-pointer"
            title="Admin Panel"
            style={{ background: 'none', border: 'none' }}
          >
            <FaEnvelopeOpenText size={28} color="green" />
          </button>
        )}
      </div>

      {/* Account dropdown */}
      {dropdownOpen === 'account' && (
        <ul className="absolute right-8 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] z-50 list-none p-0" style={{ top: '72px', fontSize: '1.08rem' }}>
          {/* Customer */}
          {storedRole === 'customer' && (
            <>
              <li className="px-5 py-3 cursor-pointer text-green-700" onClick={() => { setDropdownOpen(false); navigate('/customer/customerOrders'); }}>Orders</li>
              <li className="px-5 py-3 cursor-pointer text-green-700" onClick={() => { setDropdownOpen(false); navigate('/customer/userAccount'); }}>Account</li>
            </>
          )}
          {/* Artist */}
          {storedRole === 'artist' && (
            <li className="px-5 py-3 cursor-pointer text-green-700" onClick={() => { setDropdownOpen(false); navigate('/artist/artistAccount'); }}>Account</li>
          )}
          {/* Admin */}
          {storedRole === 'admin' && (
            <>
              <li className="px-5 py-3 cursor-pointer text-green-700" onClick={() => { setDropdownOpen(false); navigate('/admin/dashboard'); }}>Account</li>
            </>
          )}
          {/* Sign out */}
          <li className="px-5 py-3 cursor-pointer text-red-600" onClick={() => { setDropdownOpen(false); handleSignOut(false); }}>Sign Out</li>
        </ul>
      )}
    </nav>
  );
};

export default NavigationBar;

