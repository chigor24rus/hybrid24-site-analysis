import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const routes = [
  '/',
  '/services',
  '/promotions',
  '/reviews',
  '/blog',
  '/brands',
  '/legal',
  '/bonus-program',
  '/warranty',
];

const distDir = path.join(__dirname, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('❌ Error: dist/index.html not found. Run "bun run build" first.');
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

console.log('\n🚀 Generating static HTML files for SEO...\n');

routes.forEach(route => {
  if (route === '/') {
    console.log('✓ / (already exists as index.html)');
    return;
  }

  const routeDir = path.join(distDir, route);
  
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml);
  console.log(`✓ ${route}`);
});

console.log('\n✅ Static HTML generation complete!\n');
console.log('📝 These pages are now crawlable by search engines.');
console.log('💡 Run after each build: node generate-static.js\n');
