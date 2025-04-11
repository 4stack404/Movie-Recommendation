import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }
      toast.success(data.message);
      setIsEmailSent(true);
    } catch (error) {
      console.error('Error sending reset OTP:', error);
      toast.error(error.message || 'Failed to send reset OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter a valid OTP');
      return;
    }
    setOtp(otpValue);
    setIsOtpSubmitted(true);
  }

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    if (!email || !otp || !newPassword) {
      toast.error("Missing required fields.");
      return;
    }
  
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      });
  
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      toast.success(data.message);
      navigate("/login");
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.message || "Something went wrong.");
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
              Reset Password
            </h1>
            <p className="text-gray-400">
              {!isEmailSent 
                ? "Enter your email to reset password"
                : !isOtpSubmitted 
                  ? `Enter the verification code sent to ${email}`
                  : "Enter your new password"
              }
            </p>
          </div>

          <div className="bg-[#181818] rounded-lg shadow-lg p-8">
            {/* Email Form */}
            {!isEmailSent && (
              <form onSubmit={onSubmitEmail}>
                <div className="mb-6">
                  <label className="block text-gray-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-[#333] text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
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
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            )}

            {/* OTP Form */}
            {!isOtpSubmitted && isEmailSent && (
              <form onSubmit={onSubmitOtp}>
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
                  Verify OTP
                </button>
              </form>
            )}

            {/* New Password Form */}
            {isOtpSubmitted && isEmailSent && (
              <form onSubmit={onSubmitNewPassword}>
                <div className="mb-6">
                  <label className="block text-gray-400 mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter your new password"
                    className="w-full bg-[#333] text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
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
                  {loading ? 'Updating...' : 'Reset Password'}
                </button>
              </form>
            )}

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-red-500 hover:text-red-400 font-medium"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
