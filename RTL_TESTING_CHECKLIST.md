# RTL Text-Only Testing Checklist

## Pre-Test Setup
- [x] Dev server is running (`npm run dev`)
- [x] Browser is open to `http://localhost:5173`
- [ ] Browser DevTools are open (F12)
- [ ] Console tab is visible for error checking

---

## 🧪 Test 1: Language Switcher Visibility

### Landing Page
1. [ ] Navigate to `http://localhost:5173`
2. [ ] Look for language switcher in top navigation
3. [ ] Verify it shows "EN | FR | AR" buttons
4. [ ] Verify current language is highlighted

### Admin Panel
1. [ ] Navigate to `http://localhost:5173/admin`
2. [ ] Login if required
3. [ ] Look for language switcher in top navigation bar
4. [ ] Verify it shows "EN | FR | AR" buttons

**Expected:** Language switcher is visible and functional in both places.

---

## 🧪 Test 2: English Language (Default)

1. [ ] Click "EN" button
2. [ ] Verify all UI text is in English
3. [ ] Check browser DevTools:
   - [ ] `<body>` has class `lang-en`
   - [ ] `document.documentElement.lang` is `"en"`
   - [ ] `document.dir` is NOT set to `"rtl"`

**Expected:** All text in English, all layouts normal (LTR).

---

## 🧪 Test 3: French Language

1. [ ] Click "FR" button
2. [ ] Verify all UI text changes to French
3. [ ] Check browser DevTools:
   - [ ] `<body>` has class `lang-fr`
   - [ ] `document.documentElement.lang` is `"fr"`
4. [ ] Verify layout is still LTR (left-to-right)

**Expected:** Text in French, layout remains LTR.

---

## 🧪 Test 4: Arabic Language - Text Alignment

1. [ ] Click "AR" button
2. [ ] Check browser DevTools:
   - [ ] `<body>` has class `lang-ar`
   - [ ] `document.documentElement.lang` is `"ar"`
   - [ ] `document.dir` is NOT `"rtl"` (very important!)

### Text Content (Should be RTL - Right Aligned)
3. [ ] Main headings (`<h1>`, `<h2>`) are right-aligned
4. [ ] Paragraphs (`<p>`) are right-aligned
5. [ ] Arabic text reads from right to left naturally
6. [ ] Inspect a paragraph in DevTools:
   - [ ] CSS shows `direction: rtl`
   - [ ] CSS shows `text-align: right`

### UI Elements (Should STAY LTR - Left Aligned)
7. [ ] Navigation bar stays on the **left** side
8. [ ] Buttons don't flip positions
9. [ ] Language switcher doesn't flip
10. [ ] Input fields have cursor on **left** side
11. [ ] Logo/branding stays in normal position

**Expected:** 
- ✅ Text content is RTL
- ✅ UI layout remains LTR
- ❌ NO page flipping

---

## 🧪 Test 5: Specific Components in Arabic

### Landing Page (Arabic Mode)
1. [ ] Hero section title is right-aligned
2. [ ] Hero description text is right-aligned
3. [ ] Navigation buttons stay in normal positions
4. [ ] "Read Now" buttons don't flip
5. [ ] Footer content is right-aligned

### Admin Dashboard (Arabic Mode)
1. [ ] Sidebar menu stays on left
2. [ ] Dashboard cards don't flip
3. [ ] Form labels are right-aligned
4. [ ] Input fields stay LTR
5. [ ] Buttons in toolbars don't move
6. [ ] Stats/numbers display correctly

### 3D Book Viewer (Arabic Mode)
1. [ ] Navigate to a book (`/view/[book-id]`)
2. [ ] Top navigation bar stays normal
3. [ ] Book title (if shown) is right-aligned
4. [ ] Like button doesn't flip
5. [ ] 3D scene controls stay in position
6. [ ] Page navigation doesn't flip

---

## 🧪 Test 6: Responsive Design

### Mobile Viewport (375px)
1. [ ] Resize browser to mobile size
2. [ ] Switch to Arabic
3. [ ] Verify text is RTL
4. [ ] Verify mobile menu doesn't flip
5. [ ] Verify touch interactions work

### Tablet Viewport (768px)
1. [ ] Resize browser to tablet size
2. [ ] Verify layout in Arabic
3. [ ] Check text alignment
4. [ ] Check button positions

### Desktop Viewport (1920px)
1. [ ] Full screen test
2. [ ] Verify all components in Arabic
3. [ ] Check multi-column layouts

---

## 🧪 Test 7: Language Persistence

1. [ ] Select Arabic language
2. [ ] Refresh the page (F5)
3. [ ] Verify language is still Arabic
4. [ ] Check localStorage:
   - [ ] Key `i18nextLng` exists
   - [ ] Value is `"ar"`

5. [ ] Close browser tab
6. [ ] Reopen `http://localhost:5173`
7. [ ] Verify language is still Arabic

**Expected:** Language preference persists across sessions.

---

## 🧪 Test 8: Mixed Content

### Test Scenario: English Name in Arabic Page
1. [ ] Switch to Arabic
2. [ ] Find user-generated content (e.g., book title)
3. [ ] If title is in English, verify:
   - [ ] English text displays correctly
   - [ ] No visual glitches
   - [ ] Alignment is appropriate

**Expected:** Mixed LTR/RTL content displays correctly.

---

## 🧪 Test 9: Force RTL/LTR Classes

### Developer Test (Optional)
1. [ ] Open browser DevTools
2. [ ] Select any button element
3. [ ] Add class `force-rtl` in Elements panel
4. [ ] Verify button text aligns right
5. [ ] Remove class, add `force-ltr`
6. [ ] Verify element stays LTR even in Arabic mode

**Expected:** Utility classes override default behavior.

---

## 🧪 Test 10: Console Errors

1. [ ] Open browser console (F12 → Console tab)
2. [ ] Switch between all three languages
3. [ ] Navigate to different pages
4. [ ] Check for errors:
   - [ ] No translation key errors
   - [ ] No CSS errors
   - [ ] No React errors

**Expected:** Zero console errors related to i18n or RTL.

---

## 🧪 Test 11: Screen Reader Testing (Accessibility)

1. [ ] Switch to Arabic
2. [ ] Check `document.documentElement.lang`:
   - [ ] Should be `"ar"`
3. [ ] (Optional) Use screen reader:
   - [ ] Windows: Enable Narrator
   - [ ] macOS: Enable VoiceOver
   - [ ] Verify language is read correctly

**Expected:** Screen readers detect correct language.

---

## 🧪 Test 12: Performance Check

1. [ ] Open DevTools → Performance tab
2. [ ] Start recording
3. [ ] Switch languages multiple times
4. [ ] Stop recording
5. [ ] Verify:
   - [ ] No layout thrashing
   - [ ] Smooth transitions
   - [ ] No janky animations

**Expected:** Language switching is smooth and performant.

---

## 🐛 Known Issues to Watch For

### Issue Markers:
Mark any issues you find with these codes:

- 🔴 **Critical**: Breaks functionality
- 🟡 **Medium**: Visual issue or minor bug
- 🟢 **Low**: Cosmetic or edge case

### Common Issues:

#### If Entire Page Flips in Arabic:
- **Symptom:** Navigation moves to right, buttons flip
- **Check:** Is `document.dir` set to `"rtl"`?
- **Fix:** Remove `document.dir = 'rtl'` from code

#### If Text Doesn't Align Right:
- **Symptom:** Arabic text stays left-aligned
- **Check:** Does `<body>` have class `lang-ar`?
- **Fix:** Verify LanguageSwitcher useEffect is running

#### If Translations Don't Load:
- **Symptom:** Showing translation keys instead of text
- **Check:** Browser console for errors
- **Fix:** Verify translation files are valid JSON

#### If Buttons Text is Misaligned:
- **Symptom:** Button text is RTL when it shouldn't be
- **Fix:** Add `force-ltr` class to button

---

## 📊 Test Results Summary

### Overall Status:
- [ ] All tests passed ✅
- [ ] Some issues found 🟡 (list below)
- [ ] Critical issues 🔴 (list below)

### Issues Found:
```
Test #: Issue Description | Severity | Screenshot?
-------------------------------------------------------
[Example]
#4.7: Navigation bar flips in Arabic | 🔴 Critical | Yes
#5.2: Dashboard cards misaligned | 🟡 Medium | No
```

### Browser Tested:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Android

### Screen Sizes Tested:
- [ ] 375px (Mobile)
- [ ] 768px (Tablet)
- [ ] 1024px (Small Desktop)
- [ ] 1920px (Desktop)

---

## ✅ Sign-Off

**Tester Name:** _______________  
**Date:** _______________  
**Build Version:** _______________  

**Approved for:**
- [ ] Development ✅
- [ ] Staging 🚀
- [ ] Production 🎉

**Notes:**
```
[Any additional comments or observations]
```

---

## 📝 Quick Reference

### Expected CSS in Arabic Mode:
```css
body.lang-ar p {
  direction: rtl;      /* ✅ Should be present */
  text-align: right;   /* ✅ Should be present */
}

body.lang-ar button {
  direction: ltr;      /* ✅ Should be present */
  text-align: left;    /* ✅ Should be present */
}
```

### Expected HTML:
```html
<html lang="ar">
  <body class="lang-ar">
    <!-- Content -->
  </body>
</html>
```

### NOT Expected:
```html
<html dir="rtl">  <!-- ❌ Should NOT be present -->
```

---

## 🔗 Resources

- **Documentation:** `TRANSLATION_GUIDE.md`
- **Implementation Summary:** `RTL_IMPLEMENTATION_SUMMARY.md`
- **Dev Server:** `http://localhost:5173`
- **Admin Panel:** `http://localhost:5173/admin`

---

**Happy Testing! 🎉**
