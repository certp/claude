# Claude Cert Practice

Static, client-side practice app with three certification question banks.

## Repository structure

- `index.html`: UI, learning/exam logic, routing, and on-demand JSON loader.
- `data/ccaf.json`: 309 Claude Certified Architect questions.
- `data/ccao.json`: 193 Claude Certified Associate questions.
- `data/ccdf.json`: 155 Claude Certified Developer questions.
- `scripts/verify-data.mjs`: data validation, official domain IDs and English-content regression checks.
- `scripts/verify-weighted-exam.mjs`: domain-weighted mock-exam regression tests.
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
```

Practice exams offer 10, 20, 30 and official-length (60/60/53) question sets. When all domains are selected, these modes sample questions according to the **November 2026 Anthropic exam weights** (valid before December 7, 2026). `ALL` uses every in-scope item and therefore cannot enforce weights. For official sources, exact quotas, and scope-review flags, see [Exam blueprints](docs/exam-blueprints.md).

Browser storage still uses the same keys and question IDs, so saved learning/exam data remains compatible.
