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
  Globe, Tag, RefreshCw
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
      setTags(data.tags || '');
      setIsFeaturedHero(Boolean(data.isFeaturedHero));
      setIsTrending(Boolean(data.isTrending));
      setStatus(data.status || 'PUBLISHED');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load video details');
    } finally {
      setLoadingVideo(false);
    }
  };

  // Detect YouTube ID from URL
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

  // Upload Video File
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingVideo(true);
      setErrorMsg(null);
      const res = await videoService.uploadVideoFile(file);
      setVideoUrl(res.videoUrl);
      if (res.duration) setDuration(res.duration);
    } catch (err: any) {
      setErrorMsg(err.message || 'Video upload failed');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Upload Thumbnail Image
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        tags: tags.trim() || undefined,
        isFeaturedHero: false,
        isTrending: false,
        status
      });

      router.push('/admin/videos');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update video');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans select-none">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader title="Edit Video Broadcast" />

        <main className="p-6 sm:p-8 space-y-6 flex-1 max-w-6xl w-full mx-auto">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/videos"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-2xl font-black font-serif text-slate-900 tracking-tight">
                  Edit Video Broadcast
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update streaming URL, duration, category badges, and SEO metadata
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => router.push('/admin/videos')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isUploadingVideo || isUploadingThumb}
                className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md shadow-red-600/20 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loadingVideo ? (
            <div className="p-20 text-center text-slate-500 space-y-3 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-red-600" />
              <p className="text-xs font-mono">Loading video details...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left 8 Columns */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 1. Video Source Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <Film className="w-4 h-4 text-red-600" />
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Video Stream Source
                      </h3>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setVideoType('URL')}
                        className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          videoType === 'URL'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Youtube className="w-3.5 h-3.5" />
                        <span>YouTube / URL</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoType('FILE')}
                        className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          videoType === 'FILE'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload MP4</span>
                      </button>
                    </div>
                  </div>

                  {videoType === 'URL' ? (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        YouTube Link or Video Embed URL <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={videoUrl}
                          onChange={(e) => handleVideoUrlChange(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Upload Video File (MP4, WebM up to 250MB)
                      </label>
                      <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-8 text-center bg-slate-50/60 relative cursor-pointer">
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/ogg"
                          onChange={handleVideoFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-xs font-bold text-slate-800">
                          {isUploadingVideo ? 'Uploading video file...' : 'Replace video file'}
                        </p>
                      </div>
                      {videoUrl && (
                        <p className="text-xs text-emerald-600 font-mono flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Current: {videoUrl}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Player Preview */}
                  {videoUrl && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preview Player</span>
                      <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-200 shadow-xs">
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

                {/* 2. Metadata */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Video Headline / Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">URL Slug</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-700 font-mono focus:outline-none focus:border-red-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Synopsis / Description</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white resize-none leading-relaxed transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Duration (MM:SS)</label>
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-red-500 focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Reporting Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Reporter Name</label>
                      <input
                        type="text"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Badge Overlay</label>
                      <input
                        type="text"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 uppercase focus:outline-none focus:border-red-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Badge Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">Presets:</span>
                    {BADGE_PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setBadge(p)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase transition-colors cursor-pointer ${
                          badge === p
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. SEO */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      SEO & Social Sharing
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">SEO Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">SEO Meta Description</label>
                    <textarea
                      rows={2}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white font-mono"
                    />
                  </div>
                </div>

              </div>

              {/* Right 4 Columns */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Thumbnail */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Poster Thumbnail
                    </h3>
                  </div>

                  <div className="aspect-[16/10] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group">
                    {thumbnailUrl ? (
                      <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-600">Thumbnail URL</label>
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white"
                    />
                  </div>

                  <label className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center space-x-2 cursor-pointer transition-colors border border-slate-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingThumb ? 'Uploading...' : 'Upload New Thumbnail'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Status */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                    Publishing Status
                  </h3>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white cursor-pointer font-bold"
                  >
                    <option value="PUBLISHED">PUBLISHED (Live)</option>
                    <option value="DRAFT">DRAFT (Review)</option>
                    <option value="ARCHIVED">ARCHIVED (Hidden)</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingVideo || isUploadingThumb}
                    className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Updating Broadcast...' : 'Update Broadcast'}
                  </button>
                </div>

              </div>

            </form>
          )}

        </main>
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
