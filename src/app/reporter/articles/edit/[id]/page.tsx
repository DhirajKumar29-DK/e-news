'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FileText, Send, Save, ArrowLeft, UploadCloud, X,
  AlertCircle, CheckCircle2, AlertTriangle, Clock, MessageSquare, MapPin,
  Sparkles, Plus, Trash2
} from 'lucide-react';
import { ReporterLayout } from '@/components/reporter/ReporterLayout';
import { useReporterAuth } from '@/context/ReporterAuthContext';
import { articleService, ArticleData } from '@/services/articleService';
import { categoryService, CategoryData } from '@/services/categoryService';
import RichTextEditor from '@/components/admin/RichTextEditor';

const FALLBACK_CATEGORIES: { id: string; slug: string; name: string }[] = [
  { id: '1', slug: 'india', name: 'India / National' },
  { id: '2', slug: 'crime', name: 'Crime & Security' },
  { id: '3', slug: 'global', name: 'Global & International' },
  { id: '4', slug: 'entertainment', name: 'Entertainment' },
  { id: '5', slug: 'sports', name: 'Cricket & Sports' },
  { id: '6', slug: 'business', name: 'Business & Markets' },
  { id: '7', slug: 'tech', name: 'Technology & AI' },
  { id: '8', slug: 'education', name: 'Education & Jobs' },
  { id: '9', slug: 'lifestyle', name: 'Lifestyle & Health' },
  { id: '10', slug: 'spiritual', name: 'Dharm & Spiritual' }
];

function EditArticleContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { reporter } = useReporterAuth();

  const [categories, setCategories] = useState<CategoryData[]>(() => {
    const cached = categoryService.getCachedCategories();
    return cached.length > 0 ? cached : (FALLBACK_CATEGORIES as any);
  });

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<ArticleData | null>(null);

  const [title, setTitle] = useState('');
  const [subHeadline, setSubHeadline] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('india');
  const [subCategory, setSubCategory] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [bulletPoints, setBulletPoints] = useState<string[]>(['', '', '']);
  const [tags, setTags] = useState('');

  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    }).catch(console.warn);
  }, []);

  useEffect(() => {
    if (id) {
      articleService.getArticleByIdOrSlug(id)
        .then((art) => {
          setArticle(art);
          setTitle(art.title || '');
          setSubHeadline(art.subHeadline || '');
          setContent(art.content || '');
          setCategory(art.category || 'national');
          setSubCategory(art.subCategory || '');
          setFeaturedImage(art.featuredImage || '');
          setImageCaption(art.imageCaption || '');
          setTags(art.tags || '');

          if (art.bulletPoints) {
            try {
              const parsed = typeof art.bulletPoints === 'string' ? JSON.parse(art.bulletPoints) : art.bulletPoints;
              if (Array.isArray(parsed) && parsed.length > 0) {
                setBulletPoints(parsed.map(b => String(b)));
              } else {
                setBulletPoints(['', '', '']);
              }
            } catch {
              setBulletPoints([String(art.bulletPoints)]);
            }
          } else {
            setBulletPoints(['', '', '']);
          }
        })
        .catch((err) => {
          setErrorMsg(err.message || 'Failed to load article details.');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    try {
      setIsUploadingImg(true);
      setErrorMsg(null);
      const url = await articleService.uploadImage(file);
      setFeaturedImage(url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload photo.');
    } finally {
      setIsUploadingImg(false);
    }
  };

  const handleUpdate = async (submitForReview: boolean) => {
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Please enter a headline for the news story.');
      return;
    }

    if (!content.trim() || content === '<p></p>') {
      setErrorMsg('Please write the article story content.');
      return;
    }

    try {
      setIsSubmitting(true);
      const activeBullets = bulletPoints
        .map(b => b.trim())
        .filter(Boolean);

      await articleService.updateArticle(id, {
        title: title.trim(),
        subHeadline: subHeadline.trim() || null,
        content,
        category,
        subCategory: subCategory.trim() || null,
        featuredImage: featuredImage || null,
        imageCaption: imageCaption.trim() || null,
        bulletPoints: activeBullets.length > 0 ? activeBullets : null,
        tags: tags.trim() || null,
        status: submitForReview ? 'PENDING_REVIEW' : 'DRAFT'
      });

      router.push('/reporter/articles');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Loading story details...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Story Not Found</h3>
        <p className="text-xs text-slate-500">This article either does not exist or you do not have permission to view it.</p>
        <Link href="/reporter/articles" className="inline-block px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold">
          Back to My Articles
        </Link>
      </div>
    );
  }

  const isPublished = article.status === 'PUBLISHED';
  const isPending = article.status === 'PENDING_REVIEW';
  const isNeedsRevision = article.status === 'NEEDS_REVISION';

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Back Navigation */}
      <div>
        <Link
          href="/reporter/articles"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors py-1 px-1 group"
        >
          <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-red-300 group-hover:bg-red-50 transition-colors shadow-2xs">
            <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-red-600 transition-colors" />
          </div>
          <span>Back to My Submissions</span>
        </Link>
      </div>

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
            {isPublished ? 'View Published Story' : isNeedsRevision ? 'Revise News Story' : isPending ? 'Edit Pending Story' : 'Edit News Draft'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Story ID: <span className="font-mono">{article.id.slice(0, 8)}</span> • Current Status: <span className="font-bold uppercase text-slate-800">{article.status}</span>
          </p>
        </div>

        {!isPublished && (
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleUpdate(false)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleUpdate(true)}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Updating...' : isNeedsRevision ? 'Resubmit to Editorial Desk' : isPending ? 'Update in Review Queue' : 'Submit for Review'}</span>
            </button>
          </div>
        )}
      </div>

      {/* EDITORIAL REVISION FEEDBACK BANNER (If Changes Requested) */}
      {isNeedsRevision && article.adminFeedback && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 shadow-xs space-y-2 animate-in fade-in">
          <div className="flex items-center space-x-2 font-black text-amber-950 text-xs uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span>Editorial Desk Correction Request</span>
          </div>
          <div className="p-3.5 bg-white/80 rounded-2xl border border-amber-200/60 text-xs text-amber-900 leading-relaxed font-medium">
            &ldquo;{article.adminFeedback}&rdquo;
          </div>
          <p className="text-[11px] text-amber-800">
            Please make the requested changes in the form below and click <strong>&quot;Resubmit to Editorial Desk&quot;</strong>.
          </p>
        </div>
      )}

      {/* Published Notice */}
      {isPublished && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>This story is live on the Vartiq website with <strong>{article.viewsCount} reader views</strong>.</span>
          </div>
          <Link
            href={`/article/${article.slug || article.id}`}
            target="_blank"
            className="font-bold underline text-emerald-700 hover:text-emerald-900"
          >
            View Live Story ↗
          </Link>
        </div>
      )}

      {/* Pending Notice */}
      {isPending && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>This story is currently in the editorial review queue. You can still update it before admin publishes.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Editor Body */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-1.5">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
            Story Headline / Title *
          </label>
          <input
            type="text"
            required
            disabled={isPublished}
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-serif disabled:opacity-75"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
            Sub-Headline / Summary
          </label>
          <input
            type="text"
            disabled={isPublished}
            value={subHeadline}
            onChange={e => setSubHeadline(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all disabled:opacity-75"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
              Category
            </label>
            <select
              disabled={isPublished}
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer disabled:opacity-75"
            >
              {categories.map(cat => (
                <option key={cat.id || cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
              Sub-Topic / Tag
            </label>
            <input
              type="text"
              disabled={isPublished}
              value={subCategory}
              onChange={e => setSubCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all disabled:opacity-75"
            />
          </div>
        </div>

        {/* Featured Image */}
        <div className="space-y-2">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
            Featured News Photo
          </label>

          {featuredImage ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-72">
              <img
                src={featuredImage}
                alt="Featured Preview"
                className="w-full h-64 object-cover"
              />
              {!isPublished && (
                <button
                  type="button"
                  onClick={() => setFeaturedImage('')}
                  className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
                  title="Remove Photo"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : !isPublished ? (
            <label className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 hover:bg-slate-100/60 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {isUploadingImg ? (
                <div className="space-y-1">
                  <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <span className="text-xs font-bold text-slate-600 block">Uploading Photo...</span>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-7 h-7 text-slate-400 mb-1.5" />
                  <span className="text-xs font-bold text-slate-700 block">Upload Story Photo</span>
                  <span className="text-[10px] text-slate-400 block">JPG, PNG, WebP (Max 15MB)</span>
                </>
              )}
            </label>
          ) : null}

          {featuredImage && (
            <input
              type="text"
              disabled={isPublished}
              placeholder="Photo caption or image source attribution..."
              value={imageCaption}
              onChange={e => setImageCaption(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all mt-2 disabled:opacity-75"
            />
          )}
        </div>

        {/* Key Story Highlights (Bullet Points) - Above Rich Text Editor */}
        <div className="p-5 sm:p-6 rounded-2xl border border-amber-200/80 bg-amber-50/30 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
            <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Key Story Highlights (Bullet Points)</span>
            </div>
            {!isPublished && (
              <button
                type="button"
                onClick={handleAddBullet}
                className="inline-flex items-center space-x-1 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Highlight</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-600 font-medium">
            Key takeaway points displayed in a prominent highlighted box at the top of the published article for quick reader skimming.
          </p>

          <div className="space-y-2.5">
            {bulletPoints.map((bullet, idx) => (
              <div key={idx} className="flex items-center space-x-2 group">
                <span className="w-6 h-6 rounded-lg bg-white text-amber-800 text-xs font-bold flex items-center justify-center shrink-0 border border-amber-300 shadow-xs">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  disabled={isPublished}
                  placeholder={`Key highlight point #${idx + 1}...`}
                  value={bullet}
                  onChange={(e) => handleBulletChange(idx, e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all disabled:opacity-75"
                />
                {!isPublished && bulletPoints.length > 1 && (
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

          {!isPublished && (
            <button
              type="button"
              onClick={handleAddBullet}
              className="w-full py-2.5 mt-2 border-2 border-dashed border-amber-300/80 hover:border-amber-400 rounded-xl text-xs font-bold text-amber-800 hover:text-amber-950 bg-white/70 hover:bg-amber-100/50 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Highlight Point</span>
            </button>
          )}
        </div>

        {/* Story Body Editor */}
        <div className="space-y-1.5">
          <RichTextEditor
            value={content}
            onChange={setContent}
            label="Story Content &amp; Full Report *"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
            Keywords / Search Tags
          </label>
          <input
            type="text"
            disabled={isPublished}
            value={tags}
            onChange={e => setTags(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all disabled:opacity-75"
          />
        </div>
      </div>
    </div>
  );
}

export default function EditReporterArticlePage() {
  return (
    <ReporterLayout>
      <EditArticleContent />
    </ReporterLayout>
  );
}

