# Test matrix

## Factory/configuration

- tuple contains text slug and checkbox lock with defaults;
- custom names/source/regeneration metadata;
- tuple is spread in a representative collection;
- localized slug forces localized lock;
- mismatched lock localization throws;
- protected name/type/Admin component paths remain authoritative;
- consumer hooks run before final package hook.

## Synchronization

- locked create from non-empty source;
- locked update regenerates only on source change;
- unchanged source preserves prior slug;
- `regenerateOnSourceChange: false` preserves prior slug;
- empty-string, null, and explicit undefined clearing preserve exact custom prior slug;
- unlocked manual string normalizes;
- dot-path source reads data/originalDoc correctly;
- nested Admin source and sibling lock paths match the intended form.

## Normalization

Cover Persian/Arabic letter variants, Persian/Arabic digits, diacritics, Unicode letters, whitespace/underscore, punctuation/emoji, repeated/edge hyphens, empty result, and Latin-case policy (currently preserved).

## Generator endpoint

- existing endpoints retained and collision reviewed;
- 401 unauthenticated before access callback;
- 403 false access;
- invalid JSON, null, primitive, missing/invalid fields => 400;
- inherited and unknown generator keys => 404;
- currentSlug/sourceValue/request context forwarded;
- success always final-normalized;
- callback throw/non-string output => structured 500;
- access callback rejection behavior explicitly covered if changed.

## Admin

Test locked read-only text, sibling lock toggle, generator disabled states, request URL/body, busy reset, non-2xx/malformed response feedback, read-only behavior, localization, and nested field paths. Add one real Payload Admin browser smoke after component tests.
