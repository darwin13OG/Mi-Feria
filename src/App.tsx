import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { POSApp } from './components/POSApp';
import { ActivationScreen } from './components/pos/ActivationScreen';
import { LicenseGeneratorModal } from './components/LicenseGeneratorModal';
import { WhatsAppSupport } from './components/WhatsAppSupport';
import { PlanType, StandConfig } from './types';
import { loadStoredState, saveStoredState } from './lib/storage';
import { playSuccess } from './lib/audio';
import { WifiOff } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'pos' | 'activation'>(() => {
    if (typeof window === 'undefined') return 'landing';
    const params = new URLSearchParams(window.location.search);
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    const isPosParam = params.get('app') === 'pos' || params.get('view') === 'pos';
    const isActivationParam = params.get('app') === 'activation';

    if (isActivationParam) return 'activation';
    if (isStandalone || isPosParam) {
      return 'pos';
    }

    // Check if the user previously had an active session or opened the POS in this browser
    try {
      const stored = loadStoredState();
      const hasActiveSession =
        stored.config.isConfigured ||
        Boolean(stored.config.licenseKey) ||
        stored.sales.length > 0;
      const lastView = localStorage.getItem('miferia_active_view');
      if (lastView === 'pos' || hasActiveSession) {
        return 'pos';
      }
    } catch {
      // ignore
    }

    return 'landing';
  });

  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [licenseModalPlan, setLicenseModalPlan] = useState<PlanType>('premium');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Synchronize URL query parameter and local storage so browser/PWA remembers and installs the exact app view
  useEffect(() => {
    try {
      localStorage.setItem('miferia_active_view', currentView);
      const url = new URL(window.location.href);
      if (currentView === 'pos') {
        url.searchParams.set('app', 'pos');
      } else if (currentView === 'activation') {
        url.searchParams.set('app', 'activation');
      } else {
        url.searchParams.delete('app');
        url.searchParams.delete('view');
      }
      window.history.replaceState({}, document.title, url.toString());
    } catch {
      // ignore
    }
  }, [currentView]);

  // Synchronize dynamic PWA and favicon icons with the active plan
  useEffect(() => {
    try {
      const stored = loadStoredState();
      const currentPlan: PlanType = stored.config.plan || 'standard';
      const iconUrl = currentPlan === 'premium' ? '/logo-premium.png' : '/logo-standard.png';

      const appleIcon = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
      if (appleIcon) {
        appleIcon.href = iconUrl;
      }

      const iconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (iconLink) {
        iconLink.href = iconUrl;
      }
    } catch {
      // ignore
    }
  }, [currentView]);

  // Network monitor for offline feedback
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Detect Automatic Payment Return Query Parameters, recognize plan and sanitize URL immediately
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isPaymentApproved =
        urlParams.get('status') === 'approved' ||
        urlParams.get('pago') === 'exitoso' ||
        urlParams.get('approved') === 'true' ||
        urlParams.get('estado') === 'aprobado' ||
        urlParams.has('id'); // Wompi callback params

      const rawPlan = urlParams.get('plan');
      const storedPlan = (localStorage.getItem('feria_plan') || 'premium') as PlanType;
      const detectedPlan: PlanType =
        rawPlan === 'standard' || rawPlan === 'estandar'
          ? 'standard'
          : rawPlan === 'premium'
          ? 'premium'
          : storedPlan;

      if (isPaymentApproved) {
        // 1. Immediately clean URL parameters to prevent copy-paste / sharing tampering
        try {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch {
          // ignore
        }

        // 2. Play celebration sound
        playSuccess();

        // 3. Open license modal with detected plan
        setLicenseModalPlan(detectedPlan);
        setLicenseModalOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Scroll to top whenever the main view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView]);

  // Handle direct opening of the POS App
  const handleOpenApp = (preferredPlan?: PlanType) => {
    const stored = loadStoredState();
    if (preferredPlan) {
      stored.config.plan = preferredPlan;
      saveStoredState(stored);
    }
    setCurrentView('pos');
  };

  // Explicitly open the Activation Screen to input code
  const handleOpenActivation = (preferredPlan?: PlanType) => {
    const stored = loadStoredState();
    if (preferredPlan) {
      stored.config.plan = preferredPlan;
      saveStoredState(stored);
    }
    setCurrentView('activation');
  };

  // Handle activation completed
  const handleActivationComplete = (data: {
    ownerName: string;
    standId: string;
    plan: PlanType;
    licenseKey: string;
  }) => {
    const stored = loadStoredState();
    const updatedConfig: StandConfig = {
      ...stored.config,
      ownerName: data.ownerName,
      standId: data.standId,
      plan: data.plan,
      licenseKey: data.licenseKey,
      projectName: stored.config.projectName || data.ownerName,
      isConfigured: true,
    };

    saveStoredState({
      ...stored,
      config: updatedConfig,
    });

    setCurrentView('pos');
  };

  const handleOpenLicenseModal = (plan: PlanType = 'premium') => {
    setLicenseModalPlan(plan);
    setLicenseModalOpen(true);
  };

  return (
    <main className="relative min-h-screen bg-black font-sans antialiased selection:bg-cyan-500/30">
      {/* Offline Status Toast */}
      {!isOnline && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-semibold shadow-xl flex items-center gap-2 backdrop-blur-md animate-in fade-in">
          <WifiOff className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Modo 100% Offline Activado — Todos los datos están seguros.</span>
        </div>
      )}

      {/* Main View Switcher */}
      {currentView === 'landing' && (
        <LandingPage
          onOpenApp={handleOpenApp}
          onOpenActivation={handleOpenActivation}
          onOpenLicenseModal={handleOpenLicenseModal}
        />
      )}

      {currentView === 'activation' && (
        <ActivationScreen
          onActivated={handleActivationComplete}
          onGoToLanding={() => setCurrentView('landing')}
        />
      )}

      {currentView === 'pos' && (
        <POSApp
          onBackToLanding={() => setCurrentView('landing')}
          onOpenLicenseModal={() => handleOpenLicenseModal('premium')}
        />
      )}

      {/* Global License Generator Modal */}
      <LicenseGeneratorModal
        isOpen={licenseModalOpen}
        initialPlan={licenseModalPlan}
        onClose={() => setLicenseModalOpen(false)}
        onActivate={handleActivationComplete}
      />

      {/* Pulsing Floating WhatsApp Support Button (Solo en el portal informativo/landing, no dentro de la app) */}
      {currentView === 'landing' && <WhatsAppSupport />}
    </main>
  );
}
