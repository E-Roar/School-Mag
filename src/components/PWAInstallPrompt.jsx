import { useState, useEffect } from "react";

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="pointer-events-auto fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-3xl border border-white/20 shadow-neon p-4 max-w-sm">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-white mb-1">Install Magazine App</p>
          <p className="text-xs text-white/60">
            Add to your home screen for faster access and offline reading.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPrompt(false)}
            className="px-3 py-1 rounded-full bg-white/10 text-white text-xs hover:bg-white/20 transition"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="px-4 py-1 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

