# 📚 School Magazine - Digital Flipbook Platform

> An interactive 3D digital magazine platform built with React Three Fiber, featuring a realistic page-turning experience and full-featured admin panel for content management.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://r3f-animated-book-slider-final.vercel.app/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r3f-orange)](https://threejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)

![Demo](https://github.com/user-attachments/assets/c6b6ea2e-2643-4d53-89b7-ee5b848de06d)

## 🎯 Overview

A production-ready digital magazine platform specifically designed for schools and educational institutions. Features a stunning 3D flipbook viewer with realistic page-turning animations, combined with a comprehensive admin panel for easy content management.

## ✨ Key Features

### 📖 Immersive Reader Experience
- **3D Flipbook Viewer** with realistic physics-based page turning
- **Double-click to flip pages** - intuitive interaction
- **Smooth animations** using React Three Fiber
- **RTL/LTR Support** for multi-language content (Arabic, Hebrew, English)
- **Responsive design** - works on desktop, tablet, and mobile
- **Progressive image loading** for fast performance

### 🎨 Admin Panel (Full CMS)
- **Complete CRUD operations** - Create, edit, delete issues
- **Page Management** - Add, remove, reorder pages
- **Visual Settings Editor**:
  - Background gradients
  - Marquee text customization
  - Reading direction (LTR/RTL)
  - Animation physics controls
- **PDF Import System**:
  - One-click PDF to Spread conversion
  - Automatic page splitting and optimization
  - Preserves original quality while compressing
- **Image Upload** with automatic WebP compression
- **Performance Optimized UI**:
  - Local state management for lag-free editing
  - "Save to Apply" pattern for heavy operations
  - Instant feedback on text inputs
- **Publish/Unpublish** control for issues
- **Live Preview** - See changes before publishing
- **Role-based authentication** via Supabase

### ⚡ Performance Optimizations
- **Automatic Image Compression** - 85% file size reduction
- **WebP Format** - 25-35% smaller than JPG
- **Progressive Loading** - Instant perceived performance
- **Smart Caching** - Faster subsequent loads
- **Mobile Optimized** - Smooth on low-end devices
- **Network Efficient** - Works great on slow connections

### 🔐 Authentication & Security
- **Supabase Authentication** - Secure admin login
- **Row Level Security (RLS)** - Database-level protection
- **Role-based access** - Admin vs public views
- **Session management** - Automatic token refresh

### 📊 Analytics (Built-in)
- Page view tracking
- Dwell time measurement
- Click heatmaps
- Page turn analytics
- Session tracking

## 🎓 Credits & Attribution

### Original Project
This project is built upon the excellent work by **Wass08**:

- **Original Repository**: [r3f-animated-book-slider](https://github.com/wass08/r3f-animated-book-slider-final)
- **Tutorial Video**: [YouTube - Build a 3D Book with React Three Fiber](https://youtu.be/b7a_Y1Ja6js)
- **Author**: [Wass08](https://github.com/wass08)

**Full credit to Wass08** for the amazing 3D flipbook foundation, physics animations, and React Three Fiber implementation. The original project provided the core 3D viewer experience.

### What We Added

Building on Wass08's foundation, we transformed it into a **production-ready school magazine platform** with:

#### 🆕 Major Additions:

1. **Complete Admin Panel**
   - Full-featured CMS for content management
   - Issue metadata editor (title, subtitle, date, tags)
   - Visual settings panel with live preview
   - Page manager with drag-and-drop ordering

2. **Supabase Integration**
   - PostgreSQL database for content storage
   - Supabase Storage for image hosting
   - Row Level Security policies
   - Real-time data synchronization
   - Authentication system

3. **Image Optimization System**
   - Automatic WebP compression (85% size reduction)
   - Client-side compression (instant, no server needed)
   - Progressive texture loading
   - Smart quality adaptation
   - Validation and error handling

4. **RTL Language Support**
   - Right-to-left reading direction
   - Flipped navigation UI
   - Per-issue direction configuration
   - Arabic/Hebrew support

5. **Enhanced UX Features**
   - Double-click page navigation
   - Customizable marquee text
   - Dynamic gradients per issue
   - Responsive mobile design
   - Loading states and error handling

6. **Analytics System**
   - Page view tracking
   - Dwell time measurement
   - Click position tracking
   - Session analytics
   - Device fingerprinting

7. **Production Infrastructure**
   - Environment configuration
   - Error boundaries
   - Performance monitoring
   - Cache management
   - SEO optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- Modern browser with WebGL support

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/E-Roar/School-Mag.git
cd School-Mag
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase database**
   - Create tables using `supabase/SCHEMA.sql`
   - Apply RLS policies from `supabase/RLS_POLICIES.sql`
   - Create storage bucket: `pages` (public access)

5. **Run development server**
```bash
npm run dev
```

6. **Access the app**
   - Public viewer: `http://localhost:5173`
   - Admin panel: `http://localhost:5173/admin`

### Default Admin Credentials (Mock Mode)
If Supabase is not configured:
- Email: `admin@school.edu`
- Password: `supersecure`

## 📖 Documentation

- **[Performance Optimization Guide](PERFORMANCE_OPTIMIZATION_SUMMARY.md)** - Image compression details
- **[Image Compression Guide](IMAGE_COMPRESSION_GUIDE.md)** - Complete compression documentation
- **[Complete Fix Log](COMPLETE_FIX_LOG_2025-11-22.md)** - Development history

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Three Fiber** - 3D rendering
- **Three.js** - WebGL graphics
- **Jotai** - State management
- **React Router** - Navigation
- **Vite** - Build tool

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Storage
  - Real-time features

### Performance
- **browser-image-compression** - Client-side image optimization
- **@tanstack/react-query** - Data fetching & caching

## 📁 Project Structure

```
School-Mag/
├── src/
│   ├── components/          # React components
│   │   ├── admin/          # Admin panel components
│   │   ├── Book.jsx        # 3D flipbook viewer
│   │   ├── UI.jsx          # Navigation UI
│   │   └── SceneLayout.jsx # 3D scene setup
│   ├── routes/             # Page routes
│   ├── context/            # React contexts
│   ├── lib/                # Supabase & utilities
│   ├── utils/              # Helper functions
│   │   ├── imageCompression.js
│   │   └── textureLoader.js
│   ├── data/               # Default data
│   └── store.js            # Global state
├── supabase/               # Database schema & policies
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🎨 Customization

### Changing Visual Settings
Edit `src/data/defaultBooks.js`:
```javascript
export const defaultVisualSettings = {
  gradientStart: "#5a47ce",
  gradientEnd: "#232323",
  marqueeTexts: ["Your School", "Magazine", "2024"],
  direction: "ltr", // or "rtl" for Arabic/Hebrew
  // ... more settings
};
```

### Compression Settings
Edit `src/utils/imageCompression.js`:
```javascript
const DEFAULT_OPTIONS = {
  maxSizeMB: 1.5,
  maxWidthOrHeight: 2048,
  initialQuality: 0.85,
  fileType: 'image/webp',
};
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Environment Variables on Vercel
Add these in your Vercel project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📊 Performance Metrics

| Metric | Before Optimization | After Optimization | Improvement |
|--------|-------------------|-------------------|-------------|
| Image Upload (8MB, 4G) | 6s | 1s | **83% faster** |
| File Size | 8MB | 1.2MB | **85% smaller** |
| First Load | 3.5s | 1.2s | **66% faster** |
| Mobile Performance | Fair | Excellent | **Optimized** |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project builds upon the original work by Wass08. Please check the original repository for licensing terms.

## 🙏 Acknowledgments

- **Wass08** - For the incredible 3D flipbook foundation and tutorial
- **React Three Fiber Team** - For making 3D in React accessible
- **Supabase Team** - For the amazing backend platform
- **All Contributors** - For improvements and bug fixes

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for educational institutions**

Original concept by [Wass08](https://github.com/wass08) | Enhanced by [E-Roar](https://github.com/E-Roar)