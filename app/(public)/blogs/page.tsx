'use client';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/api/public';
import Link from 'next/link';
import { Eye, ThumbsUp } from 'lucide-react';

export default function BlogsPage() {
  const { data: latestBlogs, isLoading: isLoadingLatest } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => publicApi.getBlogs()
  });

  const { data: trendingBlogs, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['trendingBlogs'],
    queryFn: () => publicApi.getTrendingBlogs({ limit: 4 })
  });

  if (isLoadingLatest || isLoadingTrending) return <div className="min-h-screen flex items-center justify-center">Loading journal...</div>;

  return (
    <div className="min-h-screen pb-24">
      <div className="bg-muted/10 py-16 mb-12 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">Spot Nordic Journal</h1>
            <p className="text-lg text-muted-foreground">Insights, stories, and news from the Nordic design ecosystem.</p>
          </div>

          {trendingBlogs && trendingBlogs.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-6 border-b border-border pb-2 inline-block">Trending Now</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingBlogs.map((blog: any) => (
                  <Link href={`/blogs/${blog.slug}`} key={blog.id} className="group block">
                    <div className="aspect-video rounded-xl overflow-hidden bg-secondary mb-4 border border-border">
                      {blog.thumbnailUrl && <img src={blog.thumbnailUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                    </div>
                    <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">{blog.title}</h3>
                    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye size={14} /> {blog.viewsCount}</span>
                      <span className="flex items-center gap-1"><ThumbsUp size={14} /> {blog.likesCount}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold tracking-tight mb-8">Latest Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {latestBlogs?.data?.map((blog: any) => (
            <Link href={`/blogs/${blog.slug}`} key={blog.id} className="group block">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-secondary mb-6 border border-border relative">
                {blog.thumbnailUrl && <img src={blog.thumbnailUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center gap-3 text-xs font-bold text-foreground shadow-sm">
                  <span className="flex items-center gap-1"><Eye size={14} className="text-muted-foreground" /> {blog.viewsCount}</span>
                  <span className="flex items-center gap-1"><ThumbsUp size={14} className="text-muted-foreground" /> {blog.likesCount}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{new Date(blog.publishedAt).toLocaleDateString()} • By {blog.authorName}</p>
              <h2 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">{blog.title}</h2>
            </Link>
          ))}
        </div>
        
        {latestBlogs?.data?.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No journal posts published yet.
          </div>
        )}
      </div>
    </div>
  );
}