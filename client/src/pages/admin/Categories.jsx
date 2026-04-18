import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/categories');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      toast.error('Could not load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openEditModal = (category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editingId ? `http://localhost:5000/api/categories/${editingId}` : 'http://localhost:5000/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `Failed to ${editingId ? 'update' : 'create'} category`);
      }

      toast.success(`Category ${editingId ? 'updated' : 'added'} successfully!`);
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Error saving category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error('Error deleting category');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <input 
            type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 h-10 px-4 pr-10 rounded-lg text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search size={18} className="absolute right-3 top-2.5 text-gray-400" />
        </div>
        <Button onClick={() => {
          setEditingId(null);
          setFormData({ name: '', description: '' });
          setIsModalOpen(true);
        }} className="flex gap-2">
          <Plus size={18}/> Add Category
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface border-b border-gray-200 text-sm text-gray-600">
                <th className="py-4 px-6 font-semibold">Category Name</th>
                <th className="py-4 px-6 font-semibold">Description</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="3" className="text-center py-10">Loading...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-10">No categories found.</td></tr>
              ) : (
                filteredCategories.map((c) => (
                  <tr key={c._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{c.name}</td>
                    <td className="py-4 px-6 text-gray-600 truncate max-w-xs">{c.description || '-'}</td>
                    <td className="py-4 px-6 flex justify-end gap-3">
                      <button onClick={() => openEditModal(c)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                        <Edit size={16}/>
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">Category Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                  placeholder="e.g. Specialty Tea"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">Description (Optional)</label>
                <textarea 
                  name="description" 
                  rows="3" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="A short description of the category..."
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Category'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
