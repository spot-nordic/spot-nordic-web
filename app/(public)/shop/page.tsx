'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicApi } from '@/api/public';
import { sharedApi } from '@/api/shared';
import Link from 'next/link';
import { ShoppingBag, Loader2, Star, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';

export default function ShopPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, categoryId, minPrice, maxPrice]);

  const { data: categories } = useQuery({ 
    queryKey: ['publicCategories'], 
    queryFn: publicApi.getCategories 
  }); 
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', search, categoryId, minPrice, maxPrice, page],
    queryFn: () => publicApi.getProducts({ search, categoryId, minPrice, maxPrice, page, limit: 12 })
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => sharedApi.addToCart({ productId, quantity: 1 }),
    onMutate: (id) => setAddingToCartId(id),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['cart'] });
      setAddingToCartId(null);
    },
    onError: () => {
      alert('Failed to add item to cart. Please try again.');
      setAddingToCartId(null);
    }
  });

  const handleAddToCart = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    addToCartMutation.mutate(productId);
  };

  if (error) return <div className="text-center py-24 text-destructive font-bold">Failed to load products.</div>;

  return (
    <div className="container mx-auto px-6 py-16 min-h-screen flex flex-col md:flex-row gap-8">
      
      <div className={`w-full md:w-64 shrink-0 space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div>
          <h3 className="font-bold mb-4 uppercase tracking-wider text-sm border-b border-border pb-2">Search</h3>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-background outline-none focus:border-primary/50 transition-colors" />
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-4 uppercase tracking-wider text-sm border-b border-border pb-2">Categories</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors">
              <input type="radio" name="category" checked={categoryId === ''} onChange={() => setCategoryId('')} className="accent-primary w-4 h-4" />
              All Categories
            </label>
            {categories?.map((cat: any) => (
              <label key={cat.id} className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors">
                <input type="radio" name="category" checked={categoryId === cat.id} onChange={() => setCategoryId(cat.id)} className="accent-primary w-4 h-4" />
                {cat.name}
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-4 uppercase tracking-wider text-sm border-b border-border pb-2">Price Range</h3>
          <div className="flex items-center gap-3">
            <input type="number" placeholder="Min $" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full p-2 border border-border rounded-lg text-sm bg-background outline-none focus:border-primary/50" />
            <span className="text-muted-foreground">-</span>
            <input type="number" placeholder="Max $" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full p-2 border border-border rounded-lg text-sm bg-background outline-none focus:border-primary/50" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shop Collection</h1>
            <p className="text-muted-foreground mt-1 text-sm">Premium goods crafted with precision.</p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse flex-1">
            {[...Array(6)].map((_, i) => <div key={i} className="h-80 bg-secondary rounded-xl"></div>)}
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 flex-1 content-start">
              {data?.data?.map((product: any) => {
                const finalPrice = product.basePrice * (1 - product.discountPercentage / 100);
                return (
                  <Link href={`/shop/${product.id}`} key={product.id} className="group flex flex-col">
                    <div className="relative aspect-[4/5] bg-secondary rounded-xl overflow-hidden mb-4 border border-border shadow-sm">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                      )}
                      {product.discountPercentage > 0 && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                          -{product.discountPercentage}%
                        </span>
                      )}
                      <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold shadow-sm">
                        <Star size={12} className="fill-yellow-500 text-yellow-500" /> {product.averageRating.toFixed(1)}
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-1 tracking-wider uppercase font-medium">{product.categoryName}</p>
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                    
                    <div className="flex items-center justify-between mt-3 border-t border-border pt-3">
                      <div>
                        <span className="font-bold text-lg">${finalPrice.toFixed(2)}</span>
                        {product.discountPercentage > 0 && (
                          <span className="ml-2 text-sm text-muted-foreground line-through">${product.basePrice.toFixed(2)}</span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => handleAddToCart(e, product.id)}
                        disabled={addingToCartId === product.id}
                        className="p-2.5 bg-secondary rounded-full text-foreground hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 shadow-sm"
                        title="Add to Cart"
                      >
                        {addingToCartId === product.id ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>

            {data?.data?.length === 0 && (
              <div className="text-center py-32 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border mt-8">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium text-lg">No products found</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            )}

            {data?.meta && data.meta.totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-16 pt-8 border-t border-border">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-sm font-medium text-muted-foreground">
                  Page <span className="text-foreground">{page}</span> of {data.meta.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
                  disabled={page === data.meta.totalPages}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}