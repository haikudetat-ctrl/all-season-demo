import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { join } from 'path';

const ROUTES = [
  { path: '/overview', name: '01-operations-center' },
  { path: '/sales', name: '02-sales-operations-center' },
  { path: '/speed', name: '03-speed-response-center' },
  { path: '/install', name: '04-project-lifecycle-tracker' },
  { path: '/referrals', name: '05-referral-network' },
  { path: '/marketing', name: '06-marketing-performance' },
];

const OUT_DIR = join(process.cwd(), 'captures');
const BASE_URL = 'http://localhost:3000';

async function capture() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route.path}`;
    console.log(`Capturing ${url}...`);

    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      // Wait a moment for any client-side rendering to settle
      await new Promise(r => setTimeout(r, 2000));

      // Wait for the header to be present (indicates app has loaded)
      try {
        await page.waitForSelector('header', { timeout: 10000 });
      } catch {
        console.log(`  Warning: header not found on ${route.path}, capturing anyway`);
      }

      await page.screenshot({
        path: join(OUT_DIR, `${route.name}.png`),
        fullPage: true,
      });

      console.log(`  ✓ Saved ${route.name}.png`);
    } catch (err) {
      console.error(`  ✗ Failed to capture ${route.path}:`, err);
    }
  }

  await browser.close();
  console.log(`\nDone! ${ROUTES.length} captures saved to ${OUT_DIR}`);
}

capture();
