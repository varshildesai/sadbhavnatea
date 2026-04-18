import { Link } from 'react-router-dom';
import Button from './Button';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { showWishlistToast, showErrorToast } from '../../utils/toastHelpers';

export default function ProductCard({ product }) {
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
      const res = await fetch('http://localhost:5000/api/auth/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    ? `http://localhost:5000/${imgSource.replace(/\\/g, '/').replace(/^\//, '')}` 
    : imgSource;

  const secondImgSource = item.images && item.images.length > 1 ? item.images[1] : null;
  const secondImageUrl = secondImgSource?.includes('uploads') && !secondImgSource.includes('http')
    ? `http://localhost:5000/${secondImgSource.replace(/\\/g, '/').replace(/^\//, '')}`
    : secondImgSource;

  const linkId = item.originalProductId || item._id;
  const linkUrl = item.variantLabel ? `/product/${linkId}?variant=${encodeURIComponent(item.variantLabel)}` : `/product/${linkId}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full relative">
      <button onClick={handleWishlistToggle} className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-gray-500 hover:text-red-500 transition-colors">
        <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
      </button>

      <div className="relative aspect-square overflow-hidden bg-surface shrink-0">
        <Link to={linkUrl}>
          <img 
            src={imageUrl} 
            alt={item.name} 
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${secondImageUrl ? 'absolute inset-0 opacity-100 group-hover:opacity-0' : ''}`}
            crossOrigin="anonymous"
          />
          {secondImageUrl && (
            <img 
              src={secondImageUrl} 
              alt={item.name} 
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105"
              crossOrigin="anonymous"
            />
          )}
        </Link>
        <div className="absolute top-3 left-3 z-10 bg-secondary text-[10px] font-bold px-2 py-0.5 rounded-md text-gray-800 shadow-sm">
          {item.category}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-xs text-gray-600">{item.rating || 0}</span>
        </div>
        <Link to={linkUrl}>
          <h3 className="font-bold text-gray-800 text-base mb-1 hover:text-primary-dark transition-colors line-clamp-1">{item.name}</h3>
        </Link>
        <p className="text-sm font-bold text-gray-600 line-clamp-1 mb-auto">{item.subCategory || ''}</p>
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-extrabold text-primary-dark">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}
          </span>
          <Button variant="secondary" size="sm" className="!px-3 !rounded-full shrink-0" onClick={handleAddToCart}>
            <ShoppingCart size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
