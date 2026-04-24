import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Share2, ShieldCheck, Truck, MessageSquare, X, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import ProductCard from '../components/ui/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const variantQuery = searchParams.get('variant');
  const { addToCart } = useCart();
  const { user, setUser } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const generateSlug = (name) => {
    if (!name || name === 'All') return 'all';
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const openFullscreen = (index) => {
    setFullscreenImageIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeFullscreen = () => {
    setFullscreenImageIndex(null);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (product?.images?.length) {
      setFullscreenImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (product?.images?.length) {
      setFullscreenImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProductAndReviews = async () => {
      try {
        const [prodRes, revRes, allProdRes] = await Promise.all([
          fetch(`https://sadbhavna-api.onrender.com/api/products/${id}`),
          fetch(`https://sadbhavna-api.onrender.com/api/reviews/product/${id}`),
          fetch(`https://sadbhavna-api.onrender.com/api/products`)
        ]);

        if (!prodRes.ok) throw new Error('Product not found');
        
        const prodData = await prodRes.json();
        const revData = revRes.ok ? await revRes.json() : [];
        const allProdsData = allProdRes.ok ? await allProdRes.json() : [];
        
        const formatData = {
          ...prodData,
          images: prodData.images && prodData.images.length > 0 
            ? prodData.images.map(img => img?.includes('uploads') && !img.includes('http') ? `https://sadbhavna-api.onrender.com/${img.replace(/\\/g, '/').replace(/^\//, '')}` : img)
            : ['https://sadbhavna-api.onrender.com/uploads/default.jpg'],
          variants: (prodData.variants || []).map(v => ({
            ...v,
            images: v.images && v.images.length > 0
              ? v.images.map(img => img?.includes('uploads') && !img.includes('http') ? `https://sadbhavna-api.onrender.com/${img.replace(/\\/g, '/').replace(/^\//, '')}` : img)
              : []
          })),
          originalPrice: Math.round(prodData.price * 1.2),
          rating: prodData.rating || 0,
          numReviews: prodData.numReviews || 0,
        };
        
        setProduct(formatData);
        setReviews(revData);
        
        let foundVariant = null;
        if (variantQuery && formatData.variants) {
          foundVariant = formatData.variants.find(v => v.label === variantQuery);
        }
        setSelectedVariant(foundVariant || null);

        const flattenedProds = [];
        allProdsData.forEach(p => {
          flattenedProds.push({ ...p, originalProductId: p._id });
          if (p.variants && p.variants.length > 0) {
            p.variants.forEach((v, vIndex) => {
              flattenedProds.push({
                ...p,
                _id: `${p._id}-var-${vIndex}`,
                originalProductId: p._id,
                name: `${p.name} - ${v.label}`,
                price: v.price,
                images: v.images && v.images.length > 0 ? v.images : p.images,
                subCategory: v.label,
                isVariant: true,
                variantLabel: v.label
              });
            });
          }
        });

        // Filter for related products in the same category, excluding exactly the currently viewed item (but allowing its other variants)
        const activeLabel = variantQuery || null;
        
        const related = flattenedProds
          .filter(p => {
            if (p.category !== prodData.category) return false;
            
            const isCurrentBase = p._id === prodData._id && !activeLabel;
            const isCurrentVar = p.originalProductId === prodData._id && p.isVariant && p.variantLabel === activeLabel;
            
            return !(isCurrentBase || isCurrentVar);
          })
          .slice(0, 4)
          .map(p => ({
            ...p,
            images: p.images && p.images.length > 0
              ? p.images.map(img => img?.includes('uploads') && !img.includes('http') ? `https://sadbhavna-api.onrender.com/${img.replace(/\\/g, '/').replace(/^\//, '')}` : img)
              : ['https://sadbhavna-api.onrender.com/uploads/default.jpg']
          }));
        setRelatedProducts(related);

        if (user?.wishlist?.includes(prodData._id)) {
          setIsWishlisted(true);
        }
      } catch (err) {
        toast.error('Product not found');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductAndReviews();
  }, [id, user, variantQuery]);

  if (isLoading) return <div className="text-center py-20 text-gray-500">Loading product details...</div>;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found.</div>;

  const displayImages = selectedVariant && selectedVariant.images && selectedVariant.images.length > 0 
    ? selectedVariant.images 
    : product.images;

  const handleAddToCart = () => {
    const currentPrice = selectedVariant ? selectedVariant.price : product.price;
    const cartProduct = {
      ...product,
      image: displayImages[0],
      price: currentPrice,
      selectedVariant: selectedVariant ? selectedVariant.label : null
    };
    addToCart(cartProduct, quantity);
  };
  
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleWishlistToggle = async () => {
    if (!user) return toast.error('Please login to use wishlist');
    try {
      const res = await fetch('https://sadbhavna-api.onrender.com/api/auth/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sadbhavna_token')}`
        },
        body: JSON.stringify({ userId: user._id, productId: product._id }),
      });
      if (!res.ok) throw new Error();
      const newWishlist = await res.json();
      const isNowWishlisted = newWishlist.includes(product._id);
      setIsWishlisted(isNowWishlisted);
      toast.success(isNowWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
      if (typeof setUser === 'function') {
        setUser({ ...user, wishlist: newWishlist });
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch (err) {
        console.log('Share error:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to submit a review');

    setSubmittingReview(true);
    try {
      const url = editingReviewId 
        ? `https://sadbhavna-api.onrender.com/api/reviews/${editingReviewId}` 
        : `https://sadbhavna-api.onrender.com/api/reviews/product/${product._id}`;
      const method = editingReviewId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sadbhavna_token')}`
        },
        body: JSON.stringify({ rating, comment }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }
      toast.success(editingReviewId ? 'Review updated!' : 'Review submitted!');
      setComment('');
      setRating(5);
      setEditingReviewId(null);
      
      // Refresh reviews
      const revRes = await fetch(`https://sadbhavna-api.onrender.com/api/reviews/product/${product._id}`);
      setReviews(await revRes.json());
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`https://sadbhavna-api.onrender.com/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sadbhavna_token')}` }
      });
      if (!res.ok) throw new Error('Failed to delete review');
      toast.success('Review deleted');
      setReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEditClick = (review) => {
    setRating(review.rating);
    setComment(review.comment);
    setEditingReviewId(review._id);
    document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-surface min-h-screen">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-10 py-10">
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left: Images Area */}
            <div className="w-full lg:w-1/2 p-6 lg:p-10 bg-gray-50/50">
              <div 
                className="relative aspect-square rounded-[2rem] overflow-hidden mb-6 bg-white shadow-sm border border-gray-100 group cursor-zoom-in"
                onClick={() => openFullscreen(activeImage)}
              >
                <img 
                  src={displayImages[activeImage] || displayImages[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  crossOrigin="anonymous"
                />
                {displayImages.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setActiveImage(prev => (prev - 1 + displayImages.length) % displayImages.length); 
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg text-gray-700 hover:text-primary transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setActiveImage(prev => (prev + 1) % displayImages.length); 
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg text-gray-700 hover:text-primary transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
              {displayImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {displayImages.map((img, idx) => (
                    <button 
                      key={idx} 
                      onClick={(e) => { e.stopPropagation(); setActiveImage(idx); openFullscreen(idx); }}
                      onMouseEnter={() => setActiveImage(idx)}
                      className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === idx ? 'border-primary ring-4 ring-primary/20 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" crossOrigin="anonymous"/>
                    </button>
                  ))}
                </div>
              )}

              {/* Fullscreen Lightbox */}
              {fullscreenImageIndex !== null && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={closeFullscreen}>
                  <button onClick={closeFullscreen} className="fixed top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-colors z-[110] hover:bg-white/20">
                    <X size={32} />
                  </button>
                  
                  {displayImages.length > 1 && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setFullscreenImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length); }} className="fixed left-4 sm:left-10 text-white/70 hover:text-white bg-white/10 p-3 rounded-full transition-all hover:bg-white/20 select-none z-[110]">
                        <ChevronLeft size={40} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setFullscreenImageIndex((prev) => (prev + 1) % displayImages.length); }} className="fixed right-4 sm:right-10 text-white/70 hover:text-white bg-white/10 p-3 rounded-full transition-all hover:bg-white/20 select-none z-[110]">
                        <ChevronRight size={40} />
                      </button>
                    </>
                  )}
                  
                  <img 
                    src={displayImages[fullscreenImageIndex] || displayImages[0]} 
                    alt="Fullscreen view" 
                    className="max-h-[85vh] max-w-[95vw] object-contain rounded-xl shadow-2xl transition-all select-none z-[105]"
                    onClick={(e) => e.stopPropagation()}
                    crossOrigin="anonymous"
                  />
                  
                  {displayImages.length > 1 && (
                    <div className="fixed bottom-6 flex gap-3 w-full justify-center px-4 overflow-x-auto pb-4 scrollbar-hide z-[110]">
                      {displayImages.map((img, idx) => (
                        <button 
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFullscreenImageIndex(idx);
                          }}
                          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-transform hover:scale-105 ${fullscreenImageIndex === idx ? 'border-primary shadow-lg ring-2 ring-primary/50' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        >
                          <img src={img} className="w-full h-full object-cover" crossOrigin="anonymous"/>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Product Info Area */}
            <div className="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div 
                    onClick={() => navigate(`/category/${generateSlug(product.category)}`)}
                    className="text-secondary text-xs uppercase tracking-widest font-bold mb-2 cursor-pointer hover:underline"
                  >
                    {product.category}
                  </div>
                  <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-2">{product.name}</h1>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button onClick={handleWishlistToggle} className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-full shadow-sm border border-gray-100">
                    <Heart size={22} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                  </button>
                  <button onClick={handleShare} className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors rounded-full shadow-sm border border-gray-100">
                    <Share2 size={22} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                  <Star size={16} className="fill-yellow-500 text-yellow-500 mr-1.5" />
                  <span className="font-bold text-yellow-700 text-sm">{typeof product.rating === 'number' ? product.rating.toFixed(1) : 0}</span>
                </div>
                <a href="#reviews" className="text-sm text-gray-500 font-medium hover:text-primary transition-colors underline decoration-dotted underline-offset-4">
                  {product.numReviews} Verified Reviews
                </a>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Available Options:</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => { setSelectedVariant(null); setActiveImage(0); }}
                      className={`px-4 py-2 text-sm font-bold rounded-xl border-2 transition-all ${selectedVariant === null ? 'border-primary bg-primary text-white shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                      {product.subCategory || 'Standard Model'}
                    </button>
                    {product.variants.map((v, idx) => (
                      <button 
                        key={idx}
                        onClick={() => { 
                          setSelectedVariant(v);
                          setActiveImage(0);
                        }}
                        className={`px-4 py-2 text-sm font-bold rounded-xl border-2 transition-all ${selectedVariant?.label === v.label ? 'border-primary bg-primary text-white shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8 flex items-end gap-4">
                <span className="text-5xl font-black text-primary-dark tracking-tight">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(selectedVariant ? selectedVariant.price : product.price)}
                </span>
                <div className="flex flex-col pb-1">
                  <span className="text-xl text-gray-400 line-through font-semibold leading-none">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round((selectedVariant ? selectedVariant.price : product.price) * 1.2))}
                  </span>
                  <span className="text-xs font-bold text-green-600 tracking-wide uppercase mt-1">
                    Save 17%
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-10 text-lg leading-relaxed whitespace-pre-wrap font-serif tracking-wide text-justify">
                {selectedVariant && selectedVariant.description ? selectedVariant.description : product.description}
              </p>

              {product.keyFeatures?.length > 0 && product.keyFeatures.some(f => f.trim()) && (
                <div className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={18} className="text-primary"/> Key Highlights
                  </h3>
                  <ul className="space-y-3">
                    {product.keyFeatures.filter(f => f.trim()).map((feature, idx) => (
                      <li key={idx} className="flex gap-3 text-gray-700">
                        <span className="text-primary mt-1 shadow-sm shrink-0"><div className="w-2 h-2 rounded-full bg-secondary-dark mt-1"></div></span>
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shrink-0 h-[60px]">
                  <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="w-12 h-full flex items-center justify-center text-xl font-bold text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors">-</button>
                  <input type="number" value={quantity} readOnly className="w-14 h-full bg-transparent text-center font-black text-lg text-gray-900 focus:outline-none"/>
                  <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-full flex items-center justify-center text-xl font-bold text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors">+</button>
                </div>
                <Button size="lg" className="flex-1 flex gap-2 w-full sm:w-auto h-[60px] text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all" onClick={handleAddToCart}>
                  <ShoppingCart size={22} /> Add to Cart
                </Button>
                <Button size="lg" className="flex-1 w-full sm:w-auto h-[60px] text-lg rounded-xl bg-gray-900 hover:bg-black text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" onClick={handleBuyNow}>
                  Buy Now
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 font-medium bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                  <Truck className="text-secondary" size={24} />
                  <span>Ships within 7 days</span>
                </div>
                <div className="w-px h-6 bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-secondary" size={24} />
                  <span>Verified Original</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="max-w-6xl mx-auto pt-8 mb-16">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-3xl font-black text-gray-900">Related Products</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(related => (
                <ProductCard key={related._id} product={related} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section id="reviews" className="max-w-4xl mx-auto border-t border-gray-100 pt-16">
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare size={32} className="text-primary" />
            <h2 className="text-3xl font-black text-gray-900">Customer Feedback</h2>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 mb-8">
            <h3 className="font-bold text-lg mb-4 text-gray-800">
              {editingReviewId ? 'Edit your Review' : 'Write a Review'}
              {editingReviewId && (
                <button 
                  type="button" 
                  onClick={() => { setEditingReviewId(null); setComment(''); setRating(5); }}
                  className="ml-4 text-sm text-red-500 hover:underline"
                >Cancel Edit</button>
              )}
            </h3>
            <form onSubmit={submitReview}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button type="button" key={star} onClick={() => setRating(star)} className="focus:outline-none hover:scale-110 transition-transform">
                      <Star size={32} className={star <= rating ? "fill-yellow-500 text-yellow-500" : "text-gray-200"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Share your experience (Optional)</label>
                <textarea 
                  rows="4" 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl p-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="What did you like about this product? (Optional)"
                ></textarea>
              </div>
              <Button type="submit" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-dashed border-gray-200">Be the first to review this product!</p>
            ) : (
              reviews.map(review => (
                <div key={review._id} className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-light text-primary-dark font-black rounded-full flex items-center justify-center text-lg">
                        {review.user?.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{review.user?.name || 'Anonymous User'}</h4>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-200'}/>)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">{review.comment}</p>
                  )}
                  
                  {user && (user._id === review.user?._id || user._id === review.user) && (
                    <div className="flex gap-4 mb-4 text-sm border-t border-gray-100 pt-3">
                      <button onClick={() => handleEditClick(review)} className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors">
                        <Edit2 size={16} /> Edit
                      </button>
                      <button onClick={() => deleteReview(review._id)} className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}

                  {review.adminReply && (
                    <div className="ml-8 mt-6 bg-surface p-5 rounded-2xl border border-primary/20 relative">
                      <div className="absolute -top-3 left-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">Merchant Response</div>
                      <p className="text-sm text-gray-800 mt-2 font-medium italic">"{review.adminReply}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
