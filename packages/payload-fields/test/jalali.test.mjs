import assert from "node:assert/strict";
import test from "node:test";

import { gregorianToJalali } from "@nexload-sdk/persian/date";
import { getDateLib } from "react-day-picker/persian";

import {
  jalaliDateField,
  jalaliDateRangeField,
  toStoredJalaliInstant,
  withJalaliTimestamps,
} from "../dist/date/index.js";
import { messages } from "../dist/i18n/messages.js";

const fa = { req: { i18n: { language: "fa" } } };

test("toStoredJalaliInstant is zone-stable", () => {
  assert.equal(toStoredJalaliInstant({ year: 1404, month: 7, day: 2 }, "dayOnly"), "2025-09-24T08:30:00.000Z");
  assert.equal(toStoredJalaliInstant({ year: 1404, month: 7, day: 20 }, "monthOnly"), "2025-09-23T08:30:00.000Z");
  assert.equal(toStoredJalaliInstant({ year: 1404, month: 7, day: 2, hour: 14, minute: 0 }, "dayAndTime"), "2025-09-24T10:30:00.000Z");
  assert.equal(toStoredJalaliInstant({ year: 1404, month: 7, day: 2 }, "dayOnly", "UTC"), "2025-09-24T12:00:00.000Z");
  assert.equal(toStoredJalaliInstant({ year: 1404, month: 7, day: 2 }, "dayOnly", "America/New_York"), "2025-09-24T16:00:00.000Z");
});

test("stores a picker-local day at Tehran noon on the first Jalali day of its month", () => {
  const selected = getDateLib().newDate(1403, 1, 15);
  const parts = gregorianToJalali(selected.getFullYear(), selected.getMonth() + 1, selected.getDate());
  assert.equal(toStoredJalaliInstant(parts, "monthOnly"), "2024-04-20T08:30:00.000Z");
});

test("min/max validation uses inclusive instant bounds", () => {
  const field = jalaliDateField({ name: "d", min: "2025-01-01T00:00:00.000Z", max: "2025-02-01T00:00:00.000Z" });
  assert.equal(field.validate("2024-12-31T00:00:00.000Z", fa), messages.fa["date.min"]);
  assert.equal(field.validate("2025-01-01T01:00:00+01:00", fa), true);
  assert.equal(field.validate("2025-02-01T00:00:00.000Z", fa), true);
  assert.equal(field.validate("2025-02-01T00:00:00.001Z", fa), messages.fa["date.max"]);
  assert.equal(field.validate("2025-02-30T00:00:00.000Z", fa), messages.fa["date.invalid"]);
});

test("range rejects an end before the start and accepts equal instants", () => {
  const row = jalaliDateRangeField();
  assert.equal(row.type, "row");
  assert.deepEqual(row.fields.map((field) => field.name), ["startsAt", "endsAt"]);
  const end = row.fields[1];
  const context = { ...fa, siblingData: { startsAt: "2025-02-01T00:00:00.000Z" } };
  assert.equal(end.validate("2025-01-01T00:00:00.000Z", context), messages.fa["dateRange.order"]);
  assert.equal(end.validate("2025-02-01T00:00:00.000Z", context), true);
  assert.equal(end.validate(null, context), true);
});

test("protects field keys and preserves component paths", () => {
  assert.throws(() => jalaliDateField({ name: "d", overrides: { name: "other" } }), /name is protected/);
  assert.throws(() => jalaliDateField({ name: "d", overrides: { type: "text" } }), /type is protected/);
  const field = jalaliDateField({ name: "d", timeZone: "UTC", overrides: { admin: { components: { Field: "other", Cell: "other" } } } });
  assert.equal(field.admin.components.Field.path, "@nexload-sdk/payload-fields/admin/jalali-date-field#JalaliDateFieldComponent");
  assert.equal(field.admin.components.Cell.path, "@nexload-sdk/payload-fields/admin/jalali-date-cell#JalaliDateCell");
  assert.equal(field.admin.components.Field.clientProps.timeZone, "UTC");
  assert.equal(field.admin.components.Cell.clientProps.display.timeZone, "UTC");
});

test("formats virtual timestamps in their display zone", () => {
  const [created] = withJalaliTimestamps([], {
    updatedAt: false,
    display: { dateStyle: "short", digits: "latin", timeZone: "UTC" },
  });
  assert.equal(created.name, "createdAtJalali");
  assert.equal(created.virtual, true);
  assert.equal(created.admin.readOnly, true);
  assert.equal(created.hooks.afterRead.at(-1)({
    siblingData: { createdAt: "2025-09-23T22:00:00.000Z" },
  }), "1404/07/01");
});


test("date and range validation tolerate missing request localization", () => {
  const field = jalaliDateField({ name: "date", required: true });
  assert.equal(field.validate(null, {}), messages.en.required);
  const end = jalaliDateRangeField().fields[1];
  assert.equal(end.validate("2025-01-01T00:00:00Z", { siblingData: { startsAt: "2025-01-02T00:00:00Z" } }), messages.en["dateRange.order"]);
});
