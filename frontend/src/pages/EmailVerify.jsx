import React, { useContext, useEffect, useState, useRef } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

const EmailVerify = () => {
  const navigate = useNavigate();
  const { getUserData, isLoggedin, userData } = useContext(AppContent);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleInput = (e, index) => {
    const value = e.target.value;
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Move to next input if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeydown = (e, index) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ otp: otpString }),
      });

      if (!res.ok) {
        throw new Error('Failed to verify OTP');
      }

      const data = await res.json();

      if (data.success) {
        await getUserData(); // Refresh user data to update verification status
        toast.success(data.message || 'Email verified successfully');
        navigate('/');
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  useEffect(() => {
    isLoggedin && userData && userData.isAccountVerified && navigate("/");
  }, [isLoggedin, userData]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/bg_img.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.7)',
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      <div className="container max-w-md mx-auto relative z-10">
        <img
          onClick={() => navigate("/")}
          src={assets.logo}
          alt=""
          className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        />

        <form
          onSubmit={handleSubmit}
          className="bg-black/80 p-8 rounded-2xl shadow-xl w-full mt-20 border border-red-500/30"
        >
          <h1 className="text-2xl font-semibold text-white text-center mb-6">
            Email Verify OTP
          </h1>
          <p className="text-center mb-8 text-gray-300">
            Please enter the 6-digit OTP sent to your email
          </p>

          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                required
                aria-label={`OTP digit ${index + 1}`}
                className="w-10 h-10 text-center text-lg font-bold rounded-lg 
                  bg-black border border-red-500/30
                  focus:ring-2 focus:ring-red-500 transition-all outline-none text-white"
                ref={(e) => (inputRefs.current[index] = e)}
                onChange={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeydown(e, index)}
              />
            ))}
          </div>

          <button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors mt-6"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerify;
