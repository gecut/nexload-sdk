import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeIranMobile, validateIranMobile } from '@nexload-sdk/persian/mobile';
import { createValidatedTextField } from '../dist/internal/validated-text.js';
import { messages, resolveLanguage } from '../dist/i18n/messages.js';

const options = { name: 'phone', kind: 'mobile', label: { fa: 'همراه', en: 'Mobile' }, normalize: normalizeIranMobile, validate: validateIranMobile, messagePrefix: 'mobile' };
test('normalizes in beforeValidate and keeps invalid raw', async () => {
  const field = createValidatedTextField(options);
  const hook = field.hooks.beforeValidate.at(-1);
  assert.equal(await hook({ value: '+98 912 345 6789' }), '09123456789');
  assert.equal(await hook({ value: 'abc' }), 'abc');
  assert.equal(field.validate('abc', { req: { i18n: { language: 'fa' }, payload: { config: {} }, t: (key) => key } }), 'شماره همراه معتبر نیست.');
  assert.equal(field.validate('abc', { req: { i18n: { language: 'en' } } }), messages.en['mobile.invalid']);
  assert.equal(field.validate('09123456789', { req: { i18n: { language: 'fa' }, payload: { config: {} }, t: (key) => key } }), true);
  assert.equal(field.admin.rtl, false);
});
test('protected keys', () => {
  assert.throws(() => createValidatedTextField({ ...options, overrides: { name: 'other' } }));
  assert.throws(() => createValidatedTextField({ ...options, overrides: { type: 'number' } }));
});
test('resolveLanguage', () => {
  assert.equal(resolveLanguage('fa-IR'), 'fa'); assert.equal(resolveLanguage(undefined), 'en'); assert.equal(resolveLanguage('de'), 'en');
});

test('whitespace is empty and unknown errors have a fallback', () => {
  const args = { req: { i18n: { language: 'fa' }, payload: { config: {} }, t: (key) => key } };
  assert.equal(createValidatedTextField(options).validate('   ', args), true);
  assert.equal(createValidatedTextField({ ...options, required: true }).validate('   ', args), messages.fa.required);
  const field = createValidatedTextField({ ...options, validate: () => ({ ok: false, reason: 'unknown' }) });
  assert.equal(field.validate('bad', args), messages.fa.invalid);
});
