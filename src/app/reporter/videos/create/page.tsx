'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Video, Play, Upload, Link2, Youtube, ArrowLeft,
  CheckCircle2, AlertCircle, Image as ImageIcon,
  Clock, Tag, Send, Save, X, Plus, Trash2, Eye
} from 'lucide-react';
import { ReporterLayout } from '@/components/reporter/ReporterLayout';
import { useReporterAuth } from '@/context/ReporterAuthContext';
import { videoService, CreateVideoInput } from '@/services/videoService';
import { categoryService, CategoryData } from '@/services/categoryService';

const FALLBACK_CATEGORIES = [
  { id: '1', slug: 'india', name: 'India / National' },
  { id: '2', slug: 'crime', name: 'Crime & Security' },
  { id: '3', slug: 'politics', name: 'Politics' },
  { id: '4', slug: 'sports', name: 'Sports' },
  { id: '5', slug: 'entertainment', name: 'Entertainment' },
  { id: '6', slug: 'local', name: 'Regional & Local' }
];

function CreateVideoContent() {
  const router = useRouter();
  const { reporter } = useReporterAuth();

  const [categories, setCategories] = useState<CategoryData[]>(() => {
    const cached = categoryService.getCachedCategories();
    return cached.length > 0 ? cached : (FALLBACK_CATEGORIES as any);
  });

  // Mode: 'URL' (YouTube/Link) or 'FILE' (Direct Upload)
  const [videoType, setVideoType] = useState<'URL' | 'FILE'>('URL');

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('03:30');
  const [badge, setBadge] = useState('');
  const [category, setCategory] = useState('latest');
  const [tags, setTags] = useState('');

  // Upload States
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      if (cats && cats.length > 0) {
        setCategories(cats);
        if (cats[0]) setCategory(cats[0].slug);
      }
    }).catch(console.warn);
  }, []);

  const generateSlug = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(val));
    }
  };

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      const id = ytMatch[1];
      setYoutubeId(id);
      if (!thumbnailUrl) {
        setThumbnailUrl(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
      }
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingVideo(true);
      setErrorMsg(null);
      const res = await videoService.uploadVideoFile(file);
      setVideoUrl(res.videoUrl);
      if (res.duration && !duration) {
        setDuration(res.duration);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Video upload failed');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingThumb(true);
      setErrorMsg(null);
      const res = await videoService.uploadThumbnail(file);
      setThumbnailUrl(res.thumbnailUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Thumbnail upload failed');
    } finally {
      setIsUploadingThumb(false);
    }
  };

  const handleSubmit = async (submitStatus: 'PENDING_REVIEW' | 'DRAFT') => {
    if (!title.trim()) {
      setErrorMsg('Video title is required');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!videoUrl.trim()) {
      setErrorMsg('Video URL or video file is required');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const payload: CreateVideoInput = {
        title: title.trim(),
        slug: slug.trim() || generateSlug(title) || `video-${Date.now()}`,
        description: description.trim() || null,
        videoType: videoType === 'FILE' ? 'FILE' : 'YOUTUBE',
        videoUrl: videoUrl.trim(),
        youtubeId: youtubeId || null,
        thumbnailUrl: thumbnailUrl.trim() || null,
        duration: duration || '03:30',
        badge: badge || 'GROUND REPORT',
        category: category || 'latest',
        location: null,
        reporterName: reporter?.name || 'Field Reporter',
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        status: submitStatus,
        isFeaturedHero: false,
        isTrending: false
      };

      await videoService.createVideo(payload);
      router.push('/reporter/videos');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit video report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Breadcrumb & Action Bar */}
      <div className="pb-4 border-b border-slate-200">
        <div>
          <Link
            href="/reporter/dashboard"
            className="hidden sm:inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <Video className="w-6 h-6 text-red-600" />
            <span>Submit Ground Video Report</span>
          </h1>
          <p className="text-xs text-slate-500">
            Submitted ground video reports undergo editorial verification before live publication.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Video Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Step 1: Video Source Mode Switcher */}
        <div className="space-y-3">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
            1. Select Video Source *
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setVideoType('URL')}
              className={`p-3.5 rounded-2xl border-2 flex items-center space-x-2.5 transition text-left cursor-pointer ${
                videoType === 'URL'
                  ? 'border-red-600 bg-red-50/40 text-red-950 font-bold'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Youtube className={`w-5 h-5 ${videoType === 'URL' ? 'text-red-600' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-bold">YouTube URL</div>
                <div className="text-[10px] text-slate-500">Auto-fetches thumbnail</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setVideoType('FILE')}
              className={`p-3.5 rounded-2xl border-2 flex items-center space-x-2.5 transition text-left cursor-pointer ${
                videoType === 'FILE'
                  ? 'border-red-600 bg-red-50/40 text-red-950 font-bold'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Upload className={`w-5 h-5 ${videoType === 'FILE' ? 'text-red-600' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-bold">Upload Video File</div>
                <div className="text-[10px] text-slate-500">MP4, WebM, MOV</div>
              </div>
            </button>
          </div>

          {/* Video Input Box */}
          {videoType === 'URL' ? (
            <div className="space-y-2 pt-1">
              <div className="relative">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  required
                  placeholder="Paste YouTube Video Link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)"
                  value={videoUrl}
                  onChange={e => handleVideoUrlChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 px-1">
                Pasting a YouTube link automatically extracts the video ID and imports high-resolution preview graphics.
              </p>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <label className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 hover:bg-slate-100/60 transition-colors">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoFileUpload}
                  className="hidden"
                />
                {isUploadingVideo ? (
                  <div className="space-y-1">
                    <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <span className="text-xs font-bold text-slate-600 block">Uploading Video File...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-slate-400 mb-1.5" />
                    <span className="text-xs font-bold text-slate-700 block">Select Video File from Phone / PC</span>
                    <span className="text-[10px] text-slate-400 block">MP4, WebM, MOV (Max 50MB)</span>
                  </>
                )}
              </label>
              {videoUrl && (
                <p className="text-[11px] text-emerald-600 font-semibold px-1">
                  ✓ Video ready: {videoUrl}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Thumbnail Preview Box */}
        {thumbnailUrl && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Video Thumbnail Preview
              </span>
              <label className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer">
                <span>Upload Custom Thumbnail</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-sm group">
              <img
                src={thumbnailUrl}
                alt="Thumbnail Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                {duration}
              </span>
            </div>
          </div>
        )}

        {/* Step 2: Story Headline / Title */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
            2. Video Broadcast Headline / Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Ground Report: Heavy Traffic & Waterlogging at Hajipur Bridge After Morning Rains"
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-serif"
          />
        </div>

        {/* Step 3: 1-Line Summary & Description */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
            3. Summary / What Happened (Description)
          </label>
          <textarea
            rows={3}
            placeholder="Provide brief context on what readers and viewers will see in this video report..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all leading-relaxed"
          />
        </div>

        {/* Step 4: Badge & Approx. Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
              Report Badge
            </label>
            <input
              type="text"
              value={badge}
              onChange={e => setBadge(e.target.value.toUpperCase())}
              placeholder="e.g. BREAKING NEWS, GROUND REPORT, EXCLUSIVE"
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
              Approx. Duration
            </label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="MM:SS (e.g. 02:45)"
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Step 5: Tags & Byline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
              Video Tags (Comma Separated)
            </label>
            <div className="relative">
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="ground report, bihar, rain, traffic update"
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
              Reporter Byline
            </label>
            <div className="px-3.5 py-2.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>{reporter?.name || 'Verified Reporter'}</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Accredited Byline
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/reporter/videos"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            ← Cancel and Return to My Videos
          </Link>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('DRAFT')}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('PENDING_REVIEW')}
              className="flex-1 sm:flex-none px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-red-600/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Report...' : 'Submit to Editorial Desk →'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ReporterCreateVideoPage() {
  return (
    <ReporterLayout>
      <CreateVideoContent />
    </ReporterLayout>
  );
}

