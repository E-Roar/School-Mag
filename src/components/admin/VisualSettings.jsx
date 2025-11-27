import { useState, useEffect } from "react";
import { useBookData } from "../../context/BookDataContext";

export const VisualSettings = ({ book }) => {
    const { updateVisualSettings } = useBookData();
    const [settings, setSettings] = useState({
        direction: 'ltr',
        gradientStart: '#ffffff',
        gradientEnd: '#ffffff',
        floatIntensity: 0,
        floatSpeed: 0,
        rotationIntensity: 0,
        marqueeTexts: [],
        marqueeFontFamily: '',
        marqueeColor: '#000000',
        marqueeSpeed: 0
    });
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (book?.visualSettings) {
            setSettings({
                direction: book.visualSettings.direction ?? 'ltr',
                gradientStart: book.visualSettings.gradientStart ?? '#ffffff',
                gradientEnd: book.visualSettings.gradientEnd ?? '#ffffff',
                floatIntensity: book.visualSettings.floatIntensity ?? 0,
                floatSpeed: book.visualSettings.floatSpeed ?? 0,
                rotationIntensity: book.visualSettings.rotationIntensity ?? 0,
                marqueeTexts: book.visualSettings.marqueeTexts ?? [],
                marqueeFontFamily: book.visualSettings.marqueeFontFamily ?? '',
                marqueeColor: book.visualSettings.marqueeColor ?? '#000000',
                marqueeSpeed: book.visualSettings.marqueeSpeed ?? 0
            });
            setIsDirty(false);
        }
    }, [book]);

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleTextsChange = (value) => {
        const list = value.split("\n"); // Keep empty lines while typing
        setSettings(prev => ({ ...prev, marqueeTexts: list }));
        setIsDirty(true);
    };

    const handleSave = () => {
        // Clean up marquee texts before saving
        const cleanSettings = {
            ...settings,
            marqueeTexts: Array.isArray(settings.marqueeTexts)
                ? settings.marqueeTexts.map(line => line.trim()).filter(Boolean)
                : []
        };
        updateVisualSettings(book.id, cleanSettings);
        setIsDirty(false);
    };

    return (
        <div className="space-y-6">
            <div className="neo-card p-8 space-y-8">
                <div className="flex items-center justify-between border-b border-gray-200/50 pb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-700">Scene Appearance</h3>
                        <p className="text-sm text-gray-500">Customize the 3D viewer environment</p>
                    </div>
                    {isDirty && (
                        <button
                            onClick={handleSave}
                            className="neo-btn bg-blue-500 text-white px-6 py-2 hover:bg-blue-600 transition-colors animate-pulse"
                        >
                            💾 Save Changes
                        </button>
                    )}
                </div>

                {/* RTL Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] bg-[#e0e5ec]">
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-700">Reading Direction</h4>
                        <p className="text-xs text-gray-500 mt-1">Enable for right-to-left languages (Arabic, Hebrew, etc.)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.direction === 'rtl'}
                            onChange={(e) => handleChange("direction", e.target.checked ? 'rtl' : 'ltr')}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                            {settings.direction === 'rtl' ? 'RTL' : 'LTR'}
                        </span>
                    </label>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Background Gradient</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500">Start Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={settings.gradientStart}
                                        onChange={(e) => handleChange("gradientStart", e.target.value)}
                                        className="w-10 h-10 rounded-lg border-none cursor-pointer shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.8)]"
                                    />
                                    <span className="text-sm text-gray-600 font-mono">{settings.gradientStart}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500">End Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={settings.gradientEnd}
                                        onChange={(e) => handleChange("gradientEnd", e.target.value)}
                                        className="w-10 h-10 rounded-lg border-none cursor-pointer shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.8)]"
                                    />
                                    <span className="text-sm text-gray-600 font-mono">{settings.gradientEnd}</span>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div
                            className="h-24 rounded-xl w-full shadow-[inset_3px_3px_6px_rgba(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]"
                            style={{ background: `radial-gradient(${settings.gradientStart}, ${settings.gradientEnd} 80%)` }}
                        />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Physics & Animation</h4>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-medium text-gray-500">Float Intensity</label>
                                    <span className="text-xs text-gray-400">{Number(settings.floatIntensity).toFixed(1)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={settings.floatIntensity}
                                    onChange={(e) => handleChange("floatIntensity", Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer shadow-inner"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-medium text-gray-500">Float Speed</label>
                                    <span className="text-xs text-gray-400">{Number(settings.floatSpeed).toFixed(1)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={settings.floatSpeed}
                                    onChange={(e) => handleChange("floatSpeed", Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer shadow-inner"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-medium text-gray-500">Rotation Intensity</label>
                                    <span className="text-xs text-gray-400">{Number(settings.rotationIntensity).toFixed(1)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={settings.rotationIntensity}
                                    onChange={(e) => handleChange("rotationIntensity", Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="neo-card p-8 space-y-8">
                <div className="flex items-center justify-between border-b border-gray-200/50 pb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-700">Marquee Text</h3>
                        <p className="text-sm text-gray-500">Scrolling text behind the book</p>
                    </div>
                    {isDirty && (
                        <button
                            onClick={handleSave}
                            className="neo-btn bg-blue-500 text-white px-6 py-2 hover:bg-blue-600 transition-colors animate-pulse"
                        >
                            💾 Save Changes
                        </button>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 pl-2">Text Lines (one per line)</label>
                        <textarea
                            value={Array.isArray(settings.marqueeTexts) ? settings.marqueeTexts.join("\n") : ""}
                            onChange={(e) => handleTextsChange(e.target.value)}
                            rows={6}
                            className="neo-input resize-none font-mono text-sm rounded-2xl"
                            placeholder="E-ROAR MAGAZINE"
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 pl-2">Font Family</label>
                            <input
                                type="text"
                                value={settings.marqueeFontFamily}
                                onChange={(e) => handleChange("marqueeFontFamily", e.target.value)}
                                className="neo-input"
                                placeholder="'Anton', sans-serif"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 pl-2">Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={settings.marqueeColor}
                                        onChange={(e) => handleChange("marqueeColor", e.target.value)}
                                        className="w-full h-10 rounded-lg border-none cursor-pointer shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.8)]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 pl-2">Speed (s)</label>
                                <input
                                    type="number"
                                    value={settings.marqueeSpeed}
                                    onChange={(e) => handleChange("marqueeSpeed", Number(e.target.value))}
                                    className="neo-input"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
