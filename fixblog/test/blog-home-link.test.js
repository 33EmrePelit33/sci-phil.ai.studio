import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Blog Ana Sayfa points to the original Blogger homepage in desktop/mobile header and footer', () => {
  const header = readFileSync(new URL('../src/components/Header.tsx', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(header, /href="https:\/\/emrepelit7337\.blogspot\.com\/"/);
  assert.match(header, /<span>Blog Ana Sayfa<\/span>/);
  assert.doesNotMatch(header, /className="hidden 2xl:inline-flex[^\"]*"[\s\S]{0,500}<span>Blog Ana Sayfa<\/span>/);
  assert.match(app, /href="https:\/\/emrepelit7337\.blogspot\.com\/"[\s\S]{0,300}Blog Ana Sayfa/);
});
