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

  const playThrough = async () => {
    // Click the waiting green pad(s) until the section is done; chords latch pad by pad.
    for (let n = 0; n < 100 && !(await page.$('::-p-text(Clean run)')); n++) {
      const pad = await page.waitForSelector('.pad.target', { timeout: 5_000 });
      await pad.click();
    }
    await waitText('Clean run');
  };

  await clickText('Start');
  await waitText('piano ready');

  // A song: Watch lights the pads and hands over to Play.
  await clickText('Songs');
  await clickText('Carol of the Bells');
  await waitText('Same layout on your Push');
  await clickText('Watch');
  await page.waitForSelector('.pad.target', { timeout: 5_000 });
  await waitText('Play:', 20_000);
  await playThrough();
  await waitText('A pattern that repeats');

  // Play along: click each pad about when it turns solid green (half a beat early),
  // then check that hits were scored and the results and best stars appear.
  await clickText('Play along');
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline && !(await page.$('.results'))) {
    const pad = await page.$('.pad.target');
    if (!pad) {
      await new Promise((r) => setTimeout(r, 20));
      continue;
    }
    await new Promise((r) => setTimeout(r, 230));
    await pad.click().catch(() => {});
    await page.waitForFunction((el) => !el.classList.contains('target'), { timeout: 2_000 }, pad).catch(() => {});
  }
  await waitText('points at');
  const hits = await page.$eval('.counts', (el) => [...el.textContent.matchAll(/(\d+) (perfect|great|good)/g)].reduce((t, m) => t + Number(m[1]), 0));
  if (hits < 6) throw new Error(`Play along scored only ${hits} of 12 notes`);
  await page.waitForSelector('.tabstars');

  // A basic chord lesson: chords are named with their role in the key.
  await clickText('Basics');
  await clickText('The chords of a key');
  await clickText('Step by step');
  await waitText('Play: C');
  for (let i = 0; i < 3; i++) await (await page.waitForSelector('.pad.target')).click();
  await waitText('I chord in C major');
  await waitText('Play: Dm');
  await playThrough();

  // Free play with the metronome.
  await clickText('Free play');
  await (await page.waitForSelector('::-p-xpath(//label[contains(., "Metronome")]/input)')).click();
  await page.waitForSelector('.dot.lit', { timeout: 5_000 });
  const pads = await page.$$('.pad');
  await pads[56].click(); // bottom-left pad (the grid is drawn top row first)
  await waitText('the root of C major');

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
