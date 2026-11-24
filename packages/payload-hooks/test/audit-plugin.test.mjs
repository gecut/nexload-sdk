import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createTestLogger } from '@nexload-sdk/logger/testing';

import * as api from '../dist/index.mjs';

const config = () => ({ collections: [{ slug: 'posts', fields: [{ name: 'title', type: 'text' }] }, { slug: 'users', auth: true, fields: [] }] });
const setup = (options = {}) => { const capture = createTestLogger(); const result = api.auditPlugin({ logger: capture.logger, ...options })(config());

 return { ...capture, collections: result.collections }; };
const args = (extra = {}) => ({ collection: { slug: 'posts' }, req: {}, doc: { id: 7 }, operation: 'update', ...extra });
const entry = entries => { const { event, collection, operation, id, userId, count } = entries[0];

 return Object.fromEntries(Object.entries({ event, collection, operation, id, userId, count }).filter(([, value]) => value !== undefined)); };

test('adds afterChange and afterDelete to every collection by default', () => { for (const c of setup().collections) { assert.equal(c.hooks.afterChange.length, 1); assert.equal(c.hooks.afterDelete.length, 1); } });
test('does not add read auditing unless operations includes read', () => { assert.equal(setup().collections[0].hooks.afterOperation, undefined); assert.equal(setup({ operations: ['read'] }).collections[0].hooks.afterOperation.length, 1); });
test('adds afterOperation only to auth collections when only auth is enabled', () => { const [posts, users] = setup({ operations: ['auth'] }).collections; assert.equal(posts.hooks?.afterOperation, undefined); assert.equal(users.hooks.afterOperation.length, 1); });
test('respects collections list and exclude', () => { const [posts, users] = setup({ collections: ['posts', 'users'], exclude: ['users'] }).collections; assert.ok(posts.hooks.afterChange); assert.equal(users.hooks, undefined); });
test('throws on unknown collection slug in collections or exclude', () => { for (const opts of [{ collections: ['missing'] }, { exclude: ['missing'] }]) assert.throws(() => setup(opts), /auditPlugin: unknown collection "missing"/); });
test('appends after existing hooks and keeps them', () => { const host = () => {}; const c = config(); c.collections[0].hooks = { afterChange: [host], beforeChange: [host] }; const hooks = api.auditPlugin()(c).collections[0].hooks; assert.equal(hooks.afterChange[0], host); assert.equal(hooks.afterChange.length, 2); assert.deepEqual(hooks.beforeChange, [host]); });
test('skips afterChange when operation is not enabled', () => { const s = setup({ operations: ['create'] }); s.collections[0].hooks.afterChange[0](args()); assert.equal(s.entries.length, 0); });
test('logs event, collection, operation, id and userId', () => { const s = setup(); s.collections[0].hooks.afterChange[0](args({ req: { user: { id: 3 } } })); assert.deepEqual(entry(s.entries), { event: 'payload.document.updated', collection: 'posts', operation: 'update', id: 7, userId: 3 }); });
test('omits userId when there is no user', () => { const s = setup(); s.collections[0].hooks.afterChange[0](args()); assert.equal('userId' in s.entries[0], false); });
test('logs one listed event per find with count, not ids', () => { const s = setup({ operations: ['read'] }); s.collections[0].hooks.afterOperation[0](args({ operation: 'find', result: { docs: [{ id: 1 }, { id: 2 }] } })); assert.equal(s.entries.length, 1); assert.deepEqual(entry(s.entries), { event: 'payload.documents.listed', collection: 'posts', operation: 'find', count: 2 }); });
test('logs read event for findByID', () => { const s = setup({ operations: ['read'] }); s.collections[0].hooks.afterOperation[0](args({ operation: 'findByID', result: { id: 9 } })); assert.deepEqual(entry(s.entries), { event: 'payload.document.read', collection: 'posts', operation: 'findByID', id: 9 }); });
test('logs logged_in with userId from result.user', () => { const s = setup(); s.collections[1].hooks.afterOperation[0](args({ collection: { slug: 'users', auth: true }, operation: 'login', result: { user: { id: 3 } } })); assert.deepEqual(entry(s.entries), { event: 'payload.auth.logged_in', collection: 'users', operation: 'login', userId: 3 }); });
test('logs password_reset_requested without email', () => { const s = setup(); s.collections[1].hooks.afterOperation[0](args({ collection: { slug: 'users', auth: true }, operation: 'forgotPassword', args: { data: { email: 'secret@example.com' } }, result: true })); assert.equal(s.entries[0].event, 'payload.auth.password_reset_requested'); assert.equal(JSON.stringify(s.entries).includes('secret@example.com'), false); });
test('afterOperation returns result unchanged for every operation including ignored ones', () => { const s = setup({ operations: ['read', 'auth'] }); const hook = s.collections[1].hooks.afterOperation[0];

 for (const operation of ['find', 'findByID', 'login', 'forgotPassword', 'resetPassword', 'read', 'update']) { const result = { docs: [], user: { id: 1 }, id: 2 }; assert.equal(hook(args({ operation, result })), result); } });
test('returns doc and swallows logger errors including afterOperation', () => { const s = setup({ operations: ['create', 'delete', 'read'], logger: { info() { throw new Error('failure'); } } }); const doc = { id: 1 }; const h = s.collections[0].hooks; assert.equal(h.afterChange[0](args({ operation: 'create', doc })), doc); assert.equal(h.afterDelete[0](args({ doc })), doc); const result = { docs: [] }; assert.equal(h.afterOperation[0](args({ operation: 'find', result })), result); });
test('does not touch collection fields', () => { const c = config(); const before = JSON.parse(JSON.stringify(c.collections.map(x => x.fields))); const out = api.auditPlugin()(c); assert.deepEqual(out.collections.map(x => x.fields), before); });
test('sets order and slug on the plugin', () => { const p = api.auditPlugin(); assert.equal(p.order, 1000); assert.equal(p.slug, 'nexload-audit'); assert.equal(api.AUDIT_PLUGIN_ORDER, 1000); });
test('logOperation is still exported', () => assert.equal(typeof api.logOperation, 'function'));
test('logs password reset without sensitive fields', () => { const s = setup(); s.collections[1].hooks.afterOperation[0](args({ collection: { slug: 'users', auth: true }, operation: 'resetPassword', result: { user: { id: 5, email: 'secret@example.com' } } })); assert.equal(s.entries[0].event, 'payload.auth.password_reset'); assert.equal(s.entries[0].userId, 5); assert.equal(JSON.stringify(s.entries).includes('secret@example.com'), false); });
