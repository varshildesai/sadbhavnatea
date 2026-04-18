import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register, verifyRegister } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match!');
    }
    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters long.');
    }
    
    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      setStep(2);
    } catch (err) {
      // Error handled by ctx
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await verifyRegister(formData.email, formData.otp);
      navigate('/');
    } catch (err) {
      // Err handled
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[70vh]">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100 max-w-md w-full relative overflow-hidden">
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary-light rounded-full opacity-50"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">{step === 1 ? 'Create Account' : 'Verify Email'}</h1>
            <p className="text-gray-500 text-sm">
               {step === 1 ? 'Join Sadbhavna to enjoy premium teas.' : `We've sent an OTP to ${formData.email}`}
            </p>
          </div>

          {step === 1 ? (
             <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-xl p-3.5 text-sm" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-xl p-3.5 text-sm" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-xl p-3.5 text-sm" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full bg-surface border border-gray-200 rounded-xl p-3.5 text-sm" placeholder="••••••••" />
              </div>
              <Button type="submit" size="lg" className="w-full shadow-md mt-6" disabled={isLoading}>{isLoading ? 'Creating Account...' : 'Continue to Verification'}</Button>
            </form>
          ) : (
             <form onSubmit={handleVerifySubmit} className="space-y-6">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">OTP Verification Code</label>
                   <input 
                     type="text" name="otp" required value={formData.otp} onChange={handleChange}
                     className="w-full bg-surface border border-gray-200 rounded-xl p-4 text-center text-2xl tracking-[0.5em] font-black focus:border-primary" 
                     placeholder="------" maxLength={6}
                   />
                 </div>
                 <Button type="submit" size="lg" className="w-full shadow-md mt-4" disabled={isLoading}>
                   {isLoading ? 'Verifying...' : 'Complete Registration'}
                 </Button>
             </form>
          )}

          {step === 1 && (
            <div className="mt-8 text-center text-sm font-medium text-gray-600">
              Already have an account? <Link to="/login" className="text-primary-dark font-bold hover:underline transition-colors">Sign In</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
