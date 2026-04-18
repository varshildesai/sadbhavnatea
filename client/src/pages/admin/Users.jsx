import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Users() {
  const [users, setUsers] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('https://sadbhavna-api.onrender.com/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    if (token) {
      fetchUsers();
    }
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Registered Users</h2>
        <div className="bg-primary-light text-primary-dark px-4 py-2 rounded-lg font-bold text-sm">
          Total: {users.length}
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Login Type</th>
                <th className="pb-3 font-medium">Joined On</th>
                <th className="pb-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0 text-sm hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-bold text-gray-900">{user.name}</td>
                    <td className="py-4 text-gray-600 font-medium">{user.email}</td>
                    <td className="py-4 font-bold">
                       <span className={`px-3 py-1 text-xs font-bold rounded-full ${user.loginProvider === 'google' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                        {user.loginProvider ? user.loginProvider.toUpperCase() : 'OTP'}
                      </span>
                    </td>
                    <td className="py-4 text-gray-500 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                        {user.role ? user.role.toUpperCase() : 'USER'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
