import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { buildConfig, getPayload } from 'payload';

import { configureLogger, withLogContext } from '@nexload-sdk/logger';
import { createTestLogger } from '@nexload-sdk/logger/testing';

import { nexloadPreset } from '../../dist/index.js';

test('SQLite audit and timezone validation', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'payload-preset-'));
  const logs = [];
  configureLogger({
    service: 'preset-sqlite',
    level: 'info',
    base: { component: 'integration' },
    redact: { paths: ['privateField'] },
    destination: { write: (line) => logs.push(JSON.parse(line)) },
  });

  try {
    for (const reads of [false, true]) {
    const capture = createTestLogger();
    let payload;

    try {
      const addCollection = (config) => ({ ...config, collections: [...(config.collections ?? []), { slug: 'orders', fields: [{ name: 'title', type: 'text' }] }] });
      const config = await buildConfig({
        collections: [{ slug: 'users', auth: true, fields: [] }],
        db: sqliteAdapter({ client: { url: `file:${path.join(dir, 'test.db')}` } }),
        secret: 'test-secret-must-be-at-least-32-chars-long!',
        plugins: [...nexloadPreset({ audit: { logger: capture.logger, ...(reads ? { operations: ['create', 'read'] } : {}) } }), addCollection],
      });
      assert.ok(config.i18n.supportedLanguages.fa);
      assert.ok(config.i18n.supportedLanguages.en);
      assert.ok(config.admin.timezones.supportedTimezones.some((zone) => zone.value === 'Asia/Tehran'));
      payload = await getPayload({ config, key: `preset-${reads}` });
      withLogContext({ requestId: `sqlite-${reads}` }, () => {
        payload.logger.debug({ event: 'payload.sqlite.filtered' }, 'Filtered by level');
        payload.logger.info({
          event: 'payload.sqlite.started',
          password: 'fixture-password',
          privateField: 'fixture-value',
          err: new Error('Fixture error'),
        }, 'Payload started');
      });
      const entry = logs.find((log) => log.requestId === `sqlite-${reads}`);
      assert.ok(entry);
      assert.equal(entry.event, 'payload.sqlite.started');
      assert.equal(entry.level, 'info');
      assert.equal(entry.service, 'preset-sqlite');
      assert.equal(entry.component, 'integration');
      assert.equal(entry.password, '[REDACTED]');
      assert.equal(entry.privateField, '[REDACTED]');
      assert.equal(entry.err.message, 'Fixture error');
      assert.equal(new Date(entry.time).toISOString(), entry.time);
      assert.ok(!logs.some((log) => log.event === 'payload.sqlite.filtered'));
      await payload.create({ collection: 'orders', data: { title: 'one' } });
      assert.equal(capture.entries.filter((e) => e.event === 'payload.document.created' && e.collection === 'orders').length, 1);
      if (reads) {
        await payload.find({ collection: 'orders' });
        assert.equal(capture.entries.filter((e) => e.event === 'payload.documents.listed' && e.collection === 'orders').length, 1);
      }
    } finally {
      await payload?.destroy?.();
    }
    }
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});
