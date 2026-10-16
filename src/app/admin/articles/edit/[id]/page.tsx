'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { articleService } from '@/services/articleService';
import {
  ArrowLeft, Save, Send, Image as ImageIcon, Sparkles, Plus, Trash2,
  Star, TrendingUp, CheckCircle, AlertCircle, FileText, Tag, HelpCircle,
  UploadCloud, Link as LinkIcon, Wand2, Zap, Search, Clock, Globe, Share2,
  Eye, Check, ChevronDown, Layers, Sliders, ExternalLink
} from 'lucide-react';
import { cleanHtmlToPlainText, stripHtml, formatArticleHtml } from '@/utils/textUtils';
import { categoryService, CategoryData } from '@/services/categoryService';
import { CategoryManagerModal } from '@/components/admin/CategoryManagerModal';
import RichTextEditor from '@/components/admin/RichTextEditor';

function EditArticleContent() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const { user } = useAdminAuth();

  const [dynamicCategories, setDynamicCategories] = useState<CategoryData[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Inspector Sidebar Tab: 'publish' | 'placement' | 'seo'
  const [inspectorTab, setInspectorTab] = useState<'publish' | 'placement' | 'seo'>('publish');

  useEffect(() => {
    categoryService.getCategories(true).then((cats) => {
      if (cats && cats.length > 0) {
        setDynamicCategories(cats);
      }
    }).catch((err) => console.warn('Failed to load categories', err));
  }, []);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(true);
  const [category, setCategory] = useState('national');
  const [subCategory, setSubCategory] = useState('');
  const [subHeadline, setSubHeadline] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [authorName, setAuthorName] = useState('News Desk');
  const [tags, setTags] = useState('');
  const [previewTab, setPreviewTab] = useState<'google' | 'social'>('google');
  const [isIndexed, setIsIndexed] = useState(true);

  // Bullet Points
  const [bulletPoints, setBulletPoints] = useState<string[]>(['']);

  // Toggles
  const [isLeadStory, setIsLeadStory] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isQuickHighlight, setIsQuickHighlight] = useState(false);
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  // SEO Metadata Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Upload state
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0900-\u097F\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  const handleGenerateSlug = () => {
    setSlug(slugify(title));
    setIsSlugManuallyEdited(false);
  };

  const plainTextContent = stripHtml(content);
  const wordCount = plainTextContent ? plainTextContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const charCount = plainTextContent.length;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setErrorMsg('');
      const uploadedUrl = await articleService.uploadImage(file);
      setFeaturedImage(uploadedUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!articleId) return;

    const loadArticle = async () => {
      try {
        setIsLoading(true);
        const data = await articleService.getArticleByIdOrSlug(articleId);
        if (data) {
          setTitle(stripHtml(data.title || ''));
          setSlug(data.slug || '');
          if (data.slug) setIsSlugManuallyEdited(true);
          setCategory(data.category || 'national');
          setSubCategory(data.subCategory || '');
          setSubHeadline(stripHtml(data.subHeadline || ''));
          setContent(data.content || '');
          setFeaturedImage(data.featuredImage || '');
          if (data.imageCaption) {
            if (data.imageCaption.includes(' | Alt: ')) {
              const parts = data.imageCaption.split(' | Alt: ');
              setImageCaption(parts[0]);
              setImageAlt(parts[1]);
            } else if (data.imageCaption.startsWith('Alt: ')) {
              setImageAlt(data.imageCaption.replace('Alt: ', ''));
              setImageCaption('');
            } else {
              setImageCaption(stripHtml(data.imageCaption));
              setImageAlt('');
            }
          } else {
            setImageCaption('');
            setImageAlt('');
          }
          setAuthorName(data.authorName || 'News Desk');
          setIsLeadStory(Boolean(data.isLeadStory));
          setIsTrending(Boolean(data.isTrending));
          setIsQuickHighlight(Boolean(data.tags && data.tags.includes('quick_highlight')));
          setStatus(data.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED');

          if (data.bulletPoints) {
            try {
              const parsed = JSON.parse(data.bulletPoints);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setBulletPoints(parsed.map(b => stripHtml(String(b))));
              }
            } catch {
              setBulletPoints([stripHtml(data.bulletPoints)]);
            }
          }

          if (data.tags) {
            const cleanTags = data.tags.split(',').map(t => t.trim()).filter(t => t && t !== 'quick_highlight').join(', ');
            setTags(cleanTags);
          }

          setMetaTitle(data.metaTitle || '');
          setMetaDescription(data.metaDescription || '');
          setMetaKeywords(data.metaKeywords || '');
          setCanonicalUrl(data.canonicalUrl || '');
        }
      } catch (err: any) {
        setErrorMsg('Failed to load article details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [articleId]);

  const handleAddBullet = () => {
    setBulletPoints(prev => [...prev, '']);
  };

  const handleRemoveBullet = (index: number) => {
    setBulletPoints(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleBulletChange = (index: number, val: string) => {
    setBulletPoints(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleSubmit = async (publishStatus: 'PUBLISHED' | 'DRAFT') => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter an article headline.');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('Please write the article content body.');
      return;
    }

    try {
      setIsSubmitting(true);
      const cleanedTitle = stripHtml(title.trim());
      const cleanedHeadline = subHeadline ? stripHtml(subHeadline.trim()) : null;
      const formattedContent = formatArticleHtml(content.trim());
      const activeBullets = bulletPoints
        .map(b => stripHtml(b.trim()))
        .filter(Boolean);

      const baseTags = tags.split(',').map(t => stripHtml(t.trim())).filter(t => Boolean(t) && t !== 'quick_highlight');
      if (isQuickHighlight) {
        baseTags.push('quick_highlight');
      }

      let combinedCaption = imageCaption.trim();
      if (imageAlt.trim()) {
        combinedCaption = combinedCaption ? `${combinedCaption} | Alt: ${imageAlt.trim()}` : `Alt: ${imageAlt.trim()}`;
      }

      await articleService.updateArticle(articleId, {
        title: cleanedTitle,
        slug: slug.trim() || undefined,
        category,
        subCategory: subCategory.trim() || null,
        subHeadline: cleanedHeadline,
        content: formattedContent,
        featuredImage: featuredImage.trim() || null,
        imageCaption: combinedCaption || null,
        authorName: authorName.trim() || 'News Desk',
        bulletPoints: activeBullets,
        tags: baseTags,
        isLeadStory,
        isTrending,
        status: publishStatus,
        readTimeMinutes,
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        metaKeywords: metaKeywords.trim() || null,
        canonicalUrl: canonicalUrl.trim() || null
      });

      setStatus(publishStatus);
      setSuccessMsg('Article updated successfully! Redirecting...');
      setTimeout(() => {
        router.push('/admin/articles');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!confirm('Are you sure you want to permanently delete this article?')) return;
    try {
      setIsDeleting(true);
      await articleService.deleteArticle(articleId);
      router.push('/admin/articles');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete article.');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-600">Loading Story from Database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex font-sans">
      {/* 1. SIDEBAR */}
      <AdminSidebar />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <AdminHeader title="Editorial Studio" />

        {/* Pinned Production-Grade Editorial Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <Link
                href="/admin/articles"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                title="Back to Articles CMS"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'} shrink-0`} />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 truncate">
                    {status === 'PUBLISHED' ? 'Live Story' : 'Draft'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-bold text-slate-600 truncate max-w-[240px] sm:max-w-md">
                    {title || 'Untitled News Story'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium mt-0.5">
                  <span className="flex items-center space-x-1">
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-slate-700">{wordCount}</span> words
                  </span>
                  <span>•</span>
                  <span>~{readTimeMinutes} min read</span>
                  <span>•</span>
                  <span className="capitalize text-slate-600 font-semibold">{category}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2.5 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                disabled={isDeleting || isSubmitting}
                onClick={handleDeleteArticle}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                title="Permanently Delete Story"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit('DRAFT')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit('PUBLISHED')}
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Updating...' : 'Update & Publish'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Canvas & Inspector */}
        <div className="p-4 sm:p-8 pb-36 sm:pb-44 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2 shadow-2xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center space-x-2 shadow-2xs animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Grid Layout: Main Editorial Canvas (8 cols) + Right Editorial Inspector (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Editorial Canvas */}
            <div className="lg:col-span-8 space-y-6">

              {/* 1. Headline & Deck Card */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Story Primary Headline <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {title.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter bold, captivating headline..."
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none p-0 text-2xl sm:text-3xl font-black font-serif text-slate-900 placeholder:text-slate-300 focus:ring-0 leading-tight resize-none"
                  />
                </div>

                {/* Slug Permalink Pill */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs">
                  <div className="flex items-center space-x-1.5 overflow-hidden text-slate-500 font-mono text-xs w-full">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-400 font-medium select-none shrink-0 font-sans">
                      thenewspaper.com/article/
                    </span>
                    <input
                      type="text"
                      placeholder="custom-permalink-slug"
                      value={slug}
                      onChange={(e) => {
                        setSlug(slugify(e.target.value));
                        setIsSlugManuallyEdited(true);
                      }}
                      className="w-full bg-transparent border-0 outline-none p-0 text-xs font-mono text-slate-800 placeholder-slate-400 font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center space-x-1 shrink-0 ml-2 cursor-pointer transition-colors"
                    title="Auto-regenerate slug from headline"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Sync Slug</span>
                  </button>
                </div>

                {/* Deck / Sub-headline */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Sub-Headline / Deck (Lead Paragraph Excerpt)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief 1-2 sentence summary displayed under the headline on website and news cards..."
                    value={subHeadline}
                    onChange={(e) => setSubHeadline(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all leading-relaxed"
                  />
                </div>
              </div>

              {/* 2. Featured Media Banner */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-red-600" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Lead Cover Media (16:9 Aspect Ratio)
                    </h3>
                  </div>

                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                        imageInputMode === 'upload'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                        imageInputMode === 'url'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Image URL</span>
                    </button>
                  </div>
                </div>

                {imageInputMode === 'upload' ? (
                  <div>
                    <label
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          try {
                            setIsUploading(true);
                            setErrorMsg('');
                            const uploadedUrl = await articleService.uploadImage(file);
                            setFeaturedImage(uploadedUrl);
                            setSuccessMsg('Image uploaded successfully from device!');
                          } catch (err: any) {
                            setErrorMsg(err.message || 'Failed to upload image.');
                          } finally {
                            setIsUploading(false);
                          }
                        }
                      }}
                      className="border-2 border-dashed border-slate-300 hover:border-red-500 bg-slate-50/50 hover:bg-red-50/20 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all group"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center space-y-3 py-3">
                          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-black text-slate-800 animate-pulse">
                            Uploading image to server...
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2 text-center">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-700 group-hover:text-red-600 group-hover:scale-105 flex items-center justify-center transition-all shadow-2xs">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-900 block group-hover:text-red-600 transition-colors">
                              Click to choose photo or drag & drop here
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                              High-resolution JPG, PNG, or WebP up to 15MB
                            </span>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or paste direct web image link"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                )}

                {/* Caption & Alt Text Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Photo Caption & Credit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Photo: Reuters / Jagran Bureau"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Image Alt Text (Google SEO)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Prime Minister addressing tech rally in New Delhi"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Live Preview */}
                {featuredImage && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative group shadow-2xs">
                    <div className="aspect-[16/9] w-full">
                      <img
                        src={featuredImage}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200';
                        }}
                      />
                    </div>
                    <div className="absolute top-3 right-3 flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setFeaturedImage('')}
                        className="px-2.5 py-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-white text-xs font-bold backdrop-blur-sm transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                    {imageCaption && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-xs text-white text-xs px-4 py-1.5 font-medium truncate">
                        {imageCaption}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Story Content / Body (Centerpiece) */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-red-600" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Story Content & Editorial Body <span className="text-red-500">*</span>
                    </h3>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-black uppercase">
                    WYSIWYG Active
                  </span>
                </div>

                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  label="Story Content / Body"
                  placeholder="Write the complete news story here... Use H2/H3 for subheadings, bullet points for lists, quotes for statements, or embed X posts."
                />

                {/* Word Count Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-600">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1 text-slate-800">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>{wordCount} Words</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1 text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>~{readTimeMinutes} Min Read</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-400 font-mono">
                      {charCount} Characters
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Calculated for standard reading pace
                  </span>
                </div>
              </div>

              {/* 4. Quick Takeaways / Key Highlights */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Executive Key Highlights (Bullet Points)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Highlight</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 font-medium">
                  Key takeaway points displayed in a highlighted box at the top of the article for fast reader skimming.
                </p>

                <div className="space-y-2.5">
                  {bulletPoints.map((bullet, idx) => (
                    <div key={idx} className="flex items-center space-x-2 group">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 border border-slate-200">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={`Key takeaway point #${idx + 1}...`}
                        value={bullet}
                        onChange={(e) => handleBulletChange(idx, e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                      />
                      {bulletPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBullet(idx)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove point"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bottom Add Point Button */}
                <button
                  type="button"
                  onClick={handleAddBullet}
                  className="w-full py-2.5 mt-2 border-2 border-dashed border-slate-200 hover:border-red-300 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 bg-slate-50/50 hover:bg-red-50/50 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Highlight Point</span>
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN: Production-Grade Inspector Rail (4 cols, Sticky) */}
            <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">

              {/* Inspector Tab Selector */}
              <div className="sticky top-0 z-20 bg-slate-100/95 backdrop-blur-md pb-1 pt-0.5">
                <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setInspectorTab('publish')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      inspectorTab === 'publish'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Metadata</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectorTab('placement')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      inspectorTab === 'placement'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Placement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectorTab('seo')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      inspectorTab === 'seo'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>SEO & Social</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: Metadata & Classification */}
              {inspectorTab === 'publish' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Category Assignment */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                        Primary Classification
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Categories</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
                      >
                        {dynamicCategories.map(c => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                        Sub-Category / Kicker
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AI Tech, Cricket, Election 2026"
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Author Byline & Tags */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5">
                      Author & Discovery Tags
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                        Author Byline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Jagran News Network"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                        Tags (Comma Separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tech, Apple, Budget 2026"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        Used for internal search indexing and related articles recommendation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Homepage Placement & Editorial Distribution */}
              {inspectorTab === 'placement' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5">
                      Homepage & Section Distribution
                    </div>

                    {/* Lead Story Switch */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                      <div className="space-y-0.5 pr-3">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                          <Star className={`w-3.5 h-3.5 ${isLeadStory ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                          <span>Make Lead Story (Hero)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Pins story in the big spotlight center hero on Homepage.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={isLeadStory}
                          onChange={(e) => setIsLeadStory(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    {/* Top News Switch */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                      <div className="space-y-0.5 pr-3">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                          <TrendingUp className={`w-3.5 h-3.5 ${isTrending ? 'text-red-600' : 'text-slate-400'}`} />
                          <span>Top News (01-05 Sidebar)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Pins story in the numbered Top News 1 to 5 rail across pages.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={isTrending}
                          onChange={(e) => setIsTrending(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    {/* Quick Highlights Switch */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                      <div className="space-y-0.5 pr-3">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                          <Zap className={`w-3.5 h-3.5 ${isQuickHighlight ? 'text-blue-600 fill-blue-500' : 'text-slate-400'}`} />
                          <span>Quick Highlights Strip</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Pins story in the 5 text-only rapid bulletin headlines.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={isQuickHighlight}
                          onChange={(e) => setIsQuickHighlight(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Google SEO & Social Optimization */}
              {inspectorTab === 'seo' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center space-x-1.5">
                        <Search className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Search Engine Optimization
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Google Ready
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                          Meta Title
                        </label>
                        <span className={`text-[10px] font-mono ${metaTitle.length > 60 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                          {metaTitle.length}/60
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={70}
                        placeholder="SEO title — appears in Google search results"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                          Meta Description
                        </label>
                        <span className={`text-[10px] font-mono ${metaDescription.length > 160 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                          {metaDescription.length}/160
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={180}
                        placeholder="Compelling 1-2 sentence snippet shown under title in search results..."
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Budget 2026, India Economy, Tech News"
                        value={metaKeywords}
                        onChange={(e) => setMetaKeywords(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://thenewspaper.com/article/slug (leave blank for default)"
                        value={canonicalUrl}
                        onChange={(e) => setCanonicalUrl(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    {/* Indexing Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Search Engine Indexing</div>
                        <p className="text-[10px] text-slate-500">Allow Google to crawl and index this story</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={isIndexed}
                          onChange={(e) => setIsIndexed(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {/* Previews: Google & Social Card */}
                    {(metaTitle || title) && (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Search Result Preview
                          </span>
                          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                            <button
                              type="button"
                              onClick={() => setPreviewTab('google')}
                              className={`px-2 py-0.5 rounded-md cursor-pointer ${
                                previewTab === 'google' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                              }`}
                            >
                              Google
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewTab('social')}
                              className={`px-2 py-0.5 rounded-md cursor-pointer ${
                                previewTab === 'social' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                              }`}
                            >
                              WhatsApp
                            </button>
                          </div>
                        </div>

                        {previewTab === 'google' ? (
                          <div className="p-3 bg-white rounded-xl border border-slate-200 text-left space-y-1">
                            <div className="text-[10px] text-slate-500 truncate flex items-center space-x-1">
                              <span className="font-semibold text-slate-700">thenewspaper.com</span>
                              <span>› article › {slug || 'custom-permalink'}</span>
                            </div>
                            <div className="text-xs font-semibold text-blue-700 line-clamp-1 hover:underline cursor-pointer">
                              {metaTitle || title} | The News Paper
                            </div>
                            <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                              {metaDescription || subHeadline || plainTextContent.slice(0, 140) || 'Story description will appear here...'}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-white rounded-xl border border-slate-200 text-left space-y-2">
                            {featuredImage && (
                              <div className="aspect-[1.91/1] w-full bg-slate-100 rounded-lg overflow-hidden">
                                <img src={featuredImage} alt="Social Card" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                              THENEWSPAPER.COM
                            </div>
                            <div className="text-xs font-bold text-slate-900 line-clamp-1">
                              {metaTitle || title}
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-2">
                              {metaDescription || subHeadline || plainTextContent.slice(0, 100)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          categoryService.getCategories(true).then((cats) => {
            if (cats && cats.length > 0) setDynamicCategories(cats);
          });
        }}
      />
    </div>
  );
}

export default function EditArticlePage() {
  return (
    <AdminAuthProvider>
      <EditArticleContent />
    </AdminAuthProvider>
  );
}
