import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  // Add useEffect to handle footer animation with IntersectionObserver
  useEffect(() => {
    const footer = document.querySelector('.footer');
    if (!footer) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          footer.classList.add('animated');
        }
      });
    }, {
      threshold: 0.2 // Trigger when 20% of the footer is visible
    });

    observer.observe(footer);
    
    return () => {
      if (footer) observer.unobserve(footer);
    };
  }, []);

  return (
    <footer className="footer bg-[#0d0d0d] text-[#333] py-6 px-5 text-center border-t border-[#e0e0e044] w-full overflow-hidden shrink-0">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 footer-item">FlickOrbit</h1>
            <p className="text-sm text-gray-600 mb-2 footer-item">
              We recommend movies based on your taste
            </p>
          </div>
          
          <div className="flex justify-between gap-4 footer-item">
            {/* Left Section: Explore, Home, Profile */}
            <div className="flex flex-col gap-2 items-start">
              <Link to="/" className="text-sm font-semibold text-gray-600 uppercase transition-colors hover:text-white">Home</Link>
              <Link to="/home" className="text-sm font-semibold text-gray-600 uppercase transition-colors hover:text-white">Explore</Link>
              <Link to="/home" className="text-sm font-semibold text-gray-600 uppercase transition-colors hover:text-white">Profile</Link>
            </div>
            
            {/* Right Section: Watchlist, Help, About */}
            <div className="flex flex-col gap-2 items-start">
              <Link to="/home" className="text-sm font-semibold text-gray-600 uppercase transition-colors hover:text-white">Watchlist</Link>
              <Link to="/" className="text-sm font-semibold text-gray-600 uppercase transition-colors hover:text-white">Help</Link>
              <Link to="/" className="text-sm font-semibold text-gray-600 uppercase transition-colors hover:text-white">About</Link>
            </div>
          </div>
          
          {/* Social Media Links */}
          <div className="flex justify-center items-center footer-item">
            <div className="flex gap-3">
              <div className="footer-icon w-[40px] h-[40px] flex justify-center items-center bg-[#f1f1f1] rounded-full shadow-md transition-all hover:scale-110 hover:shadow-lg">
                <a href="#" className="text-[#333] text-[18px] hover:text-black">
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
              <div className="footer-icon w-[40px] h-[40px] flex justify-center items-center bg-[#f1f1f1] rounded-full shadow-md transition-all hover:scale-110 hover:shadow-lg">
                <a href="#" className="text-[#333] text-[18px] hover:text-black">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
              <div className="footer-icon w-[40px] h-[40px] flex justify-center items-center bg-[#f1f1f1] rounded-full shadow-md transition-all hover:scale-110 hover:shadow-lg">
                <a href="#" className="text-[#333] text-[18px] hover:text-black">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-700 mt-4 pt-4 border-t border-gray-800 footer-item">
          © 2025 FlickOrbit. All rights reserved
        </p>
      </div>
    </footer>
  );
}

export default Footer; 