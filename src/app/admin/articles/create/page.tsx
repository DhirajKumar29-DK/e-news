'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { articleService } from '@/services/articleService';
import {
  ArrowLeft, Save, Send, Image as ImageIcon, Sparkles, Plus, Trash2,
  Star, TrendingUp, CheckCircle, AlertCircle, FileText, Tag, HelpCircle,
  UploadCloud, Link as LinkIcon
} from 'lucide-react';

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
  { value: 'lifestyle', label: 'Lifestyle & Health' },
  { value: 'auto', label: 'Auto' },
  { value: 'education', label: 'Education & Career' },
  { value: 'explainer', label: 'Explainer (Deep Analysis)' },
  { value: 'opinion', label: 'Opinion & Editorial' },
];

function CreateArticleContent() {
  const router = useRouter();
  const { user } = useAdminAuth();

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
  const [authorName, setAuthorName] = useState(user?.name || 'News Desk');
  const [tags, setTags] = useState('');

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

  // Bullet Points (Key Highlights)
  const [bulletPoints, setBulletPoints] = useState<string[]>([
    '',
    '',
    ''
  ]);

  // Layout & Visibility Toggles
  const [isLeadStory, setIsLeadStory] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

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
      const activeBullets = bulletPoints.filter(b => b.trim() !== '');

      const newArticle = await articleService.createArticle({
        title: title.trim(),
        category,
        subCategory: subCategory.trim() || null,
        subHeadline: subHeadline.trim() || null,
        content: content.trim(),
        featuredImage: featuredImage.trim() || null,
        imageCaption: imageCaption.trim() || null,
        authorName: authorName.trim() || 'News Desk',
        bulletPoints: activeBullets,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        isLeadStory,
        isTrending,
        status: publishStatus
      });

      setSuccessMsg('Article published successfully! Redirecting...');
      setTimeout(() => {
        router.push('/admin/articles');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save article. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans select-none">
      
      {/* 1. SIDEBAR */}
      <AdminSidebar />

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader title="Create New Story" />

        <div className="p-6 sm:p-8 space-y-6 flex-1 max-w-5xl w-full mx-auto">
          
          {/* Header Action Bar */}
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
                <span>{isSubmitting ? 'Publishing...' : 'Publish Article'}</span>
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
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

          {/* Form Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (8 cols): Main Content Fields */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* 1. Primary Headline & Deck */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Primary Headline (H1) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter bold, captivating news headline..."
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
                    placeholder="Brief 1-2 sentence excerpt displayed under headline and on card previews..."
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

              {/* 3. Key Highlights (Bullet Points) */}
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
                        placeholder={`Key highlight #${idx + 1}...`}
                        value={bullet}
                        onChange={(e) => handleBulletChange(idx, e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                      {bulletPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBullet(idx)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove bullet point"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Article Body Content */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>Story Content / Body <span className="text-red-500">*</span></span>
                </div>

                <div>
                  <textarea
                    rows={12}
                    required
                    placeholder="Write the complete news article here... Separate paragraphs with blank lines."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Tip: Paragraphs will be cleanly formatted with responsive newspaper typography.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column (4 cols): Meta, Categories & Layout Controls */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Category Selector */}
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
                    placeholder="e.g. AI Tech, Bollywood, Election"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Homepage Layout Placement Switches */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
                  Homepage Placement
                </div>

                {/* Lead Story Toggle */}
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

                {/* Trending News Toggle */}
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

              {/* Author & Tags */}
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
                    placeholder="e.g. Jagran News Network"
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
                    placeholder="e.g. Technology, Apple, Gadgets"
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

export default function CreateArticlePage() {
  return (
    <AdminAuthProvider>
      <CreateArticleContent />
    </AdminAuthProvider>
  );
}
