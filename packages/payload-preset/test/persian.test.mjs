import assert from 'node:assert/strict';
import { test } from 'node:test';

import { persianPlugin } from '../dist/index.js';

const apply = (config = {}) => persianPlugin()(config);
const utc = [{ label: 'UTC', value: 'UTC' }];
const zones = (config) => typeof config.admin.timezones.supportedTimezones === 'function'
  ? config.admin.timezones.supportedTimezones({ defaultTimezones: utc })
  : config.admin.timezones.supportedTimezones;

test('adds languages and defaults without creating localization', () => {
  const result = apply();
  assert.ok(result.i18n.supportedLanguages.en);
  assert.ok(result.i18n.supportedLanguages.fa);
  assert.equal(result.i18n.fallbackLanguage, 'fa');
  assert.equal(result.localization, undefined);
  assert.equal(result.admin.timezones.defaultTimezone, 'Asia/Tehran');
  assert.deepEqual(zones(result), [...utc, { label: 'تهران', value: 'Asia/Tehran' }]);
});

test('preserves host languages, fallback, locales, fields and input', () => {
  const fa = { custom: true };
  const config = { i18n: { supportedLanguages: { en: { host: true }, fa, de: {} }, fallbackLanguage: 'en' }, localization: { locales: [{ code: 'fa', label: 'Persian' }, { code: 'fa', label: 'Other', rtl: false }], defaultLocale: 'en' }, collections: [{ slug: 'posts', fields: [{ name: 'x', type: 'text' }] }], admin: { timezones: { defaultTimezone: 'UTC', supportedTimezones: utc } } };
  const before = JSON.parse(JSON.stringify(config));
  const result = apply(config);
  assert.deepEqual(config, before);
  assert.equal(result.i18n.supportedLanguages.fa, fa);
  assert.equal(result.i18n.supportedLanguages.en, config.i18n.supportedLanguages.en);
  assert.ok(result.i18n.supportedLanguages.de);
  assert.equal(result.i18n.fallbackLanguage, 'en');
  assert.deepEqual(result.localization.locales, [{ code: 'fa', label: 'Persian', rtl: true }, { code: 'fa', label: 'Other', rtl: false }]);
  assert.equal(result.collections[0].fields, config.collections[0].fields);
  assert.equal(result.admin.timezones.defaultTimezone, 'UTC');
  assert.equal(zones(result).filter((z) => z.value === 'Asia/Tehran').length, 1);
});

test('leaves string locales unchanged', () => {
  const locales = ['fa', 'en'];
  assert.equal(apply({ localization: { locales, defaultLocale: 'fa' } }).localization.locales, locales);
});

test('wraps host timezone functions and avoids duplicate Tehran', () => {
  const existing = { label: 'host', value: 'Asia/Tehran' };
  const result = apply({ admin: { timezones: { supportedTimezones: ({ defaultTimezones }) => [...defaultTimezones, existing] } } });
  assert.deepEqual(zones(result), [...utc, existing]);
});
