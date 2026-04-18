import { useState, useEffect, Fragment } from 'react';
import { Package, Clock, CheckCircle2, Truck, Box, XCircle, FileText, LifeBuoy, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const res = await fetch('https://sadbhavna-api.onrender.com/api/orders/myorders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) fetchMyOrders();
  }, [token]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusColor = (status) => {
    if (status === 'Cancelled') return 'text-red-500 bg-red-50';
    if (status === 'Delivered') return 'text-green-600 bg-green-50';
    if (['Shipped', 'Out for Delivery'].includes(status)) return 'text-purple-600 bg-purple-50';
    return 'text-primary bg-primary/10';
  };

  // Define full timeline stages
  const STAGES = [
    { label: 'Placed', icon: Clock },
    { label: 'Confirmed', icon: CheckCircle2 },
    { label: 'Packed', icon: Box },
    { label: 'Shipped', icon: Truck },
    { label: 'Out for Delivery', icon: MapPin },
    { label: 'Delivered', icon: Package }
  ];

  const getActiveStepIndex = (currentStatus) => {
    if (currentStatus === 'Cancelled') return -1;
    const index = STAGES.findIndex(s => s.label === currentStatus);
    return index !== -1 ? index : 0;
  };

  if (isLoading) {
    return <div className="min-h-screen bg-surface py-20 flex justify-center"><p className="text-gray-500 font-bold">Loading your orders...</p></div>;
  }

  return (
    <div className="bg-surface min-h-[80vh] py-10 lg:py-16">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 lg:px-24 max-w-5xl">
        <h1 className="text-3xl font-black text-gray-900 mb-8 border-b border-gray-200 pb-4">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">No orders found</h2>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start exploring our teas!</p>
            <Button href="/products">Shop Now</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedId === order._id;
              const activeStep = getActiveStepIndex(order.orderStatus || (order.isDelivered ? 'Delivered' : 'Placed'));
              const badgeClass = getStatusColor(order.orderStatus || (order.isDelivered ? 'Delivered' : 'Placed'));

              return (
                <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
                  {/* Order Header Summary */}
                  <div 
                    onClick={() => toggleExpand(order._id)}
                    className="p-5 lg:p-6 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4 lg:gap-8 flex-1">
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Order ID</p>
                        <p className="font-mono text-sm font-bold text-gray-800">#{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Date Placed</p>
                        <p className="text-sm font-bold text-gray-800">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Total Amount</p>
                        <p className="text-sm font-bold text-gray-800">₹{order.totalPrice}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 justify-between lg:justify-end border-t border-gray-100 pt-4 lg:border-0 lg:pt-0">
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${badgeClass} flex items-center gap-1.5`}>
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                        {order.orderStatus || (order.isDelivered ? 'Delivered' : 'Placed')}
                      </div>
                      <div className="text-gray-400">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded View: Timeline & Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-5 lg:p-8">
                      
                      {/* Premium Timeline Component */}
                      {activeStep !== -1 ? (
                        <div className="mb-10 lg:mb-12">
                          <h3 className="font-bold text-gray-800 mb-6 uppercase text-xs tracking-wider">Tracking Progress</h3>
                          <div className="relative">
                            {/* Connecting Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full hidden md:block"></div>
                            {/* Active Line Fill */}
                            <div 
                              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-700 hidden md:block"
                              style={{ width: `${(activeStep / (STAGES.length - 1)) * 100}%` }}
                            ></div>

                            <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-0">
                              {STAGES.map((stage, idx) => {
                                const isCompleted = idx <= activeStep;
                                const isCurrent = idx === activeStep;
                                const Icon = stage.icon;
                                
                                return (
                                  <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10">
                                    {/* Mobile vertical line */}
                                    {idx !== STAGES.length - 1 && (
                                      <div className="absolute left-[19px] top-[40px] w-0.5 h-[calc(100%+16px)] bg-gray-200 md:hidden z-[-1]">
                                        <div className="h-full bg-primary transition-all duration-700" style={{ height: isCompleted ? '100%' : '0%' }}></div>
                                      </div>
                                    )}
                                    
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                                      isCurrent ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30' :
                                      isCompleted ? 'bg-primary border-primary text-white' : 
                                      'bg-white border-gray-200 text-gray-400'
                                    }`}>
                                      <Icon size={isCurrent ? 20 : 18} />
                                    </div>
                                    <div className={`flex flex-col md:items-center ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                      <span className={`text-xs lg:text-sm font-bold ${isCurrent ? 'text-primary' : ''}`}>{stage.label}</span>
                                      {/* Mock Dates for completed steps if history isn't fully robust */}
                                      {isCompleted && <span className="text-[10px] text-gray-500 mt-0.5">{new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3 mb-8">
                          <XCircle size={24} />
                          <div>
                            <h4 className="font-bold">Order Cancelled</h4>
                            <p className="text-sm">This order has been cancelled and will not be fulfilled.</p>
                          </div>
                        </div>
                      )}

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-4">
                          <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider border-b border-gray-200 pb-2">Items Purchased</h3>
                          {order.orderItems.map((item, id) => (
                            <div key={id} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                              <div className="w-16 h-16 bg-surface rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
                                {item.image ? (
                                  <img src={`https://sadbhavna-api.onrender.com${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="text-gray-300" size={24} />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × ₹{item.price}</p>
                              </div>
                              <div className="font-bold text-gray-900 pr-2">
                                ₹{item.price * item.quantity}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order & Shipping Info */}
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider border-b border-gray-200 pb-2 mb-3">Shipping Details</h3>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-sm text-gray-600">
                              <p className="font-bold text-gray-800">{order.user?.name}</p>
                              <p className="mt-1">{order.shippingAddress?.address}</p>
                              <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                              <p>Phone: {order.user?.phone}</p>
                            </div>
                          </div>

                          {(order.trackingId || order.courierCompany) && (
                            <div>
                              <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider border-b border-gray-200 pb-2 mb-3">Courier Info</h3>
                              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 text-sm">
                                {order.courierCompany && <p><span className="text-gray-600 font-medium">Partner:</span> <strong className="text-gray-800">{order.courierCompany}</strong></p>}
                                {order.trackingId && <p className="mt-1"><span className="text-gray-600 font-medium">Tracking ID:</span> <span className="font-mono text-primary-dark font-bold ml-1">{order.trackingId}</span></p>}
                              </div>
                            </div>
                          )}

                          <div className="pt-2 flex flex-col gap-3">
                            <button className="w-full bg-white border border-gray-200 hover:border-primary hover:text-primary transition-colors py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
                              <FileText size={16} /> Download Invoice
                            </button>
                            <button className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-gray-700 shadow-sm">
                              <LifeBuoy size={16} /> Contact Support
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
