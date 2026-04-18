import { useState, useEffect } from 'react';
import { Package, Check, Clock, X, Eye, Filter, Truck, XCircle, CheckCircle2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Status Editing State
  const [editStatus, setEditStatus] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [courierCompany, setCourierCompany] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const currentFilter = queryParams.get('filter');

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('https://sadbhavna-api.onrender.com/api/orders');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      toast.error('Could not load orders from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!editStatus) return toast.error('Please select a status');
    
    try {
      setIsUpdating(true);
      const res = await fetch(`https://sadbhavna-api.onrender.com/api/orders/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderStatus: editStatus,
          trackingId,
          courierCompany
        })
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      
      const updatedOrder = await res.json();
      toast.success(`Order marked as ${editStatus}`);
      setSelectedOrder(updatedOrder);
      fetchOrders();
    } catch (err) {
      toast.error('Error updating order');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Placed': return <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 text-xs font-bold rounded-full w-max"><Clock size={14} /> Placed</span>;
      case 'Confirmed': return <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 text-xs font-bold rounded-full w-max"><Check size={14} /> Confirmed</span>;
      case 'Packed': return <span className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2.5 py-1 text-xs font-bold rounded-full w-max"><Package size={14} /> Packed</span>;
      case 'Shipped': return <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 text-xs font-bold rounded-full w-max"><Truck size={14} /> Shipped</span>;
      case 'Out for Delivery': return <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 text-xs font-bold rounded-full w-max"><Truck size={14} /> Out for Delivery</span>;
      case 'Delivered': return <span className="flex items-center gap-1 bg-green-100 text-green-800 px-2.5 py-1 text-xs font-bold rounded-full w-max"><CheckCircle2 size={14} /> Delivered</span>;
      case 'Cancelled': return <span className="flex items-center gap-1 bg-red-100 text-red-800 px-2.5 py-1 text-xs font-bold rounded-full w-max"><XCircle size={14} /> Cancelled</span>;
      default: return <span className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2.5 py-1 text-xs font-bold rounded-full w-max cursor-help" title={status}><Clock size={14} /> {status || 'Pending'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
          {currentFilter === 'pending' && (
            <div className="mt-1 flex items-center gap-2 text-sm text-yellow-600 font-bold bg-yellow-50 px-3 py-1 rounded-full w-max">
              <Clock size={14} /> Showing Pending Orders Only
              <button 
                onClick={() => navigate('/admin/orders')}
                className="ml-2 hover:text-yellow-800 underline decoration-yellow-300"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface border-b border-gray-200 text-sm text-gray-600">
                <th className="py-4 px-6 font-semibold">Order ID</th>
                <th className="py-4 px-6 font-semibold">Customer</th>
                <th className="py-4 px-6 font-semibold">Date</th>
                <th className="py-4 px-6 font-semibold">Total</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500">No orders found.</td></tr>
              ) : (
                (() => {
                  const filteredOrders = currentFilter === 'pending' 
                    ? orders.filter(o => !o.isDelivered) 
                    : orders;
                    
                  if (filteredOrders.length === 0) {
                    return <tr><td colSpan="6" className="text-center py-10 text-gray-500">No {currentFilter} orders found.</td></tr>;
                  }
                  
                  return filteredOrders.map((o) => (
                    <tr key={o._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900 text-sm">#{o._id.substring(o._id.length - 6)}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">{o.user?.name || o.userDetails?.name || 'Guest'}</div>
                      <div className="text-xs text-gray-500">{o.user?.email || o.userDetails?.email || o.shippingAddress?.email || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-primary-dark font-bold">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(o.totalPrice)}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(o.orderStatus || (o.isDelivered ? 'Delivered' : 'Placed'))}
                    </td>
                    <td className="py-4 px-6 flex justify-end gap-3 items-center">
                      <button onClick={() => {
                        setSelectedOrder(o);
                        setEditStatus(o.orderStatus || 'Placed');
                        setTrackingId(o.trackingId || '');
                        setCourierCompany(o.courierCompany || '');
                      }} className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-blue-100 shadow-sm whitespace-nowrap" title="Manage Order">
                        Manage <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">Order Details <span className="text-gray-400 font-normal text-lg ml-2">#{selectedOrder._id.substring(selectedOrder._id.length - 6)}</span></h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700 bg-gray-100 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Customer Info */}
              <div className="bg-surface rounded-xl p-5 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 uppercase text-xs tracking-wider flex items-center gap-2">Customer Contact</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex justify-between"><span className="font-semibold text-gray-800">Name:</span> <span>{selectedOrder.user?.name || selectedOrder.userDetails?.name || 'Guest User'}</span></p>
                    <p className="flex justify-between"><span className="font-semibold text-gray-800">Email:</span> <span>{selectedOrder.user?.email || selectedOrder.userDetails?.email || selectedOrder.shippingAddress?.email || 'N/A'}</span></p>
                    <p className="flex justify-between"><span className="font-semibold text-gray-800">Phone:</span> <span>{selectedOrder.user?.phone || selectedOrder.userDetails?.phone || selectedOrder.shippingAddress?.phone || 'N/A'}</span></p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 uppercase text-xs tracking-wider">Shipping Address</h3>
                  <div className="space-y-1 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-50">
                    <p className="font-medium text-gray-800">{selectedOrder.shippingAddress?.address}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                    <p>{selectedOrder.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider">Purchased Items</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/80 text-xs text-gray-500">
                      <tr>
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4 text-center">Qty</th>
                        <th className="py-3 px-4 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {selectedOrder.orderItems?.map((item, idx) => (
                        <tr key={idx} className="text-sm hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-800">
                            {item.name}
                            {item.subCategory && <span className="text-xs ml-2 text-gray-500 px-1.5 py-0.5 bg-gray-100 rounded inline-block">{item.subCategory}</span>}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-600 font-medium text-xs sm:text-sm">
                            {item.quantity} × ₹{item.price}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-800">₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50/80 border-t border-gray-200">
                      <tr>
                        <td colSpan="2" className="py-3 px-4 text-right font-medium text-gray-600">Shipping:</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-800 text-sm">₹{selectedOrder.shippingPrice}</td>
                      </tr>
                      <tr>
                        <td colSpan="2" className="py-3 px-4 text-right font-medium text-gray-600">Tax:</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-800 text-sm">₹{selectedOrder.taxPrice}</td>
                      </tr>
                      <tr>
                        <td colSpan="2" className="py-3 px-4 text-right font-black text-gray-800 uppercase text-xs tracking-widest">Grand Total:</td>
                        <td className="py-3 px-4 text-right font-black text-primary-dark text-lg">₹{selectedOrder.totalPrice}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Status Update Panel */}
              <form onSubmit={handleStatusUpdate} className="bg-surface rounded-xl p-5 border border-primary/20 bg-primary/5">
                <h3 className="font-bold text-primary-dark mb-4 uppercase text-xs tracking-wider flex items-center gap-2">
                  <Send size={16} /> Update Order Status & Notifications
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">New Status</label>
                    <select 
                      value={editStatus} 
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
                    >
                      <option value="Placed">Placed</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  {(editStatus === 'Shipped' || editStatus === 'Out for Delivery' || selectedOrder.trackingId) && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Courier Company</label>
                        <input 
                          type="text" 
                          value={courierCompany} 
                          onChange={(e) => setCourierCompany(e.target.value)}
                          placeholder="e.g. BlueDart, Delhivery"
                          className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Tracking ID</label>
                        <input 
                          type="text" 
                          value={trackingId} 
                          onChange={(e) => setTrackingId(e.target.value)}
                          placeholder="Tracking Number"
                          className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <p className="text-xs text-gray-500 italic">This will automatically send an email update to the customer.</p>
                  <Button type="submit" disabled={isUpdating || editStatus === selectedOrder.orderStatus} size="sm">
                    {isUpdating ? 'Saving...' : 'Save & Notify'}
                  </Button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
