import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

export default function PaymentSuccess() {
  const location = useLocation();
  const orderId = location.state?.orderId; 

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-surface min-h-[70vh] py-16 flex items-center">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-10 max-w-2xl text-center">
        <div className="bg-white rounded-[2rem] p-10 md:p-16 shadow-lg border border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-8 shadow-sm">
            <CheckCircle size={64} className="animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Payment Successful!</h1>
          <p className="text-lg text-gray-600 mb-8 whitespace-pre-wrap font-medium">
            Thank you for choosing Sadbhavna Tea. Your order has been placed successfully.
            {orderId && `\n\nOrder ID: ${orderId}`}
          </p>

          <div className="w-full bg-yellow-50/50 border border-yellow-100/50 rounded-2xl p-6 mb-10 text-left text-gray-700 text-sm flex gap-4 items-center">
            <Package size={36} className="text-yellow-600 shrink-0" />
            <div className="leading-relaxed">
               We have sent an order confirmation to your email. You will receive another notification on WhatsApp once your tea leaves our warehouse.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link to="/my-orders" className="flex-1">
               <Button className="w-full justify-center h-14 text-base font-bold shadow-md hover:shadow-lg">View My Orders</Button>
            </Link>
            <Link to="/products" className="flex-1">
               <button className="w-full h-14 justify-center flex items-center gap-2 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors font-bold text-base">
                 Continue Shopping <ArrowRight size={20} />
               </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
