import { useState, useEffect } from 'react';
import { ShoppingBag, Users, DollarSign, Package, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStatsData(data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch users count from localStorage mock DB
    const savedUsers = localStorage.getItem('sadbhavna_users_db');
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        setUserCount(parsedUsers.length);
      } catch (e) {
        // Handle parsing error
      }
    }
    
    fetchStats();
  }, [token]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const stats = [
    { title: 'Total Revenue', value: statsData ? formatCurrency(statsData.totalRevenue) : '₹0', icon: <DollarSign size={24} className="text-green-600" />, bg: 'bg-green-100', trend: 'Live' },
    { title: 'Total Orders', value: statsData?.totalOrders || 0, icon: <ShoppingBag size={24} className="text-blue-600" />, bg: 'bg-blue-100', trend: 'Live', link: '/admin/orders' },
    { title: 'Pending Orders', value: statsData?.pendingOrders || 0, icon: <Clock size={24} className="text-yellow-600" />, bg: 'bg-yellow-100', trend: 'Action Needed', link: '/admin/orders?filter=pending' },
    { title: 'Total Users', value: userCount, icon: <Users size={24} className="text-purple-600" />, bg: 'bg-purple-100', trend: 'Active' },
    { title: 'Total Products', value: statsData?.totalProducts || 0, icon: <Package size={24} className="text-orange-600" />, bg: 'bg-orange-100', trend: 'Live' },
  ];

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard statistics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
        {stats.map((stat, idx) => {
          const CardContent = (
            <div className={`bg-white rounded-2xl shadow-sm border ${stat.link ? 'border-primary/30 hover:border-primary hover:shadow-md cursor-pointer hover:-translate-y-1 transition-all duration-300' : 'border-gray-100'} p-5 lg:p-6 flex flex-col justify-between h-full`}>
              <div className="flex items-center gap-3 lg:gap-4 mb-4">
                <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl shrink-0 flex items-center justify-center ${stat.bg}`}>
                  {stat.icon}
                </div>
                <p className="text-sm font-bold text-gray-500 leading-snug">{stat.title}</p>
              </div>
              <div className="flex items-end justify-between gap-2 mt-auto">
                <h3 className="text-2xl lg:text-3xl font-black text-gray-800 leading-none whitespace-nowrap">{stat.value}</h3>
                <span className={`text-[10px] lg:text-xs font-bold shrink-0 mb-1 leading-none ${stat.trend === 'Live' ? 'text-green-500' : stat.trend === 'Action Needed' ? 'text-yellow-600' : 'text-gray-400'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          );

          if (stat.link) {
            return (
              <div key={idx} onClick={() => navigate(stat.link)} className="h-full">
                {CardContent}
              </div>
            );
          }
          
          return (
            <div key={idx} className="h-full">
              {CardContent}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-500">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {statsData?.recentOrders?.length > 0 ? (
                  statsData.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-50 last:border-0 text-sm">
                      <td className="py-3 font-medium text-gray-900">#{order._id.substring(0, 8).toUpperCase()}</td>
                      <td className="py-3 text-gray-600">{order.user?.name || 'Guest'}</td>
                      <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${order.isDelivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {order.isDelivered ? 'Delivered' : 'Processing'}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-gray-900 text-right">{formatCurrency(order.totalPrice)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Block instead of top products to keep it simple for now */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Store Overview</h3>
          <div className="space-y-4 text-gray-600 text-sm">
            <p>Your store's statistics are now connected directly to your underlying database.</p>
            <div className="bg-surface p-4 rounded-xl border border-gray-100 mt-4">
              <h4 className="font-bold text-gray-800 mb-2">Next Steps</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Add more products via the Products tab.</li>
                <li>Process orders as they come in.</li>
                <li>Manage registered users from the Users tab.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
