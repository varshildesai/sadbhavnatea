import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Heart, Home, ShoppingBag, Grid, Info, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { openCartDrawer, isMobileMenuOpen, setIsMobileMenuOpen } = useUI();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="w-full bg-gradient-to-r from-[#d96b00]/95 to-[#053e2f]/95 backdrop-blur-md shadow-md sticky top-0 z-40 text-white border-b border-white/10 transition-all duration-300 h-[76px] flex items-center">
        <div className="w-full px-4 md:px-10 flex justify-between items-center">
          
          {/* Left: Logo */}
          <div className="flex justify-start shrink-0">
            <Link to="/" className="flex items-center" onClick={closeMenu}>
              <img src="/logo2-0-transparent.png" alt="Sadbhavna Tea" className="h-16 md:h-20 lg:h-[76px] w-auto object-contain drop-shadow-md transition-transform duration-300 hover:scale-[1.03]" />
            </Link>
          </div>
          
          {/* Center: Navigation Menu (Desktop) */}
          <nav className="hidden lg:flex items-center justify-center shrink-0">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-5 py-2.5 flex items-center gap-6 shadow-inner">
              <Link to="/" className="flex items-center gap-2 text-white/90 font-medium text-[15px] hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 relative group">
                <Home size={18} /> Home
                <span className="absolute -bottom-2 left-1/2 w-0 h-[2px] bg-white group-hover:w-full group-hover:left-0 transition-all duration-300 ease-in-out opacity-80"></span>
              </Link>
              <Link to="/products" className="flex items-center gap-2 text-white/90 font-medium text-[15px] hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 relative group">
                <ShoppingBag size={18} /> Shop
                <span className="absolute -bottom-2 left-1/2 w-0 h-[2px] bg-white group-hover:w-full group-hover:left-0 transition-all duration-300 ease-in-out opacity-80"></span>
              </Link>
              <Link to="/categories" className="flex items-center gap-2 text-white/90 font-medium text-[15px] hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 relative group">
                <Grid size={18} /> Categories
                <span className="absolute -bottom-2 left-1/2 w-0 h-[2px] bg-white group-hover:w-full group-hover:left-0 transition-all duration-300 ease-in-out opacity-80"></span>
              </Link>
              <Link to="/about" className="flex items-center gap-2 text-white/90 font-medium text-[15px] hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 relative group">
                <Info size={18} /> About Us
                <span className="absolute -bottom-2 left-1/2 w-0 h-[2px] bg-white group-hover:w-full group-hover:left-0 transition-all duration-300 ease-in-out opacity-80"></span>
              </Link>
            </div>
          </nav>

          {/* Right: User Actions */}
          <div className="flex justify-end items-center gap-4 shrink-0">
            {user ? (
              <div className="hidden md:flex items-center gap-4 text-[15px] font-medium">
                <span className="bg-[#4ade80]/20 px-4 py-1.5 rounded-full border border-[#4ade80]/40 text-white shadow-sm cursor-default">
                  {user.name}
                </span>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-white/90 hover:text-white transition-colors">Admin</Link>
                )}
                <Link to="/my-orders" className="text-white/90 hover:text-white transition-colors">Orders</Link>
                <div className="w-[1px] h-5 bg-white/30 mx-1"></div>
                <button onClick={handleLogout} className="text-white/80 hover:text-red-300 transition-colors" title="Logout">
                  <LogOut size={22} className="hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center">
                <Link to="/login" className="text-white/90 hover:text-white transition-colors flex items-center gap-2" title="Sign In">
                  <User size={22} className="hover:-translate-y-0.5 transition-transform" />
                  <span className="font-medium text-[15px]">Sign In</span>
                </Link>
                <div className="w-[1px] h-5 bg-white/30 mx-4"></div>
              </div>
            )}
            
            <div className="flex items-center gap-4 md:gap-5">
              <Link to="/wishlist" className="hidden sm:block text-white/80 hover:text-white transition-colors group" title="Wishlist">
                <Heart size={22} className="group-hover:fill-white hover:-translate-y-0.5 transition-transform" />
              </Link>
              
              <button onClick={openCartDrawer} className="text-white/80 hover:text-white transition-colors relative group bg-transparent border-none cursor-pointer" title="Cart">
                <ShoppingCart size={22} className="group-hover:-translate-y-0.5 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-[#053e2f] text-[10px] font-bold rounded-full h-[18px] min-w-[18px] flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                    {totalItems}
                  </span>
                )}
              </button>
              
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-white/90 hover:text-white transition-colors ml-1 p-1">
                <Menu size={26} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sliding Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMenu}></div>
          
          {/* Menu Panel */}
          <div className="relative w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col ml-auto transform transition-transform duration-300">
            <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-gray-50">
              <div className="font-bold text-secondary-dark flex items-center gap-2">
                <User size={20} className="text-primary" /> 
                {user ? user.name : 'Guest User'}
              </div>
              <button onClick={closeMenu} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-5 flex flex-col gap-2">
              <Link to="/" onClick={closeMenu} className="flex items-center gap-4 p-4 rounded-xl text-gray-700 hover:bg-primary/10 hover:text-primary-dark font-medium transition-colors">
                <Home size={22} /> Home
              </Link>
              <Link to="/products" onClick={closeMenu} className="flex items-center gap-4 p-4 rounded-xl text-gray-700 hover:bg-primary/10 hover:text-primary-dark font-medium transition-colors">
                <ShoppingBag size={22} /> Shop All
              </Link>
              <Link to="/categories" onClick={closeMenu} className="flex items-center gap-4 p-4 rounded-xl text-gray-700 hover:bg-primary/10 hover:text-primary-dark font-medium transition-colors">
                <Grid size={22} /> Categories
              </Link>
              <Link to="/about" onClick={closeMenu} className="flex items-center gap-4 p-4 rounded-xl text-gray-700 hover:bg-primary/10 hover:text-primary-dark font-medium transition-colors">
                <Info size={22} /> About Us
              </Link>
              <Link to="/wishlist" onClick={closeMenu} className="sm:hidden flex items-center gap-4 p-4 rounded-xl text-gray-700 hover:bg-primary/10 hover:text-primary-dark font-medium transition-colors">
                <Heart size={22} /> Wishlist
              </Link>

              <div className="h-px bg-gray-100 my-4"></div>

              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={closeMenu} className="flex items-center gap-4 p-4 rounded-xl text-gray-700 hover:bg-primary/10 hover:text-primary-dark font-medium transition-colors">
                      <LogOut size={22} className="rotate-180" /> Admin Dashboard
                    </Link>
                  )}
                  <Link to="/my-orders" onClick={closeMenu} className="flex items-center gap-4 p-4 rounded-xl text-gray-700 hover:bg-primary/10 hover:text-primary-dark font-medium transition-colors">
                    <Package size={22} /> My Orders
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-4 p-4 w-full rounded-xl text-red-600 hover:bg-red-50 font-bold transition-colors text-left mt-4">
                    <LogOut size={22} /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={closeMenu} className="flex items-center justify-center gap-2 p-4 mt-4 w-full rounded-xl bg-primary text-white font-bold shadow-lg hover:bg-primary-dark transition-colors text-center">
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
