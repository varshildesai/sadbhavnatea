import { useState, useEffect } from 'react';
import ProductCard from '../components/ui/ProductCard';
import { useAuth } from '../context/AuthContext';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { user } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
         setIsLoading(false);
         return;
      }
      try {
        const res = await fetch('http://localhost:5000/api/products');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        
        const filtered = data.filter(p => user.wishlist?.includes(p._id));
        setWishlistProducts(filtered);
      } catch (err) {
        toast.error('Could not load wishlist');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWishlist();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Heart size={64} className="text-gray-200 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700">Please log in to view your Wishlist</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-full flex items-center justify-center border border-secondary/20">
          <Heart size={24} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">My Wishlist</h1>
          <p className="text-gray-500">{wishlistProducts.length} items saved</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500">Loading your wishlist...</div>
      ) : wishlistProducts.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-gray-600">Your wishlist is empty!</h3>
          <p className="text-gray-500 mt-2">Start saving products you love.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistProducts.map(p => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
