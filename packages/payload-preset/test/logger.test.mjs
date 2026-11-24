import assert from 'node:assert/strict';
import { test } from 'node:test';

import { configureLogger } from '@nexload-sdk/logger';

import { payloadLoggerPlugin } from '../dist/index.js';

test('reads SDK logger options at plugin execution and preserves the host logger', () => {
  const plugin = payloadLoggerPlugin();
  const destination = { write() {} };
  configureLogger({ service: 'cms', destination });

  const { logger } = plugin({});
  assert.equal(logger.options.base.service, 'cms');
  assert.equal(logger.destination, destination);

  const config = { logger: 'sync' };
  assert.equal(plugin(config), config);
});
