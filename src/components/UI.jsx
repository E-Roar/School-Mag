import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { useBookData } from "../context/BookDataContext";
import { defaultVisualSettings } from "../data/defaultBooks";
import { useAnalytics } from "../hooks/useAnalytics";
import { pageAtom } from "../store";


const MarqueeRow = ({ items, settings, reverse }) => {
  if (!items.length) {
    return null;
  }
  return (
    <div
      className={`bg-transparent ${reverse ? "animate-horizontal-scroll-2" : "animate-horizontal-scroll"
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

  const isRTL = visualSettings.direction === 'rtl';

  // Track analytics
  useAnalytics();

  useEffect(() => {
    if (!selectedBook) {
      return;
    }
    // Set initial page based on direction
    setPage(isRTL ? pages.length : 0);
  }, [selectedBook?.id, setPage, isRTL, pages.length]);

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

  // In RTL, "Next" (visually left) should go to lower page numbers (physically next in Arabic book)
  // But wait, "Next" usually means "Advance in reading".
  // In LTR: Page 0 -> Page 1 -> Page 2. Next = +1.
  // In RTL: Page N -> Page N-1 -> Page N-2. Next = -1.

  // User said: "flip the buttom nav ui to rtl"
  // Standard LTR UI: [Cover] [Prev] [Label] [Next]
  // Standard RTL UI: [Next] [Label] [Prev] [Cover] (visually flipped)

  // Let's define logical actions first
  const advancePage = () => setPage((prev) => Math.min(pages.length, prev + 1));
  const retreatPage = () => setPage((prev) => Math.max(0, prev - 1));

  // In RTL mode:
  // "Next" button (advancing content) should decrease page number (moving towards cover? No, cover is 0).
  // Wait, if book starts at last page (e.g. 10), reading "forward" means going 10 -> 9 -> 8.
  // So "Next" (advance) = retreatPage (-1).
  // "Prev" (go back) = advancePage (+1).

  const handleNext = isRTL ? retreatPage : advancePage;
  const handlePrev = isRTL ? advancePage : retreatPage;

  const pageLabel =
    page === 0
      ? "Cover"
      : `Page ${page}`;

  return (
    <>
      <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col">
        <div className="pointer-events-none mt-4 md:mt-10 ml-4 md:ml-10 h-10 md:h-20" />
        <div className="pointer-events-none flex justify-center w-full pb-4 md:pb-10 px-2">
          <div className={`pointer-events-auto flex items-center gap-1.5 sm:gap-4 bg-black/30 backdrop-blur-xl border border-white/20 rounded-full px-2 sm:px-6 py-2 sm:py-3 text-white max-w-full overflow-x-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              className={`uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border whitespace-nowrap ${page === 0 ? "border-white bg-white text-black" : "border-white/40"
                }`}
              onClick={goToCover}
            >
              Cover
            </button>
            <button
              className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border border-white/40 hover:border-white whitespace-nowrap"
              onClick={handlePrev}
              disabled={isRTL ? page === pages.length : page === 0}
            >
              Prev
            </button>
            <div className="min-w-[80px] sm:min-w-[120px] text-center font-semibold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-[10px] sm:text-xs whitespace-nowrap">
              {pageLabel}
            </div>
            <button
              className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border border-white/40 hover:border-white whitespace-nowrap"
              onClick={handleNext}
              disabled={isRTL ? page === 0 : page === pages.length}
            >
              Next
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
