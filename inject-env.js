const fs = require('fs');

const envScript = `
<script>
window.ENV = {
  SUPABASE_URL: '${process.env.SUPABASE_URL || ''}',
  SUPABASE_ANON_KEY: '${process.env.SUPABASE_ANON_KEY || ''}',
  GEMINI_API_KEY: '${process.env.GEMINI_API_KEY || ''}'
};
</script>
`;

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('</head>', `${envScript}</head>`);
fs.writeFileSync('index.html', html);

console.log('Environment variables injected into index.html');
