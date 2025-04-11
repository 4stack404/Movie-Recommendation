import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { userData, setIsLoggedin, setUserData } = useContext(AppContent);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsLoggedin(false);
        setUserData(null);
        navigate('/');
        toast.success('Logged out successfully');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleVerifyAccount = async () => {
    try {
      const response = await fetch('/api/auth/send-verify-otp', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Verification email sent successfully');
        navigate('/email-verify');
      } else {
        throw new Error('Failed to send verification email');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to send verification email');
    }
  };

  // Handle scroll event to change header background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) setShowDropdown(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  // Get first letter of user's name for avatar
  const getAvatarLetter = () => {
    if (userData?.name) {
      return userData.name.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <header className={`${scrolled ? 'bg-black/90 shadow-md backdrop-blur-sm' : 'bg-gradient-to-b from-black/80 via-black/50 to-transparent'} fixed top-0 left-0 right-0 z-50`}>
      <nav className="navbar navbar-expand-lg">
        <div className="container flex items-center py-4 px-6 transition-colors duration-300">
          <Link className="text-4xl font-black text-white cursor-pointer transition-transform duration-500 hover:transform hover:scale-110" to="/">FlickOrbit</Link>
          
          <button className="lg:hidden text-white text-2xl">
            <i className="fa-solid fa-bars"></i>
          </button>
          
          <div className="hidden lg:flex items-center justify-between w-full ml-4">
            <ul className="flex">
              <li>
                <Link to="/" className="text-lg font-semibold text-white uppercase mx-4 mt-1 relative hover:text-white after:content-[''] after:absolute after:w-0 after:h-[3px] after:bottom-[-3px] after:left-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full">Home</Link>
              </li>
              <li>
                <Link to="/home" className="text-lg font-semibold text-white uppercase mx-4 mt-1 relative hover:text-white after:content-[''] after:absolute after:w-0 after:h-[3px] after:bottom-[-3px] after:left-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full">Explore</Link>
              </li>
            </ul>
            
            <div className="flex items-center">
              <div className="relative flex-grow mr-2">
                <input 
                  type="search" 
                  placeholder="Search for movies..." 
                  className="w-64 h-10 px-4 py-2 bg-black/75 text-gray-300 border-none rounded focus:outline-none focus:shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 hover:scale-110 transition-all">
                  <i className="fa-solid fa-magnifying-glass text-xl"></i>
                </button>
              </div>
              
              {userData ? (
                <div className="relative ml-2">
                  <div 
                    className="flex justify-center items-center w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-full cursor-pointer transition-all hover:scale-110 text-white font-semibold text-lg"
                    onClick={toggleDropdown}
                  >
                    {getAvatarLetter()}
                  </div>
                  
                  {showDropdown && (
                    <ul className="absolute top-[110%] right-0 bg-[rgba(51,51,51,0.95)] border border-white/10 rounded shadow-md list-none p-0 min-w-[200px] z-50">
                      <li className="px-4 py-3 border-b border-white/10">
                        <p className="text-white font-medium">{userData.name}</p>
                        <p className="text-gray-400 text-sm">{userData.email}</p>
                      </li>
                      {!userData.isAccountVerified && (
                        <li>
                          <button 
                            onClick={handleVerifyAccount}
                            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white flex items-center"
                          >
                            <i className="fa-solid fa-envelope-circle-check mr-2"></i>
                            Verify Account
                          </button>
                        </li>
                      )}
                      <li>
                        <Link 
                          to="/favorite-movies" 
                          className="block px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white"
                        >
                          <i className="fa-solid fa-heart mr-2"></i>
                          Update Preferences
                        </Link>
                      </li>
                      <li>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white flex items-center"
                        >
                          <i className="fa-solid fa-right-from-bracket mr-2"></i>
                          Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              ) : (
                <Link 
                  to="/login"
                  className="ml-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded font-semibold hover:from-red-700 hover:to-red-800 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header; 