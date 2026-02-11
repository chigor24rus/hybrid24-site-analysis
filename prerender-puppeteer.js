import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import handler from 'serve-handler';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, 'dist');

const routes = [
  '/',
  '/services',
  '/promotions',
  '/reviews',
  '/blog',
  '/brands',
  '/about',
  '/legal',
  '/bonus-program',
  '/warranty',
];

// Создаём простой HTTP сервер для обслуживания dist
const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: distPath,
    rewrites: [{ source: '**', destination: '/index.html' }],
  });
});

const PORT = 5555;

async function prerenderRoutes() {
  console.log('\n🚀 Starting pre-rendering with Puppeteer...\n');

  // Запускаем сервер
  await new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`✓ Local server started at http://localhost:${PORT}\n`);
      resolve();
    });
  });

  // Запускаем браузер
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const route of routes) {
      const page = await browser.newPage();
      const url = `http://localhost:${PORT}${route}`;

      console.log(`⏳ Rendering: ${route}`);

      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // Ждём, пока React отрендерит контент
      await page.waitForTimeout(2000);

      // Получаем HTML
      const html = await page.content();

      // Сохраняем
      if (route === '/') {
        writeFileSync(join(distPath, 'index.html'), html);
        console.log(`✓ / (saved as index.html)`);
      } else {
        const routePath = join(distPath, route.slice(1));
        if (!existsSync(routePath)) {
          mkdirSync(routePath, { recursive: true });
        }
        writeFileSync(join(routePath, 'index.html'), html);
        console.log(`✓ ${route}`);
      }

      await page.close();
    }
  } catch (error) {
    console.error('❌ Error during pre-rendering:', error);
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n✅ Pre-rendering complete!\n');
  console.log('📝 All pages are now crawlable by search engines.\n');
}

prerenderRoutes();