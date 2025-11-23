import { useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * Custom hook for progressive image loading with placeholder
 * @param {string} src - Image source URL
 * @param {string} placeholder - Placeholder image (optional)
 * @returns {Object} - {texture, isLoading, error}
 */
export function useProgressiveTexture(src, placeholder = null) {
    const [texture, setTexture] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!src) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        const loader = new THREE.TextureLoader();

        // Load placeholder first if available
        if (placeholder && placeholder !== src) {
            loader.load(
                placeholder,
                (placeholderTexture) => {
                    placeholderTexture.colorSpace = THREE.SRGBColorSpace;
                    placeholderTexture.minFilter = THREE.LinearFilter;
                    setTexture(placeholderTexture);
                },
                undefined,
                (err) => console.warn('Placeholder load failed:', err)
            );
        }

        // Load actual image
        loader.load(
            src,
            (loadedTexture) => {
                loadedTexture.colorSpace = THREE.SRGBColorSpace;
                loadedTexture.minFilter = THREE.LinearFilter;
                loadedTexture.magFilter = THREE.LinearFilter;
                loadedTexture.anisotropy = 4; // Better quality for angled views

                setTexture(loadedTexture);
                setIsLoading(false);
            },
            undefined,
            (err) => {
                console.error('Texture load failed:', err);
                setError(err);
                setIsLoading(false);
            }
        );

        return () => {
            if (texture) {
                texture.dispose();
            }
        };
    }, [src, placeholder]);

    return { texture, isLoading, error };
}

/**
 * Preload images for better UX
 * @param {string[]} urls - Array of image URLs to preload
 * @returns {Promise<void>}
 */
export async function preloadImages(urls) {
    const loader = new THREE.TextureLoader();

    const promises = urls.map((url) => {
        return new Promise((resolve, reject) => {
            loader.load(
                url,
                (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    resolve(texture);
                },
                undefined,
                reject
            );
        });
    });

    try {
        await Promise.all(promises);
        console.log(`✓ Preloaded ${urls.length} images`);
    } catch (error) {
        console.warn('Some images failed to preload:', error);
    }
}

/**
 * Get optimal texture size based on device capabilities
 * @returns {number} - Max texture size
 */
export function getOptimalTextureSize() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        return 2048; // Fallback
    }

    const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

    // For mobile/low-end devices, cap at 2048
    // For desktop, allow up to 4096
    if (window.innerWidth < 768) {
        return Math.min(maxSize, 2048);
    }

    return Math.min(maxSize, 4096);
}

/**
 * Create a low-quality placeholder texture
 * @param {string} color - Hex color for placeholder
 * @returns {THREE.Texture}
 */
export function createPlaceholderTexture(color = '#cccccc') {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;

    const context = canvas.getContext('2d');
    context.fillStyle = color;
    context.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}

/**
 * Dispose of textures to free memory
 * @param {THREE.Texture[]} textures - Array of textures to dispose
 */
export function disposeTextures(textures) {
    textures.forEach((texture) => {
        if (texture && texture.dispose) {
            texture.dispose();
        }
    });
}
