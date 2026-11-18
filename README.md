# Claude Cert Practice

Static, client-side practice app with three certification question banks.

## Repository structure

- `index.html`: UI, learning/exam logic, routing, and on-demand JSON loader.
- `data/ccaf.json`: 309 Claude Certified Architect questions.
- `data/ccao.json`: 193 Claude Certified Associate questions.
- `data/ccdf.json`: 155 Claude Certified Developer questions.
- `scripts/verify-data.mjs`: data validation and English-content regression checks.

## Run locally

Because the question banks are loaded with `fetch()`, serve the repository over HTTP instead of double-clicking `index.html` from a `file://` URL:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/ and choose a certification. The homepage uses lightweight question counts, and only the selected certification's JSON file is downloaded. The site can also be deployed unchanged to a static web host such as GitHub Pages.

## Editing questions

Each JSON file contains an object with a `qs` array. Preserve question IDs, answer keys, question/option order, and all English content (`q`, `o[].h`). Vietnamese question and option translations live in `v.q` and `v.o` (matching option order); explanations live in `e`.

If question counts change, also update `QUESTION_COUNTS` in `index.html` and the expectations in `scripts/verify-data.mjs`. English fingerprints are intentionally pinned so an accidental change to the original English content fails validation.

Run:

```sh
node scripts/verify-data.mjs
```

Browser storage still uses the same keys and question IDs, so saved learning/exam data remains compatible.
