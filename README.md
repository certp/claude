# Claude Cert Practice

Static, client-side practice app with three certification question banks.

## Repository structure

- `index.html`: UI, learning/exam logic, routing, and on-demand JSON loader.
- `data/ccaf.json`: 309 Claude Certified Architect questions.
- `data/ccao.json`: 193 Claude Certified Associate questions.
- `data/ccdf.json`: 155 Claude Certified Developer questions.
- `scripts/verify-data.mjs`: data validation, official domain IDs and English-content regression checks.
- `scripts/verify-weighted-exam.mjs`: domain-weighted mock-exam regression tests.
- `scripts/verify-scoring.mjs`: exact-answer scoring, per-domain accuracy and practice-target regression tests.
- `docs/exam-blueprints.md`: official pre-December-7-2026 exam domains, weights and scope-review notes.

## Run locally

Because the question banks are loaded with `fetch()`, serve the repository over HTTP instead of double-clicking `index.html` from a `file://` URL:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/ and choose a certification. The homepage uses lightweight question counts, and only the selected certification's JSON file is downloaded. The site can also be deployed unchanged to a static web host such as GitHub Pages.

## Editing questions

Each JSON file contains an object with a `qs` array. Preserve question IDs, answer keys, question/option order, and all English content (`q`, `o[].h`). Every question's `topic` is now its exam-specific official domain (`d1`, `d2`, etc.) or `review` for an explicitly flagged out-of-scope question. Vietnamese question and option translations live in `v.q` and `v.o` (matching option order); explanations live in `e`.

If question counts change, also update `QUESTION_COUNTS` in `index.html` and the expectations in `scripts/verify-data.mjs`. English fingerprints are intentionally pinned so an accidental change to the original English content fails validation.

Run:

```sh
node scripts/verify-data.mjs
node scripts/verify-weighted-exam.mjs
node scripts/verify-scoring.mjs
```

Practice exams offer 10, 20, 30 and official-length (60/60/53) question sets. When all domains are selected, these modes sample questions according to the **November 2026 Anthropic exam weights** (valid before December 7, 2026). `ALL` uses every in-scope item and therefore cannot enforce weights. For official sources, exact quotas, and scope-review flags, see [Exam blueprints](docs/exam-blueprints.md).

Browser storage still uses the same keys and question IDs, so saved learning/exam data remains compatible.

## Practice exam scoring (not official Anthropic scoring)

- Every correct question counts as one point. Multi-answer questions require **the exact answer set** for credit; no partial credit is awarded. Omitted questions count as incorrect.
- The overall score is `correct / questions in this attempt`. The app's **80% accuracy goal** is a practice-only target (rounded up to a whole number of correct questions); it is **not** the official Anthropic passing threshold.
- The result screen reports each tested domain's `correct / tested`, accuracy, and published blueprint weight. Domains not included in the attempt are omitted from the per-domain report rather than treated as failed. The three tested domains with the lowest accuracy **below 80%** are highlighted for review; small-sample results should be interpreted cautiously.
- Saved exams, domain-specific practice and retrying incorrect questions reuse the same raw scoring model. Retry rounds are explicitly marked as practice rather than a pass/fail prediction; legacy attempts containing questions flagged for scope review are still scored overall but identified separately from official-domain statistics.
- The official Anthropic exam uses a **scaled score** and a pass mark of **720**. The conversion from raw percent correct is not public; the app **does not** manufacture a scaled score or claim to predict official pass/fail.
