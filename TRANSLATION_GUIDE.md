# Translation & RTL Implementation Guide

## Overview
This platform supports multilingual content with special handling for Arabic RTL text alignment. The implementation ensures that **only text content** is aligned RTL for Arabic, while the UI layout (buttons, navigation, menus) remains in standard LTR orientation.

## Technologies Used
- **i18next**: Core internationalization framework
- **react-i18next**: React bindings for i18next
- **i18next-browser-languagedetector**: Automatic language detection

## Supported Languages
1. **English (en)** - Default
2. **French (fr)**
3. **Arabic (ar)** - With text-only RTL support

## File Structure

```
src/
├── i18n.js                          # i18n configuration
├── components/
│   └── LanguageSwitcher.jsx         # Language toggle component
└── locales/
    ├── en/
    │   └── translation.json         # English translations
    ├── fr/
    │   └── translation.json         # French translations
    └── ar/
        └── translation.json         # Arabic translations
```

## Key Features

### 1. Text-Only RTL for Arabic
The system applies RTL text direction **only to content**, not to the entire UI:

#### What Gets RTL (Right-to-Left):
- Paragraphs (`<p>`)
- Headings (`<h1>` - `<h6>`)
- Elements with `.content-text` or `.rtl-text` classes
- Elements with `.text-content` class

#### What Stays LTR (Left-to-Right):
- Buttons
- Navigation bars
- Menus
- Toolbars
- Input fields
- Flex/Grid containers
- All UI elements

### 2. CSS Implementation

The CSS uses body classes to target specific languages:

```css
/* Arabic text content is RTL */
body.lang-ar p,
body.lang-ar h1,
body.lang-ar .content-text {
  direction: rtl;
  text-align: right;
}

/* UI elements stay LTR */
body.lang-ar button,
body.lang-ar nav,
body.lang-ar input {
  direction: ltr;
  text-align: left;
}
```

### 3. Language Detection
- First checks `localStorage` for saved preference
- Falls back to browser language settings
- Defaults to English if no match

## Usage Guide

### Using Translations in Components

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('landing.welcome')}</h1>
      <p>{t('landing.hero_desc')}</p>
      <button>{t('common.read_now')}</button>
    </div>
  );
}
```

### Nested Translation Keys

All translations are organized hierarchically:

```json
{
  "common": {
    "save": "Save Changes",
    "cancel": "Cancel"
  },
  "nav": {
    "home": "Home",
    "library": "Library"
  }
}
```

Access with dot notation: `t('nav.home')` or `t('common.save')`

### Force RTL/LTR on Specific Elements

Use utility classes when you need to override default behavior:

```jsx
{/* Force RTL even on UI elements */}
<div className="force-rtl">
  Arabic text that needs RTL
</div>

{/* Force LTR even on content */}
<p className="force-ltr">
  English text in Arabic page
</p>
```

## Adding New Translations

### Step 1: Update Translation Files

Add your new key to all three language files:

**src/locales/en/translation.json:**
```json
{
  "mySection": {
    "myKey": "Hello World"
  }
}
```

**src/locales/fr/translation.json:**
```json
{
  "mySection": {
    "myKey": "Bonjour le monde"
  }
}
```

**src/locales/ar/translation.json:**
```json
{
  "mySection": {
    "myKey": "مرحبا بالعالم"
  }
}
```

### Step 2: Use in Components

```javascript
const { t } = useTranslation();
<h1>{t('mySection.myKey')}</h1>
```

## Adding a New Language

### Step 1: Create Translation File

Create `src/locales/[LANG_CODE]/translation.json` with all required keys.

### Step 2: Update i18n Configuration

**src/i18n.js:**
```javascript
import newLang from './locales/[LANG_CODE]/translation.json';

i18n.init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
    [LANG_CODE]: { translation: newLang }  // Add here
  }
});
```

### Step 3: Update Language Switcher

**src/components/LanguageSwitcher.jsx:**
```javascript
{['en', 'fr', 'ar', 'LANG_CODE'].map((lng) => (
  <button onClick={() => changeLanguage(lng)}>
    {lng.toUpperCase()}
  </button>
))}
```

### Step 4: Add RTL Support (if needed)

**src/index.css:**
```css
body.lang-[LANG_CODE] .content-text,
body.lang-[LANG_CODE] p,
body.lang-[LANG_CODE] h1 {
  direction: rtl;
  text-align: right;
}
```

## Translation Best Practices

### 1. Keep Placeholder Text Untranslated
User-generated content and placeholders should NOT be translated:

```javascript
// ❌ Don't translate
<input placeholder={userProvidedName} />

// ✅ Do translate
<input placeholder={t('common.search')} />
```

### 2. Use Descriptive Keys
```json
// ❌ Bad
{ "btn1": "Click me" }

// ✅ Good
{ "common.submit_button": "Click me" }
```

### 3. Group Related Translations
```json
{
  "admin": {
    "dashboard": {
      "total_issues": "Total Issues",
      "published": "Published",
      "total_pages": "Total Pages"
    }
  }
}
```

### 4. Handle Plurals Properly
i18next supports pluralization:

```json
{
  "book.page_count": "{{count}} page",
  "book.page_count_plural": "{{count}} pages"
}
```

```javascript
t('book.page_count', { count: 1 })  // "1 page"
t('book.page_count', { count: 5 })  // "5 pages"
```

### 5. Use Interpolation for Dynamic Content
```json
{
  "welcome_message": "Welcome, {{name}}!"
}
```

```javascript
t('welcome_message', { name: userName })
```

## Testing RTL Implementation

### Visual Checklist for Arabic:
- [ ] Text paragraphs align to the right
- [ ] Headings align to the right
- [ ] Navigation buttons stay on the left
- [ ] Input fields remain left-aligned
- [ ] Flex containers don't flip
- [ ] Grid layouts don't mirror
- [ ] Language switcher works correctly
- [ ] Translations display properly

### Developer Tools Testing:
1. Open DevTools
2. Set language to Arabic from switcher
3. Check `<body>` has class `lang-ar`
4. Verify `document.documentElement.lang === 'ar'`
5. Verify `document.dir !== 'rtl'` (should NOT be set)

## Common Issues & Solutions

### Issue: Entire UI flips to RTL
**Solution:** Remove `document.dir = 'rtl'` from code. Use CSS classes instead.

### Issue: Text not aligning right in Arabic
**Solution:** Ensure element matches CSS selectors, or add `.rtl-text` class.

### Issue: Buttons or navigation flip in Arabic
**Solution:** Add `.force-ltr` class or ensure element type is covered in CSS overrides.

### Issue: Translations not loading
**Solution:** 
1. Check translation file syntax (valid JSON)
2. Verify file is imported in `i18n.js`
3. Check browser console for errors
4. Clear localStorage and refresh

## Performance Considerations

1. **Code Splitting**: Translation files are loaded upfront (small size)
2. **Caching**: Language preference saved in localStorage
3. **Bundle Size**: i18next adds ~20KB gzipped
4. **RTL CSS**: Minimal impact, uses modern CSS selectors

## Future Enhancements

- [ ] Add more languages (Spanish, German, etc.)
- [ ] Implement lazy loading for translation files
- [ ] Add language-specific fonts for better Arabic rendering
- [ ] Create admin interface for managing translations
- [ ] Add translation completion indicators
- [ ] Implement automatic translation suggestions

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [RTL Styling Guide](https://rtlstyling.com/)
- [Arabic Typography Best Practices](https://www.w3.org/International/articles/arabic-type/)

## Maintenance

### Regular Tasks:
1. Review completed translations quarterly
2. Update translations when adding new features
3. Check for untranslated strings in production
4. Test RTL layout after major UI changes
5. Gather user feedback on translation quality

---

**Last Updated:** 2025-11-27  
**Maintained By:** Development Team
