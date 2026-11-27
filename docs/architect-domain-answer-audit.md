# Architect Foundations domain, translation and source-answer audit

Reviewed against the [CCAR-F Exam Guide v1.1, November 2026](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf), before the December 7 update. This is an editorial audit of the practice bank, not an official answer key from Anthropic.

## Scope and invariants

- Screened the primary competency and keyed choice of all 309 questions. The domain changes are editorial judgments, not an attempt to match the overall bank to exam percentages.
- 79 primary-domain corrections; 97 questions with localized text/explanation edits, including obvious OCR-like typos and targeted rewrites. This is not a full bilingual line-by-line certification of every distractor.
- English questions, choices, choice order, IDs, answer keys, and answer counts are unchanged. Source answer defects are recorded separately, with warnings in Vietnamese explanations. The existing app will still grade against the source keys until an explicit key correction is approved.
- No question removed or excluded. The existing weighted sampler is not modified.

| Domain | Before | After | Official exam weight |
| --- | ---: | ---: | ---: |
| D1 | 37 | 58 | 27% |
| D2 | 70 | 66 | 18% |
| D3 | 60 | 50 | 20% |
| D4 | 73 | 64 | 20% |
| D5 | 69 | 71 | 15% |

## Domain decisions

The closest primary objective takes precedence over scenario keywords. For example named resume/fork is 1.7 even when Claude Code appears, built-in tool choice is 2.5, review routing by calibrated confidence is 5.5, and source provenance is 5.6. The following table is an exhaustive list of changed IDs, grouped by destination.

| Destination | Changed IDs | Basis |
| --- | --- | --- |
| D1 | 150, 157, 194, 198, 207, 209, 246, 274, 278, 280, 281, 287, 290, 297, 1221, 1224, 292, 1240, 1386, 1231, 1400, 1417, 1430, 1447, 1474, 1478, 1479, 1480, 1482 | Agent loops and explicit tool result flow (1.1), coordinator delegation and refinement (1.2–1.3), deterministic gates and handoffs (1.4–1.5), decomposition and session management (1.6–1.7). |
| D2 | 210, 213, 235, 244, 250, 288, 307, 1390, 1485, 1488 | Tool interfaces, structured errors, MCP integration and built-in tool selection (2.1–2.5), including local tool retry. |
| D3 | 259, 260, 261, 1242, 1456 | Direct execution, targeted context and iterative improvement in Claude Code (3.4–3.5). |
| D4 | 189, 266, 270, 1392, 1227, 1452, 1454, 1457, 1481, 1496 | Extraction schema, evaluation/structured outputs, batch tradeoffs and review precision/multi-pass design (4.1–4.6). |
| D5 | 149, 185, 186, 203, 214, 215, 219, 236, 224, 245, 247, 1238, 1403, 1404, 1422, 1431, 1437, 1445, 1451, 1458, 1461, 1486, 1502, 1503, 1505 | Context limits and preservation, ambiguity/escalation, error propagation, calibrated human review and provenance (5.1–5.6). |

## Answer key findings and source defects

| ID | Source key | Recommendation | Reason |
| --- | --- | --- | --- |
| 159 | C | B | Guide objective 1.3 explicitly describes passing prior findings directly to a subagent in its prompt. Shared memory is an additional design, not the default. |
| 1407 | A | B | Generic failures hide the error type and recovery path; structured actionable errors are the purpose of 2.2. |
| 1408 | A | B | A send timeout leaves delivery status unknown; retrying without verification/idempotency can duplicate messages. |
| 1402 | B, C | C, D provisionally | B is a truncated fragment, A also cut; C and D match objective 1.4. Restore original choices before changing the key. |
| 239 | C | No uniquely supported key | End-of-day waiting can exceed six hours; six-hour batching reaches 30h with no margin, four-hour batching leaves two hours. Batch API has no guaranteed latency SLA; neither choice proves 99.9%. |
| 1406 | B, C | Rewrite | context: fork isolates context; allowed-tools grants permission without prompting, not a read-only restriction. |
| 1417 | C | Retain C as nearest, repair wording | Only PreToolUse can stop a call before execution; PostToolUse is too late to prevent the side effect. |
| 1239 | B | Rewrite | Explicit system caching uses a list of text blocks, not a dictionary; automatic top-level cache_control also exists. |
| 1448 | A, B | Clarify scope | Agent Skills packaging requires name and description; Claude Code can infer them. |
| 1432 | A, B | Retain, clarify | isError is an MCP field; errorCategory is application-defined metadata, not a mandatory MCP protocol field. |
| 196 | C | Ambiguous | Missing system prompt in subsequent stateless requests is another plausible cause. |
| 1232 | B | Unverifiable | All four choices are placeholders. |
| 1412 | A | Unverifiable | All four choices are placeholders. |
| 1428 | C | Unverifiable | All four choices are placeholders. |
| 1430 | A, B | Repair source | Choice B lacks tool_use_id. |
| 246 | B | Repair source | Scenario/session name truncated. Question 150 has fuller context. |
| 1236 | B | Repair source | Choice B is truncated. |
| 1401 | D | Repair source | Choice text contains broken code fragments. |
| 168 | B | Retain, clarify | Preview token must attest explicit user confirmation, not merely a preview call. |

Additional source corruption spotted during screening: 257 (malformed glob in a choice; 285 has the intact example), 273 (stray 97 at end of question). These are preserved under the English-content invariant. There are near-duplicate scenarios; no deduplication was requested.

## References

- [Claude Code skills: allowed-tools, disallowed-tools and frontmatter](https://code.claude.com/docs/en/skills)
- [Claude Code hooks](https://code.claude.com/docs/en/hooks)
- [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Message Batches API](https://platform.claude.com/docs/en/build-with-claude/batch-processing)

## Validation

Compared all 309 source tuples against main; checked translation presence, choice count, domain IDs, malformed Vietnamese character tokens, and balanced paragraph/list tags. The repository verifier also pins the reviewed mappings and warning presence. Full browser/CI execution is separate from these data-level checks.
