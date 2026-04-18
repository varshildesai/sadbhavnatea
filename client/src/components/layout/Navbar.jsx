import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, LogOut, Heart } from 'lucide-react';
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
    <header className="bg-gradient-to-r from-[#c06000]/95 to-[#053e2f]/95 backdrop-blur-md shadow-md sticky top-0 z-50 text-white border-b border-white/10 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex justify-between items-center h-[72px]">
        
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center shrink-0">
            <img src="/logo2-0-transparent.png" alt="Sadbhavna Tea" className="h-10 md:h-12 w-auto object-contain drop-shadow-md transition-transform duration-300 hover:scale-[1.02]" />
          </Link>
        </div>
        
        {/* Center: Navigation Menu */}
        <nav className="hidden lg:flex items-center justify-center gap-8 shrink-0">
          <Link to="/" className="text-white/90 font-medium text-[15px] tracking-wide hover:text-white relative group transition-colors duration-300 py-2">
            Home
            <span className="absolute bottom-1 left-1/2 w-0 h-[2px] bg-[#D6A354] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-in-out"></span>
          </Link>
          <Link to="/products" className="text-white/90 font-medium text-[15px] tracking-wide hover:text-white relative group transition-colors duration-300 py-2">
            Shop
            <span className="absolute bottom-1 left-1/2 w-0 h-[2px] bg-[#D6A354] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-in-out"></span>
          </Link>
          <Link to="/categories" className="text-white/90 font-medium text-[15px] tracking-wide hover:text-white relative group transition-colors duration-300 py-2">
            Categories
            <span className="absolute bottom-1 left-1/2 w-0 h-[2px] bg-[#D6A354] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-in-out"></span>
          </Link>
          <Link to="/about" className="text-white/90 font-medium text-[15px] tracking-wide hover:text-white relative group transition-colors duration-300 py-2">
            About Us
            <span className="absolute bottom-1 left-1/2 w-0 h-[2px] bg-[#D6A354] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-in-out"></span>
          </Link>
        </nav>

        {/* Right: User Actions */}
        <div className="flex-1 flex justify-end items-center gap-5 md:gap-6">
          {user ? (
            <div className="hidden md:flex items-center gap-5 text-sm font-medium">
              <span className="bg-white/10 hover:bg-white/15 transition-colors duration-300 px-4 py-1.5 rounded-full border border-white/10 text-white shadow-sm cursor-default">
                {user.name}
              </span>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-white/80 hover:text-[#D6A354] transition-colors duration-300">Admin</Link>
              )}
              <Link to="/my-orders" className="text-white/80 hover:text-[#D6A354] transition-colors duration-300">Orders</Link>
              <button onClick={handleLogout} className="text-white/80 hover:text-red-400 transition-colors duration-300" title="Logout">
                <LogOut size={20} className="hover:-translate-y-0.5 transition-transform duration-300" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-white/80 hover:text-[#D6A354] transition-colors duration-300" title="Sign In">
              <User size={22} className="hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
          )}
          
          <div className="flex items-center gap-4">
            <Link to="/wishlist" className="text-white/80 hover:text-white transition-colors duration-300 group" title="Wishlist">
              <Heart size={22} className="group-hover:fill-red-500 group-hover:text-red-500 hover:-translate-y-0.5 transition-all duration-300" />
            </Link>
            
            <button onClick={openCartDrawer} className="text-white/80 hover:text-[#D6A354] transition-colors duration-300 relative group bg-transparent border-none cursor-pointer" title="Cart">
              <ShoppingCart size={22} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D6A354] text-secondary-dark text-[10px] font-bold rounded-full h-[18px] min-w-[18px] flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110">
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
