'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { videoService, VideoData } from '@/services/videoService';
import {
  ArrowLeft, Upload, Link2, Youtube, Sparkles, Check,
  AlertCircle, Film, Image as ImageIcon, Eye, Play,
  Globe, Tag, Search, Clock, MapPin, User, Sliders, Layers,
  ExternalLink, Video, CheckCircle, FileText
} from 'lucide-react';

const BADGE_PRESETS = [
  'BREAKING NEWS',
  'EXCLUSIVE',
  'GROUND REPORT',
  'SPECIAL REPORT',
  'MATCH PREVIEW',
  'INVESTIGATION',
  'ECONOMY'
];

function AdminVideoEditContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user, isLoading: authLoading } = useAdminAuth();

  const [loadingVideo, setLoadingVideo] = useState(true);

  // Mode: 'URL' or 'FILE'
  const [videoType, setVideoType] = useState<'URL' | 'FILE'>('URL');

  // Inspector Tab: 'specs' | 'media' | 'seo'
  const [inspectorTab, setInspectorTab] = useState<'specs' | 'media' | 'seo'>('specs');

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('04:30');
  const [badge, setBadge] = useState('EXCLUSIVE');
  const [location, setLocation] = useState('NEW DELHI, INDIA');
  const [reporterName, setReporterName] = useState('News Desk');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [tags, setTags] = useState('');

  // Toggles
  const [isFeaturedHero, setIsFeaturedHero] = useState(false);
  const [isTrending, setIsTrending] = useState(true);
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('PUBLISHED');

  // Upload States
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (id) {
      loadVideo();
    }
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoadingVideo(true);
      const data = await videoService.getVideoByIdOrSlug(id);
      setTitle(data.title || '');
      setSlug(data.slug || '');
      setDescription(data.description || '');
      setVideoType(data.videoType === 'FILE' ? 'FILE' : 'URL');
      setVideoUrl(data.videoUrl || '');
      setYoutubeId(data.youtubeId || '');
      setThumbnailUrl(data.thumbnailUrl || '');
      setDuration(data.duration || '04:30');
      setBadge(data.badge || '');
      setLocation(data.location || '');
      setReporterName(data.reporterName || '');
      setMetaTitle(data.metaTitle || '');
      setMetaDescription(data.metaDescription || '');
      setMetaKeywords(data.metaKeywords || '');
      setCanonicalUrl(data.canonicalUrl || '');
      setTags(data.tags || '');
      setIsFeaturedHero(Boolean(data.isFeaturedHero));
      setIsTrending(Boolean(data.isTrending));
      setStatus(data.status || 'PUBLISHED');
    } catch (err: any) {
      setErrorMsg('Failed to load video details');
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug) {
      setSlug(generateSlug(val));
    }
  };

  const generateSlug = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      const vidId = ytMatch[1];
      setYoutubeId(vidId);
      if (!thumbnailUrl) {
        setThumbnailUrl(`https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`);
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

  const handleSubmit = async (publishStatus: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED') => {
    if (!title.trim()) {
      setErrorMsg('Video title is required');
      return;
    }
    if (!videoUrl.trim()) {
      setErrorMsg('Video URL or uploaded file is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const finalVideoType: 'YOUTUBE' | 'FILE' | 'EXTERNAL_EMBED' =
        videoType === 'FILE' ? 'FILE' : (youtubeId.trim() ? 'YOUTUBE' : 'EXTERNAL_EMBED');

      await videoService.updateVideo(id, {
        title: title.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        videoType: finalVideoType,
        videoUrl: videoUrl.trim(),
        youtubeId: youtubeId.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        duration: duration.trim() || undefined,
        category: 'general',
        subCategory: undefined,
        badge: badge.trim() || undefined,
        location: location.trim() || undefined,
        reporterName: reporterName.trim() || undefined,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        metaKeywords: metaKeywords.trim() || undefined,
        canonicalUrl: canonicalUrl.trim() || undefined,
        tags: tags.trim() || undefined,
        isFeaturedHero,
        isTrending,
        status: publishStatus
      });

      router.push('/admin/videos');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update video');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingVideo) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-600">Loading Video Package...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <AdminHeader title="Video Broadcast Studio" />

        {/* Pinned Editorial Header Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <Link
                href="/admin/videos"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                title="Back to Video Studio"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'} shrink-0`} />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 truncate">
                    {status === 'PUBLISHED' ? 'Live Broadcast' : 'Draft'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[240px] sm:max-w-md">
                    {title || 'Untitled Broadcast'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium mt-0.5">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-slate-700">{duration || '00:00'}</span>
                  </span>
                  <span>•</span>
                  <span>{badge || 'STANDARD'}</span>
                  <span>•</span>
                  <span>{reporterName}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2.5 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                disabled={isSubmitting || isUploadingVideo || isUploadingThumb}
                onClick={() => handleSubmit('DRAFT')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting || isUploadingVideo || isUploadingThumb}
                onClick={() => handleSubmit('PUBLISHED')}
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isSubmitting ? 'Saving...' : 'Update & Publish'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Canvas & Inspector */}
        <div className="p-4 sm:p-8 pb-36 sm:pb-44 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center space-x-2 shadow-2xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Main Broadcast Content (8 cols) */}
            <div className="lg:col-span-8 space-y-6">

              {/* Title & Slug Card */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                    Broadcast Headline <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter bold video headline..."
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none p-0 text-2xl sm:text-3xl font-black font-serif text-slate-900 placeholder:text-slate-300 focus:ring-0 leading-tight resize-none"
                  />
                </div>

                <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-700">
                  <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0 font-sans" />
                  <span className="text-slate-400 font-medium select-none shrink-0 font-sans">
                    thenewspaper.com/videos/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="custom-video-slug"
                    className="w-full bg-transparent border-0 outline-none p-0 text-xs font-mono text-slate-800 placeholder-slate-400 font-bold"
                  />
                </div>

                {/* Badge Overlay Presets */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                    Broadcast Badge Tag
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {BADGE_PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setBadge(p)}
                        className={`text-[10px] px-3 py-1 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                          badge === p
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Video Stream Source Card */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Film className="w-4 h-4 text-red-600" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Video Stream Source
                    </h3>
                  </div>

                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setVideoType('URL')}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                        videoType === 'URL'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-600" />
                      <span>YouTube / Web URL</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoType('FILE')}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                        videoType === 'FILE'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Upload Video File</span>
                    </button>
                  </div>
                </div>

                {videoType === 'URL' ? (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                      YouTube URL or Embed Stream Link <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => handleVideoUrlChange(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="border-2 border-dashed border-slate-300 hover:border-red-500 bg-slate-50/50 hover:bg-red-50/20 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all group">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg"
                        onChange={handleVideoFileUpload}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-slate-400 group-hover:text-red-600 transition-colors mb-2" />
                      <span className="text-xs font-bold text-slate-800 group-hover:text-red-600">
                        {isUploadingVideo ? 'Uploading video file...' : 'Click to browse MP4/WebM file'}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">High definition up to 250MB supported</span>
                    </label>
                    {videoUrl && (
                      <p className="text-xs text-emerald-600 font-mono flex items-center gap-1 mt-2">
                        <Check className="w-3.5 h-3.5" /> File Attached: {videoUrl}
                      </p>
                    )}
                  </div>
                )}

                {/* Live Video Player Preview */}
                {videoUrl && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Stream Live Preview</span>
                    <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                      {youtubeId ? (
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                          className="w-full h-full border-0"
                          title="Preview"
                          allowFullScreen
                        />
                      ) : (
                        <video src={videoUrl} controls className="w-full h-full object-contain" />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Synopsis / Description Card */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Video Context & Editorial Overview
                  </h3>
                </div>

                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed report context, key quotes, ground situation and news summary for this visual broadcast..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none leading-relaxed"
                />
              </div>

            </div>

            {/* RIGHT COLUMN: Inspector Rail (4 cols, Sticky) */}
            <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">

              {/* Inspector Tab Selector */}
              <div className="sticky top-0 z-20 bg-slate-100/95 backdrop-blur-md pb-1 pt-0.5">
                <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setInspectorTab('specs')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      inspectorTab === 'specs'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Specs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectorTab('media')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      inspectorTab === 'media'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Poster</span>
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
                    <span>SEO</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: Specs & Editorial Settings */}
              {inspectorTab === 'specs' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5">
                      Broadcast Properties
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Duration (MM:SS)
                      </label>
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="04:30"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Reporting Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. NEW DELHI, INDIA"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Reporter / Anchor Name
                      </label>
                      <input
                        type="text"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        placeholder="e.g. Vikramaditya Rao"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Tags (Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="ISRO, Chandrayaan4, Space"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Distribution Toggles */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5">
                      Broadcast Placement
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                      <div className="space-y-0.5 pr-2">
                        <span className="text-xs font-bold text-slate-800 block">Lead Hero Broadcast</span>
                        <span className="text-[10px] text-slate-400 block">Pins as featured marquee on Video Studio</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={isFeaturedHero}
                          onChange={(e) => setIsFeaturedHero(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                      <div className="space-y-0.5 pr-2">
                        <span className="text-xs font-bold text-slate-800 block">Trending Video</span>
                        <span className="text-[10px] text-slate-400 block">Pushed into Trending visual carousel</span>
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
                  </div>
                </div>
              )}

              {/* TAB 2: Poster Thumbnail Media */}
              {inspectorTab === 'media' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5">
                      Broadcast Cover Poster
                    </div>

                    <div className="aspect-[16/9] bg-slate-900 rounded-xl overflow-hidden border border-slate-200 relative group shadow-2xs">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt="Poster preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-1">
                          <ImageIcon className="w-8 h-8 text-slate-400" />
                          <span className="text-xs font-medium">No poster assigned</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Poster Image Link
                      </label>
                      <input
                        type="url"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        placeholder="https://img.youtube.com/vi/..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center space-x-2 cursor-pointer transition-colors border border-slate-200">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingThumb ? 'Uploading...' : 'Upload Local Poster File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SEO & Social Optimization */}
              {inspectorTab === 'seo' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5">
                      Search Optimization
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        maxLength={70}
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder="SEO title for search engines"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Meta Description
                      </label>
                      <textarea
                        rows={3}
                        maxLength={180}
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="Search snippet summary..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={metaKeywords}
                        onChange={(e) => setMetaKeywords(e.target.value)}
                        placeholder="ISRO, Chandrayaan4, Space"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminVideoEditPage() {
  return (
    <AdminAuthProvider>
      <AdminVideoEditContent />
    </AdminAuthProvider>
  );
}
