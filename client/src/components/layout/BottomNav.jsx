import { Link, useLocation } from 'react-router-dom';
import { Home, User, Heart, ShoppingCart, Menu } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

export default function BottomNav() {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { openCartDrawer, setIsMobileMenuOpen } = useUI();
  const location = useLocation();

  // Hide bottom nav on specific pages if needed (e.g., checkout, admin)
  if (location.pathname.startsWith('/admin') || location.pathname === '/checkout') {
    return null;
  }

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-5px_10px_rgba(0,0,0,0.05)] z-40 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        
        {/* Home */}
        <Link to="/" className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/') ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}>
          <Home size={22} className={isActive('/') ? 'fill-primary/20' : ''} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Profile / You */}
        <Link to={user ? "/my-orders" : "/login"} className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/my-orders') || isActive('/login') ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}>
          <User size={22} className={isActive('/my-orders') || isActive('/login') ? 'fill-primary/20' : ''} />
          <span className="text-[10px] font-medium">You</span>
        </Link>

        {/* Wishlist */}
        <Link to="/wishlist" className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/wishlist') ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}>
          <Heart size={22} className={isActive('/wishlist') ? 'fill-primary/20' : ''} />
          <span className="text-[10px] font-medium">Wishlist</span>
        </Link>

        {/* Cart */}
        <button onClick={openCartDrawer} className="flex flex-col items-center justify-center w-full h-full gap-1 text-gray-500 hover:text-gray-800 transition-colors relative">
          <div className="relative">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-primary-dark text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 border border-white">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>

        {/* Menu */}
        <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center justify-center w-full h-full gap-1 text-gray-500 hover:text-gray-800 transition-colors">
          <Menu size={22} />
          <span className="text-[10px] font-medium">Menu</span>
        </button>

      </div>
      {/* SafeArea padding for iPhones with bottom notch */}
      <style dangerouslySetInnerHTML={{__html: `
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}} />
    </div>
  );
}
