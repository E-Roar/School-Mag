import imageCompression from 'browser-image-compression';

/**
 * Logo compression utility with multiple size variants
 * Generates optimized logo files for different use cases
 */

/**
 * Compress logo for general use
 * @param {File} file - The logo image file
 * @returns {Promise<{file: File, originalSize: number, compressedSize: number}>}
 */
export async function compressLogo(file) {
    try {
        const originalSize = file.size;

        // Logo-specific compression settings
        const logoOptions = {
            maxSizeMB: 0.5, // Logos should be very small
            maxWidthOrHeight: 512, // Good size for most uses
            useWebWorker: true,
            fileType: 'image/webp',
            initialQuality: 0.95, // High quality for logos to preserve clarity
        };

        console.log(`Compressing logo: ${file.name} (${formatBytes(originalSize)})`);

        const compressedFile = await imageCompression(file, logoOptions);
        const compressedSize = compressedFile.size;

        console.log(
            `✓ Logo compressed: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)}`
        );

        return {
            file: compressedFile,
            originalSize,
            compressedSize,
            compressionRatio: ((originalSize - compressedSize) / originalSize * 100).toFixed(1)
        };
    } catch (error) {
        console.error('Logo compression failed:', error);
        return {
            file,
            originalSize: file.size,
            compressedSize: file.size,
            compressionRatio: 0,
            error: error.message
        };
    }
}

/**
 * Generate multiple logo variants for different purposes
 * @param {File} file - The original logo file
 * @returns {Promise<Object>} - Object containing different logo variants
 */
export async function generateLogoVariants(file) {
    try {
        const variants = {};

        // Full size logo (512x512 max)
        const fullSize = await imageCompression(file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 512,
            useWebWorker: true,
            fileType: 'image/webp',
            initialQuality: 0.95,
        });
        variants.full = fullSize;

        // Favicon sizes (ICO format uses PNG)
        const favicon192 = await imageCompression(file, {
            maxSizeMB: 0.1,
            maxWidthOrHeight: 192,
            useWebWorker: true,
            fileType: 'image/png',
            initialQuality: 0.95,
        });
        variants.favicon192 = favicon192;

        const favicon512 = await imageCompression(file, {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 512,
            useWebWorker: true,
            fileType: 'image/png',
            initialQuality: 0.95,
        });
        variants.favicon512 = favicon512;

        // Thumbnail for previews (128x128)
        const thumbnail = await imageCompression(file, {
            maxSizeMB: 0.05,
            maxWidthOrHeight: 128,
            useWebWorker: true,
            fileType: 'image/webp',
            initialQuality: 0.9,
        });
        variants.thumbnail = thumbnail;

        // OG Image for social media (1200x630 is standard)
        const ogImage = await imageCompression(file, {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            fileType: 'image/jpeg',
            initialQuality: 0.9,
        });
        variants.ogImage = ogImage;

        return variants;
    } catch (error) {
        console.error('Error generating logo variants:', error);
        throw error;
    }
}

/**
 * Validate logo file
 * @param {File} file - The file to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateLogoFile(file) {
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'File must be an image (PNG, JPG, SVG, WebP)' };
    }

    // Check file size (max 10MB before compression)
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 10) {
        return {
            valid: false,
            error: `File is too large (${sizeMB.toFixed(1)}MB). Maximum: 10MB`
        };
    }

    return { valid: true, error: null };
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Create a data URL from a file (for favicon generation)
 * @param {File} file - The image file
 * @returns {Promise<string>} - Data URL string
 */
export async function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
