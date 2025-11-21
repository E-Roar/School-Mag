import { atom, useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { useBookData } from "../context/BookDataContext";
import { defaultVisualSettings } from "../data/defaultBooks";
import { useAnalytics } from "../hooks/useAnalytics";

export const pageAtom = atom(0);

const MarqueeRow = ({ items, settings, reverse }) => {
  if (!items.length) {
    return null;
  }
  return (
    <div
      className={`bg-transparent ${
        reverse ? "animate-horizontal-scroll-2" : "animate-horizontal-scroll"
      } flex items-center gap-8 w-max px-8`}
      style={{
        animationDuration: `${settings.marqueeSpeed || 16}s`,
      }}
    >
      {items.map((text, idx) => (
        <span
          key={`${text}-${idx}-${reverse ? "r" : "f"}`}
          className="shrink-0 text-9xl font-bold uppercase tracking-tight"
          style={{
            fontFamily: settings.marqueeFontFamily,
            color: settings.marqueeColor,
          }}
        >
          {text}
        </span>
      ))}
    </div>
  );
};

export const UI = () => {
  const { selectedBook } = useBookData();
  const [page, setPage] = useAtom(pageAtom);
  const pages = selectedBook?.pages ?? [];
  const visualSettings = selectedBook?.visualSettings || defaultVisualSettings;
  const marqueeItems = useMemo(
    () => visualSettings.marqueeTexts ?? defaultVisualSettings.marqueeTexts,
    [visualSettings.marqueeTexts]
  );

  // Track analytics
  useAnalytics();

  useEffect(() => {
    if (!selectedBook) {
      return;
    }
    setPage(0);
  }, [selectedBook?.id, setPage]);

  useEffect(() => {
    if (page > pages.length) {
      setPage(pages.length);
    }
  }, [page, pages.length, setPage]);

  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Track user interaction for audio
  useEffect(() => {
    const handleInteraction = () => {
      setHasUserInteracted(true);
    };
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  useEffect(() => {
    if (!selectedBook || !hasUserInteracted) {
      return;
    }
    
    const audio = new Audio("/audios/page-flip-01a.mp3");
    const playPromise = audio.play();
    
    // Handle play() promise rejection
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // Auto-play was prevented, ignore silently
        // User interaction is already tracked, so next time it will work
      });
    }
    
    return () => {
      audio.pause();
    };
  }, [page, selectedBook?.id, hasUserInteracted]);

  if (!selectedBook) {
    return null;
  }

  const goToCover = () => setPage(0);
  const goToBackCover = () => setPage(pages.length);
  const goPrev = () => setPage((prev) => Math.max(0, prev - 1));
  const goNext = () => setPage((prev) => Math.min(pages.length, prev + 1));

  const pageLabel =
    page === 0
      ? "Cover"
      : page === pages.length
      ? "Back Cover"
      : `Page ${page}`;

  return (
    <>
      <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col">
        <div className="pointer-events-none mt-10 ml-10 h-20" />
        <div className="pointer-events-none flex justify-center w-full pb-10">
          <div className="pointer-events-auto flex items-center gap-4 bg-black/30 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 text-white">
            <button
              className={`uppercase tracking-[0.3em] text-xs px-3 py-2 rounded-full border ${
                page === 0 ? "border-white bg-white text-black" : "border-white/40"
              }`}
              onClick={goToCover}
            >
              Cover
            </button>
            <button
              className="uppercase tracking-[0.3em] text-xs px-3 py-2 rounded-full border border-white/40 hover:border-white"
              onClick={goPrev}
              disabled={page === 0}
            >
              Prev
            </button>
            <div className="min-w-[120px] text-center font-semibold uppercase tracking-[0.4em] text-xs">
              {pageLabel}
            </div>
            <button
              className="uppercase tracking-[0.3em] text-xs px-3 py-2 rounded-full border border-white/40 hover:border-white"
              onClick={goNext}
              disabled={page === pages.length}
            >
              Next
            </button>
            <button
              className={`uppercase tracking-[0.3em] text-xs px-3 py-2 rounded-full border ${
                page === pages.length
                  ? "border-white bg-white text-black"
                  : "border-white/40"
              }`}
              onClick={goToBackCover}
            >
              Back
            </button>
          </div>
        </div>
      </main>

      <div className="fixed inset-0 flex items-center -rotate-2 select-none pointer-events-none">
        <div className="relative pointer-events-none">
          <MarqueeRow items={marqueeItems} settings={visualSettings} reverse={false} />
          <div className="absolute top-0 left-0">
            <MarqueeRow items={marqueeItems} settings={visualSettings} reverse />
          </div>
        </div>
      </div>
    </>
  );
};
