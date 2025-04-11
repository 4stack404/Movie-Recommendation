import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';

const EmailVerify = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(AppContent);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      setOtp([...otp.map((d, idx) => (idx === index ? '' : d))]);

      // Focus previous input
      if (e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch('/api/auth/send-verify-otp', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('OTP sent successfully');
      } else {
        throw new Error('Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter a valid OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ otp: otpValue }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Email verified successfully');
        // Update user data to reflect verified status
        setUserData(prev => ({
          ...prev,
          isAccountVerified: true
        }));
        navigate('/home');
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-[Montserrat] flex flex-col">
      <main className="flex-1 py-10 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-600 mb-2">
              Verify Email
            </h1>
            <p className="text-gray-400">
              Enter the verification code sent to {userData?.email}
            </p>
          </div>

          <div className="bg-[#181818] rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-400 mb-4 text-center">
                  Enter 6-digit OTP
                </label>
                <div className="flex justify-center gap-2">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={data}
                      onChange={e => handleChange(e.target, index)}
                      onKeyDown={e => handleKeyDown(e, index)}
                      className="w-12 h-12 text-center bg-[#333] text-white text-xl font-semibold rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded font-semibold ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                } transition-colors`}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">Didn't receive the code?</p>
              <button
                onClick={handleResendOTP}
                className="text-red-500 hover:text-red-400 font-medium mt-2"
              >
                Resend OTP
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailVerify;
