/* eslint-disable turbo/no-undeclared-env-vars -- Test production behavior. */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { configureLogger, logger } from '../dist/index.mjs';
import { createTestLogger } from '../dist/testing.mjs';

test('redacts defaults and headers but pins documented two-level limit', () => {
  const { logger: log, entries } = createTestLogger();
  log.info({ password: 'p', user: { token: 't', profile: { phone: '0912' } }, req: { headers: { authorization: 'Bearer x' } } });
  assert.equal(entries[0].password, '[REDACTED]');
  assert.equal(entries[0].user.token, '[REDACTED]');
  assert.equal(entries[0].user.profile.phone, '0912');
  assert.equal(entries[0].req.headers.authorization, '[REDACTED]');
});
test('custom paths extend or replace defaults', () => {
  for (const replaceDefaults of [false, true]) {
    const { logger: log, entries } = createTestLogger({ redact: { paths: ['nationalCode'], replaceDefaults } });
    log.info({ nationalCode: 'n', password: 'p' });
    assert.equal(entries[0].nationalCode, '[REDACTED]');
    assert.equal(entries[0].password, replaceDefaults ? 'p' : '[REDACTED]');
  }
});
test('serializes errors safely with bounded causes and messages', () => {
  const { logger: log, entries } = createTestLogger();
  const root = new Error('root', { cause: new Error('four', { cause: new Error('five') }) });
  log.error({ err: Object.assign(new Error('x'.repeat(501), { cause: root }), { code: 'PAYMENT_TIMEOUT' }) });
  const err = entries[0].err;
  assert.equal(err.type, 'Error'); assert.equal(err.message.length, 500); assert.equal(err.code, 'PAYMENT_TIMEOUT');
  assert.equal(err.cause.message, 'root'); assert.equal(err.cause.cause.cause, undefined);
  log.error({ err: Object.assign(new Error('bad'), { code: 'lower case!' }) });
  assert.equal(entries[1].err.code, undefined);
});
test('production omits stacks', () => {
  const previous = process.env.NODE_ENV; process.env.NODE_ENV = 'production';
  try { const { logger: log, entries } = createTestLogger(); log.error({ err: new Error('x') }); assert.equal(entries[0].err.stack, undefined); }
  finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
test('proxy serializes Error first and circular bindings do not throw', () => {
  const entries = []; configureLogger({ service: 's', force: true, destination: { write: line => entries.push(JSON.parse(line)) } });
  logger.error(new Error('boom')); assert.equal(entries[0].err.message, 'boom');
  const circular = {}; circular.self = circular; logger.info(circular); assert.equal(entries.length, 2);
});
