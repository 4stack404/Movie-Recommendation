import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import OAuthCallback from './pages/OAuthCallback';
import Explore from './pages/Explore';
import GenreDetail from './pages/GenreDetail';
import MovieDetail from './pages/MovieDetail';

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/login" element={<LoginPage />} /> */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/genre/:genreId" element={<GenreDetail />} />
        <Route path="/movie/:movieId" element={<MovieDetail />} />
      </Routes>
   
  );
}

export default App;
