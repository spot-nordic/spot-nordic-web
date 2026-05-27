// spot-nordic-web/app/(admin)/admin/products/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { Trash2, Edit, Plus, X, UploadCloud, XCircle, Eye, EyeOff, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  description: string;
  images: string[];
  basePrice: number;
  discountPercentage: number;
  stock: number;
  status: string;
  averageRating: number;
  totalReviews: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  id: string;
  productId: string;
  productName: string;
  userEmail: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
}

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'CATEGORIES' | 'REVIEWS'>('PRODUCTS');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '', sku: '', categoryId: '', description: '', basePrice: '', discountPercentage: '0', stock: '0', status: 'ACTIVE'
  });
  
  const [categoryFormData, setCategoryFormData] = useState({
    name: '', slug: '', description: '', status: 'ACTIVE'
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['adminProducts'], queryFn: () => adminApi.getProducts({ limit: 50 })
  });
  
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['adminCategories'], queryFn: adminApi.getCategories
  });
  
  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['adminReviews'], queryFn: () => adminApi.getProductReviews({ limit: 50 }), enabled: activeTab === 'REVIEWS'
  });

  const createMutation = useMutation({ 
      mutationFn: (data: FormData) => adminApi.createProduct(data), 
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminProducts'] }); closeModal(); } 
  });
  
  const updateMutation = useMutation({ 
      mutationFn: ({ id, data }: {id: string, data: FormData}) => adminApi.updateProduct(id, data), 
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminProducts'] }); closeModal(); } 
  });
  
  const deleteMutation = useMutation({ 
      mutationFn: (id: string) => adminApi.deleteProduct(id), 
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminProducts'] }) 
  });
  
  const createCategoryMutation = useMutation({ 
      mutationFn: (data: typeof categoryFormData) => adminApi.createCategory(data), 
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminCategories'] }); closeCategoryModal(); } 
  });
  
  const updateCategoryMutation = useMutation({ 
      mutationFn: ({ id, data }: {id: string, data: typeof categoryFormData}) => adminApi.updateCategory(id, data), 
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminCategories'] }); closeCategoryModal(); } 
  });
  
  const deleteCategoryMutation = useMutation({ 
      mutationFn: (id: string) => adminApi.deleteCategory(id), 
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminCategories'] }) 
  });

  const toggleReviewMutation = useMutation({
    mutationFn: ({ id, isVisible }: { id: string, isVisible: boolean }) => adminApi.toggleReviewVisibility(id, isVisible),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminReviews'] })
  });

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        categoryId: product.categoryId,
        description: product.description,
        basePrice: product.basePrice.toString(),
        discountPercentage: product.discountPercentage.toString(),
        stock: product.stock.toString(),
        status: product.status
      });
      setExistingImages(product.images || []);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', sku: '', categoryId: '', description: '', basePrice: '', discountPercentage: '0', stock: '0', status: 'ACTIVE' });
      setExistingImages([]);
    }
    setNewFiles([]);
    setPreviewUrls([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setNewFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        status: category.status
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({ name: '', slug: '', description: '', status: 'ACTIVE' });
    }
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...filesArray]);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const removeExistingImage = (indexToRemove: number) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeNewFile = (indexToRemove: number) => {
    setNewFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    URL.revokeObjectURL(previewUrls[indexToRemove]);
    setPreviewUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCategoryNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    setCategoryFormData(prev => ({ ...prev, name, slug }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
    if (editingProduct) payload.append('existingImages', JSON.stringify(existingImages));
    newFiles.forEach(file => payload.append('images', file));

    if (editingProduct) updateMutation.mutate({ id: editingProduct.id, data: payload });
    else createMutation.mutate(payload);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryFormData });
    else createCategoryMutation.mutate(categoryFormData);
  };

  if (isProductsLoading || isCategoriesLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading catalog...</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Catalog Management</h2>
        {activeTab === 'PRODUCTS' && (
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
            <Plus size={16} /> Add Product
          </button>
        )}
        {activeTab === 'CATEGORIES' && (
          <button onClick={() => openCategoryModal()} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
            <Plus size={16} /> Add Category
          </button>
        )}
      </div>

      <div className="flex gap-6 border-b border-border">
        {['PRODUCTS', 'CATEGORIES', 'REVIEWS'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)} 
            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === tab ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {activeTab === 'PRODUCTS' && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="uppercase tracking-wider border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">SKU</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Rating</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productsData?.data?.map((product: Product) => (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded border border-border overflow-hidden shrink-0">
                        {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">No img</div>}
                      </div>
                      <div className="flex flex-col">
                          <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                          <span className="text-xs text-muted-foreground">{product.categoryName || 'Uncategorized'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{product.sku}</td>
                    <td className="px-6 py-4 font-medium">
                        ${product.basePrice.toFixed(2)} 
                        {product.discountPercentage > 0 && <span className="text-red-500 font-bold ml-2 text-xs bg-red-100 px-1.5 py-0.5 rounded">-{product.discountPercentage}%</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-yellow-500"/> 
                          {product.averageRating.toFixed(1)} 
                          <span className="text-muted-foreground text-xs ml-1">({product.totalReviews})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock > 10 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>{product.stock}</span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button onClick={() => openModal(product)} className="p-2 text-foreground hover:bg-secondary rounded"><Edit size={16}/></button>
                      <button onClick={() => { if(window.confirm('Disable product?')) deleteMutation.mutate(product.id); }} className="p-2 text-destructive hover:bg-destructive/10 rounded"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CATEGORIES' && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="uppercase tracking-wider border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Slug</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories?.map((category: Category) => (
                  <tr key={category.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{category.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{category.slug}</td>
                    <td className="px-6 py-4 max-w-[300px] truncate">{category.description || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${category.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                        {category.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button onClick={() => openCategoryModal(category)} className="p-2 text-foreground hover:bg-secondary rounded"><Edit size={16} /></button>
                      <button onClick={() => { if(window.confirm('Delete category?')) deleteCategoryMutation.mutate(category.id); }} className="p-2 text-destructive hover:bg-destructive/10 rounded"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'REVIEWS' && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {isReviewsLoading ? <div className="p-8 text-center text-muted-foreground animate-pulse">Loading reviews...</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="uppercase tracking-wider border-b border-border bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Rating</th>
                    <th className="px-6 py-4 font-medium">Comment</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reviewsData?.data?.map((review: Review) => (
                    <tr key={review.id} className={`hover:bg-muted/20 transition-colors ${!review.isVisible ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4 font-medium max-w-[200px] truncate" title={review.productName}>{review.productName}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{review.userEmail}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-yellow-500">
                          {review.rating} <Star size={14} className="fill-yellow-500" />
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[300px] truncate whitespace-normal line-clamp-2">{review.comment || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${review.isVisible ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                          {review.isVisible ? 'VISIBLE' : 'HIDDEN'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex justify-end gap-2">
                        <button 
                          onClick={() => toggleReviewMutation.mutate({ id: review.id, isVisible: !review.isVisible })}
                          className={`p-2 rounded transition-colors ${review.isVisible ? 'text-orange-500 hover:bg-orange-500/10' : 'text-green-500 hover:bg-green-500/10'}`}
                          title={review.isVisible ? "Hide Review" : "Show Review"}
                        >
                          {review.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reviewsData?.data?.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No reviews yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-3xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
              <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Product Name</label>
                    <input type="text" required className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">SKU (Unique)</label>
                    <input type="text" required className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50 font-mono" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Category</label>
                    <select required className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                      <option value="" disabled>Select Category</option>
                      {categories?.map((cat: Category) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Status</label>
                    <select required className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="ACTIVE">Active</option>
                      <option value="DISABLED">Disabled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Description</label>
                  <textarea required rows={4} className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50 resize-y" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Base Price</label>
                    <input type="number" step="0.01" required className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Discount %</label>
                    <input type="number" step="0.1" className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Stock Count</label>
                    <input type="number" required className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                  </div>
                </div>

                <div className="border border-border rounded-xl p-4 bg-muted/10 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Images</h4>
                  <div className="flex flex-wrap gap-4">
                    {existingImages.map((url, idx) => (
                      <div key={`exist-${idx}`} className="relative w-24 h-24 rounded-lg border border-border overflow-hidden group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle size={14}/></button>
                      </div>
                    ))}
                    {previewUrls.map((url, idx) => (
                      <div key={`new-${idx}`} className="relative w-24 h-24 rounded-lg border border-primary/50 overflow-hidden group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-primary/10 pointer-events-none"></div>
                        <button type="button" onClick={() => removeNewFile(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle size={14}/></button>
                      </div>
                    ))}
                    <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all">
                      <UploadCloud size={20} className="text-muted-foreground mb-1" />
                      <span className="text-[10px] font-semibold text-muted-foreground">Add File</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
              <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">Cancel</button>
              <button type="submit" form="product-form" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/95 rounded-lg transition-colors shadow-sm disabled:opacity-50">
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
              <h2 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'Create New Category'}</h2>
              <button onClick={closeCategoryModal} className="text-muted-foreground hover:text-foreground transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="category-form" onSubmit={handleCategorySubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Category Name</label>
                  <input type="text" required className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50" value={categoryFormData.name} onChange={e => handleCategoryNameChange(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">URL Slug</label>
                  <input type="text" required className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50 font-mono text-sm" value={categoryFormData.slug} onChange={e => setCategoryFormData({ ...categoryFormData, slug: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Description (Optional)</label>
                  <textarea rows={3} className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50 resize-y" value={categoryFormData.description} onChange={e => setCategoryFormData({ ...categoryFormData, description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Status</label>
                  <select required className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50" value={categoryFormData.status} onChange={e => setCategoryFormData({ ...categoryFormData, status: e.target.value })}>
                    <option value="ACTIVE">Active</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
              <button type="button" onClick={closeCategoryModal} className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">Cancel</button>
              <button type="submit" form="category-form" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending} className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/95 rounded-lg transition-colors shadow-sm disabled:opacity-50">
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}