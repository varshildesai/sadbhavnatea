import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Image as ImageIcon, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

// Categories fetched dynamically

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    subCategory: '',
    keyFeatures: [''], 
    variants: [],
    images: [], // Note: files object array
    existingImages: []
  });
  
  const [previewImages, setPreviewImages] = useState([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('http://localhost:5000/api/products'),
        fetch('http://localhost:5000/api/categories')
      ]);
      if (!productsRes.ok || !categoriesRes.ok) throw new Error('Failed to fetch data');
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData);
      setCategoriesList(categoriesData);
      
      if (categoriesData.length > 0 && !formData.category) {
         setFormData(prev => ({...prev, category: categoriesData[0].name}));
      }
    } catch (err) {
      toast.error('Could not load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (e) => {
    setFormData({
      ...formData,
      category: e.target.value
    });
  };

  const handleFeatureChange = (index, value) => {
    const features = [...formData.keyFeatures];
    features[index] = value;
    setFormData({ ...formData, keyFeatures: features });
  };

  const addFeatureRow = () => {
    setFormData({ ...formData, keyFeatures: [...formData.keyFeatures, ''] });
  };

  const removeFeatureRow = (index) => {
    const features = formData.keyFeatures.filter((_, i) => i !== index);
    setFormData({ ...formData, keyFeatures: features });
  };

  const handleVariantChange = (index, field, value) => {
    const vars = [...formData.variants];
    vars[index][field] = value;
    setFormData({ ...formData, variants: vars });
  };

  const addVariantRow = () => {
    setFormData({ ...formData, variants: [...formData.variants, { label: '', price: '', description: '', images: [], existingImages: [], previewImages: [] }] });
  };

  const removeVariantRow = (index) => {
    const vars = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: vars });
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + (formData.existingImages?.length || 0) + files.length > 15) {
      toast.error('Maximum 15 images allowed');
      return;
    }
    const newImages = [...formData.images, ...files];
    setFormData({ ...formData, images: newImages });

    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const handleVariantImagesChange = (index, e) => {
    const files = Array.from(e.target.files);
    const vars = [...formData.variants];
    const v = vars[index];
    if ((v.images?.length || 0) + (v.existingImages?.length || 0) + files.length > 15) {
      toast.error('Maximum 15 images allowed per variant');
      return;
    }
    v.images = [...(v.images || []), ...files];
    const newPreviews = files.map(f => URL.createObjectURL(f));
    v.previewImages = [...(v.previewImages || []), ...newPreviews];
    setFormData({ ...formData, variants: vars });
  };

  const removeImage = (index) => {
    const numExisting = formData.existingImages ? formData.existingImages.length : 0;
    if (index < numExisting) {
       const newExisting = formData.existingImages.filter((_, i) => i !== index);
       setFormData({ ...formData, existingImages: newExisting });
    } else {
       const newIndex = index - numExisting;
       const newImages = formData.images.filter((_, i) => i !== newIndex);
       setFormData({ ...formData, images: newImages });
    }
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newPreviews);
  };

  const removeVariantImage = (index, imgIdx) => {
    const vars = [...formData.variants];
    const v = vars[index];
    const numExisting = v.existingImages ? v.existingImages.length : 0;
    
    if (imgIdx < numExisting) {
       v.existingImages = v.existingImages.filter((_, i) => i !== imgIdx);
    } else {
       const newIndex = imgIdx - numExisting;
       v.images = v.images.filter((_, i) => i !== newIndex);
    }
    if (v.previewImages) {
       v.previewImages = v.previewImages.filter((_, i) => i !== imgIdx);
    }
    setFormData({ ...formData, variants: vars });
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category || (categoriesList.length > 0 ? categoriesList[0].name : ''),
      subCategory: product.subCategory || '',
      keyFeatures: product.keyFeatures?.length ? product.keyFeatures : [''],
      variants: (product.variants || []).map(v => ({
        ...v,
        images: [],
        existingImages: v.images || [],
        previewImages: (v.images || []).map(img => img?.includes('uploads') && !img.includes('http') ? `http://localhost:5000/${img.replace(/\\/g, '/').replace(/^\//, '')}` : img)
      })),
      images: [],
      existingImages: product.images || []
    });
    setPreviewImages((product.images || []).map(img => img?.includes('uploads') && !img.includes('http') ? `http://localhost:5000/${img.replace(/\\/g, '/').replace(/^\//, '')}` : img));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('price', formData.price);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      if (formData.subCategory) submitData.append('subCategory', formData.subCategory);
      
      const filledFeatures = formData.keyFeatures.filter(f => f.trim() !== '');
      filledFeatures.forEach(feature => {
        submitData.append('keyFeatures[]', feature);
      });

      const validVariants = formData.variants.filter(v => v.label.trim() !== '' && v.price !== '');
      if (validVariants.length > 0) {
        const cleanVariants = validVariants.map(v => ({
           label: v.label,
           price: v.price,
           description: v.description,
           existingImages: v.existingImages
        }));
        submitData.append('variants', JSON.stringify(cleanVariants));

        validVariants.forEach((v, idx) => {
           if (v.images && v.images.length > 0) {
              v.images.forEach(img => submitData.append(`variant_${idx}_images`, img));
           }
        });
      } else {
        submitData.append('variants', JSON.stringify([]));
      }

      formData.images.forEach(img => {
        submitData.append('images', img);
      });

      if (formData.existingImages) {
        formData.existingImages.forEach(img => {
          submitData.append('existingImages[]', img);
        });
      }

      const url = editingId ? `http://localhost:5000/api/products/${editingId}` : 'http://localhost:5000/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: submitData,
      });

      if (!res.ok) throw new Error(`Failed to ${editingId ? 'update' : 'create'} product`);

      toast.success(`Product ${editingId ? 'updated' : 'added'} successfully!`);
      setIsModalOpen(false);
      setFormData({
        name: '', price: '', description: '', category: categoriesList.length > 0 ? categoriesList[0].name : '', 
        subCategory: '', keyFeatures: [''], variants: [], images: [], existingImages: [] 
      });
      setPreviewImages([]);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Error creating product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Product deleted');
      fetchData();
    } catch (err) {
      toast.error('Error deleting product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <input 
            type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 h-10 px-4 pr-10 rounded-lg text-sm focus:border-primary"
          />
          <Search size={18} className="absolute right-3 top-2.5 text-gray-400" />
        </div>
        <Button onClick={() => {
          setEditingId(null);
          setFormData({
            name: '', price: '', description: '', category: categoriesList.length > 0 ? categoriesList[0].name : '', 
            subCategory: '', keyFeatures: [''], variants: [], images: [], existingImages: []
          });
          setPreviewImages([]);
          setIsModalOpen(true);
        }} className="flex gap-2">
          <Plus size={18}/> Add Product
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface border-b border-gray-200 text-sm text-gray-600">
                <th className="py-4 px-6 font-semibold w-16">Image</th>
                <th className="py-4 px-6 font-semibold">Product Name</th>
                <th className="py-4 px-6 font-semibold">Category</th>
                <th className="py-4 px-6 font-semibold">Price</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-10">Loading...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-10">No products found.</td></tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-6">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {p.images && p.images.length > 0 ? (
                          <img src={p.images[0]?.includes('uploads') && !p.images[0].includes('http') ? `http://localhost:5000/${p.images[0].replace(/\\/g, '/').replace(/^\//, '')}` : p.images[0]} alt={p.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                        ) : (
                          <ImageIcon className="text-gray-400" size={20} />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900">{p.name}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {p.category} {p.subCategory && <span className="text-xs ml-1 px-2 py-0.5 bg-gray-100 rounded-full">{p.subCategory}</span>}
                    </td>
                    <td className="py-4 px-6 font-bold">₹{p.price}</td>
                    <td className="py-4 px-6 flex justify-end gap-3 h-full mt-1">
                      <button onClick={() => openEditModal(p)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                        <Edit size={16}/>
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold block">Product Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border p-3 rounded" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold block">Price (₹)</label>
                  <input type="number" name="price" required min="0" value={formData.price} onChange={handleInputChange} className="w-full border p-3 rounded" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold block">Category</label>
                  <select name="category" required value={formData.category} onChange={handleCategoryChange} className="w-full border p-3 rounded">
                    <option value="">Select Category</option>
                    {categoriesList.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold block">Subcategory (Size/Variant)</label>
                  <input type="text" name="subCategory" value={formData.subCategory} onChange={handleInputChange} placeholder="e.g. 1 kg, 2 Lane, etc." className="w-full border p-3 rounded" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold block">Description</label>
                  <textarea name="description" required rows="3" value={formData.description} onChange={handleInputChange} className="w-full border p-3 rounded"></textarea>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold flex justify-between items-center">
                    Key Features <Button type="button" variant="ghost" size="sm" onClick={addFeatureRow}>+ Add Feature</Button>
                  </label>
                  <div className="space-y-2">
                    {formData.keyFeatures.map((feat, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input type="text" value={feat} onChange={(e) => handleFeatureChange(idx, e.target.value)} placeholder="e.g. 100% Organic" className="flex-1 border p-2 rounded text-sm"/>
                        {formData.keyFeatures.length > 1 && (
                          <button type="button" onClick={() => removeFeatureRow(idx)} className="text-red-500 hover:bg-red-50 p-2"><Trash2 size={16}/></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex justify-between items-center bg-gray-50 border-x border-t rounded-t-lg p-3">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Product Variants</h4>
                      <p className="text-xs text-gray-500">Add pricing for different sizes or options (e.g. 2 Lane, 4 Lane)</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addVariantRow}>+ Add Variant</Button>
                  </div>
                  <div className="border border-gray-200 rounded-b-lg p-4 space-y-3 bg-white">
                    {formData.variants.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">No variants defined. The base price will apply to this product.</p>
                    ) : (
                      formData.variants.map((v, idx) => (
                        <div key={idx} className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end w-full">
                            <div className="flex-1 w-full">
                              <label className="block text-xs text-gray-500 font-bold mb-1">Variant Label <span className="text-red-500">*</span></label>
                              <input type="text" value={v.label} required onChange={(e) => handleVariantChange(idx, 'label', e.target.value)} placeholder="e.g. 4 Lane Machine" className="w-full border p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/>
                            </div>
                            <div className="w-full sm:w-1/4">
                              <label className="block text-xs text-gray-500 font-bold mb-1">Price (₹) <span className="text-red-500">*</span></label>
                              <input type="number" required min="0" value={v.price} onChange={(e) => handleVariantChange(idx, 'price', e.target.value)} placeholder="Price" className="w-full border p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/>
                            </div>
                            <button type="button" onClick={() => removeVariantRow(idx)} className="text-red-500 hover:bg-red-50 p-2.5 rounded-lg transition-colors border border-transparent hover:border-red-100 bg-white shadow-sm flex-shrink-0 w-full sm:w-auto flex justify-center mt-2 sm:mt-0"><Trash2 size={18}/></button>
                          </div>
                          <div className="w-full">
                            <label className="block text-xs text-gray-500 font-bold mb-1">Variant Specific Description (Optional)</label>
                            <textarea value={v.description || ''} onChange={(e) => handleVariantChange(idx, 'description', e.target.value)} rows="2" placeholder="Describe what makes this variant different... (leave blank to use the main product description)" className="w-full border p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y"></textarea>
                          </div>
                          <div className="w-full mt-2 border-t border-gray-200 pt-3">
                            <label className="block text-xs text-gray-500 font-bold mb-1">Variant Specific Images (Max 15)</label>
                            <input type="file" multiple accept="image/*" onChange={(e) => handleVariantImagesChange(idx, e)} className="block w-full text-xs mb-2 text-gray-500" disabled={(v.images?.length || 0) + (v.existingImages?.length || 0) >= 15}/>
                            {v.previewImages && v.previewImages.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {v.previewImages.map((src, imgIdx) => (
                                  <div key={imgIdx} className="relative w-16 h-16 border rounded-md overflow-hidden group shadow-sm bg-white">
                                    <img src={src} className="w-full h-full object-cover"/>
                                    <button type="button" onClick={() => removeVariantImage(idx, imgIdx)} className="absolute top-1 right-1 bg-white rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition"><XCircle size={14}/></button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold block">Product Images (Max 15)</label>
                  <input type="file" multiple accept="image/*" onChange={handleImagesChange} className="block w-full text-sm mb-4" disabled={formData.images.length >= 15}/>
                  {previewImages.length > 0 && (
                    <div className="flex gap-3 flex-wrap">
                      {previewImages.map((src, idx) => (
                        <div key={idx} className="relative w-20 h-20 border rounded-lg overflow-hidden group">
                          <img src={src} className="w-full h-full object-cover"/>
                          <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition"><XCircle size={16}/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Product'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
