'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { ExitConfirmationModal } from './ExitConfirmationModal';

export const CapacitorBridge = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  const [isNative, setIsNative] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const showExitModalRef = useRef(false);
  showExitModalRef.current = showExitModal;

  const routerRef = useRef(router);
  routerRef.current = router;

  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // Handler to terminate the Android app
  const handleConfirmExit = useCallback(async () => {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { App } = await import('@capacitor/app');
        await App.exitApp();
      }
    } catch (_) {}
    setShowExitModal(false);
  }, []);

  // 1. Android Hardware Back Button & Native App Lifecycle
  useEffect(() => {
    let removeNativeListener: (() => void) | null = null;

    const handleBackPress = (AppInstance: any) => {
      // Step A: If the exit confirmation popup is already visible and user taps back again on Android -> Exit App!
      if (showExitModalRef.current) {
        setShowExitModal(false);
        AppInstance.exitApp();
        return;
      }

      // Step B: Dispatch custom event so any open modal (Search, E-Paper, Video) can cancel and close itself
      const backEvent = new CustomEvent('app_back_pressed', { cancelable: true });
      const wasPrevented = !window.dispatchEvent(backEvent);
      if (wasPrevented) {
        return;
      }

      // Step C: Dispatch Escape key in case other dialog overlays are open
      const hasOpenDialog = document.querySelector(
        '[role="dialog"]:not([aria-label="Exit Application Confirmation"]), [aria-modal="true"]:not([aria-label="Exit Application Confirmation"]), .modal-overlay, #video-modal, #search-modal, #epaper-modal'
      );
      if (hasOpenDialog) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        return;
      }

      // Step D: Check current route
      const currentPath = window.location.pathname || pathnameRef.current;
      const isRoot = currentPath === '/' || currentPath === '';

      if (!isRoot) {
        // User is on a subpage on phone (e.g. /cricket, /entertainment, /article/123)
        // Step back one page
        if (window.history.length > 1) {
          window.history.back();
          routerRef.current.back();
        } else {
          routerRef.current.push('/');
        }
        return;
      }

      // Step E: User is on Root / Home page on Android phone -> Show Exit Confirmation Modal!
      setShowExitModal(true);
    };

    const initCapacitor = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        // Strictly return if NOT running inside native Android/iOS app
        if (!Capacitor.isNativePlatform()) return;

        setIsNative(true);

        const { App } = await import('@capacitor/app');

        // Register Android hardware back button listener
        const listener = await App.addListener('backButton', () => {
          handleBackPress(App);
        });

        removeNativeListener = () => {
          listener.remove();
        };

        // Smoothly hide splash screen
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
      } catch (_) {
        // Silently ignore in non-native environments
      }
    };

    initCapacitor();

    // Android WebView backbutton event fallback
    const onDocBackButton = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;
        const { App } = await import('@capacitor/app');
        handleBackPress(App);
      } catch (_) {}
    };
    document.addEventListener('backbutton', onDocBackButton);

    return () => {
      document.removeEventListener('backbutton', onDocBackButton);
      if (removeNativeListener) removeNativeListener();
    };
  }, []);

  // 2. Synchronize Status Bar color & icons with Dark/Light theme (Only on native)
  useEffect(() => {
    const updateStatusBar = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        const { StatusBar, Style } = await import('@capacitor/status-bar');
        try {
          await StatusBar.setOverlaysWebView({ overlay: false });
        } catch (_) {}

        if (theme === 'dark') {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#020617' });
        } else {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
        }
      } catch (_) {}
    };

    updateStatusBar();
  }, [theme]);

  // If not running inside the native Android app, render nothing!
  if (!isNative) {
    return null;
  }

  return (
    <ExitConfirmationModal
      isOpen={showExitModal}
      onClose={() => setShowExitModal(false)}
      onConfirmExit={handleConfirmExit}
    />
  );
};
