# Nexload Reasoning Ecosystem
## Architecture & Skill-Builder Specification

> **Status:** Architecture freeze candidate / Builder SPEC  
> **Date:** 2026-10-02  
> **Scope:** `nexload-reasoning` + six specialized reasoning skills  
> **Audience:** LLM agents that will research, design, implement, review, and evaluate the actual Agent Skills  
> **Important:** This document is **not** the content of any `SKILL.md`. It defines intent, boundaries, responsibilities, reasoning models, interactions, research sources, examples, and evaluation expectations so a builder agent can create the skills correctly.

---

# 0. Executive Summary

The Nexload reasoning ecosystem is a family of seven Agent Skills:

```text
nexload-reasoning
├── nexload-reasoning-discovery
├── nexload-reasoning-investigation
├── nexload-reasoning-ideation
├── nexload-reasoning-design
├── nexload-reasoning-evaluation
└── nexload-reasoning-execution
```

The architecture deliberately separates six cognitively distinct jobs:

```text
DISCOVERY
What problem are we actually solving?

INVESTIGATION
What is actually true / happening, and why?

IDEATION
What materially different possibilities exist?

DESIGN
How could a selected direction coherently work?

EVALUATION
Which direction should we choose, given feasibility, risk, trade-offs, and reversibility?

EXECUTION
How do we turn the approved direction into a verified result, and recover intelligently if it fails?
```

`nexload-reasoning` is the kernel:

```text
global reasoning constitution
+ depth control
+ routing
+ cross-skill transition logic
+ handoff discipline
+ stop discipline
```

The six specialist skills MUST remain **standalone-capable**. The kernel is an orchestrator and quality layer, not a mandatory runtime dependency. This is necessary because the Agent Skills specification does not define a formal inter-skill dependency mechanism.

The design objective is:

> **Maximum useful specialization with minimum routing ambiguity and minimum duplicated reasoning policy.**

---

# 1. What This SPEC Is and Is Not

## 1.1 This SPEC defines

- why the seven-skill architecture exists;
- the cognitive job of every skill;
- strict ownership boundaries;
- what each skill must understand deeply;
- what each skill must explicitly avoid owning;
- trigger and non-trigger semantics at an architectural level;
- conceptual inputs and outputs;
- cross-skill transitions;
- adaptive handoff strategy;
- reasoning principles inherited from the Nexload reasoning philosophy;
- expected behavior across multiple domains;
- failure modes and architecture-decay risks;
- source material for further research;
- expected evaluation themes.

## 1.2 This SPEC intentionally does NOT define

- exact `SKILL.md` prose;
- final frontmatter descriptions;
- exact step-by-step wording;
- mandatory Markdown headings inside the final skills;
- exact example phrasing;
- hidden chain-of-thought structures;
- model-specific APIs;
- mandatory YAML/JSON reasoning-state objects;
- a hard-coded orchestration API between skills.

The builder agent must use this specification to create the actual skills, but it is expected to research beyond it.

---

# 2. Why the Architecture Is `6 + 1`

Earlier designs considered:

1. one monolithic `nexload-reasoning`;
2. approximately sixteen small reasoning modules;
3. four lifecycle specialists plus a kernel;
4. many primitive mental-model skills.

The selected model is `6 + 1` because the six specialist boundaries correspond to **different reasoning algorithms**, not merely different topics.

## 2.1 Discovery vs Investigation

These two both "seek information", but their epistemic jobs differ.

```text
Discovery:
desired / intended reality
"What are we trying to solve?"

Investigation:
observed / causal reality
"What is happening and why?"
```

Discovery resolves ambiguity in intent, requirements, scope, ownership, and desired outcomes.

Investigation resolves ambiguity in facts, evidence, causal explanations, conflicting observations, and root causes.

Combining them produces a skill that is simultaneously a requirements interviewer and a scientific investigator—too broad to specialize well.

## 2.2 Ideation vs Design

Ideation expands the option space.

Design synthesizes one or more candidate concepts into a coherent system.

```text
Ideation:
generate possibilities without premature judgment

Design:
make a possibility internally coherent
```

A design may be produced before final evaluation as a lightweight candidate model, then refined after selection.

Therefore the architecture is intentionally non-linear.

## 2.3 Design vs Evaluation

Design asks:

> How could this work?

Evaluation asks:

> Should we choose this?

A technically elegant design can still be a poor decision due to:

- business value;
- operational cost;
- implementation burden;
- reversibility;
- risk;
- timing;
- external constraints.

These jobs need separate reasoning procedures.

## 2.4 Evaluation vs Execution

Evaluation finishes when a direction is sufficiently justified.

Execution begins when the direction is authorized and must become a real, verified result.

Mixing them risks:

- implementation bias influencing evaluation;
- sunk-cost reasoning;
- premature coding;
- reopening decisions during execution.

## 2.5 Why not split further?

Capabilities such as:

- grounding;
- question gating;
- assumption checking;
- pre-mortem;
- complexity analysis;
- verification;
- recovery;

are important, but do not necessarily represent independent user-facing cognitive jobs.

Excessive skill granularity increases:

- trigger overlap;
- routing ambiguity;
- context switching;
- duplicated invariants;
- orchestration complexity.

The router pattern in `cc-thinking-skills` explicitly prefers `NONE` or one primary reasoning skill and recommends combining only distinct, necessary roles.

### Sources

- Agent Skills specification:  
  https://agentskills.io/specification
- Agent Skills client implementation / progressive disclosure:  
  https://agentskills.io/client-implementation/adding-skills-support
- Thinking Model Router:  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-model-router
- Superpowers skill collection:  
  https://www.skills.sh/obra/superpowers

---

# 3. Naming Architecture

The Nexload namespace is general-purpose and may already contain unrelated skills such as design, review, architecture, or writing skills.

Therefore all members of this reasoning family must visibly inherit the `nexload-reasoning-*` namespace.

## 3.1 Canonical names

```text
nexload-reasoning
nexload-reasoning-discovery
nexload-reasoning-investigation
nexload-reasoning-ideation
nexload-reasoning-design
nexload-reasoning-evaluation
nexload-reasoning-execution
```

## 3.2 Why names are intentionally explicit

`nexload-reasoning-design` means:

> design as a reasoning engine inside the reasoning ecosystem.

It is distinct from a hypothetical `nexload-design`, which could refer to UI design, visual design, product design, or another general Nexload capability.

## 3.3 Naming constraints

The official Agent Skills specification currently requires skill names to:

- be 1–64 characters;
- use lowercase alphanumeric characters and hyphens;
- not start or end with a hyphen;
- avoid consecutive hyphens;
- match the parent directory name.

All selected names fit those constraints.

### Source

https://agentskills.io/specification

---

# 4. Shared Reasoning Philosophy

The seven skills are not seven unrelated tools. They express one reasoning philosophy.

The following principles should influence all specialists, but the implementation must avoid mechanically duplicating the same prose into all seven skills.

## 4.1 Evidence before confidence

Claims should be proportionate to evidence.

Preferred epistemic hierarchy, when relevant:

```text
current observation / runtime
→ current authoritative source / configuration / data
→ current official documentation
→ authoritative project artifacts
→ independent external evidence
→ secondary summaries
→ inference
→ assumption
```

## 4.2 Frame before solving

A proposed solution is not automatically the real problem.

Example: `Add Redis` may actually mean reduce latency, share state, queue work, or reduce repeated reads.

## 4.3 Inspect before asking

If relevant information is already available from source, repository, configuration, runtime, prior context, project documents, or authoritative external documentation, inspect it rather than outsourcing the work back to the user.

## 4.4 Facts are not assumptions

Preserve distinctions among:

```text
fact
inference
assumption
constraint
preference
unknown
conflict
```

## 4.5 Questions must change something meaningful

A question is valuable if its answer can materially change:

- business behavior;
- architecture;
- data ownership/schema;
- public contract;
- security/privacy boundary;
- project scope;
- significant cost;
- irreversible action;
- critical UX semantics;
- required compatibility.

Reversible local details should usually receive a safe default.

## 4.6 Divergence before convergence

When creativity is needed:

```text
generate
→ expand
→ vary mechanisms
→ combine / cluster
→ then evaluate
```

## 4.7 Complexity must pay rent

Every new abstraction, dependency, service, layer, workflow, duplicated state, or process must solve a confirmed problem or meaningfully reduce total complexity elsewhere.

## 4.8 Existing mechanisms first

Default preference, when comparable:

```text
existing authoritative mechanism
→ native/platform mechanism
→ existing project pattern/dependency
→ bounded local solution
→ new dependency
→ new infrastructure
```

This is a heuristic, not a law.

## 4.9 Preserve settled decisions

Previously approved decisions should not be reopened merely because a specialist knows another valid approach.

Reopen only on new material evidence, new constraint, contradiction, changed context, or explicit user request.

## 4.10 Reversibility controls rigor

A reversible low-impact choice deserves faster convergence than a destructive migration, public contract change, core auth redesign, irreversible data behavior, or expensive architecture commitment.

## 4.11 Verification updates the model

A failed verification is evidence. It should not automatically trigger another surface patch.

## 4.12 Stop when thinking stops paying

Stop when remaining uncertainty can no longer materially change correctness, risk, scope, or selected action.

### Research sources

- Circle of Competence:  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-circle-of-competence
- First Principles:  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-first-principles
- Via Negativa:  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-via-negativa
- Metacognition:  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-cognition-metacognition
- Agent Skills evaluation guide:  
  https://agentskills.io/skill-creation/evaluating-skills

---

# 5. Runtime Relationship: Standalone Specialists + Optional Kernel

## 5.1 No mandatory runtime dependency

The ecosystem must not assume that a specialist cannot function unless `nexload-reasoning` is activated first.

The Agent Skills standard does not define a formal `depends_on` field or a guaranteed inter-skill payload protocol.

Every specialist must therefore contain enough local reasoning discipline to operate correctly when invoked independently.

## 5.2 Kernel-compatible behavior

When `nexload-reasoning` is active, it should improve skill selection, reasoning depth, sequencing, transition decisions, stop decisions, and context preservation.

But it should not be required for basic correctness.

### Sources

- https://agentskills.io/specification
- https://agentskills.io/client-implementation/adding-skills-support

---

# 6. Adaptive Handoff Model

The primary architectural risk in `6 + 1` is not skill count. It is **loss of material context between specialists**.

The solution is not a mandatory global state object.

## 6.1 Why a mandatory state object is rejected

A fixed structure for every task can create completion bias, hallucinated filler, token overhead, stale duplicated state, and schema-driven rather than problem-driven reasoning.

## 6.2 Context-first handoff

If multiple skills run in the same agent/session and the context remains reliable, do not serialize a handoff merely for ceremony.

## 6.3 Materialize a handoff when loss risk is real

Useful when:

- moving to another agent/subagent;
- continuing in a fresh session;
- the context is very long;
- compaction may lose constraints;
- work is high-stakes;
- several decisions must remain sticky;
- an explicit artifact is useful for auditability.

## 6.4 Conceptual handoff contents

A handoff should be sparse and need-driven. Possible contents:

```text
objective
material evidence
constraints
must preserve
settled decisions
open uncertainties
selected direction
next reasoning need
source pointers
```

Only include material fields.

## 6.5 Avoid lifecycle fields

Do not encode arbitrary `current_phase: 4`. The architecture is non-linear.

A better handoff says what reasoning is needed next.

## 6.6 Prefer pointers over duplication

When prior decisions or evidence already exist in a spec, ADR, issue, research note, commit, code, or logs, reference them rather than reproduce them in full.

### Sources

- Handoff:  
  https://www.skills.sh/mattpocock/skills/handoff
- Implement Spec:  
  https://www.skills.sh/mattpocock/skills/implement-spec
- Agent Skills client implementation:  
  https://agentskills.io/client-implementation/adding-skills-support

---

# 7. Ecosystem Routing Model

The family is **not** a fixed waterfall.

Common transitions include:

```text
Discovery → Ideation
Discovery → Design
Discovery → Evaluation
Investigation → Design
Investigation → Evaluation
Investigation → Execution
Ideation → Design
Ideation → Evaluation
Design → Evaluation
Design → Investigation
Evaluation → Design
Evaluation → Execution
Evaluation → Ideation
Execution → Investigation
Execution → Design
Execution → Evaluation
Execution → Discovery
```

## 7.1 Routing principle

Route based on the unresolved reasoning need, not chronological stage.

## 7.2 Example flows

### New feature

```text
Discovery → Ideation → lightweight Design candidates → Evaluation → detailed Design → Execution
```

### Production crash

```text
Investigation → Execution → Verification
```

### Failed implementation with architecture flaw

```text
Execution → Design → Evaluation → Execution
```

### Requirement contradiction

```text
Design → Discovery → Design
```

### Vendor suitability

```text
Investigation → Evaluation
```


---

# 8. `nexload-reasoning`
## Kernel / Reasoning Constitution / Router

## 8.1 Core mission

The kernel decides **how much and what kind of reasoning is needed**, while preserving global Nexload reasoning principles.

It is not intended to replace any specialist.

It should be a thin, high-leverage control layer.

## 8.2 Primary cognitive question

> What reasoning capability is actually needed now, with what depth, and when should reasoning stop?

## 8.3 Owns

- global reasoning constitution;
- evidence-first posture;
- dynamic reasoning depth;
- routing among specialists;
- decision to use no specialist when none is necessary;
- cross-skill transition discipline;
- adaptive handoff policy;
- global anti-overthinking behavior;
- global stop discipline;
- conflict resolution when several skills appear relevant.

## 8.4 Does not own

- deep requirements discovery;
- root-cause diagnosis;
- creativity techniques;
- detailed system design;
- risk/feasibility evaluation;
- implementation planning;
- coding;
- verification procedure details.

If the kernel begins reproducing those specialist procedures, it is becoming a monolith again.

## 8.5 Depth model

### Low depth

Characteristics:

- deterministic;
- low stakes;
- reversible;
- little meaningful uncertainty.

Examples:

- explain a header;
- simple syntax answer;
- mechanical rename.

Expected behavior:

- no specialist ceremony;
- direct action/answer.

### Medium depth

Characteristics:

- some ambiguity;
- trade-off;
- local design choice;
- evidence inspection needed.

Likely behavior:

- one specialist;
- perhaps a second specialist only if the first exposes a genuinely different reasoning need.

### High depth

Characteristics:

- high cost of error;
- conflicting evidence;
- architecture;
- destructive change;
- business impact;
- irreversible choice;
- failed verification that invalidates assumptions.

Likely behavior:

- explicit routing;
- possible multi-skill sequence;
- stronger context preservation;
- stronger verification.

## 8.6 `NONE` must remain valid

The kernel should learn from `thinking-model-router`:

> A task should not use a reasoning framework merely because one exists.

Examples where no specialist may be needed:

- direct factual explanation;
- mechanical file transformation;
- routine implementation under a fully approved plan;
- obvious local fix with deterministic validation.

## 8.7 Common kernel failure modes

### Over-routing

Calling every specialist for every meaningful task.

### Ritualized depth

Treating deeper reasoning as inherently superior.

### Specialist stacking

Loading multiple specialists with overlapping responsibilities.

### Kernel leakage

Implementing specialist procedures inside the kernel.

### Phase thinking

Forcing every problem through a lifecycle sequence.

## 8.8 Examples

1. **HTTP concept question** → no specialist.
2. **Container restart with unknown cause** → Investigation.
3. **Unclear client request** → Discovery.
4. **Request for radically different approaches** → Ideation.
5. **Turn selected concept into architecture** → Design.
6. **Choose among known designs** → Evaluation.
7. **Implement approved spec** → Execution.
8. **Brainstorm then choose** → Ideation → Evaluation.
9. **Design and assess architectures** → Design → Evaluation.
10. **Implementation failed and cause is unclear** → Investigation, then route based on cause.

## 8.9 Research Pack

1. Thinking Model Router  
   https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-model-router  
   **Study for:** `NONE`, one-primary-model preference, mechanism-based routing.

2. Agent Skills specification  
   https://agentskills.io/specification  
   **Study for:** progressive disclosure, metadata-driven discovery, size/structure constraints.

3. Agent Skills client implementation  
   https://agentskills.io/client-implementation/adding-skills-support  
   **Study for:** activation realities and portability constraints.

4. Metacognition  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-cognition-metacognition  
   **Study for:** monitoring whether the current reasoning strategy is working.

5. Using Superpowers  
   https://www.skills.sh/obra/superpowers/using-superpowers  
   **Study critically:** strong invocation discipline. Nexload should not blindly copy mandatory invocation for every applicable skill.

## 8.10 Builder research questions

- What routing signals best distinguish Discovery from Investigation?
- How can the kernel prevent activation cascades?
- Which global invariants measurably improve specialists?
- What is the smallest kernel that still changes outcomes?
- Can skill-selection quality be evaluated separately from output quality?

---

# 9. `nexload-reasoning-discovery`
## Intent, Requirements, Framing, Scope, Ownership

## 9.1 Core mission

Convert a raw request, feature idea, stakeholder statement, or ambiguous objective into a **reasoning-ready problem model**.

The goal is not to solve the problem.

The goal is to ensure the right problem is being solved.

## 9.2 Primary cognitive question

> What outcome is actually needed, by whom, under what constraints, with what boundaries and unresolved decisions?

## 9.3 Why this is an independent skill

Discovery reasons about **desired reality**.

It asks:

- what should be true?
- what does success mean?
- what is actually required?
- what is preference versus constraint?
- whose decision is this?
- what must remain unchanged?

This differs from Investigation, which reasons about observed reality and causes.

## 9.4 Owns

- intent discovery;
- user/business objective;
- problem framing;
- requirements clarification;
- hard constraints;
- soft preferences;
- scope;
- explicit non-goals;
- preserved behavior/contracts;
- assumptions in the framing;
- unresolved owner decisions;
- inspect-before-ask discipline;
- safe-default vs ask decision;
- stakeholder/decision ownership.

## 9.5 Does not own

- generating broad solution alternatives;
- root-cause diagnosis;
- selecting a final architecture;
- full risk analysis;
- implementation planning;
- coding.

Discovery may mention possible solution directions only to expose assumptions, not to become the solution engine.

## 9.6 Key distinctions

### Requirement vs proposed solution

`We need Redis` may be a solution proposal rather than a requirement.

### Hard constraint vs preference

`Must run inside Iran` may be hard. `Prefer Alpine` may be soft unless compatibility makes it mandatory.

### Known vs assumed requirement

Stakeholders often phrase assumptions as requirements.

### Owner decision vs technical decision

The agent should not invent pricing policy, refund semantics, eligibility, or commercial rules.

## 9.7 Question-gating philosophy

Discovery should minimize interrogation.

Before asking:

1. inspect available context;
2. determine whether the answer can safely default;
3. determine whether the answer can materially change the outcome;
4. determine whether the user/business actually owns the decision.

## 9.8 Conceptual outputs

Depending on complexity, Discovery may produce:

- concise problem statement;
- confirmed facts/requirements;
- constraints;
- must-preserve list;
- open decisions;
- assumptions;
- scope/non-scope;
- reasoning-ready brief for another specialist.

Do not force all fields on every task.

## 9.9 Failure modes

### Interview theater
Asking many questions because discovery exists.

### Solution fixation
Accepting stakeholder implementation language as the problem.

### Curiosity questions
Asking details with no decision impact.

### Requirement inflation
Turning optional ideas into requirements.

### Assumption laundering
Repeating an assumption until it becomes "confirmed."

### Technical takeover
Engineering invents business decisions.

## 9.10 Examples

### Example 1 — Custom-order product

Request: `We need a 3D customizer.`

Discovery should uncover whether the real job is visual self-design, constrained configuration, submitting specifications, or communicating with a designer.

### Example 2 — Monitoring replacement

Request: `Replace Uptime Kuma.`

Discover actual required capabilities: public status pages, Telegram, monitor types, geography, deployment constraints.

### Example 3 — SMS sharing

Request: `Share my SMS with accounting.`

Reveal actual constraints: OTP access, time bounds, privacy of personal messages, no physical phone handoff.

### Example 4 — Database redesign

Request: `Move this to MongoDB.`

Discover what current problem the change is meant to solve.

### Example 5 — UI improvement

Request: `Make this modern.`

Operationalize modern into hierarchy, density, interaction clarity, responsiveness, consistency.

### Example 6 — Factory ordering system

Separate ERP inventory, pricing, representative credit, unit conversion, approval flow, exporter differences.

### Example 7 — Build-cost problem

Request: `Replace GitHub Actions.`

Determine whether cost, performance, connectivity, control, or concurrency is the real objective.

### Example 8 — SEO

Request: `Improve SEO.`

Discover whether the actual issue is indexing, crawlability, structured data, content, or performance.

### Example 9 — Refactor

Request: `Clean this module.`

Discover what must remain unchanged and which quality dimension matters.

### Example 10 — SaaS pricing

Separate domain-model questions from unresolved commercial policy and escalate only the latter.

## 9.11 Research Pack

1. Problem Framing Canvas  
   https://www.skills.sh/deanpeters/product-manager-skills/problem-framing-canvas  
   **Study for:** solution-first bias prevention and reframing.

2. Intent Explorer  
   https://www.skills.sh/fimoklei/pm-ai-playbook/intent-explorer  
   **Study for:** turning ambiguous ideas into agent-ready intent specifications.

3. Assumption Excavator  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity-assumption-excavator  
   **Study for:** surface and structural assumptions.

4. Problem Statement  
   https://www.skills.sh/deanpeters/product-manager-skills/problem-statement  
   **Study for:** user/outcome-centered framing.

5. Jobs to Be Done  
   https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-jobs-to-be-done  
   **Study for:** progress/job framing versus feature-list thinking.

6. Consider All Factors  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity-consider-factors  
   **Study for:** mapping factors before deciding, without turning it into exhaustive ceremony.

7. Wayfinder  
   https://www.skills.sh/mattpocock/skills/wayfinder  
   **Study for:** unresolved decisions versus execution tasks and canonical decision artifacts.

## 9.12 Builder research questions

- How should the skill decide when a question is blocking?
- How should it distinguish preference from business rule?
- When should it challenge the proposed solution?
- How can discovery remain concise for small tasks?
- What exact boundary prevents Discovery from becoming Ideation?

---

# 10. `nexload-reasoning-investigation`
## Evidence, Hypotheses, Causality, Contradiction, Root Cause

## 10.1 Core mission

Determine what is actually true or happening and, when relevant, why.

Investigation is a truth-finding engine.

## 10.2 Primary cognitive question

> Given current observations and evidence, which explanation is best supported, and what evidence would discriminate between alternatives?

## 10.3 Why this is independent

Investigation has a fundamentally different algorithm from Discovery:

```text
observe
→ evidence inventory
→ hypotheses
→ predictions/discriminators
→ test/inspect
→ update
→ causal conclusion or bounded uncertainty
```

## 10.4 Owns

- evidence quality;
- observation;
- source tracing;
- claim decomposition;
- hypothesis generation;
- counter-hypothesis;
- falsification;
- causal analysis;
- root-cause tracing;
- reproduction;
- discriminating tests;
- triangulation;
- contradictory evidence;
- uncertainty calibration;
- incident diagnosis;
- fact verification.

## 10.5 Does not own

- creative product brainstorming;
- deciding business policy;
- designing full solutions before causal understanding;
- broad implementation planning;
- choosing product direction unless the task is fundamentally evidentiary.

## 10.6 Investigation model

A strong investigation generally requires:

1. observed phenomenon;
2. reliable feedback/reproduction loop when possible;
3. minimum plausible hypothesis set;
4. differentiating predictions;
5. cheapest/highest-signal discriminator;
6. evidence update;
7. stopping rule.

## 10.7 Root cause vs useful causal confidence

Investigation does not require metaphysical certainty. It requires enough causal confidence to choose a safe next action.

In active incidents, reversible mitigation may occur before complete root cause analysis.

## 10.8 Failed-fix signal

Repeated failed fixes should raise suspicion that the causal model, architecture assumption, or failure layer is wrong.

## 10.9 Failure modes

- symptom patching;
- confirmation lock-in;
- hypothesis explosion;
- source-count illusion;
- stale evidence;
- causal overclaim;
- endless diagnosis.

## 10.10 Examples

### Example 1 — Illegal instruction

MongoDB crashes with `Illegal instruction` on a host without AVX. Compare instruction-set incompatibility, image mismatch, OOM, corrupted binary. AVX evidence is highly discriminating.

### Example 2 — Intermittent API latency

Build a reproducible request and compare DB, network, cache, and application timing before adding caching.

### Example 3 — SMS cannot send

Separate SIM provisioning, SMSC, network registration, and device configuration.

### Example 4 — Status page requires login

Trace route/middleware/auth behavior instead of trusting the UI setting.

### Example 5 — Package capability claim

Trace documentation and installed version rather than relying on a blog.

### Example 6 — Payment mismatch

Separate provider status, callback payload, internal invoice state, and verification rules.

### Example 7 — Performance regression

Create before/after measurements and bisect relevant changes.

### Example 8 — Production-only UI bug

Compare production build, env, CDN/cache, browser/runtime, and source branch.

### Example 9 — Market claim

Decompose `all competitors offer X` and triangulate genuinely independent sources.

### Example 10 — Data inconsistency

Trace write paths, migrations, concurrency, derived fields, and state ownership.

## 10.11 Research Pack

### Debugging and causal reasoning

1. Systematic Debugging  
   https://www.skills.sh/obra/superpowers/systematic-debugging

2. Matt Pocock `diagnose`  
   https://www.skills.sh/mattpocock/skills/diagnose

3. Diagnosing Bugs  
   https://www.skills.sh/mattpocock/skills/diagnosing-bugs

4. Root Cause Tracing  
   https://www.skills.sh/fimoklei/pm-ai-playbook/root-cause-tracing

### Evidence reasoning

5. Investigation Router  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-investigation

6. Evidence Audit  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-investigation-evidence-audit

7. Counter-Hypothesis  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-investigation-counter-hypothesis

8. Source Trace  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-investigation-source-trace

9. Triangulation  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-investigation-triangulation

10. Claim Decomposition  
    https://www.skills.sh/human-avatar/skills-for-humanity/s4h-investigation-claim-decomposition

### Dynamic incident reasoning

11. OODA  
    https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-ooda

12. Kepner-Tregoe  
    https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-kepner-tregoe

## 10.12 Builder research questions

- How should the skill balance diagnostic rigor and incident mitigation?
- How many hypotheses are enough?
- How should it select discriminators?
- When is a root cause sufficiently supported?
- How should source-quality reasoning differ between software debugging and public research?
- How should failed verification from Execution enter Investigation?
- How should Investigation avoid performing Design prematurely?


---

# 11. `nexload-reasoning-ideation`
## Divergence, Creativity, Alternative Generation, Fixation Escape

## 11.1 Core mission

Expand the solution space before judgment collapses it.

## 11.2 Primary cognitive question

> What materially different ways could achieve the objective?

## 11.3 Why this is independent

Creative generation and evaluation interfere with one another.

The ecosystem intentionally establishes a hard conceptual separation:

```text
Ideation:
create possibilities

Evaluation:
destroy weak possibilities / select direction
```

Hard constraints remain active during Ideation. Soft criteria should not prematurely suppress options.

## 11.4 Owns

- divergent thinking;
- alternative generation;
- conceptual diversity;
- assumption breaking for creativity;
- lateral thinking;
- analogical transfer;
- cross-pollination;
- concept expansion;
- collision thinking;
- provocation;
- creative reframing after Discovery;
- idea clustering/combination;
- escaping dominant approaches.

## 11.5 Does not own

- final ranking;
- final recommendation;
- full feasibility analysis;
- implementation planning;
- detailed final architecture.

It may reject direct violations of hard constraints, but must not become Evaluation.

## 11.6 What counts as a different idea

Different wording is not diversity.

Meaningful diversity may differ in:

- actor;
- workflow;
- ownership;
- architecture;
- interaction model;
- state model;
- economic mechanism;
- automation level;
- human involvement;
- risk profile.

## 11.7 Creativity technique routing

The final skill should not blindly run all techniques.

### Fixation problem

Potential tools:

- lateral thinking;
- random entry;
- collision-zone thinking.

### Narrow solution space

Potential tools:

- concept fan;
- alternatives;
- abstraction ladder.

### Hidden assumptions

Potential tools:

- assumption inversion;
- first-principles reconstruction.

### Too conventional

Potential tools:

- cross-pollination;
- analogy/domain transfer.

### Structural contradiction

Potential tool:

- TRIZ.

The builder should design a lightweight technique router inside Ideation.

## 11.8 Failure modes

### Premature convergence
Rejecting ideas too early.

### Cosmetic diversity
Ten versions of the same mechanism.

### Creativity theater
Running techniques because they sound creative.

### Constraint blindness
Ignoring genuine hard constraints.

### Novelty bias
Favoring unusual ideas merely for being unusual.

### Ideation without stopping
Continuing after the space is sufficiently diverse.

## 11.9 Examples

### Example 1 — Custom product ordering

Generate guided configurator, template customization, visual editor, assisted consultation, modular builder, AI-assisted concept, and structured request + human confirmation.

### Example 2 — Monitoring across regions

Generate direct checks, regional relay, agent-based checks, dual-region monitoring, local proxy, scheduled synthetic checks.

### Example 3 — User onboarding

Generate wizard, import-first, template-first, demo-data-first, concierge onboarding, progressive setup, AI-guided setup.

### Example 4 — Authentication

Generate OTP, magic link, passkey, password + OTP, delegated auth, trusted-device flow.

### Example 5 — SaaS pricing

Generate per-business, per-seat, usage-based, feature tier, hybrid, transaction fee, flat subscription.

### Example 6 — Search UX

Generate faceted search, browse-first, conversational filtering, saved filters, command palette, recommendation-first.

### Example 7 — Reducing build cost

Generate self-hosted runner, remote cache, fewer build targets, registry prebuild, local build/push, alternative CI, workload partitioning.

### Example 8 — Content production

Generate tutorials, teardowns, case studies, architectural debates, live builds, visual explainers, challenge formats.

### Example 9 — Handling low-stock orders

Generate block order, partial fulfillment, backorder, alternative suggestion, reservation, approval queue.

### Example 10 — Simplifying a workflow

Use subtraction: remove approval, remove duplicate field, derive data automatically, collapse states, eliminate unnecessary service.

## 11.10 Research Pack

1. Superpowers Brainstorming  
   https://www.skills.sh/obra/superpowers/brainstorming  
   **Study for:** context-aware idea-to-design progression and implementation gate.  
   **Do not copy blindly:** its approval ceremony may be too rigid for Nexload.

2. S4H Creativity Router  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity  
   **Study for:** diagnose the creative problem before selecting a technique.

3. Alternatives / APC  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity-alternatives  
   **Study for:** generation/evaluation firewall.

4. Concept Fan  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity-concept-fan  
   **Study for:** Goal → Concepts → Implementations.

5. Lateral Thinking  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity-lateral-thinking  
   **Study for:** identifying and escaping the dominant idea.

6. Six Hats  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity-six-hats  
   **Study for:** separating thinking modes; do not necessarily copy the ritual.

7. Collision-Zone Thinking  
   https://www.skills.sh/fimoklei/pm-ai-playbook/collision-zone-thinking

8. Cross-Pollination Engine  
   https://www.skills.sh/fimoklei/pm-ai-playbook/cross-pollination-engine  
   **Study for:** principle transfer rather than surface copying.

9. When Stuck  
   https://www.skills.sh/fimoklei/pm-ai-playbook/when-stuck  
   **Study for:** stuck-type → technique routing.

10. First Principles  
    https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-first-principles

11. TRIZ  
    https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-triz

12. Analogy Router  
    https://www.skills.sh/human-avatar/skills-for-humanity/analogy

## 11.11 Builder research questions

- How many mechanism-distinct alternatives are enough?
- Which constraints stay active during divergence?
- How can the skill detect cosmetic diversity?
- How does it avoid drifting into Evaluation?
- Which creative techniques deserve embedded support?
- How should it respond when one obvious solution already dominates?
- How can creative output stay practical without premature feasibility filtering?

---

# 12. `nexload-reasoning-design`
## Solution Synthesis, Architecture, Boundaries, Interfaces, State

## 12.1 Core mission

Transform an objective and candidate direction into a coherent system or solution model.

## 12.2 Primary cognitive question

> How can this direction work as a coherent whole with explicit ownership, boundaries, state, interfaces, and failure behavior?

## 12.3 Why this is independent

Design is neither idea generation nor implementation.

It is synthesis.

A design can be evaluated, rejected, revised, or compared before implementation.

## 12.4 Owns

- system/solution synthesis;
- architecture;
- ownership;
- boundaries/seams;
- source of truth;
- interfaces/contracts;
- state;
- data flow;
- dependency relationships;
- lifecycle/state transitions;
- failure behavior;
- operational model;
- design-level security/privacy concerns;
- nearest credible extension;
- architecture alternatives when design itself requires comparison.

## 12.5 Does not own

- broad unconstrained brainstorming;
- final business/product choice;
- final feasibility/risk decision;
- task-by-task implementation planning;
- coding;
- production verification.

## 12.6 Design philosophy

Default design posture:

```text
confirmed requirements
+ constraints
+ preserved contracts
+ selected/candidate concept
→ explicit ownership
→ explicit boundaries
→ source of truth
→ interfaces
→ state/data flow
→ failure behavior
→ minimal sufficient architecture
```

## 12.7 Existing mechanisms and project reality

For software work, Design should prioritize:

- current architecture;
- domain language;
- ADRs;
- existing seams;
- framework capabilities;
- project conventions.

A clean-room architecture that ignores the current system is often less useful than a bounded compatible design.

## 12.8 Nearest credible extension

Design should not optimize for every imaginable future.

But it should not create an obvious near-term dead end.

Target:

> current confirmed need + nearest credible extension.

## 12.9 Source of truth

A strong design should answer:

- who owns this state?
- where is authoritative data?
- who may mutate it?
- what is derived?
- how is duplication synchronized if unavoidable?

## 12.10 Failure behavior

Design should not only show the happy path.

Important questions:

- what fails?
- where is failure visible?
- what can retry?
- what must not retry?
- what happens after partial success?
- what state remains authoritative?

## 12.11 Failure modes

### Architecture astronautics
Designing for hypothetical scale or organizational size.

### Abstraction addiction
Introducing layers without concrete leverage.

### Duplicate authority
Multiple components independently own the same truth.

### Interface inflation
Exposing internal complexity to callers.

### Greenfield blindness
Ignoring current repo conventions and migration cost.

### Hidden operational cost
Architecture diagram looks simple but deployment/monitoring is complex.

### Design-as-decision
Assuming a coherent design is automatically the right choice.

## 12.12 Examples

### Example 1 — Subscription model

Define authoritative subscription entity, snapshots, plan-limit ownership, expiry behavior, catalog activation semantics.

### Example 2 — Payment flow

Define provider interaction, invoice state, verification authority, mismatch/manual-review behavior, callback semantics.

### Example 3 — Custom order

Define catalog vs custom order boundary, deposit/final payment state, user-configurable attributes, factory approval.

### Example 4 — Monitoring relay

Define central monitor, regional relay/proxy, request path, failure visibility, security boundary.

### Example 5 — Media serving

Design shared volume + Nginx, object storage, or app serving based on actual deployment constraints.

### Example 6 — Authentication

Define OTP initiation, verification, token issuance, refresh/session semantics, role ownership.

### Example 7 — CSV import

Define parse, validate, diff, apply, audit, rollback behavior.

### Example 8 — Catalog renderer

Define read-only data access, URL ownership, preview behavior, cache/revalidation boundary.

### Example 9 — Notification architecture

Define event ownership, delivery channels, retry semantics, deduplication, user preferences.

### Example 10 — Non-software workflow

Design a factory approval process with explicit actors, states, edit rights, and irreversible commitment points.

## 12.13 Research Pack

1. Improve Codebase Architecture — Matt Pocock  
   https://www.skills.sh/mattpocock/skills/improve-codebase-architecture  
   **Study for:** deep modules, seams, locality, ADR awareness, scope before scanning.

2. Improve Codebase Architecture — fimoklei variant  
   https://www.skills.sh/fimoklei/pm-ai-playbook/improve-codebase-architecture  
   **Study for:** interface/implementation depth and architectural friction.

3. Design an Interface  
   https://www.skills.sh/mattpocock/skills/design-an-interface  
   **Study for:** Design It Twice, caller perspective, radically different interfaces.

4. Matt Pocock Skills Catalog  
   https://www.skills.sh/mattpocock/skills  
   **Research further:** `codebase-design`, `domain-modeling`, `ubiquitous-language`.

5. TRIZ  
   https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-triz  
   **Study for:** structural contradictions in architecture.

6. Thought Experiment  
   https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-thought-experiment  
   **Study for:** failure/scale tracing when cheap empirical tests are unavailable.

7. Simplification Cascades  
   https://www.skills.sh/fimoklei/pm-ai-playbook/simplification-cascades  
   **Study critically:** when one deeper principle removes multiple special cases.

8. First Principles  
   https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-first-principles  
   **Use selectively:** only when inherited constraints are questionable.

## 12.14 Builder research questions

- How should Design interact with domain-modeling skills already in Nexload?
- What belongs in Design versus Evaluation?
- How deep should candidate designs be before Evaluation?
- What architecture vocabulary should remain domain-agnostic?
- How does the skill detect speculative scalability?
- How should it reason about legacy/current system constraints?
- How much failure behavior belongs in Design versus Execution?

---

# 13. `nexload-reasoning-evaluation`
## Feasibility, Challenge, Risk, Trade-offs, Reversibility, Decision

## 13.1 Core mission

Determine whether a proposal is viable and which available direction best fits the actual constraints.

## 13.2 Primary cognitive question

> Given the real options and constraints, which direction should we choose, what are we accepting, and what would make us reverse the decision?

## 13.3 Why this is independent

Evaluation is the convergence engine.

It deliberately switches mental posture from:

```text
What might work?
```

to:

```text
What should survive scrutiny?
```

## 13.4 Owns

- feasibility;
- constraints screening;
- challenge;
- assumption stress-testing;
- counterarguments;
- risk;
- failure paths;
- pre-mortem;
- second-order effects;
- opportunity cost;
- reversibility;
- complexity cost;
- operational cost;
- material criteria;
- option elimination;
- trade-off analysis;
- decision recommendation;
- reversal conditions.

## 13.5 Does not own

- broad idea generation;
- detailed final architecture;
- implementation planning;
- coding;
- root-cause debugging unrelated to option evaluation.

## 13.6 Evaluation is not scoring theater

Numerical matrices are optional.

They are useful only when criteria can be meaningfully compared, weights are justified, and values are grounded enough to avoid false precision.

Do not fabricate arbitrary scores.

## 13.7 Hard constraints before preferences

Typical order:

```text
real options
→ hard constraints
→ feasibility
→ material criteria
→ challenge / risk
→ trade-offs
→ reversibility
→ decision
```

## 13.8 Dominated options

If one option is no better on any material dimension and worse on at least one, remove it.

Do not present invalid/dominated options merely to appear balanced.

## 13.9 Reversal trigger

A strong decision should identify what new evidence or changed constraint would cause reconsideration.

This makes decisions sticky without making them dogmatic.

## 13.10 Risk proportionality

Risk analysis should scale with failure cost, blast radius, irreversibility, and uncertainty.

Do not run a full pre-mortem for a reversible CSS choice.

## 13.11 Failure modes

- balanced-list paralysis;
- fake precision;
- risk theater;
- complexity blindness;
- irreversibility blindness;
- initial-preference bias;
- ideation leakage.

## 13.12 Examples

### Example 1 — Hook library

Compare required semantic coverage, React/SSR compatibility, maintenance, bundle/complexity, migration burden. Raw hook count is not enough.

### Example 2 — Self-hosted CI

Evaluate cost reduction, resource contention, secrets, isolation, disk growth, operational ownership.

### Example 3 — Redis

If framework-native caching satisfies confirmed requirements, Redis may be dominated by lower complexity.

### Example 4 — Database

Evaluate relational integrity, transactions, access patterns, operations, migration. Avoid popularity arguments.

### Example 5 — Visual editor vs guided configurator

Evaluate user value, implementation cost, usability, factory constraints, maintenance.

### Example 6 — Monitoring location

Evaluate central foreign deployment, regional relay, or full relocation.

### Example 7 — Upgrade now vs later

Evaluate required features, compatibility, migration risk, support horizon, opportunity cost.

### Example 8 — Shared disk vs object storage

Single-node constraints may favor shared disk; confirmed multi-node durability may change the decision.

### Example 9 — Vendor choice

Evaluate reliability, API constraints, lock-in, support, exit cost, compatibility.

### Example 10 — Business campaign

Evaluate expected value, operational capacity, customer confusion, reversibility.

## 13.13 Research Pack

1. Idea Challenger  
   https://www.skills.sh/fimoklei/pm-ai-playbook/idea-challenger  
   **Study for:** proposal clarification, assumptions, targeted attack vectors.

2. The Challenger  
   https://www.skills.sh/fimoklei/pm-ai-playbook/the-challenger  
   **Study for:** pre-commit red-team timing.

3. Thinking Pre-Mortem  
   https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-pre-mortem  
   **Study for:** concrete failure paths tied to plan changes and when NOT to use.

4. Pre-Mortem Analyst  
   https://www.skills.sh/fimoklei/pm-ai-playbook/pre-mortem-analyst  
   **Study critically:** useful process, but avoid arbitrary scoring/volume requirements unless evals justify them.

5. Second-Order Thinking  
   https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-second-order

6. Decision Criteria Weighting  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-decision-criteria-weighting  
   **Study for:** making criterion importance inspectable without replacing judgment.

7. Plus / Minus / Interesting  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity-plus-minus-interesting

8. Consider All Factors  
   https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity-consider-factors

9. Margin of Safety  
   https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-margin-of-safety

10. Kepner-Tregoe  
    https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-kepner-tregoe

11. Via Negativa  
    https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-via-negativa

## 13.14 Builder research questions

- How should the skill define material criteria operationally?
- When is a scoring matrix useful versus harmful?
- How should it determine whether risk analysis is necessary?
- How should it handle one clearly dominant option?
- How should it prevent reopening settled decisions?
- What is the correct relationship between Evaluation and Design iteration?
- How should it represent uncertainty without producing indecision?


---

# 14. `nexload-reasoning-execution`
## Planning, Implementation Control, Verification, Recovery, Completion

## 14.1 Core mission

Turn an approved direction/design into a bounded, verified result.

## 14.2 Primary cognitive question

> What is the safest and simplest path from approved intent to verified completion, and how should we recover when reality disagrees?

## 14.3 Why this is independent

Once a direction is approved, the cognitive posture changes.

The agent should stop reopening solved decisions and focus on sequencing, scope, implementation, proof, and recovery.

## 14.4 Owns

- planning;
- decomposition;
- dependency ordering;
- scope enforcement;
- execution authorization;
- implementation strategy;
- local execution autonomy;
- progress checkpoints;
- verification;
- completion claims;
- rollback;
- failure recovery;
- re-routing to another reasoning skill when the failure is not local.

## 14.5 Does not own

- broad product discovery;
- unconstrained ideation;
- routine re-evaluation of settled architecture;
- redesign unless failure evidence proves design invalid;
- general code review outside execution/verification needs.

## 14.6 Planning vs execution

The skill must respect explicit user boundaries such as:

```text
analysis only
plan only
do not implement
```

Planning must not silently become implementation.

## 14.7 Controlled autonomy

After material decisions are settled, routine reversible details should be handled autonomously.

Do not ask for permission on every helper name, local refactor, minor file organization, or safe implementation detail.

Escalate:

- new business rule;
- material architecture change;
- public contract change;
- destructive behavior;
- security/privacy boundary;
- major scope expansion.

## 14.8 Verification

The evidence must match the claim.

```text
"builds" → build evidence
"works" → behavioral evidence
"bug fixed" → original reproduction no longer fails
"public" → unauthenticated external check
"migration safe" → integrity + rollback evidence
"faster" → re-measured performance
```

## 14.9 Recovery: earliest invalid state

When verification fails:

### Execution defect

Examples: typo, incorrect wiring, local bug.

Stay in Execution.

### Plan defect

Examples: missing dependency step, wrong ordering, incomplete migration sequence.

Repair planning inside Execution.

### Design defect

Implementation reveals the architecture cannot satisfy a confirmed constraint.

Route to:

```text
nexload-reasoning-design
```

and possibly Evaluation.

### Decision defect

Evidence shows the selected option is no longer viable or was incorrectly preferred.

Route to:

```text
nexload-reasoning-evaluation
```

### Requirement/frame defect

The implemented behavior does not match the actual business need because the need was misunderstood.

Route to:

```text
nexload-reasoning-discovery
```

### Reality/causal defect

Implementation assumptions about current behavior/environment were wrong.

Route to:

```text
nexload-reasoning-investigation
```

## 14.10 Completion

A task is not complete merely because code exists, a command ran, a build passed, or a setting saved.

Completion depends on the actual user-visible/system claim.

## 14.11 Failure modes

### Plan theater
A long plan with no useful dependency structure.

### Micro-management
Asking user approval for routine implementation details.

### Plan drift
Execution departs from settled decisions without escalation.

### Completion by assertion
Claiming success without fresh evidence.

### Symptom patch loop
Repeated local fixes despite evidence the model/design is wrong.

### Verification mismatch
Using linter success to claim runtime correctness.

### Endless polish
Continuing beyond requested scope.

## 14.12 Examples

### Example 1 — Package migration

Inventory usages → map semantics → migrate bounded slice → verify → repeat → remove dependency → final verification.

### Example 2 — Monitoring relay deployment

Deploy relay → verify connectivity → route one monitor → observe → migrate remaining monitors.

### Example 3 — Destructive DB migration

Require backup/rollback, dry run, integrity checks, controlled execution, and post-migration verification.

### Example 4 — Plan-only task

Stop after an implementation-ready plan.

### Example 5 — Approved architecture

Do not reopen architecture because a different pattern seems prettier.

### Example 6 — Build passes but feature fails

Runtime failure remains a failed verification.

### Example 7 — Public status page

Verify using unauthenticated external behavior.

### Example 8 — Cache invalidation

Modify source data and prove downstream view updates as intended.

### Example 9 — Dependency surprise

A package requires framework downgrade. This is material; stop and route to Evaluation/Design rather than silently downgrading.

### Example 10 — Repeated failed fix

After multiple local fixes, evidence suggests assumption/model failure. Route to Investigation rather than patch again.

## 14.13 Research Pack

1. Writing Plans  
   https://www.skills.sh/obra/superpowers/writing-plans  
   **Study for:** implementation-ready decomposition, boundaries, verification planning.  
   **Do not copy blindly:** mandatory tiny tasks and TDD may not fit Nexload's general-purpose scope.

2. Executing Plans  
   https://www.skills.sh/obra/superpowers/executing-plans  
   **Study for:** critical plan review, blockers, execution, verification.

3. Verification Before Completion  
   https://www.skills.sh/obra/superpowers/verification-before-completion  
   **Study for:** fresh evidence before completion claims.

4. Matt Pocock `implement-spec`  
   https://www.skills.sh/mattpocock/skills/implement-spec  
   **Study for:** task graph, sparse handoff, execution boundaries.

5. Handoff  
   https://www.skills.sh/mattpocock/skills/handoff  
   **Study for:** context compression and artifact pointers.

6. Systematic Debugging  
   https://www.skills.sh/obra/superpowers/systematic-debugging  
   **Study for:** recognizing when repeated fix failure signals a deeper problem.

7. OODA  
   https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-ooda  
   **Study for:** reversible actions under active incidents; integrate carefully with verification discipline.

## 14.14 Builder research questions

- How granular should implementation plans be?
- How does the skill know implementation is authorized?
- Which local decisions are autonomous?
- What failure evidence triggers re-routing rather than local recovery?
- How should verification differ across coding, DevOps, documents, and business workflows?
- How does it prevent execution from reopening settled decisions?
- How does it avoid a mandatory TDD bias while preserving evidence-first verification?

---

# 15. Cross-Skill Ownership Matrix

| Capability | Kernel | Discovery | Investigation | Ideation | Design | Evaluation | Execution |
|---|---:|---:|---:|---:|---:|---:|---:|
| Reasoning depth | **Own** | local | local | local | local | local | local |
| Routing | **Own** | handoff | handoff | handoff | handoff | handoff | recovery routing |
| Intent | — | **Own** | — | consume | consume | consume | consume |
| Requirements | — | **Own** | — | consume | consume | consume | consume |
| Evidence truth-finding | policy | supporting | **Own** | supporting | supporting | supporting | verification evidence |
| Root cause | — | — | **Own** | — | — | — | detect need |
| Alternatives | — | — | — | **Own** | candidate designs | limited only | — |
| Architecture synthesis | — | — | causal only | conceptual only | **Own** | assess | consume |
| Feasibility | — | — | factual support | — | rough constraints | **Own** | detect contradiction |
| Risk | proportionality | — | causal evidence | — | failure behavior | **Own** | execution risk |
| Decision | routing | owner decisions | causal conclusion | no final choice | design decisions | **Own** | preserve |
| Planning | — | — | investigation plan | exploration sequencing | design sequencing | evaluation sequencing | **Own** |
| Implementation | — | — | instrumentation only | — | prototype only if useful | — | **Own** |
| Verification | global principle | validate framing | evidence testing | diversity/constraint check | design consistency | decision robustness | **Own completion proof** |
| Recovery | global routing | reframe | update hypothesis | reopen exploration | redesign | redecide | **Own detection/reroute** |

The builder should use this table to identify duplication.

---

# 16. Boundary Cases

These cases are intentionally difficult and should be used when designing triggers and evals.

## 16.1 Discovery vs Investigation

Prompt: `Users aren't using the CRM. Why?`

Possible meanings:

- product intent/adoption problem → Discovery;
- causal behavioral analysis using evidence → Investigation.

The agent may need Discovery → Investigation if the question itself is underframed.

## 16.2 Ideation vs Design

Prompt: `Give me three architecture approaches.`

If the goal is broad alternative mechanisms → Ideation.

If each approach needs ownership/interfaces/state → Design.

## 16.3 Design vs Evaluation

Prompt: `Compare event-driven vs synchronous architecture.`

If architectures are already specified → Evaluation.

If not → Design candidate models → Evaluation.

## 16.4 Investigation vs Evaluation

Prompt: `Is this vendor reliable?`

May require Investigation → Evaluation.

Investigation establishes evidence; Evaluation determines suitability.

## 16.5 Evaluation vs Execution

Prompt: `Should we deploy this migration tonight?`

Evaluation assesses risk/timing.

Execution owns the deployment plan after the choice.

---

# 17. End-to-End Scenario Library

## Scenario 1 — New SaaS feature

Request: Build a shareable catalog feature.

```text
Discovery
→ Ideation
→ Design candidates
→ Evaluation
→ detailed Design
→ Execution
```

## Scenario 2 — Production MongoDB crash

```text
Investigation → Execution
```

If remedy requires architecture change:

```text
Investigation → Design → Evaluation → Execution
```

## Scenario 3 — Costly CI

```text
Discovery → Investigation → Ideation → Evaluation → Design → Execution
```

Discovery identifies the real objective; Investigation measures current cost/build behavior; Ideation generates alternatives; Evaluation selects; Design defines topology; Execution implements.

## Scenario 4 — Technology-framed request

Request: `Add Redis.`

```text
Discovery
```

If actual need is latency:

```text
Investigation → Ideation/Design → Evaluation
```

Redis may disappear entirely.

## Scenario 5 — Custom-order feature

```text
Discovery → Ideation → lightweight Design → Evaluation → detailed Design → Execution
```

Important: do not kill complex ideas during Ideation merely because implementation is expensive; use Evaluation later.

## Scenario 6 — Existing architecture audit

```text
Design → Evaluation
```

If runtime/data inconsistency appears:

```text
Investigation → Design → Evaluation
```

## Scenario 7 — Failed implementation

Execution classifies:

```text
local bug → Execution
causal assumption wrong → Investigation
architecture wrong → Design
choice wrong → Evaluation
requirement wrong → Discovery
```

## Scenario 8 — Product underperformance

```text
Discovery → Investigation → Ideation → Evaluation
```

## Scenario 9 — Public API redesign

```text
Discovery → Design → Evaluation → Execution
```

High irreversibility increases Evaluation rigor.

## Scenario 10 — Small reversible UI improvement

Likely Design or direct execution with a specialized UI skill. Do not invoke the whole family.

## Scenario 11 — Research claim

`Is MongoDB unsuitable for this host?`

```text
Investigation → Evaluation
```

## Scenario 12 — Business pre-contract

`Do we know enough to quote this project?`

```text
Discovery → Evaluation
```

No execution required.

---

# 18. Anti-Pattern Catalog for the Whole Ecosystem

## 18.1 Premature solution
Correction owner: Discovery.

## 18.2 Question outsourcing
Inspect available evidence before asking. Primarily Discovery/Investigation.

## 18.3 Framework theater
Kernel / specialist technique router.

## 18.4 Option dumping
Evaluation.

## 18.5 Best-practice laundering
All skills require contextual mechanism/evidence.

## 18.6 Speculative scalability
Design + Evaluation.

## 18.7 Scope creep
Discovery defines; Execution enforces.

## 18.8 Settled-decision reopening
Kernel + Execution + Design/Evaluation boundaries.

## 18.9 Premature convergence
Ideation.

## 18.10 Endless ideation
Ideation stop condition + Kernel depth.

## 18.11 Symptom patching
Investigation and Execution recovery.

## 18.12 Completion by assertion
Execution verification.

## 18.13 Summary-as-truth
Investigation evidence hierarchy.

## 18.14 Complexity migration
Design + Evaluation.

## 18.15 Analysis/execution collapse
Execution authorization boundaries.

---

# 19. Mental Models: Embedded Tools, Not New Skills by Default

Useful mental models include First Principles, Systems Thinking, Five Whys, OODA, Pre-Mortem, Second-Order Thinking, Margin of Safety, TRIZ, Concept Fan, Lateral Thinking, PMI, Counter-Hypothesis, and Via Negativa.

Default architecture decision:

> These are techniques used inside the six specialists unless future evals prove one deserves an independent Nexload skill.

## 19.1 Why

Creating a `nexload-*` skill for every mental model would recreate fragmentation.

## 19.2 Selection examples

```text
unsupported inherited constraint → First Principles
moving incident + reversible action → OODA
high-risk plan before execution → Pre-Mortem
solution-space fixation → Lateral Thinking / Concept Fan
conflicting explanations → Counter-Hypothesis
structural design contradiction → TRIZ
complex delayed consequences → Second-Order Thinking
```

### Sources

- Thinking Model Router:  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-model-router
- CC Thinking Skills repository:  
  https://github.com/tjboudreaux/cc-thinking-skills
- S4H Creativity:  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity
- S4H Investigation:  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-investigation

---

# 20. Relationship with Existing Nexload / External Skills

The reasoning family should not swallow specialist engineering skills.

Examples:

```text
nexload-reasoning-design + domain-modeling
nexload-reasoning-evaluation + code-review
nexload-reasoning-execution + deployment-specific skill
nexload-reasoning-discovery + product requirements skill
```

A specialist domain skill should own domain mechanics.

The reasoning family owns reasoning discipline.

Example: `nexload-reasoning-design` should understand ownership, boundaries, architecture, and source of truth, but should not duplicate an entire framework-specific Next.js architecture manual.

---

# 21. Evaluation Architecture

Every skill must be evaluated independently and as part of the ecosystem.

Official Agent Skills guidance recommends realistic prompts, edge cases, baseline comparison, clean contexts, assertions, token/time tracking, human review, and iteration.

### Primary source

https://agentskills.io/skill-creation/evaluating-skills

## 21.1 Per-skill evaluation

### Kernel

Measure:

- routing precision;
- unnecessary activation rate;
- average specialists activated;
- correct `NONE`;
- reasoning-depth proportionality.

### Discovery

Measure:

- redundant question rate;
- owner-decision recognition;
- framing quality;
- safe-default behavior;
- solution-first avoidance.

### Investigation

Measure:

- evidence discipline;
- falsifiable hypothesis quality;
- discriminator quality;
- symptom-patch avoidance;
- causal calibration.

### Ideation

Measure:

- mechanism diversity;
- premature evaluation rate;
- technique relevance;
- novelty without constraint violation;
- stop quality.

### Design

Measure:

- ownership clarity;
- boundary clarity;
- source-of-truth clarity;
- coherence;
- unnecessary complexity;
- nearest-credible-extension discipline.

### Evaluation

Measure:

- material criteria;
- dominated-option elimination;
- risk proportionality;
- reversibility handling;
- clear recommendation;
- false precision avoidance.

### Execution

Measure:

- plan/execute boundary;
- scope adherence;
- autonomous routine decisions;
- claim-matched verification;
- recovery routing;
- completion accuracy.

## 21.2 Integration evaluation

Important ecosystem tests:

1. Discovery → Ideation context preservation.
2. Investigation → Design evidence preservation.
3. Ideation → Evaluation candidate preservation without idea-generation bias.
4. Design → Evaluation correct trade-off interpretation.
5. Evaluation → Execution settled decision preservation.
6. Execution failure → Investigation correct recovery.
7. Execution failure → Design correct recovery.
8. Design contradiction → Discovery reframe.
9. Kernel correctly chooses one specialist instead of many.
10. Kernel correctly chooses `NONE`.

## 21.3 Handoff Loss Rate

Measure how often a material constraint, evidence item, must-preserve rule, or settled decision disappears or mutates during transition.

## 21.4 Boundary Violation Rate

Measure cases where a specialist performs another specialist's core job without a valid reason.

Examples:

- Ideation makes final decision;
- Discovery designs architecture;
- Evaluation writes implementation plan;
- Execution reopens business intent.

## 21.5 Do not predefine arbitrary thresholds

Do not claim `30% ambiguity is acceptable` or `95% confidence` without benchmark data.

Run evals first, then set thresholds based on observed baseline and quality/cost trade-offs.

---

# 22. Builder Agent Research Strategy

The builder agent is explicitly expected to research beyond this SPEC.

## 22.1 Research order

For each skill:

1. read this SPEC section;
2. read every linked primary source;
3. identify shared patterns;
4. identify conflicting assumptions;
5. inspect neighboring skills in the same repositories;
6. search for additional high-quality skills/methods;
7. extract mechanisms, not wording;
8. build a candidate behavior model;
9. run evals;
10. simplify.

## 22.2 What to extract from sources

Extract:

- trigger logic;
- non-trigger logic;
- reasoning mechanisms;
- stopping criteria;
- failure corrections;
- evidence gates;
- useful examples;
- techniques that improve measurable behavior.

Do not blindly copy:

- model-specific tool names;
- repository-specific workflows;
- mandatory TDD policies;
- arbitrary stage counts;
- conversational phrases;
- rigid output templates;
- assumptions tied to another product.

## 22.3 Evidence standard for adding behavior

A new rule should answer:

```text
What failure does this prevent?
Which skill owns it?
Why is it not already covered?
Can an eval observe the difference?
What context/token cost does it add?
```

If those cannot be answered, the rule is probably unnecessary.

---

# 23. Skill Builder Deliverables

For each of the seven skills, the builder should eventually produce at least:

1. validated skill directory;
2. compact `SKILL.md`;
3. focused references only if needed;
4. trigger/non-trigger evals;
5. behavioral evals;
6. integration evals where relevant;
7. short architectural note describing ownership, non-ownership, interactions, source inspirations, and deviations from sources.

This SPEC does not dictate the exact internal files beyond what Agent Skills requires.

---

# 24. Agent Skills Structural Constraints

As of the current Agent Skills specification:

- a skill is a directory with at minimum `SKILL.md`;
- `SKILL.md` contains YAML frontmatter + Markdown;
- `name` and `description` are required;
- `references/`, `scripts/`, `assets/` are optional;
- the entire `SKILL.md` is loaded when activated;
- references can be loaded on demand;
- progressive disclosure is recommended;
- `SKILL.md` is recommended below roughly 500 lines / 5000 tokens;
- references should be focused;
- file references should remain shallow;
- the official `skills-ref` validator can validate structure/frontmatter.

### Source

https://agentskills.io/specification

This matters because specialization should improve context efficiency, not merely create more files.

---

# 25. Architecture Review Checklist

## Ecosystem

- [ ] `6 + 1` boundaries remain cognitively distinct.
- [ ] No specialist depends on mandatory activation of the kernel.
- [ ] Handoff is adaptive, not always serialized.
- [ ] No formal inter-skill dependency is assumed.
- [ ] The architecture is non-linear.
- [ ] `NONE` remains a valid kernel decision.

## Discovery

- [ ] Desired reality / intent is separated from causal investigation.
- [ ] Question-gating is first-class.
- [ ] Business ownership is not invented.

## Investigation

- [ ] Root-cause and evidence reasoning justify independence.
- [ ] Hypothesis testing precedes random fixes.
- [ ] Dynamic incident behavior is considered.

## Ideation

- [ ] Divergence is protected.
- [ ] Mechanism diversity is explicit.
- [ ] Evaluation is not embedded too early.

## Design

- [ ] Architecture is separate from delivery.
- [ ] Ownership/source-of-truth are central.
- [ ] Existing system constraints are respected.
- [ ] Speculative scalability is controlled.

## Evaluation

- [ ] Risk/feasibility/trade-offs converge toward decisions.
- [ ] False balance is avoided.
- [ ] Reversibility affects rigor.
- [ ] Reversal conditions exist where useful.

## Execution

- [ ] Analysis/plan-only boundaries are respected.
- [ ] Routine autonomy is allowed.
- [ ] Verification matches claims.
- [ ] Recovery routes to earliest invalid reasoning owner.

---

# 26. Definition of Success

The ecosystem succeeds if, compared with a baseline agent:

## Before

```text
jumps to solutions
asks unnecessary questions
confuses assumptions with facts
uses generic best practices
brainstorms and critiques simultaneously
over-engineers
lists options without choosing
reopens settled decisions
patches symptoms
claims completion without sufficient proof
keeps thinking after the decision is clear
```

## After

```text
nexload-reasoning
routes only when needed

nexload-reasoning-discovery
ensures the right problem is understood

nexload-reasoning-investigation
builds evidence-based causal understanding

nexload-reasoning-ideation
opens the solution space without premature judgment

nexload-reasoning-design
creates coherent, bounded, minimal systems

nexload-reasoning-evaluation
stress-tests and selects a justified direction

nexload-reasoning-execution
turns the decision into a verified result and recovers intelligently
```

Crucially:

> The ecosystem should improve quality **without requiring all seven skills for ordinary work**.

---

# 27. Consolidated Research Index

## Standards / Skill Engineering

- Agent Skills Specification  
  https://agentskills.io/specification
- Agent Skills Evaluation Guide  
  https://agentskills.io/skill-creation/evaluating-skills
- Agent Skills Client Implementation  
  https://agentskills.io/client-implementation/adding-skills-support

## General Reasoning / Routing

- Thinking Model Router  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-model-router
- CC Thinking Skills  
  https://github.com/tjboudreaux/cc-thinking-skills
- Metacognition  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-cognition-metacognition
- Circle of Competence  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-circle-of-competence
- First Principles  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-first-principles
- Via Negativa  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-via-negativa

## Discovery

- Problem Framing Canvas  
  https://www.skills.sh/deanpeters/product-manager-skills/problem-framing-canvas
- Problem Statement  
  https://www.skills.sh/deanpeters/product-manager-skills/problem-statement
- Intent Explorer  
  https://www.skills.sh/fimoklei/pm-ai-playbook/intent-explorer
- Assumption Excavator  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity-assumption-excavator
- Jobs to Be Done  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-jobs-to-be-done
- Consider All Factors  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity-consider-factors
- Wayfinder  
  https://www.skills.sh/mattpocock/skills/wayfinder

## Investigation

- Systematic Debugging  
  https://www.skills.sh/obra/superpowers/systematic-debugging
- Diagnose  
  https://www.skills.sh/mattpocock/skills/diagnose
- Diagnosing Bugs  
  https://www.skills.sh/mattpocock/skills/diagnosing-bugs
- Root Cause Tracing  
  https://www.skills.sh/fimoklei/pm-ai-playbook/root-cause-tracing
- S4H Investigation  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-investigation
- Evidence Audit  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-investigation-evidence-audit
- Counter-Hypothesis  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-investigation-counter-hypothesis
- Source Trace  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-investigation-source-trace
- Triangulation  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-investigation-triangulation
- Claim Decomposition  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-investigation-claim-decomposition
- OODA  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-ooda
- Kepner-Tregoe  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-kepner-tregoe

## Ideation

- Superpowers Brainstorming  
  https://www.skills.sh/obra/superpowers/brainstorming
- S4H Creativity  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity
- Alternatives  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity-alternatives
- Concept Fan  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity-concept-fan
- Lateral Thinking  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity-lateral-thinking
- Six Hats  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity-six-hats
- Collision-Zone Thinking  
  https://www.skills.sh/fimoklei/pm-ai-playbook/collision-zone-thinking
- Cross-Pollination Engine  
  https://www.skills.sh/fimoklei/pm-ai-playbook/cross-pollination-engine
- When Stuck  
  https://www.skills.sh/fimoklei/pm-ai-playbook/when-stuck
- TRIZ  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-triz
- Analogy  
  https://www.skills.sh/human-avatar/skills-for-humanity/analogy

## Design

- Improve Codebase Architecture — Matt Pocock  
  https://www.skills.sh/mattpocock/skills/improve-codebase-architecture
- Improve Codebase Architecture — fimoklei  
  https://www.skills.sh/fimoklei/pm-ai-playbook/improve-codebase-architecture
- Design an Interface  
  https://www.skills.sh/mattpocock/skills/design-an-interface
- Matt Pocock Skills Catalog  
  https://www.skills.sh/mattpocock/skills
- Thought Experiment  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-thought-experiment
- Simplification Cascades  
  https://www.skills.sh/fimoklei/pm-ai-playbook/simplification-cascades

## Evaluation

- Idea Challenger  
  https://www.skills.sh/fimoklei/pm-ai-playbook/idea-challenger
- The Challenger  
  https://www.skills.sh/fimoklei/pm-ai-playbook/the-challenger
- Thinking Pre-Mortem  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-pre-mortem
- Pre-Mortem Analyst  
  https://www.skills.sh/fimoklei/pm-ai-playbook/pre-mortem-analyst
- Second-Order Thinking  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-second-order
- Decision Criteria Weighting  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-decision-criteria-weighting
- Plus Minus Interesting  
  https://www.skills.sh/human-avatar/skills-for-humanity/s4h-creativity-plus-minus-interesting
- Margin of Safety  
  https://www.skills.sh/tjboudreaux/cc-thinking-skills/thinking-margin-of-safety

## Execution

- Writing Plans  
  https://www.skills.sh/obra/superpowers/writing-plans
- Executing Plans  
  https://www.skills.sh/obra/superpowers/executing-plans
- Verification Before Completion  
  https://www.skills.sh/obra/superpowers/verification-before-completion
- Implement Spec  
  https://www.skills.sh/mattpocock/skills/implement-spec
- Handoff  
  https://www.skills.sh/mattpocock/skills/handoff

---

# 28. Final Architectural Statement

The Nexload reasoning ecosystem should be understood as:

```text
nexload-reasoning
= decide what kind of thinking is needed

nexload-reasoning-discovery
= make sure we are solving the right problem

nexload-reasoning-investigation
= make sure our model of reality is supported

nexload-reasoning-ideation
= make sure we explored materially different possibilities

nexload-reasoning-design
= make the candidate solution coherent

nexload-reasoning-evaluation
= make the choice survive feasibility, risk, complexity, and trade-off scrutiny

nexload-reasoning-execution
= make the approved choice real, prove it works, and route failures back to the correct reasoning owner
```

The most important architecture constraint is:

> **Specialization must reduce reasoning ambiguity, not merely move the same generic instructions into seven directories.**

The second most important constraint is:

> **A specialist may be deep, but its ownership must remain narrow.**

The third is:

> **The ecosystem is a graph, not a pipeline.**

And the fourth:

> **The best skill is sometimes no additional skill at all.**

