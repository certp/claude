import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// English content and answer keys from the initial, unmodified question bank.
// Only update these fingerprints when an English-content change is explicitly approved.
const banks = {
  ccaf: { count: 309, english: '65abaf9f' },
  ccao: { count: 193, english: '68a9f24e' },
  ccdf: { count: 155, english: 'c6913270' },
};

function englishFingerprint(qs) {
  const source = JSON.stringify(qs.map(q => [q.id, q.q, q.o, q.a, q.m, q.topic]));
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

const html = readFileSync(join(root, 'index.html'), 'utf8');
assert.ok(!html.includes('const DATA = {"ccaf"'), 'Question banks must not be embedded in HTML');
assert.ok(html.includes('loadQuestionBank'), 'Lazy loader is missing');

let total = 0;
for (const [cert, expected] of Object.entries(banks)) {
  const bank = JSON.parse(readFileSync(join(root, 'data', `${cert}.json`), 'utf8'));
  assert.ok(Array.isArray(bank.qs), `${cert}: missing qs array`);
  assert.equal(bank.qs.length, expected.count, `${cert}: unexpected question count`);
  const ids = new Set();
  for (const q of bank.qs) {
    assert.equal(typeof q.id, 'string', `${cert}: invalid question ID`);
    assert.ok(!ids.has(q.id), `${cert}: duplicated ID ${q.id}`);
    ids.add(q.id);
    assert.equal(typeof q.q, 'string', `${cert}:${q.id} missing English question`);
    assert.ok(Array.isArray(q.o) && q.o.length > 0, `${cert}:${q.id} missing choices`);
    assert.ok(q.o.every(o => typeof o.k === 'string' && typeof o.h === 'string'), `${cert}:${q.id} malformed choices`);
    assert.ok(Array.isArray(q.a) && q.a.length === q.m, `${cert}:${q.id} answer count mismatch`);
    assert.ok(q.a.every(k => q.o.some(o => o.k === k)), `${cert}:${q.id} answer key missing from choices`);
    assert.ok(q.v && typeof q.v.q === 'string' && Array.isArray(q.v.o) && q.v.o.length === q.o.length, `${cert}:${q.id} translated choices mismatch`);
    assert.equal(typeof q.e, 'string', `${cert}:${q.id} missing explanation`);
    if (cert === 'ccdf') {
      // CCD-F was retranslated end-to-end; catch garbled words and broken markup.
      const vietnamese = [q.v.q, ...q.v.o, q.e];
      for (const translation of vietnamese) {
        assert.ok(typeof translation === 'string' && translation.trim().length > 0,
          `${cert}:${q.id} missing Vietnamese text`);
        assert.ok(!/(?:^|\s)(?:s\?|b\?|d\?|m\?|r\?|v\?)(?=\s|$)/u.test(translation),
          `${cert}:${q.id} contains corrupted Vietnamese characters`);
        for (const tag of ['p', 'ul', 'ol', 'li']) {
          const openings = (translation.match(new RegExp(`<${tag}(?:\\s[^>]*)?>`, 'g')) || []).length;
          const closings = (translation.match(new RegExp(`</${tag}>`, 'g')) || []).length;
          assert.equal(openings, closings, `${cert}:${q.id} unbalanced <${tag}> tags`);
        }
      }
    }
  }
  assert.equal(englishFingerprint(bank.qs), expected.english, `${cert}: original English/answer content changed`);
  console.log(`PASS ${cert}: ${bank.qs.length} questions, English unchanged`);
  total += bank.qs.length;
}
console.log(`PASS: ${total} questions across ${Object.keys(banks).length} JSON banks`);
