import assert from "node:assert/strict";
import { test } from "node:test";

import { NATIONAL_CODE_ERROR_MESSAGES_FA } from "../dist/identity/index.mjs";
import {
  iranMobileSchema,
  jalaliDateSchema,
  moneySchema,
  nationalCodeSchema,
  shebaSchema,
} from "../dist/zod/index.mjs";

test("zod schemas normalize and report Persian messages", () => {
  assert.equal(iranMobileSchema().parse("+989123456789"), "09123456789");
  assert.equal(
    iranMobileSchema({ format: "e164" }).parse("09123456789"),
    "+989123456789",
  );
  const bad = nationalCodeSchema().safeParse("1111111111");
  assert.equal(bad.success, false);
  assert.equal(
    bad.error.issues[0].message,
    NATIONAL_CODE_ERROR_MESSAGES_FA.repeated_digits,
  );
  assert.equal(
    shebaSchema({ message: "x" }).safeParse("IR12").error.issues[0].message,
    "x",
  );
  assert.equal(
    jalaliDateSchema().parse("1404/07/02").toISOString(),
    "2025-09-24T08:30:00.000Z",
  );
  assert.deepEqual(moneySchema("IRT").parse(1500), {
    amount: 1500,
    unit: "IRT",
  });
  assert.equal(moneySchema("IRT").safeParse(-1).success, false);
});

test("jalali schema requires four-digit year", () => { assert.equal(jalaliDateSchema().safeParse("123/01/01").success, false); });
