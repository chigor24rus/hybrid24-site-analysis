import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  staticDir: path.join(__dirname, 'dist'),
  routes: [
    '/',
    '/services',
    '/promotions', 
    '/reviews',
    '/blog',
    '/brands',
    '/legal',
    '/bonus-program',
    '/warranty',
  ],
  renderer: '@prerenderer/renderer-puppeteer',
  rendererOptions: {
    headless: true,
    renderAfterDocumentEvent: 'render-event',
    renderAfterTime: 5000,
  },
};
