import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';
import { ShieldCheck, Truck, Coffee, Leaf, ChevronRight, Award, Instagram, Star } from 'lucide-react';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [vendingMachines, setVendingMachines] = useState([]);
  const [teas, setTeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('https://sadbhavna-api.onrender.com/api/products');
        if (res.ok) {
          const data = await res.json();
          const flattenedProducts = [];
          
          data.forEach(p => {
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
          
          // Organize
          setFeaturedProducts(flattenedProducts.slice(0, 4));
          
          const machines = flattenedProducts.filter(p => p.category.toLowerCase().includes('machine'));
          setVendingMachines(machines.slice(0, 4)); // Show top 4 machines
          
          const authenticTeas = flattenedProducts.filter(p => !p.category.toLowerCase().includes('machine'));
          setTeas(authenticTeas.slice(0, 4)); // Show top 4 teas/masalas
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col gap-12 pb-16 bg-[#FDFBF7]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary-dark via-secondary to-[#004a1f] pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden rounded-b-[3rem] shadow-2xl">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            {/* Text Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
              <span className="text-white font-bold tracking-widest uppercase mb-4 inline-block bg-primary/90 backdrop-blur-md border border-primary-light/30 px-5 py-2 rounded-full w-max mx-auto lg:mx-0 text-xs sm:text-sm shadow-lg shadow-primary/20 flex items-center gap-2">
                <Leaf size={14} /> 100% Organic & Natural
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                Awaken Your <br className="hidden lg:block" />Senses With <br className="hidden lg:block" /><span className="text-primary-light font-serif italic text-7xl md:text-8xl">Sadbhavna</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed drop-shadow-md">
                Experience the authentic taste of Assam. From hand-picked premium CTC teas to state-of-the-art Atlantis vending machines. Everything you need for the perfect cup.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Button size="lg" to="/products" className="bg-primary hover:bg-primary-light text-white border-none shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-1 !px-8 !py-4 text-lg transition-all font-bold flex items-center gap-2">
                  Shop Our Collection <ChevronRight size={20} />
                </Button>
                <Button variant="outline" size="lg" className="bg-white/10 text-white hover:bg-white hover:text-secondary-dark border-white/30 backdrop-blur-sm hover:-translate-y-1 !px-8 !py-4 text-lg transition-all font-bold" to="/category/vending-machine">
                  View Machines
                </Button>
              </div>
            </div>
            
            {/* Image Content */}
            <div className="w-full lg:w-1/2 relative mt-8 lg:mt-0 px-4 sm:px-12 lg:px-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary rounded-full blur-[120px] opacity-40 -z-10 mix-blend-screen"></div>
              
              <div className="relative">
                <img 
                  src="/tea_refreshment_banner.png" 
                  alt="Premium Tea Refreshment" 
                  className="w-full h-auto object-cover rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-[#D6A354]/50 transform hover:scale-[1.02] transition-transform duration-500"
                />
                
                {/* Floating badge */}
                <div className="absolute -bottom-6 -left-6 sm:-left-10 bg-white/95 backdrop-blur-md p-3 sm:p-5 rounded-2xl shadow-2xl z-20 flex items-center gap-4 border border-[#D6A354]/30 animate-bounce">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-inner border border-white/20">🌿</div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-secondary-dark font-extrabold uppercase tracking-wider">Fresh from</div>
                    <div className="font-serif font-extrabold text-gray-900 text-sm sm:text-lg">Assam Estates</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Wave/Bottom Curve */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-[50px] sm:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.3,192.39,101.55,236.42,88.75,279.79,72.4,321.39,56.44Z" className="fill-[#FDFBF7]"></path>
          </svg>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-primary/10 p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                <Award size={24} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">Premium Quality</h3>
              <p className="text-xs text-gray-500 mt-1">Export grade selections</p>
            </div>
            <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-3">
                <Coffee size={24} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">Rich Aroma</h3>
              <p className="text-xs text-gray-500 mt-1">Perfect blend every time</p>
            </div>
            <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                <Leaf size={24} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">100% Natural</h3>
              <p className="text-xs text-gray-500 mt-1">Direct from estates</p>
            </div>
            <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-3">
                <Truck size={24} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">Fast Shipping</h3>
              <p className="text-xs text-gray-500 mt-1">Secure & quick delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-2">Customer Favorites</h2>
            <p className="text-gray-500 font-medium">Our most loved authentic teas and machines curated for you</p>
          </div>
          <Link to="/products" className="text-primary hover:text-primary-dark font-bold items-center gap-1 hidden md:flex hover:underline flex-shrink-0">
            View All Products <ChevronRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-1 lg:col-span-4 text-center py-20 text-gray-500">Loading premium collection...</div>
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)
          ) : (
            <div className="col-span-1 lg:col-span-4 text-center py-10 text-gray-500">Inventory updating...</div>
          )}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" className="w-full border-gray-300 text-gray-700" to="/products">See All Products</Button>
        </div>
      </section>

      {/* Vending Machines Spotlight */}
      {vendingMachines.length > 0 && (
        <section className="bg-secondary-dark text-white py-20 mt-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary to-transparent opacity-50 pointer-events-none"></div>
          <div className="absolute -left-32 -top-32 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6">
              <div className="text-center md:text-left">
                <span className="text-primary-light font-bold tracking-widest uppercase mb-2 block text-sm">Commercial Excellence</span>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Atlantis Vending Series</h2>
                <p className="text-gray-300 max-w-xl text-lg">Robust, elegant tea and coffee dispensers perfect for offices, canteens, and luxury hotels.</p>
              </div>
              <Button to="/category/vending-machine" className="bg-white text-secondary-dark hover:bg-gray-100 border-none font-bold shrink-0">
                Explore Machines
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vendingMachines.map((p) => (
                <div key={p._id} className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pure Tea & Spices Spotlight */}
      {teas.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="bg-orange-50 rounded-[3rem] p-8 md:p-12 lg:p-16 border border-orange-100 shadow-sm relative overflow-hidden">
             {/* Decor */}
             <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
             <div className="absolute left-0 bottom-0 w-64 h-64 bg-secondary/5 rounded-full blur-[80px]"></div>

             <div className="relative z-10 text-center max-w-2xl mx-auto mb-12">
               <span className="text-primary font-bold tracking-widest uppercase mb-2 block text-sm">Harvested With Love</span>
               <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Finest Loose Leaves & Masalas</h2>
               <p className="text-gray-600 text-lg">Curated directly from the finest tea estates to guarantee the ultimate Sadbhavna aroma in every sip you take today.</p>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
               {teas.map((p) => (
                 <ProductCard key={p._id} product={p} />
               ))}
             </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="container mx-auto px-4 py-8 mb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Trusted By Thousands</h2>
          <p className="text-gray-500 font-medium">Join our community of tea and coffee enthusiasts across India</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Priya Sharma",
              role: "Cafe Owner",
              text: "The Sadbhavna Atlantis 4-Lane machine revolutionized our morning rushes. Lightning fast, zero maintenance, and consistently hot tea!",
              rating: 5
            },
            {
              name: "Rahul Mehta",
              role: "Verified Buyer",
              text: "I've been drinking proper Assam tea for 20 years. The Sadbhavna CTC leaf blend is easily the freshest, most robust cut I've found online.",
              rating: 5
            },
            {
              name: "Anjali Gupta",
              role: "Office Manager",
              text: "Their Chai Masala is the secret ingredient everyone in our office asks about. Just a pinch completely elevates standard tea into something magical.",
              rating: 5
            }
          ].map((review, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-md shadow-gray-200/50 hover:shadow-xl transition-shadow relative">
              <div className="text-primary/20 text-6xl leading-none absolute top-4 right-6 font-serif">"</div>
              <div className="flex gap-1 mb-6 text-yellow-400">
                {[...Array(review.rating)].map((_, idx) => <Star key={idx} size={16} className="fill-yellow-500 text-yellow-500" />)}
              </div>
              <p className="text-gray-700 mb-8 italic leading-relaxed text-lg">"{review.text}"</p>
              <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-inner text-white flex items-center justify-center font-bold text-lg">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{review.name}</h4>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mt-0.5">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Instagram / Poetry CTA */}
      <section className="container mx-auto px-4">
         <div className="bg-gradient-to-r from-primary-dark to-primary rounded-[3rem] overflow-hidden relative group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            
            {/* Hover decorative elements */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700"></div>
            
            <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-8">
               <div className="w-full md:w-1/2">
                 <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                   "A cup of tea makes <br className="hidden md:block" /> everything better."
                 </h2>
                 <div className="text-primary-light text-lg mb-0 font-medium font-serif italic max-w-md border-l-4 border-primary-light pl-4">
                   In every drop, a story is told,<br/>
                   Of misty mornings and traditions old.<br/>
                   Take a sip, let worries fade,<br/>
                   In the comforting warmth that we have made.
                 </div>
               </div>
               <div className="w-full md:w-1/2 flex flex-col items-center md:items-end justify-center">
                 <p className="text-white/80 font-bold tracking-widest uppercase mb-4 text-sm">Join Our Community</p>
                 <a 
                   href="https://www.instagram.com/sadbhavnatea?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="relative overflow-hidden group/btn inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-2xl font-black text-lg transition-transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20"
                 >
                   <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></div>
                   <Instagram className="relative z-10 text-pink-500 group-hover/btn:text-pink-600 transition-colors duration-300" size={28} />
                   <span className="relative z-10 group-hover/btn:text-gray-900 transition-colors duration-300">Follow on Instagram</span>
                 </a>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
