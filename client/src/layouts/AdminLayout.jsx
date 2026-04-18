import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingBag, Settings, LogOut, Grid, MessageSquare, Tags, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'Products', icon: <Package size={20} />, path: '/admin/products' },
    { name: 'Orders', icon: <ShoppingBag size={20} />, path: '/admin/orders' },
    { name: 'Users', icon: <Users size={20} />, path: '/admin/users' },
    { name: 'Categories', icon: <Tags size={20} />, path: '/admin/categories' },
    { name: 'Reviews', icon: <MessageSquare size={20} />, path: '/admin/reviews' },
  ];

  return (
    <div className="flex h-screen bg-surface-dark overflow-hidden relative">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-gray-200 flex flex-col items-center relative">
          <button 
            className="absolute top-4 right-4 md:hidden text-gray-500 hover:text-gray-800"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
          <Link to="/" className="flex items-center group mt-4 md:mt-0">
            <div className="w-[180px] md:w-[220px] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
               <img src="/logo.png" alt="Sadbhavna Tea" className="w-full h-auto object-contain rounded-2xl shadow-sm border border-white/10" />
            </div>
          </Link>
          <div className="text-xs text-gray-500 font-bold mt-3 uppercase tracking-widest">Admin Panel</div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive ? 'bg-primary-light text-primary-dark shadow-sm' : 'text-gray-600 hover:bg-surface hover:text-gray-900'}`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl w-full transition-colors">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden text-gray-600 hover:text-primary transition-colors p-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={26} />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-gray-800">
              {menuItems.find(item => item.path === location.pathname)?.name || 'Admin'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-dark text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name || 'Admin User'}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-surface-dark">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
