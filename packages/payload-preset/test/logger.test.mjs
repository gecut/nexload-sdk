import assert from 'node:assert/strict';
import { test } from 'node:test';

import { configureLogger } from '@nexload-sdk/logger';

import { payloadLoggerPlugin } from '../dist/index.js';

test('sets config.logger when unset', () => {
  const plugin = payloadLoggerPlugin();
  const destination = { write() {} };
  configureLogger({ service: 'cms-test', destination });

  const result = plugin({});

  assert.ok(result.logger);
  assert.equal(result.logger.options.base.service, 'cms-test');
  assert.equal(result.logger.destination, destination);
});

test('keeps host config.logger', () => {
  const plugin = payloadLoggerPlugin();
  const hostLogger = { custom: true };
  const config = { logger: hostLogger };
  const result = plugin(config);

  assert.equal(result, config);
  assert.equal(result.logger, hostLogger);
});
