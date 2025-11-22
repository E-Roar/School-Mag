import { useBookData } from "../../context/BookDataContext";

export const VisualSettings = ({ book }) => {
    const { updateVisualSettings } = useBookData();
    const settings = book.visualSettings || {};

    const handleChange = (field, value) => {
        updateVisualSettings(book.id, { [field]: value });
    };

    const handleTextsChange = (value) => {
        const list = value.split("\n").map((line) => line.trim()).filter(Boolean);
        updateVisualSettings(book.id, { marqueeTexts: list });
    };

    return (
        <div className="space-y-6">
            <div className="glass-card p-8 space-y-8">
                <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Scene Appearance</h3>
                    <p className="text-sm text-gray-500">Customize the 3D viewer environment</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Background Gradient</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500">Start Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={settings.gradientStart}
                                        onChange={(e) => handleChange("gradientStart", e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
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
                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-600 font-mono">{settings.gradientEnd}</span>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div
                            className="h-24 rounded-xl w-full border border-gray-200 shadow-inner"
                            style={{ background: `radial-gradient(${settings.gradientStart}, ${settings.gradientEnd} 80%)` }}
                        />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Physics & Animation</h4>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-medium text-gray-500">Float Intensity</label>
                                    <span className="text-xs text-gray-400">{settings.floatIntensity?.toFixed(1)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={settings.floatIntensity}
                                    onChange={(e) => handleChange("floatIntensity", Number(e.target.value))}
                                    className="w-full accent-blue-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-medium text-gray-500">Float Speed</label>
                                    <span className="text-xs text-gray-400">{settings.floatSpeed?.toFixed(1)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={settings.floatSpeed}
                                    onChange={(e) => handleChange("floatSpeed", Number(e.target.value))}
                                    className="w-full accent-blue-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-medium text-gray-500">Rotation Intensity</label>
                                    <span className="text-xs text-gray-400">{settings.rotationIntensity?.toFixed(1)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={settings.rotationIntensity}
                                    onChange={(e) => handleChange("rotationIntensity", Number(e.target.value))}
                                    className="w-full accent-blue-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card p-8 space-y-8">
                <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Marquee Text</h3>
                    <p className="text-sm text-gray-500">Scrolling text behind the book</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Text Lines (one per line)</label>
                        <textarea
                            value={settings.marqueeTexts?.join("\n") ?? ""}
                            onChange={(e) => handleTextsChange(e.target.value)}
                            rows={6}
                            className="glass-input resize-none font-mono text-sm"
                            placeholder="E-ROAR MAGAZINE"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Font Family</label>
                            <input
                                type="text"
                                value={settings.marqueeFontFamily ?? ""}
                                onChange={(e) => handleChange("marqueeFontFamily", e.target.value)}
                                className="glass-input"
                                placeholder="'Anton', sans-serif"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={settings.marqueeColor}
                                        onChange={(e) => handleChange("marqueeColor", e.target.value)}
                                        className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Speed (s)</label>
                                <input
                                    type="number"
                                    value={settings.marqueeSpeed}
                                    onChange={(e) => handleChange("marqueeSpeed", Number(e.target.value))}
                                    className="glass-input"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
