import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { buildConfig, getPayload, ValidationError } from "payload";

import {
  iranAddressField,
  iranMobileField,
  jalaliDateField,
  moneyField,
  nationalCodeField,
  payloadFieldsPlugin,
  slugField,
  sortOrderField,
} from "../../dist/index.js";

test("SQLite integration with payload-fields v4", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "payload-fields-sqlite-test-"));
  const dbPath = path.join(tempDir, "test.db");

  let payload;
  try {
    const config = await buildConfig({
      collections: [
        {
          slug: "customers",
          fields: [
            { name: "title", type: "text" },
            ...slugField({
              source: "title",
              overrides: {
                slug: { localized: true },
                lock: { localized: true },
              },
            }),
            iranMobileField(),
            nationalCodeField(),
            moneyField({ name: "credit", currency: "IRT" }),
            jalaliDateField({ name: "birthDate" }),
            iranAddressField({ recipient: false }),
            sortOrderField(),
          ],
        },
      ],
      db: sqliteAdapter({
        client: {
          url: `file:${dbPath}`,
        },
      }),
      localization: {
        defaultLocale: "fa",
        locales: ["fa", "en"],
      },
      plugins: [payloadFieldsPlugin()],
      secret: "test-secret-must-be-at-least-32-chars-long!",
    });

    payload = await getPayload({ config });

    // 1. Canonical values stored
    // create with mobile: "+98 912 345 6789", nationalCode: "۰۴۹۹-۳۷۰-۸۹۹", credit: "۱۲۳٬۴۵۶", address.postalCode: "۱۹۹۱۹-۱۳۵۴۱"
    // -> stored "09123456789", "0499370899", 123456, "1991913541"
    const doc1 = await payload.create({
      collection: "customers",
      data: {
        title: "مشتری اول",
        mobile: "+98 912 345 6789",
        nationalCode: "۰۴۹۹-۳۷۰-۸۹۹",
        credit: "۱۲۳٬۴۵۶",
        address: {
          postalCode: "۱۹۹۱۹-۱۳۵۴۱",
        },
      },
      locale: "fa",
    });

    assert.equal(doc1.mobile, "09123456789");
    assert.equal(doc1.nationalCode, "0499370899");
    assert.equal(doc1.credit, 123456);
    assert.equal(doc1.address?.postalCode, "1991913541");

    const fetched1 = await payload.findByID({
      collection: "customers",
      id: doc1.id,
      locale: "fa",
    });
    assert.equal(fetched1.mobile, "09123456789");
    assert.equal(fetched1.nationalCode, "0499370899");
    assert.equal(fetched1.credit, 123456);
    assert.equal(fetched1.address?.postalCode, "1991913541");

    // 2. nationalCode 1111111111 rejected with a ValidationError mentioning nationalCode
    await assert.rejects(
      async () => {
        await payload.create({
          collection: "customers",
          data: {
            title: "مشتری نامعتبر",
            nationalCode: "1111111111",
          },
          locale: "fa",
        });
      },
      (err) => {
        const isValidationErr =
          err instanceof ValidationError ||
          err?.name === "ValidationError" ||
          err?.data?.errors?.length > 0;
        assert.ok(isValidationErr, `Expected ValidationError, got: ${err?.name || err}`);
        assert.ok(
          err?.data?.errors?.some((e) => e.path === "nationalCode"),
          `ValidationError must have an error with path nationalCode, got: ${JSON.stringify(err?.data)}`,
        );
        return true;
      }
    );

    // 3. Localized slug collisions:
    // fa -> 'کتاب' and 'کتاب-2', en -> 'کتاب'
    const slugDocFa1 = await payload.create({
      collection: "customers",
      data: {
        title: "کتاب",
      },
      locale: "fa",
    });
    assert.equal(slugDocFa1.slug, "کتاب");

    const slugDocFa2 = await payload.create({
      collection: "customers",
      data: {
        title: "کتاب",
      },
      locale: "fa",
    });
    assert.equal(slugDocFa2.slug, "کتاب-2");

    const slugDocEn = await payload.create({
      collection: "customers",
      data: {
        title: "کتاب",
      },
      locale: "en",
    });
    assert.equal(slugDocEn.slug, "کتاب");

    // 4. v3-shaped values read back unchanged
    // birthDate: "2025-09-24T08:30:00.000Z", credit: 5000
    const v3Doc = await payload.create({
      collection: "customers",
      data: {
        title: "داده قدیمی",
        birthDate: "2025-09-24T08:30:00.000Z",
        credit: 5000,
      },
      locale: "fa",
    });
    assert.equal(v3Doc.birthDate, "2025-09-24T08:30:00.000Z");
    assert.equal(v3Doc.credit, 5000);

    const fetchedV3 = await payload.findByID({
      collection: "customers",
      id: v3Doc.id,
      locale: "fa",
    });
    assert.equal(fetchedV3.birthDate, "2025-09-24T08:30:00.000Z");
    assert.equal(fetchedV3.credit, 5000);

    // 5. Jalali string via API is converted, not stored as Gregorian 1404
    const jalaliDoc = await payload.create({
      collection: "customers",
      data: { title: "تاریخ جلالی", birthDate: "۱۴۰۴/۰۷/۰۲" },
      locale: "fa",
    });
    assert.equal(jalaliDoc.birthDate, "2025-09-24T08:30:00.000Z");

    // 6. Cleared optional unique text becomes null, not "" (no unique collision)
    const emptyA = await payload.create({ collection: "customers", data: { title: "خالی۱", mobile: "" }, locale: "fa" });
    const emptyB = await payload.create({ collection: "customers", data: { title: "خالی۲", mobile: "  " }, locale: "fa" });
    assert.equal(emptyA.mobile ?? null, null);
    assert.equal(emptyB.mobile ?? null, null);
  } finally {
    await payload?.destroy();
    fs.rmSync(tempDir, { force: true, recursive: true });
  }
});
