# Dashboard & Settings Updates

## ✅ Features Implemented

### 1. **Refresh Button**
- Added a refresh button (🔄) to the Dashboard Overview header.
- Refreshes logs, platform analytics, and book analytics (if a book is selected).

### 2. **Collapsed Settings**
- **Issue Settings (`Editor.jsx`)**: All accordion sections (Details, Pages, Visuals) are now collapsed by default.
- **Platform Settings (`SettingsPanel.jsx`)**: Refactored to use an accordion layout for "General", "Security", and "Notifications". All collapsed by default.

### 3. **Click Analytics & Heatmaps**
- **Total Clicks**: Added a new metric card showing total clicks for the selected issue.
- **Heatmaps**: Added a "Interaction Heatmap" section to the Dashboard Overview when an issue is selected.
  - Shows "Click Density" and "Hover Density".
  - Uses the new `Heatmap` component.
- **Mock Data**: Updated `mockAnalytics.js` to generate realistic heatmap data for demo mode.

## 📁 Files Modified
- `src/components/admin/DashboardOverview.jsx`
- `src/components/admin/Editor.jsx`
- `src/components/admin/SettingsPanel.jsx`
- `src/lib/mockAnalytics.js`
