import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { Lock } from 'lucide-react';
import Button from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { showPaymentSuccessToast, showWarningToast, showErrorToast } from '../utils/toastHelpers';

export default function Checkout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const orderCompleted = useRef(false);
  
  const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 50;
  const total = subtotal + shipping;
  const usdTotal = (total / 83).toFixed(2); // Mock conversion for PayPal Sandbox

  useEffect(() => {
    if (cartItems.length === 0 && !isProcessing && !orderCompleted.current) {
      navigate('/products');
    }
  }, [cartItems, navigate, isProcessing]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveOrderToDB = async (paymentResult) => {
    try {
      const orderData = {
        user: {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          phone: formData.phone || 'N/A'
        },
        orderItems: cartItems.map(item => ({
          name: item.selectedVariant ? `${item.name} - ${item.selectedVariant}` : item.name,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
          product: item.originalProductId || item._id
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          state: 'Not specified' 
        },
        paymentMethod: paymentMethod === 'paypal' ? 'PayPal' : paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on Delivery',
        itemsPrice: subtotal,
        taxPrice: 0,
        shippingPrice: shipping,
        totalPrice: total,
      };

      if (paymentResult) {
        orderData.paymentResult = {
           id: paymentResult.id,
           status: paymentResult.status,
           update_time: paymentResult.update_time,
           email_address: paymentMethod === 'paypal' ? paymentResult.payer.email_address : paymentResult.email_address,
        };
      }

      const res = await fetch('https://sadbhavna-api.onrender.com/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sadbhavna_token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Order backend processing failed');
      }

      const createdOrder = await res.json();

      showPaymentSuccessToast();
      orderCompleted.current = true;
      clearCart();
      navigate('/payment-success', { state: { orderId: createdOrder._id } });
    } catch (error) {
      showErrorToast(error.message || 'Payment failed to save order to DB');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);
    toast.loading('Initializing Razorpay...', { id: 'payment' });

    try {
      const configRes = await fetch('https://sadbhavna-api.onrender.com/api/config/razorpay');
      if (!configRes.ok) throw new Error('Could not fetch Razorpay config');
      const keyId = await configRes.text();

      const orderRes = await fetch('https://sadbhavna-api.onrender.com/api/orders/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      });
      
      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.message || 'Failed to create Razorpay order on backend. Are your API keys correct?');
      }
      const orderData = await orderRes.json();

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Sadbhavna Tea',
        description: 'Secure Checkout',
        order_id: orderData.id,
        handler: function (response) {
          toast.loading('Capturing payment...', { id: 'payment' });
          const paymentResult = {
             id: response.razorpay_payment_id,
             status: 'COMPLETED',
             update_time: new Date().toISOString(),
             email_address: formData.email,
          };
          saveOrderToDB(paymentResult);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#004a1f'
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        showErrorToast(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });

      rzp.open();
    } catch (err) {
      showErrorToast(err.message || 'Error initializing payment');
      setIsProcessing(false);
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.postalCode) {
      showWarningToast('Please fill in all shipping details first');
      return false;
    }
    return true;
  };

  const handleManualOrder = () => {
    if (!validateForm()) return;
    setIsProcessing(true);
    toast.loading('Processing order...', { id: 'payment' });
    saveOrderToDB();
  };

  return (
    <div className="bg-surface min-h-screen">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 lg:px-24 py-10">
        <h1 className="text-3xl font-black text-gray-900 mb-8 border-b border-gray-200 pb-4">Secure Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side: Forms */}
          <div className="w-full lg:w-2/3 space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Shipping Information</h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm" placeholder="john@example.com" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm" placeholder="+91 9876543210" required />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm" placeholder="123 Street Name, Apartment/Suite" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm" placeholder="City Name" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Pincode</label>
                  <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm" placeholder="e.g. 400001" required />
                </div>
              </form>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-primary bg-primary-light/20' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" className="w-5 h-5 text-primary" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
                  <div className="flex-1 font-bold text-gray-800">Razorpay (UPI, Cards, Netbanking)</div>
                </label>
                
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'border-primary bg-primary-light/20' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" className="w-5 h-5 text-primary" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} />
                  <div className="flex-1 font-bold text-gray-800">PayPal / International Cards</div>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary-light/20' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" className="w-5 h-5 text-primary" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <div className="flex-1 font-bold text-gray-800">Cash on Delivery</div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Side: Order Summary & Payment */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="flex justify-between items-center text-sm">
                    <div className="text-gray-700 font-medium truncate pr-4">
                      {item.quantity}x {item.name} 
                      {item.selectedVariant && <span className="text-xs text-primary ml-1">({item.selectedVariant})</span>}
                    </div>
                    <div className="font-bold text-gray-900">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 text-gray-600 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-800">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="font-bold text-green-600">
                    {shipping === 0 ? 'Free (Over ₹1000)' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(shipping)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-end border-t pt-4 text-xl font-extrabold text-gray-900 mb-8">
                <div className="flex flex-col">
                  <span>Total (INR)</span>
                  <span className="text-xs text-gray-400 font-medium tracking-normal uppercase">~ ${usdTotal} USD</span>
                </div>
                <span className="text-primary-dark tracking-wide text-3xl">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(total)}
                </span>
              </div>
              
              <div className="w-full z-0 relative min-h-[50px]">
                {paymentMethod === 'paypal' ? (
                  <PayPalButtons
                    style={{ layout: 'vertical', shape: 'pill' }}
                    createOrder={(data, actions) => {
                      if (!validateForm()) return actions.reject();
                      return actions.order.create({
                        purchase_units: [{
                          amount: {
                            currency_code: 'USD',
                            value: usdTotal,
                          },
                        }],
                      });
                    }}
                    onApprove={(data, actions) => {
                      setIsProcessing(true);
                      toast.loading('Capturing payment...', { id: 'payment' });
                      return actions.order.capture().then((details) => {
                        saveOrderToDB(details);
                      });
                    }}
                    onError={(err) => {
                      toast.error('PayPal Checkout failed. Try again.');
                      console.error(err);
                    }}
                  />
                ) : paymentMethod === 'razorpay' ? (
                  <Button size="lg" className="w-full flex justify-center py-4" onClick={handleRazorpayPayment} disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Pay with Razorpay'}
                  </Button>
                ) : (
                  <Button size="lg" className="w-full flex justify-center py-4" onClick={handleManualOrder} disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Pay via Cash on Delivery'}
                  </Button>
                )}
              </div>
              
              <div className="mt-6 flex gap-2 items-center justify-center text-xs text-gray-500 font-bold tracking-wide uppercase">
                <span className="flex items-center gap-1.5"><Lock size={14} className="text-gray-500" /> {paymentMethod === 'paypal' ? 'Powered by PayPal Secure' : '100% Secure Checkout'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
