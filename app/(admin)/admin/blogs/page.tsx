'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { Trash2, Edit, Plus, X, Image as ImageIcon, Eye, Code, MessageSquare, ThumbsUp, ThumbsDown, Eye as EyeIcon } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface Blog {
  id: string;
  title: string;
  slug: string;
  htmlContent: string;
  thumbnailUrl: string;
  authorId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  viewsCount: number;
  likesCount: number;
  dislikesCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BlogComment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface PaginatedBlogsResponse {
  data: Blog[];
  meta: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export default function AdminBlogs() {
  const queryClient = useQueryClient();
  const { resolvedTheme } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState<boolean>(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [selectedBlogForComments, setSelectedBlogForComments] = useState<Blog | null>(null);
  const [editorMode, setEditorMode] = useState<'WRITE' | 'PREVIEW'>('WRITE');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    htmlContent: '',
    status: 'DRAFT'
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PaginatedBlogsResponse>({
    queryKey: ['adminBlogs'],
    queryFn: () => adminApi.getBlogs({ limit: 50 })
  });

  const { data: commentsData, isLoading: isLoadingComments } = useQuery<BlogComment[]>({
    queryKey: ['adminBlogComments', selectedBlogForComments?.id],
    queryFn: () => adminApi.getBlogComments(selectedBlogForComments!.id),
    enabled: !!selectedBlogForComments
  });

  const createMutation = useMutation({
    mutationFn: (payload: FormData) => adminApi.createBlog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBlogs'] });
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) => adminApi.updateBlog(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBlogs'] });
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteBlog(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminBlogs'] })
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => adminApi.deleteBlogComment(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminBlogComments', selectedBlogForComments?.id] })
  });

  const openModal = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title,
        slug: blog.slug,
        htmlContent: blog.htmlContent,
        status: blog.status
      });
      setPreviewUrl(blog.thumbnailUrl);
    } else {
      setEditingBlog(null);
      setFormData({
        title: '',
        slug: '',
        htmlContent: '',
        status: 'DRAFT'
      });
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setEditorMode('WRITE');
    setIsModalOpen(true);
  };

  const openCommentsModal = (blog: Blog) => {
    setSelectedBlogForComments(blog);
    setIsCommentsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
    setSelectedFile(null);
    if (previewUrl && !editingBlog?.thumbnailUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const closeCommentsModal = () => {
    setIsCommentsModalOpen(false);
    setSelectedBlogForComments(null);
  };

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setFormData((prev) => ({ ...prev, title, slug }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (editingBlog?.thumbnailUrl) {
      setPreviewUrl(editingBlog.thumbnailUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    
    payload.append('title', formData.title);
    payload.append('slug', formData.slug);
    payload.append('htmlContent', formData.htmlContent);
    payload.append('status', formData.status);
    
    if (selectedFile) {
      payload.append('thumbnail', selectedFile);
    }

    if (editingBlog) {
      updateMutation.mutate({ id: editingBlog.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading blogs...</div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Blog Management</h2>
        <button 
          onClick={() => openModal()} 
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-all"
        >
          <Plus size={16} /> Create Post
        </button>
      </div>
      
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-border bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Post</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Stats</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.data?.map((blog: Blog) => (
                <tr key={blog.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-12 h-8 rounded bg-secondary overflow-hidden shrink-0 border border-border">
                      {blog.thumbnailUrl ? (
                        <img src={blog.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Img</div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium truncate max-w-[200px]">{blog.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px] font-mono">{blog.slug}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${blog.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5" title="Views"><EyeIcon size={14} /> {blog.viewsCount}</div>
                      <div className="flex items-center gap-1.5 text-green-600/70" title="Likes"><ThumbsUp size={14} /> {blog.likesCount}</div>
                      <div className="flex items-center gap-1.5 text-red-600/70" title="Dislikes"><ThumbsDown size={14} /> {blog.dislikesCount}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(blog.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button 
                      onClick={() => openCommentsModal(blog)} 
                      className="p-2 text-blue-600 hover:bg-blue-600/10 transition-colors rounded"
                      title="Manage Comments"
                    >
                      <MessageSquare size={16} />
                    </button>
                    <button 
                      onClick={() => openModal(blog)} 
                      className="p-2 text-foreground hover:bg-secondary transition-colors rounded"
                      title="Edit Blog"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => { if (window.confirm('Delete blog post?')) deleteMutation.mutate(blog.id); }}
                      className="p-2 text-destructive hover:bg-destructive/10 transition-colors rounded"
                      title="Delete Blog"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {data?.data?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No blog posts found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-6xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20 shrink-0">
              <h2 className="text-xl font-bold">{editingBlog ? 'Edit Post' : 'Create New Post'}</h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Post Title</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50" 
                        value={formData.title} 
                        onChange={e => handleTitleChange(e.target.value)} 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">URL Slug</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50 font-mono text-sm" 
                        value={formData.slug} 
                        onChange={e => setFormData({...formData, slug: e.target.value})} 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Publication Status</label>
                      <select 
                        required 
                        className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50" 
                        value={formData.status} 
                        onChange={e => setFormData({...formData, status: e.target.value as Blog['status']})}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Cover Thumbnail</label>
                    <div className="border border-border rounded-xl p-4 bg-muted/10 h-[calc(100%-1.5rem)] flex flex-col justify-center items-center relative overflow-hidden">
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                          <div className="relative z-10 bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-border shadow-sm flex flex-col items-center">
                            <img src={previewUrl} alt="" className="w-48 h-28 object-cover rounded shadow-sm border border-border mb-3" />
                            <div className="flex gap-2">
                              <label className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded cursor-pointer hover:bg-primary/90 transition-colors">
                                Change Image
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                              </label>
                              <button 
                                type="button" 
                                onClick={clearSelectedFile}
                                className="px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-medium rounded hover:bg-destructive/90 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <label className="w-full h-full min-h-[160px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all">
                          <ImageIcon size={32} className="text-muted-foreground mb-2" />
                          <span className="text-sm font-semibold text-muted-foreground">Upload Thumbnail File</span>
                          <span className="text-xs text-muted-foreground/70 mt-1">JPEG, PNG or WEBP</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} required={!editingBlog} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col border border-border rounded-xl overflow-hidden bg-background">
                  <div className="bg-muted/40 px-4 py-2 border-b border-border flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Code size={13} /> HTML Content Editor
                    </span>
                    <div className="flex bg-card border border-border rounded-md p-0.5">
                      <button
                        type="button"
                        onClick={() => setEditorMode('WRITE')}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-sm transition-all ${
                          editorMode === 'WRITE' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Code View
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode('PREVIEW')}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-sm transition-all ${
                          editorMode === 'PREVIEW' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Eye size={12} /> Render Preview
                      </button>
                    </div>
                  </div>

                  {editorMode === 'WRITE' ? (
                    <div className="w-full h-[500px] relative pt-2">
                      <Editor
                        height="100%"
                        defaultLanguage="html"
                        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
                        value={formData.htmlContent}
                        onChange={(value) => setFormData({...formData, htmlContent: value || ''})}
                        loading={
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground animate-pulse">
                            Loading Editor Engine...
                          </div>
                        }
                        options={{
                          minimap: { enabled: false },
                          wordWrap: 'on',
                          formatOnPaste: true,
                          formatOnType: true,
                          autoIndent: "full",
                          fontSize: 14,
                          scrollBeyondLastLine: false,
                          padding: { top: 8, bottom: 8 }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-6 bg-card h-[500px] overflow-y-auto">
                      {formData.htmlContent ? (
                        <article 
                          className="prose prose-slate dark:prose-invert max-w-none 
                            prose-headings:font-bold prose-h2:text-2xl prose-h2:border-b prose-h2:pb-2 prose-h3:text-xl
                            prose-p:text-muted-foreground prose-p:text-base prose-p:leading-relaxed
                            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                            prose-img:max-h-96 prose-img:w-full prose-img:object-cover prose-img:rounded-xl prose-img:border"
                          dangerouslySetInnerHTML={{ __html: formData.htmlContent }}
                        />
                      ) : (
                        <p className="text-sm italic text-muted-foreground text-center pt-12">No HTML content provided to preview.</p>
                      )}
                    </div>
                  )}
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20 shrink-0">
              <button 
                type="button" 
                onClick={closeModal} 
                className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="blog-form" 
                disabled={createMutation.isPending || updateMutation.isPending} 
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/95 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {editingBlog ? 'Save Changes' : 'Publish Blog'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCommentsModalOpen && selectedBlogForComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-3xl rounded-xl shadow-xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20 shrink-0">
              <div>
                <h2 className="text-xl font-bold">Manage Comments</h2>
                <p className="text-sm text-muted-foreground mt-1">Blog: <span className="font-semibold text-foreground">{selectedBlogForComments.title}</span></p>
              </div>
              <button onClick={closeCommentsModal} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-muted/5">
              {isLoadingComments ? (
                <div className="text-center text-sm text-muted-foreground animate-pulse py-8">Loading comments...</div>
              ) : commentsData && commentsData.length > 0 ? (
                <div className="space-y-4">
                  {commentsData.map((comment) => (
                    <div key={comment.id} className="bg-background border border-border p-4 rounded-xl flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{comment.user.firstName} {comment.user.lastName}</span>
                          <span className="text-xs text-muted-foreground">{comment.user.email} • {new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <button 
                          onClick={() => { if (window.confirm('Delete this comment?')) deleteCommentMutation.mutate(comment.id); }}
                          className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors"
                          title="Delete Comment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
                  <p>No comments on this post yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}