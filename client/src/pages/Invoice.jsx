import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Printer, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Invoice() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`https://sadbhavna-api.onrender.com/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Order not found or unauthorized');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchOrder();
  }, [orderId, token]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Generating Invoice...</div>;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-500 font-bold mb-4">{error || 'Invoice not found'}</p>
        <Link to="/my-orders"><Button>Back to Orders</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 print:p-0 print:bg-white">
      {/* Non-printable controls */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link to="/my-orders" className="flex items-center gap-2 text-gray-600 hover:text-primary font-bold transition-colors">
          <ArrowLeft size={20} /> Back to Orders
        </Link>
        <Button onClick={handlePrint} className="flex items-center gap-2 shadow-md">
          <Printer size={18} /> Download / Print PDF
        </Button>
      </div>

      {/* Printable Invoice Page */}
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-8 mb-8">
          <div>
            <div className="w-48 mb-4">
               {/* Using explicit text for print reliability, or logo if allowed in print css */}
               <h1 className="text-3xl font-black tracking-tighter text-green-900">SADBHAVNA TEA</h1>
            </div>
            <p className="text-sm text-gray-600">Varshil Desai (Proprietor)</p>
            <p className="text-sm text-gray-600">Surat, Gujarat, India</p>
            <p className="text-sm text-gray-600">Email: varshildesai247@gmail.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-gray-200 uppercase tracking-widest mb-2">INVOICE</h2>
            <p className="font-bold text-gray-800">Invoice # {order._id.slice(-8).toUpperCase()}</p>
            <p className="text-sm text-gray-600 mt-1">Date: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div className="mt-4 inline-block px-3 py-1 bg-green-50 text-green-700 font-bold text-xs rounded border border-green-200 print:border-gray-300 print:bg-white print:text-gray-800">
               {order.isPaid ? 'PAID' : (order.paymentMethod === 'Cash on Delivery' ? 'CASH ON DELIVERY' : 'PENDING')}
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 border-b border-gray-100 pb-2">Billed To</h3>
            <p className="font-bold text-gray-800 text-lg">{order.user?.name || order.userDetails?.name}</p>
            <p className="text-sm text-gray-600 mt-1">{order.user?.email || order.userDetails?.email}</p>
            <p className="text-sm text-gray-600 mt-1">{order.user?.phone}</p>
          </div>
          
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 border-b border-gray-100 pb-2">Shipped To</h3>
            <p className="font-bold text-gray-800">{order.user?.name}</p>
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{order.shippingAddress?.address}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800 text-xs uppercase tracking-wider print:bg-gray-200">
                <th className="p-3 rounded-l-lg">Item Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right rounded-r-lg">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.orderItems.map((item, idx) => (
                <tr key={idx} className="text-sm text-gray-800">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 text-center">{item.quantity}</td>
                  <td className="p-4 text-right">₹{item.price}</td>
                  <td className="p-4 text-right font-bold">₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-full md:w-1/2 lg:w-1/3">
            <div className="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-100">
              <span>Subtotal</span>
              <span>₹{order.itemsPrice || order.orderItems.reduce((a,i)=>a+i.price*i.quantity,0)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-100">
              <span>Shipping</span>
              <span>₹{order.shippingPrice || 0}</span>
            </div>
            <div className="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-100">
              <span>Tax (GST)</span>
              <span>₹{order.taxPrice || 0}</span>
            </div>
            <div className="flex justify-between py-4 text-lg font-black text-gray-900 border-b-2 border-gray-800">
              <span>Grand Total</span>
              <span>₹{order.totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-8">
          <p className="font-bold text-gray-700 mb-1">Thank you for your business!</p>
          <p>If you have any questions about this invoice, please contact support at varshildesai247@gmail.com</p>
          <p className="mt-4">This is a computer-generated document. No signature is required.</p>
        </div>
      </div>

      {/* Global Print Styles to hide the navbar/footer during print */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .max-w-4xl {
            max-width: 100% !important;
          }
          .bg-gray-50 {
            background-color: white !important;
          }
          /* We want ONLY the invoice div and its children to be visible */
          .min-h-screen > .max-w-4xl:nth-of-type(2),
          .min-h-screen > .max-w-4xl:nth-of-type(2) * {
            visibility: visible;
          }
          .min-h-screen > .max-w-4xl:nth-of-type(2) {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  );
}
