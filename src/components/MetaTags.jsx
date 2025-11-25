import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * MetaTags component for dynamic SEO and social media sharing
 * @param {Object} props - Meta tag properties
 */
export const MetaTags = ({
    title = "School Magazine - 3D Book Viewer",
    description = "Interactive 3D magazine viewer with page-by-page analytics",
    siteName = "E-Roar Magazine",
    logoUrl = "",
    ogImageUrl = "",
    url = window.location.href,
    type = "website"
}) => {
    // Update favicon dynamically
    useEffect(() => {
        if (logoUrl) {
            // Update main favicon
            const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'icon';
            link.href = logoUrl;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [logoUrl]);

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content={siteName} />
            {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
            {ogImageUrl && <meta property="og:image:width" content="1200" />}
            {ogImageUrl && <meta property="og:image:height" content="630" />}

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            {ogImageUrl && <meta property="twitter:image" content={ogImageUrl} />}

            {/* Additional PWA and Mobile */}
            <meta name="apple-mobile-web-app-title" content={siteName} />
            <meta name="application-name" content={siteName} />
            {logoUrl && <link rel="apple-touch-icon" href={logoUrl} />}
        </Helmet>
    );
};

/**
 * Hook to get meta tag values from settings
 */
export const useMetaFromSettings = (settings) => {
    return {
        title: settings.school_name ? `${settings.school_name} - 3D Book Viewer` : "School Magazine - 3D Book Viewer",
        description: settings.school_description || "Interactive 3D magazine viewer with page-by-page analytics",
        siteName: settings.school_name || "E-Roar Magazine",
        logoUrl: settings.school_logo_url || "",
        ogImageUrl: settings.school_logo_og || settings.school_logo_url || ""
    };
};
