import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Login = () => {
  const navigate = useNavigate();
  const { setIsLoggedin, backendUrl, } = useContext(AppContent);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || (isLogin ? 'Login failed' : 'Registration failed'));
      }

      const data = await res.json();

      if (data.success) {
        setIsLoggedin(true);
        toast.success(isLogin ? "Logged in successfully!" : "Account created successfully!");
        navigate("/");
      } else {
        toast.error(data.message || (isLogin ? "Login failed" : "Registration failed"));
      }
    } catch (error) {
      console.error(isLogin ? 'Login error:' : 'Registration error:', error);
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/api/auth/google';
  };

  return (
    <div className="bg-[#0D0D0D] text-white font-[Montserrat] min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${assets.bg_img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.7)',
        }}
      />
      <div className="absolute inset-0 bg-black/50 z-0" />

      <form onSubmit={handleSubmit} className="relative z-10 bg-[#1A1A1A] p-8 rounded-2xl shadow-xl w-full max-w-md border border-red-500/30">
        <h2 className="text-3xl font-bold text-center mb-6">{isLogin ? "Welcome Back" : "Create Account"}</h2>
        <p className="text-gray-400 text-center mb-8">
          {isLogin ? "Login to your account" : "Create your account"}
        </p>

        <div className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <img src={assets.person_icon} alt="" className="w-5 h-5 opacity-70" />
              </div>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-label="Full name"
                className="auth-input pl-10 bg-[#1A1A1A] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent transition-all duration-300 hover:border-gray-500"
              />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center">
              <img src={assets.mail_icon} alt="" className="w-5 h-5 opacity-70" />
            </div>
            <input
              type="email"
              placeholder="Email id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email id"
              className="auth-input pl-10 bg-[#1A1A1A] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent transition-all duration-300 hover:border-gray-500"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center">
              <img src={assets.lock_icon} alt="" className="w-5 h-5 opacity-70" />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password"
              className="auth-input pl-10 bg-[#1A1A1A] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent transition-all duration-300 hover:border-gray-500"
            />
          </div>
        </div>

        {isLogin && (
          <div className="mt-2 text-right">
            <Link to="/reset-password" className="auth-link text-sm text-[#E50914] hover:text-red-700 transition-colors">
              Forgot Password?
            </Link>
          </div>
        )}

        <button type="submit" className="w-full mt-6 bg-[#E50914] hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 
                   bg-white text-gray-800 rounded-lg font-medium
                   hover:bg-gray-100 transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
        >
          <img src={assets.google_icon} alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="text-center mt-4 text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="auth-link text-[#E50914] hover:text-red-700 transition-colors"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;