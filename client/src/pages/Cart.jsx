import { Link } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();

  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 lg:px-24 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Button to="/products" size="lg">Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 lg:px-24 py-10">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="hidden md:grid grid-cols-6 gap-4 p-4 bg-surface-light border-b text-sm font-bold text-gray-600 uppercase tracking-wider">
              <div className="col-span-3">Product</div>
              <div className="col-span-1 text-center">Price</div>
              <div className="col-span-1 text-center">Quantity</div>
              <div className="col-span-1 text-right">Total</div>
            </div>
            
            {/* Cart Items */}
            <div className="p-4 md:p-0">
              {cartItems.map(item => (
                <div key={item.cartItemId} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-4 border-b border-gray-50 last:border-b-0">
                  <div className="col-span-1 md:col-span-3 flex items-center gap-4">
                    <button onClick={() => removeFromCart(item.cartItemId)} className="text-red-400 hover:text-red-600 transition-colors p-2 hidden md:block">
                      <Trash2 size={18} />
                    </button>
                    <Link to={`/product/${item._id}`} className="flex items-center gap-4 group flex-1">
                      {(() => {
                        let imgSrc = item.image || (item.images && item.images.length > 0 ? item.images[0] : null);
                        if (!imgSrc || imgSrc === 'undefined' || imgSrc.includes('undefined')) {
                           imgSrc = '/logo2-0-transparent.png'; // Fallback to a guaranteed existing static image
                        }
                        
                        const finalSrc = imgSrc.includes('uploads') && !imgSrc.includes('http') 
                          ? `https://sadbhavna-api.onrender.com/${imgSrc.replace(/\\/g, '/').replace(/^\//, '')}` 
                          : imgSrc;
                        return <img src={finalSrc} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-surface border p-1 group-hover:ring-2 ring-primary transition-all" />;
                      })()}
                      <div>
                        <h3 className="font-bold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">{item.name}</h3>
                        {item.selectedVariant && <p className="text-xs text-secondary-dark font-bold mt-1 uppercase tracking-wider">Option: {item.selectedVariant}</p>}
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromCart(item.cartItemId); }} 
                          className="text-red-500 hover:text-red-700 text-sm md:hidden mt-2 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={14}/> Remove
                        </button>
                      </div>
                    </Link>
                  </div>
                  <div className="col-span-1 text-center font-medium text-gray-600 hidden md:block">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}
                  </div>
                  <div className="col-span-1 flex justify-between md:justify-center items-center mt-4 md:mt-0">
                    <span className="md:hidden text-sm font-bold text-gray-500">Quantity</span>
                    <div className="flex items-center bg-surface border border-gray-200 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center font-bold text-gray-600 hover:text-primary-dark transition-colors">-</button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center font-bold text-gray-600 hover:text-primary-dark transition-colors">+</button>
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-between md:justify-end items-center mt-2 md:mt-0">
                    <span className="md:hidden text-sm font-bold text-gray-500">Subtotal</span>
                    <div className="font-extrabold text-primary-dark tracking-wide">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} items)</span>
                <span className="font-bold text-gray-800">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-bold text-gray-800">
                  {shipping === 0 ? 'Free' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(shipping)}
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4 mb-8">
              <div className="flex justify-between items-center text-xl font-extrabold text-gray-900">
                <span>Total</span>
                <span className="text-primary-dark tracking-wide">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(total)}
                </span>
              </div>
            </div>
            
            <Button to="/checkout" size="lg" className="w-full flex justify-center gap-2">
              Proceed to Checkout <ArrowRight size={20} />
            </Button>
            
            <div className="mt-4 text-center">
              <Link to="/products" className="text-primary-dark text-sm font-bold hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
