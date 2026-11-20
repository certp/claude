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

Six Associate questions require scope review and are assigned `topic: "review"`:

| ID | Scope concern |
| --- | --- |
| 1046 | SIAM/ITSM incident management does not directly assess an Associate Claude objective |
| 1050 | Technical design of progressive tool discovery across 60 internal tools is an architect/developer competency |
| 1051 | Technical authorization and retrieval-layer isolation for multi-audience document access is an architect/developer competency |
| 1052 | Technical architecture/handoff artifacts (ADRs, component diagrams, runbooks, on-call playbooks) are beyond Associate scope |
| 1104 | Coordinator/subagent orchestration and token optimization belongs in a technical certification |
| 1264 | Reporting an incorrect response via the thumbs-down UI does not map clearly to a published Associate objective |

These questions remain accessible in **Học → Cần kiểm tra phạm vi** so the original content is not lost, but are excluded from random mock exams. Future reviewers should check this list against the specific official objectives before reassigning a domain.

## Exam sampling rules

When a user selects **all domains** with 10, 20, 30 or **official exam length**, the sampler:

1. Creates a pool per official domain; review-only questions are excluded.
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

The first command independently guards original English text and reviewed answer fingerprints, translations, official domain IDs, the Associate's curated domain classifications and answer-key corrections, and review inventory. The second verifies published weights, all official-length quotas, no duplicate question IDs, correct counts across repeated random samples and capacity-aware quota redistribution. Domain assignment is a maintained editorial classification: borderline questions should still receive human review, and future questions must be assigned to an official objective rather than reusing broad topical tags. The [Associate audit trail](associate-domain-audit.md) lists the objective-level reason for all 26 changes and documents the two corrected single-answer questions.
