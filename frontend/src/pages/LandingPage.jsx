import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/landing.css';

const LandingPage = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Toggle profile dropdown
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("selectedMovies");
    localStorage.removeItem("user");
    // No need to navigate, as we're already on the landing page
  };

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

  // Handle scroll for hero section animations
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
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

  return (
    <div className="landing-page">
      <Header />
      
      <main>
        <div className="hero">
          <div className="hero-con">
            <p className="hero-p">Can't Decide What to Watch Next?</p>
            <span className="hero-s">We Got You...</span>
            <div className="hero-btn">
              <Link to="/home">
                <button type="button" className="btn btn-light explore" id="hero-btn">Explore</button>
              </Link>
              <Link to="/login">
                <button type="button" className="btn btn-light signin" id="hero-btn">Sign-Up</button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage; 