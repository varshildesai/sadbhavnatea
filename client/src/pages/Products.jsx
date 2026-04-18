import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Filter, Search, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';

export default function Products() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Format the URL parameter (e.g. 'tea-masala') to match the categories array ('Tea Masala')
  const initialCategory = categoryId 
    ? categoryId.replace(/-/g, ' ')
    : 'All';
    
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('Popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [isLoading, setIsLoading] = useState(true);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  // Sync state if URL changes externally
  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('https://sadbhavna-api.onrender.com/api/products'),
          fetch('https://sadbhavna-api.onrender.com/api/categories')
        ]);
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        
        const flattenedProducts = [];
        productsData.forEach(p => {
          flattenedProducts.push({ ...p, originalProductId: p._id });
          if (p.variants && p.variants.length > 0) {
            p.variants.forEach((v, vIndex) => {
              flattenedProducts.push({
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
        
        setProducts(flattenedProducts);
        setCategories(['All', ...categoriesData.map(c => c.name)]);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryChange = (catName) => {
    setSelectedCategory(catName);
    if (catName === 'All') {
      navigate('/products');
    } else {
      navigate(`/category/${catName.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };


  // Apply filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'Price: Low to High':
        return a.price - b.price;
      case 'Price: High to Low':
        return b.price - a.price;
      case 'Newest Arrivals':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'Popularity':
      default:
        return (b.rating || 0) - (a.rating || 0);
    }
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-800">
          {selectedCategory === 'All' ? 'Our Products' : `${selectedCategory} Collection`}
        </h1>
        <div className="relative w-full md:w-96 text-gray-600">
          <input 
            type="text" 
            placeholder="Search for teas, coffee, machines..." 
            className="w-full bg-white border border-gray-300 h-12 px-5 pr-12 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-dark transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="absolute right-0 top-0 mt-3 mr-4">
            <Search size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-1/4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center gap-2 font-bold text-lg mb-6 text-gray-800 border-b pb-4">
              <Filter size={20} /> Filters
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-gray-700">Categories</h3>
              <ul className="space-y-2">
                {categories.map((cat, idx) => (
                  <li key={idx}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="category" 
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary" 
                        checked={selectedCategory.toLowerCase() === cat.toLowerCase()} 
                        onChange={() => handleCategoryChange(cat)}
                      />
                      <span className="text-gray-600 group-hover:text-primary-dark transition-colors">{cat}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-3 text-gray-700">Sort By</h3>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-surface border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-primary"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option>Popularity</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest Arrivals</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="w-full lg:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {currentProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          
          {isLoading ? (
            <div className="text-center py-20 text-gray-500">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              No products found in this category.
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 gap-2 flex-wrap">
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-4"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Previous
              </Button>
              
              {[...Array(totalPages)].map((_, i) => (
                <Button 
                  key={i} 
                  variant={currentPage === i + 1 ? 'outline' : 'ghost'} 
                  size="sm" 
                  className={`w-10 h-10 !p-0 ${currentPage === i + 1 ? 'border-primary text-primary' : ''}`}
                  onClick={() => {
                    setCurrentPage(i + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {i + 1}
                </Button>
              ))}

              <Button 
                variant="ghost" 
                size="sm" 
                className="px-4"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
