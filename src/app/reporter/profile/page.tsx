'use client';

import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, ShieldCheck, FileCheck, Lock,
  KeyRound, CheckCircle2, AlertCircle, ExternalLink, Calendar, Award
} from 'lucide-react';
import { ReporterLayout } from '@/components/reporter/ReporterLayout';
import { useReporterAuth } from '@/context/ReporterAuthContext';
import { reporterAuthService } from '@/services/reporterAuthService';

export default function ReporterProfilePage() {
  return (
    <ReporterLayout>
      <ReporterProfileContent />
    </ReporterLayout>
  );
}

function ReporterProfileContent() {
  const { reporter } = useReporterAuth();

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newPassword.length < 6) {
      setPassMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    setIsChangingPass(true);
    try {
      await reporterAuthService.changePassword(oldPassword, newPassword);
      setPassMessage({ text: 'Password changed successfully!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassMessage({ text: err.message || 'Failed to update password.', type: 'error' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const categories = (() => {
    try {
      if (Array.isArray(reporter?.preferredCategories)) {
        return reporter.preferredCategories;
      }
      if (typeof reporter?.preferredCategories === 'string') {
        return JSON.parse(reporter.preferredCategories);
      }
      return [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-black font-serif text-slate-900 tracking-tight">
            Reporter Profile & Security
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage your accredited newsroom identity, regional credentials, and password security.
          </p>
        </div>

        {/* Identity & Accreditation Overview Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-serif font-black text-2xl shadow-md shadow-red-600/20 shrink-0">
              {reporter?.name?.charAt(0) || 'R'}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900">{reporter?.name}</h2>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Accredited Reporter</span>
                </span>
              </div>

              <p className="text-xs text-slate-500 flex items-center space-x-2">
                <span>{reporter?.email}</span>
                <span>•</span>
                <span>{reporter?.phone || 'No phone added'}</span>
              </p>

              {(reporter?.district || reporter?.state) && (
                <p className="text-xs text-slate-600 flex items-center space-x-1 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>
                    {[reporter.city, reporter.district, reporter.state].filter(Boolean).join(', ')}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center shrink-0 min-w-[140px]">
            <Award className="w-5 h-5 text-red-600 mx-auto mb-1" />
            <div className="text-[10px] uppercase font-black tracking-wider text-slate-500">Editorial Desk</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">Live Contributor</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Identity & Verification Credentials Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <FileCheck className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-bold text-slate-900">Verification & ID Proof</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Document Type:</span>
                <span className="font-bold text-slate-900">{reporter?.idProofType || 'Aadhaar Card'}</span>
              </div>

              {reporter?.idProofNumber && (
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">ID Number:</span>
                  <span className="font-mono font-bold text-slate-900">{reporter.idProofNumber}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Account Status:</span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Approved by Editorial Board</span>
                </span>
              </div>

              {/* View Uploaded Document Link */}
              {reporter?.idProofUrl && (
                <div className="pt-2">
                  <span className="text-slate-500 font-medium block mb-2">Accreditation Document:</span>
                  <a
                    href={reporter.idProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors group"
                  >
                    <FileCheck className="w-4 h-4 text-red-600" />
                    <span>View Submitted Verification Document</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
                  </a>
                </div>
              )}

              {/* Reporting Beats / Categories */}
              {categories.length > 0 && (
                <div className="pt-2">
                  <span className="text-slate-500 font-medium block mb-2">Preferred News Beats:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {reporter?.bio && (
                <div className="pt-2">
                  <span className="text-slate-500 font-medium block mb-1">Journalist Bio:</span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    "{reporter.bio}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <KeyRound className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
            </div>

            {passMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  passMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{passMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Current Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPass}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
              >
                {isChangingPass ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>

        </div>

      </div>
  );
}

