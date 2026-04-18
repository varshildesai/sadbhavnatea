import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, LogOut, Heart, Home, ShoppingBag, Grid, Info } from 'lucide-react';
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
    <header className="w-full bg-gradient-to-r from-[#d96b00]/95 to-[#053e2f]/95 backdrop-blur-md shadow-md sticky top-0 z-50 text-white border-b border-white/10 transition-all duration-300 h-[76px] flex items-center">
      <div className="w-full px-4 md:px-10 flex justify-between items-center">
        
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center shrink-0">
            <img src="/logo2-0-transparent.png" alt="Sadbhavna Tea" className="h-12 md:h-14 lg:h-[60px] w-auto object-contain drop-shadow-md transition-transform duration-300 hover:scale-[1.02]" />
          </Link>
        </div>
        
        {/* Center: Navigation Menu (Rounded Pill) */}
        <nav className="hidden lg:flex items-center justify-center shrink-0">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-5 py-2.5 flex items-center gap-6 shadow-inner">
            <Link to="/" className="flex items-center gap-2 text-white/90 font-medium text-[15px] hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 relative group">
              <Home size={18} />
              Home
              <span className="absolute -bottom-2 left-1/2 w-0 h-[2px] bg-white group-hover:w-full group-hover:left-0 transition-all duration-300 ease-in-out opacity-80"></span>
            </Link>
            <Link to="/products" className="flex items-center gap-2 text-white/90 font-medium text-[15px] hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 relative group">
              <ShoppingBag size={18} />
              Shop
              <span className="absolute -bottom-2 left-1/2 w-0 h-[2px] bg-white group-hover:w-full group-hover:left-0 transition-all duration-300 ease-in-out opacity-80"></span>
            </Link>
            <Link to="/categories" className="flex items-center gap-2 text-white/90 font-medium text-[15px] hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 relative group">
              <Grid size={18} />
              Categories
              <span className="absolute -bottom-2 left-1/2 w-0 h-[2px] bg-white group-hover:w-full group-hover:left-0 transition-all duration-300 ease-in-out opacity-80"></span>
            </Link>
            <Link to="/about" className="flex items-center gap-2 text-white/90 font-medium text-[15px] hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 relative group">
              <Info size={18} />
              About Us
              <span className="absolute -bottom-2 left-1/2 w-0 h-[2px] bg-white group-hover:w-full group-hover:left-0 transition-all duration-300 ease-in-out opacity-80"></span>
            </Link>
          </div>
        </nav>

        {/* Right: User Actions */}
        <div className="flex-1 flex justify-end items-center gap-5 shrink-0">
          {user ? (
            <div className="hidden md:flex items-center gap-4 text-[15px] font-medium">
              <span className="bg-[#4ade80]/20 hover:bg-[#4ade80]/30 transition-colors duration-300 px-4 py-1.5 rounded-full border border-[#4ade80]/40 text-white shadow-sm cursor-default">
                {user.name}
              </span>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-white/90 hover:text-white transition-colors duration-300">Admin</Link>
              )}
              <Link to="/my-orders" className="text-white/90 hover:text-white transition-colors duration-300">Orders</Link>
              
              {/* Divider */}
              <div className="w-[1px] h-5 bg-white/30 mx-1"></div>
              
              <button onClick={handleLogout} className="text-white/80 hover:text-red-300 transition-colors duration-300" title="Logout">
                <LogOut size={22} className="hover:-translate-y-0.5 transition-transform duration-300" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center">
              <Link to="/login" className="text-white/90 hover:text-white transition-colors duration-300 flex items-center gap-2" title="Sign In">
                <User size={22} className="hover:-translate-y-0.5 transition-transform duration-300" />
                <span className="font-medium text-[15px]">Sign In</span>
              </Link>
              <div className="w-[1px] h-5 bg-white/30 mx-4"></div>
            </div>
          )}
          
          <div className="flex items-center gap-5">
            <Link to="/wishlist" className="text-white/80 hover:text-white transition-colors duration-300 group" title="Wishlist">
              <Heart size={22} className="group-hover:fill-white hover:-translate-y-0.5 transition-all duration-300" />
            </Link>
            
            <button onClick={openCartDrawer} className="text-white/80 hover:text-white transition-colors duration-300 relative group bg-transparent border-none cursor-pointer" title="Cart">
              <ShoppingCart size={22} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#053e2f] text-[10px] font-bold rounded-full h-[18px] min-w-[18px] flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110">
                  {totalItems}
                </span>
              )}
            </button>
            
            <button className="lg:hidden text-white/80 hover:text-white transition-colors duration-300 ml-2">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
