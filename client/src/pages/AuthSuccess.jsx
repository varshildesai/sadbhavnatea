import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleOAuthLogin } = useAuth();

  useEffect(() => {
    // Extract token from query params
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const attemptLogin = async () => {
      if (token) {
        await handleOAuthLogin(token);
        navigate('/'); // Redirect to home page after standard log in
      } else {
        toast.error('Authentication failed');
        navigate('/login');
      }
    };
    
    attemptLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Authenticating...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthSuccess;
