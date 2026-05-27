'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicApi } from '@/api/public';
import { sharedApi } from '@/api/shared';
import { useState } from 'react';
import {
  ShoppingCart,
  ArrowLeft,
  Check,
  Star,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => publicApi.getProductDetails(id as string)
  });

  const { data: reviews, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['productReviews', id],
    queryFn: () => publicApi.getProductReviews(id as string)
  });

  const { data: suggestedProducts } = useQuery({
    queryKey: ['suggestedProducts', id],
    queryFn: () =>
      publicApi.getSuggestedProducts(id as string, { limit: 4 })
  });

  const addToCartMutation = useMutation({
    mutationFn: () =>
      sharedApi.addToCart({
        productId: id as string,
        quantity
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cart']
      });

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 3000);
    }
  });

  const addReviewMutation = useMutation({
    mutationFn: (data: { rating: number; comment: string }) =>
      publicApi.addProductReview(id as string, data),
    onSuccess: () => {
      setComment('');

      queryClient.invalidateQueries({
        queryKey: ['productReviews', id]
      });

      queryClient.invalidateQueries({
        queryKey: ['product', id]
      });
    },
    onError: () => alert('Failed to submit review.')
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    addToCartMutation.mutate();
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    addReviewMutation.mutate({
      rating,
      comment
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center animate-pulse text-lg sm:text-xl">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-destructive font-bold text-lg sm:text-xl px-6 text-center">
        Product not found.
      </div>
    );
  }

  const finalPrice =
    product.basePrice *
    (1 - product.discountPercentage / 100);

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <Link
          href="/shop"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 sm:mb-10 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 mb-20 lg:mb-28">
          <div className="w-full">
            <div className="relative aspect-square bg-secondary rounded-2xl overflow-hidden border border-border shadow-sm">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  No image available
                </div>
              )}

              {product.discountPercentage > 0 && (
                <span className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-red-500 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
                  -{product.discountPercentage}%
                </span>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col justify-center">
            <p className="text-xs sm:text-sm font-bold text-primary mb-2 uppercase tracking-[0.2em]">
              {product.categoryName}
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight break-words">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
              <div className="flex items-center text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={
                      i < Math.round(product.averageRating)
                        ? 'fill-yellow-500'
                        : 'text-muted-foreground/30'
                    }
                  />
                ))}
              </div>

              <span className="text-sm font-medium text-muted-foreground">
                {product.averageRating.toFixed(1)} (
                {product.totalReviews} reviews)
              </span>
            </div>

            <div className="flex flex-wrap items-end gap-3 sm:gap-4 mb-8 border-b border-border pb-8">
              <span className="text-4xl sm:text-5xl font-bold text-foreground">
                ${finalPrice.toFixed(2)}
              </span>

              {product.discountPercentage > 0 && (
                <span className="text-xl sm:text-2xl text-muted-foreground line-through mb-1">
                  ${product.basePrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-muted-foreground leading-8 mb-10 text-base sm:text-lg break-words">
              {product.description}
            </p>

            <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-5">
                <p className="text-sm sm:text-base font-medium">
                  Availability:
                </p>

                <span
                  className={`text-sm sm:text-lg font-bold ${
                    product.stock > 0
                      ? 'text-green-600'
                      : 'text-destructive'
                  }`}
                >
                  {product.stock > 0
                    ? `In Stock (${product.stock})`
                    : 'Out of Stock'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex items-center border border-border rounded-xl overflow-hidden bg-background h-14 w-full sm:w-[180px] shrink-0">
                  <button
                    onClick={() =>
                      setQuantity(Math.max(1, quantity - 1))
                    }
                    className="flex-1 h-full text-xl hover:bg-secondary transition-colors"
                    disabled={product.stock === 0}
                  >
                    -
                  </button>

                  <span className="w-16 text-center font-bold text-lg">
                    {quantity}
                  </span>

                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(product.stock, quantity + 1)
                      )
                    }
                    className="flex-1 h-full text-xl hover:bg-secondary transition-colors"
                    disabled={product.stock === 0}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={
                    product.stock === 0 ||
                    addToCartMutation.isPending ||
                    added
                  }
                  className={`w-full sm:flex-1 h-14 flex items-center justify-center gap-3 rounded-xl font-bold text-base sm:text-lg transition-all shadow-sm ${
                    added
                      ? 'bg-green-600 text-white'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  } disabled:opacity-70`}
                >
                  {added ? (
                    <>
                      <Check size={22} />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={22} />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-5xl mx-auto border-t border-border pt-14 sm:pt-16 mb-20 lg:mb-28">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 flex items-center gap-3">
            <MessageSquare size={28} />
            Customer Reviews
          </h2>

          <form
            onSubmit={handleReviewSubmit}
            className="bg-muted/10 p-4 sm:p-6 rounded-2xl border border-border mb-10 sm:mb-12 shadow-sm"
          >
            <h3 className="font-bold text-lg mb-4">
              Write a Review
            </h3>

            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-sm font-medium mr-2">
                Your Rating:
              </span>

              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={24}
                    className={`${
                      star <= rating
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-muted-foreground/30 hover:text-yellow-500/50'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
              placeholder={
                isAuthenticated
                  ? 'What did you like or dislike?'
                  : 'Please log in to write a review'
              }
              disabled={!isAuthenticated}
              className="w-full p-4 bg-background border border-border rounded-xl resize-none min-h-[120px] mb-4 focus:outline-none focus:border-primary/50 disabled:opacity-50 text-sm sm:text-base"
              required
            />

            <button
              type="submit"
              disabled={
                addReviewMutation.isPending ||
                !isAuthenticated
              }
              className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isAuthenticated
                ? 'Submit Review'
                : 'Log in to Review'}
            </button>
          </form>

          <div className="space-y-5 sm:space-y-6">
            {isReviewsLoading ? (
              <div className="animate-pulse text-muted-foreground">
                Loading reviews...
              </div>
            ) : reviews?.length > 0 ? (
              reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="p-4 sm:p-6 bg-card border border-border rounded-2xl shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground text-sm uppercase shrink-0">
                        {review.userName?.[0] || 'U'}
                      </div>

                      <div>
                        <p className="font-semibold text-sm">
                          {review.userName ||
                            'Verified Buyer'}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {new Date(
                            review.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < review.rating
                              ? 'fill-yellow-500'
                              : 'text-muted-foreground/30'
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-foreground/90 mt-2 text-sm sm:text-base leading-7 break-words">
                    {review.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl text-muted-foreground text-sm sm:text-base">
                No reviews yet. Be the first to review
                this product!
              </div>
            )}
          </div>
        </div>

        {suggestedProducts &&
          suggestedProducts.length > 0 && (
            <div className="border-t border-border pt-14 sm:pt-16">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8 sm:mb-10">
                You might also like
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
                {suggestedProducts.map((p: any) => {
                  const sFinalPrice =
                    p.basePrice *
                    (1 - p.discountPercentage / 100);

                  return (
                    <Link
                      href={`/shop/${p.id}`}
                      key={p.id}
                      className="group flex flex-col"
                    >
                      <div className="relative aspect-square bg-secondary rounded-2xl overflow-hidden mb-4 border border-border">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : null}

                        {p.discountPercentage > 0 && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            -{p.discountPercentage}%
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {p.name}
                      </h3>

                      <div className="flex items-center gap-1 mt-1 text-yellow-500">
                        <Star
                          size={12}
                          className="fill-yellow-500"
                        />

                        <span className="text-xs font-medium text-muted-foreground">
                          {p.averageRating.toFixed(1)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center flex-wrap gap-2">
                        <span className="font-bold text-base sm:text-lg">
                          ${sFinalPrice.toFixed(2)}
                        </span>

                        {p.discountPercentage > 0 && (
                          <span className="text-xs sm:text-sm text-muted-foreground line-through">
                            ${p.basePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}