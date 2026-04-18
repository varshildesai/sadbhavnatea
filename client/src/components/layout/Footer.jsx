import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer 
      className="text-white pt-16 pb-8 border-t-[6px] border-[#D6A354] mt-16 overflow-hidden relative selection:bg-white selection:text-[#064e3b] bg-gradient-to-r from-[#d96b00] to-[#064e3b]"
    >
      <div className="absolute inset-0 bg-black/10 z-0"></div>
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
        <div className="flex flex-col items-start">
          <div className="w-[300px] mb-6 -ml-4 flex items-center justify-start group-hover:-translate-y-1 transition-transform">
            <img src="/logo2-0-transparent.png" alt="Sadbhavna Tea" className="w-full h-auto object-contain object-left drop-shadow-2xl"/>
          </div>
          <p className="font-serif italic text-[#D6A354] text-lg mb-2">A sip of purity, a taste of tradition.</p>
          <p className="text-gray-100 text-sm leading-relaxed pr-4 mb-6">
            Sadbhavna Tea is handpicked from the finest gardens, carefully blended to bring you an authentic, refreshing aroma and unmatched taste in every cup. Embrace the warmth of genuine quality.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D6A354] hover:text-secondary-dark hover:scale-110 transition-all duration-300 shadow-sm">
              <Facebook size={18} />
            </a>
            <a href="https://www.instagram.com/sadbhavnatea?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D6A354] hover:text-secondary-dark hover:scale-110 transition-all duration-300 shadow-sm">
              <Instagram size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D6A354] hover:text-secondary-dark hover:scale-110 transition-all duration-300 shadow-sm">
              <Twitter size={18} />
            </a>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-[#D6A354] uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-[#D6A354]"></span> Quick Links
          </h4>
          <ul className="space-y-4 text-sm text-gray-300">
            <li><a href="/" className="hover:text-primary-light hover:translate-x-2 inline-flex transition-transform duration-300 items-center gap-2"><span className="text-[#D6A354]">&rsaquo;</span> Home</a></li>
            <li><a href="/products" className="hover:text-primary-light hover:translate-x-2 inline-flex transition-transform duration-300 items-center gap-2"><span className="text-[#D6A354]">&rsaquo;</span> Shop All</a></li>
            <li><a href="/about" className="hover:text-primary-light hover:translate-x-2 inline-flex transition-transform duration-300 items-center gap-2"><span className="text-[#D6A354]">&rsaquo;</span> About Us</a></li>
            <li><a href="/contact" className="hover:text-primary-light hover:translate-x-2 inline-flex transition-transform duration-300 items-center gap-2"><span className="text-[#D6A354]">&rsaquo;</span> Contact</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-[#D6A354] uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-[#D6A354]"></span> Categories
          </h4>
          <ul className="space-y-3 text-sm text-gray-300">
            <li><a href="/category/tea-black-ctc" className="hover:text-primary-light hover:translate-x-2 inline-flex transition-transform duration-300 items-center gap-2"><span className="text-[#D6A354]">&rsaquo;</span> TEA (Black CTC)</a></li>
            <li><a href="/category/tea-dust" className="hover:text-primary-light hover:translate-x-2 inline-flex transition-transform duration-300 items-center gap-2"><span className="text-[#D6A354]">&rsaquo;</span> Tea Dust</a></li>
            <li><a href="/category/tea-masala" className="hover:text-primary-light hover:translate-x-2 inline-flex transition-transform duration-300 items-center gap-2"><span className="text-[#D6A354]">&rsaquo;</span> Tea Masala</a></li>
            <li><a href="/category/vending-machine" className="hover:text-primary-light hover:translate-x-2 inline-flex transition-transform duration-300 items-center gap-2"><span className="text-[#D6A354]">&rsaquo;</span> Vending Machine</a></li>
            <li><a href="/category/bean-to-cup-machine" className="hover:text-primary-light hover:translate-x-2 inline-flex transition-transform duration-300 items-center gap-2"><span className="text-[#D6A354]">&rsaquo;</span> Bean to cup machine</a></li>
            <li><a href="/category/espresso-machine" className="hover:text-primary-light hover:translate-x-2 inline-flex transition-transform duration-300 items-center gap-2"><span className="text-[#D6A354]">&rsaquo;</span> Espresso Machine</a></li>
            <li><a href="/category/premix" className="hover:text-primary-light hover:translate-x-2 inline-flex transition-transform duration-300 items-center gap-2"><span className="text-[#D6A354]">&rsaquo;</span> Premix</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-[#D6A354] uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-[#D6A354]"></span> Contact Info
          </h4>
          <ul className="space-y-5 text-sm text-gray-300">
            <li className="flex items-start gap-3 group">
              <span className="text-[#D6A354] mt-0.5 bg-white/10 p-2 rounded-lg group-hover:bg-[#D6A354] group-hover:text-secondary-dark transition-colors duration-300"><Mail size={16} /></span> 
              <span className="leading-relaxed">Email:<br/><a href="mailto:sadbhavnafoodspvtltd@gmail.com" className="hover:text-primary-light transition-colors">sadbhavnafoodspvtltd@gmail.com</a></span>
            </li>
            <li className="flex items-start gap-3 group">
              <span className="text-[#D6A354] mt-0.5 bg-white/10 p-2 rounded-lg group-hover:bg-[#D6A354] group-hover:text-secondary-dark transition-colors duration-300"><Phone size={16} /></span> 
              <span className="leading-relaxed">Customer Care:<br/><a href="tel:+917878924167" className="hover:text-primary-light transition-colors">+91 78789 24167</a><br/><a href="tel:+918154814142" className="hover:text-primary-light transition-colors">+91 81548 14142</a></span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-10 mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400 relative z-10">
        <p>&copy; {new Date().getFullYear()} Sadbhavna Foods Pvt. Ltd. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white hover:underline transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white hover:underline transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
