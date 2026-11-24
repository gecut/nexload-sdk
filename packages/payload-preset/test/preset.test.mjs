import assert from 'node:assert/strict';
import { test } from 'node:test';

import { moneyField } from '@nexload-sdk/payload-fields';

import { nexloadPreset } from '../dist/index.js';

test('enables persian, logger, fields and audit by default', () => {
  const plugins = nexloadPreset();
  assert.equal(plugins.length, 4);
});

test('omits disabled capabilities', () => {
  assert.equal(nexloadPreset({ persian: false }).length, 3);
  assert.equal(nexloadPreset({ logger: false }).length, 3);
  assert.equal(nexloadPreset({ fields: false }).length, 3);
  assert.equal(nexloadPreset({ audit: false }).length, 3);
  assert.deepEqual(
    nexloadPreset({
      persian: false,
      logger: false,
      fields: false,
      audit: false,
    }),
    [],
  );
});

test('passes fields and audit options through', () => {
  const customGenerator = async () => 'custom-slug';
  const plugins = nexloadPreset({
    fields: { slugGenerators: { custom: customGenerator } },
    audit: { collections: ['targeted'], operations: ['delete'] },
  });

  const baseConfig = {
    collections: [
      { slug: 'targeted', fields: [] },
      { slug: 'other', fields: [] },
    ],
  };

  const config = plugins.reduce((c, plugin) => plugin(c), baseConfig);

  // Proves fields options reached payloadFieldsPlugin:
  const endpoint = config.endpoints?.find((e) => e.path === '/payload-fields/generate-slug');
  assert.ok(endpoint, 'generate-slug endpoint should be registered');

  // Proves audit options took effect:
  const targeted = config.collections.find((c) => c.slug === 'targeted');
  const other = config.collections.find((c) => c.slug === 'other');
  assert.ok(targeted.hooks?.afterDelete, 'targeted collection gets afterDelete hook');
  assert.equal(targeted.hooks?.afterChange, undefined, 'targeted collection omits afterChange hook');
  assert.equal(other.hooks?.afterDelete, undefined, 'other collection is excluded from audit hooks');
  assert.equal(other.hooks?.afterChange, undefined, 'other collection is excluded from audit hooks');
});

test('collection added by a host plugin listed after the preset gets audit and field hooks', () => {
  const late = (config) => ({
    ...config,
    collections: [
      ...(config.collections ?? []),
      {
        slug: 'late-posts',
        fields: [moneyField({ name: 'price', currency: 'IRT' })],
      },
    ],
  });

  const presetPlugins = nexloadPreset();
  const allPlugins = [...presetPlugins, late];

  // Sort a COPY of the array by order
  const sorted = allPlugins.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const config = sorted.reduce((c, plugin) => plugin(c), {});

  const latePosts = config.collections?.find((c) => c.slug === 'late-posts');
  assert.ok(latePosts, 'late-posts collection must exist');
  assert.ok(
    latePosts.hooks?.afterChange,
    'late-posts must have audit afterChange hook',
  );
  assert.ok(
    latePosts.hooks?.beforeOperation,
    'late-posts must have fields beforeOperation hook',
  );
  assert.deepEqual(
    sorted.map((p) => p.order ?? 0),
    [0, 0, 0, 900, 1000],
  );
});
