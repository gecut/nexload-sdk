import assert from "node:assert/strict";
import test from "node:test";

import {
  bankCardField,
  iranLandlineField,
  iranMobileField,
  legalIdField,
  ltrTextField,
  nationalCodeField,
  postalCodeField,
  shebaField,
  sortOrderField,
} from "../dist/index.js";
import { messages } from "../dist/i18n/messages.js";

test("default names, types, labels and rtl policy", () => {
  const mobile = iranMobileField();
  assert.equal(mobile.name, "mobile");
  assert.equal(mobile.type, "text");
  assert.equal(mobile.admin?.rtl, false);
  assert.deepEqual(mobile.label, { fa: "همراه", en: "Mobile" });

  const landline = iranLandlineField();
  assert.equal(landline.name, "landline");
  assert.equal(landline.type, "text");
  assert.equal(landline.admin?.rtl, false);
  assert.deepEqual(landline.label, { fa: "تلفن ثابت", en: "Landline" });

  const nationalCode = nationalCodeField();
  assert.equal(nationalCode.name, "nationalCode");
  assert.equal(nationalCode.type, "text");
  assert.equal(nationalCode.admin?.rtl, false);
  assert.deepEqual(nationalCode.label, { fa: "کد ملی", en: "National code" });

  const legalId = legalIdField();
  assert.equal(legalId.name, "legalId");
  assert.equal(legalId.type, "text");
  assert.equal(legalId.admin?.rtl, false);
  assert.deepEqual(legalId.label, { fa: "شناسه ملی", en: "Legal ID" });

  const postalCode = postalCodeField();
  assert.equal(postalCode.name, "postalCode");
  assert.equal(postalCode.type, "text");
  assert.equal(postalCode.admin?.rtl, false);
  assert.deepEqual(postalCode.label, { fa: "کد پستی", en: "Postal code" });

  const bankCard = bankCardField();
  assert.equal(bankCard.name, "cardNumber");
  assert.equal(bankCard.type, "text");
  assert.equal(bankCard.admin?.rtl, false);
  assert.deepEqual(bankCard.label, { fa: "شماره کارت", en: "Card number" });

  const sheba = shebaField();
  assert.equal(sheba.name, "sheba");
  assert.equal(sheba.type, "text");
  assert.equal(sheba.admin?.rtl, false);
  assert.deepEqual(sheba.label, { fa: "شماره شبا", en: "Sheba (IBAN)" });

  const ltr = ltrTextField({ name: "code" });
  assert.equal(ltr.name, "code");
  assert.equal(ltr.type, "text");
  assert.equal(ltr.admin?.rtl, false);

  const sortOrder = sortOrderField();
  assert.equal(sortOrder.name, "sortOrder");
  assert.equal(sortOrder.type, "number");
  assert.equal(sortOrder.defaultValue, 0);
  assert.equal(sortOrder.min, 0);
  assert.equal(sortOrder.index, true);
  assert.equal(sortOrder.admin?.position, "sidebar");
  assert.deepEqual(sortOrder.label, { fa: "ترتیب نمایش", en: "Sort order" });
});

test("normalizes valid sample inputs in beforeValidate hooks", async () => {
  const nationalCodeHook = nationalCodeField().hooks?.beforeValidate?.at(-1);
  assert.equal(await nationalCodeHook?.({ value: "۰۴۹۹-۳۷۰-۸۹۹" }), "0499370899");

  const shebaHook = shebaField().hooks?.beforeValidate?.at(-1);
  assert.equal(await shebaHook?.({ value: "ir20 0170 0000 0000 0123 4567 89" }), "IR200170000000000123456789");

  const bankCardHook = bankCardField().hooks?.beforeValidate?.at(-1);
  assert.equal(await bankCardHook?.({ value: "۶۰۳۷-۹۹۱۲-۳۴۵۶-۷۸۹۳" }), "6037991234567893");

  const landlineHook = iranLandlineField().hooks?.beforeValidate?.at(-1);
  assert.equal(await landlineHook?.({ value: "021-88776655" }), "02188776655");

  const postalCodeHook = postalCodeField().hooks?.beforeValidate?.at(-1);
  assert.equal(await postalCodeHook?.({ value: "۱۹۹۱۹-۱۳۵۴۱" }), "1991913541");

  const mobileHook = iranMobileField().hooks?.beforeValidate?.at(-1);
  assert.equal(await mobileHook?.({ value: "+98 912 345 6789" }), "09123456789");

  const legalIdHook = legalIdField().hooks?.beforeValidate?.at(-1);
  assert.equal(await legalIdHook?.({ value: "۱۰۳۲۰۸۹۴۸۷۸" }), "10320894878");
});

test("iranMobileField with storage e164", async () => {
  const field = iranMobileField({ storage: "e164" });
  const hook = field.hooks?.beforeValidate?.at(-1);

  assert.equal(await hook?.({ value: "09123456789" }), "+989123456789");
  assert.equal(await hook?.({ value: "+98 912 345 6789" }), "+989123456789");
  assert.equal(await hook?.({ value: "abc" }), "abc");
});

test("validation errors return localized messages", () => {
  const faArgs = { req: { i18n: { language: "fa" } } };
  const enArgs = { req: { i18n: { language: "en" } } };

  assert.equal(iranMobileField().validate?.("abc", faArgs), messages.fa["mobile.invalid"]);
  assert.equal(iranMobileField().validate?.("abc", enArgs), messages.en["mobile.invalid"]);

  assert.equal(iranLandlineField().validate?.("021", faArgs), messages.fa["landline.invalid"]);
  assert.equal(iranLandlineField().validate?.("021", enArgs), messages.en["landline.invalid"]);

  assert.equal(nationalCodeField().validate?.("1111111111", faArgs), messages.fa["nationalCode.repeated_digits"]);
  assert.equal(nationalCodeField().validate?.("1111111111", enArgs), messages.en["nationalCode.repeated_digits"]);

  assert.equal(legalIdField().validate?.("1032089487", faArgs), messages.fa["legalId.invalid_format"]);
  assert.equal(legalIdField().validate?.("1032089487", enArgs), messages.en["legalId.invalid_format"]);

  assert.equal(postalCodeField().validate?.("1111111111", faArgs), messages.fa["postalCode.repeated_digits"]);
  assert.equal(postalCodeField().validate?.("1111111111", enArgs), messages.en["postalCode.repeated_digits"]);

  assert.equal(bankCardField().validate?.("6037997599999999", faArgs), messages.fa["card.invalid_checksum"]);
  assert.equal(bankCardField().validate?.("6037997599999999", enArgs), messages.en["card.invalid_checksum"]);

  assert.equal(shebaField().validate?.("IR210170000000000123456789", faArgs), messages.fa["sheba.invalid_checksum"]);
  assert.equal(shebaField().validate?.("IR210170000000000123456789", enArgs), messages.en["sheba.invalid_checksum"]);
});

test("unique sets unique and index flags", () => {
  const mobile = iranMobileField({ unique: true });
  assert.equal(mobile.unique, true);
  assert.equal(mobile.index, true);

  const nationalCode = nationalCodeField({ unique: true });
  assert.equal(nationalCode.unique, true);
  assert.equal(nationalCode.index, true);

  const card = bankCardField({ unique: true });
  assert.equal(card.unique, true);
  assert.equal(card.index, true);

  const ltr = ltrTextField({ name: "apiKey", unique: true });
  assert.equal(ltr.unique, true);
  assert.equal(ltr.index, true);
});

test("ltrTextField configuration and styling", () => {
  const plain = ltrTextField({ name: "code" });
  assert.equal(plain.admin?.className, "nexload-ltr");
  assert.equal(plain.admin?.components, undefined);

  const mono = ltrTextField({ name: "hash", monospace: true, minLength: 8, maxLength: 64 });
  assert.equal(mono.admin?.className, "nexload-ltr nexload-ltr--mono");
  assert.equal(mono.minLength, 8);
  assert.equal(mono.maxLength, 64);
});

test("sortOrderField integer validation", () => {
  const field = sortOrderField();
  const faArgs = { req: { i18n: { language: "fa" }, t: (key) => key } };
  const enArgs = { req: { i18n: { language: "en" }, t: (key) => key } };

  assert.equal(field.validate?.(1.5, faArgs), messages.fa["sortOrder.integer"]);
  assert.equal(field.validate?.(1.5, enArgs), messages.en["sortOrder.integer"]);
  assert.equal(field.validate?.(0, faArgs), true);
  assert.equal(field.validate?.(1, faArgs), true);
  assert.equal(field.validate?.(100, faArgs), true);
  assert.equal(field.validate?.(null, faArgs), true);
});

test("protected field attributes", () => {
  assert.throws(() => iranMobileField({ overrides: { name: "other" } }));
  assert.throws(() => iranMobileField({ overrides: { type: "number" } }));

  assert.throws(() => nationalCodeField({ overrides: { name: "other" } }));
  assert.throws(() => nationalCodeField({ overrides: { type: "number" } }));

  assert.throws(() => bankCardField({ overrides: { name: "other" } }));
  assert.throws(() => bankCardField({ overrides: { type: "number" } }));

  assert.throws(() => sortOrderField({ overrides: { name: "other" } }));
  assert.throws(() => sortOrderField({ overrides: { type: "text" } }));
});


test("Payload text and number validators run before consumer validators", () => {
  let calls = 0;
  const req = { i18n: { language: "en" }, payload: { config: { defaultMaxTextLength: 5 } }, t: (key) => key };
  const text = ltrTextField({ name: "code", minLength: 2, maxLength: 4, overrides: { validate: () => { calls++; return true; } } });
  const textArgs = { ...text, req };
  assert.equal(text.validate("a", textArgs), "validation:longerThanMin");
  assert.equal(text.validate("abcde", textArgs), "validation:shorterThanMax");
  assert.equal(calls, 0);
  assert.equal(text.validate("abc", textArgs), true);
  assert.equal(calls, 1);
  const num = sortOrderField({ overrides: { required: true, max: 3, validate: () => { calls++; return true; } } });
  const numberArgs = { ...num, req };
  assert.equal(num.validate(-1, numberArgs), "validation:lessThanMin");
  assert.equal(num.validate(4, numberArgs), "validation:greaterThanMax");
  assert.equal(num.validate(null, numberArgs), "validation:required");
  assert.equal(calls, 1);
  assert.equal(num.validate(2, numberArgs), true);
  assert.equal(calls, 2);
});
