import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setStep(2);
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match!');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long.');
    }
    
    setIsLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      // Success, redirect to login
      navigate('/login');
    } catch (err) {
      // Error handled
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-10 py-20 flex justify-center items-center min-h-[70vh]">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100 max-w-md w-full relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-light rounded-full opacity-50"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Reset Password</h1>
            <p className="text-gray-500 text-sm">
              {step === 1 ? "Enter your email and we'll send you an OTP to reset your password." : `We've sent an OTP to ${email}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-surface border border-gray-200 rounded-xl p-4 text-sm focus:border-primary focus:bg-white" 
                  placeholder="you@example.com" 
                />
              </div>
              <Button type="submit" size="lg" className="w-full shadow-md mt-4" disabled={isLoading}>
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">One Time Password (OTP)</label>
                <input 
                  type="text" required value={otp} onChange={e => setOtp(e.target.value)}
                  className="w-full bg-surface border border-gray-200 rounded-xl p-4 text-center text-2xl tracking-[0.5em] font-black focus:border-primary" 
                  placeholder="------" maxLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                <input 
                  type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-surface border border-gray-200 rounded-xl p-3.5 text-sm focus:border-primary focus:bg-white" 
                  placeholder="••••••••" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                <input 
                  type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface border border-gray-200 rounded-xl p-3.5 text-sm focus:border-primary focus:bg-white" 
                  placeholder="••••••••" 
                />
              </div>
              <Button type="submit" size="lg" className="w-full shadow-md mt-6" disabled={isLoading}>
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-primary">
                  Change Email Address
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-8 text-center text-sm font-medium text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-dark font-bold hover:underline transition-colors">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
