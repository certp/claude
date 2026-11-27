# Exam domains and weighted mock exams (before December 7, 2026)

This app intentionally targets the **November 2026 v1.1** Anthropic Exam Guides, valid before the exam-content updates effective **2026-12-07**. Do **not** mix in the newer December 7 blueprints.

| Bank | Exam code | Scored items in official exam | Domains | Domain weights in official order |
| --- | --- | ---: | ---: | --- |
| `ccaf.json` | CCAR-F | 60 | 5 | 27%, 18%, 20%, 20%, 15% |
| `ccao.json` | CCAO-F | 60 | 7 | 14%, 21%, 12%, 16%, 12%, 15%, 10% |
| `ccdf.json` | CCDV-F | 53 | 8 | 14.7%, 33.1%, 3.1%, 2.6%, 16.8%, 11%, 8.1%, 10.6% |

## Authoritative references

- [Claude Certified Architect – Foundations Exam Guide, v1.1](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf), blueprint section 4
- [Claude Certified Associate – Foundations Exam Guide, v1.1](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946524/Claude_Certified_Associate_-_Foundations_Exam_Guide.pdf), blueprint section 6
- [Claude Certified Developer – Foundations Exam Guide, v1.1](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946716/Claude_Certified_Developer_-_Foundations_Exam_Guide.pdf), blueprint section 6

## Question metadata

Every question has a `topic` field using an exam-specific official domain ID: `d1`, `d2`, etc. The IDs are **local to each exam**: `ccaf/d2` and `ccao/d2` are different competencies. The localized labels and percentages are maintained in `BLUEPRINTS` in `index.html`. Original question IDs, English prompts, choice text/order, and translations remain unchanged by domain reclassification. Two separately reviewed answer-key defects were corrected in CCAO-F; see [Associate domain and answer audit](associate-domain-audit.md).

All **193 Associate questions** are now assigned to their nearest primary blueprint domain. The six questions previously marked `review` (**1046, 1050, 1051, 1052, 1104, 1264**) were individually mapped by their core competency; none are excluded from random mock exams. **1046 remains a borderline SIAM/ITSM knowledge question** with only a weak connection to Claude: it is mapped to D7 as the closest category, not as a claim that Anthropic officially includes ITSM incident management. See the [Associate domain audit](associate-domain-audit.md) for all six decisions.

The former **Học → Cần kiểm tra phạm vi** filter disappears because there are no longer any review-only questions. Saved learning sessions using this old filter automatically migrate to **Tất cả**, avoiding an empty question screen.

The Architect bank has 309 questions; 79 primary-domain assignments were updated against the November guide, with localized corrections and source answer warnings. See [Architect domain and answer audit](architect-domain-answer-audit.md). Original source keys are retained pending explicit correction approval.

## Exam sampling rules

When a user selects **all domains** with 10, 20, 30 or **official exam length**, the sampler:

1. Creates a pool per official domain. Every Associate question is eligible (193 in total).
2. Converts official percentages into integer quotas by the largest-remainder method.
3. Caps quotas by available questions and redistributes any remaining slots to nonempty domains.
4. Shuffles each pool and samples **without replacement**, then shuffles the final question order (and the answer option order through existing logic).

For the official-length mode, target quotas by domain D1–D8 are:

- Architect (60): **16, 11, 12, 12, 9**
- Associate (60): **8, 13, 7, 10, 7, 9, 6**
- Developer (53): **8, 17, 2, 1, 9, 6, 4, 6**

**Domain-filtered practice** samples questions from the chosen domain only and does not weight the other domains. **ALL** returns every in-scope question; because no selection remains, the distribution reflects the content bank, not the official weights.

The mock exam simulates domain percentages, **not** Anthropic's exact scenario selection, item pool, timing enforcement or scaled score. A practice score of 80% is this app's training rule, **not** an official conversion of 720/1000.

## Quality checks

Run:

```sh
node scripts/verify-data.mjs
node scripts/verify-weighted-exam.mjs
```

The first command independently guards original English text and reviewed answer fingerprints, translations, official domain IDs, the Associate's curated domain classifications and answer-key corrections, and confirms that every question belongs to a domain. The second verifies published weights, all official-length quotas, no duplicate question IDs, correct counts across repeated random samples and capacity-aware quota redistribution. Domain assignment is a maintained editorial classification: borderline questions should still receive human review, and future questions must be assigned to an official objective rather than reusing broad topical tags. The [Associate audit trail](associate-domain-audit.md) documents 30 reviewed classification decisions (including the six previously deferred questions) and the two corrected single-answer questions.
