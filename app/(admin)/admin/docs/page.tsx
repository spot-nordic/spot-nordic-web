'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { Trash2, Edit3, Plus, Folder, FileText, ChevronDown, ChevronRight, Save, Eye, Code, UploadCloud, Copy, Check, Info, FileDown, Layers } from 'lucide-react';
import Editor from '@monaco-editor/react'; // Added import
import { useTheme } from 'next-themes';
interface DocNode {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  isGroup: boolean;
  sortOrder: number;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  htmlContent: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DocAsset {
  id: string;
  nodeId: string | null;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export default function AdminDocsWorkspace() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [selectedNode, setSelectedNode] = useState<DocNode | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createType, setCreateType] = useState<'GROUP' | 'DOCUMENT'>('DOCUMENT');
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'WRITE' | 'PREVIEW'>('WRITE');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [copiedAssetId, setCopiedAssetId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [formState, setFormState] = useState({
    title: '',
    slug: '',
    parentId: '',
    isGroup: false,
    sortOrder: 0,
    status: 'DRAFT',
    htmlContent: '',
    metaTitle: '',
    metaDescription: ''
  });

  const { data: nodes, isLoading } = useQuery<DocNode[]>({
    queryKey: ['adminDocsTree'],
    queryFn: adminApi.getDocs
  });

  const { data: fullDocDetails, isFetching: isFetchingDoc } = useQuery<DocNode>({
    queryKey: ['adminDocDetails', selectedNode?.id],
    queryFn: () => adminApi.getDocNode(selectedNode!.id),
    enabled: !!selectedNode?.id
  });

  const { data: assets, refetch: refetchAssets } = useQuery<DocAsset[]>({
    queryKey: ['nodeAssets', selectedNode?.id],
    queryFn: () => adminApi.getDocAssets(selectedNode!.id),
    enabled: !!selectedNode?.id && !selectedNode.isGroup
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createDocNode(data),
    onSuccess: (newNode) => {
      queryClient.invalidateQueries({ queryKey: ['adminDocsTree'] });
      setIsCreating(false);
      setSelectedNode(newNode);
      setIsEditing(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateDocNode(id, data),
    onSuccess: (updatedNode) => {
      queryClient.invalidateQueries({ queryKey: ['adminDocsTree'] });
      queryClient.invalidateQueries({ queryKey: ['adminDocDetails', updatedNode.id] });
      setSelectedNode(updatedNode);
      setIsEditing(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteDocNode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDocsTree'] });
      setSelectedNode(null);
      setIsEditing(false);
      setIsCreating(false);
    }
  });

  const uploadAssetMutation = useMutation({
    mutationFn: (formData: FormData) => adminApi.uploadDocAsset(formData),
    onSuccess: () => {
      refetchAssets();
      setIsUploading(false);
    },
    onError: () => setIsUploading(false)
  });

  useEffect(() => {
    if (selectedNode) {
      setFormState({
        title: selectedNode.title,
        slug: selectedNode.slug,
        parentId: selectedNode.parentId || '',
        isGroup: selectedNode.isGroup,
        sortOrder: selectedNode.sortOrder,
        status: selectedNode.status,
        htmlContent: fullDocDetails?.htmlContent || '',
        metaTitle: fullDocDetails?.metaTitle || '',
        metaDescription: fullDocDetails?.metaDescription || ''
      });
      setIsCreating(false);
      setIsEditing(false);
    }
  }, [selectedNode, fullDocDetails]);

  const handleTitleChange = (val: string) => {
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    setFormState(prev => ({
      ...prev,
      title: val,
      slug: isCreating || isEditing ? generatedSlug : prev.slug
    }));
  };

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const startCreation = (type: 'GROUP' | 'DOCUMENT', parentId: string | null = null) => {
    setCreateType(type);
    setCreateParentId(parentId);
    setSelectedNode(null);
    setFormState({
      title: '',
      slug: '',
      parentId: parentId || '',
      isGroup: type === 'GROUP',
      sortOrder: nodes ? nodes.filter(n => n.parentId === parentId).length + 1 : 1,
      status: 'DRAFT',
      htmlContent: '',
      metaTitle: '',
      metaDescription: ''
    });
    setIsCreating(true);
    setIsEditing(true);
    setEditorMode('WRITE');
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formState,
      parentId: formState.parentId === '' ? null : formState.parentId,
    };

    if (isCreating) {
      createMutation.mutate(payload);
    } else if (selectedNode) {
      updateMutation.mutate({ id: selectedNode.id, data: payload });
    }
  };

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedNode) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('nodeId', selectedNode.id);
    uploadAssetMutation.mutate(formData);
  };

  const executeCopyAction = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedAssetId(id);
    setTimeout(() => setCopiedAssetId(null), 2000);
  };

  if (isLoading) return (
    <div className="w-full h-[70vh] flex items-center justify-center text-muted-foreground animate-pulse">
      Initialising Spotmatching Documentation Engine Workspace...
    </div>
  );

  const rootGroups = nodes?.filter(n => n.isGroup && !n.parentId) || [];
  const orphanDocs = nodes?.filter(n => !n.isGroup && !n.parentId) || [];

  return (
    <div className="h-[calc(100vh-7rem)] flex border border-border rounded-xl overflow-hidden bg-card shadow-sm">

      <aside className="w-80 border-r border-border flex flex-col bg-muted/30">
        <div className="p-4 border-b border-border bg-card flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers size={14} /> Structure Explorer
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => startCreation('GROUP', null)}
              className="flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground px-2 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-secondary/80 transition-all"
            >
              <Plus size={12} /> New Category
            </button>
            <button
              onClick={() => startCreation('DOCUMENT', null)}
              className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-2 py-1.5 text-xs font-semibold rounded-md shadow-sm hover:bg-primary/95 transition-all"
            >
              <Plus size={12} /> Root Doc
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">

          <div className="space-y-1">
            {rootGroups.map(group => {
              const isOpen = !!expandedGroups[group.id];
              const isSelected = selectedNode?.id === group.id;
              const children = nodes?.filter(n => n.parentId === group.id) || [];

              return (
                <div key={group.id} className="space-y-0.5">
                  <div
                    className={`group/item flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground/80'
                      }`}
                    onClick={() => setSelectedNode(group)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleGroup(group.id); }}
                        className="p-0.5 text-muted-foreground hover:text-foreground rounded"
                      >
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      <Folder size={16} className={isSelected ? "text-primary" : "text-blue-500/80"} />
                      <span className="truncate pr-2">{group.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); startCreation('DOCUMENT', group.id); }}
                      className="opacity-0 group-hover/item:opacity-100 p-1 text-muted-foreground hover:text-primary rounded transition-all"
                      title="Add doc inside category"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="pl-6 border-l border-border/60 ml-3.5 space-y-0.5 mt-0.5">
                      {children.map(child => {
                        const isChildSelected = selectedNode?.id === child.id;
                        return (
                          <div
                            key={child.id}
                            onClick={() => setSelectedNode(child)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${isChildSelected ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                              }`}
                          >
                            <FileText size={14} className={isChildSelected ? "text-primary" : "text-muted-foreground/70"} />
                            <span className="truncate">{child.title}</span>
                            {child.status === 'DRAFT' && (
                              <span className="ml-auto text-[10px] bg-amber-500/10 text-amber-600 px-1 rounded font-normal">Draft</span>
                            )}
                          </div>
                        );
                      })}
                      {children.length === 0 && (
                        <p className="text-[11px] text-muted-foreground/60 italic py-1 pl-3">Empty category</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {orphanDocs.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-border/40">
              <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1">Standalone Pages</h4>
              {orphanDocs.map(doc => {
                const isSelected = selectedNode?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedNode(doc)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-all ${isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground/80'
                      }`}
                  >
                    <FileText size={16} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                    <span className="truncate">{doc.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col bg-card overflow-hidden relative">
        {selectedNode || isCreating ? (
          <form onSubmit={handleSaveSubmit} className="flex-1 flex flex-col overflow-hidden relative">

            {isFetchingDoc && selectedNode && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground animate-pulse">Loading content details...</span>
              </div>
            )}

            <div className="px-6 py-4 border-b border-border bg-muted/10 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${formState.isGroup ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'
                    }`}>
                    {formState.isGroup ? 'Category Node' : 'Article Page'}
                  </span>
                  {createParentId && (
                    <span className="text-xs text-muted-foreground italic">Nested inside subgroup</span>
                  )}
                </div>
                <h3 className="text-lg font-bold tracking-tight text-foreground mt-0.5">
                  {isCreating ? `Creating Entry` : `Reviewing Configuration`}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {!isEditing && !isCreating ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border px-3 py-1.5 text-sm font-semibold rounded-lg transition-all"
                    >
                      <Edit3 size={14} /> Refactor Values
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (confirm('Delete document? This cascades through groups.')) deleteMutation.mutate(selectedNode!.id); }}
                      className="flex items-center gap-1.5 text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 px-3 py-1.5 text-sm font-medium rounded-lg transition-all"
                    >
                      <Trash2 size={14} /> Remove Page
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (isCreating) setIsCreating(false);
                        setIsEditing(false);
                        if (!selectedNode && nodes && nodes.length > 0) setSelectedNode(nodes[0]);
                      }}
                      className="bg-secondary text-secondary-foreground border border-border px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-secondary/80 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 bg-primary text-primary-foreground shadow-sm px-4 py-1.5 text-sm font-semibold rounded-lg hover:bg-primary/95 transition-all"
                    >
                      <Save size={14} /> Commit Changes
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Layout fixed: Changed space-y-6 to flex flex-col gap-6 to allow child expansion */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

                <div className="grid grid-cols-2 gap-4 shrink-0">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">System Title</label>
                    <input
                      type="text"
                      required
                      disabled={!isEditing}
                      className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-sm transition-all disabled:opacity-60"
                      value={formState.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">URL Route Slug</label>
                    <input
                      type="text"
                      required
                      disabled={!isEditing}
                      className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-sm font-mono transition-all disabled:opacity-60"
                      value={formState.slug}
                      onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 shrink-0">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Parent Hierarchy</label>
                    <select
                      disabled={!isEditing}
                      className="w-full p-2.5 bg-background border border-border rounded-lg outline-none text-sm disabled:opacity-60"
                      value={formState.parentId}
                      onChange={(e) => setFormState({ ...formState, parentId: e.target.value })}
                    >
                      <option value="">Root Level Content</option>
                      {nodes?.filter(n => n.isGroup).map(g => (
                        <option key={g.id} value={g.id} disabled={g.id === selectedNode?.id}>{g.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Display Sort Order</label>
                    <input
                      type="number"
                      required
                      disabled={!isEditing}
                      className="w-full p-2.5 bg-background border border-border rounded-lg outline-none text-sm transition-all disabled:opacity-60"
                      value={formState.sortOrder}
                      onChange={(e) => setFormState({ ...formState, sortOrder: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Publication Lifecycle</label>
                    <select
                      disabled={!isEditing}
                      className="w-full p-2.5 bg-background border border-border rounded-lg outline-none text-sm disabled:opacity-60"
                      value={formState.status}
                      onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                    >
                      <option value="DRAFT">Draft Checklist</option>
                      <option value="PUBLISHED">Live Public</option>
                      <option value="ARCHIVED">Internal Vault Only</option>
                    </select>
                  </div>
                </div>

                {!formState.isGroup && (
                  /* Editor fixed: Added flex-1 and min-h-[500px] */
                  <div className="flex flex-col flex-1 min-h-[500px] border border-border rounded-xl overflow-hidden bg-background">
                    <div className="bg-muted/40 px-4 py-2 border-b border-border flex items-center justify-between shrink-0">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Code size={13} /> Article Engine Block
                      </span>
                      <div className="flex bg-card border border-border rounded-md p-0.5">
                        <button
                          type="button"
                          onClick={() => setEditorMode('WRITE')}
                          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-sm transition-all ${editorMode === 'WRITE' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                          Code View
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorMode('PREVIEW')}
                          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-sm transition-all ${editorMode === 'PREVIEW' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                          <Eye size={12} /> Render Sandbox
                        </button>
                      </div>
                    </div>

                    {editorMode === 'WRITE' ? (
                      <div className="flex-1 w-full relative pt-2">
                        <Editor
                          height="100%"
                          defaultLanguage="html"
                          theme={theme === 'dark' ? 'vs-dark' : 'light'}
                          value={formState.htmlContent}
                          onChange={(value) => setFormState({ ...formState, htmlContent: value || '' })}
                          options={{
                            readOnly: !isEditing,
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
                      <div className="p-6 bg-card flex-1 overflow-y-auto">
                        {formState.htmlContent ? (
                          <article
                            className="prose prose-slate dark:prose-invert max-w-none 
                              prose-headings:font-bold prose-h2:text-xl prose-h2:border-b prose-h2:pb-1 prose-h3:text-lg
                              prose-p:text-muted-foreground prose-p:text-sm prose-p:leading-relaxed
                              prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                              prose-img:max-h-48 prose-img:object-contain prose-img:rounded-md prose-img:border"
                            dangerouslySetInnerHTML={{ __html: formState.htmlContent }}
                          />
                        ) : (
                          <p className="text-xs italic text-muted-foreground text-center pt-12">No active content strings present to render.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="border border-border rounded-xl p-4 bg-muted/10 space-y-4 shrink-0">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Info size={13} /> Meta Discovery Settings (SEO)
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Meta Index Title</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        className="w-full p-2 bg-background border border-border rounded-lg text-sm disabled:opacity-60"
                        value={formState.metaTitle}
                        onChange={(e) => setFormState({ ...formState, metaTitle: e.target.value })}
                        placeholder="Fallback defaults to title"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Search Engine Snippet Summary</label>
                      <textarea
                        rows={2}
                        disabled={!isEditing}
                        className="w-full p-2 bg-background border border-border rounded-lg text-sm resize-none disabled:opacity-60"
                        value={formState.metaDescription}
                        onChange={(e) => setFormState({ ...formState, metaDescription: e.target.value })}
                        placeholder="Provide summary for search index engines..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {selectedNode && !formState.isGroup && (
                <div className="w-72 border-l border-border bg-muted/20 flex flex-col overflow-hidden shrink-0">
                  <div className="p-4 border-b border-border bg-card">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <UploadCloud size={14} /> Attached Media
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Manage localized visual buffers linked to this node record.</p>

                    <label className="mt-3 flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-border hover:border-primary/50 rounded-lg cursor-pointer bg-muted/40 hover:bg-muted transition-all">
                      <div className="flex flex-col items-center justify-center pt-3 pb-3 text-center px-2">
                        <UploadCloud size={18} className={isUploading ? "text-primary animate-bounce" : "text-muted-foreground"} />
                        <p className="text-[10px] font-semibold text-muted-foreground mt-1">
                          {isUploading ? "Processing Asset Pipeline..." : "Upload Resource Link"}
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleAssetUpload}
                        disabled={isUploading}
                        accept="image/*,application/pdf"
                      />
                    </label>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {assets && assets.length > 0 ? (
                      assets.map((asset) => (
                        <div key={asset.id} className="p-2.5 bg-card border border-border rounded-lg flex flex-col gap-1.5 shadow-sm group/asset">
                          <div className="flex items-center gap-2 min-w-0">
                            {asset.fileType.includes('pdf') ? (
                              <FileDown size={14} className="text-red-500 shrink-0" />
                            ) : (
                              <FileText size={14} className="text-blue-500 shrink-0" />
                            )}
                            <span className="text-xs font-medium truncate text-foreground/90 flex-1">{asset.fileName}</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-muted border-dashed">
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {(asset.fileSize / 1024).toFixed(1)} KB
                            </span>
                            <button
                              type="button"
                              onClick={() => executeCopyAction(asset.fileUrl, asset.id)}
                              className="flex items-center gap-1 text-[10px] bg-secondary text-secondary-foreground border border-border px-1.5 py-0.5 rounded hover:bg-secondary/80 transition-all font-medium"
                            >
                              {copiedAssetId === asset.id ? (
                                <>
                                  <Check size={10} className="text-green-600" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={10} /> S3 Path
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 px-4 border border-dashed border-border/60 rounded-xl mt-2 bg-card/50">
                        <p className="text-[11px] italic text-muted-foreground/70">No static image or binary asset maps linked to this workspace node.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/10">
            <div className="bg-card p-4 border border-border rounded-2xl shadow-sm mb-4">
              <Layers size={32} className="text-muted-foreground/80 mx-auto" />
            </div>
            <h3 className="text-md font-bold text-foreground">No Configuration Loaded</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Select an item from the structural tree explorer or provision a clean record node to manage values.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => startCreation('GROUP', null)}
                className="bg-secondary text-secondary-foreground px-3 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-secondary/80 transition-all"
              >
                Create Category Node
              </button>
              <button
                onClick={() => startCreation('DOCUMENT', null)}
                className="bg-primary text-primary-foreground shadow-sm px-3 py-2 text-xs font-semibold rounded-lg hover:bg-primary/95 transition-all"
              >
                Provision Root Document
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}