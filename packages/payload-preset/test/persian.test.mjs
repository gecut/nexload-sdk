import assert from 'node:assert/strict';
import { test } from 'node:test';

import { persianPlugin } from '../dist/index.js';

const apply = (config = {}) => persianPlugin()(config);
const utc = [{ label: 'UTC', value: 'UTC' }];

test('adds fa and keeps en when host has no i18n', () => {
  const result = apply({});

  assert.ok(result.i18n.supportedLanguages.en);
  assert.ok(result.i18n.supportedLanguages.fa);
});

test('keeps host languages and host fa object', () => {
  const customFa = { custom: true };
  const hostLanguages = {
    en: { host: true },
    fa: customFa,
    de: { german: true },
  };
  const result = apply({
    i18n: { supportedLanguages: hostLanguages },
  });

  assert.equal(result.i18n.supportedLanguages.fa, customFa);
  assert.equal(result.i18n.supportedLanguages.en, hostLanguages.en);
  assert.equal(result.i18n.supportedLanguages.de, hostLanguages.de);
});

test('does not override host fallbackLanguage', () => {
  const result = apply({
    i18n: { fallbackLanguage: 'en' },
  });

  assert.equal(result.i18n.fallbackLanguage, 'en');
});

test('sets fallbackLanguage fa when host has none', () => {
  const result = apply({});

  assert.equal(result.i18n.fallbackLanguage, 'fa');
});

test('does not create localization when host has none', () => {
  const result = apply({});

  assert.equal(result.localization, undefined);
});

test('never adds a locale', () => {
  const hostLocales = [{ code: 'en', label: 'English' }];
  const result = apply({
    localization: {
      locales: hostLocales,
      defaultLocale: 'en',
    },
  });

  assert.deepEqual(result.localization.locales, [{ code: 'en', label: 'English' }]);
});

test('sets rtl on existing fa locale object, keeps explicit rtl false', () => {
  const locales = [
    { code: 'fa', label: 'Persian' },
    { code: 'fa', label: 'Other', rtl: false },
  ];
  const result = apply({
    localization: {
      locales,
      defaultLocale: 'fa',
    },
  });

  assert.deepEqual(result.localization.locales, [
    { code: 'fa', label: 'Persian', rtl: true },
    { code: 'fa', label: 'Other', rtl: false },
  ]);

  const mixed = ['en', { code: 'fa', label: 'فارسی' }];
  const mixedResult = apply({
    localization: {
      locales: mixed,
      defaultLocale: 'en',
    },
  });

  assert.deepEqual(mixedResult.localization.locales, [
    'en',
    { code: 'fa', label: 'فارسی', rtl: true },
  ]);
});

test('leaves string-form locales untouched', () => {
  const locales = ['fa', 'en'];
  const result = apply({
    localization: {
      locales,
      defaultLocale: 'fa',
    },
  });

  assert.deepEqual(result.localization.locales, ['fa', 'en']);
});

test('sets default timezone only when host has none', () => {
  const withoutTz = apply({});
  assert.equal(withoutTz.admin.timezones.defaultTimezone, 'Asia/Tehran');

  const withTz = apply({
    admin: { timezones: { defaultTimezone: 'UTC' } },
  });
  assert.equal(withTz.admin.timezones.defaultTimezone, 'UTC');
});

test('adds Asia/Tehran to supportedTimezones array', () => {
  const result = apply({
    admin: {
      timezones: { supportedTimezones: utc },
    },
  });

  assert.deepEqual(result.admin.timezones.supportedTimezones, [
    ...utc,
    { label: 'تهران', value: 'Asia/Tehran' },
  ]);

  const withTehranAlready = apply({
    admin: {
      timezones: {
        supportedTimezones: [
          ...utc,
          { label: 'Tehran', value: 'Asia/Tehran' },
        ],
      },
    },
  });

  assert.equal(
    withTehranAlready.admin.timezones.supportedTimezones.filter(
      (z) => z.value === 'Asia/Tehran',
    ).length,
    1,
  );
});

test('wraps function form', () => {
  const existing = { label: 'host', value: 'Asia/Tehran' };
  const result = apply({
    admin: {
      timezones: {
        supportedTimezones: ({ defaultTimezones }) => [...defaultTimezones, existing],
      },
    },
  });

  assert.equal(typeof result.admin.timezones.supportedTimezones, 'function');
  const zones = result.admin.timezones.supportedTimezones({ defaultTimezones: utc });
  assert.deepEqual(zones, [...utc, existing]);
});

test('creates function when unset', () => {
  const result = apply({});

  assert.equal(typeof result.admin.timezones.supportedTimezones, 'function');
  const zonesWithArgs = result.admin.timezones.supportedTimezones({ defaultTimezones: utc });
  assert.ok(zonesWithArgs.some((z) => z.value === 'Asia/Tehran'));

  const zonesWithoutArgs = result.admin.timezones.supportedTimezones();
  assert.ok(zonesWithoutArgs.some((z) => z.value === 'Asia/Tehran'));
});

test('does not mutate input config', () => {
  const config = {
    i18n: {
      supportedLanguages: { en: { host: true } },
      fallbackLanguage: 'en',
    },
    localization: {
      locales: [{ code: 'fa', label: 'Persian' }],
      defaultLocale: 'fa',
    },
    admin: {
      timezones: {
        defaultTimezone: 'UTC',
        supportedTimezones: utc,
      },
    },
  };
  const snapshot = JSON.parse(JSON.stringify(config));
  apply(config);

  assert.deepEqual(config, snapshot);
});

test('does not touch collection fields', () => {
  const fields = [{ name: 'title', type: 'text' }];
  const config = {
    collections: [
      { slug: 'posts', fields },
    ],
  };
  const result = apply(config);

  assert.equal(result.collections[0].fields, fields);
});
