'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, Image as ImageIcon, Tag, CheckCircle, AlertCircle } from 'lucide-react';

interface SlotEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotData: {
    slotNumber: number;
    slotBadge: string;
    categoryBadge?: string;
    headline: string;
    subHeadline?: string;
    summary: string;
    imageUrl?: string;
    author: string;
  } | null;
  onSaveSlot: (updatedData: any) => void;
}

export const SlotEditorModal: React.FC<SlotEditorModalProps> = ({
  isOpen, onClose, slotData, onSaveSlot
}) => {
  const [headline, setHeadline] = useState('');
  const [categoryBadge, setCategoryBadge] = useState('');
  const [subHeadline, setSubHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (slotData) {
      setHeadline(slotData.headline || '');
      setCategoryBadge(slotData.categoryBadge || 'विशेष खबर');
      setSubHeadline(slotData.subHeadline || '');
      setSummary(slotData.summary || '');
      setImageUrl(slotData.imageUrl || '');
      setAuthor(slotData.author || 'विशेष संवाददाता • पटना');
    }
  }, [slotData]);

  if (!isOpen || !slotData) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      onSaveSlot({
        ...slotData,
        headline,
        categoryBadge,
        subHeadline,
        summary,
        imageUrl,
        author
      });
      setIsSaving(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-in fade-in duration-150">
      <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase font-mono">
                  {slotData.slotBadge}
                </span>
                <span className="text-xs font-bold text-slate-400">E-Paper Slot Live Editor</span>
              </div>
              <h2 className="text-lg font-black font-serif text-white mt-0.5">
                Edit {slotData.slotBadge} Content
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 max-h-[75vh]">
          
          {/* Category Badge & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Category Kicker Badge
              </label>
              <input
                type="text"
                value={categoryBadge}
                onChange={(e) => setCategoryBadge(e.target.value)}
                placeholder="नगर निगम / राजनीति / खेल"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 focus:border-red-500 rounded-xl text-xs text-white outline-none font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Reporter / Author Line
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="विशेष संवाददाता • पटना"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 focus:border-red-500 rounded-xl text-xs text-white outline-none font-semibold"
              />
            </div>
          </div>

          {/* Headline Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Slot Headline Title
            </label>
            <textarea
              rows={2}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Enter main story headline..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 focus:border-red-500 rounded-xl text-sm font-serif font-black text-white outline-none"
              required
            />
          </div>

          {/* Sub Headline */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Sub-Headline (Optional)
            </label>
            <input
              type="text"
              value={subHeadline}
              onChange={(e) => setSubHeadline(e.target.value)}
              placeholder="Enter secondary highlight title..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 focus:border-red-500 rounded-xl text-xs text-white outline-none"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Photo URL (Unsplash or CDN link)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 focus:border-red-500 rounded-xl text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Story Summary / Excerpt */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Story Summary Paragraph
            </label>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Enter story text summary..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 focus:border-red-500 rounded-xl text-xs text-slate-200 outline-none font-serif leading-relaxed"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <span>Saving to Express...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update & Publish Slot</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
