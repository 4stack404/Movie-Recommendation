import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">FlickOrbit</h3>
            <p className="text-gray-400 mb-4">
              Your personalized movie recommendation platform. Discover films tailored to your unique taste.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/explore" className="text-gray-400 hover:text-white transition-colors">Explore</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Genres</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/explore?genre=action" className="text-gray-400 hover:text-white transition-colors">Action</Link>
              </li>
              <li>
                <Link to="/explore?genre=comedy" className="text-gray-400 hover:text-white transition-colors">Comedy</Link>
              </li>
              <li>
                <Link to="/explore?genre=drama" className="text-gray-400 hover:text-white transition-colors">Drama</Link>
              </li>
              <li>
                <Link to="/explore?genre=sci-fi" className="text-gray-400 hover:text-white transition-colors">Sci-Fi</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-2"></i>
                <span>123 Movie Street, Cinema City, CA 90210</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone-alt mr-2"></i>
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-2"></i>
                <span>contact@flickorbit.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} FlickOrbit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 