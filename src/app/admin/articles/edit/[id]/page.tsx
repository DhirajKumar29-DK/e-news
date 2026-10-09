'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { articleService, ArticleData } from '@/services/articleService';
import {
  ArrowLeft, Save, Send, Image as ImageIcon, Sparkles, Plus, Trash2,
  Star, TrendingUp, CheckCircle, AlertCircle, FileText, UploadCloud, Link as LinkIcon, Wand2
} from 'lucide-react';
import { cleanHtmlToPlainText, stripHtml } from '@/utils/textUtils';

const CATEGORIES = [
  { value: 'india', label: 'India' },
  { value: 'national', label: 'National' },
  { value: 'cricket', label: 'Cricket' },
  { value: 'sports', label: 'Sports' },
  { value: 'world', label: 'World News' },
  { value: 'tech', label: 'Tech & Science' },
  { value: 'business', label: 'Business & Markets' },
  { value: 'entertainment', label: 'Entertainment & Cinema' },
  { value: 'fashion', label: 'Fashion & Beauty' },
  { value: 'brandverse', label: 'Brandverse' },
  { value: 'lifestyle', label: 'Lifestyle & Health' },
  { value: 'auto', label: 'Auto' },
  { value: 'spiritual', label: 'Spiritual & Faith' },
  { value: 'horoscope', label: 'Horoscope & Astrology' },
  { value: 'education', label: 'Education & Career' },
  { value: 'explainer', label: 'Explainer (Deep Analysis)' },
  { value: 'opinion', label: 'Opinion & Editorial' },
];

function EditArticleContent() {
  const router = useRouter();
  const params = useParams();
  const articleId = typeof params?.id === 'string' ? params.id : '';

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('tech');
  const [subCategory, setSubCategory] = useState('');
  const [subHeadline, setSubHeadline] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [authorName, setAuthorName] = useState('News Desk');
  const [tags, setTags] = useState('');

  // Bullet Points
  const [bulletPoints, setBulletPoints] = useState<string[]>(['']);

  // Toggles
  const [isLeadStory, setIsLeadStory] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  // Upload state
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);

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
          setCategory(data.category || 'national');
          setSubCategory(data.subCategory || '');
          setSubHeadline(stripHtml(data.subHeadline || ''));
          setContent(cleanHtmlToPlainText(data.content || ''));
          setFeaturedImage(data.featuredImage || '');
          setImageCaption(data.imageCaption ? stripHtml(data.imageCaption) : '');
          setAuthorName(data.authorName || 'News Desk');
          setIsLeadStory(Boolean(data.isLeadStory));
          setIsTrending(Boolean(data.isTrending));
          setStatus(data.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED');

          // Parse bullet points
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

          // Parse tags
          if (data.tags) {
            setTags(data.tags);
          }
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
      const cleanedContent = cleanHtmlToPlainText(content.trim());
      const activeBullets = bulletPoints
        .map(b => stripHtml(b.trim()))
        .filter(Boolean);

      await articleService.updateArticle(articleId, {
        title: cleanedTitle,
        category,
        subCategory: subCategory.trim() || null,
        subHeadline: cleanedHeadline,
        content: cleanedContent,
        featuredImage: featuredImage.trim() || null,
        imageCaption: imageCaption ? stripHtml(imageCaption.trim()) : null,
        authorName: authorName.trim() || 'News Desk',
        bulletPoints: activeBullets,
        tags: tags.split(',').map(t => stripHtml(t.trim())).filter(Boolean),
        isLeadStory,
        isTrending,
        status: publishStatus
      });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Article Content...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans select-none">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader title="Edit News Story" />

        <div className="p-6 sm:p-8 space-y-6 flex-1 max-w-5xl w-full mx-auto">
          
          <div className="flex items-center justify-between">
            <Link
              href="/admin/articles"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Articles</span>
            </Link>

            <div className="flex items-center space-x-2.5">
              <button
                disabled={isSubmitting}
                onClick={() => handleSubmit('DRAFT')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>Save Draft</span>
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => handleSubmit('PUBLISHED')}
                className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Updating...' : 'Update Article'}</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Primary Headline (H1) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-lg font-black font-serif text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Sub-Headline / Deck (Summary)
                  </label>
                  <textarea
                    rows={2}
                    value={subHeadline}
                    onChange={(e) => setSubHeadline(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

              {/* 2. Featured Image & Photo Caption */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-700">
                    <ImageIcon className="w-4 h-4 text-red-600" />
                    <span>Featured Image (16:9 Aspect Ratio)</span>
                    {featuredImage && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        <span>Attached</span>
                      </span>
                    )}
                  </div>

                  {/* Mode switcher tabs */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        imageInputMode === 'upload'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload from Device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        imageInputMode === 'url'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Paste Image URL</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {imageInputMode === 'upload' ? (
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                        Choose Image from Computer / Phone
                      </label>
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
                        className="border-2 border-dashed border-red-200 hover:border-red-500 bg-red-50/20 hover:bg-red-50/40 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all group"
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
                            <div className="w-9 h-9 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-black text-slate-800 animate-pulse">
                              Uploading file to server... Please wait
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-2 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-red-100 text-red-600 group-hover:scale-105 flex items-center justify-center transition-transform shadow-xs">
                              <UploadCloud className="w-7 h-7" />
                            </div>
                            <div>
                              <span className="text-sm font-black text-slate-900 block group-hover:text-red-600 transition-colors">
                                Click to browse image or drag & drop here
                              </span>
                              <span className="text-xs text-slate-500 font-medium block mt-0.5">
                                JPG, PNG, WebP up to 15MB (Direct local file upload)
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200 mt-1">
                              Select from Computer / Laptop
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                        Image Direct Web URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or paste image URL"
                        value={featuredImage}
                        onChange={(e) => setFeaturedImage(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Photo Caption & Credits
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Photo: Reuters / Jagran Bureau"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>

                  {/* Live Image Preview */}
                  {featuredImage && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Live Preview (16:9 Banner):</span>
                        <button
                          type="button"
                          onClick={() => setFeaturedImage('')}
                          className="text-red-600 hover:text-red-700 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Image</span>
                        </button>
                      </div>
                      <div className="aspect-[16/9] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group shadow-xs">
                        <img
                          src={featuredImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200';
                          }}
                        />
                        {imageCaption && (
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-white text-[11px] px-3 py-1 font-medium truncate">
                            {imageCaption}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-600">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Key Highlights (Bullet Points)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Point</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {bulletPoints.map((bullet, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => handleBulletChange(idx, e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                      {bulletPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBullet(idx)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-600">
                    <FileText className="w-4 h-4 text-red-600" />
                    <span>Story Content / Body <span className="text-red-500">*</span></span>
                  </div>
                  {content.includes('<') && content.includes('>') && (
                    <button
                      type="button"
                      onClick={() => setContent(cleanHtmlToPlainText(content))}
                      className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200 transition-colors cursor-pointer"
                      title="Remove raw <p>, <h>, etc. and convert to clean plain paragraphs"
                    >
                      <Wand2 className="w-3 h-3 text-amber-600" />
                      <span>Clean HTML Tags</span>
                    </button>
                  )}
                </div>

                <div>
                  <textarea
                    rows={12}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

            </div>

            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
                  Category Assignment
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Primary Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Sub-Topic / Kicker
                  </label>
                  <input
                    type="text"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
                  Homepage Placement
                </div>

                <div className="flex items-start justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
                  <div className="space-y-0.5 pr-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>Make Lead Story</span>
                    </div>
                    <p className="text-[10px] text-amber-700/80 font-medium">
                      Pins this article as the big center hero feature on Homepage.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isLeadStory}
                    onChange={(e) => setIsLeadStory(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer mt-0.5"
                  />
                </div>

                <div className="flex items-start justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-200/80">
                  <div className="space-y-0.5 pr-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-900">
                      <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                      <span>Trending News (01-05)</span>
                    </div>
                    <p className="text-[10px] text-rose-700/80 font-medium">
                      Features article in the top 5 trending list on sidebar.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded border-rose-300 focus:ring-rose-500 cursor-pointer mt-0.5"
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
                  Metadata & Byline
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Author Byline
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

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
