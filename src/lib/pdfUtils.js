import * as pdfjsLib from 'pdfjs-dist';
import imageCompression from 'browser-image-compression';

// Set worker source - use URL import for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
).toString();

export const convertPdfToImages = async (file, onProgress) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    const images = [];

    for (let i = 1; i <= totalPages; i++) {
        if (onProgress) onProgress(i, totalPages);

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Convert to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));

        // Compress image
        const compressedFile = await imageCompression(new File([blob], `page_${i}.jpg`, { type: 'image/jpeg' }), {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        });

        images.push(compressedFile);
    }

    return images;
};
