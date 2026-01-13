# Etsy Image Optimizer

A fast, clean tool for optimizing Etsy listing images using AI-powered visual improvements with Gemini 2.0 Flash.

## Features

- Upload 1-10 images for optimization
- Save reusable elements with @mention references
- AI-powered image analysis and optimization recommendations
- Etsy-aligned visual implementations (aspect ratios, sizing, compression)
- Full-screen image viewer with navigation
- Photo count compliance indicator
- Dark, modern UI

## Tech Stack

- Pure HTML/CSS/JavaScript (no build step)
- Supabase (authentication, database, storage)
- Gemini 2.0 Flash API (AI image analysis)
- Vercel (deployment)

## Setup

### Prerequisites

1. Supabase project with:
   - Tables: `elements`, `generated_images`
   - Storage buckets: `elements`, `generated`
   - RLS policies enabled

2. Gemini API key from Google AI Studio

3. Vercel account

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/enjaypa-png/improve-pics.git
cd improve-pics
```

2. Create a `env.js` file in the root directory:
```javascript
window.ENV = {
    SUPABASE_URL: 'your-supabase-url',
    SUPABASE_ANON_KEY: 'your-supabase-anon-key',
    GEMINI_API_KEY: 'your-gemini-api-key'
};
```

3. Include it in `index.html` before `app.js`:
```html
<script src="env.js"></script>
<script type="module" src="app.js"></script>
```

4. Start a local server:
```bash
python -m http.server 8000
# or
npm run dev
```

5. Open http://localhost:8000

### Vercel Deployment

1. Push code to GitHub

2. Import project in Vercel

3. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`

4. Deploy

Note: Environment variables need to be injected at build time. Add this script to inject them:

Create `inject-env.js`:
```javascript
const fs = require('fs');

const envScript = `
<script>
window.ENV = {
  SUPABASE_URL: '${process.env.SUPABASE_URL}',
  SUPABASE_ANON_KEY: '${process.env.SUPABASE_ANON_KEY}',
  GEMINI_API_KEY: '${process.env.GEMINI_API_KEY}'
};
</script>
`;

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('</head>', `${envScript}</head>`);
fs.writeFileSync('index.html', html);
```

Update `package.json`:
```json
{
  "scripts": {
    "build": "node inject-env.js"
  }
}
```

Update `vercel.json`:
```json
{
  "buildCommand": "npm run build"
}
```

## Supabase Schema

### Tables

**elements**
```sql
CREATE TABLE elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE elements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own elements
CREATE POLICY "Users can access own elements"
  ON elements
  FOR ALL
  USING (auth.uid() = user_id);
```

**generated_images**
```sql
CREATE TABLE generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own generated images
CREATE POLICY "Users can access own generated images"
  ON generated_images
  FOR ALL
  USING (auth.uid() = user_id);
```

### Storage Buckets

1. **elements** (private)
   - RLS policy: `auth.uid() = (storage.foldername(name))[1]::uuid`

2. **generated** (private)
   - RLS policy: `auth.uid() = (storage.foldername(name))[1]::uuid`

## Usage

1. **Upload Images**: Click "Add Images" to upload 1-10 images

2. **Save Elements**: Click "Save Element" on any uploaded image to create a reusable reference

3. **Reference Elements**: Type `@elementName` in the prompt to reference saved elements

4. **Generate**: Type your optimization prompt and click "Generate"

5. **View Results**: Click any generated image to open full-screen view with download/save options

## Photo Count Indicators

- **1-4 photos**: Few Photos (warning)
- **5-7 photos**: Compliant
- **8-10 photos**: Optimal

## Etsy-Aligned Features

- Aspect ratio selector (4:3 default, 1:1, 16:9)
- Image compression under 1MB
- sRGB color profile
- Clear before/after presentation

## v0 Limitations

- Gemini API returns text analysis, not generated images
- Uploaded images are saved as "optimized" versions for demo purposes
- Real image generation would require different API approach

## Future Enhancements

- Real image generation API integration
- Batch processing
- Image editing tools
- A/B testing for listing images
- Performance analytics

## License

MIT
