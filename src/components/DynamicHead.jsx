import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const DynamicHead = () => {
    const [settings, setSettings] = useState({
        school_name: 'E-Roar Magazine',
        school_description: 'Interactive 3D magazine viewer',
        school_logo_favicon_192: '/favicon.ico',
        school_logo_favicon_512: '/favicon.ico',
        school_logo_og: '/favicon.ico'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await supabase
                    .from('settings')
                    .select('school_name, school_description, school_logo_favicon_192, school_logo_favicon_512, school_logo_og')
                    .maybeSingle();

                if (data) {
                    setSettings(prev => ({
                        ...prev,
                        ...data
                    }));
                }
            } catch (err) {
                console.error('Error fetching settings for head:', err);
            }
        };

        fetchSettings();

        // Subscribe to settings changes
        const channel = supabase
            .channel('settings-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'settings' },
                () => {
                    fetchSettings();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <Helmet>
            {/* Page Title */}
            <title>{settings.school_name || 'E-Roar Magazine'}</title>

            {/* Favicons */}
            <link rel="icon" type="image/png" sizes="192x192" href={settings.school_logo_favicon_192 || '/favicon.ico'} />
            <link rel="icon" type="image/png" sizes="512x512" href={settings.school_logo_favicon_512 || '/favicon.ico'} />
            <link rel="apple-touch-icon" href={settings.school_logo_favicon_192 || '/favicon.ico'} />

            {/* Meta Description */}
            <meta name="description" content={settings.school_description || 'Interactive 3D magazine viewer with page-by-page analytics'} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={settings.school_name || 'E-Roar Magazine'} />
            <meta property="og:description" content={settings.school_description || 'Interactive 3D magazine viewer with page-by-page analytics'} />
            <meta property="og:image" content={settings.school_logo_og || '/favicon.ico'} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={settings.school_name || 'E-Roar Magazine'} />
            <meta name="twitter:description" content={settings.school_description || 'Interactive 3D magazine viewer with page-by-page analytics'} />
            <meta name="twitter:image" content={settings.school_logo_og || '/favicon.ico'} />

            {/* Theme Color */}
            <meta name="theme-color" content="#e0e5ec" />
        </Helmet>
    );
};
