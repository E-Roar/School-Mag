import { useMemo, useState } from "react";
import { useBookData } from "../context/BookDataContext";
import { AnalyticsPanel } from "./AnalyticsPanel";

const PageUploader = ({
  index,
  page,
  bookId,
  updatePageImage,
  canRemove,
  onRemove,
}) => {
  const [frontUrl, setFrontUrl] = useState("");
  const [backUrl, setBackUrl] = useState("");

  const handleUpload = (event, side) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    updatePageImage(bookId, index, side, file);
    event.target.value = "";
  };

  const handleUrlSubmit = (side) => {
    const url = side === "front" ? frontUrl : backUrl;
    if (!url.trim()) {
      return;
    }
    updatePageImage(bookId, index, side, url.trim());
    if (side === "front") {
      setFrontUrl("");
    } else {
      setBackUrl("");
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/15 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h5 className="font-semibold text-white">Page {index}</h5>
          <span className="text-xs uppercase tracking-widest text-white/60">
            {page.label}
          </span>
        </div>
        {canRemove && (
          <button
            className="text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-white/30 text-white/80 hover:bg-white/10 transition"
            onClick={onRemove}
          >
            Remove
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
        <div className="space-y-2">
          <p className="font-medium text-white">Front</p>
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/30 border border-white/10 flex items-center justify-center">
            <img src={page.frontSrc} alt="" className="object-cover w-full h-full" />
          </div>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-white/60">
              Upload
            </span>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-xs text-white/80 file:mr-2 file:rounded-full file:border-0 file:bg-white/20 file:px-3 file:py-1 file:text-xs file:uppercase"
              onChange={(event) => handleUpload(event, "front")}
            />
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={frontUrl}
              placeholder="Paste image URL"
              className="flex-1 rounded-full bg-black/40 px-3 py-1 text-xs outline-none border border-white/10 focus:border-white/40"
              onChange={(event) => setFrontUrl(event.target.value)}
            />
            <button
              className="text-xs uppercase px-3 py-1 rounded-full bg-white/30 hover:bg-white/50 transition"
              onClick={() => handleUrlSubmit("front")}
            >
              Use
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-white">Back</p>
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/30 border border-white/10 flex items-center justify-center">
            <img src={page.backSrc} alt="" className="object-cover w-full h-full" />
          </div>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-white/60">
              Upload
            </span>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-xs text-white/80 file:mr-2 file:rounded-full file:border-0 file:bg-white/20 file:px-3 file:py-1 file:text-xs file:uppercase"
              onChange={(event) => handleUpload(event, "back")}
            />
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={backUrl}
              placeholder="Paste image URL"
              className="flex-1 rounded-full bg-black/40 px-3 py-1 text-xs outline-none border border-white/10 focus:border-white/40"
              onChange={(event) => setBackUrl(event.target.value)}
            />
            <button
              className="text-xs uppercase px-3 py-1 rounded-full bg-white/30 hover:bg-white/50 transition"
              onClick={() => handleUrlSubmit("back")}
            >
              Use
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccordionSection = ({ title, description, isOpen, onToggle, children }) => {
  return (
    <div className="glass-panel rounded-2xl border border-white/15">
      <button
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        onClick={onToggle}
      >
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/70">
            {description}
          </p>
          <h4 className="text-lg font-semibold">{title}</h4>
        </div>
        <span className="text-xl font-bold text-cyan-200">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
};

const VisualSettingsPanel = ({ book }) => {
  const { updateVisualSettings } = useBookData();
  const settings = book.visualSettings;

  const handleChange = (field, value) => {
    updateVisualSettings(book.id, { [field]: value });
  };

  const handleTextsChange = (value) => {
    const list = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    updateVisualSettings(book.id, { marqueeTexts: list });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          Scene Styling
        </p>
        <h4 className="text-lg font-semibold text-white">Backdrop Controls</h4>
      </div>
      <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
        <span className="text-xs uppercase tracking-[0.3em] text-white/70">
          Right to Left (RTL)
        </span>
        <div className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.direction === 'rtl'}
            onChange={(event) => handleChange("direction", event.target.checked ? 'rtl' : 'ltr')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
        </div>
      </label>
      <label className="text-xs uppercase tracking-[0.3em] text-white/50 flex flex-col gap-2">
        Gradient Start
        <input
          type="color"
          value={settings.gradientStart}
          onChange={(event) => handleChange("gradientStart", event.target.value)}
          className="h-10 rounded-xl border border-white/20 bg-transparent"
        />
      </label>
      <label className="text-xs uppercase tracking-[0.3em] text-white/50 flex flex-col gap-2">
        Gradient End
        <input
          type="color"
          value={settings.gradientEnd}
          onChange={(event) => handleChange("gradientEnd", event.target.value)}
          className="h-10 rounded-xl border border-white/20 bg-transparent"
        />
      </label>
      <label className="text-xs uppercase tracking-[0.3em] text-white/50 flex flex-col gap-2">
        Marquee Text (one per line)
        <textarea
          value={settings.marqueeTexts.join("\n")}
          onChange={(event) => handleTextsChange(event.target.value)}
          rows={4}
          className="rounded-2xl bg-black/40 border border-white/10 p-3 text-white text-sm resize-none"
        />
      </label>
      <label className="text-xs uppercase tracking-[0.3em] text-white/50 flex flex-col gap-2">
        Font Family
        <input
          type="text"
          value={settings.marqueeFontFamily}
          onChange={(event) =>
            handleChange("marqueeFontFamily", event.target.value)
          }
          className="rounded-full bg-black/40 border border-white/10 px-4 py-2 text-white text-sm"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs uppercase tracking-[0.3em] text-white/50 flex flex-col gap-2">
          Text Color
          <input
            type="color"
            value={settings.marqueeColor}
            onChange={(event) =>
              handleChange("marqueeColor", event.target.value)
            }
            className="h-10 rounded-xl border border-white/20 bg-transparent"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50 flex flex-col gap-2">
          Scroll Speed (s)
          <input
            type="number"
            min={4}
            max={60}
            value={settings.marqueeSpeed}
            onChange={(event) =>
              handleChange("marqueeSpeed", Number(event.target.value) || 16)
            }
            className="rounded-full bg-black/40 border border-white/10 px-4 py-2 text-white text-sm"
          />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2">
        <label className="text-xs uppercase tracking-[0.3em] text-white/50 flex flex-col gap-2">
          Float Intensity
          <input
            type="range"
            min={0}
            max={5}
            step={0.1}
            value={settings.floatIntensity}
            onChange={(event) =>
              handleChange("floatIntensity", Number(event.target.value))
            }
          />
          <span className="text-xs text-white/70">
            {settings.floatIntensity.toFixed(1)}
          </span>
        </label>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50 flex flex-col gap-2">
          Rotation
          <input
            type="range"
            min={0}
            max={5}
            step={0.1}
            value={settings.rotationIntensity}
            onChange={(event) =>
              handleChange("rotationIntensity", Number(event.target.value))
            }
          />
          <span className="text-xs text-white/70">
            {settings.rotationIntensity.toFixed(1)}
          </span>
        </label>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50 flex flex-col gap-2">
          Float Speed
          <input
            type="range"
            min={0}
            max={5}
            step={0.1}
            value={settings.floatSpeed}
            onChange={(event) =>
              handleChange("floatSpeed", Number(event.target.value))
            }
          />
          <span className="text-xs text-white/70">
            {settings.floatSpeed.toFixed(1)}
          </span>
        </label>
      </div>
    </div>
  );
};

const IssueSettingsPanel = ({ book }) => {
  const { updateBookMeta } = useBookData();

  const handleChange = (field, value) => {
    updateBookMeta(book.id, { [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          Issue Details
        </p>
        <h4 className="text-lg font-semibold text-white">Metadata</h4>
      </div>
      <label className="text-xs uppercase tracking-[0.3em] text-white/50 flex flex-col gap-2">
        Title
        <input
          type="text"
          value={book.title ?? ""}
          onChange={(event) => handleChange("title", event.target.value)}
          className="rounded-full bg-black/40 border border-white/10 px-4 py-2 text-white text-sm"
        />
      </label>
      <label className="text-xs uppercase tracking-[0.3em] text-white/50 flex flex-col gap-2">
        Subtitle
        <input
          type="text"
          value={book.subtitle ?? ""}
          onChange={(event) => handleChange("subtitle", event.target.value)}
          className="rounded-full bg-black/40 border border-white/10 px-4 py-2 text-white text-sm"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs uppercase tracking-[0.3em] text-white/50 flex flex-col gap-2">
          Issue Tag
          <input
            type="text"
            value={book.issueTag ?? ""}
            onChange={(event) => handleChange("issueTag", event.target.value)}
            className="rounded-full bg-black/40 border border-white/10 px-4 py-2 text-white text-sm"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50 flex flex-col gap-2">
          Issue Date
          <input
            type="date"
            value={book.releaseDate?.slice(0, 10) ?? ""}
            onChange={(event) => handleChange("releaseDate", event.target.value)}
            className="rounded-full bg-black/40 border border-white/10 px-4 py-2 text-white text-sm"
          />
        </label>
      </div>
      <label className="text-xs uppercase tracking-[0.3em] text-white/50 flex flex-col gap-2">
        List of Content (search keywords)
        <textarea
          value={book.listOfContent ?? ""}
          onChange={(event) => handleChange("listOfContent", event.target.value)}
          rows={4}
          className="rounded-2xl bg-black/40 border border-white/10 p-3 text-white text-sm resize-none"
          placeholder="Principal Letter; Arts Festival..."
        />
      </label>
      <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
        <span className="text-xs uppercase tracking-[0.3em] text-white/70">
          Published
        </span>
        <div className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={book.is_published ?? false}
            onChange={(event) => handleChange("is_published", event.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
        </div>
      </label>
    </div>
  );
};

export const Dashboard = () => {
  const { selectedBook, updatePageImage, addPage, removePage, refetch, isLoading, isDemoMode } = useBookData();
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState("issue");
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(""); // 'success', 'error', ''

  const visiblePages = useMemo(() => selectedBook?.pages ?? [], [selectedBook]);

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveStatus("");
    try {
      // Refetch to ensure all changes are synced
      await refetch();
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Error saving changes:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        className="pointer-events-auto fixed top-16 md:top-20 right-3 md:right-6 z-40 rounded-full glass-chip px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs uppercase tracking-widest text-white border border-white/20 hover:bg-white/10 transition shadow-neon"
        onClick={() => setAnalyticsOpen(true)}
      >
        Analytics
      </button>
      <AnalyticsPanel isOpen={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
      <aside className="pointer-events-none fixed inset-y-0 right-0 flex items-center pr-0 md:pr-4 z-30">
        <div className="pointer-events-auto w-full md:w-[28rem] md:max-w-full glass-panel text-white rounded-none md:rounded-3xl border-0 md:border border-white/20 shadow-neon overflow-hidden h-full md:h-auto">
          <button
            className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-xs md:text-sm uppercase tracking-widest border-b border-white/10"
            onClick={() => setOpen((prev) => !prev)}
          >
            <span>Admin Dashboard</span>
            <span>{open ? "−" : "+"}</span>
          </button>
          {open && (
            <div className="max-h-[calc(100vh-120px)] md:max-h-[70vh] overflow-y-auto p-4 md:p-5 space-y-3 md:space-y-4 glass-scroll">
              {isDemoMode && (
                <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-center">
                  <p className="text-xs text-blue-200 font-medium uppercase tracking-wider">
                    👀 Demo Mode: Changes are local only and cannot be saved.
                  </p>
                </div>
              )}
              {selectedBook && (
                <div className="glass-panel rounded-2xl border border-white/15 p-4 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                      Editing
                    </p>
                    <h4 className="text-lg font-semibold">{selectedBook.title}</h4>
                    <p className="text-sm text-white/70">{selectedBook.subtitle}</p>
                  </div>
                  <button
                    onClick={handleSaveAll}
                    disabled={saving || isLoading || isDemoMode}
                    className={`w-full rounded-full py-2 text-xs uppercase tracking-[0.35em] font-semibold shadow-neon transition-all ${saving || isLoading
                      ? "bg-gray-500/50 cursor-not-allowed"
                      : isDemoMode
                        ? "bg-gray-500/20 text-white/50 cursor-not-allowed border border-white/10"
                        : saveStatus === "success"
                          ? "bg-green-500 text-white"
                          : saveStatus === "error"
                            ? "bg-red-500 text-white"
                            : "bg-gradient-to-r from-cyan-300 to-blue-500 text-black hover:opacity-90"
                      }`}
                  >
                    {saving
                      ? "Saving..."
                      : isDemoMode
                        ? "Read-Only Mode (Changes Disabled)"
                        : saveStatus === "success"
                          ? "✓ Saved Successfully"
                          : saveStatus === "error"
                            ? "✗ Save Failed"
                            : "💾 Save All Changes"}
                  </button>
                  {saveStatus === "success" && (
                    <p className="text-xs text-green-400 text-center">
                      All changes saved and synced to database
                    </p>
                  )}
                  {saveStatus === "error" && (
                    <p className="text-xs text-red-400 text-center">
                      Error saving changes. Please try again.
                    </p>
                  )}
                </div>
              )}
              {selectedBook ? (
                <>
                  {[
                    {
                      id: "issue",
                      title: "Issue Settings",
                      subtitle: "Title, date & searchable content",
                      content: <IssueSettingsPanel book={selectedBook} />,
                    },
                    {
                      id: "visual",
                      title: "Backdrop & Marquee",
                      subtitle: "Gradient, fonts, colors, speed",
                      content: <VisualSettingsPanel book={selectedBook} />,
                    },
                    {
                      id: "pages",
                      title: "Pages & Spreads",
                      subtitle: "Upload art, reorder, add/remove",
                      content: (
                        <div className="space-y-4">
                          <button
                            className="w-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-500 text-black py-2 text-xs uppercase tracking-[0.35em] font-semibold shadow-neon hover:opacity-90 transition"
                            onClick={() => addPage(selectedBook.id)}
                          >
                            Add Spread
                          </button>
                          {visiblePages.map((page, index) => (
                            <PageUploader
                              key={`${selectedBook.id}-${index}`}
                              index={index}
                              page={page}
                              bookId={selectedBook.id}
                              updatePageImage={updatePageImage}
                              canRemove={index > 0 && index < visiblePages.length - 1}
                              onRemove={() => removePage(selectedBook.id, index)}
                            />
                          ))}
                        </div>
                      ),
                    },
                  ].map((section) => (
                    <AccordionSection
                      key={section.id}
                      title={section.title}
                      description={section.subtitle}
                      isOpen={openSection === section.id}
                      onToggle={() =>
                        setOpenSection((prev) =>
                          prev === section.id ? null : section.id
                        )
                      }
                    >
                      {section.content}
                    </AccordionSection>
                  ))}
                </>
              ) : (
                <div className="glass-panel rounded-2xl border border-white/15 p-8 text-center space-y-3">
                  <p className="text-white/70">No issue selected</p>
                  <p className="text-xs text-white/50">Use the issue picker on the left to select an issue to edit</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};


