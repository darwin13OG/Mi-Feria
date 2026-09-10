import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { POSApp } from './components/POSApp';
import { ActivationScreen } from './components/pos/ActivationScreen';
import { LicenseGeneratorModal } from './components/LicenseGeneratorModal';
import { WhatsAppSupport } from './components/WhatsAppSupport';
import { PlanType, StandConfig } from './types';
import { loadStoredState, saveStoredState } from './lib/storage';
import { WifiOff } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'pos' | 'activation'>('landing');
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [licenseModalPlan, setLicenseModalPlan] = useState<PlanType>('premium');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  // Detect Automatic Payment Return Query Parameters
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isPaymentApproved =
        urlParams.get('status') === 'approved' ||
        urlParams.get('pago') === 'exitoso' ||
        urlParams.get('approved') === 'true' ||
        urlParams.has('id'); // Wompi callback params

      const storedPlan = (localStorage.getItem('feria_plan') || 'premium') as PlanType;
      const requestedPlan = (urlParams.get('plan') as PlanType) || storedPlan;

      if (isPaymentApproved) {
        setLicenseModalPlan(requestedPlan === 'standard' ? 'standard' : 'premium');
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

    // If already activated or configured, go straight to POS
    if (stored.config.licenseKey || stored.config.isConfigured) {
      setCurrentView('pos');
    } else {
      // First time activation screen
      setCurrentView('activation');
    }
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

      {/* Pulsing Floating WhatsApp Support Button */}
      <WhatsAppSupport />
    </main>
  );
}
