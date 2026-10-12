'use client';

import React, { useState, useEffect } from 'react';
import { CategoryData, categoryService } from '@/services/categoryService';
import {
  X, Plus, Trash2, Check, RefreshCw, AlertCircle, CheckCircle,
  Tag, Eye, EyeOff, Pencil, Home
} from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  onUpdated
}) => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState<number>(15);
  const [showOnHome, setShowOnHome] = useState<boolean>(true);

  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editOrder, setEditOrder] = useState<number>(0);
  const [editShowOnHome, setEditShowOnHome] = useState<boolean>(true);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation Dialog State
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories(true);
      setCategories(data);
      if (data.length > 0) {
        setOrder(Math.max(...data.map(c => c.order || 0)) + 1);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setEditingId(null);
      setCategoryToDelete(null);
      loadCategories();
    }
  }, [isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(generatedSlug);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      await categoryService.createCategory({
        name: name.trim(),
        slug: slug.trim() || undefined,
        order: Number(order) || (categories.length + 1),
        isActive: true,
        showOnHome
      });

      setSuccessMsg(`✓ Category "${name}" added & list auto-adjusted!`);
      setName('');
      setSlug('');
      setShowOnHome(true);
      await loadCategories();
      onUpdated?.();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  // Start editing a category
  const startEdit = (cat: CategoryData) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditOrder(cat.order);
    setEditShowOnHome(cat.showOnHome !== false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditSlug('');
  };

  const handleEditNameChange = (val: string) => {
    setEditName(val);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setEditSlug(generated);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;

    try {
      setSavingEdit(true);
      setErrorMsg('');
      setSuccessMsg('');

      await categoryService.updateCategory(id, {
        name: editName.trim(),
        slug: editSlug.trim() || undefined,
        order: Number(editOrder) || 1,
        showOnHome: editShowOnHome
      });

      setSuccessMsg(`✓ Category "${editName}" moved to Position #${editOrder}. Subsequent categories auto-adjusted!`);
      setEditingId(null);
      await loadCategories();
      onUpdated?.();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update category');
    } finally {
      setSavingEdit(false);
    }
  };

  // Enable / Disable (Show / Hide on live website)
  const handleToggleActive = async (cat: CategoryData) => {
    const willBeActive = !cat.isActive;
    try {
      await categoryService.updateCategory(cat.id, { isActive: willBeActive });
      setCategories(prev =>
        prev.map(c => (c.id === cat.id ? { ...c, isActive: willBeActive } : c))
      );
      setSuccessMsg(
        willBeActive
          ? `✓ Category "${cat.name}" is now ENABLED (Visible on website)!`
          : `✓ Category "${cat.name}" is now DISABLED (Hidden from website)!`
      );
      onUpdated?.();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to toggle category status');
    }
  };

  // Toggle Show on Homepage
  const handleToggleShowOnHome = async (cat: CategoryData) => {
    const willShow = cat.showOnHome === false;
    try {
      await categoryService.updateCategory(cat.id, { showOnHome: willShow });
      setCategories(prev =>
        prev.map(c => (c.id === cat.id ? { ...c, showOnHome: willShow } : c))
      );
      setSuccessMsg(
        willShow
          ? `✓ Category "${cat.name}" is now SHOWN on Homepage!`
          : `✓ Category "${cat.name}" is now HIDDEN from Homepage!`
      );
      onUpdated?.();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to toggle homepage status');
    }
  };

  // Confirm and Execute Deletion
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      setErrorMsg('');
      await categoryService.deleteCategory(categoryToDelete.id);
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
      setSuccessMsg(`✓ Category "${categoryToDelete.name}" deleted & positions auto-adjusted!`);
      setCategoryToDelete(null);
      await loadCategories();
      onUpdated?.();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black font-serif text-slate-900">
                News Category Manager
              </h2>
              <p className="text-xs text-slate-500">
                Add, auto-shift positions, rename, and Enable/Disable categories from the live website.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Notifications */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Add Category Form */}
          <form onSubmit={handleCreate} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
              <Plus className="w-3.5 h-3.5 text-red-600" />
              <span>Add New Category</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Crime, Elections"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. crime"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-700 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="sm:col-span-3 flex items-center gap-2">
                <div className="w-16">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1" title="Target Position (e.g. 2, 5). Others will auto-shift!">
                    Position
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-center text-slate-900 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-1"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Show on Homepage Checkbox Option */}
            <div className="pt-2 border-t border-slate-100 flex items-center">
              <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOnHome}
                  onChange={(e) => setShowOnHome(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Home className="w-3.5 h-3.5 text-slate-500" />
                  <span>Show this Section on Homepage (in exact order sequence)</span>
                </span>
              </label>
            </div>
          </form>

          {/* Existing Categories List */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Categories List ({categories.length}) — Strictly Sequential #1 to #{categories.length}
              </span>
              <button
                onClick={loadCategories}
                className="text-xs text-slate-400 hover:text-red-600 flex items-center space-x-1 transition-colors cursor-pointer"
                title="Refresh Categories"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Reload</span>
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin text-red-600" />
                <span className="text-xs font-medium">Loading Categories from Database...</span>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {categories.map((cat) => {
                  const isEditing = editingId === cat.id;

                  if (isEditing) {
                    return (
                      <div
                        key={cat.id}
                        className="p-3.5 bg-red-50/60 border-l-4 border-red-500 space-y-2.5 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row items-center gap-2.5">
                          {/* Order Input */}
                          <div className="w-full sm:w-24 shrink-0">
                            <label className="block text-[10px] font-black uppercase text-slate-600 mb-0.5">
                              Position #
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={categories.length}
                              value={editOrder}
                              onChange={(e) => setEditOrder(Number(e.target.value))}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-black text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                              title="Set position number (e.g. 2, 3, 5). Others will auto-shift!"
                            />
                          </div>

                          {/* Name Input */}
                          <div className="w-full sm:flex-1">
                            <label className="block text-[10px] font-black uppercase text-slate-600 mb-0.5">
                              Category Name
                            </label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => handleEditNameChange(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                              placeholder="Category Name"
                            />
                          </div>

                          {/* Slug Input */}
                          <div className="w-full sm:flex-1">
                            <label className="block text-[10px] font-black uppercase text-slate-600 mb-0.5">
                              URL Slug
                            </label>
                            <input
                              type="text"
                              value={editSlug}
                              onChange={(e) => setEditSlug(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                              placeholder="url-slug"
                            />
                          </div>

                          {/* Show on Homepage checkbox */}
                          <div className="flex items-center self-end sm:self-center pt-2 sm:pt-4 px-2">
                            <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none" title="Tick to show this section on Homepage">
                              <input
                                type="checkbox"
                                checked={editShowOnHome}
                                onChange={(e) => setEditShowOnHome(e.target.checked)}
                                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                              />
                              <span className="text-[11px] font-bold text-slate-700 flex items-center space-x-0.5">
                                <Home className="w-3 h-3 text-slate-500" />
                                <span>Homepage</span>
                              </span>
                            </label>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1.5 self-end sm:self-center pt-2 sm:pt-4 shrink-0">
                            <button
                              type="button"
                              disabled={savingEdit || !editName.trim()}
                              onClick={() => handleSaveEdit(cat.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
                              title="Save changes and auto-shift positions"
                            >
                              {savingEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              <span>Save & Auto-Shift</span>
                            </button>
                            <button
                              type="button"
                              disabled={savingEdit}
                              onClick={cancelEdit}
                              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                              title="Cancel edit"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={cat.id}
                      className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                        cat.isActive ? 'bg-white hover:bg-slate-50/70' : 'bg-slate-50/80 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* Order Badge */}
                        <span
                          className={`w-7 h-7 rounded-lg border text-[11px] font-mono font-black flex items-center justify-center shrink-0 ${
                            cat.isActive
                              ? 'bg-slate-100 border-slate-200 text-slate-700'
                              : 'bg-slate-200 border-slate-300 text-slate-400'
                          }`}
                          title={`Position #${cat.order} in navigation`}
                        >
                          #{cat.order}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-bold ${cat.isActive ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                              {cat.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                              /{cat.slug}
                            </span>
                            {!cat.isActive && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                                Hidden from site
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {/* Edit Button */}
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Edit Name, Slug, or Position #"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Show on Homepage Toggle Button */}
                        <button
                          onClick={() => handleToggleShowOnHome(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-2xs ${
                            cat.showOnHome !== false
                              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200 border border-slate-200'
                          }`}
                          title={
                            cat.showOnHome !== false
                              ? 'Currently VISIBLE on Homepage. Click to HIDE section from Homepage.'
                              : 'Currently HIDDEN from Homepage. Click to SHOW section on Homepage.'
                          }
                        >
                          <Home className={`w-3.5 h-3.5 ${cat.showOnHome !== false ? 'text-amber-600' : 'text-slate-400'}`} />
                          <span>{cat.showOnHome !== false ? 'Home: ON' : 'Home: OFF'}</span>
                        </button>

                        {/* Enable / Disable Button */}
                        <button
                          onClick={() => handleToggleActive(cat)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-black flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs ${
                            cat.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                          }`}
                          title={
                            cat.isActive
                              ? 'Currently LIVE on website. Click to DISABLE / HIDE.'
                              : 'Currently HIDDEN from website. Click to ENABLE / RESTORE.'
                          }
                        >
                          {cat.isActive ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Enabled</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>Disabled</span>
                            </>
                          )}
                        </button>

                        {/* Delete Button (Opens Confirmation Dialog) */}
                        <button
                          onClick={() => setCategoryToDelete({ id: cat.id, name: cat.name })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete category permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 font-medium">
            💡 <strong>Full Admin Control:</strong> Click <strong>Enabled/Disabled</strong> to show or hide from website. Click <strong>✏️ Edit</strong> to change Position # or rename categories!
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 ml-4"
          >
            Done
          </button>
        </div>

        {/* Dedicated In-App Confirmation Popup for Deleting Category */}
        {categoryToDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
              <div className="flex items-start space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-slate-900 text-base">
                    Delete Category?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    Are you sure you want to permanently delete <strong className="text-slate-900">&quot;{categoryToDelete.name}&quot;</strong>? This will remove it from navigation and articles.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setCategoryToDelete(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDeleteCategory}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
