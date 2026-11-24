import assert from 'node:assert/strict';
import test from 'node:test';
import { slugField } from '../dist/slug/index.js';

test('suffixes collisions and preserves request context', async () => {
  const [slug] = slugField({ source: 'title' });
  const taken = new Set(['ketab', 'ketab-2']);
  const calls = [];
  const req = { locale: 'fa', i18n: { language: 'fa' }, payload: { find: async (args) => { calls.push(args); return { docs: taken.has(args.where.and[0].slug.equals) ? [{}] : [] }; } } };
  assert.equal(await slug.hooks.beforeValidate.at(-1)({ operation: 'update', originalDoc: { id: 7 }, data: { title: 'ketab' }, siblingData: {}, req, collection: { slug: 'posts' }, path: 'slug' }), 'ketab-3');
  assert.equal(calls[0].locale, 'fa');
  assert.equal(calls[0].req, req);
  assert.deepEqual(calls[0].where.and[1], { id: { not_equals: 7 } });
});
test('unique false skips query', async () => {
  const [slug] = slugField({ unique: false });
  assert.equal(slug.unique, false);
  assert.equal(await slug.hooks.beforeValidate.at(-1)({ operation: 'create', data: { title: 'ketab' }, siblingData: {}, req: { payload: { find: () => { throw Error('unexpected'); } } }, collection: { slug: 'posts' } }), 'ketab');
});
test('nested slugs skip collision query', async () => {
  const [slug] = slugField();
  const result = await slug.hooks.beforeValidate.at(-1)({ operation: 'create', data: { title: 'ketab' }, siblingData: {}, path: ['group', 'slug'], req: { payload: { find: () => { throw Error('unexpected'); } } }, collection: { slug: 'posts' } });
  assert.equal(result, 'ketab');
});
