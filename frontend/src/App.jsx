import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import OAuthCallback from './pages/OAuthCallback';
import FavoriteMovies from './pages/FavoriteMovies';
import Explore from './pages/Explore';
import GenreDetail from './pages/GenreDetail';
import MovieDetail from './pages/MovieDetail';
import Profile from './pages/Profile';
import MyList from './pages/MyList';
import AlreadyWatched from './pages/AlreadyWatched';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/login" element={<LoginPage />} /> */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/favorite-movies" element={<FavoriteMovies />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/genre/:genreId" element={<GenreDetail />} />
        <Route path="/movie/:movieId" element={<MovieDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/watchlist" element={<MyList />} />
        <Route path="/already-watched" element={<AlreadyWatched />} />
      </Routes>
    </>
  );
}

export default App;
