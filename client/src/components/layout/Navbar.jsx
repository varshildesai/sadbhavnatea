import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, LogOut, Heart, Home, Store, Grid, Info } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { openCartDrawer } = useUI();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-[#d96b00] to-[#064e3b] shadow-lg sticky top-0 z-50 text-white border-b border-white/10">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 lg:px-24 py-3 flex justify-between items-center overflow-visible">
        <Link to="/" className="flex items-center shrink-0 -ml-2 lg:-ml-6 mr-6 md:mr-16">
          <div className="flex items-center justify-center transform scale-125 md:scale-150 origin-left">
            <img src="/logo2-0-transparent.png" alt="Sadbhavna Tea" className="h-12 md:h-14 lg:h-16 w-auto object-contain drop-shadow-2xl" />
          </div>
        </Link>
        
        <nav className="hidden lg:flex space-x-1 lg:space-x-2 bg-black/15 p-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-inner">
          <Link to="/" className="flex items-center gap-2 text-white/90 font-bold text-[15px] tracking-wide hover:bg-white/20 hover:text-white px-4 py-2 rounded-full transition-all duration-300 group">
            <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" />
            Home
          </Link>
          <Link to="/products" className="flex items-center gap-2 text-white/90 font-bold text-[15px] tracking-wide hover:bg-white/20 hover:text-white px-4 py-2 rounded-full transition-all duration-300 group">
            <Store size={18} className="group-hover:-translate-y-0.5 transition-transform" />
            Shop
          </Link>
          <Link to="/categories" className="flex items-center gap-2 text-white/90 font-bold text-[15px] tracking-wide hover:bg-white/20 hover:text-white px-4 py-2 rounded-full transition-all duration-300 group">
            <Grid size={18} className="group-hover:-translate-y-0.5 transition-transform" />
            Categories
          </Link>
          <Link to="/about" className="flex items-center gap-2 text-white/90 font-bold text-[15px] tracking-wide hover:bg-white/20 hover:text-white px-4 py-2 rounded-full transition-all duration-300 group">
            <Info size={18} className="group-hover:-translate-y-0.5 transition-transform" />
            About Us
          </Link>
        </nav>

        <div className="flex items-center space-x-5">
          {user ? (
            <div className="hidden md:flex items-center space-x-4 text-sm font-bold mr-2">
              <span className="bg-white/20 px-4 py-1.5 rounded-full border border-white/30 text-white shadow-sm backdrop-blur-sm">
                {user.name}
              </span>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-white hover:text-[#D6A354] hover:scale-110 transition-transform duration-300 drop-shadow-sm">Admin</Link>
              )}
              <Link to="/my-orders" className="text-white hover:text-[#D6A354] hover:scale-110 transition-transform duration-300 drop-shadow-sm font-bold" title="My Orders">Orders</Link>
              <button onClick={handleLogout} className="text-white hover:text-red-400 hover:scale-125 transition-transform duration-300" title="Logout">
                <LogOut size={22} className="drop-shadow-sm" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-white/90 hover:text-white hover:scale-125 hover:rotate-6 transition-all duration-300 relative group p-2 hover:bg-white/10 rounded-full" title="Sign In">
              <User size={26} className="drop-shadow-sm" />
            </Link>
          )}
          <Link to="/wishlist" className="text-white/90 hover:text-white hover:scale-125 transition-all duration-300 relative group p-2 hover:bg-white/10 rounded-full" title="Wishlist">
            <Heart size={26} className="drop-shadow-sm group-hover:fill-red-500 group-hover:text-red-500 transition-colors" />
          </Link>
          <button onClick={openCartDrawer} className="text-white/90 hover:text-white hover:scale-125 transition-all duration-300 relative group bg-transparent border-none cursor-pointer p-2 hover:bg-white/10 rounded-full" title="Cart">
            <ShoppingCart size={26} className="drop-shadow-sm" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-secondary-dark text-white text-xs font-black rounded-full h-[22px] min-w-[22px] flex items-center justify-center shadow-lg border-2 border-white/20 group-hover:animate-bounce px-1 transform translate-x-1/4 -translate-y-1/4">
                {totalItems}
              </span>
            )}
          </button>
          <button className="lg:hidden text-white hover:text-[#D6A354] hover:scale-110 transition-transform duration-300 p-2">
            <Menu size={28} />
          </button>
        </div>
      </div>
    </header>
  );
}
