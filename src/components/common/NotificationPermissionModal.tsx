'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const FALLBACK_VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BAcP7puTevytIAkMLQgIzbpzF-Clhevd2nKTbBLZLj35LFl6hoJ6Ed3EoBEtHT4rw5lGLuOxvNpi4qWZqCNx32U';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribeUserToPush(registration: ServiceWorkerRegistration) {
  try {
    let vapidPublicKey = FALLBACK_VAPID_PUBLIC_KEY;

    // Attempt to fetch latest active public key from backend
    try {
      const res = await fetch(`${API_BASE}/push/public-key`);
      const data = await res.json();
      if (data?.data?.publicKey) {
        vapidPublicKey = data.data.publicKey;
      }
    } catch (_) {}

    if (!vapidPublicKey) return null;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
    }

    // Save to backend database
    if (subscription) {
      await fetch(`${API_BASE}/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() })
      });
    }

    return subscription;
  } catch (err) {
    console.warn('[WebPush] Push subscription error:', err);
    return null;
  }
}

export const NotificationPermissionModal: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  // STRICT RULE: Never show on Admin Panel or Reporter Dashboard! Only for public news readers!
  const isExcludedRoute = pathname.startsWith('/admin') || pathname.startsWith('/reporter');

  useEffect(() => {
    // Only run on client browser and on PUBLIC website routes
    if (typeof window === 'undefined' || isExcludedRoute) return;

    // Check if browser supports notifications
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (!supported) return;

    // If browser permission is already granted, ensure service worker is subscribed in backend
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        navigator.serviceWorker.ready.then((readyReg) => {
          subscribeUserToPush(readyReg);
        });
      }).catch(() => {});
      return;
    }

    if (Notification.permission === 'denied') {
      return;
    }

    // Check if dismissed in this session
    const dismissedThisSession = sessionStorage.getItem('vartiq_notif_dismissed');
    if (dismissedThisSession) {
      return;
    }

    // Check if user previously clicked LATER with cooldown (12 hours)
    const dismissedUntil = localStorage.getItem('vartiq_notif_dismissed_until');
    if (dismissedUntil) {
      const expiry = parseInt(dismissedUntil, 10);
      if (Date.now() < expiry) {
        return;
      }
    }

    // Show popup after 3 seconds on public website
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname, isExcludedRoute]);

  const handleDismiss = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      // Remember for current session and set 12-hour cooldown
      sessionStorage.setItem('vartiq_notif_dismissed', 'true');
      const twelveHoursMs = 12 * 60 * 60 * 1000;
      localStorage.setItem('vartiq_notif_dismissed_until', String(Date.now() + twelveHoursMs));
    }
  };

  const handleAllow = async () => {
    setIsOpen(false);
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    try {
      // 1. Request native browser notification permission
      const permission = await Notification.requestPermission();

      // 2. Register Service Worker and push subscribe
      if ('serviceWorker' in navigator && permission === 'granted') {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          const readyReg = await navigator.serviceWorker.ready;
          await subscribeUserToPush(readyReg || reg);
        } catch (_) {}

        localStorage.setItem('vartiq_notif_permission', 'granted');
        localStorage.removeItem('vartiq_notif_dismissed_until');

        // Show welcome confirmation notification
        try {
          new Notification('Vartiq News 🔔', {
            body: 'नोटिफिकेशन सफलतापूर्वक चालू हो गया है! अब आपको ताज़ा और ब्रेकिंग खबरें तुरंत मिलती रहेंगी।',
            icon: '/icon.png',
            badge: '/icon.png'
          });
        } catch (_) {}
      } else {
        localStorage.setItem('vartiq_notif_permission', 'denied');
      }
    } catch (_) {
      handleDismiss();
    }
  };

  if (!isOpen || !isSupported || isExcludedRoute) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-perm-title"
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleDismiss}
    >
      {/* DIALOG BOX (Pixel-perfect matching Shuru App screenshot, 100% Mobile & Desktop Responsive) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[360px] bg-white rounded-lg shadow-2xl p-6 sm:p-7 relative border border-gray-100 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <Bell className="w-4 h-4 fill-red-600" />
          </div>
          <h3
            id="notif-perm-title"
            className="text-[17px] font-bold text-gray-900 tracking-tight leading-snug"
          >
            Notification Permission Required
          </h3>
        </div>

        <p className="text-[13.5px] text-gray-600 leading-relaxed font-normal mb-6">
          Allow Vartiq News to send you notifications to send you instant updates from your area.
        </p>

        <div className="flex items-center justify-end gap-5">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-[13px] font-bold tracking-wider text-rose-500 hover:text-rose-600 active:scale-95 transition-all uppercase py-1 px-2 cursor-pointer focus:outline-none"
          >
            LATER
          </button>
          <button
            type="button"
            onClick={handleAllow}
            className="text-[13px] font-bold tracking-wider text-rose-500 hover:text-rose-600 active:scale-95 transition-all uppercase py-1 px-2 cursor-pointer focus:outline-none"
          >
            OKAY
          </button>
        </div>
      </div>
    </div>
  );
};
