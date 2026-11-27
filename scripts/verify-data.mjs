import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Pin original English question/choice text separately from the curated answer keys.
// Answer keys are also fingerprinted, but their baseline may be updated after a reviewed fix.
// Domain metadata is intentionally excluded so relabeling never changes these hashes.
const banks = {
  ccaf: { count: 309, english: '0bfd5bec', englishText: '86a599d8', domains: 5 },
  ccao: { count: 193, english: '86bde794', englishText: '0207dba6', domains: 7 },
  ccdf: { count: 155, english: '629ed52c', englishText: 'a889909d', domains: 8 },
};

function fnv1a(source) {
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

const englishFingerprint = qs => fnv1a(JSON.stringify(qs.map(q => [q.id, q.q, q.o, q.a, q.m])));
const englishTextFingerprint = qs => fnv1a(JSON.stringify(qs.map(q => [q.id, q.q, q.o])));

const architectTopics = {
  "149": "d5",
  "150": "d1",
  "157": "d1",
  "185": "d5",
  "186": "d5",
  "189": "d4",
  "194": "d1",
  "198": "d1",
  "203": "d5",
  "207": "d1",
  "209": "d1",
  "210": "d2",
  "213": "d2",
  "214": "d5",
  "215": "d5",
  "219": "d5",
  "224": "d5",
  "235": "d2",
  "236": "d5",
  "244": "d2",
  "245": "d5",
  "246": "d1",
  "247": "d5",
  "250": "d2",
  "259": "d3",
  "260": "d3",
  "261": "d3",
  "266": "d4",
  "270": "d4",
  "274": "d1",
  "278": "d1",
  "280": "d1",
  "281": "d1",
  "287": "d1",
  "288": "d2",
  "290": "d1",
  "292": "d1",
  "297": "d1",
  "307": "d2",
  "1221": "d1",
  "1224": "d1",
  "1227": "d4",
  "1231": "d1",
  "1238": "d5",
  "1240": "d1",
  "1242": "d3",
  "1386": "d1",
  "1390": "d2",
  "1392": "d4",
  "1400": "d1",
  "1403": "d5",
  "1404": "d5",
  "1417": "d1",
  "1422": "d5",
  "1430": "d1",
  "1431": "d5",
  "1437": "d5",
  "1445": "d5",
  "1447": "d1",
  "1451": "d5",
  "1452": "d4",
  "1454": "d4",
  "1456": "d3",
  "1457": "d4",
  "1458": "d5",
  "1461": "d5",
  "1474": "d1",
  "1478": "d1",
  "1479": "d1",
  "1480": "d1",
  "1481": "d4",
  "1482": "d1",
  "1485": "d2",
  "1486": "d5",
  "1488": "d2",
  "1496": "d4",
  "1502": "d5",
  "1503": "d5",
  "1505": "d5"
};
const architectSourceWarnings = ["159","196","239","246","1232","1236","1239","1401","1402","1406","1407","1408","1412","1417","1428","1430","1432","1448"];

const architectTipCautions = [...architectSourceWarnings, '1397', '207', '164', '272'];
const normalizedOption = s => s.replace(/<[^>]*>/g, ' ').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim().toLowerCase();
function verifyArchitectTip(q) {
  const label = `ccaf:${q.id} tip`;
  assert.ok(q.tip && ['cue', 'caution'].includes(q.tip.kind), `${label}: missing/invalid kind`);
  assert.equal(typeof q.tip.text, 'string', `${label}: missing text`);
  assert.ok(q.tip.text.trim().length >= 25 && !/tác nhân|�/iu.test(q.tip.text), `${label}: invalid text`);
  assert.ok(Array.isArray(q.tip.cues), `${label}: missing cues`);
  if (q.tip.kind === 'caution') {
    assert.equal(q.tip.cues.length, 0, `${label}: uncertain source cannot recommend a keyword`);
    return;
  }
  assert.equal(q.tip.cues.length, q.a.length, `${label}: must cover every correct choice`);
  assert.deepEqual(q.tip.cues.map(c => c.key).sort(), [...q.a].sort(), `${label}: incorrect or duplicate choice key`);
  for (const cue of q.tip.cues) {
    assert.equal(typeof cue.phrase, 'string', `${label}: invalid phrase`);
    const phrase = normalizedOption(cue.phrase);
    assert.ok(phrase.length >= 3, `${label}: empty/too-short phrase`);
    assert.ok(normalizedOption(q.o.find(o => o.k === cue.key).h).includes(phrase), `${label}: phrase absent from keyed option`);
    assert.ok(!q.o.some(o => !q.a.includes(o.k) && normalizedOption(o.h).includes(phrase)),
      `${label}: keyword also appears in a distractor`);
  }
}


const associateTopics = {
  '972':'d6', '975':'d3', '976':'d1', '977':'d1', '1002':'d7',
  '1046':'d7', '1047':'d5', '1050':'d4', '1051':'d6',
  '1052':'d4', '1055':'d2', '1058':'d7',
  '1059':'d6', '1061':'d7', '1065':'d7', '1068':'d3',
  '1076':'d4', '1094':'d4', '1096':'d4', '1099':'d3',
  '1104':'d7', '1105':'d3', '1117':'d3', '1258':'d1', '1259':'d2',
  '1264':'d7', '1270':'d3', '1271':'d4',
  '1274':'d4', '1289':'d7'
};

const html = readFileSync(join(root, 'index.html'), 'utf8');
assert.ok(!html.includes('const DATA = {"ccaf"'), 'Question banks must not be embedded in HTML');
assert.ok(html.includes('loadQuestionBank'), 'Lazy loader is missing');
assert.ok(html.includes('answerTipHTML(q)') && html.includes('answerTipHTML(question)'), 'Answer tips missing from learning or review');

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
    assert.ok(
      new RegExp('^d[1-' + expected.domains + ']' + String.fromCharCode(36)).test(q.topic),
      `${cert}:${q.id} invalid official exam domain ${q.topic}`
    );
    assert.equal(typeof q.q, 'string', `${cert}:${q.id} missing English question`);
    assert.ok(Array.isArray(q.o) && q.o.length > 0, `${cert}:${q.id} missing choices`);
    assert.ok(q.o.every(o => typeof o.k === 'string' && typeof o.h === 'string'), `${cert}:${q.id} malformed choices`);
    assert.ok(Array.isArray(q.a) && q.a.length === q.m, `${cert}:${q.id} answer count mismatch`);
    assert.ok(q.a.every(k => q.o.some(o => o.k === k)), `${cert}:${q.id} answer key missing from choices`);
    assert.ok(q.v && typeof q.v.q === 'string' && Array.isArray(q.v.o) && q.v.o.length === q.o.length, `${cert}:${q.id} translated choices mismatch`);
    assert.equal(typeof q.e, 'string', `${cert}:${q.id} missing explanation`);
    if (cert === 'ccaf' || cert === 'ccdf' || cert === 'ccao') {
      // Vietnamese banks: guard against corrupted text and markup.
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
  const flagged = bank.qs.filter(q => q.topic === 'review').map(q => q.id).sort();
  assert.deepEqual(flagged, [], `${cert}: each question must belong to a primary official domain`);
  for (let domain = 1; domain <= expected.domains; domain++) {
    assert.ok(bank.qs.some(q => q.topic === `d${domain}`),
      `${cert}: no questions available in domain ${domain}`);
  }
  if (cert === 'ccaf') {
    const byId = new Map(bank.qs.map(q => [q.id, q]));
    for (const [id, topic] of Object.entries(architectTopics)) {
      assert.equal(byId.get(id)?.topic, topic, `ccaf:${id} reviewed domain drifted`);
    }
    for (const q of bank.qs) verifyArchitectTip(q);
    for (const id of architectTipCautions) {
      assert.equal(byId.get(id)?.tip?.kind, 'caution', `ccaf:${id}: uncertain source must not teach an answer shortcut`);
    }
    console.log('PASS ccaf: all question tips cover correct options without distractor phrase collisions');
    for (const id of architectSourceWarnings) {
      assert.match(byId.get(id)?.e ?? '', /^\[(Cảnh báo|Không thể xác minh)/u,
        `ccaf:${id} source warning missing`);
    }
  }
  if (cert === 'ccao') {
    const byId = new Map(bank.qs.map(q => [q.id, q]));
    for (const [id, topic] of Object.entries(associateTopics)) {
      assert.equal(byId.get(id)?.topic, topic, `ccao:${id} reviewed domain drifted`);
    }
    for (const [id, correct] of [['1055', 'D'], ['1246', 'A']]) {
      const q = byId.get(id);
      assert.deepEqual(q.a, [correct], `ccao:${id} incorrect answer key`);
      assert.equal(q.m, 1, `ccao:${id} is a single-answer question`);
    }
  }
  assert.equal(englishTextFingerprint(bank.qs), expected.englishText, `${cert}: original English question/choice text changed`);
  assert.equal(englishFingerprint(bank.qs), expected.english, `${cert}: reviewed English/answer baseline changed`);
  console.log(`PASS ${cert}: ${bank.qs.length} questions, English text and reviewed answers intact`);
  total += bank.qs.length;
}
console.log(`PASS: ${total} questions across ${Object.keys(banks).length} JSON banks`);
