// End-to-end smoke test: build output served by `vite preview`, driven in headless
// Firefox (no Web MIDI there, so pads are clicked on screen). Run: npm run e2e
// Set E2E_URL to test a deployed site instead (e.g. the GitHub Pages URL).
import { mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import { preview } from 'vite';

// Snap Firefox cannot see the system /tmp, so keep its profile under the project.
process.env.TMPDIR = new URL('../node_modules/.e2e-tmp/', import.meta.url).pathname;
mkdirSync(process.env.TMPDIR, { recursive: true });

const server = process.env.E2E_URL ? null : await preview({ preview: { port: 4173, strictPort: true } });
const browser = await puppeteer.launch({ browser: 'firefox', executablePath: process.env.FIREFOX ?? '/usr/bin/firefox', headless: true });
const errors = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(process.env.E2E_URL ?? 'http://localhost:4173/push-chromatic-coach/');

  const clickText = async (text) => {
    const button = await page.waitForSelector(`::-p-xpath(//button[contains(., "${text}")])`, { timeout: 10_000 });
    await button.click();
  };
  const waitText = (text, timeout = 15_000) => page.waitForSelector(`::-p-text(${text})`, { timeout });

  await clickText('Start');
  await waitText('piano ready');
  await clickText('Carol of the Bells');
  await waitText('Same layout on your Push');

  // Watch: the phrase plays with pads lighting, then Follow starts by itself.
  await clickText('Watch');
  await page.waitForSelector('.pad.target', { timeout: 5_000 });
  await waitText('Play:', 20_000);

  // Follow: click the waiting green pad until the section is done.
  for (let n = 0; n < 50 && !(await page.$('::-p-text(Clean run)')); n++) {
    const pad = await page.waitForSelector('.pad.target', { timeout: 5_000 });
    await pad.click();
  }
  await waitText('Clean run');
  await waitText('A pattern that repeats');

  await clickText('Check Push');
  await waitText('Incoming MIDI');
  console.log('e2e ok');
} finally {
  await browser.close();
  server?.httpServer.close();
}
if (errors.length) {
  console.error('Page errors:\n' + errors.join('\n'));
  process.exit(1);
}
