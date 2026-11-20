# Claude Certified Associate – Foundations: domain and answer-key audit

**Baseline:** [Anthropic CCAO-F Exam Guide v1.1, effective November 2026](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946524/Claude_Certified_Associate_-_Foundations_Exam_Guide.pdf), **section 6, detailed objectives**, for the blueprint before 2026-12-07.

## Classification principle

Assign each item to the **single blueprint objective it actually tests**, not the domain suggested by surrounding vocabulary, the role in the scenario, or the answer's wording. In overlap cases, prioritize the specific action requested by the stem. Under the updated requirement, **all questions are assigned to the closest primary domain**, even when the connection to an Associate objective is imperfect; weaker mappings are documented transparently rather than hidden as `review`.

The classification is editorial judgment based on the published guide, not an official per-question Anthropic mapping. No English question, choice text, choice order, or question ID is changed.

## Reclassification decisions

| ID | Previous | New | Primary blueprint objective / reason |
| --- | --- | --- | --- |
| 972 | D3 | D6 | Identify appropriate and inappropriate AI use cases; tests tasks suitable for Claude, not which model tier to pick |
| 975 | D5 | D3 | Understand memory considerations; choosing cross-session Memory/import as the continuity feature |
| 976 | D7 | D1 | Adapt prompting strategy to the type of task |
| 977 | D4 | D1 | Adapt prompting strategy for research rather than brainstorming |
| 1002 | D4 | D7 | Optimize workflow effectiveness by measuring bottlenecks |
| 1046 | `review` | D7 | Incident management restores degraded services; nearest domain is Troubleshooting. **Weak match:** generic SIAM/ITSM fact, not a Claude-specific Associate objective |
| 1047 | D3 | D5 | Manage and understand connected data sources and Gmail Connector usage |
| 1050 | `review` | D4 | Select a progressive tool-discovery **solution design pattern** for a Claude assistant, preserving tool breadth without always loading all definitions |
| 1051 | `review` | D6 | Apply access controls to sensitive, role-restricted information at the retrieval boundary; privacy and governance are the primary tested concern |
| 1052 | D4 | D4 (retained) | Support solution design and deployment handoff through complete architecture and operational documentation; more technical than typical Associate questions |
| 1055 | D1 | D2 | Determine which AI-assisted output requires independent human verification before delivery |
| 1058 | D4 | D7 | Diagnose bottlenecks and measure targeted workflow optimization |
| 1059 | D7 | D6 | Identify responsible delegation boundaries and human accountability for consequential actions |
| 1061 | D2 | D7 | Optimize recurring workflows while retaining quality gates |
| 1065 | D4 | D7 | Evaluate workflow changes for measurable efficiency and quality gains |
| 1068 | D2 | D3 | Align model selection with task quality, latency and volume requirements |
| 1076 | D2 | D4 | Communicate Claude's limitations and human-review expectations to stakeholders |
| 1094 | D2 | D4 | Use Claude to support iteration on a solution prototype after stakeholder feedback |
| 1096 | D1 | D4 | Apply Claude to requirements analysis and traceability across stakeholder sources |
| 1099 | D4 | D3 | Understand and manage Memory/context considerations during imports |
| 1104 | `review` | D7 | Diagnose follow-up latency and optimize workflow efficiency by avoiding unnecessary subagent calls and large context transfers |
| 1105 | D7 | D3 | Manage context limitations by summarizing, persisting key references and restarting a chat |
| 1117 | D4 | D3 | Select appropriate product features and tools for use cases |
| 1258 | D4 | D1 | Apply task decomposition to complex multi-deliverable requests |
| 1259 | D7 | D2 | Adapt/refine output for its intended audience while preserving accuracy |
| 1264 | D5 | D7 | Apply feedback mechanisms when outputs are incorrect; closest objective is adjusting approach based on feedback and results. Product-specific thumbs-down UI is more narrowly scoped than the objective |
| 1270 | D2 | D3 | Select model tier based on workload quality requirements and available human review |
| 1271 | D1 | D4 | Analyze stakeholder requirements and identify the underlying desired outcome |
| 1274 | D2 | D4 | Leverage Claude for research planning and solution planning; includes source verification as a supporting D2 skill |
| 1289 | D4 | D7 | Diagnose incomplete output with specific user feedback and evidence |

**Deliberately retained after closer review:**
- **1262 → D4:** specifying suppliers and comparison criteria is business requirements/planning for a solution, not explicitly a prompting or decomposition technique.
- **1288 → D5:** turning off unneeded Connectors is management of enabled features and connector configuration; optimization is a secondary benefit.

The **30 reviewed topic decisions** are pinned in `scripts/verify-data.mjs` to catch accidental reversals. The change from `main` affects 29 topic labels, since #1052 returns to its original D4. Future adjustments should include an objective-level reason.

## Corrected answer keys (not English wording)

| ID | Old | Correct | Why |
| --- | --- | --- | --- |
| 1055 | `a: ["D", "C"], m: 2` | **`a: ["D"], m: 1`** | D requires human accountability and verification; C incorrectly tells the user to skip verification. The stem asks for one step |
| 1246 | `a: ["D", "A"], m: 2` | **`a: ["A"], m: 1`** | A stops use and escalates restricted-data exposure. D is unsafe because no external sharing does not waive data-handling obligations. The stem asks for one immediate action |

The Vietnamese rationales `e` for these two questions are updated to explicitly reject the incorrect distractors. All English question/choice text, answer-choice keys/ordering, IDs, and translations remain intact.

## Six formerly deferred questions

All six formerly `review` questions are now included in the weighted mock-exam pool:

- **1046 → D7:** closest troubleshooting objective, but it tests **general SIAM/ITSM knowledge**, not Claude. This is a domain placement decision only, not a claim that it is a representative CCAO-F exam item.
- **1050 → D4:** architecture and solution design for progressive tool discovery.
- **1051 → D6:** data-access enforcement, privacy and governance.
- **1052 → D4:** solution documentation and handoff (retains its original domain).
- **1104 → D7:** identifying and fixing excessive latency/token overhead.
- **1264 → D7:** collecting actionable feedback about an incorrect response.

The eligible Associate pool is now **193 of 193** questions; `review` is empty. The app must migrate persisted `review` filters to **all domains** rather than show an empty learning session. These are objective-level editorial assignments, not verified Anthropic item classifications.

A near-duplicate pair, **1012 / 1078**, remains untouched in this targeted change. It should be reviewed separately for educational redundancy; removal would change the original inventory and needs its own decision.

## Regression checks

```bash
node scripts/verify-data.mjs
node scripts/verify-weighted-exam.mjs
node scripts/verify-scoring.mjs
```

`verify-data.mjs` separately checks the immutable English text fingerprints and the **reviewed answer-key fingerprints**, the absence of `review` questions, the 30 reviewed topic decisions, and the corrected single-choice answer arity. `verify-weighted-exam.mjs` confirms the original CCAO-F 60-question quotas **8/13/7/10/7/9/6** remain attainable with the revised per-domain pools. The exam blueprint and percentage weights are unchanged.
