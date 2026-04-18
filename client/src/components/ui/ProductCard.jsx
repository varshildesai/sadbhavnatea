import { Link } from 'react-router-dom';
import Button from './Button';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { showWishlistToast, showErrorToast } from '../../utils/toastHelpers';

export default function ProductCard({ product, isListMode = false }) {
  const { addToCart } = useCart();
  const { user, setUser } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  useEffect(() => {
    if (user?.wishlist && (product?._id || product?.originalProductId)) {
      setIsWishlisted(user.wishlist.includes(product.originalProductId || product._id));
    }
  }, [user, product]);

  const item = product || {
    _id: '1',
    name: 'Premium Assam CTC Tea',
    price: 350,
    images: ['/uploads/default.jpg'],
    category: 'TEA (Black CTC)',
    rating: 4.8,
    reviews: 124,
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart({ ...item, image: imgSource });
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    if (!user) {
      showErrorToast('Please login to add to wishlist');
      return;
    }
    try {
      const res = await fetch('https://sadbhavna-api.onrender.com/api/auth/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sadbhavna_token')}`
        },
        body: JSON.stringify({ userId: user._id, productId: item.originalProductId || item._id }),
      });
      if (!res.ok) throw new Error();
      const newWishlist = await res.json();
      const isNowWishlisted = newWishlist.includes(item.originalProductId || item._id);
      setIsWishlisted(isNowWishlisted);
      if (isNowWishlisted) showWishlistToast();
      else toast.success('Removed from wishlist');
      // Update the AuthContext user state
      if (typeof setUser === 'function') {
        setUser({ ...user, wishlist: newWishlist });
      }
    } catch (err) {
      showErrorToast('Failed to update wishlist');
    }
  };

  const imgSource = item.image ? item.image : (item.images && item.images.length > 0 ? item.images[0] : '/uploads/default.jpg');
  const imageUrl = imgSource?.includes('uploads') && !imgSource.includes('http')
    ? `https://sadbhavna-api.onrender.com/${imgSource.replace(/\\/g, '/').replace(/^\//, '')}` 
    : imgSource;

  const secondImgSource = item.images && item.images.length > 1 ? item.images[1] : null;
  const secondImageUrl = secondImgSource?.includes('uploads') && !secondImgSource.includes('http')
    ? `https://sadbhavna-api.onrender.com/${secondImgSource.replace(/\\/g, '/').replace(/^\//, '')}`
    : secondImgSource;

  const linkId = item.originalProductId || item._id;
  const linkUrl = item.variantLabel ? `/product/${linkId}?variant=${encodeURIComponent(item.variantLabel)}` : `/product/${linkId}`;

  // Mock MRP to be 15% higher than actual price to show a discount (like Amazon does)
  const mrp = Math.round(item.price * 1.15);
  const discountPercent = Math.round(((mrp - item.price) / mrp) * 100);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex ${isListMode ? 'flex-row items-stretch' : 'flex-col h-full'} relative`}>
      <button onClick={handleWishlistToggle} className="absolute top-2 right-2 z-20 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-red-500 transition-colors">
        <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
      </button>

      <div className={`relative overflow-hidden bg-white shrink-0 p-2 ${isListMode ? 'w-32 sm:w-40 md:w-48 aspect-square flex items-center justify-center' : 'aspect-square'}`}>
        <Link to={linkUrl} className="block w-full h-full relative">
          <img 
            src={imageUrl} 
            alt={item.name} 
            className={`w-full h-full object-contain transition-all duration-500 group-hover:scale-105 ${secondImageUrl ? 'absolute inset-0 opacity-100 group-hover:opacity-0' : ''}`}
            crossOrigin="anonymous"
          />
          {secondImageUrl && (
            <img 
              src={secondImageUrl} 
              alt={item.name} 
              className="absolute inset-0 w-full h-full object-contain transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105"
              crossOrigin="anonymous"
            />
          )}
        </Link>
        {/* Only show category badge on desktop, it's too much clutter on mobile */}
        {!isListMode && (
          <div className="hidden md:block absolute top-2 left-2 z-10 bg-secondary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded text-gray-800 shadow-sm backdrop-blur">
            {item.category}
          </div>
        )}
      </div>
      
      <div className={`p-3 flex flex-col flex-1 border-gray-100 ${isListMode ? 'border-l justify-center md:p-4' : 'border-t md:p-4'}`}>
        <Link to={linkUrl}>
          <h3 className={`font-medium text-gray-900 leading-tight hover:text-primary transition-colors line-clamp-2 ${isListMode ? 'text-sm md:text-lg mb-1' : 'text-sm md:text-base min-h-[40px] md:min-h-[44px]'}`}>
            {item.name} {item.variantLabel ? ` - ${item.variantLabel}` : ''}
          </h3>
        </Link>
        
        {/* Ratings block - Amazon style */}
        <div className="flex items-center gap-1 mt-1 mb-1">
          <div className="flex text-[#FFA41C]">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`w-3 h-3 md:w-4 md:h-4 ${i < Math.round(item.rating || 5) ? 'fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] md:text-xs text-blue-600 hover:text-red-600 cursor-pointer">{item.numReviews || 0}</span>
        </div>

        {/* Pricing block - Amazon style */}
        <div className="flex flex-col mt-auto pt-1 md:pt-2">
          <div className="flex items-end gap-1 flex-wrap">
            <span className={`font-bold text-gray-900 ${isListMode ? 'text-lg md:text-2xl' : 'text-lg md:text-xl'}`}>
              <span className="text-sm font-medium mr-[1px]">₹</span>{item.price}
            </span>
            <span className="text-[10px] md:text-xs text-gray-500 line-through mb-[3px] md:mb-[4px]">
              M.R.P: ₹{mrp}
            </span>
            <span className="text-[10px] md:text-xs text-green-600 mb-[3px] md:mb-[4px]">
              ({discountPercent}% off)
            </span>
          </div>
          
          {/* Prime/Delivery mock styled with theme */}
          <div className="text-[10px] md:text-xs text-gray-600 mt-1 mb-2 md:mb-3">
             <span className="font-bold text-primary">✓</span> <span className="font-bold text-gray-800">Sadbhavna</span> Delivered
          </div>

          {/* Full width Add to Cart button - Theme Colors */}
          <button 
            onClick={handleAddToCart}
            className={`bg-primary hover:bg-primary-dark text-white border border-primary-dark rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2 mt-auto ${isListMode ? 'w-full max-w-[200px] py-2 text-xs md:text-sm' : 'w-full py-2 md:py-2.5 text-xs md:text-sm'}`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
