import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { defineEntity } from '@nexload-sdk/payload-schema';
import { payloadFields } from '@nexload-sdk/payload-schema/payload';
import { schemaFields } from '../dist/schema/index.js';

test('schema adapter builds entity fields', () => {
  const entity = defineEntity({ name: 'Customer', fields: {
    mobile: schemaFields.iranMobile(), nationalCode: schemaFields.nationalCode(),
    postalCode: schemaFields.postalCode({ nullable: true }), credit: schemaFields.money({ currency: 'IRT' }),
    birthDate: schemaFields.jalaliDate(), order: schemaFields.sortOrder(), ...schemaFields.slug(),
  } });
  const fields = payloadFields(entity).all();
  assert.deepEqual(fields.map((field) => field.name), ['mobile', 'nationalCode', 'postalCode', 'credit', 'birthDate', 'order', 'slug', 'slugLock']);
  assert.equal(fields[0].required, true);
  assert.equal(fields[2].required, false);
  const schema = entity.schema(({ pick }) => pick(['mobile', 'nationalCode', 'postalCode', 'credit', 'birthDate', 'order', 'slug', 'slugLock']));
  const parsed = schema.parse({ mobile: '+98 912 345 6789', nationalCode: '۰۴۹۹-۳۷۰-۸۹۹', postalCode: '۱۹۹۱۹-۱۳۵۴۱', credit: 123456, birthDate: '2025-09-24T08:30:00.000Z', order: 0, slug: 'ketab', slugLock: false });
  assert.equal(parsed.mobile, '09123456789');
  assert.equal(parsed.nationalCode, '0499370899');
  assert.equal(parsed.postalCode, '1991913541');
  assert.equal(parsed.credit, 123456);
  assert.equal(parsed.birthDate, '2025-09-24T08:30:00.000Z');
  assert.equal(schema.safeParse({ ...parsed, credit: -1 }).success, false);
});

test('root and admin outputs never import optional peers', () => {
  const files = ['../dist/index.js', ...readdirSync(new URL('../dist/admin/', import.meta.url)).filter((name) => name.endsWith('.js')).map((name) => `../dist/admin/${name}`)];
  for (const file of files) assert.doesNotMatch(readFileSync(new URL(file, import.meta.url), 'utf8'), /(?:@nexload-sdk\/payload-schema|["']zod["'])/);
});

test('money schema enforces safe integers, configured bounds, and negative policy', () => {
  const bounded = schemaFields.money({ currency: 'IRT', allowNegative: true, minMinorUnits: -5, maxMinorUnits: 10 }).schema;
  for (const value of [-5, 0, 10]) assert.equal(bounded.safeParse(value).success, true);
  for (const value of [-6, 11, 1.5, Number.MAX_SAFE_INTEGER + 1]) assert.equal(bounded.safeParse(value).success, false);
  assert.equal(schemaFields.money({ currency: 'IRT' }).schema.safeParse(-1).success, false);
});

test('slug schema produces canonical slug and rejects empty output', () => {
  const schema = schemaFields.slug().slug.schema;
  assert.equal(schema.parse('  كِتاب_جدید 😀 ۱۲ '), 'کتاب-جدید-12');
  assert.equal(schema.safeParse(' 😀 ').success, false);
});

test('required follows nullability even when overrides try to change it', () => {
  const entity = defineEntity({ name: 'Required', fields: {
    mobile: schemaFields.iranMobile({ overrides: { required: false } }),
    optional: schemaFields.iranMobile({ nullable: true, overrides: { required: true } }),
    order: schemaFields.sortOrder({ overrides: { required: false } }),
    money: schemaFields.money({ currency: 'IRT', nullable: true, overrides: { required: true } }),
    date: schemaFields.jalaliDate({ overrides: { required: false } }),
  } });
  assert.deepEqual(payloadFields(entity).all().map((item) => item.required), [true, false, true, false, true]);
  assert.equal(schemaFields.iranMobile().schema.safeParse(null).success, false);
  assert.equal(schemaFields.iranMobile({ nullable: true }).schema.safeParse(null).success, true);
});


test('declarations infer nullable output and reject required options', () => {
  const directory = mkdtempSync(join(tmpdir(), 'payload-fields-schema-types-'));
  const source = join(directory, 'schema.mts');
  const modulePath = fileURLToPath(new URL('../dist/schema/index.js', import.meta.url)).replaceAll('\\', '/');
  writeFileSync(source, `
import { schemaFields } from "${modulePath}";
type Output<T extends { schema: { _output: unknown } }> = T["schema"]["_output"];
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
const text = schemaFields.iranMobile();
const nullableText = schemaFields.iranMobile({ nullable: true });
const number = schemaFields.money({ currency: "IRT" });
const nullableNumber = schemaFields.sortOrder({ nullable: true });
const date = schemaFields.jalaliDate();
const nullableDate = schemaFields.jalaliDate({ nullable: true });
const slug = schemaFields.slug().slug;
type Checks = [Assert<Equal<Output<typeof text>, string>>, Assert<Equal<Output<typeof nullableText>, string | null>>,
  Assert<Equal<Output<typeof number>, number>>, Assert<Equal<Output<typeof nullableNumber>, number | null>>,
  Assert<Equal<Output<typeof date>, string>>, Assert<Equal<Output<typeof nullableDate>, string | null>>,
  Assert<Equal<Output<typeof slug>, string>>];
// @ts-expect-error required is determined by nullable
schemaFields.iranMobile({ required: false });
// @ts-expect-error overrides cannot set required
schemaFields.iranMobile({ overrides: { required: false } });
// @ts-expect-error required is determined by nullable
schemaFields.money({ currency: "IRT", required: false });
`);
  try {
    const result = spawnSync('pnpm', ['exec', 'tsc', '--noEmit', '--strict', '--skipLibCheck', '--module', 'ESNext', '--moduleResolution', 'bundler', '--target', 'ES2022', source], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stdout + result.stderr);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
