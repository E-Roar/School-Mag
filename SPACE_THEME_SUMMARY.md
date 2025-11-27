# Cosmic Space Theme Implementation

## Overview
A new "Cosmic Space Theme" has been implemented for the landing page. This theme adds a stunning, immersive space atmosphere while maintaining the existing neomorphic design language.

## Features
- **Toggleable Theme**: Admin can enable/disable the theme from the Settings panel.
- **Atmospheric Effects**:
  - Animated starfield background
  - Floating nebula effects
  - Aurora borealis animations
  - Glowing UI elements
- **Enhanced Neomorphism**:
  - Glassmorphism with cosmic tints
  - Glowing borders and shadows
  - Interactive hover states
- **Performance Optimized**:
  - CSS-only animations
  - Respects `prefers-reduced-motion`
  - Lightweight implementation

## Files Modified/Created
1. **`src/styles/space-theme.css`** (New)
   - Contains all the CSS variables, animations, and styles for the space theme.
2. **`src/components/admin/SettingsPanel.jsx`**
   - Added "Appearance" section to the settings accordion.
   - Added toggle switch for `enable_space_theme`.
   - Updated `handleSaveSettings` to persist the theme preference.
3. **`src/routes/LandingPage.jsx`**
   - Imported `space-theme.css`.
   - Added conditional logic to apply `space-theme` class to the main wrapper.
   - Added decorative elements (aurora effect) when theme is active.
4. **`supabase/SPACE_THEME_MIGRATION.sql`** (New)
   - SQL migration to add `enable_space_theme` column to the `settings` table.

## How to Enable
1. Go to the **Admin Dashboard**.
2. Navigate to **Settings**.
3. Expand the **Appearance** section.
4. Toggle **Enable Space Theme**.
5. Click **Save Changes**.

## Database Update Required
To make this feature work, you need to run the following SQL in your Supabase SQL Editor:

```sql
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS enable_space_theme BOOLEAN DEFAULT false;
```

## Customization
The theme uses CSS variables defined in `.space-theme` scope. You can easily adjust colors and intensities in `src/styles/space-theme.css`.

```css
.space-theme {
  --space-bg-primary: #0a0e27;
  --nebula-purple: #6b46c1;
  --glow-intensity: 0.8;
  /* ... */
}
```
