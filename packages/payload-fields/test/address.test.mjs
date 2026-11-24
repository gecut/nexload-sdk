import assert from "node:assert/strict";
import test from "node:test";

import { iranAddressField } from "../dist/index.js";

test("default name, type, and labels", () => {
  const address = iranAddressField();
  assert.equal(address.name, "address");
  assert.equal(address.type, "group");
  assert.deepEqual(address.label, { fa: "نشانی", en: "Address" });
  assert.equal(address.fields.length, 4);

  const [row1, line, postalCode, row2] = address.fields;
  assert.equal(row1.type, "row");
  assert.equal(line.name, "line");
  assert.equal(line.type, "textarea");
  assert.deepEqual(line.label, { fa: "نشانی", en: "Address line" });
  assert.equal(postalCode.name, "postalCode");
  assert.equal(postalCode.type, "text");
  assert.equal(row2.type, "row");

  const [province, city] = row1.fields;
  assert.equal(province.name, "province");
  assert.equal(province.type, "select");
  assert.deepEqual(province.label, { fa: "استان", en: "Province" });

  assert.equal(city.name, "city");
  assert.equal(city.type, "text");
  assert.deepEqual(city.label, { fa: "شهر", en: "City" });

  const [recipientName, recipientMobile] = row2.fields;
  assert.equal(recipientName.name, "recipientName");
  assert.equal(recipientName.type, "text");
  assert.deepEqual(recipientName.label, { fa: "نام گیرنده", en: "Recipient name" });

  assert.equal(recipientMobile.name, "recipientMobile");
  assert.equal(recipientMobile.type, "text");
  assert.deepEqual(recipientMobile.label, { fa: "همراه گیرنده", en: "Recipient mobile" });
});

test("custom name and label", () => {
  const address = iranAddressField({
    name: "shippingAddress",
    label: { fa: "آدرس ارسال", en: "Shipping address" },
  });
  assert.equal(address.name, "shippingAddress");
  assert.deepEqual(address.label, { fa: "آدرس ارسال", en: "Shipping address" });
});

test("31 province options with { fa, en } labels", () => {
  const address = iranAddressField();
  const row1 = address.fields[0];
  const province = row1.fields[0];
  assert.equal(province.options.length, 31);

  for (const opt of province.options) {
    assert.equal(typeof opt.value, "string");
    assert.ok(opt.value.length > 0);
    assert.equal(typeof opt.label, "object");
    assert.equal(typeof opt.label.fa, "string");
    assert.equal(typeof opt.label.en, "string");
  }

  const tehran = province.options.find((p) => p.value === "tehran");
  assert.deepEqual(tehran, {
    value: "tehran",
    label: { fa: "تهران", en: "Tehran" },
  });
});

test("recipient: false removes both recipient fields", () => {
  const address = iranAddressField({ recipient: false });
  assert.equal(address.fields.length, 3);

  const names = [];
  for (const f of address.fields) {
    if (f.type === "row") {
      names.push(...f.fields.map((sub) => sub.name));
    } else {
      names.push(f.name);
    }
  }

  assert.deepEqual(names, ["province", "city", "line", "postalCode"]);
  assert.equal(names.includes("recipientName"), false);
  assert.equal(names.includes("recipientMobile"), false);
});

test("postalCode sub-field normalizes like Task 4", async () => {
  const address = iranAddressField();
  const postalCode = address.fields[2];
  const hook = postalCode.hooks?.beforeValidate?.at(-1);

  assert.equal(await hook?.({ value: "۱۹۹۱۹-۱۳۵۴۱" }), "1991913541");
  assert.equal(await hook?.({ value: "1991913541" }), "1991913541");
  assert.equal(await hook?.({ value: "invalid" }), "invalid");
});

test("recipientMobile sub-field normalizes like Task 4", async () => {
  const address = iranAddressField();
  const row2 = address.fields[3];
  const recipientMobile = row2.fields[1];
  const hook = recipientMobile.hooks?.beforeValidate?.at(-1);

  assert.equal(await hook?.({ value: "+98 912 345 6789" }), "09123456789");
  assert.equal(await hook?.({ value: "09123456789" }), "09123456789");
});

test("required reaches nested fields inside rows", () => {
  const requiredAddress = iranAddressField({ required: true });
  assert.equal("required" in requiredAddress, false);

  const [row1, line, postalCode, row2] = requiredAddress.fields;
  const [province, city] = row1.fields;
  const [recipientName, recipientMobile] = row2.fields;

  assert.equal(province.required, true);
  assert.equal(city.required, true);
  assert.equal(line.required, true);
  assert.equal(postalCode.required, true);
  assert.equal(recipientName.required, true);
  assert.equal(recipientMobile.required, true);

  const noRecipientRequired = iranAddressField({ required: true, recipient: false });
  assert.equal("required" in noRecipientRequired, false);
  const [r1, l, pc] = noRecipientRequired.fields;
  assert.equal(r1.fields[0].required, true);
  assert.equal(r1.fields[1].required, true);
  assert.equal(l.required, true);
  assert.equal(pc.required, true);

  const optionalAddress = iranAddressField({ required: false });
  assert.equal("required" in optionalAddress, false);
  assert.equal(optionalAddress.fields[0].fields[0].required, false);
  assert.equal(optionalAddress.fields[0].fields[1].required, false);
  assert.equal(optionalAddress.fields[1].required, false);
  assert.equal(optionalAddress.fields[2].required, false);
  assert.equal(optionalAddress.fields[3].fields[0].required, false);
  assert.equal(optionalAddress.fields[3].fields[1].required, false);

  const defaultAddress = iranAddressField();
  assert.equal(defaultAddress.required, undefined);
  assert.equal(defaultAddress.fields[0].fields[0].required, undefined);
  assert.equal(defaultAddress.fields[0].fields[1].required, undefined);
  assert.equal(defaultAddress.fields[1].required, undefined);
  assert.equal(defaultAddress.fields[2].required, undefined);
  assert.equal(defaultAddress.fields[3].fields[0].required, undefined);
  assert.equal(defaultAddress.fields[3].fields[1].required, undefined);
});

test("protected name and type", () => {
  assert.throws(
    () => iranAddressField({ overrides: { name: "other" } }),
    /Iran address field name is protected\./,
  );
  assert.throws(
    () => iranAddressField({ overrides: { type: "text" } }),
    /Iran address field type is protected\./,
  );
});

test("province source uses the geo subpath", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../src/address/index.ts", import.meta.url), "utf8");
  assert.match(source, /from "@nexload-sdk\/persian\/geo"/);
  const { IRAN_PROVINCES } = await import("@nexload-sdk/persian/geo");
  assert.equal(iranAddressField().fields[0].fields[0].options.length, IRAN_PROVINCES.length);
});
