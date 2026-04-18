import toast from 'react-hot-toast';
import { ShoppingBag, CheckCircle, Info, Heart, AlertCircle, CheckCircle2 } from 'lucide-react';

export const showAddToCartToast = (product) => {
  const isTea = product.category?.toLowerCase().includes('tea') && !product.name?.toLowerCase().includes('masala');
  const crossSellMsg = isTea 
    ? "🍵 Great choice! Add our special Tea Masala for extra flavor."
    : "🛒 Perfect! Goes well with our Premium Assam Tea.";

  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-secondary-dark text-white shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden transform transition-all items-center`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <ShoppingBag className="h-10 w-10 text-primary-light" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold opacity-90">
              Added to Cart!
            </p>
            <p className="mt-1 text-sm font-medium">
              {product.name} is waiting for you.
            </p>
            <p className="mt-2 text-xs text-secondary-light">
              {crossSellMsg}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-white/20">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Close
        </button>
      </div>
    </div>
  ), { duration: 3000, id: `cart-${product._id}` });
};

export const showLoginToast = (userName) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-surface shadow-xl rounded-xl border border-gray-100 pointer-events-auto flex items-center p-4`}
    >
      <CheckCircle className="h-6 w-6 text-secondary" />
      <p className="ml-3 font-medium text-gray-900">
        Welcome back, {userName}<br/>
        <span className="text-sm font-normal text-gray-600">Ready for a fresh cup of tea?</span>
      </p>
    </div>
  ), { duration: 3000, id: 'login-toast' });
};

export const showLogoutToast = () => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-surface shadow-lg rounded-xl border border-gray-100 pointer-events-auto flex items-center p-4`}
    >
      <Info className="h-6 w-6 text-primary" />
      <p className="ml-3 font-medium text-gray-900">
        You've been logged out. See you again soon!
      </p>
    </div>
  ), { duration: 3000 });
};

export const showErrorToast = (msg = "Oops! Something went wrong. Please try again.") => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-red-50 border border-primary text-red-800 shadow-lg rounded-xl pointer-events-auto flex items-center p-4`}
    >
      <Info className="h-6 w-6 text-primary" />
      <p className="ml-3 font-medium">
        {msg}
      </p>
    </div>
  ), { duration: 4000 });
};

export const showWarningToast = (msg) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-surface border-l-4 border-primary shadow-xl rounded-xl pointer-events-auto flex items-center p-4`}
    >
      <AlertCircle className="h-6 w-6 text-primary" />
      <p className="ml-3 font-medium text-gray-900">
        {msg}
      </p>
    </div>
  ), { duration: 3000 });
};

export const showPaymentSuccessToast = () => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-secondary text-white shadow-xl rounded-xl pointer-events-auto flex items-center p-5`}
    >
      <CheckCircle2 className="h-8 w-8 text-white" />
      <p className="ml-4 font-bold text-lg">
        Payment Successful!<br/>
        <span className="text-sm font-medium text-secondary-light">Your order has been placed securely.</span>
      </p>
    </div>
  ), { duration: 4000, id: 'payment' });
};

export const showWishlistToast = () => {
    toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-secondary text-white shadow-xl rounded-xl pointer-events-auto flex items-center p-4`}
    >
      <Heart className="h-6 w-6 text-primary-light fill-current" />
      <p className="ml-3 font-medium">
        Added to Wishlist. Your favorites are saved!
      </p>
    </div>
  ), { duration: 3000 });
};
