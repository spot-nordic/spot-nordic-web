'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sharedApi } from '@/api/shared';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Globe, CheckCircle, Lock, CreditCard } from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';

declare global {
  interface Window {
    paypal?: any;
  }
}

const PAYPAL_CLIENT_ID = 'Afzq6PY5_A12TIDjyjMKlTqR6P2rVWw0CamLng1tYvCESgEePE3F1QjxGEcTZ3iUgdszGfJEr7a6N3cO';

const CURRENCIES = [
  { code: 'USD', label: '🇺🇸 US Dollar' },
  { code: 'EUR', label: '🇪🇺 Euro' },
  { code: 'GBP', label: '🇬🇧 British Pound' },
  { code: 'SEK', label: '🇸🇪 Swedish Krona' },
];

const COUNTRIES = [
  { code: 'SE', label: 'Sweden' },
  { code: 'DK', label: 'Denmark' },
  { code: 'NO', label: 'Norway' },
  { code: 'FI', label: 'Finland' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
];

function StepBadge({ number }: { number: number }) {
  return (
    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
      {number}
    </div>
  );
}

function CheckoutContent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [paypalReady, setPaypalReady] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingPincode: '',
    shippingCountry: 'SE',
    currency: 'USD',
  });

  // refs so PayPal callbacks always read latest values without stale closures
  const formDataRef = useRef(formData);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  const verifyMutationRef = useRef<any>(null);

  const checkoutMutation = useMutation({
    mutationFn: (data: any) => sharedApi.checkout(data),
  });

  const verifyMutation = useMutation({
    mutationFn: (data: any) => sharedApi.verifyPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setIsSuccess(true);
      setTimeout(() => router.push('/orders'), 2500);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Payment verification failed');
    },
  });

  // keep a stable ref to verifyMutation.mutateAsync
  useEffect(() => {
    verifyMutationRef.current = verifyMutation.mutateAsync;
  }, [verifyMutation.mutateAsync]);

  useEffect(() => {
    if (window.paypal) {
      setPaypalReady(true);
      return;
    }
    const existingScript = document.getElementById('paypal-sdk');
    if (existingScript) {
      existingScript.addEventListener('load', () => setPaypalReady(true));
      return;
    }
    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;
    script.onload = () => setPaypalReady(true);
    script.onerror = () => console.error('Failed to load PayPal SDK');
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!paypalReady || !window.paypal) return;

    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    container.innerHTML = '';

    window.paypal
      .Buttons({
        style: { layout: 'vertical', shape: 'rect', label: 'paypal', height: 46 },

        createOrder: async () => {
          const res = await checkoutMutation.mutateAsync(formDataRef.current);
          console.log('Checkout res:', res);
          // ✅ store orderId on the button container DOM node itself
          // This survives the PayPal popup lifecycle with zero closure issues
          container.dataset.orderId = res.orderId;
          return res.paypalOrderId;
        },

        onApprove: async (data: any) => {
          // ✅ read orderId from the DOM node — always up to date, no closure, no state
          const orderId = container.dataset.orderId;
          console.log('onApprove — paypalOrderId:', data.orderID, 'dbOrderId:', orderId);

          if (!orderId) {
            alert('Order ID missing — please try again');
            return;
          }

          try {
            await verifyMutationRef.current({
              orderId,
              paypalOrderId: data.orderID,
              paymentProvider: 'PAYPAL',
            });
          } catch (err) {
            console.error('Verify failed:', err);
          }
        },

        onError: (err: any) => {
          console.error('PayPal SDK error:', err);
          alert('PayPal payment failed');
        },
      })
      .render('#paypal-button-container');
  }, [paypalReady]);

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-10 text-center shadow-xl">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={44} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-black mb-3">Payment Successful</h1>
          <p className="text-muted-foreground leading-relaxed">
            Your order has been confirmed and payment captured successfully.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold animate-pulse">
            Redirecting to orders...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">

          <div className="bg-card border border-border rounded-2xl shadow-md overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="text-primary" size={22} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">Secure Checkout</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Complete your order via PayPal</p>
              </div>
            </div>

            <div className="p-6 space-y-8">
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <StepBadge number={1} />
                  <h2 className="text-base font-bold">Shipping Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.shippingStreet}
                      onChange={(e) => setFormData({ ...formData, shippingStreet: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary outline-none transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">City</label>
                    <input
                      type="text"
                      required
                      value={formData.shippingCity}
                      onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary outline-none transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">State</label>
                    <input
                      type="text"
                      required
                      value={formData.shippingState}
                      onChange={(e) => setFormData({ ...formData, shippingState: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary outline-none transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={formData.shippingPincode}
                      onChange={(e) => setFormData({ ...formData, shippingPincode: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary outline-none transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">Country</label>
                    <select
                      value={formData.shippingCountry}
                      onChange={(e) => setFormData({ ...formData, shippingCountry: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary outline-none transition-colors text-sm"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <StepBadge number={2} />
                  <h2 className="text-base font-bold">Currency</h2>
                  <Globe className="text-muted-foreground" size={16} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CURRENCIES.map((currency) => (
                    <button
                      type="button"
                      key={currency.code}
                      onClick={() => setFormData({ ...formData, currency: currency.code })}
                      className={`h-14 rounded-xl border text-left px-4 transition-all ${
                        formData.currency === currency.code
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold text-sm">{currency.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{currency.code}</div>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <StepBadge number={3} />
                  <h2 className="text-base font-bold">Payment</h2>
                  <Lock className="text-green-500" size={16} />
                </div>

                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="text-primary" size={20} />
                    <div>
                      <div className="font-bold text-sm">PayPal Checkout</div>
                      <div className="text-xs text-muted-foreground">Secure payment powered by PayPal</div>
                    </div>
                  </div>
                  <div id="paypal-button-container" />
                </div>
              </section>
            </div>
          </div>

          <div className="xl:sticky xl:top-10 space-y-4">
            <div className="bg-card border border-border rounded-2xl shadow-md p-6">
              <h3 className="text-base font-bold mb-4">Why PayPal?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} className="text-green-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Encrypted Transactions</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Payment data is securely encrypted and handled by PayPal.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Lock size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Buyer Protection</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Eligible purchases covered by PayPal Buyer Protection.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-primary/5 border border-primary/10 p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Taxes and currency conversion are calculated automatically based on your shipping country and selected currency.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutContent />
    </AuthGuard>
  );
}