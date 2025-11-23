import { defaultPagePlaceholder, defaultVisualSettings } from "../data/defaultBooks";

export const normalizePages = (pages) => {
    if (!pages || pages.length === 0) return [];
    // Ensure cover (page 0) exists
    const hasCover = pages.some((p) => p.page_number === 0 || p.label === "Cover");
    if (!hasCover) {
        return [
            {
                frontSrc: defaultPagePlaceholder,
                backSrc: defaultPagePlaceholder,
                label: "Cover",
                page_number: 0,
            },
            ...pages,
        ];
    }
    return pages;
};

export const createBlankSpread = (spreadNumber) => ({
    frontSrc: defaultPagePlaceholder,
    backSrc: defaultPagePlaceholder,
    label: `New Spread ${spreadNumber}`,
});

export const withVisualDefaults = (visual = {}) => ({
    ...defaultVisualSettings,
    ...visual,
    marqueeTexts:
        visual.marqueeTexts && visual.marqueeTexts.length
            ? visual.marqueeTexts
            : defaultVisualSettings.marqueeTexts,
    floatIntensity:
        typeof visual.floatIntensity === "number"
            ? visual.floatIntensity
            : defaultVisualSettings.floatIntensity,
    rotationIntensity:
        typeof visual.rotationIntensity === "number"
            ? visual.rotationIntensity
            : defaultVisualSettings.rotationIntensity,
    floatSpeed:
        typeof visual.floatSpeed === "number"
            ? visual.floatSpeed
            : defaultVisualSettings.floatSpeed,
    direction: visual.direction || defaultVisualSettings.direction || 'ltr',
});

export const hydrateBook = (book) => ({
    ...book,
    pages: normalizePages(book.pages ?? []),
    visualSettings: withVisualDefaults(book.visualSettings),
    listOfContent: book.listOfContent || "",
});
