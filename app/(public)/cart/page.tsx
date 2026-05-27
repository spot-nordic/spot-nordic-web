'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharedApi } from '@/api/shared';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';

function CartContent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: sharedApi.getCart,
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      sharedApi.updateCartItem(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => sharedApi.removeFromCart(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-pulse text-xl font-medium">
        Loading cart...
      </div>
    );
  }

  if (error || !data || data.items?.length === 0) {
    return (
      <div className="container mx-auto px-6 py-32 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <ShoppingBag size={64} className="text-muted mb-6" />
        <h2 className="text-3xl font-bold tracking-tight mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          href="/shop"
          className="bg-primary text-white px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const subtotal = data.items.reduce((acc: number, item: any) => {
    const finalPrice = item.basePrice * (1 - item.discountPercentage / 100);
    return acc + finalPrice * item.quantity;
  }, 0);

  return (
    <div className="container mx-auto px-6 py-16 min-h-screen">
      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-12">
        Shopping Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-2/3 space-y-6">
          {data.items.map((item: any) => {
            const finalPrice =
              item.basePrice * (1 - item.discountPercentage / 100);

            return (
              <div
                key={item.id}
                className="flex gap-6 p-6 bg-card border border-border rounded-xl shadow-sm"
              >
                <div className="w-24 h-24 bg-secondary rounded-lg overflow-hidden shrink-0 border border-border">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      No Img
                    </div>
                  )}
                </div>

                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        <Link
                          href={`/shop/${item.productId}`}
                          className="hover:text-primary transition-colors"
                        >
                          {item.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.sku}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-lg">
                        ${finalPrice.toFixed(2)}
                      </span>

                      {item.discountPercentage > 0 && (
                        <div className="text-sm text-muted-foreground line-through">
                          ${item.basePrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center border border-border rounded bg-background">
                      <button
                        onClick={() =>
                          updateQuantityMutation.mutate({
                            itemId: item.id,
                            quantity: item.quantity - 1,
                          })
                        }
                        className="px-3 py-1 hover:bg-secondary transition-colors"
                        disabled={
                          item.quantity <= 1 ||
                          updateQuantityMutation.isPending
                        }
                      >
                        -
                      </button>

                      <span className="w-10 text-center text-sm font-medium">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantityMutation.mutate({
                            itemId: item.id,
                            quantity: item.quantity + 1,
                          })
                        }
                        className="px-3 py-1 hover:bg-secondary transition-colors"
                        disabled={
                          item.quantity >= item.stock ||
                          updateQuantityMutation.isPending
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItemMutation.mutate(item.id)}
                      className="text-destructive hover:bg-destructive/10 p-2 rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-card border border-border rounded-xl p-8 sticky top-24 shadow-sm">
            <h3 className="font-bold text-xl mb-6 border-b border-border pb-4">
              Order Summary
            </h3>

            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Shipping & Taxes</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-8 flex justify-between items-center">
              <span className="font-bold text-lg">Estimated Total</span>
              <span className="font-bold text-2xl text-primary">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-primary text-white py-4 rounded-md font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <AuthGuard>
      <CartContent />
    </AuthGuard>
  );
}