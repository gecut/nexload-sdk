# Package fixture: proposed factory change

A contributor proposes `src/email.ts` with its own registry and exports `compileEmailField` as a new runtime root value. It calls private Zod metadata to detect async refinements. Tests import the new source file directly.

Requested behavior: add an email-like canonical string factory while keeping the current package architecture and runtime root exports.

Review task: reject or reshape the proposal, state the existing seams to extend, define public runtime/type tests first, and identify docs/release-impact work.
