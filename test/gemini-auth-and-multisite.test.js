import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const server = read('server.ts');
const homepage = read('index.html');
const env = read('.env.example');
const guide = read('LIVE_ANALYTICS_KURULUM_TR.md');
const bloggerTheme = read('emrepelit7337-blogger-turkish-sync-theme.xml');
const tracker = read('public/analytics-tracker.js');

test('Gemini credentials load from dotenv and accept either server-side key name', () => {
  assert.match(server, /import 'dotenv\/config';/);
  assert.match(server, /process\.env\.GOOGLE_API_KEY \|\| process\.env\.GEMINI_API_KEY/);
  assert.match(server, /process\.env\.GEMINI_MODEL \|\| 'gemini-3\.8-flash'/);
  assert.match(server, /app\.get\('\/api\/gemini\/status'/);
  assert.match(env, /GOOGLE_API_KEY/);
  assert.match(env, /GEMINI_API_KEY/);
  assert.match(env, /GEMINI_MODEL="gemini-3\.8-flash"/);
});

test('Gemini authentication failures produce a safe, actionable message without exposing the secret', () => {
  assert.match(server, /Gemini kimlik doğrulaması başarısız/);
  assert.match(server, /anahtarı frontend koduna koymayın/i);
  assert.match(server, /safeMessage\.replace\(/);
  assert.match(server, /GOOGLE_API_KEY veya GEMINI_API_KEY/);
});

test('obsolete fake NLP banner and no-op translation placeholder are removed from homepage', () => {
  assert.doesNotMatch(homepage, /NLP CONNECTED/i);
  assert.doesNotMatch(homepage, /id=["']ai-indicator["']/i);
  assert.doesNotMatch(homepage, /runNlpTranslation/);
});

test('Blogger has its own tracker key and unified analytics dashboard link', () => {
  assert.match(bloggerTheme, /analytics-tracker\.js\?site=blogger/);
  assert.match(bloggerTheme, /sci-phil-unified-analytics-link/);
  assert.match(tracker, /searchParams\.get\('site'\)/);
});

test('multisite analytics setup explains that IDs must be configured for live data', () => {
  assert.match(env, /UMAMI_BLOGGER_WEBSITE_ID/);
  assert.match(env, /UMAMI_GROKME_WEBSITE_ID/);
  assert.match(guide, /science-philosophy\.grok\.me/);
  assert.match(guide, /anahtar.*yalnızca sunucu/i);
});
