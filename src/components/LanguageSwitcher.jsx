import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    useEffect(() => {
        // Only update language attribute, not direction
        // We'll handle RTL text alignment via CSS classes to avoid flipping the entire UI
        document.documentElement.lang = i18n.language;

        // Add/remove a class to body for language-specific styling
        document.body.classList.remove('lang-ar', 'lang-en', 'lang-fr');
        document.body.classList.add(`lang-${i18n.language}`);
    }, [i18n.language]);

    return (
        <div className="flex items-center gap-1 bg-[#e0e5ec] p-1 rounded-lg shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.7)]">
            {['en', 'fr', 'ar'].map((lng) => (
                <button
                    key={lng}
                    onClick={() => changeLanguage(lng)}
                    className={`
                        px-2 py-1 text-xs font-bold rounded-md transition-all duration-200
                        ${i18n.language === lng
                            ? 'bg-[#e0e5ec] text-blue-600 shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.7)]'
                            : 'text-gray-400 hover:text-gray-600'
                        }
                    `}
                >
                    {lng.toUpperCase()}
                </button>
            ))}
        </div>
    );
};
