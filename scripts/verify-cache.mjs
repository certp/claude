import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const match = html.match(/const BANK_REVISIONS = Object\.freeze\((\{[^\n]+\})\);/);
assert.ok(match, 'Missing per-bank revision map');
const versions = JSON.parse(match[1]);
assert.deepEqual(Object.keys(versions).sort(), ['ccaf', 'ccao', 'ccdf']);

for (const cert of Object.keys(versions)) {
  const bytes = readFileSync(join(root, 'data', cert + '.json'));
  // Git blob SHA1 is the digest returned by the GitHub contents API.
  const gitSha = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
  assert.equal(versions[cert], gitSha,
    cert + ': bank JSON changed without updating its cache revision');
}
assert.match(html, /fetch\(`\.\/data\/\$\{cert\}\.json\?v=\$\{BANK_REVISIONS\[cert\]\}`, \{cache:'no-store'\}\)/,
  'Question bank must use versioned no-store fetch');
assert.match(html, /<script data-app-main>/);
assert.match(html, /<style data-app-style>/);
console.log('PASS: bank URLs are content-versioned, with enforced revisions');

const marker = '/* ---------- app updates ---------- */';
const begin = html.indexOf(marker);
const end = html.indexOf('/* ---------- storage ---------- */', begin);
assert.ok(begin >= 0 && end > begin, 'Missing app update notifier');
const snippet = html.slice(begin, end);

let time = 1700000000000;
let latest = {script: 'current-js',style: 'current-css'};
let replaceHref;
let requestedUrl;
let requestOptions;
let fetchCount = 0;
const banner = { hidden: true };
const button = { onclick: null };
const document = {
  hidden: false,
  getElementById: id => id === 'update-banner' ? banner : id === 'reload-app' ? button : null,
  querySelector: selector =>
    ({textContent: selector.startsWith('script') ? 'current-js' : 'current-css'}),
  addEventListener() {}
};
const context = {
  URL, Promise, location: {
    href: 'https://example.org/claude/#/ccaf/exam',
    replace(url) { replaceHref=url; }
  },
  Date: {now:()=>time},
  navigator: {onLine:true},
  document,
  window: {addEventListener() {}},
  setInterval() {},
  fetch: async (url, options) => {
    fetchCount++;
    requestedUrl=url;
    requestOptions=options;
    return {ok:true, headers:{get:()=> 'text/html; charset=utf-8'},
      text:async()=>JSON.stringify(latest)};
  },
  DOMParser: class {
    parseFromString(text) {
      const parsed = JSON.parse(text);
      return {querySelector: selector =>
        ({textContent: selector.startsWith('script') ? parsed.script : parsed.style})};
    }
  }
};
runInNewContext(snippet + '\nthis.probe = checkForAppUpdate;', context);
await context.probe();
assert.equal(banner.hidden,true,'Identical deployment should not notify');
assert.equal(requestOptions.cache,'no-store');
assert.ok(requestedUrl.includes('/claude/index.html?_check='),'Check must bust stale HTML URL');
const before = fetchCount;
await context.probe();
assert.equal(fetchCount,before,'Update check should throttle rapid repeat requests');

time += 61_000;
latest = {script: 'new-js', style:'current-css'};
await context.probe();
assert.equal(banner.hidden,false,'Changed app should offer a reload');
assert.equal(typeof button.onclick,'function');
button.onclick();
assert.ok(replaceHref.startsWith('https://example.org/claude/?v='));
assert.ok(replaceHref.includes('#/ccaf/exam'),'Reload must preserve the current route');

console.log('PASS: fresh HTML check, throttling, update banner and reload cache busting');
