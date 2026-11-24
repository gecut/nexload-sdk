import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createTestLogger } from '@nexload-sdk/logger/testing';

import * as api from '../dist/index.mjs';

const config = () => ({
  collections: [
    { slug: 'posts', fields: [{ name: 'title', type: 'text' }] },
    { slug: 'users', auth: true, fields: [] },
  ],
});

const setup = (options = {}) => {
  const capture = createTestLogger();
  const plugin = api.auditPlugin({ logger: capture.logger, ...options });
  const result = plugin(config());

  return { ...capture, collections: result.collections };
};

const args = (extra = {}) => ({
  collection: { slug: 'posts' },
  req: {},
  doc: { id: 7 },
  operation: 'update',
  ...extra,
});

const entry = (entries, index = 0) => {
  const IGNORED = new Set(['time', 'level', 'service', 'pid', 'msg']);

  return Object.fromEntries(
    Object.entries(entries[index]).filter(([key]) => !IGNORED.has(key)),
  );
};

test('adds afterChange and afterDelete to every collection by default', () => {
  // Arrange & Act
  const { collections } = setup();

  // Assert
  for (const collection of collections) {
    assert.equal(collection.hooks.afterChange.length, 1);
    assert.equal(collection.hooks.afterDelete.length, 1);
  }
});

test('does not add read auditing unless operations includes read', () => {
  // Arrange & Act
  const defaultCollections = setup().collections;
  const readCollections = setup({ operations: ['read'] }).collections;

  // Assert
  assert.equal(defaultCollections[0].hooks.afterOperation, undefined);
  assert.equal(readCollections[0].hooks.afterOperation.length, 1);
});

test('adds afterOperation only to auth collections when only auth is enabled', () => {
  // Arrange & Act
  const [posts, users] = setup({ operations: ['auth'] }).collections;

  // Assert
  assert.equal(posts.hooks?.afterOperation, undefined);
  assert.equal(users.hooks.afterOperation.length, 1);
});

test('respects collections list and exclude', () => {
  // Arrange & Act
  const [posts, users] = setup({
    collections: ['posts', 'users'],
    exclude: ['users'],
  }).collections;

  // Assert
  assert.ok(posts.hooks.afterChange);
  assert.equal(users.hooks, undefined);
});

test('throws on unknown collection slug in collections or exclude', () => {
  // Arrange
  const unknownCollections = [{ collections: ['missing'] }, { exclude: ['missing'] }];

  // Act & Assert
  for (const opts of unknownCollections) {
    assert.throws(
      () => setup(opts),
      /auditPlugin: unknown collection "missing"/,
    );
  }
});

test('appends after existing hooks and keeps them', () => {
  // Arrange
  const host = () => {};
  const c = config();
  c.collections[0].hooks = { afterChange: [host], beforeChange: [host] };

  // Act
  const hooks = api.auditPlugin()(c).collections[0].hooks;

  // Assert
  assert.equal(hooks.afterChange[0], host);
  assert.equal(hooks.afterChange.length, 2);
  assert.deepEqual(hooks.beforeChange, [host]);
});

test('skips afterChange when operation is not enabled', () => {
  // Arrange
  const s = setup({ operations: ['create'] });

  // Act
  s.collections[0].hooks.afterChange[0](args());

  // Assert
  assert.equal(s.entries.length, 0);
});

test('logs event, collection, operation, id and userId', () => {
  // Arrange
  const s = setup();

  // Act
  s.collections[0].hooks.afterChange[0](args({ req: { user: { id: 3 } } }));

  // Assert
  assert.deepStrictEqual(entry(s.entries), {
    event: 'payload.document.updated',
    collection: 'posts',
    operation: 'update',
    id: 7,
    userId: 3,
  });
});

test('omits userId when there is no user', () => {
  // Arrange
  const s = setup();

  // Act
  s.collections[0].hooks.afterChange[0](args());

  // Assert
  assert.equal('userId' in s.entries[0], false);
  assert.deepStrictEqual(entry(s.entries), {
    event: 'payload.document.updated',
    collection: 'posts',
    operation: 'update',
    id: 7,
  });
});

test('logs deleted document identifiers', () => {
  const s = setup();
  s.collections[0].hooks.afterDelete[0](args({ req: { user: { id: 3 } } }));

  assert.deepStrictEqual(entry(s.entries), {
    event: 'payload.document.deleted',
    collection: 'posts',
    operation: 'delete',
    id: 7,
    userId: 3,
  });
});

test('uses the operation id when the deleted document is undefined', () => {
  const s = setup();
  s.collections[0].hooks.afterDelete[0](args({ doc: undefined, id: 7 }));
  assert.equal(entry(s.entries).id, 7);
});

test('logs changes and deletions without a request', () => {
  const s = setup();
  s.collections[0].hooks.afterChange[0](args({ req: undefined }));
  s.collections[0].hooks.afterDelete[0](args({ req: undefined }));

  assert.equal(s.entries.length, 2);
  assert.equal('userId' in entry(s.entries, 0), false);
  assert.equal('userId' in entry(s.entries, 1), false);
});

test('logs one listed event per find with count, not ids', () => {
  // Arrange
  const s = setup({ operations: ['read'] });

  // Act
  s.collections[0].hooks.afterOperation[0](
    args({ operation: 'find', result: { docs: [{ id: 1 }, { id: 2 }] } }),
  );

  // Assert
  assert.equal(s.entries.length, 1);
  assert.deepStrictEqual(entry(s.entries), {
    event: 'payload.documents.listed',
    collection: 'posts',
    operation: 'find',
    count: 2,
  });
});

test('logs read event for findByID', () => {
  // Arrange
  const s = setup({ operations: ['read'] });

  // Act
  s.collections[0].hooks.afterOperation[0](
    args({ operation: 'findByID', result: { id: 9 } }),
  );

  // Assert
  assert.deepStrictEqual(entry(s.entries), {
    event: 'payload.document.read',
    collection: 'posts',
    operation: 'findByID',
    id: 9,
  });
});

test('logs logged_in with userId from result.user', () => {
  // Arrange
  const s = setup();

  // Act
  s.collections[1].hooks.afterOperation[0](
    args({
      collection: { slug: 'users', auth: true },
      operation: 'login',
      result: { user: { id: 3 } },
    }),
  );

  // Assert
  assert.deepStrictEqual(entry(s.entries), {
    event: 'payload.auth.logged_in',
    collection: 'users',
    operation: 'login',
    userId: 3,
  });
});

test('logs password_reset_requested without email', () => {
  // Arrange
  const s = setup();

  // Act
  s.collections[1].hooks.afterOperation[0](
    args({
      collection: { slug: 'users', auth: true },
      operation: 'forgotPassword',
      args: { data: { email: 'secret@example.com' } },
      result: true,
    }),
  );

  // Assert
  assert.equal(s.entries.length, 1);
  assert.deepStrictEqual(entry(s.entries), {
    event: 'payload.auth.password_reset_requested',
    collection: 'users',
    operation: 'forgotPassword',
  });
  assert.equal(JSON.stringify(s.entries).includes('secret@example.com'), false);
});

test('logs password reset without sensitive fields', () => {
  // Arrange
  const s = setup();

  // Act
  s.collections[1].hooks.afterOperation[0](
    args({
      collection: { slug: 'users', auth: true },
      operation: 'resetPassword',
      result: { user: { id: 5, email: 'secret@example.com' } },
    }),
  );

  // Assert
  assert.equal(s.entries.length, 1);
  assert.deepStrictEqual(entry(s.entries), {
    event: 'payload.auth.password_reset',
    collection: 'users',
    operation: 'resetPassword',
    userId: 5,
  });
  assert.equal(JSON.stringify(s.entries).includes('secret@example.com'), false);
});

test('afterOperation returns result unchanged for every operation including ignored ones', () => {
  // Arrange
  const s = setup({ operations: ['read', 'auth'] });
  const hook = s.collections[1].hooks.afterOperation[0];
  const operations = [
    'find',
    'findByID',
    'login',
    'forgotPassword',
    'resetPassword',
    'read',
    'update',
  ];

  // Act & Assert
  for (const operation of operations) {
    const result = { docs: [], user: { id: 1 }, id: 2 };
    assert.equal(hook(args({ operation, result })), result);
  }
});

test('returns doc and swallows logger errors including afterOperation', () => {
  // Arrange
  const s = setup({
    operations: ['create', 'delete', 'read'],
    logger: {
      info() {
        throw new Error('failure');
      },
    },
  });
  const doc = { id: 1 };
  const hooks = s.collections[0].hooks;

  // Act & Assert
  assert.equal(hooks.afterChange[0](args({ operation: 'create', doc })), doc);
  assert.equal(hooks.afterDelete[0](args({ doc })), doc);

  const result = { docs: [] };
  assert.equal(hooks.afterOperation[0](args({ operation: 'find', result })), result);
});

test('afterOperation with result: null and with result: {} for find → no throw, returns result', () => {
  // Arrange
  const s = setup({ operations: ['read'] });
  const hook = s.collections[0].hooks.afterOperation[0];

  // Act: result is null
  const nullResult = hook(args({ operation: 'find', result: null }));

  // Assert: null result
  assert.equal(nullResult, null);
  assert.deepStrictEqual(entry(s.entries, 0), {
    event: 'payload.documents.listed',
    collection: 'posts',
    operation: 'find',
    count: 0,
  });

  // Act: result is empty object
  const emptyResult = {};
  const returnedEmpty = hook(args({ operation: 'find', result: emptyResult }));

  // Assert: empty result
  assert.equal(returnedEmpty, emptyResult);
  assert.deepStrictEqual(entry(s.entries, 1), {
    event: 'payload.documents.listed',
    collection: 'posts',
    operation: 'find',
    count: 0,
  });
});

test('afterChange with doc lacking id → no throw, returns doc', () => {
  // Arrange
  const s = setup();
  const hook = s.collections[0].hooks.afterChange[0];
  const docWithoutId = { title: 'Untitled' };

  // Act
  const returnedDoc = hook(args({ doc: docWithoutId }));

  // Assert
  assert.equal(returnedDoc, docWithoutId);
  assert.equal(s.entries.length, 1);
  assert.deepStrictEqual(entry(s.entries), {
    event: 'payload.document.updated',
    collection: 'posts',
    operation: 'update',
  });
});

test('does not touch collection fields', () => {
  // Arrange
  const c = config();
  const before = JSON.parse(JSON.stringify(c.collections.map((x) => x.fields)));

  // Act
  const out = api.auditPlugin()(c);

  // Assert
  assert.deepStrictEqual(
    out.collections.map((x) => x.fields),
    before,
  );
});

test('sets order and slug on the plugin', () => {
  // Arrange & Act
  const p = api.auditPlugin();

  // Assert
  assert.equal(p.order, 1000);
  assert.equal(p.slug, 'nexload-audit');
  assert.equal(api.AUDIT_PLUGIN_ORDER, 1000);
});

test('logOperation is still exported', () => {
  // Assert
  assert.equal(typeof api.logOperation, 'function');
});
