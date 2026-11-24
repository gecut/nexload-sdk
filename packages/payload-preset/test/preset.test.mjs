import assert from 'node:assert/strict';
import { test } from 'node:test';

import { moneyField } from '@nexload-sdk/payload-fields';

import { nexloadPreset } from '../dist/index.js';

test('enables all capabilities and supports disabling each', () => {
  assert.equal(nexloadPreset().length, 4);
  assert.deepEqual(nexloadPreset({ persian: false, logger: false, fields: false, audit: false }), []);
});

test('passes options and orders plugins after late collections', () => {
  const late = (config) => ({ ...config, collections: [{ slug: 'late-posts', fields: [moneyField({ name: 'price', currency: 'IRT' })] }] });
  const plugins = [...nexloadPreset({ fields: { slugGenerators: {} }, audit: { collections: ['late-posts'], operations: ['delete'] } }), late];
  const config = plugins.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).reduce((c, plugin) => plugin(c), {});
  const hooks = config.collections[0].hooks;
  assert.ok(hooks.beforeOperation);
  assert.ok(hooks.afterDelete);
  assert.equal(hooks.afterChange, undefined);
  assert.deepEqual(plugins.map((p) => p.order ?? 0), [0, 0, 0, 900, 1000]);
});
