import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useAuth();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendOtp(email);
      setStep(2);
    } catch (err) {
      // Error handled by AuthContext (toast)
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await verifyOtp(email, otp);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      // Error handled
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = () => {
    // Redirects to backend Google OAuth route
    window.location.href = 'https://sadbhavna-api.onrender.com/api/auth/google';
  };

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[70vh]">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100 max-w-md w-full relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-light rounded-full opacity-50"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">{step === 1 ? 'Welcome' : 'Security Check'}</h1>
            <p className="text-gray-500 text-sm">{step === 1 ? 'Sign in or create an account to continue.' : 'Please enter the 6-digit OTP sent to your email.'}</p>
          </div>

          {step === 1 ? (
            <>
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

              <div className="mt-8 flex items-center">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-3 text-sm text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                className="mt-6 flex items-center justify-center w-full bg-white border border-gray-300 text-gray-700 rounded-xl p-4 hover:bg-gray-50 transition-colors gap-3 font-semibold shadow-sm"
              >
                <FcGoogle className="text-2xl" />
                Sign in with Google
              </button>
            </>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">One Time Password (OTP)</label>
                  <input 
                    type="text" required value={otp} onChange={e => setOtp(e.target.value)}
                    className="w-full bg-surface border border-gray-200 rounded-xl p-4 text-center text-2xl tracking-[0.5em] font-black focus:border-primary" 
                    placeholder="------" maxLength={6}
                  />
                </div>
                <Button type="submit" size="lg" className="w-full shadow-md mt-4" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify & Enter'}
                </Button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-primary">
                    Change Email Address
                  </button>
                </div>
            </form>
          )}
          {step === 1 && (
            <div className="mt-8 text-center text-sm font-medium text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-dark font-bold hover:underline transition-colors">Create Account</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
