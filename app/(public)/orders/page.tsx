'use client';

import { useQuery } from '@tanstack/react-query';
import { sharedApi } from '@/api/shared';
import Link from 'next/link';
import { Package, ArrowLeft, Download } from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';

function OrdersContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => sharedApi.getOrders(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-pulse text-xl">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16 min-h-screen max-w-5xl">
      <Link
        href="/account"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to Account
      </Link>

      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-10">
        Order History
      </h1>

      {!data?.data || data.data.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />

          <h2 className="text-xl font-semibold mb-2">No orders found</h2>

          <p className="text-muted-foreground mb-6">
            You haven't placed any orders yet.
          </p>

          <Link
            href="/shop"
            className="bg-primary text-white px-6 py-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {data.data.map((order: any) => (
            <div
              key={order.id}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
            >
              <div className="bg-secondary/50 p-4 px-6 border-b border-border flex flex-wrap justify-between items-center gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground font-medium uppercase text-[10px] mb-1">
                    Order Placed
                  </p>

                  <p className="font-semibold">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground font-medium uppercase text-[10px] mb-1">
                    Total
                  </p>

                  <p className="font-semibold">
                    {order.totalAmount.toFixed(2)}{' '}
                    <span className="text-[10px]">{order.currency}</span>
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground font-medium uppercase text-[10px] mb-1">
                    Status
                  </p>

                  <span
                    className={`font-bold px-2 py-0.5 rounded text-xs ${
                      order.status === 'DELIVERED'
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {order.invoiceUrl && (
                  <div>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] mb-1">
                      Invoice
                    </p>

                    <a
                      href={order.invoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                    >
                      <Download size={14} /> Download
                    </a>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-secondary rounded border border-border overflow-hidden shrink-0">
                        {item.images?.[0] && (
                          <img
                            src={item.images[0]}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-grow">
                        <Link
                          href={`/shop/${item.productId}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {item.productName}
                        </Link>

                        <p className="text-xs text-muted-foreground mt-1">
                          Qty: {item.quantity} • SKU: {item.productSku}
                        </p>
                      </div>

                      <div className="font-medium text-right flex flex-col">
                        <span>
                          {(item.price * item.quantity).toFixed(2)}{' '}
                          <span className="text-[10px] text-muted-foreground">
                            {order.currency}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersContent />
    </AuthGuard>
  );
}