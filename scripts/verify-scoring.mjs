import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const blueprintStart = html.indexOf('const BLUEPRINTS = ');
const blueprintEnd = html.indexOf('const domainLabel = ', blueprintStart);
assert.ok(blueprintStart > 0 && blueprintEnd > blueprintStart, 'Missing official exam blueprint');
const BLUEPRINTS = new Function(html.slice(blueprintStart, blueprintEnd) + '\nreturn BLUEPRINTS;')();
const scoreStart = html.indexOf('const passMark = ');
const scoreEnd = html.indexOf('const certById = ', scoreStart);
assert.ok(scoreStart > 0 && scoreEnd > scoreStart, 'Missing domain scoring helper');
assert.ok(html.includes('/* BEGIN SCORING */') && html.includes('/* END SCORING */'));

const banks = Object.fromEntries(Object.keys(BLUEPRINTS).map(cert => [
  cert, JSON.parse(readFileSync(join(root, 'data', cert + '.json'), 'utf8')).qs
]));
// Regression: an old persisted `review` filter must migrate to all domains now
// that all 193 Associate questions have been assigned a primary domain.
const DATA = Object.fromEntries(Object.entries(banks).map(([cert, qs]) => [cert, { qs }]));
const topicStart = html.indexOf('const domainLabel = ', blueprintEnd);
const topicEnd = html.indexOf('function selectExamSize(', topicStart);
assert.ok(topicStart > blueprintEnd && topicEnd > topicStart, 'Missing domain filtering helpers');
const { validTopic, topicIds, examTopicIds, selectTopic } = new Function(
  'BLUEPRINTS', 'DATA',
  html.slice(topicStart, topicEnd) + '\nreturn { validTopic, topicIds, examTopicIds, selectTopic };'
)(BLUEPRINTS, DATA);
assert.equal(validTopic('ccao', 'review'), '', 'Old review filter should migrate to all domains');
assert.equal(validTopic('ccao', 'd4'), 'd4', 'Valid domain filter must remain intact');
assert.equal(validTopic('ccao', 'missing'), '', 'Invalid topic must reset');
assert.equal(topicIds('ccao').length, 193, 'Learning mode must retain all Associate questions');
assert.equal(examTopicIds('ccao').length, 193, 'Exam mode must include every Associate question');
assert.ok(!selectTopic('ccao', '', false).includes('value="review"'),
  'Learning UI must not offer an empty review filter');
console.log('PASS: all Associate questions eligible and stale review topic migrated');
const BY_ID = Object.fromEntries(Object.entries(banks).map(([cert, qs]) => [
  cert, Object.fromEntries(qs.map(q => [q.id, q]))
]));
const same = (selected, answers) =>
  selected.length === answers.length && selected.every(key => answers.includes(key));
const { scoreExam, weakestDomains, displayScorePercent, passMark } = new Function(
  'BLUEPRINTS', 'BY_ID', 'same',
  html.slice(scoreStart, scoreEnd) +
  '\nreturn {scoreExam, weakestDomains, displayScorePercent, passMark};'
)(BLUEPRINTS, BY_ID, same);

for (const [cert, questions] of Object.entries(banks)) {
  const valid = questions.filter(q => q.topic !== 'review');
  const multi = valid.find(q => q.a.length > 1);
  const single = valid.find(q => q.a.length === 1 && q.id !== multi?.id);
  const skipped = valid.find(q => q.id !== multi?.id && q.id !== single?.id);
  assert.ok(multi && single && skipped, cert + ': need multi, single and skipped examples');

  const ids = [multi.id, single.id, skipped.id];
  const answers = { [multi.id]: multi.a.slice(0, -1), [single.id]: [...single.a] };
  const snapshot = JSON.stringify(answers);
  const report = scoreExam(cert, ids, answers);
  assert.equal(JSON.stringify(answers), snapshot, 'Scoring must not mutate submitted answers');
  assert.equal(report.total, 3);
  assert.equal(report.correct, 1, cert + ': multi-choice partial response incorrectly credited');
  assert.equal(report.incorrect, 2);
  assert.equal(report.unanswered, 1);
  assert.equal(report.accuracy, 100 / 3);
  assert.equal(report.targetReached, false);
  assert.equal(report.domains.length, BLUEPRINTS[cert].domains.length);
  assert.equal(report.domains.reduce((sum, d) => sum + d.total, 0), 3);
  assert.equal(report.domains.reduce((sum, d) => sum + d.correct, 0), 1);
  assert.equal(report.domains.reduce((sum, d) => sum + d.unanswered, 0), 1);
  assert.ok(report.domains.filter(d => d.total === 0).every(d => d.accuracy === null),
    cert + ': untested domain must have null accuracy, not a fabricated zero');

  const full = scoreExam(cert, ids, {
    [multi.id]: [...multi.a].reverse(), [single.id]: [...single.a], [skipped.id]: [...skipped.a]
  });
  assert.equal(full.correct, 3, cert + ': exact multi-answer set in reverse order must earn credit');
  assert.equal(full.accuracy, 100);
  assert.equal(full.targetReached, true);
  assert.deepEqual(weakestDomains(full), [], cert + ': no weak domains at 100%');

  const weak = weakestDomains(report);
  assert.ok(weak.length > 0, cert + ': should identify missed domains');
  assert.ok(weak.length <= 3);
  assert.ok(weak.every(d => d.total > 0 && d.accuracy < 80));
  assert.ok(weak.every((d, i) => i === 0 || weak[i - 1].accuracy <= d.accuracy),
    'Weak domains must be ordered by ascending accuracy');

  const zero = scoreExam(cert, [], {});
  assert.equal(zero.total, 0);
  assert.equal(zero.accuracy, 0);
  assert.equal(zero.targetReached, false);
  assert.deepEqual(weakestDomains(zero), []);

  // Persisted exams from an earlier release can contain questions marked review.
  const outOfScope = questions.find(q => q.topic === 'review');
  if (outOfScope) {
    const oldResult = scoreExam(cert, [outOfScope.id], { [outOfScope.id]: outOfScope.a });
    assert.equal(oldResult.correct, 1);
    assert.equal(oldResult.unclassified, 1);
    assert.equal(oldResult.domains.reduce((sum, d) => sum + d.total, 0), 0);
  }

  const thresholdQs = valid.slice(0, 5);
  const passingAnswers = Object.fromEntries(thresholdQs.slice(0, 4).map(q => [q.id, q.a]));
  const failingAnswers = Object.fromEntries(thresholdQs.slice(0, 3).map(q => [q.id, q.a]));
  assert.equal(passMark(5), 4);
  assert.equal(scoreExam(cert, thresholdQs.map(q => q.id), passingAnswers).targetReached, true);
  assert.equal(scoreExam(cert, thresholdQs.map(q => q.id), failingAnswers).targetReached, false);
  console.log('PASS ' + cert + ': exact multi-answer scoring, domain breakdown and practice threshold');
}

assert.equal(displayScorePercent(80), '80');
assert.equal(displayScorePercent(100/3), '33.3');
assert.equal(displayScorePercent(0), '0');
assert.match(html, /Kết quả theo từng domain/);
assert.match(html, /Ưu tiên ôn thêm/);
assert.match(html, /Đạt mục tiêu luyện tập/);
assert.match(html, /Chưa đạt mục tiêu luyện tập/);
assert.match(html, /không phải chuẩn đạt kỳ thi Claude/);
assert.match(html, /role="progressbar"/);
assert.match(html, /size:EXM.size \|\| 'OFFICIAL'/);
assert.ok(!html.includes("(passed?'Passed':'Failed')"),
  'Raw accuracy must never present itself as an official pass/fail outcome');
assert.ok(html.includes('ccprac.v1.${c}.${m}'), 'Keep saved history keys compatible');

const script = html.match(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'Missing inline script');
assert.doesNotThrow(() => new Function(script), 'App JavaScript syntax must stay valid');
console.log('PASS: score UI terminology, legacy storage and JS syntax');
