# Etsy Image Optimizer

A professional, client-side tool for optimizing product images to meet Etsy's technical requirements and best practices. Built with vanilla HTML, CSS, and JavaScript - no frameworks, no backend, no dependencies.

## 🎯 Features

### Core Functionality
- **Upload 1-10 images** for batch optimization
- **Automatic aspect ratio cropping** - 1:1 for thumbnails, 4:3 for supporting images
- **Precise resizing** to Etsy's required 3000px minimum width
- **sRGB color profile conversion** for consistent display across devices
- **72 PPI resolution metadata** optimized for web display
- **Smart compression** to keep file sizes under 1MB while maintaining quality
- **Before/after comparison** to see the transformations

### Professional UI/UX
- **"How It Works"** section with visual step-by-step guide
- **Key optimizations showcase** explaining the value upfront
- **Optimization preview checklist** so users know what to expect
- **Thumbnail navigation** for quick browsing of optimized images
- **Interactive tooltips** explaining why each optimization matters for Etsy
- **Photo count compliance indicator** (Few/Compliant/Optimal based on 1-10 photos)
- **Smooth transitions** (300ms ease) throughout the interface
- **Fully responsive design** for desktop, tablet, and mobile

### Design
- Premium dark theme inspired by Robinhood
- Neon green (#C9FF00) primary accent for CTAs
- Purple (#B565FF) secondary accent for highlights
- Subtle background gradients and patterns
- Professional typography (Inter + Newsreader serif)

## 🛠️ Tech Stack

- **Pure HTML/CSS/JavaScript** - No frameworks, no build dependencies
- **Canvas API** - Client-side image processing
- **File API** - Browser-native file handling
- **Vercel** - Static site hosting

**Why vanilla?**
- Zero dependencies = faster load times
- No framework bloat
- Easy to understand and maintain
- Works everywhere without transpilation

## 🚀 Quick Start

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/enjaypa-png/improve-pics.git
cd improve-pics
```

2. **Start a local server:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server -p 8000
```

3. **Open in browser:**
```
http://localhost:8000
```

That's it! No npm install, no build step, no configuration.

### Vercel Deployment

The project is configured for zero-config deployment on Vercel:

1. **Push to GitHub**
2. **Import to Vercel** (vercel.com)
3. **Deploy** - That's it!

The `build.js` script automatically copies files to the `public/` directory during deployment.

## 📖 How It Works

### Image Processing Pipeline

1. **Upload** - User selects 1-10 JPG, PNG, or GIF images
2. **Analysis** - Detect original dimensions and aspect ratio
3. **Cropping** - Center-crop to target aspect ratio (1:1 or 4:3)
4. **Resizing** - Scale to 3000×3000px (thumbnail) or 3000×2250px (supporting)
5. **Color Conversion** - Convert to sRGB color space
6. **Compression** - Binary search for optimal JPEG quality under 1MB
7. **Download** - Individual downloads or batch "Download All"

### Why These Specific Optimizations?

**3000×3000px (Thumbnail)**
- Etsy requires minimum 3000px width
- 1:1 aspect ratio ensures square thumbnail display in search results
- Large size enables zoom functionality for customers

**3000×2250px (Supporting Images)**
- Etsy requires minimum 3000px width
- 4:3 aspect ratio is Etsy's standard for listing galleries
- Consistent sizing across all listings

**sRGB Color Profile**
- Most widely supported color space for web
- Ensures colors look the same on all devices and browsers
- Prevents color shifts when Etsy processes images

**72 PPI Resolution**
- Web standard resolution
- Higher PPI doesn't improve screen display
- Keeps file sizes smaller for faster loading

**< 1MB File Size**
- Etsy's recommended file size limit
- Faster page loads = better SEO
- Better customer experience on mobile devices

## 🎨 Photo Count Compliance

The app shows a real-time compliance indicator:

- **1-4 photos** → "Few Photos" (⚠️ Warning - Etsy recommends more)
- **5-7 photos** → "Compliant" (✓ Good - meets Etsy standards)
- **8-10 photos** → "Optimal" (⭐ Excellent - maximum allowed)

Etsy recommends 5-10 high-quality images per listing for best conversion rates.

## 📁 Project Structure

```
improve-pics/
├── index.html          # Main HTML structure (all pages in one file)
├── app.js              # Core JavaScript logic (510 lines)
├── styles.css          # All styling (1400+ lines)
├── build.js            # Vercel build script
├── package.json        # Project metadata (no dependencies)
├── vercel.json         # Vercel deployment config
├── README.md           # This file
├── AGENTS.md           # AI agent collaboration guide
├── PROGRESS.txt        # Development progress log
└── .gitignore          # Git ignore patterns
```

## 🎯 Use Cases

**For Etsy Sellers:**
- Quickly optimize product photos before listing
- Ensure all images meet Etsy's technical requirements
- Improve search visibility with proper sizing
- Faster page loads = better SEO

**For Portfolio:**
- Demonstrates strong UX/UI design skills
- Shows understanding of e-commerce requirements
- Clean, maintainable vanilla JavaScript
- Professional design system implementation

## 🔧 Browser Support

Works in all modern browsers:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

Requires:
- Canvas API support
- File API support
- CSS Grid support
- ES6 JavaScript

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 👤 Author

**Nick Palla**
- LinkedIn: [linkedin.com/in/nick-palla-2575b6326](https://www.linkedin.com/in/nick-palla-2575b6326/)
- GitHub: [github.com/enjaypa-png](https://github.com/enjaypa-png)

## 🙏 Acknowledgments

- Design inspired by Robinhood's clean, professional aesthetic
- Icons from Heroicons (embedded as inline SVG)
- Built with guidance from Claude AI (Anthropic)

---

**Built for Etsy sellers. No AI, no scores, no opinions - just deterministic, compliant image processing.** ✨
