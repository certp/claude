import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const start = html.indexOf('/* BEGIN EXAM REVIEW */');
const end = html.indexOf('/* END EXAM REVIEW */', start);
assert.ok(start > 0 && end > start, 'Missing exam review helpers');

const questionStart = html.indexOf('function questionHTML(');
const questionEnd = html.indexOf('function feedbackHTML(', questionStart);
assert.ok(questionStart > 0 && questionEnd > questionStart);

const L = i => String.fromCharCode(65 + i);
const same = (a, b) => a.length === b.length && a.every(x => b.includes(x));
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const feedbackEnd = html.indexOf('function mapHTML(', questionEnd);
assert.ok(feedbackEnd > questionEnd, 'Missing learning feedback helper');
const { questionHTML, answerTipHTML, feedbackHTML } = new Function('LANG', 'peekId', 'L', 'ic', 'esc', 'same', 'REVEAL',
  html.slice(questionStart, feedbackEnd) + '\nreturn {questionHTML, answerTipHTML, feedbackHTML};'
)('en', null, L, () => '[check]', esc, same, false);

const questions = [
  { id:'multi', m:2, q:'Multiple answer', a:['a','c'],
    o:[{k:'a',h:'Alpha'},{k:'b',h:'Beta'},{k:'c',h:'Gamma'}],
    e:'Multi-answer explanation', tip:{kind:'cue',text:'Compare the context <before> choosing.',contrast:'Do not use this for <other> cases.',cues:[{key:'a',phrase:'Alpha'},{key:'c',phrase:'Gamma'}]} },
  { id:'single', m:1, q:'Single answer', a:['d'],
    o:[{k:'d',h:'Delta'},{k:'e',h:'Epsilon'}] },
  { id:'blank', m:1, q:'Unanswered', a:['f'],
    o:[{k:'f',h:'Foxtrot'}], tip:{kind:'caution',text:'Uncertain source answer',cues:[]} }
];
const BY_ID = { mock: Object.fromEntries(questions.map(q => [q.id, q])) };
const EXM = {
  ids: questions.map(q => q.id),
  ans: { multi:['a'], single:['d'] },
  optionOrders: { multi:[2,1,0] }
};
const snapshot = JSON.stringify(EXM);
const displayedQuestion = (q, state) => {
  const order = state.optionOrders?.[q.id];
  return order ? {...q, o: order.map(i => q.o[i])} : q;
};
const exSel = id => EXM.ans[id] || [];
const factory = new Function('BY_ID', 'same', 'L', 'EXM', 'reviewFilter',
  'displayedQuestion', 'exSel', 'questionHTML', 'ic', 'answerTipHTML',
  html.slice(start, end) +
  '\nreturn {examReviewStatus, examReviewIds, answerLetters, examReviewHTML};');
const makeReview = filter => factory(
  BY_ID, same, L, EXM, filter, displayedQuestion, exSel, questionHTML, () => '[check]', answerTipHTML
);
const review = makeReview('all');

assert.equal(review.examReviewStatus(questions[0], ['a']), 'incorrect',
  'Partially correct multi-answer choices must still be incorrect');
assert.equal(review.examReviewStatus(questions[0], ['c','a']), 'correct',
  'Exact multi-answer set is correct regardless of selection order');
assert.equal(review.examReviewStatus(questions[2], []), 'unanswered');
assert.deepEqual(review.examReviewIds('mock', EXM.ids, EXM.ans, 'all'), EXM.ids);
assert.deepEqual(review.examReviewIds('mock', EXM.ids, EXM.ans, 'correct'), ['single']);
assert.deepEqual(review.examReviewIds('mock', EXM.ids, EXM.ans, 'incorrect'), ['multi']);
assert.deepEqual(review.examReviewIds('mock', EXM.ids, EXM.ans, 'unanswered'), ['blank']);
assert.deepEqual(review.examReviewIds('mock', EXM.ids, EXM.ans, 'missed'), ['multi','blank']);

const shuffled = displayedQuestion(questions[0], EXM);
assert.equal(review.answerLetters(shuffled, ['a']), 'C',
  'Selected letter must follow the submitted option order');
assert.equal(review.answerLetters(shuffled, questions[0].a), 'A, C',
  'Correct letters must follow the submitted option order');
assert.equal(review.answerLetters(shuffled, []), 'Không chọn');
assert.equal(review.answerLetters(displayedQuestion(questions[0], {}), ['a']), 'A',
  'Legacy saved exams without optionOrders must remain readable');

const markup = review.examReviewHTML({id:'mock'}, 3, 1, 1, EXM.ids, 'multi');
assert.match(markup, /data-status="incorrect"/);
assert.match(markup, /Bạn chọn:<\/b> C/);
assert.match(markup, /Đáp án đúng:<\/b> A, C/);
assert.match(markup, /class="opt right" data-opt="a" disabled aria-pressed="true"/,
  'A selected correct option must remain visibly selected');
assert.match(markup, /class="opt right" data-opt="c" disabled aria-pressed="false"/,
  'An unselected correct option must not appear selected');
assert.match(markup, /class="choice-flag chosen">Bạn đã chọn/);
assert.match(markup, /class="choice-flag correct">Đáp án đúng/);
assert.match(markup, /Multi-answer explanation/);
assert.match(markup, /Mẹo nhận diện đáp án/);
assert.match(markup, /Compare the context &lt;before&gt; choosing\./);
assert.match(markup, /Phân biệt với câu dễ nhầm:/);
assert.match(markup, /Do not use this for &lt;other&gt; cases\./);
assert.match(markup, /chỉ trong ngữ cảnh câu này/);
assert.match(feedbackHTML(shuffled, ['a']), /Phân biệt với câu dễ nhầm:/);
const ocrTip = answerTipHTML({tip:{kind:'cue',text:'Command example',cues:[{key:'a',phrase:'/ compact',label:'/compact'}]}});
assert.match(ocrTip, /<code>\/compact<\/code>/);
assert.doesNotMatch(ocrTip, /\/ compact/);
assert.match(markup, /<code>Alpha<\/code>.*<code>Gamma<\/code>/);
assert.match(feedbackHTML(shuffled, ['a']), /Mẹo nhận diện đáp án/);
assert.match(feedbackHTML(shuffled, ['a','c']), /<code>Alpha<\/code>.*<code>Gamma<\/code>/);
assert.equal(answerTipHTML(questions[1]), '', 'Legacy banks without tips must still work');
assert.doesNotMatch(questionHTML(questions[0], 1, {mode:'learn'}), /answer-tip|Mẹo nhận diện đáp án/,
  'Learning questions must hide tips until checking or revealing answers');
assert.match(markup, /Câu trước/);
assert.match(markup, /Câu tiếp/);
assert.match(markup, /data-review-filter="unanswered"/);
assert.match(markup, /aria-pressed="true"/);

const correct = makeReview('correct').examReviewHTML({id:'mock'}, 3, 1, 1, ['single'], 'single');
assert.match(correct, /data-status="correct"/);
assert.match(correct, /Bạn chọn:<\/b> A/);
assert.doesNotMatch(correct, /answer-tip/, 'Questions without tips must not show an empty tip');
const blank = makeReview('unanswered').examReviewHTML({id:'mock'}, 3, 1, 1, ['blank'], 'blank');
assert.match(blank, /data-status="unanswered"/);
assert.match(blank, /Bạn chọn:<\/b> Không chọn/);
assert.match(blank, /disabled aria-pressed="false"/);
assert.match(blank, /Lưu ý khi làm câu này/);
assert.match(blank, /Uncertain source answer/);
assert.doesNotMatch(blank, /tip-keywords|Mẹo nhận diện đáp án|tip-contrast/, 'Caution must not recommend a keyword');
const empty = review.examReviewHTML({id:'mock'}, 3, 1, 1, [], undefined);
assert.match(empty, /Không có câu hỏi trong bộ lọc này/);
assert.equal(makeReview(null).examReviewHTML({id:'mock'}, 3, 1, 1, [], undefined), '');

const preSubmit = questionHTML(questions[0], 1, {selected:['a'], mode:'exam'});
assert.doesNotMatch(preSubmit, /Bạn đã chọn|Đáp án đúng|answer-tip|Mẹo nhận diện đáp án|Compare the context|Phân biệt với câu dễ nhầm|Do not use this/,
  'The exam must never reveal selected/correct review labels before submission');
assert.equal(JSON.stringify(EXM), snapshot, 'Review must not modify answers or option order');

assert.match(html, /#map-slot \[data-go\]/);
assert.match(html, /openReview\('all', EXM.ids\[Number\(button.dataset.go\)\]\)/);
assert.match(html, /id="btn-review-all"/);
assert.match(html, /id="btn-retrywrong"/);
assert.match(html, /phase = 'result'/);
assert.doesNotThrow(() => new Function(
  html.match(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/)[1]
), 'App JavaScript syntax must stay valid');
console.log('PASS: exam submission review, filters, randomized options, legacy states and read-only display');
