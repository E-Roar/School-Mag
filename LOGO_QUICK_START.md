# 🎨 Logo Upload - Quick Start Guide

## Step-by-Step Instructions

### 1️⃣ Prepare Your Logo
- ✅ **Format**: PNG with transparent background (recommended)
- ✅ **Size**: 512x512 pixels (square)
- ✅ **File Size**: Under 10MB
- ✅ **Design**: Simple, recognizable, scales well

### 2️⃣ Run Database Migration
**Important: Do this first!**

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy the contents from: `supabase/migrations/add_logo_variants.sql`
4. Paste and click "Run"
5. Verify success message

### 3️⃣ Upload Your Logo

1. **Navigate to Admin Panel**
   - Go to `/admin`
   - Click on **Settings** tab

2. **Upload Logo**
   - Click the "📤 Upload Logo" button
   - Select your logo file
   - Wait for progress:
     ```
     Validating...
     Compressing and generating variants...
     Uploading files...
     Updating settings...
     ✓ Logo uploaded successfully!
     ```

3. **Adjust Size (Optional)**
   - Use the slider to change logo size (32-80px)
   - Watch the live preview update
   - Find the perfect size for your brand

4. **Save**
   - Click "Save Changes" button
   - Wait for confirmation

### 4️⃣ Verify Results

Check these locations:
- [ ] **Landing Page Navigation** - Top left corner
- [ ] **Landing Page Hero** - Large 3D logo in center
- [ ] **Admin Panel Navigation** - Top left (clickable, goes to landing)
- [ ] **Browser Tab** - Favicon updated
- [ ] **Social Media** - Share a link and check preview

### 5️⃣ Test Social Sharing

1. Copy your site URL
2. Paste into:
   - Facebook post composer
   - Twitter tweet composer
   - WhatsApp/iMessage
3. Verify logo appears in preview

---

## 📐 Logo Size Guide

| Size | Use Case | Recommended For |
|------|----------|-----------------|
| 32-40px | Minimal | Very subtle branding |
| 42-50px | **Default** | Most sites (balanced) |
| 52-64px | Prominent | Strong brand presence |
| 66-80px | Maximum | Very bold branding |

## 🎨 What Happens Behind the Scenes

When you upload a logo, the system automatically:
1. ✅ Validates file type and size
2. ✅ Compresses the original image
3. ✅ Generates 5 optimized variants:
   - Full logo (512px WebP)
   - Favicon 192px (PNG)
   - Favicon 512px (PNG)
   - Thumbnail 128px (WebP)
   - OG Image 1200x630 (JPEG for social media)
4. ✅ Uploads all variants to cloud storage
5. ✅ Updates database with URLs
6. ✅ Updates favicon and meta tags automatically

## 🚨 Troubleshooting

### Logo Not Uploading?
- Check file size (must be under 10MB)
- Verify it's an image file (PNG, JPG, SVG)
- Check browser console for errors

### Logo Not Showing?
- Did you click "Save Changes"?
- Try refreshing the page (Ctrl+F5)
- Check if database migration was run
- Verify Supabase storage permissions

### Social Preview Not Showing?
- Some platforms cache previews (can take hours to update)
- Use Facebook Sharing Debugger to force refresh
- Twitter Card Validator for Twitter
- Check that OG image variant was created

### Size Slider Not Working?
- Make sure logo is uploaded first
- Click "Save Changes" to persist the size
- Refresh page to see changes on live site

## 💡 Pro Tips

1. **Use transparent background** - Looks better on different colored backgrounds
2. **Keep it simple** - Complex logos don't scale well to small sizes
3. **Test at smallest size** - If it looks good at 32px, it'll look good everywhere
4. **Square ratio** - 1:1 aspect ratio works best for most placements
5. **High contrast** - Ensures visibility in neomorphic shadows

## 🎯 Best Practices

### ✅ DO
- Use vector formats (SVG) when possible
- Keep file size reasonable
- Test on both light and dark backgrounds
- Check at different sizes before finalizing

### ❌ DON'T
- Use low-resolution images
- Upload extremely large files
- Use complex gradients that don't compress well
- Forget to save changes after adjusting size

---

**Need more help?** Check `LOGO_SYSTEM_README.md` for technical details.
