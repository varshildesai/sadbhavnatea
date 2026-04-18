import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../../context/UIContext';
import { useCart } from '../../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const MiniCartDrawer = () => {
  const { isCartDrawerOpen, closeCartDrawer } = useUI();
  const { cartItems, removeFromCart, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();

  const getImageUrl = (item) => {
    const imgSource = item.image || item.images?.[0] || '/placeholder.jpg';
    return imgSource?.includes('uploads') && !imgSource.includes('http')
      ? `http://localhost:5000/${imgSource.replace(/\\/g, '/').replace(/^\//, '')}` 
      : imgSource;
  };

  const handleCheckout = () => {
    closeCartDrawer();
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    closeCartDrawer();
    // Use navigate to /products or just close if already on a shopping page
    if (window.location.pathname === '/cart' || window.location.pathname === '/checkout') {
      navigate('/products');
    }
  };

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100]"
            onClick={closeCartDrawer}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-surface shadow-2xl z-[110] flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center text-primary font-bold text-xl gap-2">
                <ShoppingBag className="w-6 h-6" />
                <h2>Your Cart</h2>
                <span className="bg-secondary text-white text-xs px-2 py-1 rounded-full ml-2">
                  {cartItems.length}
                </span>
              </div>
              <button 
                onClick={closeCartDrawer}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <ShoppingBag className="w-16 h-16 mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-600">Your cart is beautifully empty.</p>
                  <p className="text-sm mt-2 text-gray-500">Discover our premium blends.</p>
                  <button 
                    onClick={handleContinueShopping}
                    className="mt-6 px-6 py-2 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary-light/10 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <img 
                      src={getImageUrl(item)} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded-lg"
                      crossOrigin="anonymous"
                    />
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-gray-900 line-clamp-2 pr-2">{item.name}</h4>
                        <button 
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-secondary-dark font-medium text-sm mt-1">
                         ₹{item.price}
                      </div>

                      <div className="mt-auto flex justify-between items-center h-8">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-surface">
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="font-bold text-gray-900">
                           ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] bg-surface-light">
                <div className="flex justify-between items-center mb-4 text-lg">
                  <span className="font-medium text-gray-600">Subtotal</span>
                  <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleCheckout}
                    className="w-full py-4 bg-secondary hover:bg-secondary-dark text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 flex justify-center items-center gap-2"
                  >
                    Checkout Now
                  </button>
                  <button 
                    onClick={handleContinueShopping}
                    className="w-full py-3 border-2 border-primary text-primary hover:bg-primary/5 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Continue Shopping
                  </button>
                </div>
                <div className="mt-3 text-center">
                    <Link to="/cart" onClick={closeCartDrawer} className="text-sm text-gray-500 hover:text-secondary underline underline-offset-2">
                        View Full Cart Page
                    </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MiniCartDrawer;
