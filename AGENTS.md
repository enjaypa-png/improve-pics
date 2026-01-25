# AI Agent Collaboration Guide

This document provides guidance for AI agents (like Claude) working on the Etsy Image Optimizer project.

## Project Overview

**Type:** Client-side web application
**Stack:** Vanilla HTML, CSS, JavaScript (no frameworks)
**Purpose:** Optimize product images to meet Etsy's technical requirements
**Architecture:** Single-page application (SPA) with all pages in one HTML file

## Core Principles

### 1. Keep It Simple
- **No frameworks** - This is intentional. Pure vanilla JS keeps the bundle size minimal.
- **No build dependencies** - The `build.js` is only for Vercel deployment (copies files to `public/`)
- **No npm packages** - Everything is built-in browser APIs

### 2. Maintain Consistency
- **Design system** - Follow the existing Robinhood-inspired aesthetic
- **Color palette:**
  - Primary: Neon Green `#C9FF00`
  - Secondary: Purple `#B565FF`
  - Background: Pure Black `#0A0A0A` to Dark Gray gradient
- **Typography:** Inter (body) + Newsreader (headlines)
- **Transitions:** Always 300ms ease

### 3. Zero Backend
- Everything runs in the browser
- No server-side processing
- No database, no authentication
- Images are processed using Canvas API and downloaded directly

## File Structure

```
/home/user/improve-pics/
├── index.html    # All HTML in one file, JavaScript toggles sections
├── app.js        # All JavaScript (~510 lines)
├── styles.css    # All CSS (~1400 lines)
├── build.js      # Vercel build script (copies to public/)
└── vercel.json   # Deployment config
```

### Key Architecture Decisions

**Why one HTML file?**
- Simple state management via JavaScript show/hide
- No routing needed
- Faster initial load (one HTTP request)

**Why vanilla CSS?**
- Full control over styling
- No framework bloat
- Easier for beginners to understand
- No build step needed

## Code Organization

### app.js Structure
```javascript
// Global State
let uploadedImages = [];
let optimizedImages = [];
let currentModalIndex = 0;

// Constants
const ETSY_SPECS = { /* Etsy requirements */ };

// Initialization
function init() { /* Setup event listeners */ }

// Image Processing Pipeline
function handleOptimize() { /* Main orchestration */ }
function processImage() { /* Individual image processing */ }
function compressToTarget() { /* Quality optimization */ }
function generateOptimizationSummary() { /* Build summary with tooltips */ }

// Rendering Functions
function renderUploadedImages() { /* Upload page */ }
function renderOptimizedImages() { /* Results page with thumbnails */ }

// Utilities
function formatFileSize() { /* Human-readable sizes */ }
function scrollToOptimizedImage() { /* Thumbnail navigation */ }
```

### styles.css Structure
```css
/* 1. Design Tokens (CSS Variables) */
:root { --accent-green: #C9FF00; /* ... */ }

/* 2. Base Styles */
body, html { /* ... */ }

/* 3. Layout Components */
.sidebar { /* ... */ }
.main-content { /* ... */ }

/* 4. Page Sections */
.hero-section { /* ... */ }
.upload-section { /* ... */ }
.optimized-section { /* ... */ }

/* 5. Reusable Components */
.btn-primary { /* ... */ }
.image-card { /* ... */ }
.optimization-summary { /* ... */ }

/* 6. Responsive Design */
@media (max-width: 1024px) { /* ... */ }
@media (max-width: 640px) { /* ... */ }
```

## Making Changes

### Adding New Features

**DO:**
- ✅ Use vanilla JavaScript (no jQuery, no React)
- ✅ Follow existing naming conventions
- ✅ Add CSS transitions (300ms ease) for interactive elements
- ✅ Ensure responsive design (test mobile breakpoints)
- ✅ Update tooltips if adding optimization steps
- ✅ Test with actual images (JPG, PNG, GIF)

**DON'T:**
- ❌ Add npm dependencies
- ❌ Introduce frameworks (React, Vue, etc.)
- ❌ Add backend requirements
- ❌ Break the single-page structure
- ❌ Use inline styles (keep everything in styles.css)
- ❌ Add external API calls (keep it 100% client-side)

### UI/UX Guidelines

**Interactive Elements:**
- All clickable elements need hover states
- Use 300ms ease transitions
- Provide visual feedback (scale, glow, color change)
- Include tooltips for complex features

**Color Usage:**
- Green = Success, Primary actions, Download
- Purple = Highlights, Badges, Secondary accents
- Red = Errors, Remove actions
- Orange = Warnings, "Few Photos" status

**Typography Scale:**
- Headlines: Newsreader serif, large sizes
- Body: Inter, regular weight
- UI elements: Inter, medium/semibold

### Image Processing Guidelines

The core processing pipeline should never change without careful consideration:

1. **Upload** - Validate file type and count
2. **Crop** - Center-crop to target aspect ratio
3. **Resize** - Scale to exact Etsy dimensions
4. **Convert** - Ensure sRGB color space (via Canvas)
5. **Compress** - Binary search for quality under 1MB
6. **Download** - Blob URL → download link

**Critical specs (never change without reason):**
- Thumbnail: 3000×3000px (1:1)
- Supporting: 3000×2250px (4:3)
- Max file size: 1MB
- PPI metadata: 72
- Color space: sRGB

## Testing Checklist

Before committing changes, verify:

- [ ] Upload 1-10 images (test max limit)
- [ ] Test with small images (< 3000px) to verify upscaling
- [ ] Test with large images (> 3000px) to verify compression
- [ ] Click through all tooltips (hover on optimization steps)
- [ ] Test thumbnail navigation (click each thumbnail)
- [ ] Test "Download All" functionality
- [ ] Check responsive design (resize browser window)
- [ ] Test on mobile viewport (Chrome DevTools)
- [ ] Verify no JavaScript errors in console
- [ ] Check all transitions are smooth

## Common Tasks

### Adding a New Section to the Landing Page

1. Add HTML to `index.html` within `.hero-section`
2. Add CSS to `styles.css` with clear section comment
3. Add responsive styles in `@media` queries
4. Test on mobile and desktop

### Adding a New Optimization Step

1. Update `generateOptimizationSummary()` in `app.js`
2. Add the step with both `text` and `tooltip` properties
3. Update the "What We'll Optimize" preview checklist in `index.html`
4. Test that tooltip appears on hover

### Fixing a Visual Bug

1. Identify the CSS class/selector
2. Check `styles.css` for the relevant section
3. Make changes, preserving existing design tokens
4. Test across breakpoints

## Git Workflow

### Branch Naming
- Feature: `claude/feature-name-XXXXX`
- Bug fix: `claude/fix-bug-name-XXXXX`
- UI polish: `claude/polish-component-XXXXX`

(XXXXX = session ID from CLI context)

### Commit Messages
Follow conventional commits style:

```
Subject line (imperative, < 72 chars)

- Bullet point details
- What changed and why
- Any breaking changes or considerations
```

### Pull Requests
Always push to feature branch and provide PR link:
```
https://github.com/enjaypa-png/improve-pics/compare/main...BRANCH_NAME?expand=1
```

## Common Pitfalls

### 1. Don't Mix Data Structures
The tooltip system uses objects `{ text, tooltip }` not strings. If you see this:
```javascript
// ❌ WRONG
steps: ['✓ Cropped to 1:1', '✓ Resized to 3000px']

// ✅ CORRECT
steps: [
  { text: '✓ Cropped to 1:1', tooltip: 'Why this matters...' },
  { text: '✓ Resized to 3000px', tooltip: 'Why this matters...' }
]
```

### 2. Don't Break the SPA Toggle
The hero and optimizer sections toggle via JavaScript:
```javascript
// User clicks "Add Images & Get Started"
document.getElementById('heroSection').style.display = 'none';
document.getElementById('uploadSection').style.display = 'block';
```

Don't remove or rename these IDs without updating all references.

### 3. Don't Add Placeholder Content
Always use real, accurate information:
- ❌ "Lorem ipsum dolor sit amet"
- ❌ "Coming soon..."
- ❌ "TODO: Add content here"
- ✅ Real descriptions of what the tool does

### 4. Don't Forget Responsive Design
Every new section needs mobile styles:
```css
@media (max-width: 640px) {
  .your-new-section {
    padding: var(--space-md);
    font-size: var(--text-sm);
  }
}
```

## Design System Reference

### Spacing Scale
```css
--space-xs: 0.5rem;   /* 8px */
--space-sm: 0.75rem;  /* 12px */
--space-md: 1rem;     /* 16px */
--space-lg: 1.5rem;   /* 24px */
--space-xl: 2rem;     /* 32px */
--space-2xl: 3rem;    /* 48px */
--space-3xl: 4rem;    /* 64px */
```

### Border Radius
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-pill: 9999px;
```

### Font Sizes
```css
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
--text-3xl: 2rem;     /* 32px */
```

## Questions & Context

### Why no Supabase?
Earlier versions planned to use Supabase for auth/storage, but the final version is 100% client-side. All Supabase references have been removed.

### Why no Gemini API?
Same reason - earlier plans included AI analysis, but the final version does deterministic image processing only.

### Why Etsy-specific?
Etsy has strict image requirements (3000px min width, specific aspect ratios). This tool automates meeting those requirements.

### Can we add ZIP download?
The "Download All" button currently downloads files one-by-one with 100ms stagger. True ZIP creation would require a library (JSZip), which violates the "no dependencies" principle. The current approach works well enough.

### Can we add drag-and-drop upload?
Yes! This would be a good enhancement and requires only vanilla JavaScript Drag and Drop API. Make sure to:
- Add visual feedback when dragging over the drop zone
- Validate file types and count
- Merge with existing file input handling

## Success Metrics

A successful AI collaboration on this project means:

1. **Code Quality**
   - Vanilla JavaScript with no new dependencies
   - Consistent with existing patterns
   - Well-commented, readable code

2. **User Experience**
   - Smooth transitions (300ms)
   - Clear visual feedback
   - Mobile-responsive
   - No broken functionality

3. **Documentation**
   - Clear commit messages
   - Updated README if needed
   - Code comments for complex logic

4. **Testing**
   - Manually tested before committing
   - No console errors
   - Works on mobile and desktop

---

**Remember:** This is a portfolio piece. The goal is to demonstrate clean, professional code and strong UX thinking - not to add every possible feature.
