'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicApi } from '@/api/public';
import DOMPurify from 'dompurify';
import Link from 'next/link';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, Eye } from 'lucide-react';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState('');
  const [hasViewed, setHasViewed] = useState(false);

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => publicApi.getBlogBySlug(slug as string)
  });

  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['blogComments', blog?.id],
    queryFn: () => publicApi.getBlogComments(blog.id),
    enabled: !!blog?.id
  });

  const { data: suggestedBlogs } = useQuery({
    queryKey: ['suggestedBlogs', slug],
    queryFn: () => publicApi.getSuggestedBlogs({ current: slug, limit: 3 })
  });

  const interactMutation = useMutation({
    mutationFn: (type: 'LIKE' | 'DISLIKE') => publicApi.interactBlog(blog.id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog', slug] });
    },
    onError: (err: any) => {
      if (err.response?.status === 401) {
        alert('Please sign in or create an account to like or dislike this post.');
      }
    }
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => publicApi.addBlogComment(blog.id, content),
    onSuccess: () => {
      setCommentContent('');
      queryClient.invalidateQueries({ queryKey: ['blogComments', blog?.id] });
    },
    onError: (err: any) => {
      if (err.response?.status === 401) {
        alert('Please sign in or create an account to post a comment.');
      }
    }
  });

  useEffect(() => {
    if (blog?.id && !hasViewed) {
      publicApi.incrementBlogView(blog.id).catch(() => {});
      setHasViewed(true);
    }
  }, [blog?.id, hasViewed]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    commentMutation.mutate(commentContent);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading article...</div>;
  if (error || !blog) return <div className="min-h-screen flex items-center justify-center">Article not found</div>;

  return (
    <article className="min-h-screen pb-24">
      <div className="container mx-auto px-6 pt-12 pb-6">
        <Link href="/blogs" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Journal
        </Link>
      </div>
      
      <header className="max-w-3xl mx-auto px-6 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">{blog.title}</h1>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-muted-foreground text-sm">
          <span>Published on {new Date(blog.publishedAt).toLocaleDateString()} by {blog.authorName}</span>
          <span className="hidden md:inline">•</span>
          <span className="flex items-center gap-1.5"><Eye size={16} /> {blog.viewsCount + (hasViewed ? 1 : 0)} Views</span>
        </div>
      </header>

      {blog.thumbnailUrl && (
        <div className="max-w-5xl mx-auto px-6 mb-16">
          <div className="aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden border border-border shadow-sm">
            <img src={blog.thumbnailUrl} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      <div 
        className="max-w-2xl mx-auto px-6 prose prose-lg dark:prose-invert prose-headings:font-bold prose-a:text-primary mb-12"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.htmlContent) }}
      />

      <div className="max-w-2xl mx-auto px-6 mb-16">
        <div className="flex items-center gap-4 border-t border-b border-border py-4">
          <button 
            onClick={() => interactMutation.mutate('LIKE')}
            disabled={interactMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-muted transition-colors font-medium text-sm"
          >
            <ThumbsUp size={18} /> <span>{blog.likesCount}</span>
          </button>
          <button 
            onClick={() => interactMutation.mutate('DISLIKE')}
            disabled={interactMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-muted transition-colors font-medium text-sm"
          >
            <ThumbsDown size={18} /> <span>{blog.dislikesCount}</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 mb-24">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare size={24} /> Comments ({comments?.length || 0})
        </h3>
        
        <form onSubmit={handleCommentSubmit} className="mb-10">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Share your thoughts... (Must be logged in)"
            className="w-full p-4 bg-background border border-border rounded-xl resize-none min-h-[120px] focus:outline-none focus:border-primary/50 mb-3"
            required
          />
          <button 
            type="submit" 
            disabled={commentMutation.isPending || !commentContent.trim()}
            className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Post Comment
          </button>
        </form>

        <div className="space-y-6">
          {isLoadingComments ? (
            <div className="animate-pulse text-muted-foreground">Loading comments...</div>
          ) : comments?.length > 0 ? (
            comments.map((comment: any) => (
              <div key={comment.id} className="p-4 bg-muted/20 border border-border rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{comment.user.firstName} {comment.user.lastName}</span>
                  <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No comments yet. Be the first to start the conversation!</p>
          )}
        </div>
      </div>

      {suggestedBlogs && suggestedBlogs.length > 0 && (
        <div className="bg-muted/10 border-t border-border py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold tracking-tight mb-8">More to explore</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {suggestedBlogs.map((sBlog: any) => (
                <Link href={`/blogs/${sBlog.slug}`} key={sBlog.id} className="group block">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-secondary mb-4 border border-border">
                    {sBlog.thumbnailUrl && <img src={sBlog.thumbnailUrl} alt={sBlog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                  </div>
                  <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">{sBlog.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye size={14} /> {sBlog.viewsCount}</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={14} /> {sBlog.likesCount}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}