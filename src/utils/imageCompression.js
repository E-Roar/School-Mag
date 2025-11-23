import imageCompression from 'browser-image-compression';

/**
 * Compression settings optimized for magazine pages
 * - High quality for text readability
 * - Efficient file size for fast loading
 * - WebP format for best compression ratio
 */
const DEFAULT_OPTIONS = {
    maxSizeMB: 1.5, // Max file size in MB (1.5MB is good for high-quality images)
    maxWidthOrHeight: 2048, // Max dimension (2048px is sufficient for magazine pages)
    useWebWorker: true, // Use Web Worker for better performance
    fileType: 'image/webp', // Convert to WebP format
    initialQuality: 0.85, // High quality (85%) - good balance
};

/**
 * Compress an image file with progress tracking
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options (optional)
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<{file: File, originalSize: number, compressedSize: number, compressionRatio: number}>}
 */
export async function compressImage(file, options = {}, onProgress = null) {
    try {
        const originalSize = file.size;

        // Skip compression if file is already small enough
        if (originalSize < 100 * 1024) { // Less than 100KB
            console.log('File is already small, skipping compression');
            return {
                file,
                originalSize,
                compressedSize: originalSize,
                compressionRatio: 1,
                skipped: true
            };
        }

        const compressionOptions = {
            ...DEFAULT_OPTIONS,
            ...options,
            onProgress: onProgress || undefined,
        };

        console.log(`Compressing image: ${file.name} (${formatBytes(originalSize)})`);

        const compressedFile = await imageCompression(file, compressionOptions);
        const compressedSize = compressedFile.size;
        const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

        console.log(
            `✓ Compressed: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (${compressionRatio}% reduction)`
        );

        return {
            file: compressedFile,
            originalSize,
            compressedSize,
            compressionRatio: parseFloat(compressionRatio),
            skipped: false
        };
    } catch (error) {
        console.error('Image compression failed:', error);
        // Return original file if compression fails
        return {
            file,
            originalSize: file.size,
            compressedSize: file.size,
            compressionRatio: 0,
            error: error.message,
            skipped: false
        };
    }
}

/**
 * Compress multiple images with batch progress tracking
 * @param {File[]} files - Array of image files
 * @param {Function} onProgress - Progress callback with {current, total, percent}
 * @returns {Promise<Array>}
 */
export async function compressImageBatch(files, onProgress = null) {
    const results = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const result = await compressImage(file, {}, (progress) => {
            // Individual file progress
            const overallProgress = ((i / total) * 100 + (progress / total)).toFixed(0);
            if (onProgress) {
                onProgress({
                    current: i + 1,
                    total,
                    percent: parseInt(overallProgress),
                    currentFile: file.name
                });
            }
        });

        results.push(result);
    }

    return results;
}

/**
 * Create a thumbnail version of an image
 * @param {File} file - The image file
 * @param {number} maxSize - Max width/height for thumbnail
 * @returns {Promise<File>}
 */
export async function createThumbnail(file, maxSize = 400) {
    try {
        const thumbnailOptions = {
            maxSizeMB: 0.1, // Very small for thumbnails
            maxWidthOrHeight: maxSize,
            useWebWorker: true,
            fileType: 'image/webp',
            initialQuality: 0.75, // Lower quality for thumbnails
        };

        const thumbnail = await imageCompression(file, thumbnailOptions);
        return thumbnail;
    } catch (error) {
        console.error('Thumbnail creation failed:', error);
        return file; // Return original if thumbnail creation fails
    }
}

/**
 * Validate if file is an image and within size limits
 * @param {File} file - The file to validate
 * @param {number} maxSizeMB - Maximum file size in MB (before compression)
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateImageFile(file, maxSizeMB = 50) {
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'File must be an image (JPG, PNG, WebP, etc.)' };
    }

    // Check file size (before compression)
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
        return {
            valid: false,
            error: `File is too large (${sizeMB.toFixed(1)}MB). Maximum: ${maxSizeMB}MB`
        };
    }

    return { valid: true, error: null };
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get recommended compression settings based on image characteristics
 * @param {File} file - The image file
 * @returns {Promise<Object>}
 */
export async function getRecommendedSettings(file) {
    const sizeMB = file.size / (1024 * 1024);

    // For very large files, be more aggressive
    if (sizeMB > 10) {
        return {
            maxSizeMB: 1.0,
            maxWidthOrHeight: 1920,
            initialQuality: 0.80,
        };
    }

    // For medium files, use default
    if (sizeMB > 3) {
        return {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 2048,
            initialQuality: 0.85,
        };
    }

    // For small files, preserve more quality
    return {
        maxSizeMB: 1.0,
        maxWidthOrHeight: 2048,
        initialQuality: 0.90,
    };
}
